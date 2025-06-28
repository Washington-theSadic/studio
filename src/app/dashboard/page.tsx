
"use client"

import * as React from "react"
import Link from "next/link"
import { CreditCard, DollarSign, Bell, Loader2, Calendar as CalendarIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { Order } from "@/lib/orders"
import { Skeleton } from "@/components/ui/skeleton"
import { getOrders } from "@/app/actions/orders"
import { useToast } from "@/hooks/use-toast"
import { 
  format, 
  subDays,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  eachMonthOfInterval,
  differenceInDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from "react-day-picker"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const chartConfig = {
  total: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatYAxis = (tick: any) => {
  const value = Number(tick);
  if (value >= 1000) {
    return `R$${(value / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}k`;
  }
  return formatPrice(value);
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

function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-3 w-40 mt-1" />
            </CardContent>
        </Card>
    )
}

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.trim().split(' ').filter(Boolean);
    if (names.length > 1) {
        return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0] ? names[0][0].toUpperCase() : '';
};

export default function DashboardPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const [timeAgo, setTimeAgo] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await getOrders();
      if (error) {
        console.error("Error fetching orders:", error);
        toast({ title: "Erro ao buscar pedidos", description: error, variant: "destructive" });
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [toast]);
  
  const filteredOrders = React.useMemo(() => {
    if (!date?.from || !orders) return [];
    
    const fromDate = startOfDay(date.from);
    const toDate = date.to ? endOfDay(date.to) : endOfDay(date.from);

    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return isAfter(orderDate, fromDate) && isBefore(orderDate, toDate);
    });
  }, [orders, date]);

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_price, 0);
  const totalSales = filteredOrders.length;

  const chartData = React.useMemo(() => {
    if (filteredOrders.length === 0 || !date?.from) return [];

    const from = startOfDay(date.from);
    const to = date.to ? endOfDay(date.to) : endOfDay(date.from);
    const daysInRange = differenceInDays(to, from);

    if (daysInRange < 0) return [];

    if (daysInRange <= 31) {
      // Group by day
      const dailyRevenue = new Map<string, number>();
      const interval = eachDayOfInterval({ start: from, end: to });

      interval.forEach(day => {
        const formattedDate = format(day, 'dd/MM', { locale: ptBR });
        dailyRevenue.set(formattedDate, 0);
      });

      filteredOrders.forEach(order => {
        const orderDate = format(new Date(order.created_at), 'dd/MM', { locale: ptBR });
        if (dailyRevenue.has(orderDate)) {
          dailyRevenue.set(orderDate, (dailyRevenue.get(orderDate) || 0) + order.total_price);
        }
      });
      
      return Array.from(dailyRevenue.entries()).map(([name, total]) => ({ name, total }));
    } else {
      // Group by month
      const monthlyRevenue = new Map<string, number>();
      const interval = eachMonthOfInterval({ start: from, end: to });

      interval.forEach(month => {
        const formattedMonth = format(month, 'MMM/yy', { locale: ptBR });
        monthlyRevenue.set(formattedMonth, 0);
      });

      filteredOrders.forEach(order => {
        const orderMonth = format(new Date(order.created_at), 'MMM/yy', { locale: ptBR });
        if (monthlyRevenue.has(orderMonth)) {
          monthlyRevenue.set(orderMonth, (monthlyRevenue.get(orderMonth) || 0) + order.total_price);
        }
      });

      return Array.from(monthlyRevenue.entries()).map(([name, total]) => ({ name, total: total }));
    }
  }, [filteredOrders, date]);


  const recentOrders = React.useMemo(() => orders.slice(0, 5), [orders]);

  React.useEffect(() => {
    if (recentOrders.length === 0) return;

    const calculateTimes = () => {
        const newTimes: Record<string, string> = {};
        recentOrders.forEach(order => {
            newTimes[order.id] = timeSince(order.created_at);
        });
        setTimeAgo(newTimes);
    };

    calculateTimes();
    const intervalId = setInterval(calculateTimes, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [recentOrders]);
  
  return (
    <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold font-heading">Visão Geral</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "d 'de' LLL, y", { locale: ptBR })} -{" "}
                      {format(date.to, "d 'de' LLL, y", { locale: ptBR })}
                    </>
                  ) : (
                    format(date.from, "d 'de' LLL, y", { locale: ptBR })
                  )
                ) : (
                  <span>Escolha um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
                <>
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </>
            ) : (
                <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground">No período selecionado</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{totalSales}</div>
                            <p className="text-xs text-muted-foreground">No período selecionado</p>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Receita</CardTitle>
                    <CardDescription>
                      Sua receita total para o período selecionado.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                   <ChartContainer config={chartConfig} className="h-[350px] w-full">
                      <BarChart data={chartData} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                        />
                        <YAxis
                          tickFormatter={formatYAxis}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent
                            formatter={(value) => formatPrice(value as number)}
                          />}
                        />
                        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
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
                        <CardDescription>Últimas atividades na sua loja (não afetado pelo filtro de data).</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /> :
                        recentOrders.length > 0 ? recentOrders.map((order) => (
                           <div className="flex items-start gap-4" key={order.id}>
                                <Avatar className="h-9 w-9 border flex-shrink-0">
                                    <AvatarFallback>{getInitials(order.customer_name)}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">
                                        Novo pedido de <span className="font-bold">{order.customer_name}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Pedido <Link href={`/dashboard/orders/${order.id}`} className="font-semibold text-primary hover:underline">#{order.id.substring(0,8)}...</Link> de {formatPrice(order.total_price)}
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
                       {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /> : 
                       <div className="space-y-6">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center gap-4">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>{getInitials(order.customer_name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{order.customer_name}</p>
                                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                                    </div>
                                    <div className="font-semibold">{formatPrice(order.total_price)}</div>
                                </div>
                            ))}
                        </div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
