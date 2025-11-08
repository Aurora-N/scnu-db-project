import { useState } from "react"
import type React from "react"

import { useNavigate } from "react-router"
import { ShoppingCart, Heart } from "lucide-react"

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: number
    image: string
    category: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)

  const handleCardClick = () => {
    navigate(`/product/${product.id}`)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    alert("Added to cart!")
  }

  return (
    <div className="group cursor-pointer" onClick={handleCardClick}>
      <div className="relative overflow-hidden rounded-lg bg-secondary mb-3 aspect-square">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-destructive text-destructive" : "text-foreground"}`} />
        </button>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground py-2 px-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-sm font-medium">Add to Cart</span>
        </button>
      </div>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="text-sm font-medium text-foreground truncate">{product.name}</h3>
        <p className="text-lg font-semibold text-foreground mt-2">${product.price}</p>
      </div>
    </div>
  )
}
