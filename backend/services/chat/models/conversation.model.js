import mongoose from "mongoose";

const conversationSchema=new mongoose.Schema({
    title:{
        type:String,
        default:"New Chat"
    },
    userId:{
        type:String
    },
    isPinned:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const Conversation=mongoose.model("Conversation",conversationSchema)

export default Conversation
