import React, { useState } from 'react';
import { useWorkflow } from '../../hooks/useWorkflow';
import { WorkflowStates } from '../../services/workflowEngine';

interface WorkflowActionsProps {
  entityType: 'booking' | 'invoice' | 'editing';
  entity: { id: string; status?: string };
  onUpdate?: () => void;
  className?: string;
}

const WorkflowActions: React.FC<WorkflowActionsProps> = ({
  entityType,
  entity,
  onUpdate,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const { executeTransition, getValidTransitions, isTransitioning } = useWorkflow({
    onSuccess: (message) => {
      console.log('Success:', message);
      onUpdate?.();
      setShowActions(false);
    },
    onError: (error) => {
      alert(`Error: ${error}`);
    }
  });

  const validTransitions = getValidTransitions(entityType, entity.status as WorkflowStates);

  const handleTransition = async (newStatus: WorkflowStates) => {
    const confirmed = window.confirm(
      `Are you sure you want to change status to ${newStatus}?`
    );
    
    if (confirmed) {
      await executeTransition(entityType, entity, newStatus);
    }
  };

  if (validTransitions.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowActions(!showActions)}
        disabled={isTransitioning}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
      >
        {isTransitioning ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            Actions
            <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </>
        )}
      </button>

      {showActions && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowActions(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-600 py-1 z-20">
            {validTransitions.map((status) => (
              <button
                key={status}
                onClick={() => handleTransition(status)}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Change to {status}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WorkflowActions;