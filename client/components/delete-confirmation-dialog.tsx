"use client"

import React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationDialogProps {
    trigger: React.ReactNode
    title?: string
    description?: string
    onConfirm: () => void
}

export default function DeleteConfirmationDialog({
    trigger,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    onConfirm,
}: DeleteConfirmationDialogProps) {
    const [open, setOpen] = React.useState(false)

    const handleConfirm = () => {
        onConfirm()
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
