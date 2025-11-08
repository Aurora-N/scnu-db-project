'use client';

import ProductCard from './product-card';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  products: any[];
  loading: boolean;
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    </section>
  );
}
