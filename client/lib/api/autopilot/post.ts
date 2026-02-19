import { autopilot } from '../axios'

export async function sendMessage(userId: number, message: string) {
    const response = await autopilot.post(`/chat/${userId}`, {
        user_input: message,
    })
    return response.data
}
