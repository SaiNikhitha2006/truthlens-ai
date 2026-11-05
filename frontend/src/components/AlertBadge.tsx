import React from 'react';
import { AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';

interface AlertBadgeProps {
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({ severity }) => {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 flex items-center space-x-1 animate-pulse">
          <AlertCircle className="w-3 h-3" />
          <span>CRITICAL OUTBREAK</span>
        </span>
      );
    case 'HIGH':
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>HIGH SEVERITY</span>
        </span>
      );
    case 'WARNING':
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>WARNING</span>
        </span>
      );
    case 'INFO':
    default:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan/20 text-cyan border border-cyan/40 flex items-center space-x-1">
          <Info className="w-3 h-3" />
          <span>ADVISORY</span>
        </span>
      );
  }
};
