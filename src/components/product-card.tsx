"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card className="group flex flex-col overflow-hidden h-full transition-all duration-300 bg-secondary/20 hover:bg-secondary/50 border-border/30 hover:border-brand hover:shadow-lg hover:shadow-brand/10">
      <CardHeader className="p-0 border-b border-border/30 relative">
        {product.condition && product.condition !== 'Novo' && (
          <Badge className="absolute top-3 left-3 z-10" variant="secondary">{product.condition}</Badge>
        )}
        <Link href={`/products/${product.id}`} className="block overflow-hidden">
          <div className="aspect-square relative w-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={`${product.category.toLowerCase()} product`}
            />
          </div>
        </Link>
      </CardHeader>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
           <Link href={`/products/${product.id}`}>
            <h3 className="text-lg font-semibold leading-tight hover:text-brand transition-colors font-heading h-14">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 h-10">{product.description}</p>
        </div>
         <div className="pt-4">
            {product.sale_price ? (
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">{formatPrice(product.sale_price)}</p>
                <p className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</p>
            )}
        </div>
      </div>

      <CardFooter className="p-6 pt-0">
        <Button className="w-full" onClick={() => addToCart(product)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Adicionar ao carrinho
        </Button>
      </CardFooter>
    </Card>
  );
}
