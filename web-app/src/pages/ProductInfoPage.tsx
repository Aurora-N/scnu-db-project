import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ShoppingCart, ArrowLeft, Loader2, Tag } from 'lucide-react';
import { ProductApi } from '@/api/product-api';
import { CartApi } from '@/api/cart-api';
import { useUserStore } from '@/stores/user-store';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import { toast } from 'sonner';

export default function ProductInfoPage() {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const { user, isLoggedIn } = useUserStore();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 并行获取商品信息和分类
        const [product, categoriesData] = await Promise.all([
          ProductApi.getProductById(Number(productId)),
          ProductApi.getCategoriesByProduct(Number(productId)).catch(() => ({
            categories: [],
            total: 0,
          })),
        ]);

        setProduct(product);
        setCategories(categoriesData.categories);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        const errorMessage =
          err && typeof err === 'object' && 'message' in err
            ? String(err.message)
            : '加载商品信息失败';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    // 检查是否登录
    if (!isLoggedIn || !user) {
      toast.error('请先登录后再加入购物车');
      return;
    }

    // 检查库存
    if (product.stock_quantity < quantity) {
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
        quantity: quantity,
      });

      toast.success(`已添加 ${quantity} 件商品到购物车`);
      setQuantity(1); // 重置数量
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

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:px-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">正在加载商品信息...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:px-8">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-destructive">
            {error || 'Product not found'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const inStock = product.stock_quantity > 0;
  const images = ['/placeholder.svg'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </button>

      <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
            <img
              src={images[selectedImage] || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {!inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-lg font-semibold text-white">Out of Stock</p>
              </div>
            )}
          </div>

          {/* Thumbnail images */}
          <div className="flex gap-3">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                  selectedImage === index ? 'border-primary' : 'border-border'
                }`}
              >
                <img
                  src={image || '/placeholder.svg'}
                  alt={`View ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Title */}
          <div className="mb-6">
            <h1 className="mb-3 text-3xl font-semibold text-foreground">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                商品编号: {product.product_id}
              </p>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {categories.map((category) => (
                  <span
                    key={category.category_id}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-6 border-b border-border pb-6">
            <p className="text-4xl font-bold text-foreground">
              ¥{product.price}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              库存: 还有 {product.stock_quantity} 件商品，欲购速从！
            </p>
          </div>

          {/* Description */}
          <p className="mb-6 text-foreground">{product.description}</p>

          {/* Quantity selector */}
          <div className="mb-6 flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">
              购买数量:
            </span>
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!inStock}
                className="px-3 py-2 text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                −
              </button>
              <span className="border-r border-l border-border px-4 py-2 text-foreground">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock_quantity, quantity + 1))
                }
                disabled={!inStock || quantity >= product.stock_quantity}
                className="px-3 py-2 text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mb-8 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addingToCart ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
              {addingToCart ? '添加中...' : '加入购物车'}
            </button>
          </div>

          {/* Stock status */}
          <p className="mb-6 text-sm">
            {inStock ? (
              <span className="text-green-600">✓ 库存充足</span>
            ) : (
              <span className="text-destructive">✗ 库存不足</span>
            )}
          </p>

          {/* Shipping info */}
          <div className="space-y-3 border-t border-border pt-6">
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                运费与售后
              </p>
              <p className="text-sm text-foreground">
                此商品包邮，享7天无理由退货服务。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
