'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Bot,
    Receipt,
    FolderTree,
    Wallet,
    PiggyBank,
    TrendingUp,
    Landmark,
} from 'lucide-react'

import { SearchForm } from '@/components/search-form'
import { VersionSwitcher } from '@/components/version-switcher'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import Image from 'next/image'

// This is sample data.
const data = {
    navMain: [
        {
            title: 'Getting Started',
            url: '#',
            items: [
                {
                    title: 'Dashboard',
                    url: '/dashboard',
                    icon: LayoutDashboard,
                },
                {
                    title: 'Autopilot',
                    url: '/autopilot',
                    icon: Bot,
                },
                {
                    title: 'Expenses',
                    url: '/expenses',
                    icon: Receipt,
                },
                {
                    title: 'Categories',
                    url: '/categories',
                    icon: FolderTree,
                },

                {
                    title: 'Accounts',
                    url: '/accounts',
                    icon: Landmark,
                },
                {
                    title: 'Budgets',
                    url: '/budgets',
                    icon: Wallet,
                },

                {
                    title: 'Savings',
                    url: '/savings',
                    icon: PiggyBank,
                },

                {
                    title: 'Income',
                    url: '/income',
                    icon: TrendingUp,
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 font-semibold">
                    <Image
                        src={'/ExpensProLogo.png'}
                        alt="ExpensePro Logo"
                        className="rounded-md"
                        width={40}
                        height={40}
                    />
                    <div className="flex flex-col  ">
                        <h1>ExpensePro</h1>
                        <h1 className="text-xs text-gray-400">Enterprise</h1>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */}
                {data.navMain.map((item) => (
                    <SidebarGroup key={item.title}>
                        {/* <SidebarGroupLabel>{item.title}</SidebarGroupLabel> */}
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((item) => {
                                    const isActive = pathname === item.url
                                    const Icon = item.icon

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                className={isActive ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : ''}
                                            >
                                                <Link href={item.url} className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
