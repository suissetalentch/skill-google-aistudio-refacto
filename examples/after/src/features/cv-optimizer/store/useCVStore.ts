import { create } from 'zustand';
import type { AnalysisResponse } from '../types';

interface CVState {
  result: AnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  setResult: (result: AnalysisResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCVStore = create<CVState>((set) => ({
  result: null,
  isLoading: false,
  error: null,

  setResult: (result) => set({ result, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ result: null, isLoading: false, error: null }),
}));
