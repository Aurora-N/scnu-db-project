import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Navbar from '@/components/navbar';
import { OrderApi } from '@/api/order-api';
import type { OrderWithItems, OrderStatus } from '@/types/order';

export default function OrderDetailsPage() {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const orderData = await OrderApi.getOrderById(Number(orderId));
      console.log('orderData', orderData);
      if (orderData) {
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('加载订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
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

  const getStatusLabel = (status: OrderStatus) => {
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

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'paid':
        return <Package className="h-5 w-5" />;
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'cancelled':
        return <Package className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
          <div className="py-16 text-center">
            <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-muted-foreground" />
            <p className="text-lg text-muted-foreground">加载中...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
          <div className="py-16 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <p className="text-lg text-muted-foreground">订单未找到</p>
            <Button asChild className="mt-4">
              <Link to="/orders">返回订单列表</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const shipping = 0;
  const total = subtotal + shipping;

  console.log('order', order);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link to="/orders">
          <Button variant="ghost" size="sm" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回订单列表
          </Button>
        </Link>

        {/* Order Header */}
        <div className="mb-8 overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-secondary px-6 py-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="mb-2 text-xs tracking-wider text-muted-foreground uppercase">
                  订单编号
                </p>
                <h1 className="text-3xl font-bold text-foreground">
                  #{order.order_id}
                </h1>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs tracking-wider text-muted-foreground uppercase">
                  下单时间
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {new Date(order.created_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs tracking-wider text-muted-foreground uppercase">
                  订单状态
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {getStatusLabel(order.status)}
                </p>
              </div>
              <div>
                <p className="text-xs tracking-wider text-muted-foreground uppercase">
                  订单总额
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  ¥{total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="border-b border-border px-6 py-6">
            <p className="mb-4 text-sm font-semibold text-foreground">
              订单状态
            </p>
            <div className="flex items-center justify-between">
              {(['pending', 'paid', 'shipped', 'delivered'] as const).map(
                (status) => {
                  const isCompleted =
                    (status === 'pending' &&
                      ['pending', 'paid', 'shipped', 'delivered'].includes(
                        order.status
                      )) ||
                    (status === 'paid' &&
                      ['paid', 'shipped', 'delivered'].includes(
                        order.status
                      )) ||
                    (status === 'shipped' &&
                      ['shipped', 'delivered'].includes(order.status)) ||
                    (status === 'delivered' && order.status === 'delivered');

                  return (
                    <div
                      key={status}
                      className="flex flex-1 flex-col items-center"
                    >
                      <div
                        className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          isCompleted
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground'
                        }`}
                      >
                        {status === 'pending' && <Clock className="h-5 w-5" />}
                        {status === 'paid' && <Package className="h-5 w-5" />}
                        {status === 'shipped' && <Truck className="h-5 w-5" />}
                        {status === 'delivered' && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                      </div>
                      <p className="text-center text-xs text-muted-foreground">
                        {getStatusLabel(status)}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="divide-y divide-border">
            <div className="bg-muted/20 px-6 py-4">
              <p className="text-sm font-semibold text-foreground">
                订单商品 ({order.items.length})
              </p>
            </div>
            {order.items.map((item) => (
              <div
                key={item.order_item_id}
                className="flex items-center gap-4 px-6 py-6 transition-colors hover:bg-muted/30"
              >
                {/* Product Image */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <img
                    src="/placeholder.svg"
                    alt={item.product_name || '商品'}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 truncate font-medium text-foreground">
                    {item.product_name || '商品名称'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    数量: {item.quantity}
                  </p>
                </div>

                {/* Price */}
                <div className="shrink-0 text-right">
                  <p className="mb-1 text-xs text-muted-foreground">单价</p>
                  <p className="font-semibold text-foreground">
                    ¥{item.unit_price}
                  </p>
                </div>

                {/* Total */}
                <div className="min-w-24 shrink-0 text-right">
                  <p className="mb-1 text-xs text-muted-foreground">小计</p>
                  <p className="font-semibold text-foreground">
                    ¥{(item.unit_price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="ml-auto max-w-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">小计</p>
              <p className="font-medium text-foreground">
                ¥{subtotal.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">运费</p>
              <p className="font-medium text-foreground">
                ¥{shipping.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3">
              <p className="text-base font-semibold text-foreground">总计</p>
              <p className="text-xl font-bold text-foreground">
                ¥{total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">收货地址</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium whitespace-pre-wrap text-foreground">
              {order.shipping_address}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
