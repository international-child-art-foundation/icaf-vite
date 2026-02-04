import React, {
  createContext,
  useState,
  use,
  useCallback,
  ReactNode,
} from 'react';

type TCookieConsentStatus = boolean | undefined;

interface GlobalContextType {
  isCookieConsentAcquired: TCookieConsentStatus;
  cookieBannerVisible: boolean;
  setGlobalCookieConsentValue: (consentValue: boolean) => void;
  setCookieBannerVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined,
);

interface GlobalContextProviderProps {
  children: ReactNode;
}

export const GlobalContextProvider: React.FC<GlobalContextProviderProps> = ({
  children,
}) => {
  const [isCookieConsentAcquired, setIsCookieConsentAcquired] =
    useState<TCookieConsentStatus>(() => {
      if (typeof window === 'undefined') return undefined;
      const curStringCookie = localStorage.getItem('cookieConsent');
      if (curStringCookie === 'true') return true;
      if (curStringCookie === 'false') return false;
      return undefined;
    });

  const [cookieBannerVisible, setCookieBannerVisible] = useState<boolean>(
    isCookieConsentAcquired === undefined,
  );

  const setGlobalCookieConsentValue = useCallback((consentValue: boolean) => {
    const status = consentValue ? 'granted' : 'denied';
    localStorage.setItem('cookieConsent', consentValue.toString());
    setIsCookieConsentAcquired(consentValue);
    setCookieBannerVisible(false);

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: status,
        ad_storage: status,
        ad_user_data: status,
        ad_personalization: status,
      });
    }
  }, []);

  const value = React.useMemo<GlobalContextType>(
    () => ({
      isCookieConsentAcquired,
      setGlobalCookieConsentValue,
      cookieBannerVisible,
      setCookieBannerVisible,
    }),
    [
      isCookieConsentAcquired,
      setGlobalCookieConsentValue,
      cookieBannerVisible,
      setCookieBannerVisible,
    ],
  );

  return <GlobalContext value={value}>{children}</GlobalContext>;
};

export const useGlobalContext = (): GlobalContextType => {
  const context = use(GlobalContext);
  if (context === undefined) {
    throw new Error(
      'useGlobalContext must be used within a GlobalContextProvider',
    );
  }
  return context;
};
