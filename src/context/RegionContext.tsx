import { createContext, useContext, useState, ReactNode } from 'react';
import type { RegionContextType } from '../types';

const RegionContext = createContext<RegionContextType | undefined>(undefined);

interface RegionProviderProps {
  children: ReactNode;
}

export function RegionProvider({ children }: RegionProviderProps) {
  const [level, setLevel] = useState<'national' | 'province' | 'city'>('national');
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const [cityId, setCityId] = useState<string | undefined>();
  const [provinceName, setProvinceName] = useState<string | undefined>();
  const [cityName, setCityName] = useState<string | undefined>();

  const setProvince = (id: string, name: string) => {
    setProvinceId(id);
    setProvinceName(name);
    setCityId(undefined);
    setCityName(undefined);
    setLevel('province');
  };

  const setCity = (id: string, name: string) => {
    setCityId(id);
    setCityName(name);
    setLevel('city');
  };

  const resetToNational = () => {
    setProvinceId(undefined);
    setCityId(undefined);
    setProvinceName(undefined);
    setCityName(undefined);
    setLevel('national');
  };

  return (
    <RegionContext.Provider
      value={{
        level,
        provinceId,
        cityId,
        provinceName,
        cityName,
        setProvince,
        setCity,
        resetToNational,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
