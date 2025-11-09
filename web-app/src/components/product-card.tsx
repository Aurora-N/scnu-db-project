import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Loader2 } from 'lucide-react';
import type { Product } from '@/types/product';
import { CartApi } from '@/api/cart-api';
import { useUserStore } from '@/stores/user-store';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const { user, isLoggedIn } = useUserStore();

  const handleCardClick = () => {
    navigate(`/product/${product.product_id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // 检查是否登录
    if (!isLoggedIn || !user) {
      toast.error('请先登录后再加入购物车');
      return;
    }

    // 检查库存
    if (product.stock_quantity < 1) {
      toast.error('库存不足');
      return;
    }

    try {
      setAddingToCart(true);

      // 获取用户购物车
      const userCart = await CartApi.getUserCart(user.userId);
      const cartId = userCart.cart_id;

      // 添加商品到购物车
      await CartApi.addItemToCart(cartId, {
        productId: product.product_id,
        quantity: 1,
      });

      toast.success('已添加到购物车');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : '加入购物车失败';
      toast.error(errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="group cursor-pointer" onClick={handleCardClick}>
      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-secondary">
        <img
          src={`/placeholder.svg?height=250&width=250&query=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || product.stock_quantity < 1}
          className="absolute right-0 bottom-0 left-0 flex items-center justify-center gap-2 bg-primary px-4 py-2 text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addingToCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {addingToCart ? '添加中...' : '加入购物车'}
          </span>
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
