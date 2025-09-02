# RoadGuard - Automotive Service Platform
# Team number -14
A comprehensive automotive service platform connecting users with workshops and mechanics for vehicle maintenance and repair services.

## Demo Video

🎥 **[Watch Demo Video](https://youtu.be/zvhICV0eE6Q)**

📁 **[Project Documentation](https://drive.google.com/file/d/1XZ8a8BmA2eHhnxKMFdvF7wzrWfVj3Jeo/view?usp=sharing)**

## Features

### User Features
- **Workshop Discovery** - Find nearby workshops with filtering and search
- **Service Requests** - Submit service requests to workshop admins
- **Real-time Tracking** - Track service progress and status updates
- **Worker Profiles** - View detailed profiles of mechanics and workers
- **Service History** - Access past service records and receipts

### Admin Features
- **Service Management** - Manage incoming service requests
- **Worker Assignment** - Assign workers to specific service requests
- **Real-time Notifications** - Receive instant notifications for new requests
- **Dashboard Analytics** - View statistics and performance metrics
- **User Management** - Manage workshop workers and permissions

### Worker Features
- **Task Management** - View assigned tasks and update status
- **Profile Management** - Maintain professional profile and certifications
- **Real-time Updates** - Receive task assignments and updates

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Router** for navigation
- **Socket.IO Client** for real-time features

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** authentication
- **bcrypt** for password hashing

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd roadguard/backend
npm install
cp .env.example .env
# Configure your MongoDB connection and JWT secret in .env
npm start
```

### Frontend Setup
```bash
cd roadguard
npm install
npm start
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/roadguard
JWT_SECRET=your_jwt_secret_key
PORT=3001
```

### Frontend
```
VITE_API_URL=http://localhost:3001
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification

### Service Requests
- `GET /api/requests/admin/:adminId` - Get admin's service requests
- `POST /api/requests/service-requests` - Create service request
- `PATCH /api/requests/:id/status` - Update request status
- `PATCH /api/requests/:id/assign` - Assign worker to request

### Workshops
- `GET /api/requests/shops` - Get all workshops
- `GET /api/auth/worker/:workerId` - Get worker profile
- `GET /api/auth/admin/:adminId` - Get admin profile

## User Roles

### User (Customer)
- Browse workshops and workers
- Submit service requests
- Track service progress
- View service history

### Admin (Workshop Owner)
- Manage service requests
- Assign workers to tasks
- View analytics and reports
- Manage workshop profile

### Worker (Mechanic)
- View assigned tasks
- Update task status
- Manage professional profile
- Receive real-time assignments

## Real-time Features

- **Live Notifications** - Instant notifications for new requests and updates
- **Status Updates** - Real-time service status tracking
- **Worker Assignment** - Live updates when workers are assigned
- **Dashboard Refresh** - Auto-refresh of admin dashboard data

## Project Structure

```
roadguard/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── lib/         # Utilities and API
│   └── public/          # Static assets
└── README.md
```

## Team Members

- **Vedant Vyas** - Team Leader, Backend Developer
- **Rajat Jhade** - API Integration
- **Prashant Dwivedi** - Backend Developer
- **Muskan Chauhan** - Frontend Developer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.