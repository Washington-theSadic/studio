
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
};

const conditionClasses: Record<Product['condition'], string> = {
  Novo: 'border-amber-400 text-amber-400 bg-amber-400/10',
  Lacrado: 'tag-lacrado-animated text-black font-semibold',
  Recondicionado: 'bg-black/40 text-white backdrop-blur-sm border-white/20',
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleBuyNow = () => {
    addToCart(product, 1, false);
    router.push('/cart');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const hasSale = product.sale_price && product.sale_price < product.price;

  return (
    <Card className="group flex flex-col overflow-hidden h-full transition-all duration-300 bg-secondary/20 hover:bg-secondary/50 border-border/30 hover:border-brand hover:shadow-lg hover:shadow-brand/10">
      <CardHeader className="p-0 border-b border-border/30 relative">
        <Link href={`/products/${product.id}`} className="block overflow-hidden">
          <div className="aspect-square relative w-full">
            {product.condition && (
             <Badge variant="outline" className={cn('absolute top-3 left-3 z-10', conditionClasses[product.condition])}>
               {product.condition}
             </Badge>
           )}
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
      <CardContent className="p-3 flex flex-col flex-grow">
        <div className="flex-grow">
           <Link href={`/products/${product.id}`}>
            <h3 className="text-base font-semibold leading-tight hover:text-brand transition-colors font-heading h-10 flex items-center">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 h-8">{product.description}</p>
        </div>
         <div className="pt-2">
            {hasSale ? (
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-xl font-bold text-foreground">{formatPrice(product.sale_price!)}</p>
                <p className="text-base text-muted-foreground line-through">{formatPrice(product.price)}</p>
              </div>
            ) : (
              <p className="text-xl font-bold text-foreground">{formatPrice(product.price)}</p>
            )}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 mt-auto">
        <div className="flex flex-col gap-2 w-full">
            <Button size="sm" className="w-full" onClick={handleBuyNow}>
                 <Zap className="mr-2 h-4 w-4" />
                Comprar Agora
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={() => addToCart(product)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Adicionar ao Carrinho
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
