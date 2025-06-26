
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartCount, totalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCheckout = () => {
    if (!currentUser) {
      router.push('/login?redirect=/cart');
    } else {
      // Mock checkout process
      toast({
        title: 'Pedido Finalizado!',
        description: 'Seu pedido foi realizado com sucesso. Obrigado por comprar conosco!',
      });
      clearCart();
      router.push('/');
    }
  };

  if (cartCount === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold font-headline mb-8">Seu Carrinho</h1>
      <div className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-6">
            {cartItems.map(({ product, quantity }) => (
              <Card key={product.id} className="flex items-center p-4">
                <div className="relative h-24 w-24 rounded-md overflow-hidden mr-6">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    data-ai-hint={`${product.category.toLowerCase()} product`}
                  />
                </div>
                <div className="flex-grow">
                  <Link href={`/products/${product.id}`} className="font-semibold hover:text-brand">{product.name}</Link>
                  <p className="text-muted-foreground text-sm">{product.category}</p>
                  <p className="font-bold mt-1">{formatPrice(product.price)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                    className="w-20 text-center"
                    aria-label={`Quantidade para ${product.name}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(product.id)} aria-label={`Remover ${product.name} do carrinho`}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 sticky top-24">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} {cartCount > 1 ? 'itens' : 'item'})</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="font-semibold text-brand">Grátis</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full" onClick={handleCheckout}>
                {currentUser ? 'Finalizar Pedido' : 'Fazer Login para Finalizar'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
