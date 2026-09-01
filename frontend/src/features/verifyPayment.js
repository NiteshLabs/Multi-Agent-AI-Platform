
import api from "../../utils/axios"

export const varifyPayment = async (payload) => {
    try {
        const { data } = await api.post("/api/billing/verify", payload)
        console.log(data)
        return data
    } catch (error) {
        console.log("Error in varifypayment.js", error)
        console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    console.log(error);
        return []
    }
}