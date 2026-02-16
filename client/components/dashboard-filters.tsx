'use client'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { generateMonthlyObjects, generateYearOptions } from '@/lib/utils'
import { Dispatch, SetStateAction } from 'react'

interface DashboardFiltersProps {
    selectedMonth: string
    setSelectedMonth: Dispatch<SetStateAction<string>>
    selectedYear: number
    setSelectedYear: Dispatch<SetStateAction<number>>
}

export default function DashboardFilters({
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
}: DashboardFiltersProps) {
    const monthsCardFilter = generateMonthlyObjects(selectedYear)
    const yearOptions = generateYearOptions()

    return (
        <div className="mb-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Filter by:</label>
                <Select
                    value={selectedYear.toString()}
                    onValueChange={(val) => setSelectedYear(Number(val))}
                >
                    <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {yearOptions.map((year) => (
                                <SelectItem key={year.value} value={year.value.toString()}>
                                    {year.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val)}>
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
            </div>
        </div>
    )
}
