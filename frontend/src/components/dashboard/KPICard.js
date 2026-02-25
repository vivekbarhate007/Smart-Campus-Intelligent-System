import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const KPICard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendUp = true, 
  color = "primary",
  ...props 
}) => {
  const colorClasses = {
    primary: "text-primary bg-primary/20",
    secondary: "text-secondary bg-secondary/20",
    danger: "text-red-400 bg-red-400/20",
    warning: "text-yellow-400 bg-yellow-400/20",
    success: "text-green-400 bg-green-400/20"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-card rounded-2xl p-5 glass-hover cursor-pointer"
      {...props}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            typeof trendUp === "boolean" 
              ? (trendUp ? "text-green-400" : "text-red-400")
              : "text-muted-foreground"
          }`}>
            {typeof trendUp === "boolean" && (
              trendUp 
                ? <TrendingUp className="w-3 h-3" /> 
                : <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
};

export default KPICard;
