
import api from "../../utils/axios"

export const createOrder = async (plan) => {
    try {
        const { data } = await api.post("/api/billing/create", { plan })
        console.log(data)
        return data
    } catch (error) {
        console.log("Error in getConversation.js", error)
        return []
    }
}