'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { DashboardChartProps } from '@/types/dashboard'

const chartConfig = {
    chart: {
        label: "Amount",
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig

export function DashboardBarChart({ title, data }: DashboardChartProps) {
    const normalizedData = data.map((item) => {
        if ('source' in item) {
            // IncomeChartData
            return {
                label: item.source,
                amount: item.amount,
            }
        } else {
            // ExpensesChartData
            return {
                label: item.category,
                amount: item.amount,
            }
        }
    })


    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={normalizedData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="amount" fill="var(--color-chart)" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
