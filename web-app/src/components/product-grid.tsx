"use client"

import ProductCard from "./product-card"
import { Loader2 } from "lucide-react"

interface ProductGridProps {
  products: any[]
  loading: boolean
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
      </div>
    </section>
  )
}
