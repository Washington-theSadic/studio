
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, ShoppingBag, Plus, Minus, Loader2, MapPin, PlusCircle, Wallet, QrCode, CreditCard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect } from 'react';
import { createCheckoutSession } from '../actions/stripe';
import { supabase } from '@/lib/supabase';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { createOrder } from '../actions/orders';
import type { OrderItem } from '@/lib/orders';

type Address = {
  id: string;
  user_id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

const AddressForm = ({ onAddressAdded, userId }: { onAddressAdded: () => void, userId: string }) => {
    const { toast } = useToast();
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '' });
    const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setIsSubmittingAddress(true);

        const { error } = await supabase.from('addresses').insert({ ...newAddress, user_id: userId });

        if (error) {
            toast({ title: "Erro ao adicionar endereço", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Endereço adicionado com sucesso!" });
            setNewAddress({ street: '', city: '', state: '', zip: '' });
            onAddressAdded();
            setIsDialogOpen(false);
        }
        setIsSubmittingAddress(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Endereço</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Endereço</DialogTitle>
                    <DialogDescription>Preencha os campos abaixo para adicionar um novo endereço de entrega.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="street">Rua e Número</Label>
                        <Input id="street" value={newAddress.street} onChange={(e) => setNewAddress(p => ({ ...p, street: e.target.value }))} required disabled={isSubmittingAddress} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="city">Cidade</Label>
                            <Input id="city" value={newAddress.city} onChange={(e) => setNewAddress(p => ({ ...p, city: e.target.value }))} required disabled={isSubmittingAddress} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="state">Estado</Label>
                            <Input id="state" value={newAddress.state} onChange={(e) => setNewAddress(p => ({ ...p, state: e.target.value }))} required disabled={isSubmittingAddress} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="zip">CEP</Label>
                        <Input id="zip" value={newAddress.zip} onChange={(e) => setNewAddress(p => ({ ...p, zip: e.target.value }))} required disabled={isSubmittingAddress} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="outline" disabled={isSubmittingAddress}>Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmittingAddress}>
                            {isSubmittingAddress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Endereço
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartCount, totalPrice, clearCart } = useCart();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(undefined);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);

  const fetchAddresses = async (userId: string) => {
    setIsAddressesLoading(true);
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        toast({ title: "Erro ao buscar endereços", description: error.message, variant: "destructive" });
    } else {
        setAddresses(data || []);
        if (data && data.length > 0 && !selectedAddress) {
            setSelectedAddress(data[0].id);
        }
    }
    setIsAddressesLoading(false);
  };
  
  useEffect(() => {
    if (currentUser && !authLoading) {
      fetchAddresses(currentUser.id);
    } else if (!authLoading) {
      // If user is not logged in, stop loading
      setIsAddressesLoading(false);
    }
  }, [currentUser, authLoading]);


  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleStripeCheckout = async () => {
    if (!currentUser) {
      router.push('/login?redirect=/cart');
      return;
    }

    if (!selectedAddress) {
        toast({ title: "Endereço necessário", description: "Por favor, selecione um endereço de entrega.", variant: "destructive" });
        return;
    }

    setIsCheckingOut(true);

    try {
      const address = addresses.find(addr => addr.id === selectedAddress);
      if (!address) throw new Error("Endereço selecionado não encontrado.");

      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.sale_price ?? item.product.price,
      }));

      await createOrder({
        userId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        totalPrice: totalPrice,
        items: orderItems,
        shippingAddress: `${address.street}\n${address.city}, ${address.state} - ${address.zip}`,
        paymentMethod: 'Cartão ou Boleto',
      });

      const checkoutUrl = await createCheckoutSession(cartItems, currentUser.email);
      if (checkoutUrl && window.top) {
        clearCart(); // Clear cart on successful redirect
        window.top.location.href = checkoutUrl;
      } else {
        throw new Error('Não foi possível obter a URL de checkout.');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao finalizar o pedido",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
      setIsCheckingOut(false);
    }
  };

  const handleWhatsAppCheckout = async (paymentMethod: 'Dinheiro' | 'Pix') => {
    if (!currentUser || !selectedAddress) {
      toast({ title: "Informações incompletas", description: "Faça login e selecione um endereço para continuar.", variant: "destructive" });
      return;
    }

    const address = addresses.find(addr => addr.id === selectedAddress);
    if (!address) {
        toast({ title: "Endereço não encontrado", description: "O endereço selecionado não foi encontrado.", variant: "destructive" });
        return;
    }
    
    setIsCheckingOut(true);
    setIsPaymentDialogOpen(false);

    try {
      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.sale_price ?? item.product.price,
      }));

      await createOrder({
        userId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        totalPrice: totalPrice,
        items: orderItems,
        shippingAddress: `${address.street}\n${address.city}, ${address.state} - ${address.zip}`,
        paymentMethod: paymentMethod,
      });

      const itemsList = cartItems
        .map(item => `- ${item.quantity}x ${item.product.name}`)
        .join('\n');

      const message = `Olá! Gostaria de finalizar meu pedido.\n\n*Cliente:* ${currentUser.name}\n\n*Itens:*\n${itemsList}\n\n*Valor Total:* ${formatPrice(totalPrice)}\n\n*Endereço de Entrega:*\n${address.street}\n${address.city}, ${address.state} - ${address.zip}\n\n*Forma de Pagamento:* ${paymentMethod}`.trim();

      const encodedMessage = encodeURIComponent(message);
      const phoneNumber = '5577998188469';
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      toast({
        title: "Redirecionando para o WhatsApp...",
        description: "Seu pedido está sendo preparado. Finalize a conversa no WhatsApp.",
      });
      
      clearCart();

      if (window.top) {
          window.top.location.href = whatsappUrl;
      }

    } catch (error: any) {
       toast({
        title: "Erro ao criar pedido",
        description: error.message || "Não foi possível salvar seu pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
       setIsCheckingOut(false);
    }
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

            {/* Address Selection */}
            {currentUser && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Endereço de Entrega
                        </CardTitle>
                        <CardDescription>
                            Selecione ou adicione um endereço para a entrega do seu pedido.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isAddressesLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : addresses.length > 0 ? (
                            <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-4">
                                {addresses.map(address => (
                                    <Label key={address.id} htmlFor={address.id} className="flex items-start space-x-4 border rounded-md p-4 cursor-pointer hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-primary">
                                        <RadioGroupItem value={address.id} id={address.id} />
                                        <div className="grid gap-1.5">
                                            <p className="font-semibold">{address.street}</p>
                                            <p className="text-sm text-muted-foreground">{address.city}, {address.state} - {address.zip}</p>
                                        </div>
                                    </Label>
                                ))}
                            </RadioGroup>
                        ) : (
                             <p className="text-muted-foreground text-center py-4">Você ainda não tem endereços cadastrados. Adicione um para continuar.</p>
                        )}
                    </CardContent>
                    <CardFooter className="border-t pt-6 flex justify-end">
                       {currentUser && <AddressForm userId={currentUser.id} onAddressAdded={() => fetchAddresses(currentUser.id)} />}
                    </CardFooter>
                </Card>
            )}
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
                onClick={() => {
                  if (!currentUser) {
                    router.push('/login?redirect=/cart');
                    return;
                  }
                  setIsPaymentDialogOpen(true)
                }} 
                disabled={isCheckingOut || authLoading || (!!currentUser && (!selectedAddress || addresses.length === 0))}
              >
                {isCheckingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentUser ? (isCheckingOut ? 'Aguarde...' : 'Continuar para Pagamento') : 'Fazer Login para Finalizar'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

       <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Escolha a Forma de Pagamento</DialogTitle>
                    <DialogDescription>
                        Selecione como você prefere pagar pelo seu pedido.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4">
                    <Button variant="outline" size="lg" className="justify-start h-14" onClick={() => handleWhatsAppCheckout('Dinheiro')} disabled={isCheckingOut}>
                        <Wallet className="mr-4 h-6 w-6" />
                        <div className="text-left">
                            <p className="font-semibold">Dinheiro</p>
                            <p className="text-xs text-muted-foreground">Pagar na entrega via WhatsApp</p>
                        </div>
                    </Button>
                    <Button variant="outline" size="lg" className="justify-start h-14" onClick={() => handleWhatsAppCheckout('Pix')} disabled={isCheckingOut}>
                        <QrCode className="mr-4 h-6 w-6" />
                        <div className="text-left">
                            <p className="font-semibold">Pix</p>
                            <p className="text-xs text-muted-foreground">Pagar com chave Pix via WhatsApp</p>
                        </div>
                    </Button>
                    <Button variant="outline" size="lg" className="justify-start h-14" onClick={handleStripeCheckout} disabled={isCheckingOut}>
                        <CreditCard className="mr-4 h-6 w-6" />
                        <div className="text-left">
                            <p className="font-semibold">Cartão ou Boleto</p>
                            <p className="text-xs text-muted-foreground">Pagamento seguro via Stripe</p>
                        </div>
                    </Button>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" disabled={isCheckingOut}>Cancelar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
