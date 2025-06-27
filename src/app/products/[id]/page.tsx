
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { useCart } from '@/context/cart-context';
import { ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function ProductPageSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-start">
      <div>
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="flex justify-center gap-2 mt-4">
          <Skeleton className="h-1 w-8 rounded-full" />
          <Skeleton className="h-1 w-8 rounded-full" />
          <Skeleton className="h-1 w-8 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </div>
    </div>
  )
}

const conditionClasses: Record<Product['condition'], string> = {
  Novo: 'border-amber-400 text-amber-400 bg-amber-400/10',
  Lacrado: 'tag-lacrado-animated text-black font-semibold',
  Recondicionado: 'bg-black/40 text-white backdrop-blur-sm border-white/20',
};


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        notFound();
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);
  
  useEffect(() => {
    if (!api) {
      return
    }
 
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductPageSkeleton />
      </div>
    );
  }

  if (!product) {
    // notFound() should be called within the effect, but this is a fallback.
    return null;
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleBuyNow = () => {
    addToCart(product, 1, false);
    router.push('/cart');
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="relative">
          <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
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
          </Carousel>
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  'h-1 w-8 rounded-full transition-colors',
                  current === index + 1 ? 'bg-primary' : 'bg-muted'
                )}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
           <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.condition === 'Recondicionado' ? (
                <Badge variant="secondary">{product.condition}</Badge>
              ) : product.condition ? (
                <Badge variant="outline" className={cn(conditionClasses[product.condition])}>
                  {product.condition}
                </Badge>
            ) : null}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
          
          <div className="flex items-baseline gap-4">
            <p className="text-3xl font-bold text-foreground">{formatPrice(product.sale_price ?? product.price)}</p>
            {product.sale_price && (
              <p className="text-2xl text-muted-foreground line-through">{formatPrice(product.price)}</p>
            )}
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Descrição</h2>
            <p className="text-muted-foreground leading-relaxed">
                {product.long_description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
             <Button size="lg" className="flex-1" onClick={() => addToCart(product)}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar ao Carrinho
             </Button>
             <Button size="lg" variant="outline" className="flex-1" onClick={handleBuyNow}>
                Comprar Agora
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
