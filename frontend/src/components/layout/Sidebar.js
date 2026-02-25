import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../App";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/students", label: "Students", icon: Users },
    { path: "/courses", label: "Courses", icon: BookOpen },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <NavLink
        to={item.path}
        data-testid={`nav-${item.label.toLowerCase()}`}
        onClick={() => setMobileOpen(false)}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
          ${isActive 
            ? "bg-primary/20 text-primary border border-primary/30" 
            : "text-muted-foreground hover:text-foreground hover:bg-slate-800/50"
          }
        `}
      >
        <item.icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
          />
        )}
      </NavLink>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold">Campus Intel</span>
            <span className="text-xs text-muted-foreground block">Analytics System</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 p-3 h-auto hover:bg-slate-800/50"
              data-testid="user-menu-trigger"
            >
              <Avatar className="w-9 h-9">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium truncate">{user?.name || "User"}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card border-slate-700">
            <DropdownMenuItem className="gap-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem 
              onClick={logout}
              className="gap-2 text-red-400 focus:text-red-400"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card-heavy border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Campus Intel</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 glass-card-heavy border-r border-slate-800 flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 glass-card-heavy border-r border-slate-800 flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default Sidebar;
