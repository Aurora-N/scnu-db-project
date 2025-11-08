import { useState } from 'react';
import { useParams } from 'react-router';
import { ShoppingCart, Heart, ArrowLeft, Star } from 'lucide-react';

export default function ProductInfoPage() {
  const { id: productId } = useParams();

  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data - in a real app, fetch based on productId
  const product = {
    id: productId,
    name: 'Premium Wireless Headphones',
    price: 199.99,
    rating: 4.5,
    reviews: 328,
    category: 'Electronics',
    images: [
      '/premium-wireless-headphones.png',
      '/headphones-side-view.png',
      '/headphones-detail.jpg',
      '/headphones-box.jpg',
    ],
    inStock: true,
    sku: 'WH-PRO-2024',
    description:
      'Experience premium audio quality with our state-of-the-art wireless headphones. Featuring active noise cancellation, 30-hour battery life, and premium comfort for all-day wear.',
    specifications: [
      { label: 'Driver Size', value: '40mm' },
      { label: 'Frequency Response', value: '20Hz - 20kHz' },
      { label: 'Battery Life', value: '30 hours' },
      { label: 'Charging Time', value: '2 hours' },
      { label: 'Bluetooth Version', value: '5.3' },
      { label: 'Weight', value: '250g' },
    ],
    features: [
      'Active Noise Cancellation (ANC)',
      'Premium comfort with memory foam ear cushions',
      'Multi-device connectivity',
      'Built-in microphone for calls',
      'Foldable design with carrying case',
      'Touch controls',
    ],
    shipping:
      'Free shipping on orders over $100. Estimated delivery in 3-5 business days.',
    warranty: '2-year manufacturer warranty included',
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </button>

      <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
            <img
              src={product.images[selectedImage] || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {!product.inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-lg font-semibold text-white">Out of Stock</p>
              </div>
            )}
          </div>

          {/* Thumbnail images */}
          <div className="flex gap-3">
            {product.images.map((image, index) => (
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
          {/* Title and rating */}
          <div className="mb-6">
            <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
              {product.category}
            </p>
            <h1 className="mb-3 text-3xl font-semibold text-foreground">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6 border-b border-border pb-6">
            <p className="text-4xl font-bold text-foreground">
              ${product.price.toFixed(2)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          </div>

          {/* Description */}
          <p className="mb-6 text-foreground">{product.description}</p>

          {/* Quantity selector */}
          <div className="mb-6 flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">
              Quantity:
            </span>
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-foreground transition-colors hover:bg-secondary"
              >
                −
              </button>
              <span className="border-r border-l border-border px-4 py-2 text-foreground">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-foreground transition-colors hover:bg-secondary"
              >
                +
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mb-8 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="rounded-lg border border-border px-6 py-3 transition-colors hover:bg-secondary"
            >
              <Heart
                className={`h-5 w-5 ${isFavorite ? 'fill-destructive text-destructive' : 'text-foreground'}`}
              />
            </button>
          </div>

          {/* Stock status */}
          <p className="mb-6 text-sm text-muted-foreground">
            {product.inStock ? (
              <span className="text-green-600">
                In Stock - Ships in 1-2 business days
              </span>
            ) : (
              <span className="text-destructive">Out of Stock</span>
            )}
          </p>

          {/* Shipping and warranty */}
          <div className="space-y-3 border-t border-border pt-6">
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                Shipping
              </p>
              <p className="text-sm text-foreground">{product.shipping}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                Warranty
              </p>
              <p className="text-sm text-foreground">{product.warranty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications and Features */}
      <div className="mb-12 grid grid-cols-1 gap-8 border-b border-border pb-12 lg:grid-cols-2">
        {/* Specifications */}
        <div>
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            Specifications
          </h2>
          <div className="space-y-4">
            {product.specifications.map((spec, index) => (
              <div
                key={index}
                className="flex justify-between border-b border-border/50 py-2"
              >
                <span className="text-sm text-muted-foreground">
                  {spec.label}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            Key Features
          </h2>
          <ul className="space-y-3">
            {product.features.map((feature, index) => (
              <li key={index} className="flex gap-3 text-sm text-foreground">
                <span className="font-bold text-primary">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
