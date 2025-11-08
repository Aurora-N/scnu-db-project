import { useState, useEffect } from "react"
import { Link } from "react-router"
import { ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Order {
  id: string
  orderNumber: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered"
  total: number
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
    image: string
  }>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("orders")
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    } else {
      // Add sample orders for demo
      const sampleOrders: Order[] = [
        {
          id: "1",
          orderNumber: "ORD-2025-001",
          date: "2025-01-05",
          status: "delivered",
          total: 189.98,
          items: [
            {
              id: 1,
              name: "Premium Wireless Headphones",
              price: 149.99,
              quantity: 1,
              image: "/diverse-people-listening-headphones.png",
            },
            {
              id: 2,
              name: "Classic White T-Shirt",
              price: 39.99,
              quantity: 1,
              image: "/plain-white-tshirt.png",
            },
          ],
        },
        {
          id: "2",
          orderNumber: "ORD-2025-002",
          date: "2025-01-02",
          status: "shipped",
          total: 219.97,
          items: [
            {
              id: 3,
              name: "Leather Crossbody Bag",
              price: 89.99,
              quantity: 1,
              image: "/bag.jpg",
            },
            {
              id: 4,
              name: "Running Shoes",
              price: 119.99,
              quantity: 1,
              image: "/assorted-shoes.png",
            },
          ],
        },
        {
          id: "3",
          orderNumber: "ORD-2024-351",
          date: "2024-12-28",
          status: "delivered",
          total: 99.99,
          items: [
            {
              id: 2,
              name: "Classic White T-Shirt",
              price: 29.99,
              quantity: 3,
              image: "/plain-white-tshirt.png",
            },
          ],
        },
      ]
      setOrders(sampleOrders)
      localStorage.setItem("orders", JSON.stringify(sampleOrders))
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200"
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "processing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "pending":
        return "bg-gray-50 text-gray-700 border-gray-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered"
      case "shipped":
        return "Shipped"
      case "processing":
        return "Processing"
      case "pending":
        return "Pending"
      default:
        return status
    }
  }

  return (
    <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Orders Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Shopping
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <span className="text-sm text-muted-foreground">{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg text-muted-foreground mb-6">No orders yet</p>
          <Button asChild>
            <Link to="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
            >
              {/* Order Header */}
              <div className="px-6 py-4 bg-secondary border-b border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Order Number</p>
                    <p className="font-semibold text-foreground">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Order Date</p>
                    <p className="font-semibold text-foreground">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                    <p className="font-semibold text-foreground text-lg">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-muted-foreground">Unit Price</p>
                      <p className="font-semibold text-foreground">${item.price.toFixed(2)}</p>
                    </div>

                    {/* Total */}
                    <div className="text-right flex-shrink-0 min-w-24">
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Track your order or view details</p>
                <Button variant="outline" size="sm" className="bg-transparent">
                  View Order Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
