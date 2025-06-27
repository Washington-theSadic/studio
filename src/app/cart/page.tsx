
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingBag, Plus, Minus, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import React, { useState } from 'react';
import { createCheckoutSession } from '../actions/stripe';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartCount, totalPrice } = useCart();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      router.push('/login?redirect=/cart');
      return;
    }

    setIsCheckingOut(true);

    // This Server Action will redirect the user. 
    // It should not be wrapped in a try/catch block on the client,
    // as that would prevent the redirect from working.
    await createCheckoutSession(cartItems, currentUser.email);
    
    // On a successful redirect, this line won't be reached.
    // If an error occurs in the action before the redirect, 
    // Next.js's default error handling will take over.
    setIsCheckingOut(false);
  };


  if (cartCount === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center animate-fade-in-up">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold font-headline mb-2">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-6">Parece que você ainda não adicionou nenhum produto.</p>
        <Button asChild>
          <Link href="/products">Começar a comprar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-8">Seu Carrinho</h1>
      <div className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-8">
            {/* Items */}
            <Card>
                <CardHeader><CardTitle>Itens no Carrinho</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col divide-y">
                    {cartItems.map(({ product, quantity }) => (
                       <div key={product.id} className="flex gap-4 p-4">
                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border">
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    sizes="100px"
                                    className="object-cover"
                                    data-ai-hint={`${product.category.toLowerCase()} product`}
                                />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1">
                                        <Link href={`/products/${product.id}`} className="font-semibold hover:text-brand line-clamp-2 leading-tight">
                                            {product.name}
                                        </Link>
                                        <p className="text-muted-foreground text-sm mt-1">{product.category}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(product.id)} aria-label={`Remover ${product.name} do carrinho`} className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                <div className="flex justify-between items-center mt-2">
                                    <p className="font-bold text-lg">{formatPrice(product.sale_price ?? product.price)}</p>
                                     <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(product.id, quantity - 1)} disabled={quantity <= 1}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="font-bold text-base w-8 text-center">{quantity}</span>
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(product.id, quantity + 1)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 sticky top-24">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({cartCount} {cartCount > 1 ? 'itens' : 'item'})</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span className="font-semibold text-brand">Grátis</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                size="lg" 
                className="w-full font-semibold" 
                onClick={handleCheckout} 
                disabled={isCheckingOut || authLoading}
              >
                {isCheckingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentUser ? (isCheckingOut ? 'Finalizando...' : 'Finalizar Pedido') : 'Fazer Login para Finalizar'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
