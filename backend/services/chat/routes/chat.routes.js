import express from "express"
import { createConversations, getConversations, getMessage, saveMessage, updateConversation } from "../contollers/chat.contoller.js"

const router = express.Router()

router.get("/create-conversation",createConversations)
router.get("/get-conversation",getConversations)
router.post("/update-conversation",updateConversation)
router.post("/save-message",saveMessage)
router.get("/get-messages/:conversationId",getMessage)

export default router 