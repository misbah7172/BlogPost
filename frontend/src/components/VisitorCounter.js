import React, { useState, useEffect } from 'react';
import { Eye, Users, Activity } from 'lucide-react';
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
        <Eye className="w-4 h-4" />
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
          <Eye className="w-4 h-4" />
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
          <Eye className="w-4 h-4" />
          <span className="font-medium">{formatNumber(visitorStats.totalViews)}</span>
          <span>views</span>
        </div>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
        
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span className="font-medium">{formatNumber(visitorStats.uniqueVisitors)}</span>
          <span>unique</span>
        </div>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
        
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4" />
          <span className="font-medium">{formatNumber(visitorStats.totalVisitors)}</span>
          <span>total</span>
        </div>
      </div>
    </div>
  );
};

export default VisitorCounter;