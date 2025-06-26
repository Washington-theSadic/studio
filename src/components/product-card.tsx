"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="group flex flex-col overflow-hidden h-full transition-all duration-300 bg-secondary/20 hover:bg-secondary/50 border-border/30 hover:border-brand">
      <CardHeader className="p-0 border-b border-border/30 relative">
        {product.condition && product.condition !== 'Novo' && (
          <Badge className="absolute top-2 left-2 z-10" variant="secondary">{product.condition}</Badge>
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
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.id}`}>
          <CardTitle className="text-lg font-semibold leading-tight hover:text-brand transition-colors font-heading">
            {product.name}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start gap-4 mt-auto">
        {product.sale_price ? (
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">{formatPrice(product.sale_price)}</p>
            <p className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</p>
          </div>
        ) : (
          <p className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</p>
        )}
        <Button className="w-full" onClick={() => addToCart(product)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Adicionar ao carrinho
        </Button>
      </CardFooter>
    </Card>
  );
}
