import type { Category } from '@/types/category';

interface HeroSectionProps {
  categoryInfo?: Category | null;
}

export default function HeroSection({ categoryInfo }: HeroSectionProps) {
  return (
    <section className="px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="mb-4 text-4xl leading-tight font-light text-balance text-foreground sm:text-5xl lg:text-6xl">
          {categoryInfo ? categoryInfo.name : '发现有意思的商品'}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-balance text-muted-foreground">
          {categoryInfo
            ? categoryInfo.description
            : '探索我们为现代生活设计的高品质精选商品'}
        </p>
      </div>
    </section>
  );
}
