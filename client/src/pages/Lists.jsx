import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/common/Spinner';

const Lists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await axios.get('/api/lists');
      if (response.data.success) {
        setLists(response.data.data);
      }
    } catch (error) {
      toast.error('Error fetching lists data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Generate status badge based on status
  const getStatusBadge = (status) => {
    let bgColor = '';
    let textColor = '';

    switch (status) {
      case 'processed':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'distributing':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'complete':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'failed':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}
      >
        {status}
      </span>
    );
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-r from-purple-600  min-h-screen">
      {/* Header with Animation */}
      <div className="mb-8 p-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl shadow-lg text-white animate__animated animate__fadeIn">
        <h1 className="text-3xl font-bold tracking-tight text-white animate__animated animate__fadeIn animate__delay-1s">
          Lists
        </h1>
        <p className="mt-2 text-purple-100 animate__animated animate__fadeIn animate__delay-2s">
          Manage all uploaded lists and their distribution
        </p>
      </div>

      {/* Upload Button */}
      <div className="mb-8">
        <Link
          to="/upload-list"
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 hover:shadow-lg transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Upload New List
        </Link>
      </div>

      {/* Lists Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {lists.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-gray-500">No lists have been uploaded yet</p>
            <Link
              to="/upload-list"
              className="mt-4 inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition duration-300"
            >
              Upload Your First List
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lists.map((list) => (
                  <tr
                    key={list._id}
                    className="hover:bg-purple-100 transition duration-200 ease-in-out transform hover:scale-105"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {list.originalName || list.fileName}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(list.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{list.itemCount}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {getStatusBadge(list.status)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {list.uploadedBy ? list.uploadedBy.name : 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {list.uploadedBy ? list.uploadedBy.email : ''}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/lists/${list._id}`}
                        className="text-purple-600 hover:text-purple-900 mr-4 transition duration-300"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/lists/${list._id}/items`}
                        className="text-indigo-600 hover:text-indigo-900 transition duration-300"
                      >
                        View Items
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lists;
