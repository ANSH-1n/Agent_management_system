import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';

// Reusable Warning Banner Component
const WarningBanner = ({ message }) => (
  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg shadow-md">
    <div className="flex items-center">
      <svg
        className="h-5 w-5 text-yellow-500 mr-3"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-yellow-700">{message}</p>
    </div>
  </div>
);

// Reusable Upload Form Component
const UploadForm = ({ file, fileName, onChange, onSubmit, uploadLoading, agents }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg border border-purple-200 mb-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h2 className="text-2xl font-medium text-gray-800 mb-4">Upload New List</h2>
    <form onSubmit={onSubmit}>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File (CSV, XLS, XLSX)
        </label>
        <div className="flex items-center">
          <label className="cursor-pointer bg-white border border-purple-500 text-purple-600 rounded-md px-3 py-2 shadow-sm text-sm font-medium hover:bg-purple-100 focus:outline-none transition duration-300">
            Browse
            <input
              type="file"
              className="sr-only"
              onChange={onChange}
              accept=".csv,.xls,.xlsx"
              aria-label="Choose file"
            />
          </label>
          <span className="ml-3 text-sm text-gray-500">{fileName}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          File should contain columns: FirstName, Phone, Notes
        </p>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={uploadLoading || agents.length < 5}
          className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-300 ${
            uploadLoading || agents.length < 5 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploadLoading ? 'Uploading...' : 'Upload & Distribute'}
        </button>
      </div>
    </form>
  </motion.div>
);

// Reusable Upload History Table Component with hover effect
const UploadHistoryTable = ({ uploads, handleDownload }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-purple-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            File Name
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {uploads.map((upload) => (
          <motion.tr
            key={upload._id}
            className="hover:bg-purple-50 transition duration-300"
            whileHover={{ scale: 1.03 }}
          >
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {new Date(upload.createdAt).toLocaleString()}
              </div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{upload.fileName}</div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {upload.status}
              </span>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleDownload(upload._id)}
                className="text-purple-600 hover:text-purple-900 transition duration-300"
                aria-label={`Download ${upload.fileName}`}
              >
                Download
              </button>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
);

const UploadList = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('Choose File');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
    fetchUploads();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents');
      setAgents(res.data.data);
    } catch (err) {
      toast.error('Error fetching agents');
    } finally {
      setAgentsLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/lists/download/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `download-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    } catch (err) {
      toast.error('Error downloading file');
      console.error(err);
    }
  };

  const fetchUploads = async () => {
    try {
      const res = await axios.get('/api/lists/uploads');
      setUploads(res.data.data);
    } catch (err) {
      toast.error('Error fetching upload history');
    } finally {
      setUploadsLoading(false);
    }
  };

  const onChange = (e) => {
    const fileSelected = e.target.files[0];
    if (!fileSelected) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const fileType = fileSelected.type;

    if (!validTypes.includes(fileType)) {
      toast.error('Please upload only CSV, XLS, or XLSX files');
      return;
    }

    setFile(fileSelected);
    setFileName(fileSelected.name);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (agents.length < 5) {
      toast.error('You need at least 5 agents to distribute lists');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadLoading(true);

    try {
      const res = await axios.post('/api/lists/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('File uploaded and lists distributed successfully');
      setFileName('Choose File');
      setFile(null);
      fetchUploads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading file');
    } finally {
      setUploadLoading(false);
    }
  };

  if (agentsLoading || uploadsLoading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with Zigzag Animation */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        <h1 className="text-3xl font-semibold text-gray-800">Upload and Distribute Lists</h1>
        <motion.p
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeInOut' }}
          className="text-gray-600 mt-2"
        >
          Upload a CSV file to distribute tasks among your agents.
        </motion.p>
      </motion.div>

      {/* Warning for insufficient agents */}
      {agents.length < 5 && (
        <WarningBanner message={`You need at least 5 agents to distribute lists. Currently, you have ${agents.length} agents.`} />
      )}

      {/* Upload Form */}
      <UploadForm
        file={file}
        fileName={fileName}
        onChange={onChange}
        onSubmit={onSubmit}
        uploadLoading={uploadLoading}
        agents={agents}
      />

      {/* Upload History */}
      <div className="bg-white rounded-lg shadow-lg border border-purple-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-purple-100">
          <h2 className="text-xl font-medium text-gray-800">Upload History</h2>
        </div>
        {uploads.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              No uploads found. Upload your first file to get started.
            </p>
          </div>
        ) : (
          <UploadHistoryTable uploads={uploads} handleDownload={handleDownload} />
        )}
      </div>
    </div>
  );
};

export default UploadList;
