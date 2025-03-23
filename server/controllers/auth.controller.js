import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, mobile } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  let formattedMobile = mobile;
  if (!formattedMobile.startsWith('+91')) {
    formattedMobile = `+91${formattedMobile}`;
  }

  const user = await User.create({
    name,
    email,
    password,
    mobile: formattedMobile,
    role: 'admin',
  });

  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export { login, getMe, registerAdmin };
