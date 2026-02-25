import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import ChartCard from "../components/dashboard/ChartCard";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Search, BookOpen, Users, TrendingUp, AlertTriangle } from "lucide-react";
import {
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

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");

  const departments = [
    "Computer Science", "Data Science", "Mathematics", "Physics", "Chemistry",
    "Biology", "Psychology", "Economics", "Business Administration", "Engineering"
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "50" });
        if (department !== "all") params.append("department", department);

        const response = await fetch(`${API}/courses?${params}`, {
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [department]);

  const filteredCourses = courses.filter(course => 
    search === "" || 
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.code.toLowerCase().includes(search.toLowerCase())
  );

  const difficultyChartData = filteredCourses
    .sort((a, b) => b.difficulty_score - a.difficulty_score)
    .slice(0, 8)
    .map(course => ({
      code: course.code,
      difficulty: (course.difficulty_score * 100).toFixed(0),
      name: course.name
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-lg p-3 border border-slate-700">
          <p className="text-sm font-medium text-foreground">{payload[0].payload.name}</p>
          <p className="text-xs text-muted-foreground">
            Difficulty: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  const getDifficultyColor = (score) => {
    if (score >= 0.7) return "#EF4444";
    if (score >= 0.4) return "#F59E0B";
    return "#22C55E";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
            <h1 className="text-3xl font-bold">Courses Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Explore course difficulty metrics and performance data
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div 
            variants={itemVariants}
            className="glass-card rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-testid="course-search"
                placeholder="Search courses by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-700"
              />
            </div>
            
            <Select 
              value={department} 
              onValueChange={setDepartment}
            >
              <SelectTrigger 
                data-testid="department-filter"
                className="w-full md:w-64 bg-slate-900/50 border-slate-700"
              >
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Difficulty Chart */}
          <motion.div variants={itemVariants} className="mb-6">
            <ChartCard 
              title="Course Difficulty Leaderboard" 
              subtitle="Top challenging courses by difficulty score"
              data-testid="difficulty-chart"
            >
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={difficultyChartData}
                    margin={{ bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis 
                      dataKey="code" 
                      stroke="#64748b" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="difficulty" radius={[4, 4, 0, 0]}>
                      {difficultyChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getDifficultyColor(entry.difficulty / 100)} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </motion.div>

          {/* Course Cards Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))
            ) : (
              filteredCourses.map((course, index) => (
                <motion.div
                  key={course.course_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="glass-card rounded-2xl p-5 glass-hover cursor-pointer"
                  data-testid={`course-card-${course.course_id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold gradient-text">{course.code}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            course.difficulty_score >= 0.7 
                              ? "border-red-500/50 text-red-400" 
                              : course.difficulty_score >= 0.4 
                                ? "border-yellow-500/50 text-yellow-400" 
                                : "border-green-500/50 text-green-400"
                          }`}
                        >
                          {course.difficulty_score >= 0.7 ? "Hard" : course.difficulty_score >= 0.4 ? "Medium" : "Easy"}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-medium text-foreground">{course.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{course.instructor}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-secondary" />
                        <span className="text-sm font-bold text-secondary">
                          {course.avg_grade?.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">Avg Grade</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">
                          {((course.dropout_rate || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">Dropout</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-3 h-3 text-primary" />
                        <span className="text-sm font-bold text-primary">
                          {course.credits}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">Credits</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Difficulty</span>
                      <span className="font-medium">{((course.difficulty_score || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(course.difficulty_score || 0) * 100}%`,
                          backgroundColor: getDifficultyColor(course.difficulty_score)
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default CoursesPage;
