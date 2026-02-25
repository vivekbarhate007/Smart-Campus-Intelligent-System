import React from "react";
import { motion } from "framer-motion";

const ChartCard = ({ title, subtitle, children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 h-full"
      {...props}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="w-full">
        {children}
      </div>
    </motion.div>
  );
};

export default ChartCard;
