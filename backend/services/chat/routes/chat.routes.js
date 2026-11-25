import express from "express"
import { createConversations, deleteConversation, deleteMessage, getConversations, getMessage, saveMessage, togglePinConversation, togglePinMessage, updateConversation } from "../contollers/chat.contoller.js"

const router = express.Router()

router.get("/create-conversation",createConversations)
router.get("/get-conversation",getConversations)
router.post("/update-conversation",updateConversation)
router.post("/save-message",saveMessage)
router.get("/get-messages/:conversationId",getMessage)
router.delete("/delete-message/:id", deleteMessage)
router.patch("/toggle-pin/:id", togglePinMessage)
router.delete("/delete-conversation/:id", deleteConversation)
router.patch("/toggle-pin-conversation/:id", togglePinConversation)

export default router