"use client";

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { products, Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCart } from '@/context/cart-context';
import { notFound } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart();
  
  const product = products.find((p: Product) => p.id === id);

  if (!product) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((img, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className="p-0 aspect-square relative">
                      <Image
                        src={img}
                        alt={`${product.name} - imagem ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        data-ai-hint={`${product.category.toLowerCase()} product`}
                      />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
        
        <div className="flex flex-col gap-6">
          <span className="text-sm font-semibold text-brand">{product.category}</span>
          <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
          
          <div className="flex items-baseline gap-4">
            <p className="text-3xl font-bold text-foreground">{formatPrice(product.salePrice ?? product.price)}</p>
            {product.salePrice && (
              <p className="text-2xl text-muted-foreground line-through">{formatPrice(product.price)}</p>
            )}
          </div>
          
          <div className="text-muted-foreground leading-relaxed">
            <h2 className="text-xl font-semibold text-foreground mb-2">Descrição</h2>
            <p>{product.longDescription}</p>
          </div>

          <Button size="lg" className="w-full md:w-auto" onClick={() => addToCart(product)}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Comprar
          </Button>
        </div>
      </div>
    </div>
  );
}
