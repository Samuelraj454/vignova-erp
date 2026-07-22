export function simulateMessage(type: "sms" | "email", title: string, body: string) {
  const event = new CustomEvent("simulated-message", {
    detail: { type, title, body, timestamp: Date.now() }
  });
  window.dispatchEvent(event);
}
