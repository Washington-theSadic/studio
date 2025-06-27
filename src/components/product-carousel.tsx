
"use client";

import type { Product } from '@/lib/products';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import ProductCard from './product-card';

type ProductCarouselProps = {
  products: Product[];
  animationDelayStart?: number;
};

export default function ProductCarousel({ products, animationDelayStart = 0 }: ProductCarouselProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Carousel
        opts={{
          align: "center",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product, index) => (
            <CarouselItem key={index} className="pl-4 basis-[70%] sm:basis-1/2">
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="animate-fade-in-up"
          style={{
            animationDelay: `${animationDelayStart + i * 0.1}s`,
            animationFillMode: 'forwards',
            opacity: 0
          }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
