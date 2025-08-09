import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Ticket, Users, Zap, ArrowRight, CheckCircle, Clock, MessageSquare } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Processing',
      description: 'Advanced AI automatically categorizes and prioritizes your support tickets using Gemini AI',
      color: 'text-purple-600'
    },
    {
      icon: Users,
      title: 'Smart Assignment',
      description: 'Intelligent moderator matching based on skills and expertise for faster resolution',
      color: 'text-blue-600'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications and track your ticket status in real-time',
      color: 'text-yellow-600'
    },
    {
      icon: MessageSquare,
      title: 'Seamless Communication',
      description: 'Built-in chat system for direct communication with support moderators',
      color: 'text-green-600'
    }
  ];

  const stats = [
    { number: '99.9%', label: 'Uptime', icon: CheckCircle },
    { number: '< 1hr', label: 'Response Time', icon: Clock },
    { number: '10K+', label: 'Tickets Resolved', icon: Ticket }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold gradient-text">AI Support</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">AI-Powered</span><br />
              Support System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience the future of customer support with our intelligent ticket management system. 
              Get faster resolutions, smarter assignments, and seamless communication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/login" 
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Support
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-driven platform transforms how you handle support tickets with intelligent 
              automation and seamless user experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-gray-50 hover:bg-white card-hover cursor-pointer"
              >
                <div className={`inline-flex p-3 rounded-lg bg-white shadow-sm mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-effect p-12 rounded-2xl"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Support?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of companies already using our AI-powered support system 
              to deliver exceptional customer experiences.
            </p>
            <Link 
              to="/register" 
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Bot className="h-8 w-8 text-indigo-400" />
            <span className="ml-2 text-xl font-bold">AI Support</span>
          </div>
          <p className="text-gray-400 mb-6">
            Intelligent support system powered by advanced AI technology
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm">
            © 2025 AI Support. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;