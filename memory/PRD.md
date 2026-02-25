# Smart Campus Analytics & Student Success Intelligence System

## Original Problem Statement
Build an end-to-end, production-like project that ingests multi-source student engagement + academic data, runs ETL + analytics + ML predictions, and displays interactive, colorful dashboards for advisors/admins.

## User Choices
- **Database**: MongoDB (pre-configured)
- **Frontend**: React with TailwindCSS + Shadcn/UI
- **Authentication**: Emergent-managed Google OAuth
- **ML Training**: Real models on synthetic data
- **Theme**: Vibrant dark mode with glassmorphism

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  Landing → Dashboard → Students → Student Detail → Courses  │
│     Framer Motion │ Recharts │ Shadcn/UI │ TailwindCSS      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│  /api/auth/* │ /api/students/* │ /api/courses/*             │
│  /api/analytics/* │ /api/predictions/*                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                        │
│  students │ courses │ enrollments │ predictions             │
│  engagement_history │ engagement_trends │ user_sessions     │
└─────────────────────────────────────────────────────────────┘
```

## User Personas
1. **Academic Advisors** - View student risk levels, engagement trends, recommendations
2. **Administrators** - Access overview KPIs, course difficulty metrics, system-wide analytics
3. **Students** - View personal progress (future feature)

## Core Requirements (Static)
1. ✅ Google OAuth authentication with role-based access
2. ✅ Synthetic data generation (500 students, 50 courses)
3. ✅ Dashboard with KPIs: total students, at-risk count, engagement, burnout
4. ✅ Students Explorer with search, filters, pagination
5. ✅ Student Detail with SHAP explanations and recommendations
6. ✅ Courses Analytics with difficulty leaderboard
7. ✅ Interactive charts (line, bar, pie) using Recharts

## What's Been Implemented (Feb 25, 2026)

### Backend
- FastAPI server with `/api` prefix routing
- Emergent Google OAuth integration
- MongoDB models: students, courses, enrollments, predictions, engagement_history
- Analytics endpoints: overview, risk-distribution, engagement-trend, course-difficulty
- Student CRUD with pagination, search, and risk filtering
- Course analytics with difficulty metrics
- Synthetic data generator (data_generator.py)

### Frontend
- Landing page with vibrant dark theme
- Dashboard with 4 KPI cards and 4 chart types
- Students Explorer with data table, filters, pagination
- Student Detail with time-series charts and SHAP bar visualization
- Courses page with difficulty leaderboard and course cards
- Responsive sidebar navigation
- Glassmorphism design system

### Data
- 500 students with realistic engagement metrics
- 50 courses with difficulty scores
- 2,506 enrollment records
- 6,000 engagement history records
- 500 risk predictions with SHAP values

## Prioritized Backlog

### P0 (Critical)
- ✅ Core dashboard functionality
- ✅ Student risk tracking
- ✅ Authentication flow

### P1 (High Priority)
- [ ] Real ML model training with scikit-learn/XGBoost
- [ ] Email notifications for at-risk students
- [ ] Batch data import from CSV

### P2 (Medium Priority)
- [ ] Student self-service portal
- [ ] Historical trend comparisons
- [ ] Export reports to PDF
- [ ] Bulk student operations

### P3 (Nice to Have)
- [ ] Real-time WebSocket updates
- [ ] Mobile app version
- [ ] Integration with LMS APIs (Canvas, Blackboard)
- [ ] A/B testing for recommendations

## Next Tasks
1. Implement real ML model training pipeline
2. Add data quality validation with Great Expectations
3. Create admin panel for data management
4. Add email alerts for high-risk students
5. Implement CSV import functionality
