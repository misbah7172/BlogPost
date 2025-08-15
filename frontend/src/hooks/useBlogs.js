import { useState, useEffect } from 'react';
import { blogService } from '../services/blogService';

export const useBlogs = (initialParams = {}) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, hasMore: true });
  const [params, setParams] = useState(initialParams);

  const fetchBlogs = async (newParams = {}, append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalParams = { ...params, ...newParams };
      const response = await blogService.getBlogs(finalParams);
      
      if (append) {
        setBlogs(prev => [...prev, ...response.blogs]);
      } else {
        setBlogs(response.blogs);
      }
      
      setPagination(response.pagination);
      setParams(finalParams);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchBlogs({ page: pagination.page + 1 }, true);
    }
  };

  const refetch = () => {
    fetchBlogs({ ...params, page: 1 }, false);
  };

  const updateParams = (newParams) => {
    fetchBlogs({ ...newParams, page: 1 }, false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return {
    blogs,
    loading,
    error,
    pagination,
    loadMore,
    refetch,
    updateParams,
  };
};
