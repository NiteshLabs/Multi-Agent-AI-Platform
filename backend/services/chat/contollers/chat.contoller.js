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
        console.log(req.body);   // <-- add this
        const {id,title}=req.body
    //     const conversation=await Conversation.findByIdAndUpdate(id,{
    //         title
    //     },
    // {

    // })
    const conversation = await Conversation.findByIdAndUpdate(
            id,
            { title },
            { new: true }
        );

         console.log(conversation);   // <-- add this
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