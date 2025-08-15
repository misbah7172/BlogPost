import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';

// Import pages
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Subscribe from './pages/Subscribe';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import AdminPanel from './pages/admin/AdminPanel';
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';

// Protected route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/blogs" element={<BlogList />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/subscribe" element={<Subscribe />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* Protected routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/create-blog" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <CreateBlog />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit-blog/:id" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <EditBlog />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#333',
                  border: '2px solid #000',
                  borderRadius: '0',
                  fontFamily: 'Segoe UI, system-ui, sans-serif',
                },
                success: {
                  className: 'toast-success',
                },
                error: {
                  className: 'toast-error',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// 404 Page Component
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-black dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="brutal-button-primary">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default App;
