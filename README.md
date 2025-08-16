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

### Admin Features
- **Dashboard**: Analytics and statistics
- **User Management**: View and manage user subscriptions
- **Transaction Management**: Approve/reject bKash payments
- **Blog Management**: Full CRUD operations
- **Data Export**: Export users, transactions, and blogs

### Payment System
- **bKash QR Code**: Display QR code for payments
- **Transaction Verification**: Manual and automatic verification
- **Multiple Plans**: Lifetime subscription for ৳30 with manual verification
- **SMS Integration**: Auto-approval via SMS webhook

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

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

### Default Admin Account
- **Email**: admin@blogsite.com
- **Password**: admin123

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscription_status ENUM('free', 'active', 'expired') DEFAULT 'free',
  subscription_expiry DATETIME NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Blogs Table
```sql
CREATE TABLE blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT,
  content LONGTEXT NOT NULL,
  excerpt TEXT,
  image_url VARCHAR(500),
  is_premium BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  publish_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  author_id INT DEFAULT 1,
  FOREIGN KEY (author_id) REFERENCES users(id)
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  trx_id VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  plan_type ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'bkash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (blog_id) REFERENCES blogs(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Likes & Saved Posts Tables
```sql
CREATE TABLE likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (blog_id, user_id),
  FOREIGN KEY (blog_id) REFERENCES blogs(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE saved_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_save (blog_id, user_id),
  FOREIGN KEY (blog_id) REFERENCES blogs(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/verify` - Verify token
- `GET /api/auth/saved-blogs` - Get saved blogs

### Blogs
- `GET /api/blogs` - Get all blogs (with filters)
- `GET /api/blogs/:id` - Get single blog
- `GET /api/blogs/categories` - Get categories
- `POST /api/blogs/:id/like` - Like/unlike blog
- `POST /api/blogs/:id/save` - Save/unsave blog
- `GET /api/blogs/:id/likes` - Get blog likes
- `POST /api/blogs` - Create blog (admin)
- `PUT /api/blogs/:id` - Update blog (admin)
- `DELETE /api/blogs/:id` - Delete blog (admin)

### Comments
- `GET /api/comments/blog/:blogId` - Get blog comments
- `POST /api/comments/blog/:blogId` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Transactions
- `GET /api/transactions/plans` - Get subscription plans
- `GET /api/transactions/payment-info` - Get payment info
- `POST /api/transactions` - Submit transaction
- `GET /api/transactions/my-transactions` - Get user transactions
- `POST /api/transactions/sms-webhook` - SMS webhook
- `GET /api/transactions` - Get all transactions (admin)
- `POST /api/transactions/:trxId/approve` - Approve transaction (admin)
- `POST /api/transactions/:trxId/reject` - Reject transaction (admin)

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `GET /api/admin/activity/recent` - Recent activity
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/subscription` - Update user subscription
- `POST /api/admin/transactions/bulk-approve` - Bulk approve transactions
- `GET /api/admin/export` - Export data

## 💳 bKash Payment Integration

### How it works:
1. **User selects a plan** (Monthly/Quarterly/Yearly)
2. **QR Code displayed** with payment instructions
3. **User pays via bKash** using the QR code or merchant number
4. **User receives SMS** with transaction ID from bKash
5. **User submits transaction ID** on the website
6. **Admin verifies** the transaction manually or via SMS webhook
7. **Subscription activated** upon approval

### Subscription Plans:
- **Monthly**: ৳199 (1 month access)
- **Quarterly**: ৳499 (3 months access, 17% savings)
- **Yearly**: ৳1599 (12 months access, 33% savings)

### SMS Webhook Integration:
For automatic approval, set up an SMS webhook endpoint that parses bKash transaction SMS and sends to:
```
POST /api/transactions/sms-webhook
{
  "trxId": "ABC123XYZ",
  "amount": 199.00,
  "sender": "01XXXXXXXXX",
  "message": "Your payment is successful..."
}
```

## 🎨 Design System

### Color Palette
- **Primary**: Muted teal (#5fb3b3) - Main branding color
- **Accent**: Coral (#d4876a) - Action buttons and highlights  
- **Background**: Warm beige (#f5f2e8) - Main background
- **Dark Mode**: Deep gray (#1a1a1a) with lighter cards (#2d2d2d)

### Typography
- **Font Family**: Segoe UI, system-ui, sans-serif
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Headings**: Bold with clear hierarchy
- **Body Text**: Regular weight with good line-height

### Design Philosophy
- **Brutalist Web Design**: Sharp edges, high contrast, geometric shapes
- **Minimal**: Clean, functional design without unnecessary decoration
- **Accessible**: High contrast, readable fonts, keyboard navigation
- **Responsive**: Mobile-first approach with consistent spacing

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

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- SMS webhook requires external SMS parsing service
- Email notifications need SMTP configuration
- File uploads limited to 5MB by default
- Dark mode toggle state persists in localStorage

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

## 📞 Support

For support, email support@yourdomain.com or create an issue in the repository.

---

**Happy Coding! 🚀**
