import mongoose from "mongoose"

const connectDB = async () => {
    try {

        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(conn.connection.name);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(error);
        console.error(error.message);
        console.error(error.cause);
    }
};

export default connectDB;