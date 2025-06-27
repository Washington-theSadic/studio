
"use client"

import * as React from "react"
import Link from "next/link"
import { Activity, CreditCard, DollarSign, Users, Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { orders } from "@/lib/orders"

const chartData = [
  { month: "Janeiro", desktop: 186, mobile: 80 },
  { month: "Fevereiro", desktop: 305, mobile: 200 },
  { month: "Março", desktop: 237, mobile: 120 },
  { month: "Abril", desktop: 73, mobile: 190 },
  { month: "Maio", desktop: 209, mobile: 130 },
  { month: "Junho", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--brand))",
  },
} satisfies ChartConfig

const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Data inválida";
    }

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 0) return "agora mesmo";
    if (seconds < 60) return "agora mesmo";

    let interval = seconds / 31536000;
    if (interval > 1) {
        const years = Math.floor(interval);
        return `há ${years} ${years > 1 ? 'anos' : 'ano'}`;
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        const months = Math.floor(interval);
        return `há ${months} ${months > 1 ? 'meses' : 'mês'}`;
    }
    interval = seconds / 86400;
    if (interval > 1) {
        const days = Math.floor(interval);
        return `há ${days} ${days > 1 ? 'dias' : 'dia'}`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
        const hours = Math.floor(interval);
        return `há ${hours} ${hours > 1 ? 'horas' : 'hora'}`;
    }
    interval = seconds / 60;
    if (interval > 1) {
        const minutes = Math.floor(interval);
        return `há ${minutes} ${minutes > 1 ? 'minutos' : 'minuto'}`;
    }
    return "agora mesmo";
};


export default function DashboardPage() {
  const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalSales = orders.length;

  const [timeAgo, setTimeAgo] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const calculateTimes = () => {
        const newTimes: Record<string, string> = {};
        recentOrders.forEach(order => {
            newTimes[order.id] = timeSince(order.date);
        });
        setTimeAgo(newTimes);
    };

    calculateTimes();
    const interval = setInterval(calculateTimes, 60000);

    return () => clearInterval(interval);
  }, [recentOrders]);

  return (
    <div className="flex flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">+20.1% do último mês</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assinaturas</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+2350</div>
                    <p className="text-xs text-muted-foreground">+180.1% do último mês</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{totalSales}</div>
                    <p className="text-xs text-muted-foreground">+19% do último mês</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ativos Agora</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">+201 desde a última hora</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Visão Geral</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                   <ChartContainer config={chartConfig} className="h-[350px] w-full">
                      <BarChart data={chartData} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <div className="lg:col-span-3 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notificações
                        </CardTitle>
                        <CardDescription>Últimas atividades na sua loja.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {recentOrders.length > 0 ? recentOrders.map((order) => (
                           <div className="flex items-start gap-4" key={order.id}>
                                <Avatar className="h-9 w-9 border flex-shrink-0">
                                    <AvatarImage src={`https://i.pravatar.cc/40?u=${order.customer.email}`} data-ai-hint="avatar person" />
                                    <AvatarFallback>{order.customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">
                                        Novo pedido de <span className="font-bold">{order.customer.name}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Pedido <Link href={`/dashboard/orders/${order.id}`} className="font-semibold text-primary hover:underline">#{order.id}</Link> de {formatPrice(order.total)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{timeAgo[order.id] || 'Calculando...'}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma notificação recente.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Vendas Recentes</CardTitle>
                        <CardDescription>Você tem {orders.length} pedidos no total.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center gap-4">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://i.pravatar.cc/40?u=${order.customer.email}`} alt={order.customer.name} data-ai-hint="avatar person" />
                                        <AvatarFallback>{order.customer.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{order.customer.name}</p>
                                        <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                                    </div>
                                    <div className="font-semibold">{formatPrice(order.total)}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}

    