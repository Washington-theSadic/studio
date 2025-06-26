
"use client"

import * as React from "react"
import { orders as initialOrders, Order } from "@/lib/orders"
import { MoreHorizontal } from "lucide-react"
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

type Status = Order['status'];

const statusColors: Record<Status, string> = {
  Pendente: "bg-yellow-500 hover:bg-yellow-600",
  Processando: "bg-blue-500 hover:bg-blue-600",
  Enviado: "bg-indigo-500 hover:bg-indigo-600",
  Entregue: "bg-green-500 hover:bg-green-600",
  Cancelado: "bg-red-500 hover:bg-red-600",
};

export default function DashboardOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = React.useState<Status | "Todos">("Todos");
  const router = useRouter();

  const filteredOrders = React.useMemo(() => {
    if (activeTab === "Todos") return orders;
    return orders.filter(order => order.status === activeTab);
  }, [orders, activeTab]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
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
            {filteredOrders.map(order => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-medium">{order.customer.name}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {order.customer.email}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className={cn("text-white", statusColors[order.status])} variant="default">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatDate(order.date)}
                </TableCell>
                <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
