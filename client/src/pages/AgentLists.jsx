import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/common/Spinner';

const AgentLists = () => {
  const { agentId } = useParams();
  const [agent, setAgent] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUploadId, setActiveUploadId] = useState(null);

  useEffect(() => {
    const fetchAgentAndLists = async () => {
      try {
        setLoading(true);

        // Fetch agent details
        const agentResponse = await axios.get(`/api/agents/${agentId}`);
        setAgent(agentResponse.data.data || agentResponse.data);

        // Fetch agent's assigned items
        const itemsResponse = await axios.get(`/api/agents/${agentId}/items`);
        setLists(itemsResponse.data.data || itemsResponse.data);

        // Set first upload as active if lists exist
        const groupedLists = (itemsResponse.data.data || itemsResponse.data).reduce((acc, list) => {
          if (!acc[list.uploadId]) {
            acc[list.uploadId] = [];
          }
          acc[list.uploadId].push(list);
          return acc;
        }, {});

        const uploadIds = Object.keys(groupedLists);
        if (uploadIds.length > 0) {
          setActiveUploadId(uploadIds[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching agent and lists:', err);
        setError('Failed to load agent information and lists');
        toast.error('Failed to load agent information and lists');
        setLoading(false);
      }
    };

    fetchAgentAndLists();
  }, [agentId]);

  // Group lists by upload ID
  const groupedLists = lists.reduce((acc, list) => {
    if (!acc[list.uploadId]) {
      acc[list.uploadId] = [];
    }
    acc[list.uploadId].push(list);
    return acc;
  }, {});

  // Get unique upload IDs
  const uploadIds = Object.keys(groupedLists);

  if (loading) return <Spinner />;

  if (!agent) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Agent not found. The agent may have been deleted.
            </p>
            <p className="mt-2">
              <Link to="/agents" className="text-red-700 font-medium underline hover:text-red-800">
                Back to Agents
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Back Link and Agent Info */}
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
        <h1 className="text-2xl font-semibold mt-2 text-gray-800">Lists for {agent.name}</h1>
        <p className="text-gray-600">
          Email: {agent.email} | Mobile: {agent.mobile}
        </p>
      </div>

      {/* No Lists Message */}
      {uploadIds.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">No lists assigned to this agent yet.</p>
        </div>
      ) : (
        <>
          {/* Upload Tabs */}
          <div className="mb-6 border-b border-gray-200 overflow-x-auto">
            <ul className="flex flex-nowrap -mb-px">
              {uploadIds.map((uploadId) => (
                <li className="mr-2" key={uploadId}>
                  <button
                    className={`inline-block p-4 border-b-2 rounded-t-lg transition duration-300 ease-in-out transform ${
                      activeUploadId === uploadId
                        ? 'text-purple-600 border-purple-600 scale-105'
                        : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300 hover:scale-105'
                    }`}
                    onClick={() => setActiveUploadId(uploadId)}
                  >
                    Upload {uploadId.slice(-6)} ({groupedLists[uploadId].length} items)
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* List Items */}
<div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transition duration-300 hover:bg-purple-100">
            First Name
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transition duration-300 hover:bg-purple-100">
            Phone
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transition duration-300 hover:bg-purple-100">
            Notes
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transition duration-300 hover:bg-purple-100">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {activeUploadId &&
          groupedLists[activeUploadId].map((item) => (
            <tr
              key={item._id}
              className="hover:bg-purple-50 transition duration-300 transform hover:scale-105"
            >
              <td className="px-4 py-4 whitespace-nowrap transition duration-300 transform hover:scale-105">
                <div className="text-sm font-medium text-gray-900">{item.firstName}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap transition duration-300 transform hover:scale-105">
                <div className="text-sm text-gray-500">{item.phone}</div>
              </td>
              <td className="px-4 py-4 transition duration-300 transform hover:scale-105">
                <div className="text-sm text-gray-500">{item.notes}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap transition duration-300 transform hover:scale-105">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Assigned
                </span>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
</div>

        </>
      )}
    </div>
  );
};

export default AgentLists;
