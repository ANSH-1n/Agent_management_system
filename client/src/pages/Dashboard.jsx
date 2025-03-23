import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../components/common/Spinner";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { agentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    agents: 0,
    lists: 0,
    items: 0,
    recentAgents: [],
    recentLists: [],
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const agentsRes = await axios.get("/api/agents");
      const listsRes = await axios.get("/api/lists");

      let totalItems = 0;
      listsRes.data.data.forEach((list) => {
        totalItems += list.itemCount || 0;
      });

      setStats({
        agents: agentsRes.data.count,
        lists: listsRes.data.count,
        items: totalItems,
        recentAgents: agentsRes.data.data.slice(0, 5),
        recentLists: listsRes.data.data.slice(0, 5),
      });
    } catch (error) {
      toast.error("Error fetching dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop().toLowerCase();
      if (["csv", "xlsx", "xls"].includes(fileExt)) {
        setFile(selectedFile);
      } else {
        toast.error("Please upload only CSV, XLSX, or XLS files");
        e.target.value = null;
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await axios.post("/api/lists/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("File uploaded and distributed successfully");
        setFile(null);
        fetchDashboardData();
        document.getElementById("fileUpload").value = "";
      } else {
        toast.error(response.data.message || "Upload failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error uploading file");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const navigateToWhatsApp = () => {
    navigate("/connect-socials");
  };

  if (loading) return <Spinner />;
//  from-[#4B1B6D] to-[#9B4D9B] 
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900   min-h-screen">

      {/* Header */}
      <div className="mb-8 p-8 bg-gradient-to-r from-[#4B1B6D] to-[#9B4D9B] rounded-2xl shadow-xl text-white transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] animate-[fadeIn_0.5s_ease-in-out]">

        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-black-800">
          Welcome back, <span className="font-semibold">{user?.name || "Admin"}</span>
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/agents"
          className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-pink-200 hover:border-pink-300 group transform hover:-translate-y-1 hover:rotate-1 animate-[fadeIn_0.6s_ease-in-out]"
        >
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-all duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-pink-700 transition-colors duration-300">Agents</h2>
              <p className="text-sm text-gray-500">Manage your agents</p>
            </div>
          </div>
        </Link>

        <Link
          to="/lists"
          className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-pink-200 hover:border-pink-300 group transform hover:-translate-y-1 hover:rotate-1 animate-[fadeIn_0.7s_ease-in-out]"
        >
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-all duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-pink-600"
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
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-pink-700 transition-colors duration-300">Lists</h2>
              <p className="text-sm text-gray-500">Manage your lists</p>
            </div>
          </div>
        </Link>

        <button
          onClick={navigateToWhatsApp}
          className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-pink-200 hover:border-pink-300 group transform hover:-translate-y-1 hover:rotate-1 animate-[fadeIn_0.8s_ease-in-out]"
        >
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-all duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-pink-700 transition-colors duration-300">Connect Socials</h2>
              <p className="text-sm text-gray-500">Integrate WhatsApp</p>
            </div>
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Agents */}
        <div className="p-6 bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 border border-pink-200 transform hover:scale-[1.03] hover:-rotate-1 animate-[fadeIn_0.9s_ease-in-out]">
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-xl shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-800">Total Agents</h2>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-fuchsia-600 animate-pulse">{stats.agents}</p>
            </div>
          </div>
        </div>

        {/* Total Lists */}
        <div className="p-6 bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 border border-pink-200 transform hover:scale-[1.03] hover:-rotate-1 animate-[fadeIn_1s_ease-in-out]">
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-xl shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-pink-600"
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
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-800">Total Lists</h2>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-fuchsia-600 animate-pulse">{stats.lists}</p>
            </div>
          </div>
        </div>

        {/* Total Entries */}
        <div className="p-6 bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 border border-pink-200 transform hover:scale-[1.03] hover:-rotate-1 animate-[fadeIn_1.1s_ease-in-out]">
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-xl shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-800">Total Entries</h2>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-fuchsia-600 animate-pulse">{stats.items}</p>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white/80 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 border border-pink-200 mb-8 backdrop-blur-sm animate-[fadeIn_1.2s_ease-in-out]">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Upload New List</h3>
        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-grow">
            <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700 mb-2">
              Choose CSV or Excel file
            </label>
            <div className="relative">
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-3 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-pink-50 file:text-pink-700
                  hover:file:bg-pink-100 file:transition-colors
                  file:duration-300 file:cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-pink-300
                  border border-gray-200 rounded-lg"
                accept=".csv,.xlsx,.xls"
              />
              {file && (
                <div className="mt-2 text-sm text-pink-600 font-medium">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={!file || uploading}
            className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-500 ${
              !file || uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
            }`}
          >
            {uploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload & Distribute"
            )}
          </button>
        </form>
      </div>

      {/* Recent Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Agents */}
        <div className="bg-gradient-to-br from-white to-pink-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 border border-pink-200 backdrop-blur-sm animate-[fadeIn_1.3s_ease-in-out]">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-pink-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Recent Agents
          </h3>
          {stats.recentAgents.length === 0 ? (
            <div className="text-center py-8 bg-white/60 rounded-lg">
              <p className="text-gray-500">No agents added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentAgents.map((agent, index) => (
                <div 
                  key={agent._id} 
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:bg-pink-50 border border-transparent hover:border-pink-200 transform hover:scale-[1.02] animate-[slideIn_0.5s_ease-in-out]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div>
                    <p className="font-medium text-gray-800">{agent.name}</p>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                  </div>
                  <Link
                    to={`/agents/${agent._id}`}
                    className="px-3 py-1 text-sm text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 rounded-full transition-colors duration-300"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Lists */}
        <div className="bg-gradient-to-br from-white to-pink-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 border border-pink-200 backdrop-blur-sm animate-[fadeIn_1.4s_ease-in-out]">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-pink-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Recent Lists
          </h3>
          {stats.recentLists.length === 0 ? (
            <div className="text-center py-8 bg-white/60 rounded-lg">
              <p className="text-gray-500">No lists uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentLists.map((list, index) => (
                <div 
                  key={list._id} 
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:bg-pink-50 border border-transparent hover:border-pink-200 transform hover:scale-[1.02] animate-[slideIn_0.5s_ease-in-out]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div>
                    <p className="font-medium text-gray-800">{list.originalName || list.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {list.itemCount || list.totalItems} items •{" "}
                      {new Date(list.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/lists/${list._id}`}
                    className="px-3 py-1 text-sm text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 rounded-full transition-colors duration-300"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0% { opacity: 0.9; }
          50% { opacity: 1; }
          100% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;









