import { useState, useEffect, useCallback, useRef } from 'react';
import ProductGrid from '@/components/product-grid';
import { ProductApi } from '@/api/product-api';
import type { Product } from '@/types/product';
import { useSearchStore } from '@/stores/search-store';

const PRODUCTS_PER_PAGE = 12;

export default function SearchResults() {
  const {
    searchQuery,
    searchOffset,
    incrementSearchOffset,
    resetSearchOffset,
  } = useSearchStore();
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const previousSearchQuery = useRef('');
  const searchObserverTarget = useRef<HTMLDivElement>(null);

  // Load more search results
  const loadMoreSearchResults = useCallback(async () => {
    if (searchLoading || !searchHasMore || !searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const params = { limit: PRODUCTS_PER_PAGE, offset: searchOffset };
      const response = await ProductApi.getProductsByName(
        searchQuery.trim(),
        params
      );
      const newProducts = response.products;

      if (searchOffset === 0) {
        setSearchResults(newProducts);
      } else {
        setSearchResults((prev) => [...prev, ...newProducts]);
      }

      setSearchHasMore(
        response.hasMore ?? newProducts.length === PRODUCTS_PER_PAGE
      );

      if (newProducts.length > 0) {
        incrementSearchOffset(PRODUCTS_PER_PAGE);
      }
    } catch (error) {
      console.error('Failed to search products:', error);
      if (searchOffset === 0) {
        setSearchResults([]);
      }
      setSearchHasMore(false);
    } finally {
      setSearchLoading(false);
    }
  }, [
    searchLoading,
    searchHasMore,
    searchQuery,
    searchOffset,
    incrementSearchOffset,
  ]);

  // Handle search query change
  useEffect(() => {
    // Check if search query has changed
    if (searchQuery !== previousSearchQuery.current) {
      previousSearchQuery.current = searchQuery;

      if (!searchQuery.trim()) {
        setSearchResults([]);
        setSearchHasMore(true);
        return;
      }

      // Reset and load initial search results with debounce
      const timeoutId = setTimeout(() => {
        resetSearchOffset();
        setSearchResults([]);
        setSearchHasMore(true);
        loadMoreSearchResults();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, loadMoreSearchResults, resetSearchOffset]);

  // Load initial search results when offset is reset
  useEffect(() => {
    if (
      searchQuery.trim() &&
      searchOffset === 0 &&
      searchResults.length === 0 &&
      !searchLoading
    ) {
      loadMoreSearchResults();
    }
  }, [
    searchQuery,
    searchOffset,
    searchResults.length,
    searchLoading,
    loadMoreSearchResults,
  ]);

  // Infinite scroll observer for search results
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && searchHasMore && !searchLoading) {
          loadMoreSearchResults();
        }
      },
      { threshold: 0.1 }
    );

    if (searchObserverTarget.current) {
      observer.observe(searchObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreSearchResults, searchHasMore, searchLoading]);

  return (
    <section className="mt-16 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Search Results for "{searchQuery}"
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchLoading && searchResults.length === 0
              ? 'Searching...'
              : `Found ${searchResults.length} product${searchResults.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <ProductGrid
          products={searchResults}
          loading={searchLoading && searchResults.length === 0}
        />
        {searchHasMore && <div ref={searchObserverTarget} className="h-1" />}
        {searchLoading && searchResults.length > 0 && (
          <div className="py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}
