import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../components/common/Spinner";
import { useAuth } from "../context/AuthContext";

const ConnectSocials = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [whatsAppStatus, setWhatsAppStatus] = useState("disconnected"); // disconnected, connecting, connected
  const [connectionError, setConnectionError] = useState("");
  
  const [formData, setFormData] = useState({
    agentId: "",
    listId: "",
    message: "Hello, here's your data file.",
  });

  useEffect(() => {
    fetchData();
    checkWhatsAppStatus();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get agents
      const agentsRes = await axios.get("/api/agents");
      
      // Get lists
      const listsRes = await axios.get("/api/lists");
      
      setAgents(agentsRes.data.data);
      setLists(listsRes.data.data);
    } catch (error) {
      toast.error("Error fetching data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkWhatsAppStatus = async () => {
    try {
      const response = await axios.get("/api/whatsapp/status");
      setWhatsAppStatus(response.data.status);
    } catch (error) {
      console.error("Failed to get WhatsApp status:", error);
      setWhatsAppStatus("disconnected");
    }
  };

  const connectWhatsApp = async () => {
    try {
      setConnectionError("");
      setWhatsAppStatus("connecting");
      
      const response = await axios.post("/api/whatsapp/connect");
      
      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
        
        // Poll for connection status
        const interval = setInterval(async () => {
          try {
            const statusRes = await axios.get("/api/whatsapp/status");
            if (statusRes.data.status === "connected") {
              clearInterval(interval);
              setWhatsAppStatus("connected");
              setQrCode("");
              toast.success("WhatsApp connected successfully!");
            }
          } catch (pollError) {
            console.error("Polling error:", pollError);
          }
        }, 5000);
        
        // Clear interval after 2 minutes if not connected
        setTimeout(() => {
          clearInterval(interval);
          if (whatsAppStatus !== "connected") {
            setWhatsAppStatus("disconnected");
            toast.error("WhatsApp connection timed out. Please try again.");
          }
        }, 120000);
      } else if (response.data.status === "connected") {
        setWhatsAppStatus("connected");
        toast.success("Already connected to WhatsApp!");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error connecting to WhatsApp";
      setConnectionError(errorMessage);
      toast.error(errorMessage);
      setWhatsAppStatus("disconnected");
      console.error("Connection error:", error);
    }
  };
  
  const disconnectWhatsApp = async () => {
    try {
      await axios.post("/api/whatsapp/disconnect");
      setWhatsAppStatus("disconnected");
      setQrCode("");
      toast.success("WhatsApp disconnected successfully");
    } catch (error) {
      toast.error("Error disconnecting WhatsApp");
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agentId || !formData.listId) {
      toast.error("Please select an agent and a list");
      return;
    }
    
    setSending(true);
    
    try {
      const response = await axios.post("/api/whatsapp/send", formData);
      
      if (response.data.success) {
        toast.success("Data sent successfully to agent via WhatsApp");
        setFormData({
          ...formData,
          message: "Hello, here's your data file.",
        });
      } else {
        toast.error(response.data.message || "Failed to send data");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending data");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Connect Socials</h1>
        <p className="text-gray-600 mt-1">
          Send data to agents via WhatsApp
        </p>
      </div>

      {/* WhatsApp Connection */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">WhatsApp Connection</h3>
        
        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            whatsAppStatus === "connected" ? "bg-green-500" : 
            whatsAppStatus === "connecting" ? "bg-yellow-500" : "bg-red-500"
          }`}></div>
          <span className="text-gray-700">
            Status: <span className="font-medium capitalize">{whatsAppStatus}</span>
          </span>
        </div>
        
        {connectionError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            <p className="text-sm">{connectionError}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-3">
          {whatsAppStatus !== "connected" && (
            <button
              onClick={connectWhatsApp}
              disabled={whatsAppStatus === "connecting"}
              className={`px-4 py-2 rounded-md text-white font-medium transition duration-300 ${
                whatsAppStatus === "connecting" 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {whatsAppStatus === "connecting" ? (
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
                  Connecting...
                </>
              ) : (
                "Connect WhatsApp"
              )}
            </button>
          )}
          
          {whatsAppStatus === "connected" && (
            <button
              onClick={disconnectWhatsApp}
              className="px-4 py-2 rounded-md text-white font-medium transition duration-300 bg-red-600 hover:bg-red-700"
            >
              Disconnect WhatsApp
            </button>
          )}
        </div>
        
        {qrCode && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg max-w-xs mx-auto">
            <p className="text-center text-sm text-gray-700 mb-2">
              Scan this QR code with your WhatsApp
            </p>
            <img src={qrCode} alt="WhatsApp QR Code" className="mx-auto" />
            <p className="text-center text-xs text-gray-500 mt-2">
              Open WhatsApp on your phone, tap Menu or Settings and select WhatsApp Web
            </p>
          </div>
        )}
      </div>

      {/* Send Form */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">Send Data to Agent</h3>
        
        {whatsAppStatus !== "connected" ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Connect to WhatsApp to send data to agents</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 mb-1">
                Select Agent
              </label>
              <select
                id="agentId"
                name="agentId"
                value={formData.agentId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Select Agent --</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} ({agent.phone || "No phone"})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="listId" className="block text-sm font-medium text-gray-700 mb-1">
                Select List
              </label>
              <select
                id="listId"
                name="listId"
                value={formData.listId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Select List --</option>
                {lists.map((list) => (
                  <option key={list._id} value={list._id}>
                    {list.originalName || list.fileName} ({list.itemCount || list.totalItems} items)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a message to send with the data file..."
              ></textarea>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={sending}
                className={`px-4 py-2 rounded-md text-white font-medium transition duration-300 ${
                  sending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {sending ? (
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
                    Sending...
                  </>
                ) : (
                  "Send Data via WhatsApp"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConnectSocials;