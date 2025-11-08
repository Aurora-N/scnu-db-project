import type { Category } from '@/types/category';

interface HeroSectionProps {
  categoryInfo?: Category | null;
}

export default function HeroSection({ categoryInfo }: HeroSectionProps) {
  return (
    <section className="px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="mb-4 text-4xl leading-tight font-light text-balance text-foreground sm:text-5xl lg:text-6xl">
          {categoryInfo ? categoryInfo.name : 'Discover Innovation'}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-balance text-muted-foreground">
          {categoryInfo
            ? categoryInfo.description
            : 'Explore our curated collection of premium products designed for the modern lifestyle.'}
        </p>
      </div>
    </section>
  );
}
