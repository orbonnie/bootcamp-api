import mongoose from 'mongoose';
import chalk from 'chalk';

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

const connectDB = async () => {
  const conn = await mongoose.connect(MONGO_URI);
  console.log(
    chalk.cyan.underline.bold(`MongoDB connected ${conn.connection.host}`),
  );
};

export default connectDB;
