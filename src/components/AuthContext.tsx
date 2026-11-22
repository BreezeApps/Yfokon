import { createContext, useContext, useState, useEffect, ReactInstance, ReactElement } from 'react';
import { UnlistenFn } from '@tauri-apps/api/event';
import { open as openBrowser } from '@tauri-apps/plugin-shell';
import { getCurrent, onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { useLoadingScreen } from '@/Hooks/useLoadingScreen';
import { DatabaseService } from '@/lib/db/dbClass';

type AuthContextType = {
  token: string | null;
  isLocalMode: boolean;
  hasAccess: boolean;
  loginWithServer: () => Promise<void>;
  loginAsLocal: () => void;
  logout: () => void;
  loading: boolean;
  dbService: DatabaseService | null
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, dbService }: { children: ReactElement<any, any>, dbService: DatabaseService | null }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLocalMode, setIsLocalMode] = useState(localStorage.getItem('local_mode') === 'true');
  const { showLoading, hideLoading, loading } = useLoadingScreen();

  const loginWithServer = async () => {
    showLoading();
    localStorage.removeItem('local_mode');
    setIsLocalMode(false);
    try {
      await openBrowser('http://127.0.0.1/auth/oauth/login?redirect_to=app');
    } catch (error) {
      console.error("Erreur de lancement du navigateur :", error);
      hideLoading();
    }
  };

  const loginAsLocal = () => {
    localStorage.setItem('local_mode', 'true');
    localStorage.removeItem('token');
    setToken(null);
    setIsLocalMode(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('local_mode');
    localStorage.removeItem('last_synced_at');
    setToken(null);
    setIsLocalMode(false);
  };

  const handleDeepLinkUrl = (urlStr: string) => {
    try {
      const url = new URL(urlStr);

      if (url.host === 'oauth-callback' && url.hash) {
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const accessToken = hashParams.get('accessToken');

        if (accessToken) {
          localStorage.setItem('token', accessToken);
          localStorage.removeItem('local_mode');
          setIsLocalMode(false);
          setToken(accessToken);
        }
      }
    } catch (e) {
      console.error("Erreur lors du traitement de l'URL de redirection :", e);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    let unlistenDeepLink: UnlistenFn;

    const setupListener = async () => {
      const initialUrls = await getCurrent();
        if (initialUrls && initialUrls.length > 0) {
          handleDeepLinkUrl(initialUrls[0]);
        }
      
        unlistenDeepLink = await onOpenUrl((urls) => {
          if (urls.length > 0) handleDeepLinkUrl(urls[0]);
        });
    };

    setupListener();

    return () => {
      if (unlistenDeepLink) unlistenDeepLink();
    };
  }, []);

  const hasAccess = !!token || isLocalMode;

  return (
    <AuthContext.Provider value={{ token, isLocalMode, hasAccess, loginWithServer, loginAsLocal, logout, loading, dbService }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return context;
}