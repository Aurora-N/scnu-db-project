interface CategoriesSectionProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoriesSection({
  selectedCategory,
  onCategoryChange,
}: CategoriesSectionProps) {
  const categories = ['All', 'Clothing', 'Accessories', 'Shoes', 'Electronics'];

  return (
    <section className="border-b border-border px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`rounded-full px-6 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-muted'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
