import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function MyCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add sample items to cart for demo
  const addSampleItems = () => {
    const sampleItems: CartItem[] = [
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
        price: 29.99,
        quantity: 2,
        image: '/plain-white-tshirt.png',
      },
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
    ];
    setCartItems(sampleItems);
  };

  const toggleItemSelection = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  };

  const deleteItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
    selectedItems.delete(id);
    setSelectedItems(new Set(selectedItems));
  };

  const deleteSelected = () => {
    setCartItems(cartItems.filter((item) => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = cartItems.length > 0 ? 10 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      {/* Cart Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
        <span className="text-sm text-muted-foreground">
          {cartItems.length} items
        </span>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-16 text-center">
          <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
          <p className="mb-6 text-lg text-muted-foreground">
            Your cart is empty
          </p>
          <Button asChild>
            <Link to="/">Start Shopping</Link>
          </Button>
          <Button
            onClick={addSampleItems}
            variant="outline"
            className="ml-3 bg-transparent"
          >
            Add Sample Items
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
              <div className="flex-1">Product</div>
              <div className="w-24 text-right">Price</div>
              <div className="w-20 text-center">Qty</div>
              <div className="w-24 text-right">Total</div>
              <div className="w-10"></div>
            </div>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={() => toggleItemSelection(item.id)}
                  className="h-4 w-4"
                />

                {/* Product Info */}
                <div className="flex flex-1 items-center gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-foreground">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.id}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="w-24 text-right text-sm font-medium text-foreground">
                  ${item.price.toFixed(2)}
                </div>

                {/* Quantity */}
                <div className="flex w-20 items-center justify-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded border border-border text-xs transition-colors hover:bg-secondary"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded border border-border text-xs transition-colors hover:bg-secondary"
                  >
                    +
                  </button>
                </div>

                {/* Total */}
                <div className="w-24 text-right text-sm font-semibold text-foreground">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteItem(item.id)}
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
                Delete Selected ({selectedItems.size})
              </Button>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4 rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 font-semibold text-foreground">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full">Proceed to Checkout</Button>
              <Button
                asChild
                variant="outline"
                className="w-full bg-transparent"
              >
                <Link to="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
