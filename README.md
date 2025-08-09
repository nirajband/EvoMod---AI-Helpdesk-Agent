# AI-Powered Ticket Management System

A comprehensive support ticket management system powered by AI for intelligent categorization, priority assignment, and expert matching.

## 🚀 Features

### Core Features
- **AI-Powered Processing**: Automatic ticket categorization and priority assignment using Google Gemini AI
- **Smart Assignment**: Intelligent moderator matching based on skills and workload
- **Real-time Notifications**: Email notifications via Nodemailer/Mailtrap
- **Role-based Access**: User, Moderator, and Admin roles with appropriate permissions
- **File Attachments**: Support for multiple file types with validation
- **Advanced Search & Filtering**: Comprehensive ticket search and filtering options

### AI Intelligence
- **Automatic Categorization**: AI analyzes ticket content and assigns appropriate categories
- **Priority Assessment**: Smart priority assignment based on urgency and impact analysis
- **Skill Matching**: Matches tickets to moderators with relevant technical skills
- **Summary Generation**: AI-generated summaries for quick ticket understanding

### User Experience
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Interactive Dashboard**: Real-time stats and activity feeds
- **Smooth Animations**: Framer Motion animations for enhanced UX
- **Mobile Responsive**: Optimized for all device sizes

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database
- **Google Gemini AI** - AI processing
- **Inngest** - Background job processing
- **Nodemailer** - Email notifications
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcrypt** - Password hashing

### Frontend  
- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - API requests
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Google Gemini AI API key
- Email service (Mailtrap recommended for development)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-ticket-system.git
cd ai-ticket-system
```

### 2. Backend Setup
```bash
cd ai-ticket-assistant
npm install

# Copy environment variables
cp .env.example .env
```

### 3. Configure Environment Variables
Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/ai-ticket-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Email Configuration
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password
EMAIL_FROM=noreply@aisupport.com

# Inngest Configuration
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key
```

### 4. Frontend Setup
```bash
cd ../ai-ticket-frontend
npm install
```

### 5. Start Development Servers

#### Terminal 1 - Backend
```bash
cd ai-ticket-assistant
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd ai-ticket-frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tickets
- `GET /api/tickets` - Get tickets (filtered by user role)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get single ticket
- `PUT /api/tickets/:id` - Update ticket (moderators/admins)
- `POST /api/tickets/:id/comments` - Add comment to ticket

### Moderator
- `GET /api/moderator/stats` - Get moderator dashboard stats
- `GET /api/moderator/tickets` - Get assigned tickets
- `GET /api/moderator/unassigned` - Get unassigned tickets
- `PUT /api/moderator/bulk-assign` - Bulk assign tickets

## 🤖 AI Processing Flow

1. **Ticket Submission**: User submits a support request
2. **Inngest Trigger**: System captures submission and triggers AI processing
3. **AI Analysis**: 
   - Gemini AI reads and interprets the ticket
   - Categorizes the issue type
   - Assigns priority level
   - Generates summary and tags
4. **Smart Assignment**: 
   - Searches for moderators with matching skills
   - Considers current workload
   - Assigns to best-fit moderator or admin fallback
5. **Notifications**: 
   - User receives confirmation email
   - Assigned moderator gets notification
6. **Tracking**: All metadata stored in MongoDB

## 👥 User Roles

### User
- Submit support tickets
- View own tickets
- Add comments to own tickets
- Rate resolved tickets

### Moderator
- View assigned tickets
- View unassigned tickets in their skill area
- Update ticket status and priority
- Add comments (public and internal)
- Access moderator dashboard with metrics

### Admin
- All moderator permissions
- View all tickets system-wide
- Manage user accounts
- Access admin panel
- System-wide statistics and analytics
- Bulk operations on tickets

## 🎨 UI Components

### Core Components
- **Home**: Landing page with features showcase
- **Login/Register**: Authentication forms with validation
- **Dashboard**: Role-specific dashboard with stats and quick actions
- **TicketForm**: AI-powered ticket submission form
- **TicketList**: Advanced ticket listing with filters and pagination
- **TicketDetails**: Comprehensive ticket view with comments
- **ModeratorDashboard**: Moderator-specific interface
- **AdminPanel**: Administrative interface
- **Navbar**: Dynamic navigation based on user role

### Design System
- **Glass Effect**: Modern glassmorphism design elements
- **Gradient Text**: Beautiful gradient text effects
- **Card Hover**: Smooth hover animations
- **Priority Indicators**: Color-coded priority system
- **Status Badges**: Visual status indicators
- **Loading States**: Elegant loading animations

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password security
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **File Upload Security**: Secure file handling with type/size validation
- **CORS Protection**: Proper CORS configuration
- **Helmet Security**: Security headers via Helmet.js

## 📧 Email Templates

### Ticket Created
- Confirmation email with ticket details
- Estimated response time
- Direct link to ticket

### Ticket Assigned
- Moderator notification
- Priority indication
- Quick action buttons

### Ticket Updated
- Status change notifications
- Comment notifications
- Resolution confirmations

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-production-jwt-secret
GEMINI_API_KEY=your-production-gemini-key
EMAIL_HOST=your-production-smtp-host
# ... other production configs
```

## 🧪 Testing

### Backend Testing
```bash
cd ai-ticket-assistant
npm test
```

### Frontend Testing
```bash
cd ai-ticket-frontend
npm test
```

## 📊 Monitoring & Analytics

### Built-in Metrics
- Response times
- Resolution rates
- User satisfaction scores
- System performance metrics
- AI processing accuracy

### Health Checks
- Database connectivity
- AI service status
- Email service status
- File storage accessibility

## 🔄 Background Jobs (Inngest)

### Available Functions
- **processTicket**: AI analysis and assignment
- **sendNotification**: Email notification delivery
- **cleanupFiles**: Periodic file cleanup
- **generateReports**: Automated reporting

### Job Monitoring
Access Inngest dashboard at `/api/inngest` for job monitoring and debugging.

## 🎯 Performance Optimizations

### Backend
- Database indexing for optimal queries
- Connection pooling
- Response compression
- Static file serving
- Efficient aggregation pipelines

### Frontend
- Code splitting with React.lazy
- Image optimization
- Bundle optimization
- Caching strategies
- Performance monitoring

## 🛡️ Error Handling

### Backend Error Handling
- Centralized error middleware
- Detailed error logging
- Graceful failure modes
- Input validation errors
- Database error handling

### Frontend Error Handling
- Error boundaries
- Network error handling
- User-friendly error messages
- Retry mechanisms
- Loading states

## 📝 API Documentation

### Authentication Required
All endpoints except `/api/auth/login`, `/api/auth/register`, and health checks require authentication via Bearer token.

### Request Headers
```javascript
{
  "Authorization": "Bearer your-jwt-token",
  "Content-Type": "application/json"
}
```

### Response Format
```javascript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details"
}
```

## 🔧 Development Tips

### Adding New Features
1. Create database models in `/models`
2. Add API routes in `/routes`
3. Create React components in `/src/components`
4. Update navigation in `Navbar.js`
5. Add proper error handling and validation

### Code Style
- Use ESLint and Prettier for consistency
- Follow RESTful API conventions
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep components focused and reusable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@aisupport.com
- Documentation: [docs.aisupport.com](https://docs.aisupport.com)

## 🙏 Acknowledgments

- Google Gemini AI for intelligent processing
- Inngest for reliable background jobs
- Tailwind CSS for beautiful styling
- React community for excellent ecosystem
- MongoDB for flexible data storage
- 
