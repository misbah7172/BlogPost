# Blog Subscription Website with bKash Payment Integration

A full-stack React + Node.js + MySQL blog website with subscription system and bKash QR payment integration.

## 🚀 Features

### Core Functionality
- **Free & Premium Blogs**: Access control based on subscription status
- **bKash Payment Integration**: QR code payment with transaction ID verification
- **User Authentication**: JWT-based auth with bcrypt password hashing
- **Blog Management**: Create, edit, delete blogs with image upload
- **Comment System**: Users can comment on blogs
- **Like & Save**: Users can like and save blogs for later reading
- **Search & Filter**: Search blogs by title/content and filter by category
- **Responsive Design**: Mobile-first design with dark/light mode

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
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

## 📁 Project Structure

```
Blog_Post/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── initDb.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── blogController.js
│   │   │   ├── commentController.js
│   │   │   ├── transactionController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Blog.js
│   │   │   ├── Transaction.js
│   │   │   └── Comment.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── blogs.js
│   │       ├── comments.js
│   │       ├── transactions.js
│   │       └── admin.js
│   ├── uploads/
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── ui/
    │   │   ├── Header.js
    │   │   ├── Footer.js
    │   │   └── Layout.js
    │   ├── contexts/
    │   │   ├── AuthContext.js
    │   │   └── ThemeContext.js
    │   ├── hooks/
    │   │   ├── useBlogs.js
    │   │   └── useCommon.js
    │   ├── pages/
    │   │   ├── admin/
    │   │   ├── Home.js
    │   │   ├── BlogList.js
    │   │   ├── BlogDetail.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   └── Subscribe.js
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── blogService.js
    │   │   ├── commentService.js
    │   │   ├── transactionService.js
    │   │   └── adminService.js
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- MySQL 8.0+
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
- Database credentials for your MySQL server
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

## 🔒 Security Features

- **JWT Authentication** with secure secret keys
- **bcrypt Password Hashing** with salt rounds
- **Input Validation** using express-validator
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Helmet Security Headers** for additional protection
- **File Upload Validation** with size and type restrictions
- **Role-based Access Control** for admin functions

## 🚀 Deployment

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔮 Future Enhancements

- [ ] Email newsletter subscription
- [ ] Social media sharing for blogs  
- [ ] Advanced search with full-text indexing
- [ ] Blog series and reading progress tracking
- [ ] User profiles and avatars
- [ ] Mobile app using React Native
- [ ] SEO optimization with meta tags
- [ ] Analytics integration (Google Analytics)
- [ ] Content management with WYSIWYG editor
- [ ] Multi-language support

**Happy Coding! 🚀**
