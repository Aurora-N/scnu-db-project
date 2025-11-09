import { useState, useEffect } from 'react';
import { CategoryApi } from '@/api/category-api';
import type { Category } from '@/types/category';

interface CategoriesSectionProps {
  selectedCategory: number | null;
  onCategoryChange: (
    categoryId: number | null,
    categoryInfo: Category | null
  ) => void;
}

export default function CategoriesSection({
  selectedCategory,
  onCategoryChange,
}: CategoriesSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryApi.getAllCategories();
        setCategories(response.categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="border-b border-border px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
            <div className="h-10 w-20 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-border px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => onCategoryChange(null, null)}
            className={`rounded-full px-6 py-2 text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-muted'
            }`}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category.category_id}
              onClick={() => onCategoryChange(category.category_id, category)}
              className={`rounded-full px-6 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.category_id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-muted'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
