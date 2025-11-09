import { useState, useEffect, useCallback, useRef } from 'react';
import HeroSection from '@/components/hero-section';
import CategoriesSection from '@/components/categories-section';
import ProductGrid from '@/components/product-grid';
import Footer from '@/components/footer';
import SearchResults from '@/components/search-results';
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
  const { isSearching } = useSearchStore();

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
        offset.current += PRODUCTS_PER_PAGE;
      }

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

  // Infinite scroll observer for regular products
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isSearching) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreProducts, hasMore, loading, isSearching]);

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
        <SearchResults />
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
