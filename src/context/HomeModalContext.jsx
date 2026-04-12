/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const HomeModalContext = createContext(null);

export function HomeModalProvider({ children }) {
  const [overlayOpen, setOverlayOpenState] = useState(false);
  const setOverlayOpen = useCallback((open) => {
    setOverlayOpenState(Boolean(open));
  }, []);

  const value = useMemo(
    () => ({ overlayOpen, setOverlayOpen }),
    [overlayOpen, setOverlayOpen],
  );

  return (
    <HomeModalContext.Provider value={value}>
      {children}
    </HomeModalContext.Provider>
  );
}

export function useHomeModalOverlay() {
  const ctx = useContext(HomeModalContext);
  if (!ctx) {
    throw new Error(
      "useHomeModalOverlay must be used within HomeModalProvider",
    );
  }
  return ctx;
}
