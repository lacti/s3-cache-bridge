export default function log(...args: any[]) {
  console.info(`[${new Date().toISOString()}]`, ...args);
}
