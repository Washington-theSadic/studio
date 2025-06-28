
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Order } from '@/lib/orders';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getOrdersByUserId } from '@/app/actions/orders';

const statusColors: Record<Order['status'], string> = {
  Pendente: 'bg-yellow-500 text-black hover:bg-yellow-600',
  Processando: 'bg-blue-500 text-white hover:bg-blue-600',
  Enviado: 'bg-indigo-500 text-white hover:bg-indigo-600',
  Entregue: 'bg-green-500 text-white hover:bg-green-600',
  Cancelado: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const formatPrice = (price: number) => price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

export default function UserOrdersPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

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
    if (!authLoading && !currentUser) {
      router.push('/login?redirect=/account/orders');
    }
    if (currentUser) {
      fetchUserOrders(currentUser.id);
    }
  }, [currentUser, authLoading, router, fetchUserOrders]);

  if (authLoading || !currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="mt-8 space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in-up">
        <h1 className="text-3xl font-bold font-headline mb-2">Meus Pedidos</h1>
        <p className="text-muted-foreground mb-8">Acompanhe o histórico e o status dos seus pedidos.</p>
        
        <Card>
            <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
                <CardDescription>
                    {userOrders.length > 0 ? `Você tem ${userOrders.length} pedido(s) no total.` : 'Você ainda não fez nenhum pedido.'}
                </CardDescription>
            </CardHeader>
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
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/account/orders/${order.id}`)}>Ver Detalhes</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 text-center text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4" />
                        <p>Você ainda não fez nenhum pedido.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
