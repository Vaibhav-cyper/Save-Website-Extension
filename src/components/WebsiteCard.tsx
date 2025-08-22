import React from 'react';
import { ExternalLink,  Trash2 } from 'lucide-react';
import type { Website } from '../types/Website';
import {StoreService} from "@/service/db"
import { toast } from 'sonner'
interface WebsiteCardProps {
  website: Website;
  onOpenTab: (WebsiteURL: string) => void;
  onDelete?: () => void;
}

export const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, onOpenTab,  onDelete }) => {
  const faviconURL = `https://www.google.com/s2/favicons?domain=${website.WebsiteURL}&sz=32`
  const handleOpenTab = () => {
    onOpenTab(website.WebsiteURL);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${website.WebsiteName}"?`)) {
      try {
        await StoreService.deleteSite(website.WebsiteURL);
        toast.success("Website deleted successfully!");
        // Call the onDelete callback to refresh the parent component
        if (onDelete) {
          onDelete();
        }
      } catch (error) {
        console.error('Error deleting site:', error);
        toast.error('Failed to delete the website. Please try again.');
      }
    }
  };

  const formatUrl = (WebsiteURL: string) => {
    try {
      const urlObj = new URL(WebsiteURL);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return WebsiteURL;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
           <img src={faviconURL} alt="Website Favicon" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">
              {website.WebsiteName}
            </h3>
            <p className="text-xs text-gray-500 truncate mb-2">
              {formatUrl(website.WebsiteURL)}
            </p>
            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
              {website.Category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenTab}
            className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex-shrink-0"
            aria-label={`Open ${website.WebsiteName} in new tab`}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex-shrink-0"
            aria-label={`Delete ${website.WebsiteName}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};