'use client'

import PageTitle from '@/components/page-title'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash, Landmark } from 'lucide-react'
import { formatAmount } from '@/lib/utils'
import FormDialog from '@/components/create-form-dialog'
import { FieldInputType, InputType } from '@/enums/form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchAccounts } from '@/lib/api/accounts/get'
import { createAccount } from '@/lib/api/accounts/post'
import { editAccount } from '@/lib/api/accounts/patch'
import { deleteAccount } from '@/lib/api/accounts/delete'
import { Account, AccountInsert, AccountEdit } from '@/types/accounts'
import TextLoader from '@/components/text-loader'
import { FieldSchema } from '@/types/form'
import EditFormDialog from '@/components/edit-form-dialog'
import AdjustmentDialog from '@/components/adjustment-dialog'
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog'

export default function AccountsPage() {
    const queryClient = useQueryClient()

    // FETCH ACCOUNTS
    const { data: accounts, isLoading: isAccountsLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: fetchAccounts,
    })

    // CREATE ACCOUNT MUTATION
    const mutation = useMutation({
        mutationFn: createAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] })
            toast.success('Account Created Successfully')
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleCreateAccount = (data: AccountInsert) => {
        mutation.mutate(data)
    }

    // EDIT ACCOUNT MUTATION
    const editMutation = useMutation({
        mutationFn: editAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] })
            toast.success('Account Edited Successfully')
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleEditAccount = (data: AccountEdit) => {
        editMutation.mutate(data)
    }

    // DELETE ACCOUNT MUTATION
    const deleteMutation = useMutation({
        mutationFn: deleteAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] })
            toast.success('Account Deleted Successfully')
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleDeleteAccount = (id: number) => {
        deleteMutation.mutate(id)
    }

    // MAPPED ACCOUNT DATA TO DIALOG FIELDS
    const accountToFieldSchemas = (account: Account): FieldSchema[] => {
        return [
            {
                name: 'name',
                label: 'Account Name',
                type: InputType.INPUT,
                inputType: 'text',
                placeholder: 'Enter account name',
                defaultValue: account.name,
            },
            {
                name: 'type',
                label: 'Account Type',
                type: InputType.INPUT,
                inputType: 'text',
                placeholder: 'e.g. Bank, Cash, E-Wallet',
                defaultValue: account.type,
            },
            {
                name: 'balance',
                label: 'Balance',
                type: InputType.INPUT,
                inputType: 'number',
                placeholder: 'Enter balance',
                defaultValue: account.balance,
            },
        ]
    }

    return (
        <div className="container mx-auto py-5">
            <PageTitle title="Accounts" />

            <div className="flex justify-end">
                <FormDialog
                    triggerLabel="Create Account"
                    title="New Account"
                    onSubmit={(data) => handleCreateAccount(data as AccountInsert)}
                    fields={[
                        {
                            name: 'name',
                            label: 'Account Name',
                            type: InputType.INPUT,
                            inputType: FieldInputType.TEXT,
                            placeholder: 'e.g. BPI Checking, Gcash',
                        },
                        {
                            name: 'type',
                            label: 'Account Type',
                            type: InputType.INPUT,
                            inputType: FieldInputType.TEXT,
                            placeholder: 'e.g. Bank, Cash, E-Wallet',
                        },
                        {
                            name: 'balance',
                            label: 'Balance',
                            type: InputType.INPUT,
                            inputType: FieldInputType.NUMBER,
                        },
                    ]}
                />
            </div>

            {/* LOADER */}
            {isAccountsLoading && (
                <div className="flex justify-center mt-10">
                    <TextLoader text="Loading Accounts..." />
                </div>
            )}

            {accounts && accounts.length === 0 ? (
                <div className="text-center mt-10 text-muted-foreground text-md">
                    No accounts found.
                </div>
            ) : null}

            {/* ACCOUNTS DATA CARDS */}
            <div className="h-[70vh] grid md:grid-cols-2 gap-5 mt-5 overflow-y-scroll">
                {accounts &&
                    accounts.length > 0 &&
                    accounts.map((account) => (
                        <Card key={account.id} className="w-full md:max-w-md md:max-h-44">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Landmark className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>{account.name}</CardTitle>
                                </div>
                                <div className="flex flex-col gap-1 text-sm mt-1">
                                    <h1 className="text-muted-foreground">{account.type}</h1>
                                </div>

                                <CardAction>
                                    <div className="flex gap-2 items-center">
                                        <AdjustmentDialog
                                            id={account.id}
                                            name={account.name}
                                            currentAmount={account.balance}
                                            type="increment"
                                            domain="accounts"
                                        />
                                        <AdjustmentDialog
                                            id={account.id}
                                            name={account.name}
                                            currentAmount={account.balance}
                                            type="decrement"
                                            domain="accounts"
                                        />
                                        <EditFormDialog
                                            title="Edit Account"
                                            fields={accountToFieldSchemas(account)}
                                            onSubmit={(data) =>
                                                handleEditAccount({ id: account.id, ...data } as AccountEdit)
                                            }
                                        />
                                        <DeleteConfirmationDialog
                                            title="Delete Account"
                                            description={`Are you sure you want to delete ${account.name}? This action cannot be undone.`}
                                            trigger={
                                                <Trash className="size-4 text-red-800 hover:cursor-pointer hover:opacity-75 transition" />
                                            }
                                            onConfirm={() => handleDeleteAccount(account.id)}
                                        />
                                    </div>
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center text-lg font-semibold mt-4">
                                    <span>Balance</span>
                                    <span>₱{formatAmount(account.balance)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </div>
    )
}
