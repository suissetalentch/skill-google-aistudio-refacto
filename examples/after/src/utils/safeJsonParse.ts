export function safeJsonParse<T>(json: string): T {
  try {
    return JSON.parse(json) as T;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    throw new Error(`Failed to parse response: ${message}`);
  }
}
