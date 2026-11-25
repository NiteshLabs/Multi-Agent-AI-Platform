import api from "../../utils/axios";

export const deleteMessageApi = async (id) => {
    try {
        const { data } = await api.delete(`/api/chat/delete-message/${id}`);
        return data;
    } catch (error) {
        console.error("Error in deleteMessage.js", error);
        return null;
    }
};

export default deleteMessageApi;
