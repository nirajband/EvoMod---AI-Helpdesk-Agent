import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    pendingTickets: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, ticketsResponse] = await Promise.all([
        axios.get('/api/tickets/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/tickets/recent', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setStats(statsResponse.data);
      setRecentTickets(ticketsResponse.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats.totalTickets,
      icon: Ticket,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Open Tickets',
      value: stats.openTickets,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      change: '-5%',
      changeColor: 'text-red-600'
    },
    {
      title: 'Resolved',
      value: stats.resolvedTickets,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      change: '+18%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Pending',
      value: stats.pendingTickets,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      change: '-8%',
      changeColor: 'text-green-600'
    }
  ];

  if (loading) {
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
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your support tickets today.
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${card.bgColor} rounded-xl p-6 card-hover`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${card.changeColor}`}>
                  {card.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <div className="text-sm text-gray-600">
                {card.title}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tickets */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Tickets</h2>
                <Link 
                  to="/my-tickets"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tickets found</p>
                    <Link 
                      to="/submit-ticket"
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Submit your first ticket
                    </Link>
                  </div>
                ) : (
                  recentTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-8 rounded-full ${
                            ticket.priority === 'high' ? 'bg-red-500' :
                            ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {ticket.subject}
                            </h3>
                            <p className="text-sm text-gray-500">
                              #{ticket.ticketNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()} Priority
                          </span>
                          <span>{ticket.category}</span>
                        </div>
                        <Link
                          to={`/ticket/${ticket._id}`}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions & Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/submit-ticket"
                  className="flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <Plus className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Submit New Ticket</div>
                    <div className="text-sm text-gray-500">Create a support request</div>
                  </div>
                </Link>

                <Link
                  to="/my-tickets"
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <Ticket className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">View My Tickets</div>
                    <div className="text-sm text-gray-500">Track your requests</div>
                  </div>
                </Link>

                {(user.role === 'moderator' || user.role === 'admin') && (
                  <Link
                    to="/moderator"
                    className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Moderator Panel</div>
                      <div className="text-sm text-gray-500">Manage assigned tickets</div>
                    </div>
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Ticket className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Ticket <span className="font-medium">#TK-2024-001</span> was created
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Ticket <span className="font-medium">#TK-2024-002</span> status updated to In Progress
                    </p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Ticket <span className="font-medium">#TK-2024-003</span> was resolved
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white"
            >
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-indigo-100 text-sm mb-4">
                Our AI-powered system is here to help you 24/7. Submit a ticket and get intelligent support.
              </p>
              <Link
                to="/submit-ticket"
                className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg text-white hover:bg-opacity-30 transition-colors text-sm font-medium"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;