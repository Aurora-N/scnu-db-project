import { useState, useEffect, useCallback, useRef } from 'react';
import HeroSection from '@/components/hero-section';
import CategoriesSection from '@/components/categories-section';
import ProductGrid from '@/components/product-grid';
import Footer from '@/components/footer';
import { ProductApi } from '@/api/product-api';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import { useSearchStore } from '@/stores/search-store';

const PRODUCTS_PER_PAGE = 12;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedCategoryInfo, setSelectedCategoryInfo] =
    useState<Category | null>(null);
  const offset = useRef(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const { searchQuery, isSearching } = useSearchStore();
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load more products from API
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const params = { limit: PRODUCTS_PER_PAGE, offset: offset.current };
      const response =
        selectedCategory === null
          ? await ProductApi.getAllProducts(params)
          : await ProductApi.getProductsByCategory(selectedCategory, params);

      const newProducts = response.products;
      const isInitialLoad = products.length === 0;

      if (isInitialLoad) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }
      offset.current += PRODUCTS_PER_PAGE;

      // Check if there are more products to load
      setHasMore(response.hasMore ?? newProducts.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error('Failed to load products:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, selectedCategory, products.length]);

  // Load initial products
  useEffect(() => {
    if (products.length === 0) {
      loadMoreProducts();
    }
  }, [loadMoreProducts, products.length]);

  // Reset products when category changes
  const handleCategoryChange = useCallback(
    (categoryId: number | null, categoryInfo: Category | null) => {
      setSelectedCategory(categoryId);
      setSelectedCategoryInfo(categoryInfo);
      setProducts([]);
      offset.current = 0;
      setHasMore(true);
    },
    []
  );

  // Load products when category changes
  useEffect(() => {
    if (products.length === 0 && !loading && !isSearching) {
      loadMoreProducts();
    }
  }, [
    selectedCategory,
    loadMoreProducts,
    products.length,
    loading,
    isSearching,
  ]);

  // Handle search
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await ProductApi.getProductsByName(searchQuery.trim());
        setSearchResults(response.products);
      } catch (error) {
        console.error('Failed to search products:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreProducts, hasMore, loading]);

  return (
    <>
      {!isSearching && (
        <>
          <HeroSection categoryInfo={selectedCategoryInfo} />
          <CategoriesSection
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </>
      )}

      {isSearching ? (
        <section className="mt-16 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Search Results for "{searchQuery}"
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchLoading
                  ? 'Searching...'
                  : `Found ${searchResults.length} product${searchResults.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <ProductGrid products={searchResults} loading={searchLoading} />
          </div>
        </section>
      ) : (
        <>
          <ProductGrid products={products} loading={loading} />
          <div ref={observerTarget} className="h-1" />
        </>
      )}

      {!hasMore && !isSearching && <Footer />}
    </>
  );
}
