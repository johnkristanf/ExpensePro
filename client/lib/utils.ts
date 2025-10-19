import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatNumericDateToWordDate(dateStr: string) {
    const date = new Date(dateStr)

    if (isNaN(date.getTime())) {
        console.warn('Invalid date string passed to formatNumericDateToWordDate:', dateStr)
        return '' // or return a fallback like 'Invalid date'
    }

    const formatted = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(date)

    return formatted // e.g. "Jul 29, 2025"
}

export function formatDateLocaleShort(date: string, locale = 'en-US') {
    const d = new Date(date)
    const month = d.toLocaleString(locale, { month: '2-digit' })
    const day = d.toLocaleString(locale, { day: '2-digit' })
    const year = String(d.getFullYear()).slice(-2) // last two digits

    return `${month}/${day}/${year}` // e.g. "07/29/25"
}

export function formatAmount(amount: number): string {
    const formatted = new Intl.NumberFormat('en-US').format(amount)
    return formatted // e.g. "12,345" (if amount = 12345)
}

export function generateMonthlyObjects(year: number): { value: string; label: string }[] {
    const months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(year, i)
        return {
            value: date.toLocaleString('default', { month: 'long' }).toLowerCase(), // e.g. "Jan"
            label: date.toLocaleString('default', { month: 'long' }), // e.g. "January"
        }
    })

    return [{ value: 'all', label: 'All Months' }, ...months]
}

export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
