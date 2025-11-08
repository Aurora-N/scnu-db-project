interface CategoriesSectionProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoriesSection({ selectedCategory, onCategoryChange }: CategoriesSectionProps) {
  const categories = ["All", "Clothing", "Accessories", "Shoes", "Electronics"]

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-12 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
