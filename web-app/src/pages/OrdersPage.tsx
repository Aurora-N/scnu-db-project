import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total: number;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Add sample orders for demo
      const sampleOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-2025-001',
          date: '2025-01-05',
          status: 'delivered',
          total: 189.98,
          items: [
            {
              id: 1,
              name: 'Premium Wireless Headphones',
              price: 149.99,
              quantity: 1,
              image: '/diverse-people-listening-headphones.png',
            },
            {
              id: 2,
              name: 'Classic White T-Shirt',
              price: 39.99,
              quantity: 1,
              image: '/plain-white-tshirt.png',
            },
          ],
        },
        {
          id: '2',
          orderNumber: 'ORD-2025-002',
          date: '2025-01-02',
          status: 'shipped',
          total: 219.97,
          items: [
            {
              id: 3,
              name: 'Leather Crossbody Bag',
              price: 89.99,
              quantity: 1,
              image: '/bag.jpg',
            },
            {
              id: 4,
              name: 'Running Shoes',
              price: 119.99,
              quantity: 1,
              image: '/assorted-shoes.png',
            },
          ],
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-351',
          date: '2024-12-28',
          status: 'delivered',
          total: 99.99,
          items: [
            {
              id: 2,
              name: 'Classic White T-Shirt',
              price: 29.99,
              quantity: 3,
              image: '/plain-white-tshirt.png',
            },
          ],
        },
      ];
      setOrders(sampleOrders);
      localStorage.setItem('orders', JSON.stringify(sampleOrders));
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
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
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <span className="text-sm text-muted-foreground">
          {orders.length} orders
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
          <p className="mb-6 text-lg text-muted-foreground">No orders yet</p>
          <Button asChild>
            <Link to="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-sm"
            >
              {/* Order Header */}
              <div className="border-b border-border bg-secondary px-6 py-4">
                <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs tracking-wider text-muted-foreground uppercase">
                      Order Number
                    </p>
                    <p className="font-semibold text-foreground">
                      {order.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs tracking-wider text-muted-foreground uppercase">
                      Order Date
                    </p>
                    <p className="font-semibold text-foreground">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs tracking-wider text-muted-foreground uppercase">
                      Status
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
                      Total
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
                  >
                    {/* Product Image */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-muted-foreground">
                        Unit Price
                      </p>
                      <p className="font-semibold text-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Total */}
                    <div className="min-w-24 flex-shrink-0 text-right">
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="font-semibold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Track your order or view details
                </p>
                <Button variant="outline" size="sm" className="bg-transparent">
                  View Order Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
