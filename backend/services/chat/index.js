import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import router from "./routes/chat.routes.js";

dotenv.config();

console.log(process.env.MONGODB_URL);


const port = process.env.PORT

const app = express()
app.use(express.json())
app.use("/",router)
app.get("/", (req, res) => {
    res.json({ message: "hello from chat" })
})
app.listen(port, () => {
    console.log(`Chat started at ${port}`)
    connectDB()

}) 