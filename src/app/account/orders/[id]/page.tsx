
'use client';

import * as React from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowLeft, Loader2, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import type { Order } from '@/lib/orders';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrderById } from '@/app/actions/orders';
import { useAuth } from '@/context/auth-context';

type Status = Order['status'];

const statusInfo: Record<Status, { icon: React.ElementType, text: string, color: string }> = {
  Pendente: { icon: Loader2, text: 'Seu pedido foi recebido e está pendente de processamento.', color: 'bg-yellow-500 text-black' },
  Processando: { icon: Package, text: 'Estamos preparando seu pedido para o envio.', color: 'bg-blue-500 text-white' },
  Enviado: { icon: Truck, text: 'Seu pedido foi enviado e está a caminho.', color: 'bg-indigo-500 text-white' },
  Entregue: { icon: CheckCircle, text: 'Seu pedido foi entregue com sucesso!', color: 'bg-green-500 text-white' },
  Cancelado: { icon: XCircle, text: 'Seu pedido foi cancelado.', color: 'bg-destructive text-destructive-foreground' },
};

function OrderDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                <CardFooter><Skeleton className="h-8 w-56 ml-auto" /></CardFooter>
            </Card>
        </div>
        <div className="space-y-8">
            <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent className="p-6"><Skeleton className="h-28 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
        </div>
      </div>
    </div>
  )
}

export default function UserOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
        router.push(`/login?redirect=/account/orders/${id}`);
        return;
    }
    if (!id || typeof id !== 'string') {
        notFound();
        return;
    };

    const fetchOrder = async () => {
      setLoading(true);
      const { data, error } = await getOrderById(id);

      if (error || !data) {
        toast({ title: 'Erro ao buscar pedido', description: error || 'Pedido não encontrado.', variant: 'destructive' });
        return notFound();
      }
      
      // Security check: ensure the fetched order belongs to the current user
      if (data.user_id !== currentUser.id) {
        toast({ title: 'Acesso Negado', description: 'Você não tem permissão para ver este pedido.', variant: 'destructive' });
        return router.push('/account/orders');
      }

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [id, toast, currentUser, authLoading, router]);

  if (loading || authLoading) {
    return <OrderDetailSkeleton />;
  }
  
  if (!order) {
    // This case should be handled by the effect, but as a fallback
    return notFound();
  }
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
    });
  };

  const { icon: StatusIcon, text: statusText, color: statusColor } = statusInfo[order.status];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in-up">
       <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.push('/account/orders')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar para Meus Pedidos</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Detalhes do Pedido #{order.id.substring(0, 8)}...
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-center">Quantidade</TableHead>
                            <TableHead className="text-right">Preço Unitário</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {order.items.map((item) => (
                            <TableRow key={item.productId}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                            <TableCell className="text-right">{formatPrice(item.price * item.quantity)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-end font-bold text-lg border-t pt-6 bg-muted/30">
                    <div className="flex items-center gap-4">
                        <span>Total:</span>
                        <span>{formatPrice(order.total_price)}</span>
                    </div>
                </CardFooter>
            </Card>
        </div>

        <div className="space-y-8">
           <Card>
            <CardHeader>
              <CardTitle>Status do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center gap-4">
                <div className={cn("flex items-center justify-center rounded-full h-16 w-16", statusColor)}>
                    <StatusIcon className={cn("h-8 w-8", order.status === 'Pendente' && 'animate-spin')} />
                </div>
                <div className="space-y-1">
                    <p className="font-semibold text-lg">{order.status}</p>
                    <p className="text-sm text-muted-foreground">{statusText}</p>
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                {order.shipping_address}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Data do Pedido:</span>
                    <span className="font-medium">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Forma de Pagamento:</span>
                    <span className="font-medium">{order.payment_method}</span>
                </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
