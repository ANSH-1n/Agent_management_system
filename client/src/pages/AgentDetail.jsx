import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/common/Spinner';

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/agents/${id}`);
        setAgent(response.data.data || response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching agent details:', err);
        setError('Failed to load agent details');
        toast.error('Failed to load agent details');
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [id]);

  const handleViewLists = () => {
    navigate(`/agent-lists/${id}`);
  };

  if (loading) return <Spinner />;

  if (error || !agent) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error || 'Agent not found. The agent may have been deleted.'}
            </p>
            <p className="mt-2">
              <Link to="/agents" className="text-red-700 font-medium underline">
                Back to Agents
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link
          to="/agents"
          className="inline-flex items-center text-purple-600 hover:text-purple-800 transition duration-300"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Agents
        </Link>
        <h1 className="text-2xl font-semibold mt-2 text-gray-800">Agent Details</h1>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Agent Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{agent.name}</h2>
              <p className="text-gray-600 mt-1">{agent.email}</p>
              {agent.mobile && <p className="text-gray-600">{agent.mobile}</p>}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleViewLists}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105"
              >
                View Lists
              </button>
              <Link
                to={`/agents/edit/${id}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Agent Information */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Agent Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Name</span>
                <p className="mt-1 text-gray-800">{agent.name}</p>
              </div>
              
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Email Address</span>
                <p className="mt-1 text-gray-800">{agent.email}</p>
              </div>
              
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Mobile Number</span>
                <p className="mt-1 text-gray-800">{agent.mobile || 'Not provided'}</p>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <p className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    agent.status === 'active' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {agent.status ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1) : 'Unknown'}
                  </span>
                </p>
              </div>
              
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Created On</span>
                <p className="mt-1 text-gray-800">
                  {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                <p className="mt-1 text-gray-800">
                  {agent.updatedAt ? new Date(agent.updatedAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lists & Assignments */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Lists & Assignments</h3>
          <button
            onClick={handleViewLists}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            View Agent's Lists
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;
