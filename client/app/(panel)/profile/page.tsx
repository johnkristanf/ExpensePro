'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchUser } from '@/lib/api/user/get'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Mail, User } from 'lucide-react'

export default function ProfilePage() {
    const { data: user, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
    })

    const firstLetter = user?.name?.charAt(0)?.toUpperCase() ?? '?'

    const formatDate = (dateString: string) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground text-sm">Loading profile…</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>

            {/* Avatar & Name header */}
            <div className="flex items-center gap-5 mb-8">
                <Avatar className="size-20 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                        {firstLetter}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-xl font-semibold">{user?.name}</h2>
                    <p className="text-muted-foreground text-sm">{user?.email}</p>
                </div>
            </div>

            <Separator className="mb-6" />

            {/* Info cards */}
            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 rounded-lg border p-4">
                    <User className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Full Name</p>
                        <p className="font-medium">{user?.name ?? '—'}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-4">
                    <Mail className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email Address</p>
                        <p className="font-medium">{user?.email ?? '—'}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border p-4">
                    <CalendarDays className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Member Since</p>
                        <p className="font-medium">{formatDate(user?.created_at)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
