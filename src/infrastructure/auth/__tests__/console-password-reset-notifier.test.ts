import { describe, it, expect, vi, afterEach } from "vitest";
import { ConsolePasswordResetNotifier } from "../console-password-reset-notifier";

describe("ConsolePasswordResetNotifier", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs a reset link containing the token and the recipient email", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const notifier = new ConsolePasswordResetNotifier("http://localhost:3000");

    await notifier.notify("raw-token-123", "user@example.com");

    expect(infoSpy).toHaveBeenCalledTimes(1);
    const message = String(infoSpy.mock.calls[0][0]);
    expect(message).toContain("user@example.com");
    expect(message).toContain(
      "http://localhost:3000/reset-password?token=raw-token-123",
    );
  });

  it("builds the reset link against the configured base URL", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const notifier = new ConsolePasswordResetNotifier("https://app.example.com");

    await notifier.notify("abc", "another@example.com");

    const message = String(infoSpy.mock.calls[0][0]);
    expect(message).toContain("https://app.example.com/reset-password?token=abc");
  });
});
