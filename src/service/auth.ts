import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";
import { isChromeIdentityAvailable, getChromeExtensionId } from "../utils/extension";

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {
    this.initializeAuth();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeAuth() {
    // Check for existing session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    this.currentUser = session?.user || null;

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      console.log("Auth state changed:", event, session?.user);
    });
  }

 
  public async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if we're in a Chrome extension context
      if (!isChromeIdentityAvailable()) {
        console.error("Chrome extension APIs not available");
        return { success: false, error: "Chrome extension environment required for Google sign-in" };
      }

      const extensionId = getChromeExtensionId();
      if (!extensionId) {
        console.error("Cannot get Chrome extension ID");
        return { success: false, error: "Cannot get Chrome extension ID" };
      }

      // Use Supabase's OAuth URL with Chrome extension redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `https://${extensionId}.chromiumapp.org/`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Supabase OAuth error:", error);
        return { success: false, error: error.message };
      }

      if (!data.url) {
        return { success: false, error: "No OAuth URL received from Supabase" };
      }

      return new Promise((resolve) => {
        chrome.identity.launchWebAuthFlow(
          {
            url: data.url,
            interactive: true,
          },
          async (redirectedTo) => {
            if (chrome.runtime.lastError) {
              console.error("OAuth error:", chrome.runtime.lastError);
              resolve({ success: false, error: chrome.runtime.lastError.message });
              return;
            }

            if (!redirectedTo) {
              resolve({ success: false, error: "No redirect URL received" });
              return;
            }

            try {
              // Extract the URL fragment which contains the tokens
              const redirectUrl = new URL(redirectedTo);
              const hashParams = new URLSearchParams(redirectUrl.hash.substring(1));

              const accessToken = hashParams.get("access_token");
              const refreshToken = hashParams.get("refresh_token");
              // const expiresIn = hashParams.get('expires_in')
              // const tokenType = hashParams.get('token_type')

              if (!accessToken) {
                resolve({ success: false, error: "No access token received" });
                return;
              }

              // Set the session manually
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || "",
              });

              if (sessionError) {
                console.error("Session error:", sessionError);
                resolve({ success: false, error: sessionError.message });
                return;
              }

              if (sessionData.user) {
                this.currentUser = sessionData.user;
                console.log("Successfully signed in:", sessionData.user);
                resolve({ success: true });
              } else {
                resolve({ success: false, error: "No user data received" });
              }
            } catch (parseError) {
              console.error("Error parsing auth response:", parseError);
              resolve({ success: false, error: "Failed to parse authentication response" });
            }
          }
        );
      });
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "Failed to initiate Google sign-in" };
    }
  }

  public async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
      } else {
        this.currentUser = null;
        console.log("Successfully signed out");
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public async getAccessToken(): Promise<string | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }
}

// Export a singleton instance
export const authService = AuthService.getInstance();
