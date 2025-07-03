import { Request, Response } from 'express';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Not an admin.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET not found in environment variables');
        return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 