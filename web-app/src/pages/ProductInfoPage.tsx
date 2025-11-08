import { useState } from "react"
import { useParams } from "react-router"
import { ShoppingCart, Heart, ArrowLeft, Star } from "lucide-react"

export default function ProductInfoPage() {

  const { id: productId } = useParams()

  const [isFavorite, setIsFavorite] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  // Mock product data - in a real app, fetch based on productId
  const product = {
    id: productId,
    name: "Premium Wireless Headphones",
    price: 199.99,
    rating: 4.5,
    reviews: 328,
    category: "Electronics",
    images: [
      "/premium-wireless-headphones.png",
      "/headphones-side-view.png",
      "/headphones-detail.jpg",
      "/headphones-box.jpg",
    ],
    inStock: true,
    sku: "WH-PRO-2024",
    description:
      "Experience premium audio quality with our state-of-the-art wireless headphones. Featuring active noise cancellation, 30-hour battery life, and premium comfort for all-day wear.",
    specifications: [
      { label: "Driver Size", value: "40mm" },
      { label: "Frequency Response", value: "20Hz - 20kHz" },
      { label: "Battery Life", value: "30 hours" },
      { label: "Charging Time", value: "2 hours" },
      { label: "Bluetooth Version", value: "5.3" },
      { label: "Weight", value: "250g" },
    ],
    features: [
      "Active Noise Cancellation (ANC)",
      "Premium comfort with memory foam ear cushions",
      "Multi-device connectivity",
      "Built-in microphone for calls",
      "Foldable design with carrying case",
      "Touch controls",
    ],
    shipping: "Free shipping on orders over $100. Estimated delivery in 3-5 business days.",
    warranty: "2-year manufacturer warranty included",
  }

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    alert("Added to cart!")
  }

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-lg bg-secondary aspect-square">
            <img
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <p className="text-white font-semibold text-lg">Out of Stock</p>
              </div>
            )}
          </div>

          {/* Thumbnail images */}
          <div className="flex gap-3">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImage === index ? "border-primary" : "border-border"
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`View ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Title and rating */}
          <div className="mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{product.category}</p>
            <h1 className="text-3xl font-semibold text-foreground mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-foreground text-foreground" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6 pb-6 border-b border-border">
            <p className="text-4xl font-bold text-foreground">${product.price.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-2">SKU: {product.sku}</p>
          </div>

          {/* Description */}
          <p className="text-foreground mb-6">{product.description}</p>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-foreground">Quantity:</span>
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-foreground hover:bg-secondary transition-colors"
              >
                −
              </button>
              <span className="px-4 py-2 text-foreground border-l border-r border-border">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-foreground hover:bg-secondary transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-destructive text-destructive" : "text-foreground"}`} />
            </button>
          </div>

          {/* Stock status */}
          <p className="text-sm text-muted-foreground mb-6">
            {product.inStock ? (
              <span className="text-green-600">In Stock - Ships in 1-2 business days</span>
            ) : (
              <span className="text-destructive">Out of Stock</span>
            )}
          </p>

          {/* Shipping and warranty */}
          <div className="space-y-3 pt-6 border-t border-border">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Shipping</p>
              <p className="text-sm text-foreground">{product.shipping}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Warranty</p>
              <p className="text-sm text-foreground">{product.warranty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications and Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 pb-12 border-b border-border">
        {/* Specifications */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">Specifications</h2>
          <div className="space-y-4">
            {product.specifications.map((spec, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">{spec.label}</span>
                <span className="text-sm font-medium text-foreground">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">Key Features</h2>
          <ul className="space-y-3">
            {product.features.map((feature, index) => (
              <li key={index} className="flex gap-3 text-sm text-foreground">
                <span className="text-primary font-bold">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
