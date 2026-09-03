# KayisiHub - Gaming Marketplace MVP

Gaming marketplace platform for buying and selling in-game items and accounts.

## Features

✅ **User Authentication & Authorization**
- User registration and login system
- JWT-based authentication
- Role-based access control (User, Admin)

✅ **Listing Management**
- Create, read, update, delete listings
- Support for game categories: Mobile Legends, PUBG, Free Fire
- Listing types: Account Sales, In-Game Items
- Price management and listing details

✅ **Game Categories**
- Mobile Legends
- PUBG
- Free Fire

✅ **User Features**
- User profiles with listing history
- My listings dashboard
- Responsive mobile-first design

✅ **Admin Panel**
- User management
- Listing moderation
- Category management
- Statistics dashboard

✅ **Technical Features**
- Modern React frontend with Tailwind CSS
- Express.js backend with MongoDB
- Form validation and error handling
- Security measures (password hashing, input validation)
- Responsive design optimized for mobile

## Technology Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Axios for API calls
- React Hook Form for form management

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Cors & dotenv for configuration

### Database
- MongoDB (NoSQL)
- Collections: Users, Listings, Categories, Admin Logs

## Project Structure

```
KayisiHub/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── styles/          # Global styles
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Express.js backend API
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── controllers/         # Route controllers
│   ├── config/              # Configuration files
│   ├── server.js
│   └── package.json
├── README.md
├── .gitignore
└── package.json
```

## Demo Credentials

### Admin Account
- **Email:** admin@kayisihub.com
- **Password:** Admin@123
- **Role:** Administrator (Full access to admin panel)

### Demo User Account
- **Email:** user@kayisihub.com
- **Password:** User@123
- **Role:** Regular User (Can create and manage listings)

### Demo Seller Account
- **Email:** seller@kayisihub.com
- **Password:** Seller@123
- **Role:** Regular User with multiple listings

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/baykayisi/KayisiHub.git
   cd KayisiHub
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   
   Create `backend/.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/kayisihub
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ```

   Create `frontend/.env.local` file:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the application**
   
   Development mode (both frontend and backend):
   ```bash
   npm run dev
   ```
   
   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend
   
   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:5173/admin (login with admin credentials)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Listings
- `GET /api/listings` - Get all listings with filters
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create new listing (authenticated)
- `PUT /api/listings/:id` - Update listing (owner only)
- `DELETE /api/listings/:id` - Delete listing (owner only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/listings` - Get user's listings

### Admin
- `GET /api/admin/stats` - Dashboard statistics (admin only)
- `GET /api/admin/users` - Manage users (admin only)
- `PUT /api/admin/users/:id` - Update user status (admin only)
- `DELETE /api/admin/listings/:id` - Remove listings (admin only)

## Features & Pages

### Public Pages
- **Home Page** - Browse all listings, search and filter by category
- **Listing Detail** - View full listing information and seller profile
- **Login/Register** - User authentication

### User Pages
- **Dashboard** - User's listings and account overview
- **My Listings** - Create, edit, delete listings
- **Profile** - Edit profile information
- **Listing Form** - Create and edit listings with validation

### Admin Pages
- **Admin Dashboard** - Statistics and overview
- **Listings Management** - View and moderate all listings
- **Users Management** - Manage user accounts and permissions
- **Categories Management** - Manage game categories

## Security Notes

⚠️ **IMPORTANT: This is a development MVP**
- Passwords are hashed using bcryptjs (NOT stored in plain text)
- JWT tokens are used for session management
- Input validation is implemented on both frontend and backend
- CORS is configured for frontend-backend communication
- Admin routes are protected with authentication middleware

### Production Considerations
- Use environment variables for all secrets
- Implement rate limiting on authentication endpoints
- Add HTTPS enforcement
- Implement more sophisticated payment processing
- Add email verification for accounts
- Implement listing image upload with CDN
- Add detailed audit logging for admin actions

## Mobile Responsiveness

✅ All pages are fully responsive and optimized for:
- Mobile devices (320px and up)
- Tablets (768px and up)
- Desktop (1024px and up)

Use Tailwind CSS responsive utilities for flexible layouts.

## Development Roadmap

### Phase 1 (Current MVP) ✅
- Basic authentication system
- Listing CRUD operations
- User profiles
- Admin panel basics
- Responsive design

### Phase 2 (Planned)
- Payment integration (Stripe/PayPal)
- Messaging system between buyers and sellers
- Listing images/media upload
- Review and rating system
- Wishlist feature

### Phase 3 (Planned)
- Advanced search and filtering
- Price history and analytics
- Seller verification badges
- Automated content moderation
- Mobile app (React Native)

## Known Limitations & TODO

- [ ] Payment processing integration
- [ ] Email notifications
- [ ] Image upload and storage
- [ ] Advanced search filters
- [ ] User messaging system
- [ ] Detailed analytics dashboard
- [ ] SMS notifications
- [ ] Two-factor authentication (2FA)

## Contributing

This is a learning project. Feel free to fork and submit improvements.

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.

---

**Last Updated:** 2026-09-03
**Current Version:** 0.1.0 (MVP)
