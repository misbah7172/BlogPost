# Blog Subscription Website with bKash Payment Integration

A full-stack React + Node.js + PostgreSQL blog website with subscription system and bKash QR payment integration.

##  Features

### Core Functionality
- **Free & Premium Blogs**: Access control based on subscription status
- **bKash Payment Integration**: QR code payment with transaction ID verification
- **User Authentication**: JWT-based auth with bcrypt password hashing
- **Blog Management**: Create, edit, delete blogs with image upload
- **Comment System**: Users can comment on blogs
- **Like & Save**: Users can like and save blogs for later reading
- **Search & Filter**: Search blogs by title/content and filter by category
- **Responsive Design**: Mobile-first design with dark/light mode

##  Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **bcrypt** password hashing
- **Multer** file uploads
- **Nodemailer** email notifications
- **Express Validator** input validation
- **Helmet** security headers
- **CORS** cross-origin support

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** icons
- **React Hook Form** form handling
- **React Hot Toast** notifications
- **Date-fns** date formatting

##  Getting Started

### Prerequisites
- Node.js 16+ 
- NeonDB
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Blog_Post
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file from example:
```bash
cp .env.example .env
```

Then edit `.env` with your actual configuration values:
- Database credentials for your PostgreSQL server
- JWT secret (use a long, random string)
- Email settings for notifications (optional)
- bKash payment configuration (optional)
- Admin credentials

Initialize the database:
```bash
npm run init-db
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create `.env` file from example:
```bash
cp .env.example .env
```

Edit `.env` if needed (defaults should work for local development):
- API URL (defaults to http://localhost:5000/api)
- App name and description
- bKash QR code URL (optional)

Start the frontend development server:
```bash
npm start
```

##  Security Features

- **JWT Authentication** with secure secret keys
- **bcrypt Password Hashing** with salt rounds
- **Input Validation** using express-validator
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Helmet Security Headers** for additional protection
- **File Upload Validation** with size and type restrictions
- **Role-based Access Control** for admin functions

##  Deployment

### Backend Deployment
1. Set up MySQL database on your server
2. Configure environment variables
3. Install dependencies: `npm install`
4. Initialize database: `npm run init-db`
5. Start server: `npm start`

### Frontend Deployment
1. Build the React app: `npm run build`
2. Serve the build folder using a web server (Nginx, Apache, etc.)
3. Configure proxy to backend API

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your_production_db_host
JWT_SECRET=your_very_secure_jwt_secret
FRONTEND_URL=https://yourdomain.com
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  Future Enhancements

- [ ] Social media sharing for blogs  
- [ ] User profiles and avatars
- [ ] Analytics integration (Google Analytics)
- [ ] Content management with WYSIWYG editor
- [ ] Multi-language support

**Happy Coding!**
