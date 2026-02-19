import { fetchUser } from '@/lib/api/user/get'
import { useQuery } from '@tanstack/react-query'

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
        staleTime: Infinity, // User data shouldn't change often
    })
}
