import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/common/Spinner';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  const { name, email, mobile, password } = formData;

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents');
      setAgents(res.data.data);
    } catch (err) {
      toast.error('Error fetching agents');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await axios.post('/api/agents', formData);
      toast.success('Agent added successfully');
      setFormData({
        name: '',
        email: '',
        mobile: '',
        password: '',
      });
      setShowForm(false);
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding agent');
    } finally {
      setFormLoading(false);
    }
  };

  const deleteAgent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      await axios.delete(`/api/agents/${id}`);
      toast.success('Agent deleted successfully');
      fetchAgents();
    } catch (err) {
      toast.error('Error deleting agent');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header and Add Agent Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        {/* Animated Agent Title */}
        <h1 className="text-2xl font-semibold text-gray-900 animate__animated animate__fadeInLeft animate__delay-1s">
          Agents
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {showForm ? 'Cancel' : 'Add New Agent'}
        </button>
      </div>

      {/* Add Agent Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-purple-200 mb-8 animate__animated animate__fadeIn">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Add New Agent</h2>
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile (with country code)
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={mobile}
                  onChange={onChange}
                  required
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  minLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={formLoading}
                className={`px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  formLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {formLoading ? 'Adding...' : 'Add Agent'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Agents List */}
      {agents.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-purple-200 text-center animate__animated animate__fadeIn">
          <p className="text-gray-500">No agents found. Add your first agent to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg border border-purple-200 overflow-hidden animate__animated animate__fadeIn">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr
                    key={agent._id}
                    className="hover:bg-purple-100 transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{agent.email}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{agent.mobile}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteAgent(agent._id)}
                        className="text-red-600 hover:text-red-800 mr-4 transition-all duration-300 ease-in-out"
                      >
                        Delete
                      </button>
                      <Link
                        to={`/agent-lists/${agent._id}`}
                        className="text-purple-600 hover:text-purple-800 transition-all duration-300 ease-in-out"
                      >
                        View Lists
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
