export class Logger {
  tag: string;
  enabled: boolean;

  constructor(tag: string) {
    this.tag = tag;
    this.enabled = true;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    return this;
  }

  #print(severity: "debug" | "info" | "warn" | "error", ...args: unknown[]) {
    if (!this.enabled) return;

    console[severity](new Date().toISOString(), severity, ...args);
  }

  debug(...args: unknown[]) {
    this.#print("debug", ...args);
  }

  info(...args: unknown[]) {
    this.#print("info", ...args);
  }

  warn(...args: unknown[]) {
    this.#print("warn", ...args);
  }

  error(...args: unknown[]) {
    this.#print("error", ...args);
  }

  local(childName: string) {
    return new Logger(`${this.tag}/${childName}`).setEnabled(this.enabled);
  }
}
