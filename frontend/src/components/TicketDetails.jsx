import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Edit,
  Send,
  Bot
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tickets/${id}`);
      setTicket(response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Failed to load ticket details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isProcessing) return;

    try {
      setIsProcessing(true);
      const response = await axios.post(`/api/tickets/${id}/messages`, {
        message: newMessage,
        type: 'user'
      });
      
      setMessages([...messages, response.data]);
      setNewMessage('');
      
      // Trigger AI response
      setTimeout(() => processAIResponse(), 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsProcessing(false);
    }
  };

  const processAIResponse = async () => {
    try {
      const response = await axios.post(`/api/tickets/${id}/ai-response`);
      setMessages(prev => [...prev, response.data]);
      
      // Update ticket status if resolved
      if (response.data.resolved) {
        setTicket(prev => ({ ...prev, status: 'resolved' }));
      }
    } catch (error) {
      console.error('Error processing AI response:', error);
    }
  };

  const updateTicketStatus = async (status) => {
    try {
      const response = await axios.patch(`/api/tickets/${id}/status`, { status });
      setTicket(prev => ({ ...prev, status: response.data.status }));
      toast.success(`Ticket ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed': return <XCircle className="w-5 h-5 text-gray-500" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
          <p className="text-gray-600 mb-4">The ticket you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>#{ticket.id}</span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {ticket.user?.name || ticket.user?.email}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority} priority
                </span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(ticket.status)}
                  <span className="text-sm font-medium capitalize">{ticket.status}</span>
                </div>
              </div>
            </div>
            
            {ticket.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{ticket.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Conversation
                </h2>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            {message.type === 'ai' && <Bot className="w-4 h-4" />}
                            <span className="text-xs opacity-75">
                              {message.type === 'user' ? 'You' : 'AI Agent'}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="p-6 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isProcessing || ticket.status === 'closed'}
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !newMessage.trim() || ticket.status === 'closed'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                {ticket.status !== 'resolved' && (
                  <button
                    onClick={() => updateTicketStatus('resolved')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Mark as Resolved
                  </button>
                )}
                
                {ticket.status !== 'closed' && ticket.status === 'resolved' && (
                  <button
                    onClick={() => updateTicketStatus('closed')}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                  >
                    Close Ticket
                  </button>
                )}
                
                {ticket.status === 'open' && (
                  <button
                    onClick={() => updateTicketStatus('in-progress')}
                    className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700"
                  >
                    Start Working
                  </button>
                )}
                
                {ticket.status === 'closed' && (
                  <button
                    onClick={() => updateTicketStatus('open')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Reopen Ticket
                  </button>
                )}
              </div>
            </div>

            {/* Ticket Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Ticket Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="font-medium text-gray-700">Category:</label>
                  <p className="text-gray-600">{ticket.category || 'General'}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Created:</label>
                  <p className="text-gray-600">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Last Updated:</label>
                  <p className="text-gray-600">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
                {ticket.assignedTo && (
                  <div>
                    <label className="font-medium text-gray-700">Assigned To:</label>
                    <p className="text-gray-600">{ticket.assignedTo.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;