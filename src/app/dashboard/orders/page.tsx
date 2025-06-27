
"use client"

import * as React from "react"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
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
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { Order } from "@/lib/orders"
import { getOrders } from "@/app/actions/orders"
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
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await getOrders();
        if (error) {
            console.error("Error fetching orders:", error);
            toast({ title: "Erro ao buscar pedidos", description: error.message, variant: "destructive" });
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    };
    fetchOrders();
  }, [toast]);

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
        <CardTitle>Pedidos</CardTitle>
        <CardDescription>
          Uma lista dos seus pedidos recentes.
        </CardDescription>
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
                <TableRow key={order.id}>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
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
