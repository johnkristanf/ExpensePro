'use client'
import { logout } from '@/lib/api/auth/post'
import { useMutation } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LogoutButton() {
    const router = useRouter()

    const mutation = useMutation({
        mutationFn: logout,
        onSuccess: (data) => {
            router.replace('/')
        },

        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleLogout = () => {
        mutation.mutate()
    }

    return (
        <div
            className="justify-self-end hover:cursor-pointer hover:opacity-75"
            onClick={handleLogout}
        >
            <LogOut />
        </div>
    )
}
