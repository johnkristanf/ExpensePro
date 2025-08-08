import axios from 'axios'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_WEB_SERVER_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
}) 

export default api
