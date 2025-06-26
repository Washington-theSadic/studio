"use client"

import { Activity, CreditCard, DollarSign, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

const recentSales = [
    { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+R$1,999.00", avatar: "https://i.pravatar.cc/40?u=a042581f4e29026024d" },
    { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+R$39.00", avatar: "https://i.pravatar.cc/40?u=a042581f4e29026704d" },
    { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+R$299.00", avatar: "https://i.pravatar.cc/40?u=a04258114e29026702d" },
    { name: "William Kim", email: "will@email.com", amount: "+R$99.00", avatar: "https://i.pravatar.cc/40?u=a042581f4e29026706d" },
    { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+R$39.00", avatar: "https://i.pravatar.cc/40?u=a042581f4e29026707d" },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$45.231,89</div>
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
                    <div className="text-2xl font-bold">+12,234</div>
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
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Vendas Recentes</CardTitle>
                    <CardDescription>Você fez 265 vendas este mês.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {recentSales.map((sale, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={sale.avatar} alt={sale.name} data-ai-hint="avatar person" />
                                    <AvatarFallback>{sale.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold">{sale.name}</p>
                                    <p className="text-sm text-muted-foreground">{sale.email}</p>
                                </div>
                                <div className="font-semibold">{sale.amount}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
