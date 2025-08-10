import { SavingsCreate } from "@/types/savings"
import api from "../axios"

export async function createSavings(data: SavingsCreate) {
    const response = await api.post(`/savings`, data)
    return response.data;
}
