'use client'

import { getCrsfCookie } from '@/lib/api/auth/get'
import { login } from '@/lib/api/auth/post'
import { cn } from '@/lib/utils'
import { LoginCredentials } from '@/types/auth'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LandingPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter()

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>()

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            if (data.success) {
                console.log("Login Success: ", data);
                reset();
                router.replace('/dashboard');
            }
        },
        onError: (error) => {
            console.error('Login error:', error)
        },
    })

    const onSubmit = async (data: LoginCredentials) => {
        setIsLoading(true);
        await getCrsfCookie();
        loginMutation.mutate(data);
        setIsLoading(false)
    }
    return (
        <div className="flex min-h-full flex-col justify-center items-center px-6 pt-24 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="ExpensePro Logo"
                    src="/ExpensProLogo.png"
                    className="mx-auto h-10 w-auto rounded-md"
                />
                <h2 className="mt-5 text-center text-2xl/9 font-bold tracking-tight ">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium ">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                type="email"
                                autoComplete="email"
                                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-900 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2  sm:text-sm/6"
                                {...register('email', { required: 'Email is required' })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium ">
                                Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                type="password"
                                autoComplete="current-password"
                                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-900 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2  sm:text-sm/6"
                                {...register('password', { required: 'Password is required' })}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className={cn(
                                'flex w-full justify-center rounded-md bg-gray-900 text-white px-3 py-1.5 text-sm/6 font-semibold hover:bg-gray-700  focus-visible:outline-2 focus-visible:outline-offset-2',
                                isLoading
                                    ? 'bg-gray-700 hover:cursor-not-allowed'
                                    : 'hover:cursor-pointer'
                            )}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
