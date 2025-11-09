import { create } from 'zustand';

interface SearchState {
  searchQuery: string;
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  isSearching: false,
  setSearchQuery: (query) =>
    set({ searchQuery: query, isSearching: query.trim().length > 0 }),
  clearSearch: () => set({ searchQuery: '', isSearching: false }),
}));
