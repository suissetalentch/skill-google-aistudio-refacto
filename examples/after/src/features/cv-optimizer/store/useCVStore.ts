import { create } from 'zustand';
import type { AnalysisResponse, RequestStatus } from '../types';

interface CVState {
  result: AnalysisResponse | null;
  status: RequestStatus;
  error: string | null;
  setResult: (result: AnalysisResponse) => void;
  setPending: () => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useCVStore = create<CVState>((set) => ({
  result: null,
  status: 'idle',
  error: null,

  setResult: (result) => set({ result, status: 'success', error: null }),
  setPending: () => set({ status: 'pending', error: null }),
  setError: (error) => set({ error, status: 'error' }),
  reset: () => set({ result: null, status: 'idle', error: null }),
}));
