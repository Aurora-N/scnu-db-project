import { useState, useEffect } from "react"
import { Link } from "react-router"
import { Search } from "lucide-react"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const cart = JSON.parse(savedCart)
        setCartCount(cart.length)
      } else {
        setCartCount(0)
      }
    }

    updateCartCount()
    window.addEventListener("storage", updateCartCount)

    // Listen for custom cart update events
    const handleCartUpdate = () => updateCartCount()
    window.addEventListener("cartUpdated", handleCartUpdate)

    return () => {
      window.removeEventListener("storage", updateCartCount)
      window.removeEventListener("cartUpdated", handleCartUpdate)
    }
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
            买买网
          </Link>

          {/* Search Bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 bg-secondary text-foreground placeholder-muted-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/orders"
              className="p-2 text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Orders
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              JD
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
