

# MERN Agent Manager

A web application for managing agents and distributing lists using the MERN stack (MongoDB, Express, React, Node.js). This application allows admins to manage agents, upload and distribute CSV or Excel files, and send data directly via WhatsApp to specific agents from the platform without manually opening WhatsApp. The integration is powered by `whatsapp-web.js`.

## Features

- **Admin Authentication with JWT**: Secure login for admins using JSON Web Tokens (JWT).
- **Agent Management**: Add, view, and delete agents with details such as name, email, mobile number, and password.
- **CSV/Excel File Upload**: Upload CSV or Excel files containing list data for distribution.
- **Automatic Task Distribution**: Distribute items from the uploaded file equally among agents. Remaining tasks are allocated sequentially.
- **WhatsApp Integration**: Admins can send CSV files directly to agents via WhatsApp using `whatsapp-web.js` from within the platform, without needing to manually open WhatsApp.
- **Dashboard**: View statistics, recent uploads, and agent details on the dashboard.
- **Responsive UI**: Designed with Tailwind CSS for a mobile-friendly, user-friendly interface.

## Prerequisites

- Node.js 14+ and npm
- MongoDB (local or Atlas)
- **WhatsApp Web QR Code Scanner**: The application will connect to WhatsApp Web via `whatsapp-web.js`, which uses QR scanning for the initial authentication.

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/ANSH-1n/Agent_management_system.git
cd Agent_management_system
Setup Environment Variables

Create a .env file in the server directory with the following content:

plaintext
Copy code
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
WHATSAPP_SESSION_NAME=whatsapp-session
Create a .env file in the client directory with the following content:

plaintext
Copy code
REACT_APP_API_URL=http://localhost:5000
Install Dependencies

Install server dependencies:

bash
Copy code
cd server
npm install
Install client dependencies:

bash
Copy code
cd ../client
npm install
Seed the Database with an Admin User

bash
Copy code
cd server
npm run seed
This will create an admin user with the following credentials:

Email: admin@example.com

Password: password123

Start the Application

Start the server (from the server directory):

bash
Copy code
npm run dev
Start the client (from the client directory in a new terminal):

bash
Copy code
npm start
The application will be running at http://localhost:3000.

Project Structure
plaintext
Copy code
mern-agent-manager/
├── client/                      # Frontend React application
│   ├── public/                  # Static files
│   ├── src/
│   │   ├── assets/              # Images, fonts, etc.
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # Shared components
│   │   │   ├── forms/           # Form components
│   │   │   └── layout/          # Layout components
│   │   ├── context/             # React context providers
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service functions
│   │   ├── utils/               # Utility functions
│   │   ├── App.js               # App component
│   │   ├── index.js             # Entry point
│   │   └── routes.js            # Route definitions
│   ├── .env                     # Environment variables
│   └── package.json
│
├── server/                      # Backend Node.js/Express application
│   ├── config/                  # Configuration files
│   │   └── db.js                # Database connection
│   ├── controllers/             # Request handlers
│   ├── middleware/              # Custom middleware
│   ├── models/                  # Mongoose models
│   ├── routes/                  # API routes
│   │   └── whatsappRoutes.js    # Routes for WhatsApp integration
│   ├── services/                # Business logic
│   ├── utils/                   # Utility functions
│   ├── validators/              # Input validation
│   ├── .env                     # Environment variables
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
│
├── .gitignore
└── README.md                    # Project documentation
API Endpoints
Authentication
POST /api/auth/login - Login as admin.

Agents
GET /api/agents - Get all agents.

POST /api/agents - Create a new agent.

GET /api/agents/:id - Get a single agent.

DELETE /api/agents/:id - Delete an agent.

Lists
POST /api/lists/upload - Upload and distribute list.

GET /api/lists/uploads - Get all uploads.

GET /api/lists/agent/:id - Get lists for an agent.

GET /api/lists/download/:id - Download upload as CSV.

WhatsApp Integration
POST /api/whatsapp/connect - Connect to WhatsApp.

GET /api/whatsapp/status - Get WhatsApp connection status.

POST /api/whatsapp/disconnect - Disconnect from WhatsApp.

POST /api/whatsapp/send - Send CSV/Excel data to agents via WhatsApp.

Dashboard
GET /api/dashboard/stats - Get dashboard statistics.

Technologies Used
Frontend: React, React Router, Axios, Tailwind CSS, React-Toastify

Backend: Node.js, Express, MongoDB, Mongoose, JWT

File Handling: Multer, CSV-Parser, XLSX

WhatsApp Integration: whatsapp-web.js

Development: Nodemon, Concurrently




App.jsx
axios.defaults.baseURL = 'http://localhost:5000';


Extra Feature:
The MERN Agent Manager now includes an additional feature that allows admins to send uploaded CSV or Excel files directly to agents via WhatsApp from within the platform. This integration, powered by whatsapp-web.js, eliminates the need for manually opening WhatsApp, enabling seamless communication between the admin and agents.





## Agent Image
![Agent Image](public/agent1.jpg)
![Agent Image](public/agent2.jpg)
![Agent Image](public/agent3.jpg)
![Agent Image](public/agent4.jpg)



![Agent Image](https://raw.githubusercontent.com/ANSH-1n/Agent_management_system/main/public/agent1.jpg)
![Agent Image](https://raw.githubusercontent.com/ANSH-1n/Agent_management_system/main/public/agent2.jpg)
![Agent Image](https://raw.githubusercontent.com/ANSH-1n/Agent_management_system/main/public/agent3.jpg)
![Agent Image](https://raw.githubusercontent.com/ANSH-1n/Agent_management_system/main/public/agent4.jpg)
