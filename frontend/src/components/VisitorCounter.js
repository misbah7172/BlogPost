import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import { apiRequest } from '../services/api';

const VisitorCounter = () => {
  const [visitorStats, setVisitorStats] = useState({
    totalVisitors: 0,
    uniqueVisitors: 0,
    totalViews: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const recordVisit = async () => {
      try {
        // Record the current visit using the API service
        await apiRequest('/visitors/visit', {
          method: 'POST',
          body: {
            userAgent: navigator.userAgent,
            referrer: document.referrer
          }
        });
      } catch (error) {
        console.error('Failed to record visit:', error);
      }
    };

    const fetchVisitorStats = async () => {
      try {
        const stats = await apiRequest('/visitors/stats');
        setVisitorStats(stats);
      } catch (error) {
        console.error('Failed to fetch visitor stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Record visit and fetch stats
    recordVisit();
    fetchVisitorStats();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
        <FaEye className="w-4 h-4" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Mobile view - collapsed by default */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <FaEye className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formatNumber(visitorStats.totalViews)} views
          </span>
        </button>
        
        {isExpanded && (
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Total Views:</span>
                <span className="font-medium">{visitorStats.totalViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Unique Visitors:</span>
                <span className="font-medium">{visitorStats.uniqueVisitors.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Visitors:</span>
                <span className="font-medium">{visitorStats.totalVisitors.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop view - full stats always visible */}
      <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <FaEye className="w-4 h-4" />
          <span className="font-medium">{formatNumber(visitorStats.totalViews)}</span>
          <span>views</span>
        </div>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
        
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{formatNumber(visitorStats.uniqueVisitors)}</span>
          <span>unique</span>
        </div>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
        
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{formatNumber(visitorStats.totalVisitors)}</span>
          <span>total</span>
        </div>
      </div>
    </div>
  );
};

export default VisitorCounter;
