import mongoose from "mongoose"
// This module initializes the connection between the backend server and the MongoDB database using Mongoose
export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); 
  }
};
// process.exit(1): This is very important. If the database fails to connect, the entire app is useless. exit(1) tells Node.js to shut down the server immediately so you can fix the connection issue.