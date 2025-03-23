import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/common/PrivateRoute";
import Layout from "./components/layout/Layout";

// Pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail"; // Added this import
import Lists from "./pages/Lists";
import ListDetail from "./pages/ListDetail";
import ListItems from "./pages/ListItems";
import UploadList from "./pages/UploadList";
import AgentLists from "./pages/AgentLists";
import NotFound from "./pages/NotFound";
import AgentEdit from "./pages/AgentEdit";
import ConnectSocials from "./pages/ConnectSocials"; // Added this import



const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/:id" element={<AgentDetail />} />{" "}
          {/* Added this route */}
          <Route path="/lists" element={<Lists />} />
          <Route path="/lists/:id" element={<ListDetail />} />
          <Route path="/lists/:id/items" element={<ListItems />} />
          <Route path="/upload-list" element={<UploadList />} />
          <Route path="/agent-lists" element={<AgentLists />} />
          <Route path="/agent-lists/:agentId" element={<AgentLists />} />{" "}
          <Route path="*" element={<NotFound />} />
          <Route path="/agents/edit/:id" element={<AgentEdit />} />
          <Route path="/connect-socials" element={<ConnectSocials />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
