import React, { createContext, useContext, useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";

type LoadingContextType = {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/**
 * The LoadingProvider component manages the visibility of a loading screen with
 * customizable messages.
 * @param  - The `LoadingProvider` component takes a single prop `children`, which is of type
 * `React.ReactNode`. This prop represents the child elements that will be wrapped by the
 * `LoadingProvider`.
 * @returns The LoadingProvider component is being returned. It wraps the children with
 * LoadingContext.Provider and conditionally renders a LoadingScreen component based on the "visible"
 * state.
 */
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("Chargement...");

  const showLoading = (msg?: string) => {
    if (msg) setMessage(msg);
    setVisible(true);
    /* setTimeout(() => showError(), 3*1000) */
  };

  const hideLoading = () => setVisible(false);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {visible && <LoadingScreen message={message} />}
    </LoadingContext.Provider>
  );
}

/**
 * The useLoadingScreen function is used to access the loading context in a React component.
 * @returns The `useLoadingScreen` function is returning the `context` value obtained from the
 * `LoadingContext` using the `useContext` hook. If the `context` is not found (i.e., `!context`), it
 * throws an error with the message "useLoadingScreen must be used within LoadingProvider".
 */
export function useLoadingScreen() {
  const context = useContext(LoadingContext);
  if (!context) throw new Error("useLoadingScreen doit être utilisé dans LoadingProvider");
  return context;
}
