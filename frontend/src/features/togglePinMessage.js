import api from "../../utils/axios";

export const togglePinMessageApi = async (id) => {
    try {
        const { data } = await api.patch(`/api/chat/toggle-pin/${id}`);
        return data;
    } catch (error) {
        console.error("Error in togglePinMessage.js", error);
        return null;
    }
};

export default togglePinMessageApi;
