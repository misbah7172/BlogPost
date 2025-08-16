# MySQL Installation and Setup Guide

## Option 1: Install MySQL Server (Recommended)

### Windows Installation:
1. Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
2. Choose "mysql-installer-community-8.0.xx.x.msi"
3. Run the installer and select "Server only" or "Full"
4. Set root password (leave empty to match our .env file, or update .env with your password)
5. Complete the installation

### Add MySQL to PATH (if needed):
1. Add `C:\Program Files\MySQL\MySQL Server 8.0\bin` to your PATH environment variable
2. Restart your terminal/VS Code

## Option 2: Use XAMPP (Easier for development)

1. Download XAMPP from: https://www.apachefriends.org/
2. Install XAMPP
3. Start Apache and MySQL from XAMPP Control Panel
4. Default MySQL credentials: root with no password (matches our .env)

## Option 3: Use Docker (If you have Docker installed)

Run this command:
```bash
docker run --name mysql-blog -e MYSQL_ROOT_PASSWORD= -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -p 3306:3306 -d mysql:8.0
```

## After MySQL Installation:

1. Update the backend/.env file with your MySQL credentials if different
2. Run the database initialization: `npm run init-db` from the backend folder
3. Start the backend server: `npm run dev`
4. Start the frontend: `npm start` from the frontend folder

## Default Admin Credentials:
- Email: admin@blogsite.com
- Password: admin123
