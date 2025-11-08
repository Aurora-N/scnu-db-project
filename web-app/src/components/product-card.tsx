import { useState } from 'react';
import type React from 'react';

import { useNavigate } from 'react-router';
import { ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCardClick = () => {
    navigate(`/product/${product.product_id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    interface CartItem {
      id: number;
      name: string;
      price: number;
      quantity: number;
    }
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item) => item.id === product.product_id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  return (
    <div className="group cursor-pointer" onClick={handleCardClick}>
      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-secondary">
        <img
          src={`/placeholder.svg?height=250&width=250&query=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 rounded-full bg-background/80 p-2 transition-colors hover:bg-background"
        >
          <Heart
            className={`h-4 w-4 ${isFavorite ? 'fill-destructive text-destructive' : 'text-foreground'}`}
          />
        </button>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          className="absolute right-0 bottom-0 left-0 flex items-center justify-center gap-2 bg-primary px-4 py-2 text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="text-sm font-medium">Add to Cart</span>
        </button>
      </div>

      <div>
        <h3 className="truncate text-sm font-medium text-foreground">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {product.description}
        </p>
        <p className="mt-2 text-lg font-semibold text-foreground">
          ￥ {product.price}
        </p>
      </div>
    </div>
  );
}
