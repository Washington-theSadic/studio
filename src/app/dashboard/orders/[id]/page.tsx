
'use client';

import * as React from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Order } from '@/lib/orders';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

type Status = Order['status'];

const statusColors: Record<Status, string> = {
  Pendente: 'bg-yellow-500 text-black hover:bg-yellow-600',
  Processando: 'bg-blue-500 text-white hover:bg-blue-600',
  Enviado: 'bg-indigo-500 text-white hover:bg-indigo-600',
  Entregue: 'bg-green-500 text-white hover:bg-green-600',
  Cancelado: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
            <CardContent><Skeleton className="h-40 w-full" /></CardContent>
            <CardFooter><Skeleton className="h-8 w-56 ml-auto" /></CardFooter>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card><CardContent className="p-6"><Skeleton className="h-28 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();
  
  const [order, setOrder] = React.useState<Order | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [currentStatus, setCurrentStatus] = React.useState<Status>('Pendente');

  React.useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error || !data) {
        notFound();
      } else {
        setOrder(data);
        setCurrentStatus(data.status);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <OrderDetailSkeleton />;
  }
  
  if (!order) {
    notFound();
  }
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  const handleStatusChange = (newStatus: Status) => {
    setCurrentStatus(newStatus);
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: currentStatus })
      .eq('id', order.id);

    if (error) {
       toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      setOrder({ ...order, status: currentStatus });
      toast({
        title: 'Status do Pedido Atualizado!',
        description: `O status do pedido #${order.id} foi alterado para "${currentStatus}".`,
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Pedido #{order.id.substring(0, 8)}...
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Produtos do Pedido</CardTitle>
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
             <CardFooter className="flex justify-end font-bold text-lg border-t pt-6">
              <div className="flex items-center gap-4">
                <span>Total do Pedido:</span>
                <span>{formatPrice(order.total_price)}</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
           <Card>
            <CardHeader>
              <CardTitle>Status do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Badge className={cn('text-base w-full justify-center border-transparent', statusColors[currentStatus])}>
                    {currentStatus}
                </Badge>
                <div className="grid gap-2">
                    <Select value={currentStatus} onValueChange={(value) => handleStatusChange(value as Status)} disabled={isSaving}>
                      <SelectTrigger id="status" aria-label="Selecione o status">
                        <SelectValue placeholder="Mudar status do pedido" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Processando">Processando</SelectItem>
                        <SelectItem value="Enviado">Enviado</SelectItem>
                        <SelectItem value="Entregue">Entregue</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSaveChanges} disabled={isSaving || currentStatus === order.status}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
                <div className="font-medium">{order.customer_name}</div>
                <div className="text-muted-foreground">{order.customer_email}</div>
                <div className="text-muted-foreground pt-2 border-t mt-2">Pedido realizado em {formatDate(order.created_at)}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
