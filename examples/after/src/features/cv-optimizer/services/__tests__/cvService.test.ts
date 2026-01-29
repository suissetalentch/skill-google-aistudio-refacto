import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/test/mocks/server';
import { analyzeCV } from '../cvService';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('analyzeCV', () => {
  it('returns analysis response from API', async () => {
    const result = await analyzeCV('Mon CV contient suffisamment de texte pour être valide.', 'SQL');

    expect(result).toBeDefined();
    expect(result.updatedCV.fullName).toBe('Jean Dupont');
    expect(result.insight.jobTitle).toBe('Business Unit Manager');
  });

  it('supports abort signal for cancellation', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      analyzeCV('CV text', 'Skills', controller.signal),
    ).rejects.toThrow();
  });
});
