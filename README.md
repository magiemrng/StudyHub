# StudyHub 🎓

A comprehensive academic management platform designed specifically for students. StudyHub provides a complete suite of tools to help students track their academic progress, manage schedules, and excel in their educational journey.

## ✨ Features

### 🧮 Academic Tools
- **GPA Calculator** - Calculate your GPA with 10-point scale precision
- **Attendance Tracker** - Monitor class attendance and meet requirements
- **Study Timer** - Pomodoro technique for focused study sessions
- **Grade Manager** - Track assignments, projects, and performance
- **Schedule Planner** - Organize academic calendar and deadlines
- **Resume Storage** - Secure document management for resumes and files

### 💬 Social Features
- **User Chat System** - Connect with fellow students
- **Study Groups** - Collaborate on academic projects
- **File Sharing** - Share documents and resources in chat
- **Real-time Messaging** - Instant communication with other users

### 🎯 Student Benefits
- **Exclusive Offers** - Curated discounts on software, books, and courses
- **Student Community** - Connect with peers and share resources
- **Progress Tracking** - Monitor academic performance over time
- **Cross-platform Access** - Available on all devices

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for development and building

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** database with Row Level Security (RLS)
- **Real-time subscriptions** for live chat functionality
- **File storage** for resumes and chat attachments

### Key Libraries
- `@supabase/supabase-js` - Database and auth client
- `lucide-react` - Beautiful icons
- `react-dom` - React DOM rendering

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   └── AuthModal.tsx          # Authentication modal
│   ├── Chat/
│   │   └── UserChatModal.tsx      # Real-time chat system
│   ├── tools/
│   │   ├── GPACalculator.tsx      # GPA calculation tool
│   │   ├── AttendanceTracker.tsx  # Attendance monitoring
│   │   ├── StudyTimer.tsx         # Pomodoro timer
│   │   ├── GradeManager.tsx       # Grade tracking
│   │   └── SchedulePlanner.tsx    # Schedule management
│   ├── AdminOffers.tsx            # Admin panel for offers
│   ├── Dashboard.tsx              # Main dashboard
│   ├── Landing.tsx                # Landing page with 3D animations
│   ├── OffersPage.tsx             # Student offers and discounts
│   ├── ResumeStorage.tsx          # Document management
│   ├── Sidebar.tsx                # Navigation sidebar
│   └── NewsletterModal.tsx        # Newsletter subscription
├── contexts/
│   └── AuthContext.tsx            # Authentication context
├── lib/
│   └── supabase.ts               # Supabase configuration
└── App.tsx                       # Main application component
```

## 🎨 Design Features

### Modern UI/UX
- **Swiss Design Principles** - Clean, minimal, and functional
- **3D Animations** - Engaging hover effects and transitions
- **Custom Cursor** - Interactive SVG cursor with gradients
- **Parallax Effects** - Smooth scrolling animations
- **Responsive Design** - Optimized for all screen sizes

### Color System
- **Primary**: Black (#000000) for main actions
- **Secondary**: Gray scale for hierarchy
- **Accent**: Gradient colors (Blue, Purple, Emerald)
- **Status Colors**: Green (success), Red (error), Yellow (warning)

### Typography
- **Font Weights**: 3 maximum (regular, medium, bold)
- **Line Spacing**: 150% for body text, 120% for headings
- **Consistent Scale**: 8px spacing system throughout

## 🗄️ Database Schema

### Core Tables
- `courses` - GPA calculator data
- `subjects` - Attendance tracking
- `assignments` - Grade management
- `study_sessions` - Study timer history
- `events` - Schedule planner
- `resumes` - Document storage metadata

### Chat System
- `user_profiles` - Extended user information
- `chat_rooms` - Chat room management
- `chat_participants` - Room membership
- `user_messages` - Real-time messaging

### Additional Features
- `student_offers` - Exclusive student discounts
- `newsletter_subscribers` - Email subscriptions

## 🔐 Security Features

### Authentication
- **Email/Password** authentication via Supabase Auth
- **Row Level Security (RLS)** on all tables
- **User isolation** - Users can only access their own data

### Data Protection
- **Secure file storage** with access controls
- **Real-time policies** for chat functionality
- **Input validation** and sanitization
- **HTTPS encryption** for all communications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Database Setup

The database schema is automatically applied through Supabase migrations. The following storage buckets are created:
- `resumes` - For resume and document storage
- `chat-files` - For chat file attachments

## 📱 Usage

### For Students
1. **Sign up** for a free account
2. **Explore tools** - Start with the GPA calculator or study timer
3. **Track progress** - Monitor attendance and grades
4. **Connect** - Join the student community and chat
5. **Discover offers** - Browse exclusive student discounts

### For Administrators
1. **Access admin panel** - Manage student offers
2. **Create offers** - Add new discounts and deals
3. **Monitor usage** - Track offer engagement
4. **Moderate content** - Ensure quality and relevance

## 🎯 Key Features Explained

### Guest Mode
- Try all tools without signing up
- Data is temporary and not saved
- Encourages conversion to registered users

### Real-time Chat
- Instant messaging between students
- File sharing capabilities
- Group chat support
- Online status indicators

### Academic Tools
- **10-point GPA scale** support
- **Attendance percentage** calculations
- **Pomodoro timer** with session tracking
- **Assignment weighting** for accurate grades
- **Calendar integration** for deadlines

### Student Offers
- Curated discounts for students
- Category-based filtering
- Expiration date tracking
- Admin-managed content

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code linting
- **Modular architecture** for maintainability
- **Component-based design** for reusability

## 🌟 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation**: Check the code comments and component structure
- **Issues**: Report bugs via GitHub issues
- **Community**: Join our student community for help and discussions

## 🎉 Acknowledgments

- **Supabase** for the excellent backend-as-a-service platform
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon library
- **React** team for the amazing frontend framework

---

**Built for students, by students.** 🎓

StudyHub is completely free to use and designed to help students succeed in their academic journey. Join thousands of students who are already using StudyHub to improve their academic performance!