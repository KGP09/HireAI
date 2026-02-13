import mongoose from "mongoose";

export const Db = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI,{ family: 4 });
    console.log("connected to DB");
  } catch (err) {
    console.log(err);
  }
};
