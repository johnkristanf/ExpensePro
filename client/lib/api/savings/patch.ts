import { SavingsEdit } from "@/types/savings"
import api from "../axios"

export async function editSavings(data: SavingsEdit) {
    const { id, ...spreadData } = data

    const response = await api.patch(`/savings/${id}`, spreadData)
    return response.data;
}
