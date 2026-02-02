import { generateToken } from "../utils/jwt.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
// import cloudinary from "../utils/cloudinary.js";
export const signup = async (req, res) => {
  const { username, email, password, role } = req.body;
  console.log("Signup Data :", username, email, password, role);
  try {
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        message: "Inavlid Credentials",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters!",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await new User({
      username,
      email,
      password: hashPassword,
      role,
    });
    if (newUser) {
      const token = generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        mail: newUser.email,
        profilePic: newUser.profilePic,
        role: newUser.role,
        token,
      });
    } else {
      res.status(400).json({
        message: "Invalid User Data",
      });
    }
  } catch (error) {
    console.log("Signup Error :", error);
    res.status(500).json({
      message: "Internal Server Error!",
    });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials!",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid Credentials!",
      });
    }
    const token = generateToken(user._id, res);
    console.log(token);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      mail: user.email,
      profilePic: user.profilePic,
      token,
    });
  } catch (error) {
    console.log();
    console.log("Login Error :", error);
    return res.status(500).json({
      message: "Internal Error!",
    });
  }
};
// export const logout = (req, res) => {
//   try {
//     console.log("Logout Request Received");

//     // 👇 Clear the correct cookie
//     res.cookie("token", "", {
//       httpOnly: true,
//       sameSite: "lax",
//       secure: process.env.NODE_ENV === "production",
//       expires: new Date(0), // forces immediate expiry
//     });

//     res.status(200).json({
//       message: "Logout Successful!",
//     });
//   } catch (error) {
//     console.log("Logout Error:", error);
//     res.status(500).json({
//       message: "Internal Error!",
//     });
//   }
// };
export const logout = (req, res) => {
  try {
    console.log("Logout Request Received");

    res.cookie("token", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0), // forces immediate expiry
    });

    res.status(200).json({
      message: "Logout Successful!",
    });
  } catch (error) {
    console.log("Logout Error:", error);
    res.status(500).json({
      message: "Internal Error!",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is mandatory!" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "profiles",
      transformation: [{ width: 300, height: 300, crop: "fill" }],
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Profile updated successfully!", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
};

export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in Auth!");
    req.status(500).json({
      message: "Internal Error!",
    });
  }
};