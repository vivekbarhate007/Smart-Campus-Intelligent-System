import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../App";
import Sidebar from "../components/layout/Sidebar";
import KPICard from "../components/dashboard/KPICard";
import ChartCard from "../components/dashboard/ChartCard";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Flame,
  BookOpen,
  GraduationCap
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { Skeleton } from "../components/ui/skeleton";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [riskDistribution, setRiskDistribution] = useState(null);
  const [engagementTrend, setEngagementTrend] = useState([]);
  const [courseDifficulty, setCourseDifficulty] = useState([]);
  const [burnoutHeatmap, setBurnoutHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, riskRes, trendRes, difficultyRes, burnoutRes] = await Promise.all([
          fetch(`${API}/analytics/overview`, { credentials: "include" }),
          fetch(`${API}/analytics/risk-distribution`, { credentials: "include" }),
          fetch(`${API}/analytics/engagement-trend`, { credentials: "include" }),
          fetch(`${API}/analytics/course-difficulty`, { credentials: "include" }),
          fetch(`${API}/analytics/burnout-heatmap`, { credentials: "include" })
        ]);

        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (riskRes.ok) setRiskDistribution(await riskRes.json());
        if (trendRes.ok) setEngagementTrend(await trendRes.json());
        if (difficultyRes.ok) setCourseDifficulty(await difficultyRes.json());
        if (burnoutRes.ok) setBurnoutHeatmap(await burnoutRes.json());
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const RISK_COLORS = {
    high: "#EF4444",
    medium: "#F59E0B",
    low: "#22C55E"
  };

  const pieData = riskDistribution ? [
    { name: "High Risk", value: riskDistribution.high, color: RISK_COLORS.high },
    { name: "Medium Risk", value: riskDistribution.medium, color: RISK_COLORS.medium },
    { name: "Low Risk", value: riskDistribution.low, color: RISK_COLORS.low }
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 overflow-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="gradient-text">{user?.name || "User"}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your campus analytics
            </p>
          </motion.div>

          {/* KPI Cards - Bento Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {loading ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </>
            ) : (
              <>
                <KPICard
                  data-testid="kpi-total-students"
                  icon={Users}
                  label="Total Students"
                  value={overview?.total_students || 0}
                  trend="+12%"
                  trendUp={true}
                  color="primary"
                />
                <KPICard
                  data-testid="kpi-at-risk"
                  icon={AlertTriangle}
                  label="At-Risk Students"
                  value={overview?.at_risk_count || 0}
                  trend="-5%"
                  trendUp={false}
                  color="danger"
                />
                <KPICard
                  data-testid="kpi-engagement"
                  icon={TrendingUp}
                  label="Avg Engagement"
                  value={`${overview?.avg_engagement_score || 0}%`}
                  trend="+3%"
                  trendUp={true}
                  color="secondary"
                />
                <KPICard
                  data-testid="kpi-burnout"
                  icon={Flame}
                  label="Burnout Detected"
                  value={overview?.burnout_weeks_detected || 0}
                  trend="This week"
                  color="warning"
                />
              </>
            )}
          </motion.div>

          {/* Charts Grid - Bento Style */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Engagement Trend - Large */}
            <motion.div variants={itemVariants} className="lg:col-span-8">
              <ChartCard 
                title="Engagement Trend" 
                subtitle="Weekly engagement and attendance rates"
                data-testid="chart-engagement-trend"
              >
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={engagementTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis 
                        dataKey="week" 
                        stroke="#64748b" 
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="#7C3AED" 
                        strokeWidth={3}
                        dot={false}
                        name="Engagement"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="attendance" 
                        stroke="#0EA5E9" 
                        strokeWidth={3}
                        dot={false}
                        name="Attendance"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </motion.div>

            {/* Risk Distribution Pie */}
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <ChartCard 
                title="Risk Distribution" 
                subtitle="Students by risk level"
                data-testid="chart-risk-distribution"
              >
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="flex justify-center gap-4 mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </motion.div>

            {/* Course Difficulty Leaderboard */}
            <motion.div variants={itemVariants} className="lg:col-span-6">
              <ChartCard 
                title="Course Difficulty" 
                subtitle="Top challenging courses"
                data-testid="chart-course-difficulty"
              >
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart 
                      data={courseDifficulty.slice(0, 6)} 
                      layout="vertical"
                      margin={{ left: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis 
                        dataKey="code" 
                        type="category" 
                        stroke="#64748b" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="difficulty_score" 
                        fill="#7C3AED" 
                        radius={[0, 4, 4, 0]}
                        name="Difficulty"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="lg:col-span-6">
              <ChartCard 
                title="Quick Overview" 
                subtitle="Campus metrics at a glance"
                data-testid="quick-overview"
              >
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="glass-card rounded-xl p-4 text-center glass-hover">
                    <BookOpen className="w-6 h-6 mx-auto mb-2 text-secondary" />
                    <div className="text-2xl font-bold">{overview?.total_courses || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Courses</div>
                  </div>
                  <div className="glass-card rounded-xl p-4 text-center glass-hover">
                    <GraduationCap className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{overview?.avg_gpa || 0}</div>
                    <div className="text-xs text-muted-foreground">Avg GPA</div>
                  </div>
                  <div className="glass-card rounded-xl p-4 text-center glass-hover">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{overview?.avg_attendance_rate || 0}%</div>
                    <div className="text-xs text-muted-foreground">Attendance Rate</div>
                  </div>
                  <div className="glass-card rounded-xl p-4 text-center glass-hover">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <div className="text-2xl font-bold">{overview?.medium_risk_count || 0}</div>
                    <div className="text-xs text-muted-foreground">Medium Risk</div>
                  </div>
                </div>
              </ChartCard>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
