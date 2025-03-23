import Agent from '../models/Agent';
import ListItem from '../models/ListItem';
import UploadRecord from '../models/UploadRecord';

const distributeItems = async (items, fileName) => {
  const agents = await Agent.find().sort({ _id: 1 });
  
  if (agents.length < 5) {
    throw new Error('Need at least 5 agents for distribution');
  }
  
  const uploadRecord = await UploadRecord.create({
    fileName,
    totalItems: items.length,
    status: 'completed'
  });
  
  const uploadId = uploadRecord._id;
  
  const distribution = distributeItemsAmongAgents(items, agents);
  
  const savedItems = [];
  for (const agentId in distribution) {
    const agentItems = distribution[agentId].map(item => ({
      ...item,
      agentId,
      uploadId
    }));
    
    const savedAgentItems = await ListItem.insertMany(agentItems);
    savedItems.push(...savedAgentItems);
  }
  
  return {
    uploadId,
    totalItems: items.length,
    distributedItems: savedItems.length,
    agentCounts: Object.keys(distribution).map(agentId => ({
      agentId,
      count: distribution[agentId].length
    }))
  };
};

const distributeItemsAmongAgents = (items, agents) => {
  const distribution = {};
  const agentCount = agents.length;
  
  agents.forEach(agent => {
    distribution[agent._id] = [];
  });
  
  const itemsPerAgent = Math.floor(items.length / agentCount);
  const remainder = items.length % agentCount;
  
  let currentIndex = 0;
  
  for (let i = 0; i < agentCount; i++) {
    const agent = agents[i];
    const agentItems = items.slice(currentIndex, currentIndex + itemsPerAgent);
    distribution[agent._id] = agentItems;
    currentIndex += itemsPerAgent;
  }
  
  for (let i = 0; i < remainder; i++) {
    const agent = agents[i];
    distribution[agent._id].push(items[currentIndex]);
    currentIndex++;
  }
  
  return distribution;
};

const getAgentItems = async (agentId) => {
  return await ListItem.find({ agentId }).sort({ createdAt: -1 });
};

const getAllUploads = async () => {
  return await UploadRecord.find().sort({ createdAt: -1 });
};

module.exports = {
  distributeItems,
  getAgentItems,
  getAllUploads
};
