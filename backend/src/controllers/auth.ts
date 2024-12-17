import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../model";
import { CONSTANTS } from "../constants";

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRESIN || "7d",
  });
};

export const registerOrLogin = async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;

  // Input Validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Check if user exists
    const _user = await User.findOne({ email }).select("+password").exec();

    if (_user) {
      // Verify password
      const isMatch = await bcrypt.compare(password, _user.password as string);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Generate token for existing user
      const token = signToken(_user._id.toString());
      return res.status(200).json({ token, email, id: _user._id });
    }

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, CONSTANTS.SALT || 10);
    const newUser = await User.create({ email, password: hashedPassword });

    // Generate token for new user
    const token = signToken(newUser._id.toString());
    return res.status(201).json({ token, email: newUser.email, id: newUser._id });
  } catch (error) {
    console.error("Error in registerOrLogin:", error);
    return res.status(500).json({
      error: "An error occurred while processing your request",
    });
  }
};
