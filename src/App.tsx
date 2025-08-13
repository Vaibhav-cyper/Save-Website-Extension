import { useState, useEffect } from "react";
import { Plus, Search, User, RefreshCw } from "lucide-react";
import type { Website, FormData } from "@/types/Website";
import { WebsiteCard } from "@/components/WebsiteCard";
import { SaveWebsiteModal } from "@/components/SaveWebsiteModal";
import { EmptyState } from "@/components/EmptyState";
import { UserAccountModal } from "@/components/UserAccountModal";

// login
import { AuthButton } from "./components/AuthButton";
import { useAuth } from "@/hooks/useAuth";
import { getChromeExtensionId } from "./utils/extension";
// import { SupabaseWebsiteService } from "./service/supabaseDb";
// Sample data for demonstration
const initialWebsites: Website[] = [
  {
    id: "1",
    name: "GitHub",
    url: "https://github.com",
    category: "Work",
    dateAdded: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    category: "Learning",
    dateAdded: new Date("2024-01-14"),
  },
  {
    id: "3",
    name: "Figma",
    url: "https://figma.com",
    category: "Work",
    dateAdded: new Date("2024-01-13"),
  },
  {
    id: "4",
    name: "YouTube",
    url: "https://youtube.com",
    category: "Entertainment",
    dateAdded: new Date("2024-01-12"),
  },
  {
    id: "5",
    name: "Stack Overflow",
    url: "https://stackoverflow.com",
    category: "Learning",
    dateAdded: new Date("2024-01-11"),
  },
];
const extensionId = getChromeExtensionId()
console.log('extensionId',extensionId)
function App() {
  const { isAuthenticated } = useAuth();
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const filteredWebsites = websites.filter(
    (website) =>
      website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenTab = (url: string) => {
    try {
      // In a real Chrome extension, this would use chrome.tabs.create
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open tab:", error);
      showNotification("Failed to open website");
    }
  };

  const handleSaveWebsite = async (formData: FormData) => {
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newWebsite: Website = {
        id: Date.now().toString(),
        name: formData.name,
        url: formData.url,
        category: formData.category,
        dateAdded: new Date(),
      };

      setWebsites((prev) => [newWebsite, ...prev]);
      setIsModalOpen(false);
      showNotification("Website saved successfully!");
    } catch (error) {
      console.error("Failed to save website:", error);
      showNotification("Failed to save website");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Simulate sync operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showNotification("Websites synced successfully!");
    } catch (error) {
      console.error("Sync failed:", error);
      showNotification("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteWebsite = (websiteId: string) => {
    setWebsites((prev) => prev.filter((website) => website.id !== websiteId));
    showNotification("Website deleted successfully!");
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "n") {
          e.preventDefault();
          setIsModalOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-50 max-h-screen">
      {!isAuthenticated && <AuthButton />}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
              <img src="icon_32x32.png" alt="Logo" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Save This Site</h1>
              <p className="text-xs text-gray-500">{websites.length} sites saved</p>
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
        {filteredWebsites.length === 0 ? (
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
            {filteredWebsites.map((website) => (
              <WebsiteCard
                key={website.id}
                website={website}
                onOpenTab={handleOpenTab}
                onDelete={handleDeleteWebsite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {websites.length > 0 && (
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

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300">
          {notification}
        </div>
      )}
    </div>
  );
}

export default App;
