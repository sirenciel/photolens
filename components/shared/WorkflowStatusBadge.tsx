import React from 'react';
import { WorkflowStates } from '../../services/workflowEngine';

interface WorkflowStatusBadgeProps {
  status: string;
  entityType: 'booking' | 'invoice' | 'editing';
  size?: 'sm' | 'md' | 'lg';
}

const WorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({ 
  status, 
  entityType, 
  size = 'md' 
}) => {
  const getStatusColor = (status: string, entityType: string): string => {
    // Booking statuses
    if (entityType === 'booking') {
      switch (status) {
        case WorkflowStates.BOOKING_PENDING: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case WorkflowStates.BOOKING_CONFIRMED: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case WorkflowStates.BOOKING_COMPLETED: return 'bg-green-500/20 text-green-300 border-green-500/30';
        case WorkflowStates.BOOKING_CANCELLED: return 'bg-red-500/20 text-red-300 border-red-500/30';
        default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      }
    }
    
    // Invoice statuses
    if (entityType === 'invoice') {
      switch (status) {
        case WorkflowStates.INVOICE_DRAFT: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        case WorkflowStates.INVOICE_SENT: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case WorkflowStates.INVOICE_PAID: return 'bg-green-500/20 text-green-300 border-green-500/30';
        case WorkflowStates.INVOICE_OVERDUE: return 'bg-red-500/20 text-red-300 border-red-500/30';
        default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      }
    }
    
    // Editing statuses
    if (entityType === 'editing') {
      switch (status) {
        case WorkflowStates.EDITING_QUEUE: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case WorkflowStates.EDITING_IN_PROGRESS: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case WorkflowStates.EDITING_REVIEW: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        case WorkflowStates.EDITING_REVISIONS: return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
        case WorkflowStates.EDITING_COMPLETED: return 'bg-green-500/20 text-green-300 border-green-500/30';
        default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      }
    }
    
    return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  const getSizeClasses = (size: string): string => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-4 py-2';
      default: return 'text-xs px-3 py-1.5';
    }
  };

  const getStatusIcon = (status: string, entityType: string): string => {
    if (entityType === 'booking') {
      switch (status) {
        case WorkflowStates.BOOKING_PENDING: return '⏳';
        case WorkflowStates.BOOKING_CONFIRMED: return '✓';
        case WorkflowStates.BOOKING_COMPLETED: return '🎯';
        case WorkflowStates.BOOKING_CANCELLED: return '❌';
        default: return '●';
      }
    }
    
    if (entityType === 'invoice') {
      switch (status) {
        case WorkflowStates.INVOICE_DRAFT: return '📝';
        case WorkflowStates.INVOICE_SENT: return '📧';
        case WorkflowStates.INVOICE_PAID: return '💰';
        case WorkflowStates.INVOICE_OVERDUE: return '⚠️';
        default: return '●';
      }
    }
    
    if (entityType === 'editing') {
      switch (status) {
        case WorkflowStates.EDITING_QUEUE: return '📋';
        case WorkflowStates.EDITING_IN_PROGRESS: return '✏️';
        case WorkflowStates.EDITING_REVIEW: return '👀';
        case WorkflowStates.EDITING_REVISIONS: return '🔄';
        case WorkflowStates.EDITING_COMPLETED: return '✨';
        default: return '●';
      }
    }
    
    return '●';
  };

  const colorClasses = getStatusColor(status, entityType);
  const sizeClasses = getSizeClasses(size);
  const icon = getStatusIcon(status, entityType);

  return (
    <span 
      className={`inline-flex items-center gap-1 font-medium rounded-lg border ${colorClasses} ${sizeClasses}`}
      title={`${entityType} status: ${status}`}
    >
      <span>{icon}</span>
      <span>{status}</span>
    </span>
  );
};

export default WorkflowStatusBadge;