import mongoose from "mongoose";
const fileSchema=new mongoose.Schema({
    name:String,
    content:String
},{
    _id:false
})
const artifactSchema=new mongoose.Schema({
    id:Number,
    type:String,
    title:String,
    url:String, // signed link for file artifacts (e.g. type "pdf")
    files:[fileSchema]
},{
    _id:false
})
const messageSchema=new mongoose.Schema({
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation"

    },
    role:{
        type:String,
        enum:["user","assistant"]
    },
    content:String,
    images:[String],
    artifacts :[artifactSchema],
    isPinned: {
        type: Boolean,
        default: false
    }
},{
    timestamps:true
})

const Message = mongoose.model("message",messageSchema)

export default Message