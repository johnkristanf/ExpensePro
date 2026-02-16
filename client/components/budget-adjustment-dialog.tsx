import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adjustBudgetBalance } from "@/lib/api/budgets/patch"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Minus, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface BudgetAdjustmentDialogProps {
    budgetId: number
    type: 'increment' | 'decrement'
    currentAmount: number
    budgetName: string
}

export default function BudgetAdjustmentDialog({
    budgetId,
    type,
    currentAmount,
    budgetName
}: BudgetAdjustmentDialogProps) {
    const [open, setOpen] = useState(false)
    const [amount, setAmount] = useState<string>('')
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (amountVal: number) => adjustBudgetBalance(budgetId, amountVal, type),
        onSuccess: () => {
            toast.success(`Budget ${type === 'increment' ? 'added' : 'deducted'} successfully`)
            setOpen(false)
            setAmount('')
            queryClient.invalidateQueries({ queryKey: ['budgets'] })
        },
        onError: (error: any) => {
            // Extract error message from response if available
            const message = error.response?.data?.message || error.message || 'Failed to adjust budget';
            toast.error(message)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const numAmount = parseFloat(amount)

        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Please enter a valid positive amount")
            return
        }

        if (type === 'decrement' && numAmount > currentAmount) {
            toast.error("Cannot deduct more than the available amount")
            return
        }

        mutation.mutate(numAmount)
    }

    const isIncrement = type === 'increment'
    const actionLabel = isIncrement ? 'Add' : 'Deduct'
    const Icon = isIncrement ? Plus : Minus

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" title={`${actionLabel} funds`}>
                    <Icon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{actionLabel} Funds</DialogTitle>
                    <DialogDescription>
                        {isIncrement
                            ? `Add funds to ${budgetName}.`
                            : `Deduct funds from ${budgetName}.`}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="col-span-3"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
