
"use client"

import * as React from "react"
import { MoreHorizontal, Loader2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
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
} from "@/components/ui/alert-dialog"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { Order } from "@/lib/orders"
import { getOrders, deleteOrder, deleteOrders } from "@/app/actions/orders"
import { useToast } from "@/hooks/use-toast"

type Status = Order['status'];

const statusColors: Record<Status, string> = {
  Pendente: "bg-yellow-500 text-black hover:bg-yellow-600",
  Processando: "bg-blue-500 text-white hover:bg-blue-600",
  Enviado: "bg-indigo-500 text-white hover:bg-indigo-600",
  Entregue: "bg-green-500 text-white hover:bg-green-600",
  Cancelado: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

export default function DashboardOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<Status | "Todos">("Todos");
  const [selectedOrderIds, setSelectedOrderIds] = React.useState<string[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await getOrders();
    if (error) {
        console.error("Error fetching orders:", error);
        toast({ title: "Erro ao buscar pedidos", description: error, variant: "destructive" });
    } else {
        setOrders(data || []);
    }
    setLoading(false);
  }, [toast]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  React.useEffect(() => {
    setSelectedOrderIds([]);
  }, [activeTab]);

  const handleDeleteOrder = async (orderId: string) => {
    const { error } = await deleteOrder(orderId);
    if (error) {
        toast({ title: "Erro ao deletar pedido", description: error, variant: "destructive" });
    } else {
        toast({ title: "Pedido deletado!", description: "O pedido foi removido com sucesso." });
        await fetchOrders();
        setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsBulkSubmitting(true);
    const { error } = await deleteOrders(selectedOrderIds);
    if (error) {
        toast({ title: 'Erro ao deletar pedidos', description: error, variant: 'destructive' });
    } else {
        toast({ title: 'Pedidos Removidos!', description: `${selectedOrderIds.length} pedido(s) foram removidos com sucesso.` });
        await fetchOrders();
        setSelectedOrderIds([]);
    }
    setIsBulkSubmitting(false);
  };

  const filteredOrders = React.useMemo(() => {
    if (activeTab === "Todos") return orders;
    return orders.filter(order => order.status === activeTab);
  }, [orders, activeTab]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  const statusTabs: (Status | "Todos")[] = ["Todos", "Pendente", "Processando", "Enviado", "Entregue", "Cancelado"];

  return (
    <Card>
      <CardHeader className="px-7">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Pedidos</CardTitle>
            <CardDescription>
              Uma lista dos seus pedidos recentes.
            </CardDescription>
          </div>
          {selectedOrderIds.length > 0 && (
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="h-8 gap-1" disabled={isBulkSubmitting}>
                         {isBulkSubmitting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Deletar ({selectedOrderIds.length})
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso irá deletar permanentemente os {selectedOrderIds.length} pedidos selecionados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isBulkSubmitting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} disabled={isBulkSubmitting} className="bg-destructive hover:bg-destructive/90">
                           {isBulkSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Deletar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Status | "Todos")}>
          <TabsList className="mb-4">
            {statusTabs.map(tab => (
              <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                    <Checkbox
                        checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                        onCheckedChange={(checked) => {
                           const pageIds = filteredOrders.map(p => p.id);
                           if (checked) {
                               const newSelectedIds = [...new Set([...selectedOrderIds, ...pageIds])];
                               setSelectedOrderIds(newSelectedIds);
                           } else {
                               setSelectedOrderIds(selectedOrderIds.filter(id => !pageIds.includes(id)));
                           }
                        }}
                        aria-label="Selecionar todos os pedidos na página"
                    />
                 </TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Data</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? filteredOrders.map(order => (
                <TableRow key={order.id} data-state={selectedOrderIds.includes(order.id) ? "selected" : ""}>
                   <TableCell>
                        <Checkbox 
                            checked={selectedOrderIds.includes(order.id)}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setSelectedOrderIds([...selectedOrderIds, order.id]);
                                } else {
                                    setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                                }
                            }}
                            aria-label={`Selecionar pedido de ${order.customer_name}`}
                        />
                    </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {order.customer_email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={cn("border-transparent", statusColors[order.status])}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell className="text-right">{formatPrice(order.total_price)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full justify-start font-normal text-destructive hover:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deletar
                              </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso irá deletar permanentemente o pedido de {order.customer_name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-destructive hover:bg-destructive/90">
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
