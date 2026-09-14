/**
 * @fileoverview Unit tests for the structured logger module.
 * Verifies log levels, sensitive field redaction, and output format.
 */

import { logger } from "../../lib/logger";

// Capture console output for testing
const consoleMock = {
  debug: jest.spyOn(console, "debug").mockImplementation(() => {}),
  info:  jest.spyOn(console, "info").mockImplementation(() => {}),
  warn:  jest.spyOn(console, "warn").mockImplementation(() => {}),
  error: jest.spyOn(console, "error").mockImplementation(() => {}),
};

/** Parses the JSON output captured from the console mock */
function getLastLog(spy: jest.SpyInstance): Record<string, unknown> {
  const call = spy.mock.calls[spy.mock.calls.length - 1];
  return JSON.parse((call?.[0] as string) ?? "{}") as Record<string, unknown>;
}

describe("logger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleMock.debug.mockRestore();
    consoleMock.info.mockRestore();
    consoleMock.warn.mockRestore();
    consoleMock.error.mockRestore();
  });

  describe("log levels", () => {
    it("should log info messages as JSON", () => {
      logger.info("Test info message");
      const log = getLastLog(consoleMock.info);
      expect(log.level).toBe("info");
      expect(log.message).toBe("Test info message");
    });

    it("should log warn messages as JSON", () => {
      logger.warn("Test warning");
      const log = getLastLog(consoleMock.warn);
      expect(log.level).toBe("warn");
      expect(log.message).toBe("Test warning");
    });

    it("should log error messages as JSON", () => {
      logger.error("Test error");
      const log = getLastLog(consoleMock.error);
      expect(log.level).toBe("error");
      expect(log.message).toBe("Test error");
    });

    it("should include ISO timestamp in all logs", () => {
      logger.info("timestamped message");
      const log = getLastLog(consoleMock.info);
      expect(log.timestamp).toBeDefined();
      expect(typeof log.timestamp).toBe("string");
      // Should be a valid ISO date string
      expect(new Date(log.timestamp as string).toISOString()).toBe(log.timestamp);
    });

    it("should include context when provided", () => {
      logger.info("with context", { userId: "123", action: "analyze" });
      const log = getLastLog(consoleMock.info);
      expect(log.context).toBeDefined();
      expect((log.context as Record<string, unknown>)["userId"]).toBe("123");
    });

    it("should omit context field when not provided", () => {
      logger.info("no context");
      const log = getLastLog(consoleMock.info);
      expect(log.context).toBeUndefined();
    });
  });

  describe("sensitive field redaction", () => {
    it("should redact apiKey field", () => {
      logger.info("API call", { apiKey: "sk-abc123-super-secret" });
      const log = getLastLog(consoleMock.info);
      expect((log.context as Record<string, unknown>)["apiKey"]).toBe("[REDACTED]");
    });

    it("should redact password field", () => {
      logger.error("Auth error", { password: "hunter2", user: "alice" });
      const log = getLastLog(consoleMock.error);
      const ctx = log.context as Record<string, unknown>;
      expect(ctx["password"]).toBe("[REDACTED]");
      expect(ctx["user"]).toBe("alice"); // Non-sensitive field preserved
    });

    it("should redact token field", () => {
      logger.warn("Token issue", { token: "eyJhbGciOi..." });
      const log = getLastLog(consoleMock.warn);
      expect((log.context as Record<string, unknown>)["token"]).toBe("[REDACTED]");
    });

    it("should redact secret field", () => {
      logger.info("Config loaded", { secret: "mysecretvalue", env: "prod" });
      const log = getLastLog(consoleMock.info);
      const ctx = log.context as Record<string, unknown>;
      expect(ctx["secret"]).toBe("[REDACTED]");
      expect(ctx["env"]).toBe("prod");
    });

    it("should redact authorization field", () => {
      logger.info("Request received", { authorization: "Bearer abc123" });
      const log = getLastLog(consoleMock.info);
      expect((log.context as Record<string, unknown>)["authorization"]).toBe("[REDACTED]");
    });

    it("should preserve non-sensitive context fields", () => {
      logger.info("Processing", { fileName: "contract.pdf", size: 1024 });
      const log = getLastLog(consoleMock.info);
      const ctx = log.context as Record<string, unknown>;
      expect(ctx["fileName"]).toBe("contract.pdf");
      expect(ctx["size"]).toBe(1024);
    });
  });

  describe("output format", () => {
    it("should output valid JSON", () => {
      logger.info("JSON test", { key: "value" });
      const call = consoleMock.info.mock.calls[consoleMock.info.mock.calls.length - 1];
      expect(() => JSON.parse(call?.[0] as string)).not.toThrow();
    });

    it("should produce parseable output for all levels", () => {
      logger.info("info");
      logger.warn("warn");
      logger.error("error");
      expect(consoleMock.info).toHaveBeenCalledTimes(1);
      expect(consoleMock.warn).toHaveBeenCalledTimes(1);
      expect(consoleMock.error).toHaveBeenCalledTimes(1);
    });
  });
});
