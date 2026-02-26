# 🎓 Smart Campus Analytics & Student Success Intelligence System

A production-ready, full-stack analytics platform for tracking student engagement, predicting at-risk students using ML, and providing actionable insights for academic advisors and administrators.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)

---

## 📸 Screenshots

### Landing Page
Beautiful dark-themed landing with Google OAuth authentication.

### Dashboard
<img width="1470" height="778" alt="Screenshot 2026-02-25 at 10 47 36 AM" src="https://github.com/user-attachments/assets/3341255d-8fb7-467c-951c-af381163cb08" />

- **KPI Cards**: Total students, at-risk count, avg engagement, burnout detection
- **Engagement Trend**: Weekly engagement and attendance line chart
- **Risk Distribution**: Pie chart showing high/medium/low risk students
- **Course Difficulty**: Leaderboard of challenging courses

### Students Explorer
<img width="759" height="411" alt="Screenshot 2026-02-26 at 11 11 05 AM" src="https://github.com/user-attachments/assets/c3a04208-e081-4399-bf87-737104a0f7a7" />


- Searchable and filterable student table
- Color-coded risk badges (High/Medium/Low)
- Engagement progress bars
- Pagination with 15 students per page

### Student Detail
<img width="1470" height="768" alt="Screenshot 2026-02-25 at 10 48 00 AM" src="https://github.com/user-attachments/assets/a63b9d60-2c4c-45be-a703-775e724666a8" />

- Complete student profile
- Time-series engagement charts
- **SHAP Explainability**: Visual bar chart showing risk factors
- Personalized recommendations

### Courses Analytics
<img width="1470" height="779" alt="Screenshot 2026-02-25 at 10 48 31 AM" src="https://github.com/user-attachments/assets/0d6d770c-e99a-4123-a582-93384b7f528d" />

- Course difficulty leaderboard
- Department filtering
- Course cards with avg grade, dropout rate, credits

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React 19)                      │
│  ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────────┐ │
│  │ Landing │→│ Dashboard │→│ Students │→│ Student Detail  │ │
│  └─────────┘ └───────────┘ └──────────┘ └─────────────────┘ │
│     TailwindCSS │ Shadcn/UI │ Recharts │ Framer Motion     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ /api/auth/*  │ │/api/students│ │ /api/analytics/*     │ │
│  │ Google OAuth │ │ CRUD + Filter│ │ KPIs, Trends, Risk   │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                        │
│  students │ courses │ enrollments │ risk_predictions        │
│  engagement_history │ engagement_trends │ user_sessions     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB 6+
- Yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smart-campus-analytics.git
cd smart-campus-analytics
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=campus_analytics
CORS_ORIGINS=http://localhost:3000
EOF

# Seed the database with synthetic data
python seed_data.py

# Start the server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
yarn install

# Create .env file
cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
EOF

# Start the development server
yarn start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/docs (Swagger UI)

---

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=campus_analytics
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001
    depends_on:
      - backend

volumes:
  mongo_data:
```

---

## 📁 Project Structure

```
smart-campus-analytics/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── data_generator.py      # Synthetic data generator
│   ├── seed_data.py           # Database seeding script
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main app with routing
│   │   ├── pages/
│   │   │   ├── Landing.js     # Landing page
│   │   │   ├── Dashboard.js   # Main dashboard
│   │   │   ├── StudentsExplorer.js
│   │   │   ├── StudentDetail.js
│   │   │   └── CoursesPage.js
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Sidebar.js
│   │   │   ├── dashboard/
│   │   │   │   ├── KPICard.js
│   │   │   │   └── ChartCard.js
│   │   │   └── ui/            # Shadcn components
│   │   └── index.css          # Global styles + design system
│   ├── package.json
│   └── .env
│
├── docker-compose.yml
├── Makefile
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/session` | Exchange OAuth session |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List students (paginated) |
| GET | `/api/students/{id}` | Get student details |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List courses |
| GET | `/api/courses/{id}` | Get course details |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Dashboard KPIs |
| GET | `/api/analytics/risk-distribution` | Risk level counts |
| GET | `/api/analytics/engagement-trend` | Weekly trends |
| GET | `/api/analytics/course-difficulty` | Difficulty leaderboard |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

---

## 🎨 Design System

The application uses a custom dark theme with vibrant accents:

| Element | Value |
|---------|-------|
| Background | `#020617` (Slate 950) |
| Primary | `#7C3AED` (Violet 500) |
| Secondary | `#0EA5E9` (Cyan 500) |
| Accent | `#F472B6` (Pink 400) |
| Success | `#22C55E` (Green 500) |
| Warning | `#F59E0B` (Amber 500) |
| Danger | `#EF4444` (Red 500) |

### Typography
- **Headings**: Outfit (Google Fonts)
- **Body**: Inter (Google Fonts)
- **Mono**: JetBrains Mono (Google Fonts)

---

## 📊 Data Model

### Student
```json
{
  "student_id": "STU123456",
  "name": "John Doe",
  "email": "john.doe@campus.edu",
  "major": "Computer Science",
  "year": 3,
  "gpa": 3.45,
  "risk_level": "low",
  "engagement_score": 0.78,
  "attendance_rate": 0.85,
  "late_submission_ratio": 0.12
}
```

### Risk Prediction (with SHAP)
```json
{
  "student_id": "STU123456",
  "risk_score": 0.23,
  "risk_level": "low",
  "confidence": 0.89,
  "shap_values": {
    "engagement_score": -0.15,
    "attendance_rate": -0.12,
    "late_submission_ratio": 0.08,
    "gpa": -0.05
  },
  "recommendations": [
    "Maintain current study habits - you're doing great!"
  ]
}
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
yarn test
```

### E2E Tests (Playwright)
```bash
cd frontend
yarn playwright test
```

---

## 🔧 Makefile Commands

```bash
make up          # Start all services
make down        # Stop all services
make seed        # Seed database
make test        # Run all tests
make logs        # View logs
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) - Beautiful component library
- [Recharts](https://recharts.org/) - Chart library
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework

---

## 📧 Contact

For questions or support, please open an issue or contact the maintainers.

---

**Built with ❤️ for student success**
