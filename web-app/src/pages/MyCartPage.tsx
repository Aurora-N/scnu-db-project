import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user-store';
import { CartApi } from '@/api/cart-api';
import { ProductApi } from '@/api/product-api';
import AddressDialog from '@/components/dialogs/address-dialog';
import type { CartItem as ApiCartItem } from '@/types/cart';
import type { Product } from '@/types/product';

interface CartItemWithDetails extends ApiCartItem {
  product?: Product;
}

export default function MyCartPage() {
  const { user, isLoggedIn } = useUserStore();
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<number | null>(null);

  // Address dialog state
  const [showAddressDialog, setShowAddressDialog] = useState(false);

  // Load cart from API on mount
  useEffect(() => {
    if (isLoggedIn && user) {
      loadCart();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user]);

  const loadCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await CartApi.getUserCart(user.userId);

      if (response && response.items) {
        setCartId(response.cart_id);

        // Fetch product details for each cart item
        const itemsWithDetails = await Promise.all(
          response.items.map(async (item) => {
            try {
              const product = await ProductApi.getProductById(item.product_id);
              return { ...item, product };
            } catch (error) {
              console.error(
                `Failed to fetch product ${item.product_id}:`,
                error
              );
              return item;
            }
          })
        );

        setCartItems(itemsWithDetails);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast.error('加载购物车失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (cartItemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(cartItemId)) {
      newSelected.delete(cartItemId);
    } else {
      newSelected.add(cartItemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.cart_item_id)));
    }
  };

  const deleteItem = async (cartItemId: number) => {
    try {
      await CartApi.removeItemFromCart(cartItemId);
      setCartItems(
        cartItems.filter((item) => item.cart_item_id !== cartItemId)
      );
      selectedItems.delete(cartItemId);
      setSelectedItems(new Set(selectedItems));
      toast.success('已删除商品');
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('删除商品失败');
    }
  };

  const deleteSelected = async () => {
    try {
      await CartApi.removeBatchItems({
        cartItemIds: Array.from(selectedItems),
      });
      setCartItems(
        cartItems.filter((item) => !selectedItems.has(item.cart_item_id))
      );
      setSelectedItems(new Set());
      toast.success('已删除选中商品');
    } catch (error) {
      console.error('Failed to delete selected items:', error);
      toast.error('删除商品失败');
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    const newQuantity = Math.max(1, quantity);
    try {
      await CartApi.updateCartItem(cartItemId, { quantity: newQuantity });
      setCartItems(
        cartItems.map((item) =>
          item.cart_item_id === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('更新数量失败');
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const shipping = 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error('请先登录');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('购物车为空');
      return;
    }
    setShowAddressDialog(true);
  };

  const handleConfirmCheckout = async (address: string) => {
    if (!cartId) {
      toast.error('购物车信息错误');
      throw new Error('Cart ID is missing');
    }

    try {
      const response = await CartApi.createOrderFromCart(cartId, {
        shippingAddress: address,
      });

      if (response && response.order) {
        toast.success('订单创建成功！');
        setShowAddressDialog(false);
        // Reload cart to reflect changes
        await loadCart();
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('创建订单失败，请重试');
      throw error;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      {/* Cart Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            继续购物
          </Button>
        </Link>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">购物车</h1>
        <span className="text-sm text-muted-foreground">
          {cartItems.length} 件商品
        </span>
      </div>

      {!isLoggedIn ? (
        <div className="py-16 text-center">
          <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
          <p className="mb-6 text-lg text-muted-foreground">
            请先登录查看购物车
          </p>
          <Button asChild>
            <Link to="/">返回首页</Link>
          </Button>
        </div>
      ) : loading ? (
        <div className="py-16 text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-muted-foreground" />
          <p className="text-lg text-muted-foreground">加载中...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="py-16 text-center">
          <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
          <p className="mb-6 text-lg text-muted-foreground">购物车为空</p>
          <Button asChild>
            <Link to="/">开始购物</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {/* Header Row */}
            <div className="flex items-center gap-4 rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground">
              <Checkbox
                checked={
                  selectedItems.size === cartItems.length &&
                  cartItems.length > 0
                }
                onCheckedChange={toggleAllSelection}
                className="h-4 w-4"
              />
              <div className="flex-1">商品</div>
              <div className="w-24 text-right">价格</div>
              <div className="w-20 text-center">数量</div>
              <div className="w-24 text-right">小计</div>
              <div className="w-10"></div>
            </div>

            {cartItems.map((item) => (
              <div
                key={item.cart_item_id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <Checkbox
                  checked={selectedItems.has(item.cart_item_id)}
                  onCheckedChange={() => toggleItemSelection(item.cart_item_id)}
                  className="h-4 w-4"
                />

                {/* Product Info */}
                <div className="flex flex-1 items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <img
                      src="/placeholder.svg"
                      alt={item.product?.name || '商品'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-foreground">
                      {item.product?.name || '商品名称'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.product?.description || ''}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="w-24 text-right text-sm font-medium text-foreground">
                  ¥{item.unit_price}
                </div>

                {/* Quantity */}
                <div className="flex w-20 items-center justify-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.cart_item_id, item.quantity - 1)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded border border-border text-xs transition-colors hover:bg-secondary"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.cart_item_id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.product!.stock_quantity}
                    className="flex h-6 w-6 items-center justify-center rounded border border-border text-xs transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                {/* Total */}
                <div className="w-24 text-right text-sm font-semibold text-foreground">
                  ¥{(item.unit_price * item.quantity).toFixed(2)}
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteItem(item.cart_item_id)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Delete Selected Button */}
            {selectedItems.size > 0 && (
              <Button
                onClick={deleteSelected}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                删除选中的 {selectedItems.size} 件商品
              </Button>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4 rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                订单摘要
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>小计</span>
                  <span>¥{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>运费</span>
                  <span>¥{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 font-semibold text-foreground">
                  <span>总计</span>
                  <span>¥{total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" onClick={handleCheckout}>
                结算
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full bg-transparent"
              >
                <Link to="/">继续购物</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Address Dialog */}
      <AddressDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        onConfirm={handleConfirmCheckout}
        itemCount={cartItems.length}
        totalAmount={total}
      />
    </div>
  );
}
