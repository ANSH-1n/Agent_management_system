import asyncHandler from 'express-async-handler';
import Agent from '../models/Agent.js';
import ListItem from '../models/ListItem.js';

const createAgent = asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;

  const agentExists = await Agent.findOne({ email });

  if (agentExists) {
    res.status(400);
    throw new Error('Agent already exists');
  }

  const agent = await Agent.create({
    name,
    email,
    mobile,
    password,
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      status: agent.status,
    },
  });
});

const getAgents = asyncHandler(async (req, res) => {
  const agents = await Agent.find({})
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: agents.length,
    data: agents,
  });
});

const getAgentById = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id)
    .select('-password')
    .populate({
      path: 'assignedItems',
      select: 'firstName phone notes status',
    });

  if (!agent) {
    res.status(404);
    throw new Error('Agent not found');
  }

  res.status(200).json({
    success: true,
    data: agent,
  });
});

const updateAgent = asyncHandler(async (req, res) => {
  let agent = await Agent.findById(req.params.id);

  if (!agent) {
    res.status(404);
    throw new Error('Agent not found');
  }

  const { name, email, mobile, status, password } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (mobile) updateData.mobile = mobile;
  if (status) updateData.status = status;

  if (password) {
    agent.password = password;
    await agent.save();
  }

  if (Object.keys(updateData).length > 0) {
    agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
  }

  res.status(200).json({
    success: true,
    data: agent,
  });
});

const deleteAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    res.status(404);
    throw new Error('Agent not found');
  }

  await ListItem.updateMany(
    { assignedTo: agent._id },
    { $unset: { assignedTo: "" } }
  );

  await agent.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

const getAgentItems = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    res.status(404);
    throw new Error('Agent not found');
  }

  const items = await ListItem.find({ assignedTo: agent._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

export {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  getAgentItems,
};
