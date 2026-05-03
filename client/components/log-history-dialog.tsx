import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { fetchAdjustmentLogs } from "@/lib/api/logs/get"
import { useQuery } from "@tanstack/react-query"
import { History } from "lucide-react"
import { useState } from "react"
import { formatAmount } from "@/lib/utils"

interface LogHistoryDialogProps {
    domain: 'budgets' | 'savings'
    id: number
    name: string
}

export default function LogHistoryDialog({
    domain,
    id,
    name
}: LogHistoryDialogProps) {
    const [open, setOpen] = useState(false)

    const { data: logs, isLoading } = useQuery({
        queryKey: ['logs', domain, id],
        queryFn: () => fetchAdjustmentLogs(domain, id),
        enabled: open,
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" title="View Adjustment History">
                    <History className="h-4 w-4 text-blue-600" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>History</DialogTitle>
                    <DialogDescription>
                        Adjustment history for {name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    {isLoading ? (
                        <div className="text-center text-muted-foreground">Loading...</div>
                    ) : logs && logs.length > 0 ? (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="flex flex-col p-3 border rounded-md text-sm shadow-sm bg-card">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`font-semibold ${log.type === 'increment' ? 'text-green-600' : 'text-red-600'}`}>
                                            {log.type === 'increment' ? 'Add' : 'Deduct'}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg">₱{formatAmount(Number(log.amount))}</span>
                                        <span className="text-muted-foreground">
                                            {log.type === 'increment'
                                                ? (log.account ? `From: ${log.account.name}` : 'Source: Unknown/Deleted')
                                                : `Reason: ${log.reason || 'N/A'}`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">No history found.</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
