# ArtiCube - AI-Powered Knowledge Retrieval Platform

ArtiCube is a sophisticated AI-powered knowledge retrieval platform that combines advanced search capabilities with intelligent content organization. Built with modern web technologies, it provides users with accurate, well-structured information along with properly cited sources.

## 🚀 Features

### Core Functionality
- **Intelligent Search**: AI-powered search that understands context and delivers comprehensive results
- **Smart Content Organization**: Automatically structures information into readable, scannable format
- **Source Citations**: Provides proper citations with titles, sources, links, and publication years
- **Content Management**: Save, organize, and revisit your research findings
- **Search History**: Track and revisit previous queries for continuous research workflows
- **User Authentication**: Secure user accounts with JWT-based authentication

### AI Agent System
- **Multi-Agent Architecture**: Uses Google's Agent Development Kit (ADK) for robust information retrieval
- **Sequential Processing**: Finder → Content Processor → Organizer → Formatter agent chain
- **Real-time Search**: Integrates with Google Search API for up-to-date information
- **Content Validation**: Ensures accuracy and proper source attribution

### User Experience
- **Modern UI**: Glassmorphic design with smooth animations and responsive layout
- **Performance Optimized**: Fast loading with optimized rendering and caching
- **Mobile Responsive**: Works seamlessly across all device sizes
- **Dark Theme**: Elegant dark interface designed for extended reading sessions

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **Framework**: FastAPI for high-performance async API
- **AI Agents**: Google ADK with Gemini 2.0 Flash models
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT with bcrypt password hashing
- **Search Integration**: Google Search API
- **Deployment**: Render.com with health check endpoints

### Frontend (React/TypeScript)
- **Framework**: React 19 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v7
- **Styling**: Tailwind CSS with custom glassmorphic components
- **Build Tool**: Vite for fast development and optimized builds
- **Testing**: Jest with Testing Library
- **Deployment**: Vercel with optimized static builds

### Key Technologies
- **AI/ML**: Google ADK, Gemini 2.0 Flash, LiteLLM
- **Backend**: FastAPI, Pydantic, Motor, PyJWT, Uvicorn
- **Frontend**: React, TypeScript, Redux, Tailwind CSS, Axios
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens with secure cookie handling
- **APIs**: Google Search API, Google Generative AI

## 📁 Project Structure

```
articube/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── agents/            # AI agent implementations
│   │   │   ├── knowledge_agent.py    # Main agent orchestrator
│   │   │   └── backup.py             # Backup agent implementation
│   │   ├── api/
│   │   │   ├── models/        # Pydantic data models
│   │   │   └── routers/       # API route handlers
│   │   │       ├── agent_router.py   # Agent query endpoints
│   │   │       ├── content_router.py # Content management
│   │   │       └── user_router.py    # User authentication
│   │   ├── auth/              # Authentication utilities
│   │   ├── db/                # Database configuration
│   │   └── utils/             # Utility functions
│   │       ├── content_processor.py  # Content formatting
│   │       └── json_helpers.py       # JSON utilities
│   ├── main.py                # FastAPI application entry point
│   ├── requirements.txt       # Python dependencies
│   └── render.yaml           # Render deployment config
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # Shared components
│   │   │   ├── content/       # Content-related components
│   │   │   ├── layout/        # Layout components
│   │   │   └── search/        # Search functionality
│   │   ├── pages/             # Page components
│   │   │   ├── LandingPage.tsx       # Marketing landing page
│   │   │   ├── HomePage.tsx          # Main dashboard
│   │   │   ├── SavedPage.tsx         # Saved content management
│   │   │   └── AccountPage.tsx       # User account settings
│   │   ├── store/             # Redux store configuration
│   │   │   └── slices/        # Redux slices
│   │   ├── services/          # API service layer
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   └── styles/            # CSS modules and styles
│   ├── package.json           # Node.js dependencies
│   └── vercel.json           # Vercel deployment config
├── DEPLOYMENT.md             # Deployment instructions
└── README.md                # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account
- Google API key (for search functionality)
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd articube/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment configuration**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=articube
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GOOGLE_API_KEY=your-google-api-key
CORS_ORIGINS=["http://localhost:3000", "https://your-frontend-domain.com"]
```

5. **Run the backend**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment configuration**
Create `.env.local`:
```env
VITE_API_URL=http://localhost:8000
```

4. **Run the frontend**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
# Or run specific tests
python test_integration_robustness.py
python test_simple_integration.py
```

### Frontend Tests
```bash
cd frontend
npm test
# Run tests in watch mode
npm test -- --watch
```

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Configure build settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Set environment variables in Render dashboard
4. Deploy using the provided `render.yaml` configuration

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Configure environment variables
4. Deploy using the provided `vercel.json` configuration

Detailed deployment instructions are available in [DEPLOYMENT.md](DEPLOYMENT.md).

## 📊 AI Agent Architecture

ArtiCube uses a sophisticated multi-agent system built on Google's Agent Development Kit:

### Agent Flow
1. **Finder Agent**: Searches for relevant information using Google Search API
2. **Content Processor**: Extracts and validates content from search results
3. **Organizer Agent**: Structures information into logical, readable sections
4. **Formatter Agent**: Applies final formatting and ensures proper citations

### Key Features
- **Asynchronous Processing**: Non-blocking agent execution
- **State Management**: Reliable session state across agent transitions
- **Error Recovery**: Graceful handling of API failures and timeouts
- **Source Validation**: Ensures all citations are accurate and accessible

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user profile

### Knowledge Retrieval
- `POST /api/agent/query` - Query the AI agent for information
- `GET /api/agent/history` - Get user's search history

### Content Management
- `POST /api/content/save` - Save content for later reference
- `GET /api/content/saved` - Get user's saved content
- `DELETE /api/content/{content_id}` - Delete saved content

### Health Checks
- `GET /health` - Basic health check
- `GET /api/v1/health` - API version health check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 👨‍💻 Developer

**Hitesh Sakamuri**
- Full-stack development
- AI agent architecture
- System design and deployment

## 🔗 Links

- [Live Application](https://your-domain.com)
- [API Documentation](https://your-api-domain.com/docs)
- [Deployment Guide](DEPLOYMENT.md)

---

Built with ❤️ using modern web technologies and AI-powered knowledge retrieval.
