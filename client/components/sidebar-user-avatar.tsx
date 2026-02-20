'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { User, LogOut } from 'lucide-react'
import { toast } from 'sonner'

import { fetchUser } from '@/lib/api/user/get'
import { logout } from '@/lib/api/auth/post'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function SidebarUserAvatar() {
    const router = useRouter()
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
    })

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            router.replace('/')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    const firstLetter = user?.name?.charAt(0)?.toUpperCase() ?? '?'

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring hover:opacity-80 transition-opacity">
                        <Avatar className="size-8 cursor-pointer bg-primary">
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                                {firstLetter}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="bottom" align="end" className="w-48">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-sm truncate">{user?.name ?? 'User'}</span>
                            <span className="text-muted-foreground text-xs truncate">{user?.email ?? ''}</span>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setShowLogoutModal(true)}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout Confirmation Modal */}
            <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Confirm Logout</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to log out? You will be redirected to the login page.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <div className='flex items-center gap-3'>

                            <Button
                                variant="outline"
                                onClick={() => setShowLogoutModal(false)}
                                disabled={logoutMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => logoutMutation.mutate()}
                                disabled={logoutMutation.isPending}
                            >
                                {logoutMutation.isPending ? 'Logging out…' : 'Logout'}
                            </Button>
                        </div>

                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
