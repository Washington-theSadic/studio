
'use client';

import * as React from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import type { Order } from '@/lib/orders';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrderById, updateOrderStatus, deleteOrder } from '@/app/actions/orders';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

type Status = Order['status'];

const statusColors: Record<Status, string> = {
  Pendente: 'bg-yellow-500 text-black hover:bg-yellow-600',
  Processando: 'bg-blue-500 text-white hover:bg-blue-600',
  Enviado: 'bg-indigo-500 text-white hover:bg-indigo-600',
  'Em rota de entrega': 'bg-purple-500 text-white hover:bg-purple-600',
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
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [currentStatus, setCurrentStatus] = React.useState<Status>('Pendente');
  
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [cancellationReason, setCancellationReason] = React.useState('');

  React.useEffect(() => {
    if (!id || typeof id !== 'string') return;
    const fetchOrder = async () => {
      setLoading(true);
      const { data, error } = await getOrderById(id);
      if (error || !data) {
        toast({ title: 'Erro ao buscar pedido', description: error || 'Pedido não encontrado.', variant: 'destructive' });
        notFound();
      } else {
        setOrder(data);
        setCurrentStatus(data.status);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id, toast]);

  const handleDelete = async () => {
    if (!order) return;
    setIsDeleting(true);
    const { error } = await deleteOrder(order.id);
    if (error) {
        toast({ title: 'Erro ao deletar pedido', description: error, variant: 'destructive' });
        setIsDeleting(false);
    } else {
        toast({ title: 'Pedido deletado!', description: 'O pedido foi removido com sucesso.' });
        router.push('/dashboard/orders');
    }
  };

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
    if (!order || currentStatus === order.status) return;

    if (currentStatus === 'Cancelado') {
        setCancellationReason(order.cancellation_reason || '');
        setIsCancelDialogOpen(true);
    } else {
        setIsSaving(true);
        const { data, error } = await updateOrderStatus(order.id, currentStatus, null);
        if (error) {
           toast({ title: 'Erro ao salvar', description: error, variant: 'destructive' });
        } else if (data) {
            setOrder(data);
            setCurrentStatus(data.status);
            toast({
              title: 'Status do Pedido Atualizado!',
              description: `O status do pedido foi alterado para "${data.status}".`,
            });
        }
        setIsSaving(false);
    }
  };
  
  const handleConfirmCancellation = async () => {
    if (!order || !cancellationReason.trim()) {
        toast({ title: 'Motivo obrigatório', description: 'Por favor, informe o motivo do cancelamento.', variant: 'destructive' });
        return;
    }
    setIsSaving(true);
    setIsCancelDialogOpen(false);
    
    const { data, error } = await updateOrderStatus(order.id, 'Cancelado', cancellationReason);

    if (error) {
       toast({ title: 'Erro ao cancelar pedido', description: error, variant: 'destructive' });
    } else if (data) {
        setOrder(data);
        setCurrentStatus(data.status);
        toast({ title: 'Pedido Cancelado!', description: 'O pedido foi cancelado com sucesso.' });
    }

    setCancellationReason('');
    setIsSaving(false);
  };

  return (
    <>
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
              {order.status === 'Cancelado' && order.cancellation_reason && (
                <CardDescription className="pt-2 text-destructive">
                  <strong>Motivo:</strong> {order.cancellation_reason}
                </CardDescription>
              )}
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
                        <SelectItem value="Em rota de entrega">Em rota de entrega</SelectItem>
                        <SelectItem value="Entregue">Entregue</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSaveChanges} disabled={isSaving || isDeleting || currentStatus === order.status}>
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

           <Card>
              <CardHeader>
                  <CardTitle>Ações Perigosas</CardTitle>
              </CardHeader>
              <CardContent>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full" disabled={isSaving || isDeleting}>
                              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                              Deletar Pedido
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Essa ação não pode ser desfeita. Isso irá deletar permanentemente o pedido de{' '}
                                  <span className="font-semibold">{order.customer_name}</span> e remover seus dados de nossos servidores.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                  Deletar
                              </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </CardContent>
            </Card>

        </div>
      </div>
    </div>
    <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Cancelar Pedido</AlertDialogTitle>
                <AlertDialogDescription>
                    Por favor, informe o motivo do cancelamento. Essa informação será exibida para o cliente.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
                placeholder="Ex: Produto fora de estoque."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
            />
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCurrentStatus(order.status)}>Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmCancellation} disabled={!cancellationReason.trim() || isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmar Cancelamento
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
