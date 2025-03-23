import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';

const ListItems = () => {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    fetchListItems();
  }, [id]);

  useEffect(() => {
    if (items.length > 0) {
      filterItems();
    }
  }, [searchTerm, items]);

  const fetchListItems = async () => {
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
        setFilteredItems(itemsRes.data.data);
      }
    } catch (error) {
      toast.error('Error fetching list items');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    if (!searchTerm) {
      setFilteredItems(items);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = items.filter(
      (item) =>
        (item.firstName && item.firstName.toLowerCase().includes(search)) ||
        (item.phone && item.phone.toLowerCase().includes(search)) ||
        (item.notes && item.notes.toLowerCase().includes(search)) ||
        (item.assignedTo &&
          item.assignedTo.name &&
          item.assignedTo.name.toLowerCase().includes(search))
    );

    setFilteredItems(filtered);
  };

  const getContactStatusBadge = (status) => {
    if (!status) return null;

    let bgColor = '';
    let textColor = '';

    switch (status) {
      case 'pending':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'contacted':
        bgColor = 'bg-indigo-100';
        textColor = 'text-indigo-800';
        break;
      case 'interested':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'not-interested':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'callback':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
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
  if (!list) return <div className="text-center py-8">List not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-purple-50 min-h-screen">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Link
          to={`/lists/${id}`}
          className="inline-flex items-center text-purple-600 hover:text-purple-800 transition duration-300"
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
          Back to List Details
        </Link>
      </motion.div>

      {/* Header & Search */}
      <motion.div
        className="mb-8 p-8 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl shadow-lg text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Items for {list.originalName || list.fileName}
        </h1>
        <p className="mt-2 text-purple-100">
          {filteredItems.length} of {items.length} items
        </p>
      </motion.div>

      {/* Search Bar */}
      <div className="mb-8">
        <motion.input
          type="text"
          placeholder="Search items..."
          className="w-full md:w-96 px-6 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          whileFocus={{ scale: 1.05 }}
        />
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-md border border-purple-200 overflow-hidden">
        {filteredItems.length === 0 ? (
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
            <p className="mt-4 text-gray-500">
              {items.length === 0
                ? 'No items found in this list'
                : 'No matching items found'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition duration-300"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <motion.tr
                    key={item._id}
                    className="hover:bg-purple-50 transition duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.firstName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getContactStatusBadge(item.contactStatus || 'pending')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.assignedTo ? item.assignedTo.name : 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {item.notes || '-'}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListItems;
