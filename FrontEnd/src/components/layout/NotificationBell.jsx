import React, { useState, useEffect, useRef } from 'react';
import notificationApi from '../../api/notificatonApi';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef(null);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
  };

  // Check if user is logged in
  const checkAuthStatus = () => {
    const token = getToken();
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);
    return loggedIn;
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;

      setIsLoading(true);
      const response = await notificationApi.getNotifications(token);
      const notificationData = response.data || response;
      
      if (Array.isArray(notificationData)) {
        setNotifications(notificationData);
        const unread = notificationData.filter(notif => !notif.isRead).length;
        setUnreadCount(unread);
      } else {
        console.error('Notification data is not an array:', typeof notificationData);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark single notification as read
  const markSingleAsRead = async (notificationId, token) => {
    try {
      // Đảm bảo gửi một object JSON hợp lệ thay vì null
      const requestBody = { isRead: true };
      
      const response = await notificationApi.markAsRead(notificationId, token, requestBody);
      return { success: true, id: notificationId, response };
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      return { success: false, id: notificationId, error };
    }
  };

  // Mark all notifications as read (called when opening bell)
  const markAllAsReadOnOpen = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.log('No token found, skipping mark as read');
        return;
      }

      const unreadNotifications = notifications.filter(notif => !notif.isRead);
      
      if (unreadNotifications.length === 0) {
        console.log('No unread notifications to mark');
        return;
      }

      console.log(`Marking ${unreadNotifications.length} notifications as read`);

      // Update UI immediately for better UX
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);

      // Make API calls to mark each notification as read
      const markPromises = unreadNotifications.map((notif) => {
        const notificationId = notif._id || notif.id;
        if (!notificationId) {
          console.error('Notification missing ID:', notif);
          return Promise.resolve({ success: false, id: 'unknown', error: 'Missing ID' });
        }
        return markSingleAsRead(notificationId, token);
      });

      const results = await Promise.allSettled(markPromises);
      
      // Log kết quả
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;
      
      console.log(`Mark as read results: ${successful} successful, ${failed} failed`);
      
      // Nếu có lỗi, log chi tiết
      if (failed > 0) {
        console.error('Failed mark as read operations:', 
          results.filter(r => r.status === 'rejected' || !r.value.success)
        );
        
        // Refresh notifications để sync với server
        setTimeout(() => {
          fetchNotifications();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error in markAllAsReadOnOpen:', error);
      // Refresh notifications to sync with server state
      fetchNotifications();
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo?')) return;

    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) return;

      const validNotifications = notifications.filter(notif => notif._id || notif.id);

      if (validNotifications.length === 0) {
        console.log('No valid notifications to delete');
        return;
      }

      console.log(`Deleting ${validNotifications.length} notifications`);

      // Delete notifications one by one
      const deletePromises = validNotifications.map(async (notif) => {
        try {
          const notificationId = notif._id || notif.id;
          await notificationApi.deleteNotification(notificationId, token);
          return { success: true, id: notificationId };
        } catch (error) {
          console.error(`Failed to delete notification ${notif._id || notif.id}:`, error);
          return { success: false, id: notif._id || notif.id };
        }
      });

      const results = await Promise.all(deletePromises);
      const successfulDeletes = results.filter(result => result.success).length;

      if (successfulDeletes === validNotifications.length) {
        // All notifications deleted successfully
        setNotifications([]);
        setUnreadCount(0);
        setIsOpen(false);
        console.log('All notifications deleted successfully');
      } else {
        // Some deletions failed, refresh to get current state
        await fetchNotifications();
        alert(`Đã xóa ${successfulDeletes}/${validNotifications.length} thông báo`);
      }

    } catch (error) {
      console.error('Error deleting notifications:', error);
      alert('Có lỗi xảy ra khi xóa thông báo');
      await fetchNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bell click
  const handleBellClick = async () => {
    if (!checkAuthStatus()) {
      console.log('User not logged in');
      return;
    }

    if (!isOpen) {
      console.log('Opening notification bell');
      // Opening the bell - fetch notifications first
      await fetchNotifications();
      setIsOpen(true);
      
      // Mark all as read after opening with a small delay
      setTimeout(() => {
        markAllAsReadOnOpen();
      }, 500); // Tăng delay để đảm bảo notifications đã được load
    } else {
      console.log('Closing notification bell');
      // Closing the bell
      setIsOpen(false);
    }
  };

  // Format time
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Thời gian không hợp lệ';
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return `${diffDays} ngày trước`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Không xác định';
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch notifications when logged in (for initial load and periodic refresh)
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      
      // Set up periodic refresh every 30 seconds (only when dropdown is closed)
      const interval = setInterval(() => {
        if (isLoggedIn && !isOpen) {
          fetchNotifications();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Don't render if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-white hover:text-red-500 transition duration-300"
        disabled={isLoading}
      >
        {/* Bell SVG */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, index) => {
                  const notificationId = notification._id || notification.id || `notif-${index}`;
                  return (
                    <div
                      key={notificationId}
                      className="px-4 py-3 hover:bg-gray-50 transition duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v8a5 5 0 11-10 0V2a1 1 0 011-1v3m0 0h10M9 7h6m-7 4h8m-8 4h8m-8 4h8"
                              />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {notification.title || 'Thông báo'}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message || notification.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                              {formatTime(notification.createdAt)}
                            </p>
                            {/* Movie info if available */}
                            {notification.movie && (
                              <p className="text-xs text-blue-500 font-medium">
                                {notification.movie.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer with delete all button */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button
                onClick={deleteAllNotifications}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xóa...' : 'Xóa tất cả thông báo'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;