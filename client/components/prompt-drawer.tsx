'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import api from '@/lib/api/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ExpensePrompt {
    id: number
    prompt_text: string
}

interface PromptDrawerProps {
    onSelectPrompt: (text: string) => void
}

export function PromptDrawer({ onSelectPrompt }: PromptDrawerProps) {
    const [newPrompt, setNewPrompt] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editValue, setEditValue] = useState('')
    const queryClient = useQueryClient()

    const { data: prompts, isLoading } = useQuery<ExpensePrompt[]>({
        queryKey: ['expense-prompts'],
        queryFn: async () => {
            const response = await api.get('/expense-prompts')
            return response.data
        },
    })

    const createMutation = useMutation({
        mutationFn: async (text: string) => {
            await api.post('/expense-prompts', {
                prompt_text: text,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense-prompts'] })
            setNewPrompt('')
            toast.success('Prompt saved')
        },
        onError: () => {
            toast.error('Failed to save prompt')
        },
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, text }: { id: number; text: string }) => {
            await api.patch(`/expense-prompts/${id}`, {
                prompt_text: text,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense-prompts'] })
            setEditingId(null)
            toast.success('Prompt updated')
        },
        onError: () => {
            toast.error('Failed to update prompt')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/expense-prompts/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense-prompts'] })
            toast.success('Prompt deleted')
        },
        onError: () => {
            toast.error('Failed to delete prompt')
        },
    })

    const handleAddPrompt = () => {
        if (!newPrompt.trim()) return
        createMutation.mutate(newPrompt)
    }

    const startEditing = (prompt: ExpensePrompt) => {
        setEditingId(prompt.id)
        setEditValue(prompt.prompt_text)
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditValue('')
    }

    const saveEditing = (id: number) => {
        if (!editValue.trim()) return
        updateMutation.mutate({ id, text: editValue })
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Saved Prompts
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Saved Prompts</SheetTitle>
                    <SheetDescription>
                        Manage your custom expense prompts. Click to use them.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-4">
                    <div className="flex gap-2 px-4">
                        <Input
                            placeholder="Add new prompt..."
                            value={newPrompt}
                            onChange={(e) => setNewPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddPrompt()
                            }}
                        />
                        <Button
                            onClick={handleAddPrompt}
                            disabled={!newPrompt.trim() || createMutation.isPending}
                            size="icon"
                            className="shrink-0 cursor-pointer"
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto px-4">
                        {isLoading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : prompts?.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No saved prompts yet.
                            </div>
                        ) : (
                            prompts?.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    className="group flex items-center justify-between rounded-lg border p-3 hover:bg-gray-200 transition-colors"
                                >
                                    {editingId === prompt.id ? (
                                        <div className="flex gap-2 w-full">
                                            <Input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="h-8 text-sm"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEditing(prompt.id)
                                                    if (e.key === 'Escape') cancelEditing()
                                                }}
                                                autoFocus
                                            />
                                            <Button
                                                size="icon"
                                                className="h-8 w-8 shrink-0 cursor-pointer"
                                                onClick={() => saveEditing(prompt.id)}
                                                disabled={updateMutation.isPending || !editValue.trim()}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 shrink-0 cursor-pointer"
                                                onClick={cancelEditing}
                                                disabled={updateMutation.isPending}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                className="flex-1 text-left text-sm cursor-pointer"
                                                onClick={() => {
                                                    onSelectPrompt(prompt.prompt_text)
                                                }}
                                            >
                                                {prompt.prompt_text}
                                            </button>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        startEditing(prompt)
                                                    }}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        deleteMutation.mutate(prompt.id)
                                                    }}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
