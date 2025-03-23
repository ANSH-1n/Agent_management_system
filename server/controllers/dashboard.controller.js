import Agent from '../models/Agent.js';
import UploadRecord from '../models/UploadRecord.js';
import ListItem from '../models/ListItem.js';
import asyncHandler from 'express-async-handler';

const getDashboardStats = asyncHandler(async (req, res) => {
  const [agentCount, uploadCount, listItemCount] = await Promise.all([
    Agent.countDocuments(),
    UploadRecord.countDocuments(),
    ListItem.countDocuments()
  ]);
  
  res.json({
    success: true,
    data: {
      agentCount,
      uploadCount,
      listItemCount
    }
  });
});

module.exports = {
  getDashboardStats
};
