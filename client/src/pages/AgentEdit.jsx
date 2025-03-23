import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/common/Spinner';

const AgentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agent, setAgent] = useState({
    name: '',
    email: '',
    mobile: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/agents/${id}`);
        const agentData = response.data.data || response.data;
        setAgent({
          name: agentData.name || '',
          email: agentData.email || '',
          mobile: agentData.mobile || '',
          status: agentData.status || 'active',
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching agent details:', err);
        toast.error('Failed to load agent details');
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};

    if (!agent.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!agent.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(agent.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (agent.mobile && !/^\d{10}$/.test(agent.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await axios.put(`/api/agents/${id}`, agent);
      toast.success('Agent updated successfully');
      navigate(`/agents/${id}`);
    } catch (err) {
      console.error('Error updating agent:', err);
      toast.error(err.response?.data?.message || 'Failed to update agent');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to={`/agents/${id}`}
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
          Back to Agent Details
        </Link>
        <h1 className="text-2xl font-semibold mt-2 text-gray-800">Edit Agent</h1>
      </div>

      {/* Form */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={agent.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-purple-300 focus:ring-purple-500'
                  } transition duration-300`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={agent.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-purple-300 focus:ring-purple-500'
                  } transition duration-300`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Mobile Field */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={agent.mobile}
                  onChange={handleChange}
                  placeholder="Optional"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.mobile
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-purple-300 focus:ring-purple-500'
                  } transition duration-300`}
                />
                {errors.mobile && <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>}
              </div>

              {/* Status Field */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={agent.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white transition duration-300"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4">
            <Link
              to={`/agents/${id}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 transition duration-300 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-md text-white transition duration-300 ${
                submitting
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50'
              }`}
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentEdit;
