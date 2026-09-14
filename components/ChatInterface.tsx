"use client";

/**
 * @fileoverview Streaming chat interface with document context support.
 * Features real-time streaming, message history, and accessible design.
 */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Send, Bot, User, Loader2, AlertCircle, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Disclaimer } from "./Disclaimer";

export interface ChatTurn {
  role: "user" | "model";
  content: string;
}

interface ChatInterfaceProps {
  /** Optional document text to ground the conversation */
  documentContext?: string;
  /** Document name to show in the UI */
  documentName?: string;
}

const WELCOME_MESSAGE: ChatTurn = {
  role: "model",
  content: `Hello! I'm **LexAI**, your AI legal companion. 

I can help you:
- 📄 Understand clauses and legal terms in your document
- ⚖️ Explain your rights and obligations  
- 🚩 Highlight potential risks or red flags
- 📋 Help you prepare questions for a lawyer
- 🔍 Clarify any part of the document

Upload a document in the Analyze tab for context-aware answers, or ask general legal questions below.

**Remember:** My answers are for informational purposes only and do not constitute legal advice. For situation-specific guidance, please consult a qualified lawyer.

How can I help you today?`,
};

/**
 * Formats a chat message with markdown rendering for model responses.
 */
function ChatMessage({ turn, index }: { turn: ChatTurn; index: number }): React.JSX.Element {
  const isUser = turn.role === "user";

  return (
    <div
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
      role="article"
      aria-label={`${isUser ? "Your message" : "LexAI response"} ${index + 1}`}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-indigo-600" : "bg-slate-200"
        )}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-slate-600" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-indigo-600 text-white rounded-tr-sm"
            : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
        )}
      >
        {isUser ? (
          <p className="leading-relaxed whitespace-pre-wrap">{turn.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-a:text-indigo-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {turn.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Streaming chat interface component.
 * Sends messages to /api/chat and streams responses via SSE.
 */
export function ChatInterface({
  documentContext,
  documentName,
}: ChatInterfaceProps): React.JSX.Element {
  const [history, setHistory] = useState<ChatTurn[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, streamingContent]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    setError(null);
    setIsLoading(true);
    setStreamingContent("");

    const userTurn: ChatTurn = { role: "user", content: trimmed };
    const updatedHistory = [...history, userTurn];
    setHistory(updatedHistory);

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          documentContext,
          // Send last 10 turns to stay within token limits
          history: updatedHistory.slice(-10).map((t) => ({
            role: t.role,
            content: t.content,
          })),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = (await response.json()) as { error?: string };
        throw new Error(err.error ?? `HTTP ${response.status}`);
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as {
                text?: string;
                done?: boolean;
                error?: string;
              };

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.text) {
                accumulated += data.text;
                setStreamingContent(accumulated);
              }

              if (data.done) {
                // Finalize the message
                setHistory((prev) => [
                  ...prev,
                  { role: "model", content: accumulated },
                ]);
                setStreamingContent("");
              }
            } catch (parseError) {
              if (parseError instanceof SyntaxError) continue; // Incomplete chunk
              throw parseError;
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      const msg =
        error instanceof Error ? error.message : "Failed to send message";
      setError(msg);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, history, documentContext]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      void sendMessage();
    },
    [sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Enter (but not Shift+Enter)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendMessage();
      }
    },
    [sendMessage]
  );

  const clearHistory = useCallback(() => {
    abortRef.current?.abort();
    setHistory([WELCOME_MESSAGE]);
    setInput("");
    setError(null);
    setStreamingContent("");
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-col h-full" role="region" aria-label="Legal assistant chat">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">LexAI Chat</p>
            {documentName && (
              <p className="text-slate-500 text-xs">
                Context: {documentName}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={clearHistory}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-500",
            "hover:bg-slate-100 hover:text-slate-700",
            "focus:outline-none focus:ring-2 focus:ring-indigo-400",
            "transition-colors"
          )}
          aria-label="Clear conversation history"
          type="button"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      </div>

      {/* Disclaimer */}
      <div className="px-4 pt-3">
        <Disclaimer />
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        {history.map((turn, i) => (
          <ChatMessage key={i} turn={turn} index={i} />
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <ChatMessage
            turn={{ role: "model", content: streamingContent }}
            index={history.length}
          />
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex gap-3" aria-live="polite" aria-label="LexAI is thinking">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
              <Bot className="h-4 w-4 text-slate-600" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-4 py-3">
              <Loader2
                className="h-4 w-4 animate-spin text-indigo-500"
                aria-hidden="true"
              />
              <span className="text-slate-500 text-sm">Thinking...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200 px-4 py-3"
        aria-label="Send a message"
      >
        <div className="flex items-end gap-2">
          <label className="sr-only" htmlFor="chat-input">
            Type your legal question
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your document..."
            disabled={isLoading}
            rows={1}
            maxLength={2000}
            className={cn(
              "flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50",
              "px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400",
              "focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors max-h-32 overflow-y-auto"
            )}
            style={{
              height: "auto",
              minHeight: "44px",
            }}
            aria-describedby="chat-hint"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl",
              "bg-indigo-600 text-white transition-all",
              "hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            )}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <p id="chat-hint" className="mt-1.5 text-xs text-slate-400">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
