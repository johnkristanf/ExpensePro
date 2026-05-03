import { Account } from "./accounts";

export interface AdjustmentLog {
    id: number;
    type: 'increment' | 'decrement';
    amount: string; 
    account_id: number | null;
    reason: string | null;
    created_at: string;
    account?: Account | null;
}
