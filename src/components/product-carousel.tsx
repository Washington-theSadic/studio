
"use client";

import type { Product } from '@/lib/products';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import ProductCard from './product-card';

type ProductCarouselProps = {
  products: Product[];
  animationDelayStart?: number;
};

export default function ProductCarousel({ products, animationDelayStart = 0 }: ProductCarouselProps) {
  // Use CSS for responsiveness instead of JS hooks to avoid SSR errors.
  
  return (
    <>
      {/* Mobile-only Carousel, hidden on medium screens and up */}
      <div className="md:hidden">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem key={`${product.id}-mobile`} className="pl-4 basis-[70%] sm:basis-1/2">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Desktop-only Grid, hidden on small screens */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product, i) => (
          <div
            key={`${product.id}-desktop`}
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
    </>
  );
}
