import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { LogOut, User, Loader2 } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
export default function AuthButton() {
  const { user, isLoading, signInWithGoogle, signOut, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
          <User className="w-8 h-8 p-1 bg-gray-300 rounded-full" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{/* {user.name} */} User Name</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <Button onClick={signOut} variant="outline" size="sm" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={signInWithGoogle}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={isLoading}
      >
        <FaGoogle style={{ height: 18, width: 18 }} />
        Sign in with Google
      </Button>
    </div>
  );
}
