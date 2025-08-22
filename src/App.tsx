import { useState, useEffect } from "react";
import { Plus, Search, User, RefreshCw } from "lucide-react";
import type { Website, FormData } from "@/types/Website";
import { WebsiteCard } from "@/components/WebsiteCard";
import { SaveWebsiteModal } from "@/components/SaveWebsiteModal";
import { EmptyState } from "@/components/EmptyState";
import { UserAccountModal } from "@/components/UserAccountModal";
import { useAuth } from "@/hooks/useAuth";
import { StoreService } from "@/service/db";
import { Toaster, toast} from 'sonner'

function App() {
  const { user, signInWithGoogle } = useAuth();
  const [websites, setWebsites] = useState<Website[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Get Saved Sites and Handle keyboard shortcuts
  useEffect(() => {
    const handleGetSavedSites = async () => {
      setIsLoading(true);
      try {
        const result = await StoreService.getAllsites();
        
        setWebsites(result);
      } catch (error) {
        console.error("Failed to get website:", error);
        toast.error("Failed to load websites");
      } finally {
        setIsLoading(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "n") {
          e.preventDefault();
          setIsModalOpen(true);
        }
      }
    };

    const saveWebsiteListener = (msg: any, sendResponse: any) => {
      
      if (msg.type === "SITE_SAVED") {
        // Show notification that shortcut was triggered
        toast.success("Keyboard shortcut activated!");

        // Auto-open the modal
        setIsModalOpen(true);

        // Send response back to background script
        sendResponse({ success: true });
        return true; // Keep the message channel open for async response
      }
      return false; // Indicate synchronous handling for other message types
    };

    chrome.runtime.onMessage.addListener(saveWebsiteListener);
    window.addEventListener("keydown", handleKeyDown);
    handleGetSavedSites();

    // Cleanup function - this runs when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      chrome.runtime.onMessage.removeListener(saveWebsiteListener);
    };
  }, []);

  // Function to refresh websites list
  const refreshWebsites = async () => {
    try {
      const result = await StoreService.getAllsites();
      setWebsites(result);
    } catch (error) {
      console.error("Failed to refresh websites:", error);
      toast.error("Failed to refresh websites");
    }
  };

  const filteredWebsites = websites?.filter(
    (website) =>
      website.WebsiteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.WebsiteURL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.Category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  

  const handleOpenTab = (url: string) => {
    try {
      // In a real Chrome extension, this would use chrome.tabs.create
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open tab:", error);
      toast.error("Failed to open website");
    }
  };

  const handleSaveWebsite = async (formData: FormData) => {
    setIsLoading(true);
    try {
      if (user === null || user === undefined || !user.id) {
        toast.error("You're not logged In");
        await signInWithGoogle();
        return;
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      const websiteId = crypto.randomUUID();
      await StoreService.insert(user.id, websiteId, formData.name, formData.url, formData.category);

      // Refresh the websites list after saving
      await refreshWebsites();

      setIsModalOpen(false);
      toast.success("Website saved successfully!");
    } catch (error) {
      console.error("Failed to save website:", error);
      toast.error("Failed to save website");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Simulate sync operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Websites synced successfully!");
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full max-w-lg min-w-md  mx-auto bg-gray-50 min-h-screen">
      {/* adding notification toaster */}
      <Toaster position="top-center" richColors/> 
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
              <img src="icon_32x32.png" alt="Logo" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Save This Site</h1>
              <p className="text-xs text-gray-500">{websites?.length} sites saved</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Open account information"
              title="Account"
            >
              <User className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sync websites"
              title="Sync"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${isSyncing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search websites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 pb-20">
        {(filteredWebsites ?? []).length === 0 ? (
          searchTerm ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No websites match your search</p>
            </div>
          ) : (
            <EmptyState onAddWebsite={() => setIsModalOpen(true)} />
          )
        ) : (
          <div className="space-y-3">
            {(filteredWebsites ?? []).map((website) => (
              <WebsiteCard
                key={website.WebsiteId}
                website={website}
                onOpenTab={handleOpenTab}
                onDelete={refreshWebsites}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {(websites ?? []).length > 0 && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 hover:scale-105"
          aria-label="Add new website (Ctrl+N)"
          title="Add new website (Ctrl+N)"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modal */}
      <SaveWebsiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWebsite}
        isLoading={isLoading}
      />

      {/* Account Modal */}
      <UserAccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />

      
    </div>
  );
}

export default App;
