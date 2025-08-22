import { getChromeManifest } from "@/utils/extension";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

class Service {
  #manifest = getChromeManifest();
  #url = new URL("https://accounts.google.com/o/oauth2/auth");
  #currentUser: User | null = null;
  #redirectUri = chrome.identity.getRedirectURL("google");
  #authStateListener: any | null = null;

  signIn(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!this.#manifest?.oauth2?.client_id) {
        return resolve({ success: false, error: "OAuth2 configuration is missing in manifest" });
      }
      this.#url.searchParams.set("client_id", this.#manifest.oauth2.client_id);
      this.#url.searchParams.set("response_type", "id_token");
      this.#url.searchParams.set("access_type", "offline");
      this.#url.searchParams.set("redirect_uri", this.#redirectUri);
      this.#url.searchParams.set("scope", this.#manifest.oauth2?.scopes?.join(" ") || "");

      chrome.identity.launchWebAuthFlow(
        {
          url: this.#url.href,
          interactive: true,
        },
        async (redirectedTo?: string) => {
          if (chrome.runtime.lastError || !redirectedTo) {
            return resolve({ success: false, error: chrome.runtime.lastError?.message || "Authentication failed" });
          }

          const url = new URL(redirectedTo);
          const params = new URLSearchParams(url.hash.substring(1));
          const token = params.get("id_token");

          if (!token) {
            return resolve({ success: false, error: "ID token not found in redirect URL" });
          }

          const { data: sessionData, error: sessionError } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: token,
          });

          if (sessionError) {
            console.error("Session error:", sessionError);
            return resolve({ success: false, error: sessionError.message });
          }

          if (sessionData.user) {
            this.#currentUser = sessionData.user;

            return resolve({ success: true });
          } else {
            return resolve({ success: false, error: "No user data received" });
          }
        }
      );
    });
  }

  async signOut() {
    try {
      await supabase.auth.signOut({ scope: "local" });
      this.#currentUser = null;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession(); // getcurrent session
    if (session) {
      this.#currentUser = session?.user || null;
    }
    // listen for auth change
    if (this.#authStateListener === null) {
      this.#authStateListener = supabase.auth.onAuthStateChange((_event, session) => {
        this.#currentUser = session?.user || null;
      });
    }
    return this.#currentUser;
  }

  isAuthenticated(): boolean {
    return this.#currentUser !== null;
  }
}

export const AuthService = new Service();
