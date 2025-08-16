import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { blogService } from '../services/blogService';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye } from 'lucide-react';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    content: '',
    excerpt: '',
    isPremium: false,
    isPublished: true
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    
    // Log current user and token status for debugging
    console.log('User:', user);
    console.log('Is authenticated:', isAuthenticated);
    console.log('Has token:', !!localStorage.getItem('token'));
    
    fetchCategories();
  }, [isAuthenticated, user, navigate]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from API...');
      console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
      const response = await blogService.getCategories();
      console.log('Categories response:', response);
      console.log('Categories count:', response?.length || 0);
      setCategories(response || []);
      if (response && response.length > 0) {
        console.log('✅ Categories loaded successfully:', response.map(c => c.name));
      } else {
        console.warn('⚠️ No categories received from API');
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      console.error('Error details:', error.message);
      toast.error('Failed to load categories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation to match backend requirements
    if (!formData.title || formData.title.trim().length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.content || formData.content.trim().length < 10) {
      toast.error('Content must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting blog data:', formData);
      const response = await blogService.createBlog(formData);
      console.log('Blog creation response:', response);
      toast.success('Blog created successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Create blog error:', error);
      // Show more specific error message if available
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create blog');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatContentForPreview = (content) => {
    return content
      .split('\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map((paragraph, index) => (
        <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">
          {paragraph}
        </p>
      ));
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin')}
              className="mr-4 p-2 border-2 border-black dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-black dark:text-white border-b-4 border-black dark:border-dark-border pb-2">
              Create New Blog
            </h1>
          </div>
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center px-4 py-2 border-2 border-black dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {preview ? (
          /* Preview Mode */
          <div className="brutal-card p-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
              {formData.title || 'Blog Title'}
            </h2>
            <div className="flex items-center mb-6 space-x-4">
              <span className="px-3 py-1 border-2 border-black dark:border-dark-border bg-primary-500 text-white text-sm">
                {formData.category || 'Category'}
              </span>
              {formData.isPremium && (
                <span className="px-3 py-1 border-2 border-black dark:border-dark-border bg-accent-500 text-white text-sm">
                  Premium
                </span>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formData.tags || 'Tags'}
              </span>
            </div>
            {formData.excerpt && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 italic">
                {formData.excerpt}
              </p>
            )}
            <div className="prose dark:prose-invert max-w-none">
              {formatContentForPreview(formData.content || 'Blog content will appear here...')}
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="brutal-card p-6">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 border-b-2 border-black dark:border-dark-border pb-2">
                Blog Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title * <span className="text-xs text-gray-500">(3-500 characters)</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-black dark:border-dark-border dark:bg-dark-card dark:text-white"
                    placeholder="Enter blog title"
                    required
                    minLength={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Characters: {formData.title.length}/500
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-black dark:border-dark-border dark:bg-dark-card dark:text-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-black dark:border-dark-border dark:bg-dark-card dark:text-white"
                    placeholder="e.g., React, JavaScript, Tutorial"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPremium"
                      checked={formData.isPremium}
                      onChange={handleInputChange}
                      className="h-4 w-4 border-2 border-black dark:border-dark-border"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Premium Content
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      className="h-4 w-4 border-2 border-black dark:border-dark-border"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Publish Immediately
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-black dark:border-dark-border dark:bg-dark-card dark:text-white"
                  placeholder="Brief description of the blog post"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content * <span className="text-xs text-gray-500">(minimum 10 characters)</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={20}
                  className="w-full px-3 py-2 border-2 border-black dark:border-dark-border dark:bg-dark-card dark:text-white"
                  placeholder="Write your blog content here... (minimum 10 characters required)"
                  required
                  minLength={10}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Characters: {formData.content.length}/10 minimum
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-6 py-2 border-2 border-black dark:border-dark-border bg-white dark:bg-dark-card text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  // Test API connection
                  try {
                    const response = await blogService.getCategories();
                    console.log('Categories test:', response);
                    toast.success('API connection working');
                  } catch (error) {
                    console.error('API test failed:', error);
                    toast.error('API connection failed');
                  }
                }}
                className="px-6 py-2 border-2 border-black dark:border-dark-border bg-blue-500 text-white hover:bg-blue-600"
              >
                Test API
              </button>
              <button
                type="submit"
                disabled={loading}
                className="brutal-button-primary disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Blog'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateBlog;
