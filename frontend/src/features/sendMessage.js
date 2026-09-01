
import api from '../../utils/axios'

async function sendMessage(payload) {
  try {
    const {data}=await api.post("/api/agent/chat",payload)
    return data
  } catch (error) {
    console.log("error in sendMessage.js")
     console.log("Status:", error.response?.status);
  console.log("Backend response:", error.response?.data);
  console.log("Full error:", error);
    return null
  }
}

export default sendMessage
