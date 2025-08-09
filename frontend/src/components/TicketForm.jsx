import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  FileText,
  Tag,
  User
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TicketForm = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const priorities = [
    { value: 'low', label: 'Low', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { value: 'medium', label: 'Medium', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { value: 'high', label: 'High', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }

      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`);
        return false;
      }

      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('subject', formData.subject);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);

      attachments.forEach(file => {
        submitData.append('attachments', file);
      });

      const response = await axios.post('/api/tickets', submitData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Ticket submitted successfully!');
      navigate('/my-tickets');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Support Ticket</h1>
          <p className="text-gray-600">
            Our AI system will automatically categorize and prioritize your request for faster resolution.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Brief description of your issue"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {priorities.map(priority => (
                    <label
                      key={priority.value}
                      className={`relative flex cursor-pointer rounded-lg p-4 border-2 transition-colors ${
                        formData.priority === priority.value
                          ? `border-indigo-500 ${priority.bg}`
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <priority.icon className={`h-5 w-5 mr-3 ${priority.color}`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {priority.label}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Please provide detailed information about your issue..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Provide as much detail as possible to help us resolve your issue quickly.
                </p>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition-colors">
                  <div className="text-center">
                    <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-2">
                      Drop files here or click to browse
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Choose files
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 5 files, 10MB each. Supported: JPG, PNG, PDF, DOC, TXT
                    </p>
                  </div>
                </div>

                {/* File List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="loading-spinner mr-2"></div>
                  ) : (
                    <Send className="h-5 w-5 mr-2" />
                  )}
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* User Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">{user.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Processing Info */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">AI-Powered Processing</h3>
              <div className="space-y-2 text-sm text-purple-100">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Automatic categorization
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Smart priority assignment
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Expert moderator matching
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Instant email notifications
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Better Support</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>• Be specific about your issue</div>
                <div>• Include error messages if any</div>
                <div>• Mention steps you've already tried</div>
                <div>• Attach relevant screenshots</div>
                <div>• Choose the correct category</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TicketForm;