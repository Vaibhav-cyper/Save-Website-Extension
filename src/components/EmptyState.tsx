import React from 'react';
import { Globe, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddWebsite: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddWebsite }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Globe className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No websites saved yet</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        Start building your collection by adding your favorite websites for quick access.
      </p>
      <button
        onClick={onAddWebsite}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        <Plus className="w-4 h-4" />
        Add Your First Website
      </button>
    </div>
  );
};