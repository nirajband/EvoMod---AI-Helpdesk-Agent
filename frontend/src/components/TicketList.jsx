import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TicketList = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false
  });

  const categories = [
    'Technical Issue',
    'Account Problem', 
    'Feature Request',
    'Bug Report',
    'General Inquiry',
    'Billing',
    'Security',
    'Performance',
    'Integration',
    'Other'
  ];

  const statuses = [
    { value: 'open', label: 'Open', color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'in-progress', label: 'In Progress', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'resolved', label: 'Resolved', color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'closed', label: 'Closed', color: 'text-gray-600', bg: 'bg-gray-100' }
  ];

  const priorities = [
    { value: 'high', label: 'High', color: 'text-red-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'low', label: 'Low', color: 'text-green-600' }
  ];

  useEffect(() => {
    fetchTickets();
  }, [filters, pagination.currentPage]);

  const fetchTickets = async (page = pagination.currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await axios.get(`/api/tickets?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setTickets(response.data.tickets);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch tickets');
      console.error('Fetch tickets error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status) => {
    const statusConfig = statuses.find(s => s.value === status);
    return statusConfig ? `${statusConfig.color} ${statusConfig.bg}` : 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority) => {
    const priorityConfig = priorities.find(p => p.value === priority);
    return priorityConfig ? priorityConfig.color : 'text-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-gray-600">
            Track and manage your support requests
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {tickets.length} of {pagination.totalCount} tickets
            </p>
            {Object.values(filters).some(filter => filter) && (
              <button
                onClick={() => {
                  setFilters({ status: '', category: '', priority: '', search: '' });
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Tickets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500 mb-4">
                {Object.values(filters).some(filter => filter)
                  ? "Try adjusting your filters or search terms"
                  : "You haven't created any support tickets yet"
                }
              </p>
              {!Object.values(filters).some(filter => filter) && (
                <Link
                  to="/submit-ticket"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Submit Your First Ticket
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket, index) => (
                      <motion.tr
                        key={ticket._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.subject}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{ticket.ticketNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status === 'in-progress' ? 'In Progress' : 
                             ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {ticket.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(ticket.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/ticket/${ticket._id}`}
                            className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm font-medium"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1 || loading}
                        className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              pageNum === pagination.currentPage
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasMore || loading}
                        className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Open</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Total</p>
                <p className="text-2xl font-bold text-gray-600">
                  {pagination.totalCount}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TicketList;