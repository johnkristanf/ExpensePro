type FieldType = 'input' | 'select' | 'textarea'

type FieldOption = {
  label: string
  value: string
}

export type FieldSchema = {
  name: string
  label: string
  type: FieldType
  inputType?: string
  placeholder?: string
  options?: FieldOption[] // for selects
  defaultValue?: any
}
