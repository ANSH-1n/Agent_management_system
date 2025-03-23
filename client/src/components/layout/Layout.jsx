import React, { useContext, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Logout function that clears user session and redirects to login page
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Determines if the current path matches the link for active styling
  const isActive = (path) => {
    return location.pathname === path ? "bg-purple-700" : "";
  };

  // Toggles the sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-purple-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-gray-700 text-white transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}
      >
        {/* Sidebar Header */}
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-t-lg shadow-lg shadow-purple-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-trending-up w-6 h-6 text-white"
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
        </div>

        {/* Sidebar Content */}
        <div className="p-4">
          <h1 className="text-xl font-bold">Agent Manager</h1>
          <p className="text-sm opacity-70 mt-1">Welcome, {user?.name}</p>
        </div>

        {/* Navigation Links */}
        <nav className="mt-8">
          <ul>
            <li>
              <button
                onClick={() => navigate("/")}
                className={`block py-3 px-4 text-left w-full bg-transparent hover:bg-purple-700 text-white rounded-md transition duration-300 ${isActive(
                  "/"
                )}`}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/agents")}
                className={`block py-3 px-4 text-left w-full bg-transparent hover:bg-purple-700 text-white rounded-md transition duration-300 ${isActive(
                  "/agents"
                )}`}
              >
                Agents
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/lists")}
                className={`block py-3 px-4 text-left w-full bg-transparent hover:bg-purple-700 text-white rounded-md transition duration-300 ${isActive(
                  "/lists"
                )}`}
              >
                Lists
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-80 p-4">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-md hover:from-purple-500 hover:to-pink-500 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 text-[#4B1B6D] hover:bg-purple-100 rounded transition duration-300"
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h2 className="text-xl font-semibold">
              {location.pathname === "/" && "Dashboard"}
              {location.pathname === "/agents" && "Manage Agents"}
              {location.pathname.startsWith("/agents/") && "Agent Details"}
              {location.pathname === "/lists" && "Lists"}
              {location.pathname.startsWith("/lists/") && "List Details"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-[#4B1B6D] text-white flex items-center justify-center">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Layout;
