import React, { createContext, useContext, useState, useMemo } from 'react';
import { DataProvider } from './dataProvider';
import { MockDataProvider } from './mockProvider';
import { SheetDataProvider, SHEET_URL_STORAGE_KEY } from './sheetProvider';

export const defaultMockProvider: DataProvider = new MockDataProvider();
export const defaultSheetProvider: SheetDataProvider = new SheetDataProvider();

interface ProviderContextType {
  provider: DataProvider;
  providerType: 'mock' | 'sheet';
  setProviderType: (type: 'mock' | 'sheet') => void;
  webAppUrl: string;
  setWebAppUrl: (url: string) => void;
  resetAllData: () => Promise<void>;
  mockProviderInstance: MockDataProvider;
  sheetProviderInstance: SheetDataProvider;
}

const ProviderContext = createContext<ProviderContextType>({
  provider: defaultMockProvider,
  providerType: 'mock',
  setProviderType: () => {},
  webAppUrl: '',
  setWebAppUrl: () => {},
  resetAllData: async () => {},
  mockProviderInstance: new MockDataProvider(),
  sheetProviderInstance: new SheetDataProvider(),
});

export const DataProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [providerType, setProviderTypeState] = useState<'mock' | 'sheet'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return (window.localStorage.getItem('lms_active_provider_type') as any) || 'mock';
    }
    return 'mock';
  });

  const [webAppUrl, setWebAppUrlState] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return (
        window.localStorage.getItem(SHEET_URL_STORAGE_KEY) ||
        'https://script.google.com/macros/s/AKfycbyNqSL2L53toGwnhOsaPewbpijVSSYrX9hWC2NWWNADNxCqf21QwRIXxa_UN5QiEsAm/exec'
      );
    }
    return 'https://script.google.com/macros/s/AKfycbyNqSL2L53toGwnhOsaPewbpijVSSYrX9hWC2NWWNADNxCqf21QwRIXxa_UN5QiEsAm/exec';
  });

  const mockInstance = useMemo(() => new MockDataProvider(), []);
  const sheetInstance = useMemo(() => new SheetDataProvider(webAppUrl), [webAppUrl]);

  const setProviderType = (type: 'mock' | 'sheet') => {
    setProviderTypeState(type);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('lms_active_provider_type', type);
    }
  };

  const setWebAppUrl = (url: string) => {
    setWebAppUrlState(url);
    sheetInstance.setWebAppUrl(url);
  };

  const activeProvider = providerType === 'mock' ? mockInstance : sheetInstance;

  const resetAllData = async () => {
    await activeProvider.resetToSeedData();
    window.location.reload();
  };

  return (
    <ProviderContext.Provider
      value={{
        provider: activeProvider,
        providerType,
        setProviderType,
        webAppUrl,
        setWebAppUrl,
        resetAllData,
        mockProviderInstance: mockInstance,
        sheetProviderInstance: sheetInstance,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
};

export const useDataProvider = (): DataProvider => {
  const context = useContext(ProviderContext);
  return context.provider;
};

export const useProviderSettings = () => {
  return useContext(ProviderContext);
};
