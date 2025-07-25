import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'

export default function PanelLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
