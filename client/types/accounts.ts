export interface Account {
    id: number;
    name: string;
    type: string;
    balance: number;
}

export type AccountInsert = Omit<Account, 'id'>;
export type AccountEdit = Account;
