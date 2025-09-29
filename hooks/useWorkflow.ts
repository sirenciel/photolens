// Custom hook for workflow management
import { useState, useCallback } from 'react';
import { WorkflowEngine, WorkflowStates } from '../services/workflowEngine';
import { useNotifications } from '../components/shared/NotificationProvider';

interface UseWorkflowOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const useWorkflow = (options: UseWorkflowOptions = {}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { addNotification } = useNotifications();

  const executeTransition = useCallback(async <T extends { id: string; status?: string }>(
    entityType: 'booking' | 'invoice' | 'editing',
    entity: T,
    newStatus: WorkflowStates,
    customMessage?: string
  ) => {
    setIsTransitioning(true);
    
    try {
      const result = await WorkflowEngine.executeTransition(
        entityType,
        entity,
        newStatus
      );

      if (result.success) {
        const message = customMessage || 
          `${entityType} status updated to ${newStatus}`;
        
        // Show success notification
        addNotification({
          type: 'success',
          message: message
        });
        
        options.onSuccess?.(message);
        return true;
      } else {
        // Show error notification
        addNotification({
          type: 'error',
          message: result.error || 'Transition failed'
        });
        
        options.onError?.(result.error || 'Transition failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show error notification
      addNotification({
        type: 'error',
        message: errorMessage
      });
      
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsTransitioning(false);
    }
  }, [options, addNotification]);

  const getValidTransitions = useCallback((
    entityType: 'booking' | 'invoice' | 'editing',
    currentStatus: WorkflowStates
  ): WorkflowStates[] => {
    return WorkflowEngine.getValidTransitions(entityType, currentStatus);
  }, []);

  const isValidTransition = useCallback((
    entityType: 'booking' | 'invoice' | 'editing',
    from: WorkflowStates,
    to: WorkflowStates
  ): boolean => {
    return WorkflowEngine.isValidTransition(entityType, from, to);
  }, []);

  return {
    executeTransition,
    getValidTransitions,
    isValidTransition,
    isTransitioning
  };
};