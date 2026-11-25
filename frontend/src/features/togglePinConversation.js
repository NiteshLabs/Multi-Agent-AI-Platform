import api from "../../utils/axios";

export const togglePinConversation = async (id) => {
    try {
        const { data } = await api.patch(`/api/chat/toggle-pin-conversation/${id}`);
        return data;
    } catch (error) {
        console.error("Error in togglePinConversation.js", error);
        return null;
    }
};

export default togglePinConversation;
