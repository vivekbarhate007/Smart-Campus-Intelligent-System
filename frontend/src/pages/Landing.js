import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { 
  GraduationCap, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  Sparkles
} from "lucide-react";

const Landing = () => {
  const { user, login } = useAuth();

  const features = [
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "ML-powered risk prediction with SHAP explainability"
    },
    {
      icon: Users,
      title: "Student Success",
      description: "Track engagement and identify at-risk students early"
    },
    {
      icon: BarChart3,
      title: "Rich Dashboards",
      description: "Interactive visualizations and real-time KPIs"
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Secure access for admins, advisors, and students"
    }
  ];

  const stats = [
    { value: "5,000+", label: "Students Tracked" },
    { value: "150+", label: "Courses Analyzed" },
    { value: "94%", label: "Prediction Accuracy" },
    { value: "24/7", label: "Real-time Monitoring" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)"
          }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)"
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold font-heading">Campus Intel</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {user ? (
              <Button 
                data-testid="go-to-dashboard-btn"
                onClick={() => window.location.href = '/dashboard'}
                className="gradient-primary text-white rounded-full px-6"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                data-testid="login-btn"
                onClick={login}
                className="gradient-primary text-white rounded-full px-6"
              >
                Sign in with Google
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Hero content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">ML-Powered Student Analytics</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="gradient-text">Smart Campus</span>
              <br />
              <span className="text-foreground">Intelligence System</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Transform student success with AI-powered analytics, risk prediction, 
              and actionable insights for academic advisors and administrators.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                data-testid="get-started-btn"
                onClick={login}
                size="lg"
                className="gradient-primary text-white rounded-full px-8 py-6 text-lg glow-primary"
              >
                Get Started
                <Zap className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                data-testid="learn-more-btn"
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 text-lg border-slate-700 hover:bg-slate-800"
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center glass-hover"
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card rounded-2xl p-6 glass-hover cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-24 relative"
          >
            <div className="glass-card-heavy rounded-3xl p-2 glow-border">
              <div className="bg-slate-950 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="p-8 min-h-[300px] flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
                    {/* Mock dashboard cards */}
                    <div className="glass-card rounded-xl p-4 col-span-2">
                      <div className="h-4 w-24 bg-slate-700 rounded mb-3" />
                      <div className="h-8 w-16 bg-primary/30 rounded mb-2" />
                      <div className="h-20 bg-gradient-to-r from-primary/20 to-secondary/20 rounded" />
                    </div>
                    <div className="glass-card rounded-xl p-4">
                      <div className="h-4 w-20 bg-slate-700 rounded mb-3" />
                      <div className="space-y-2">
                        <div className="h-6 bg-green-500/20 rounded" />
                        <div className="h-6 bg-yellow-500/20 rounded" />
                        <div className="h-6 bg-red-500/20 rounded" />
                      </div>
                    </div>
                    <div className="glass-card rounded-xl p-4 col-span-3">
                      <div className="h-4 w-32 bg-slate-700 rounded mb-3" />
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <div key={i} className="flex-1 h-16 bg-primary/20 rounded" style={{ height: `${30 + i * 10}px` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Campus Intel © 2025</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Powered by Machine Learning & Real-time Analytics
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
