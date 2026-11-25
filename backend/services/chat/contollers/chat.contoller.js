import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"


export const createConversations = async (req,res)=>{
    try {
        const userId=req.headers["x-user-id"]
        console.log("userId : ",userId)
        const conversation=await Conversation.create({
            userId:userId
        }) 

        return res.status(200).json(conversation)
    } catch (error) {
        return res.status(500).json({Message:`Create conversation error in chat.controller.js ${error}`})
    }
}
export const getConversations = async (req,res)=>{
    try {
        const userId=req.headers["x-user-id"]
        console.log("userId : ",userId)
        const conversation=await Conversation.find({
            userId:userId
        }).sort({updatedAt:-1})

        return res.status(200).json(conversation)
    } catch (error) {
        return res.status(500).json({Message:`Get conversation error in chat.controller.js ${error}`})
    }
}

export const updateConversation = async (req,res)=>{
    try {
        const { id, title, isPinned } = req.body;
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (isPinned !== undefined) updateData.isPinned = isPinned;

        const conversation = await Conversation.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        return res.status(200).json(conversation)
    } catch (error) {
        return res.status(500).json({Message:`update conversation error in chat.controller.js ${error}`})
    }
}

export const saveMessage=async (req,res)=>{
    try {
        const {conversationId,role,content,images,artifacts}=req.body
        const message=await Message.create({
            conversationId,
            content,
            role,
            images,
            artifacts
        })
        return res.status(200).json(message)
    } catch (error) {
        return res.status(500).json({Message:`Save Message  error in chat.controller.js ${error}`})
    }
}

export const getMessage = async (req,res)=>{
    try {
       
        const messages=await Message.find({
            conversationId:req.params.conversationId
        })
        return res.status(200).json(messages)
    } catch (error) {
        return res.status(500).json({Message:`Get Message  error in chat.controller.js ${error}`})
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndDelete(id);
        return res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        return res.status(500).json({ Message: `Delete Message error in chat.controller.js ${error}` });
    }
}

export const togglePinMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ Message: "Message not found" });
        }
        message.isPinned = !message.isPinned;
        await message.save();
        return res.status(200).json(message);
    } catch (error) {
        return res.status(500).json({ Message: `Toggle Pin error in chat.controller.js ${error}` });
    }
}

export const deleteConversation = async (req, res) => {
    try {
        const { id } = req.params;
        await Conversation.findByIdAndDelete(id);
        await Message.deleteMany({ conversationId: id });
        return res.status(200).json({ message: "Conversation and messages deleted successfully" });
    } catch (error) {
        return res.status(500).json({ Message: `Delete conversation error in chat.controller.js ${error}` });
    }
}

export const togglePinConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ Message: "Conversation not found" });
        }
        conversation.isPinned = !conversation.isPinned;
        await conversation.save();
        return res.status(200).json(conversation);
    } catch (error) {
        return res.status(500).json({ Message: `Toggle Pin Conversation error in chat.controller.js ${error}` });
    }
}