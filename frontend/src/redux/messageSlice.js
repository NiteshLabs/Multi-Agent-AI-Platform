import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name: "message",
    initialState: {
        messages: [],
        artifacts: [],
        // Bumped each time the user asks to open the side viewer
        viewerRequest: 0,
        isLoading: false

    },
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload
        },
        addMessage: (state, action) => {
            const msg = { ...action.payload };
            if (!msg._id && !msg.localId) {
                msg.localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            }
            state.messages.push(msg);
        },
        deleteMessage: (state, action) => {
            const target = action.payload;
            state.messages = state.messages.filter((msg, idx) => {
                if (msg._id && msg._id === target) return false;
                if (msg.localId && msg.localId === target) return false;
                if (typeof target === "number" && idx === target) return false;
                return true;
            });
        },
        togglePinMessage: (state, action) => {
            const target = action.payload;
            const msg = state.messages.find((m, idx) =>
                (m._id && m._id === target) ||
                (m.localId && m.localId === target) ||
                (typeof target === "number" && idx === target)
            );
            if (msg) {
                msg.isPinned = !msg.isPinned;
            }
        },
        setArtifacts: (state, action) => {
            state.artifacts = action.payload
        },
        // Show one artifact in the side viewer and open it (also on mobile).
        openInViewer: (state, action) => {
            state.artifacts = [action.payload]
            state.viewerRequest += 1
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload
        },
    }
})

export const { setMessages, addMessage, deleteMessage, togglePinMessage, setArtifacts, openInViewer, setIsLoading } = messageSlice.actions
export default messageSlice.reducer
