import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/common/Spinner';

const ListDetail = () => {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListDetails();
  }, [id]);

  const fetchListDetails = async () => {
    setLoading(true);
    try {
      const [listRes, itemsRes] = await Promise.all([
        axios.get(`/api/lists/${id}`),
        axios.get(`/api/lists/${id}/items`),
      ]);

      if (listRes.data.success) {
        setList(listRes.data.data);
      }

      if (itemsRes.data.success) {
        setItems(itemsRes.data.data);
      }
    } catch (error) {
      toast.error('Error fetching list details');
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
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor} transition-all duration-300`}
      >
        {status}
      </span>
    );
  };

  if (loading) return <Spinner />;
  if (!list) return <div className="text-center py-8">List not found</div>;

  // Group items by agent
  const itemsByAgent = {};
  items.forEach((item) => {
    const agentId = item.assignedTo ? item.assignedTo._id : 'unassigned';
    const agentName = item.assignedTo ? item.assignedTo.name : 'Unassigned';

    if (!itemsByAgent[agentId]) {
      itemsByAgent[agentId] = {
        agent: agentName,
        items: [],
      };
    }

    itemsByAgent[agentId].items.push(item);
  });

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-purple-600 to-indigo-700 min-h-screen">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/lists"
          className="inline-flex items-center text-black-900 hover:text-white transition duration-300 transform hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Lists
        </Link>
      </div>

      {/* List Details Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
        <div className="p-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-3xl font-bold text-purple-800 transition-all duration-300 hover:text-purple-600">
              {list.originalName || list.fileName}
            </h1>
            {getStatusBadge(list.status)}
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-r border-gray-200 pr-6">
            <p className="text-sm text-gray-500">Uploaded</p>
            <p className="font-medium text-gray-800">{formatDate(list.createdAt)}</p>
          </div>

          <div className="border-r border-gray-200 pr-6">
            <p className="text-sm text-gray-500">Total Items</p>
            <p className="font-medium text-gray-800">{list.itemCount}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Uploaded By</p>
            <p className="font-medium text-gray-800">
              {list.uploadedBy ? list.uploadedBy.name : 'Unknown'}
            </p>
            <p className="text-xs text-gray-500">
              {list.uploadedBy ? list.uploadedBy.email : ''}
            </p>
          </div>
        </div>

        {list.notes && (
          <div className="p-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">Notes</p>
            <p className="text-gray-800">{list.notes}</p>
          </div>
        )}
      </div>

      {/* Distribution Summary */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-black-900 mb-6 transition-all duration-300 transform hover:scale-105 hover:text-purple-600">
          Item Distribution
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(itemsByAgent).map((agentId) => (
            <div
              key={agentId}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-xl hover:bg-purple-50 transition-all duration-300 transform hover:scale-105"
            >
              <div className="font-medium text-purple-800 mb-2">
                {itemsByAgent[agentId].agent}
              </div>
              <div className="text-3xl font-bold text-black-600">
                {itemsByAgent[agentId].items.length}
              </div>
              <div className="text-sm text-gray-900 mt-1">assigned items</div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Items Button */}
      <div className="flex justify-center">
  <Link
    to={`/lists/${list._id}/items`}
    className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 hover:shadow-lg transition-transform duration-300 transform hover:scale-110 hover:rotate-2"
  >
    View All List Items
  </Link>
</div>

    </div>
  );
};

export default ListDetail;
