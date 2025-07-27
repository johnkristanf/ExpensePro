import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatNumericDateToWordDate(dateStr: string) {
    const date = new Date(dateStr)

    const formatted = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(date)

    return formatted
}

export function formatDateLocaleShort(date: string, locale = 'en-US') {
    const d = new Date(date)
    const month = d.toLocaleString(locale, { month: '2-digit' })
    const day = d.toLocaleString(locale, { day: '2-digit' })
    const year = String(d.getFullYear()).slice(-2) // last two digits

    return `${month}/${day}/${year}`
}

export function formatAmount(amount: number): string {
    const formatted = new Intl.NumberFormat('en-US').format(amount)
    return formatted
}
