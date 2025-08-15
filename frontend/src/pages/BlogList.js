import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../services/blogService';
import { Clock, User, Tag, Lock, Heart, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory, searchTerm, currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 9,
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      };

      console.log('🔍 Fetching blogs with params:', params);
      const response = await blogService.getBlogs(params);
      console.log('✅ Blogs fetched successfully:', response);
      
      if (currentPage === 1) {
        setBlogs(response.blogs);
        // Extract unique categories
        const uniqueCategories = [...new Set(response.blogs.map(blog => blog.category))];
        setCategories(uniqueCategories);
      } else {
        setBlogs(prev => [...prev, ...response.blogs]);
      }
      
      setHasMore(response.pagination.hasMore);
    } catch (error) {
      toast.error('Failed to fetch blogs');
      console.error('❌ Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canViewPremium = (blog) => {
    if (!blog.is_premium) return true;
    if (!isAuthenticated) return false;
    return user?.subscription_status === 'active' || user?.role === 'admin';
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      {/* Header Section */}
      <div className="brutal-card border-b-4 border-black dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4 text-shadow">
              All Blogs
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our collection of educational content, programming tutorials, and 
              tech insights
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="brutal-input w-full px-4 py-3 pl-10 pr-4"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </form>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="brutal-select px-4 py-3 min-w-[200px]"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && currentPage === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="brutal-card card-hover animate-pulse">
                <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 mb-2"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 mb-4"></div>
                  <div className="h-16 bg-gray-300 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <article key={blog.id} className="brutal-card card-hover overflow-hidden">
                  {/* Blog Image */}
                  <div className="relative h-48 bg-primary-500">
                    {blog.image_url ? (
                      <img 
                        src={blog.image_url} 
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    
                    {/* Premium Badge */}
                    {blog.is_premium && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-3 py-1 bg-accent-500 text-white text-xs font-bold border-2 border-black">
                          <Lock className="h-3 w-3 mr-1" />
                          Premium
                        </span>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 bg-primary-500 text-white text-xs font-bold border-2 border-black">
                        <Tag className="h-3 w-3 mr-1" />
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 line-clamp-2">
                      {blog.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="opacity-80 mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm opacity-80 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {blog.author_name}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(blog.publish_date)}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm opacity-80">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {blog.likes_count || 0}
                        </span>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <div className="flex justify-between items-center">
                      {canViewPremium(blog) ? (
                        <Link
                          to={`/blog/${blog.id}`}
                          className="brutal-button-primary inline-block w-full text-center"
                        >
                          Read More
                        </Link>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Link
                            to="/subscribe"
                            className="brutal-button inline-flex items-center justify-center w-full bg-accent-500 text-white"
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Subscribe to Read
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="brutal-button-primary"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Blogs'
                  )}
                </button>
              </div>
            )}

            {/* Empty State */}
            {blogs.length === 0 && !loading && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 opacity-60 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">
                  No blogs found
                </h3>
                <p className="text-lg opacity-80">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogList;
