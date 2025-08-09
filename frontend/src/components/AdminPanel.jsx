import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Bot,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    password: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, usersResponse, ticketsResponse, moderatorsResponse, settingsResponse] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/tickets'),
        axios.get('/api/admin/moderators'),
        axios.get('/api/admin/settings')
      ]);

      setStats(statsResponse.data);
      setUsers(usersResponse.data);
      setTickets(ticketsResponse.data);
      setModerators(moderatorsResponse.data);
      setSystemSettings(settingsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/users', newUser);
      setUsers([...users, response.data]);
      setNewUser({ name: '', email: '', role: 'user', password: '' });
      setShowUserModal(false);
      toast.success('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/role`, { role });
      setUsers(users.map(user => user.id === userId ? { ...user, role } : user));
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateSettings = async (settings) => {
    try {
      await axios.put('/api/admin/settings', settings);
      setSystemSettings(settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const exportData = async (type) => {
    try {
      const response = await axios.get(`/api/admin/export/${type}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${type} data exported successfully`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTickets || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTickets || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTickets > 0 
                  ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="p-1 bg-blue-100 rounded">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* User Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage users and their permissions</p>
        </div>
        <button
          onClick={() => setShowUserModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
            
            <button
              onClick={() => exportData('users')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <Users className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600">Configure system-wide settings</p>
      </div>

      {/* AI Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          AI Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Response Delay (seconds)
            </label>
            <input
              type="number"
              value={systemSettings.aiResponseDelay || 2}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, aiResponseDelay: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={systemSettings.autoResolveEnabled || false}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, autoResolveEnabled: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable auto-resolution for simple queries</span>
            </label>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Email Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Host
            </label>
            <input
              type="text"
              value={systemSettings.smtpHost || ''}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Port
            </label>
            <input
              type="number"
              value={systemSettings.smtpPort || 587}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name
            </label>
            <input
              type="text"
              value={systemSettings.siteName || 'AI Ticket System'}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Tickets Per User
            </label>
            <input
              type="number"
              value={systemSettings.maxTicketsPerUser || 10}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, maxTicketsPerUser: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleUpdateSettings(systemSettings)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">System administration and management</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'settings' && renderSystemSettings()}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add New User</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;