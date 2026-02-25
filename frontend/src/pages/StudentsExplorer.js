import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, User } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentsExplorer = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15"
      });
      
      if (search) params.append("search", search);
      if (riskFilter !== "all") params.append("risk_level", riskFilter);

      const response = await fetch(`${API}/students?${params}`, {
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
        setTotalPages(data.pages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, riskFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getRiskBadge = (level) => {
    const classes = {
      high: "risk-badge-high",
      medium: "risk-badge-medium",
      low: "risk-badge-low"
    };
    return (
      <span className={classes[level] || classes.low}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold">Students Explorer</h1>
            <p className="text-muted-foreground mt-1">
              Browse and filter {total.toLocaleString()} students
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-testid="search-input"
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-700"
              />
            </div>
            
            <Select 
              value={riskFilter} 
              onValueChange={(value) => {
                setRiskFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger 
                data-testid="risk-filter"
                className="w-full md:w-48 bg-slate-900/50 border-slate-700"
              >
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Table */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium">Student</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Major</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Year</TableHead>
                    <TableHead className="text-muted-foreground font-medium">GPA</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Engagement</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Attendance</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(10).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-slate-800">
                        <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <motion.tbody
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="contents"
                    >
                      {students.map((student) => (
                        <motion.tr
                          key={student.student_id}
                          variants={rowVariants}
                          onClick={() => navigate(`/students/${student.student_id}`)}
                          className="border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors"
                          data-testid={`student-row-${student.student_id}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-xs text-muted-foreground">{student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{student.major}</TableCell>
                          <TableCell className="text-muted-foreground">Year {student.year}</TableCell>
                          <TableCell>
                            <span className={student.gpa >= 3.0 ? "text-green-400" : student.gpa >= 2.0 ? "text-yellow-400" : "text-red-400"}>
                              {student.gpa?.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full"
                                  style={{ 
                                    width: `${(student.engagement_score || 0) * 100}%`,
                                    backgroundColor: student.engagement_score >= 0.7 ? "#22C55E" : student.engagement_score >= 0.4 ? "#F59E0B" : "#EF4444"
                                  }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {((student.engagement_score || 0) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              {((student.attendance_rate || 0) * 100).toFixed(0)}%
                            </span>
                          </TableCell>
                          <TableCell>{getRiskBadge(student.risk_level)}</TableCell>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-slate-800">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * 15) + 1} to {Math.min(page * 15, total)} of {total} students
              </div>
              <div className="flex items-center gap-2">
                <Button
                  data-testid="prev-page-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  data-testid="next-page-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default StudentsExplorer;
