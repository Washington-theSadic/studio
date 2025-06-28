
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { User, MapPin, Package, KeyRound, Camera, Loader2, PlusCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Order } from '@/lib/orders';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { getOrdersByUserId } from '../actions/orders';

type Address = {
  id: string;
  user_id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

const statusColors: Record<Order['status'], string> = {
  Pendente: 'bg-yellow-500 text-black hover:bg-yellow-600',
  Processando: 'bg-blue-500 text-white hover:bg-blue-600',
  Enviado: 'bg-indigo-500 text-white hover:bg-indigo-600',
  Entregue: 'bg-green-500 text-white hover:bg-green-600',
  Cancelado: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const PageSection = ({ icon, title, description, children }: { icon: React.ReactNode, title: string, description: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-start">
        <div className="flex flex-col items-center text-center text-muted-foreground pt-1">
            {icon}
            <span className="text-xs mt-1">{title}</span>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            {children}
        </Card>
    </div>
);

const AddressForm = ({ onAddressAdded, userId }: { onAddressAdded: () => void, userId: string }) => {
    const { toast } = useToast();
    const [supabase] = useState(() => createClient());
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

export default function AccountPage() {
  const { currentUser, loading, logout, updateAvatar } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [supabase] = useState(() => createClient());

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  const fetchAddresses = useCallback(async (userId: string) => {
    setIsAddressesLoading(true);
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        toast({ title: "Erro ao buscar endereços", description: error.message, variant: "destructive" });
    } else {
        setAddresses(data || []);
    }
    setIsAddressesLoading(false);
  }, [supabase, toast]);
  
  const fetchUserOrders = useCallback(async (userId: string) => {
    setIsOrdersLoading(true);
    const { data, error } = await getOrdersByUserId(userId);

    if (error) {
        toast({ title: "Erro ao buscar pedidos", description: error, variant: "destructive" });
    } else {
        setUserOrders(data || []);
    }
    setIsOrdersLoading(false);
  }, [toast]);


  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login?redirect=/account');
    }
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      fetchAddresses(currentUser.id);
      fetchUserOrders(currentUser.id);
    }
  }, [currentUser, loading, router, fetchAddresses, fetchUserOrders]);
  
  const handleSaveChanges = () => {
    // In a real app, you would call an API to update the user profile.
    toast({
        title: "Sucesso!",
        description: "Suas informações foram salvas. (Simulação)"
    })
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) {
      return;
    }

    setIsUploading(true);
    const { error } = await updateAvatar(file);
    setIsUploading(false);

    if (error) {
      toast({
        title: "Erro ao atualizar foto",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Foto de perfil atualizada!",
        description: "Sua nova foto já está visível.",
      });
    }
     // Reset file input
    event.target.value = '';
  };

  if (loading || !currentUser) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2 text-center">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="mt-8 space-y-4 w-full max-w-2xl">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  const formatPrice = (price: number) => price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
  };


  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
        <div className="relative">
          {isUploading && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
          )}
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src={currentUser.avatar_url || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt={currentUser.name} data-ai-hint="avatar person" />
            <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
           <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full bg-background cursor-pointer" disabled={isUploading}>
                <label htmlFor="avatar-upload" className={cn("cursor-pointer", isUploading && "cursor-not-allowed")}>
                    <Camera className="h-4 w-4" />
                </label>
                <input id="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/png, image/jpeg, image/webp" disabled={isUploading} />
                <span className="sr-only">Alterar foto</span>
            </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline text-center md:text-left">{currentUser.name}</h1>
          <p className="text-muted-foreground text-center md:text-left">{currentUser.email}</p>
        </div>
      </div>

      <div className="space-y-12">
        <PageSection icon={<User className="h-8 w-8" />} title="Meu Perfil" description="Gerencie suas informações pessoais e de acesso.">
           <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} disabled />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
                <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
            </CardFooter>
        </PageSection>

        <PageSection icon={<KeyRound className="h-8 w-8" />} title="Segurança" description="Altere sua senha de acesso.">
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="current-password">Senha Atual</Label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input id="new-password" type="password" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
                <Button onClick={handleSaveChanges}>Alterar Senha</Button>
            </CardFooter>
        </PageSection>

        <PageSection icon={<MapPin className="h-8 w-8" />} title="Meus Endereços & Contatos" description="Gerencie seus endereços e contatos.">
            <CardContent>
                {isAddressesLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : addresses.length > 0 ? (
                    <div className="space-y-4">
                        {addresses.map(address => (
                            <div key={address.id} className="border p-4 rounded-md flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{address.street}</p>
                                    <p className="text-sm text-muted-foreground">{address.city}, {address.state} - {address.zip}</p>
                                </div>
                                <Button variant="ghost" size="sm">Editar</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Você ainda não tem endereços cadastrados.</p>
                )}
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
                 <AddressForm userId={currentUser.id} onAddressAdded={() => fetchAddresses(currentUser.id)} />
            </CardFooter>
        </PageSection>

        <PageSection icon={<Package className="h-8 w-8" />} title="Meus Pedidos" description="Acompanhe o histórico dos seus pedidos.">
             <CardContent className="p-0">
                {isOrdersLoading ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : userOrders.length > 0 ? (
                    <div className="divide-y">
                        {userOrders.map(order => (
                            <div key={order.id} className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                <div>
                                    <p className="font-semibold">Pedido #{order.id.substring(0,8)}...</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                                </div>
                                <div>
                                    <Badge className={cn('text-xs w-full justify-center text-center', statusColors[order.status])}>
                                        {order.status}
                                    </Badge>
                                </div>
                                <p className="font-medium text-right md:text-center">{formatPrice(order.total_price)}</p>
                                <div className="text-right col-span-2 md:col-span-1">
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>Ver Detalhes</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 text-center text-muted-foreground">
                        <p>Você ainda não fez nenhum pedido.</p>
                    </div>
                )}
            </CardContent>
        </PageSection>

        <Separator />

        <div className="text-center">
            <Button variant="destructive" onClick={logout}>Sair da Conta</Button>
        </div>
      </div>
    </div>
  );
}
