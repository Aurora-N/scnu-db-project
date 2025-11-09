import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user-store';
import { OrderApi } from '@/api/order-api';
import type { Order as ApiOrder, MergedOrderItem } from '@/types/order';

interface OrderWithDetails extends ApiOrder {
  items: MergedOrderItem[];
}

export default function OrdersPage() {
  const { user, isLoggedIn } = useUserStore();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load orders from API on mount
  useEffect(() => {
    if (isLoggedIn && user) {
      loadOrders();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const ordersData = await OrderApi.getOrdersByUserId(user.userId);
      console.log('ordersData', ordersData);

      if (ordersData && ordersData.length > 0) {
        // Fetch order items and product details for each order
        const ordersWithDetails = await Promise.all(
          ordersData.map(async (order) => {
            const items = (await OrderApi.getOrderItems(order.order_id)) || [];
            return { ...order, items };
          })
        );
        console.log('ordersWithDetails', ordersWithDetails);

        setOrders(ordersWithDetails);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'paid':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return '已送达';
      case 'shipped':
        return '已发货';
      case 'paid':
        return '已支付';
      case 'pending':
        return '待支付';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const calculateOrderTotal = (items: MergedOrderItem[]) => {
    return items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      {/* Orders Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Shopping
          </Button>
        </Link>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">我的订单</h1>
        <span className="text-sm text-muted-foreground">
          {orders.length} 个订单
        </span>
      </div>

      {!isLoggedIn ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
          <p className="mb-6 text-lg text-muted-foreground">请先登录查看订单</p>
          <Button asChild>
            <Link to="/">返回首页</Link>
          </Button>
        </div>
      ) : loading ? (
        <div className="py-16 text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-muted-foreground" />
          <p className="text-lg text-muted-foreground">加载中...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
          <p className="mb-6 text-lg text-muted-foreground">暂无订单</p>
          <Button asChild>
            <Link to="/">开始购物</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const total = calculateOrderTotal(order.items);
            return (
              <div
                key={order.order_id}
                className="overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-sm"
              >
                {/* Order Header */}
                <div className="border-b border-border bg-secondary px-6 py-4">
                  <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs tracking-wider text-muted-foreground uppercase">
                        订单编号
                      </p>
                      <p className="font-semibold text-foreground">
                        #{order.order_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs tracking-wider text-muted-foreground uppercase">
                        下单时间
                      </p>
                      <p className="font-semibold text-foreground">
                        {new Date(order.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs tracking-wider text-muted-foreground uppercase">
                        状态
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs tracking-wider text-muted-foreground uppercase">
                        总计
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        ¥{total}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-border">
                  {order.items.map((item) => (
                    <div
                      key={item.order_item_id}
                      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
                    >
                      {/* Product Image */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                        <img
                          src="/placeholder.svg"
                          alt={item.product_name || '商品'}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-foreground">
                          {item.product_name || '商品名称'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          数量: {item.quantity}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="shrink-0 text-right">
                        <p className="text-sm text-muted-foreground">单价</p>
                        <p className="font-semibold text-foreground">
                          ¥{item.unit_price}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="min-w-24 shrink-0 text-right">
                        <p className="text-sm text-muted-foreground">小计</p>
                        <p className="font-semibold text-foreground">
                          ¥{(item.unit_price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    查看订单详情或物流信息
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() => navigate(`/order/${order.order_id}`)}
                  >
                    查看详情
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
