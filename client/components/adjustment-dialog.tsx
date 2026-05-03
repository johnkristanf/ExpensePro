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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adjustBudgetBalance } from "@/lib/api/budgets/patch"
import { adjustSavingsBalance } from "@/lib/api/savings/patch"
import { adjustAccountBalance } from "@/lib/api/accounts/patch"
import { fetchAccounts } from "@/lib/api/accounts/get"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Minus, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface AdjustmentDialogProps {
    id: number
    type: 'increment' | 'decrement'
    currentAmount: number
    name: string
    domain: 'budget' | 'savings' | 'accounts'
}

export default function AdjustmentDialog({
    id,
    type,
    currentAmount,
    name,
    domain
}: AdjustmentDialogProps) {
    const [open, setOpen] = useState(false)
    const [amount, setAmount] = useState<string>('')
    const [accountId, setAccountId] = useState<string>('')
    const [reason, setReason] = useState<string>('')
    const queryClient = useQueryClient()

    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: fetchAccounts,
        enabled: open && type === 'increment' && domain !== 'accounts',
    })

    const mutation = useMutation({
        mutationFn: async (amountVal: number) => {
            const accId = accountId ? parseInt(accountId) : undefined
            if (domain === 'budget') {
                return adjustBudgetBalance(id, amountVal, type, accId, reason)
            } else if (domain === 'savings') {
                return adjustSavingsBalance(id, amountVal, type, accId, reason)
            } else {
                return adjustAccountBalance(id, amountVal, type)
            }
        },
        onSuccess: () => {
            const entityName = domain === 'budget' ? 'Budget' : domain === 'savings' ? 'Savings' : 'Account'
            toast.success(`${entityName} ${type === 'increment' ? 'added' : 'deducted'} successfully`)
            setOpen(false)
            setAmount('')
            setAccountId('')
            setReason('')
            const queryKey = domain === 'budget' ? 'budgets' : domain === 'savings' ? 'savings' : 'accounts'
            queryClient.invalidateQueries({ queryKey: [queryKey] })
            if (domain !== 'accounts' && type === 'increment') {
                queryClient.invalidateQueries({ queryKey: ['accounts'] })
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || `Failed to adjust ${domain}`
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

        if (domain !== 'accounts') {
            if (type === 'increment' && !accountId) {
                toast.error("Please select a source account")
                return
            }
            if (type === 'decrement' && !reason.trim()) {
                toast.error("Please provide a reason")
                return
            }
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
                            ? `Add funds to ${name}.`
                            : `Deduct funds from ${name}.`}
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
                        {domain !== 'accounts' && isIncrement && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="account" className="text-right">
                                    Source
                                </Label>
                                <div className="col-span-3">
                                    <Select value={accountId} onValueChange={setAccountId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts?.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                                    {acc.name} (₱{acc.balance})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        {domain !== 'accounts' && !isIncrement && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="reason" className="text-right">
                                    Reason
                                </Label>
                                <Input
                                    id="reason"
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="col-span-3"
                                    placeholder="e.g. Entered wrong amount"
                                />
                            </div>
                        )}
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
