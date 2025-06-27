
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingBag, Plus, Minus, Loader2, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createCheckoutSession } from '../actions/stripe';

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
                <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar novo</Button>
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
  const { cartItems, removeFromCart, updateQuantity, cartCount, totalPrice } = useCart();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  
  const fetchAddresses = async () => {
    if (!currentUser) return;
    setIsAddressesLoading(true);
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', currentUser.id);

    if (error) {
        toast({ title: "Erro ao buscar endereços", description: error.message, variant: "destructive" });
    } else {
        setAddresses(data || []);
        if (data && data.length > 0) {
            setSelectedAddressId(data[0].id); // Pre-select first address
        }
    }
    setIsAddressesLoading(false);
  };
  
  useEffect(() => {
    if (currentUser) {
      fetchAddresses();
    }
  }, [currentUser]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      router.push('/login?redirect=/cart');
      return;
    }
    if (!selectedAddressId) {
        toast({
            variant: 'destructive',
            title: 'Endereço Faltando',
            description: 'Por favor, selecione um endereço de entrega para continuar.',
        });
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

            {/* Address Selection */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Endereço de Entrega</CardTitle>
                    {currentUser && <AddressForm userId={currentUser.id} onAddressAdded={fetchAddresses} />}
                </CardHeader>
                <CardContent>
                    {isAddressesLoading ? <Skeleton className="h-20 w-full" /> :
                     addresses.length > 0 ? (
                        <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-4">
                            {addresses.map(address => (
                                <Label key={address.id} htmlFor={`addr-${address.id}`} className="flex items-center gap-4 border rounded-md p-4 cursor-pointer hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-primary">
                                    <RadioGroupItem value={address.id} id={`addr-${address.id}`} />
                                    <div>
                                        <p className="font-medium">{address.street}</p>
                                        <p className="text-sm text-muted-foreground">{address.city}, {address.state} - {address.zip}</p>
                                    </div>
                                </Label>
                            ))}
                        </RadioGroup>
                     ) : (
                        <p className="text-muted-foreground text-center py-4">Nenhum endereço cadastrado.</p>
                     )}
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
                disabled={isCheckingOut || !selectedAddressId || authLoading}
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
