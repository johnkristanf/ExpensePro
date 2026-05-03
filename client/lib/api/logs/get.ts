import { AdjustmentLog } from '@/types/logs'
import api from '../axios'

export async function fetchAdjustmentLogs(domain: string, id: number): Promise<AdjustmentLog[]> {
    const response = await api.get(`/${domain}/${id}/logs`)
    return await response.data;
}
