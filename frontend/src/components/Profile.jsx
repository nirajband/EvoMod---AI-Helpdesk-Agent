import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Key,
  Bell,
  Shield,
  Activity,
  Award,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    ticketUpdates: true,
    weeklyReport: false
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileResponse, statsResponse] = await Promise.all([
        axios.get('/api/user/profile'),
        axios.get('/api/user/stats')
      ]);
      
      setUser(profileResponse.data);
      setStats(statsResponse.data);
      setProfileData({
        name: profileResponse.data.name || '',
        email: profileResponse.data.email || '',
        phone: profileResponse.data.phone || '',
        location: profileResponse.data.location || '',
        bio: profileResponse.data.bio || '',
        avatar: profileResponse.data.avatar || ''
      });
      setNotifications(profileResponse.data.notifications || notifications);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axios.put('/api/user/profile', profileData);
      setUser(response.data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await axios.put('/api/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  const handleNotificationChange = async (setting, value) => {
    const updatedNotifications = { ...notifications, [setting]: value };
    setNotifications(updatedNotifications);
    
    try {
      await axios.put('/api/user/notifications', updatedNotifications);
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notification settings');
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post('/api/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUser(prev => ({ ...prev, avatar: response.data.avatar }));
      setProfileData(prev => ({ ...prev, avatar: response.data.avatar }));
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <button
                  onClick={() => editing ? handleSaveProfile() : setEditing(true)}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    editing 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {editing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {editing ? 'Save' : 'Edit'}
                </button>
              </div>

              {/* Avatar Section */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  {editing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                      <Camera className="w-3 h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{user?.name}</h3>
                  <p className="text-gray-500">{user?.email}</p>
                  <p className="text-sm text-gray-400">
                    Member since {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!editing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {editing && (
                <div className="mt-6 flex items-center space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setProfileData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        location: user?.location || '',
                        bio: user?.bio || '',
                        avatar: user?.avatar || ''
                      });
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-gray-500">Last updated 30 days ago</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Receive push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Ticket Updates</h3>
                    <p className="text-sm text-gray-500">Get notified when tickets are updated</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.ticketUpdates}
                      onChange={(e) => handleNotificationChange('ticketUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Weekly Report</h3>
                    <p className="text-sm text-gray-500">Receive weekly activity summary</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.weeklyReport}
                      onChange={(e) => handleNotificationChange('weeklyReport', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Activity Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm">Tickets Created</span>
                  </div>
                  <span className="font-semibold">{stats.ticketsCreated || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">Resolved</span>
                  </div>
                  <span className="font-semibold">{stats.ticketsResolved || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="text-sm">Resolution Rate</span>
                  </div>
                  <span className="font-semibold">
                    {stats.ticketsCreated > 0 
                      ? Math.round((stats.ticketsResolved / stats.ticketsCreated) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/create-ticket')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create New Ticket
                </button>
                <button
                  onClick={() => navigate('/tickets')}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                >
                  View My Tickets
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Update Password
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

export default Profile;