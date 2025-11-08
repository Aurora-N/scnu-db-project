import { useState, useEffect, useCallback, useRef } from 'react';
import HeroSection from '@/components/hero-section';
import CategoriesSection from '@/components/categories-section';
import ProductGrid from '@/components/product-grid';
import Footer from '@/components/footer';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const observerTarget = useRef<HTMLDivElement>(null);

  // Simulate loading more products
  const loadMoreProducts = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const newProducts = Array.from({ length: 12 }, (_, i) => ({
        id: products.length + i,
        name: `Product ${products.length + i + 1}`,
        price: Math.floor(Math.random() * 200) + 20,
        image: `/placeholder.svg?height=250&width=250&query=product+${products.length + i + 1}`,
        category: ['Clothing', 'Accessories', 'Shoes', 'Electronics'][
          Math.floor(Math.random() * 4)
        ],
      }));

      setProducts((prev) => [...prev, ...newProducts]);
      setPage((prev) => prev + 1);
      setLoading(false);

      // Stop infinite scroll after 3 pages
      if (page >= 3) setHasMore(false);
    }, 500);
  }, [products.length, loading, hasMore, page]);

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

  // Load initial products
  useEffect(() => {
    if (products.length === 0) {
      loadMoreProducts();
    }
  }, []);

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <>
      <HeroSection />
      <CategoriesSection
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <ProductGrid products={filteredProducts} loading={loading} />
      <div ref={observerTarget} className="h-20" />
      {!hasMore && <Footer />}
    </>
  );
}
