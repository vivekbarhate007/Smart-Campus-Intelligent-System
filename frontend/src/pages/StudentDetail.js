import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import ChartCard from "../components/dashboard/ChartCard";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [engagementHistory, setEngagementHistory] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`${API}/students/${studentId}`, {
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          setStudent(data.student);
          setPrediction(data.prediction);
          setEngagementHistory(data.engagement_history || []);
          setEnrollments(data.enrollments || []);
        }
      } catch (error) {
        console.error("Failed to fetch student:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const getRiskBadge = (level) => {
    const styles = {
      high: "bg-red-500/20 text-red-400 border-red-500/50",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      low: "bg-green-500/20 text-green-400 border-green-500/50"
    };
    return (
      <Badge variant="outline" className={`${styles[level]} text-sm px-3 py-1`}>
        {level === "high" && <AlertTriangle className="w-3 h-3 mr-1" />}
        {level === "medium" && <TrendingDown className="w-3 h-3 mr-1" />}
        {level === "low" && <CheckCircle className="w-3 h-3 mr-1" />}
        {level.charAt(0).toUpperCase() + level.slice(1)} Risk
      </Badge>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {(entry.value * 100).toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Prepare SHAP data for visualization
  const shapData = prediction?.shap_values ? 
    Object.entries(prediction.shap_values)
      .map(([feature, value]) => ({
        feature: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value,
        fill: value > 0 ? "#EF4444" : "#22C55E"
      }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    : [];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested student could not be found.</p>
            <Button onClick={() => navigate("/students")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 overflow-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-6">
            <Button 
              data-testid="back-btn"
              variant="ghost" 
              onClick={() => navigate("/students")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Button>
          </motion.div>

          {/* Student Profile Header */}
          <motion.div 
            variants={itemVariants}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-2xl font-bold" data-testid="student-name">{student.name}</h1>
                  {getRiskBadge(student.risk_level)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {student.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="w-4 h-4" />
                    {student.major}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    Year {student.year}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Enrolled {student.enrollment_date}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text">{student.gpa?.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">GPA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">{((student.engagement_score || 0) * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{((student.attendance_rate || 0) * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Attendance</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Engagement Time Series */}
            <motion.div variants={itemVariants}>
              <ChartCard 
                title="Engagement Over Time" 
                subtitle="Weekly engagement and attendance trends"
                data-testid="engagement-chart"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={engagementHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#64748b" 
                      fontSize={12}
                      tickFormatter={(v) => `W${v}`}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12}
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="engagement_score" 
                      stroke="#7C3AED" 
                      strokeWidth={2}
                      dot={false}
                      name="Engagement"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="attendance_rate" 
                      stroke="#0EA5E9" 
                      strokeWidth={2}
                      dot={false}
                      name="Attendance"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="submission_rate" 
                      stroke="#22C55E" 
                      strokeWidth={2}
                      dot={false}
                      name="Submissions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </motion.div>

            {/* SHAP Explanations */}
            <motion.div variants={itemVariants}>
              <ChartCard 
                title="Risk Factors (SHAP)" 
                subtitle="Top drivers for risk prediction"
                data-testid="shap-chart"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart 
                    data={shapData} 
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke="#64748b" 
                      fontSize={12}
                      domain={[-0.5, 0.5]}
                    />
                    <YAxis 
                      dataKey="feature" 
                      type="category" 
                      stroke="#64748b" 
                      fontSize={11}
                      width={90}
                    />
                    <Tooltip 
                      formatter={(value) => [value > 0 ? "Increases Risk" : "Decreases Risk", "Impact"]}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {shapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500" />
                    <span className="text-muted-foreground">Increases Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-muted-foreground">Decreases Risk</span>
                  </div>
                </div>
              </ChartCard>
            </motion.div>
          </div>

          {/* Recommendations */}
          {prediction?.recommendations && (
            <motion.div 
              variants={itemVariants}
              className="glass-card rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Personalized Recommendations</h3>
                  <p className="text-xs text-muted-foreground">Based on risk analysis</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {prediction.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    data-testid={`recommendation-${index}`}
                  >
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Enrollments */}
          {enrollments.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Current Enrollments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrollments.slice(0, 6).map((enrollment) => (
                  <div 
                    key={enrollment.enrollment_id}
                    className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{enrollment.course_id}</span>
                      <Badge variant="outline" className={
                        enrollment.status === "completed" ? "border-green-500/50 text-green-400" :
                        enrollment.status === "dropped" ? "border-red-500/50 text-red-400" :
                        "border-primary/50 text-primary"
                      }>
                        {enrollment.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{enrollment.term}</div>
                    {enrollment.grade && (
                      <div className="mt-2 text-lg font-bold">
                        Grade: <span className={
                          enrollment.grade >= 80 ? "text-green-400" :
                          enrollment.grade >= 60 ? "text-yellow-400" :
                          "text-red-400"
                        }>{enrollment.grade?.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default StudentDetail;
