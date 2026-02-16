'use client'

import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import { formatAmount } from '@/lib/utils'
import { DashboardCardProps } from '@/types/dashboard'

export default function DashboardCard({ title, data }: DashboardCardProps) {

    return (
        <Card className="max-h-48">
            <CardHeader>
                <CardDescription>Total {title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    ₱{formatAmount(data.total)}
                </CardTitle>
            </CardHeader>

            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    <h1>Total Accumulated {title}</h1>
                </div>
            </CardFooter>
        </Card>
    )
}
