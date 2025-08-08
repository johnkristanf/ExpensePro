'use client'

import { useState } from 'react'

import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { capitalizeFirstLetter, formatAmount, generateMonthlyObjects } from '@/lib/utils'
import { DashboardCardProps } from '@/types/dashboard'

export default function DashboardCard({
    title,
    data,
    selectedMonth,
    setSelectedMonth,
}: DashboardCardProps) {
    const monthsCardFilter = generateMonthlyObjects(2025)

    console.log('selectedMonth: ', selectedMonth)

    return (
        <Card className="max-h-48">
            <CardHeader>
                <CardDescription>Total {title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    ₱{formatAmount(data.total)}
                </CardTitle>
                <CardAction>
                    <Select
                        value={selectedMonth}
                        onValueChange={(val) => setSelectedMonth(val)} // 👈 capture value
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {monthsCardFilter.map((month, index) => (
                                    <SelectItem key={index} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>

            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    {selectedMonth == 'all' ? (
                        <h1>Overall Accumulated {title}</h1>
                    ) : (
                        <h1>
                            Total {title} for the month of {capitalizeFirstLetter(selectedMonth)}
                        </h1>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}
