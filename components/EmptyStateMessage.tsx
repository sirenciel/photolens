import React from 'react';

interface EmptyStateMessageProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({
  title,
  message,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0v6h3m5 0h3v-6m-3 0V7"/>
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mb-6">{message}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {actionText}
        </button>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-yellow-800 mb-1">Database Setup Required</p>
            <p className="text-yellow-700">
              Your database appears to be empty. Please add some initial data through the Supabase dashboard 
              to get started. Check the README-DATABASE-SETUP.md file for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyStateMessage;