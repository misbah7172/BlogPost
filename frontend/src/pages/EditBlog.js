import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { blogService } from '../services/blogService';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye } from 'lucide-react';

const EditBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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

    const fetchBlogData = async () => {
      try {
        const response = await blogService.getBlog(id);
        const blog = response.blog || response;
        setFormData({
          title: blog.title || '',
          category: blog.category || '',
          tags: blog.tags || '',
          content: blog.content || '',
          excerpt: blog.excerpt || '',
          isPremium: Boolean(blog.is_premium),
          isPublished: Boolean(blog.is_published)
        });
      } catch (error) {
        toast.error('Failed to load blog data');
        console.error('Error fetching blog:', error);
        navigate('/admin');
      } finally {
        setInitialLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await blogService.getCategories();
        console.log('Categories response:', response); // Debug log
        setCategories(response || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    const fetchData = async () => {
      await fetchBlogData();
      await fetchCategories();
    };
    
    fetchData();
  }, [isAuthenticated, user, navigate, id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await blogService.updateBlog(id, formData);
      toast.success('Blog updated successfully!');
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to update blog');
      console.error('Update blog error:', error);
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blog data...</p>
        </div>
      </div>
    );
  }

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
              Edit Blog
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
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-black dark:border-dark-border dark:bg-dark-card dark:text-white"
                    placeholder="Enter blog title"
                    required
                  />
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
                      Published
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
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={20}
                  className="w-full px-3 py-2 border-2 border-black dark:border-dark-border dark:bg-dark-card dark:text-white"
                  placeholder="Write your blog content here..."
                  required
                />
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
                type="submit"
                disabled={loading}
                className="brutal-button-primary disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Blog'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBlog;
