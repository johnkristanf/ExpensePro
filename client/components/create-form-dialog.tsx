'use client'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FieldSchema } from '@/types/form'
import { Button } from './ui/button'
import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Textarea } from './ui/textarea'

type FormDialogProps = {
    triggerLabel: string
    title: string
    fields: FieldSchema[]
    onSubmit: (data: any) => void
}
export default function FormDialog({ triggerLabel, title, fields, onSubmit }: FormDialogProps) {
    const [open, setOpen] = useState(false)

    const { register, handleSubmit, reset, setValue, watch } = useForm()

    const handleFormSubmit: SubmitHandler<any> = (data) => {
        onSubmit(data)
        setOpen(false)
        reset()
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>{triggerLabel}</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {fields &&
                        fields.map((field) => {
                            const value = watch(field.name)

                            switch (field.type) {
                                case 'input':
                                    return (
                                        <div key={field.name}>
                                            <label className="block mb-2">{field.label}</label>
                                            <Input
                                                type={field.inputType && field.inputType}
                                                {...register(field.name)}
                                                placeholder={field.placeholder}
                                                defaultValue={field.defaultValue}
                                            />
                                        </div>
                                    )

                                case 'textarea':
                                    return (
                                        <div key={field.name}>
                                            <label className="block mb-1">{field.label}</label>
                                            <Textarea
                                                {...register(field.name)}
                                                placeholder={field.placeholder}
                                                defaultValue={field.defaultValue}
                                            />
                                        </div>
                                    )
                                case 'select':
                                    return (
                                        <div key={field.name}>
                                            <label className="block mb-2">{field.label}</label>
                                            <Select
                                                defaultValue={field.defaultValue}
                                                onValueChange={(val) => setValue(field.name, val)}
                                                value={value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                        placeholder={
                                                            field.placeholder || 'Select an option'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {field.options?.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )
                                default:
                                    return null
                            }
                        })}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Submit</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
