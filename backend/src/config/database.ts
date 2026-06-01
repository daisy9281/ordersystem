import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

    const options: mongoose.ConnectOptions = {
      authSource: 'admin',
    };

    const conn = await mongoose.connect(mongoUri, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Using database: ${conn.connection.name}`);

  } catch (error) {
    console.error(`Database connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};

const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};

export { connectDB, disconnectDB };
export default connectDB;