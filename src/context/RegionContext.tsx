import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { RegionContextType } from '../types';
import { useAuth } from './AuthContext';
import { getCitiesByProvince, provinces } from '../data/mockData';
import { roleHierarchy } from './AuthContext';

const RegionContext = createContext<RegionContextType | undefined>(undefined);

interface RegionProviderProps {
  children: ReactNode;
}

export function RegionProvider({ children }: RegionProviderProps) {
  const { user } = useAuth();
  const [level, setLevel] = useState<'national' | 'province' | 'city'>('national');
  const [provinceId, setProvinceId] = useState<string | undefined>();
  const [cityId, setCityId] = useState<string | undefined>();
  const [provinceName, setProvinceName] = useState<string | undefined>();
  const [cityName, setCityName] = useState<string | undefined>();

  useEffect(() => {
    if (!user) return;

    const roleLevel = roleHierarchy[user.role];

    if (user.role === 'national') {
      setLevel('national');
      setProvinceId(undefined);
      setCityId(undefined);
      setProvinceName(undefined);
      setCityName(undefined);
    } else if (user.role === 'provincial') {
      const province = provinces.find(p => p.id === user.regionId);
      if (province) {
        setLevel('province');
        setProvinceId(province.id);
        setProvinceName(province.name);
        setCityId(undefined);
        setCityName(undefined);
      }
    } else if (user.role === 'municipal') {
      const cities = getCitiesByProvince('110000');
      const city = cities.find(c => c.id === user.regionId);
      if (city) {
        setLevel('city');
        setProvinceId('110000');
        setProvinceName('北京市');
        setCityId(city.id);
        setCityName(city.name);
      }
    } else if (user.role === 'district' || user.role === 'property') {
      setLevel('city');
      setProvinceId('110000');
      setProvinceName('北京市');
      setCityId('110100');
      setCityName('北京市');
    }
  }, [user]);

  const setProvince = (id: string, name: string) => {
    if (user && roleHierarchy[user.role] < roleHierarchy['provincial']) return;
    setProvinceId(id);
    setProvinceName(name);
    setCityId(undefined);
    setCityName(undefined);
    setLevel('province');
  };

  const setCity = (id: string, name: string) => {
    if (user && roleHierarchy[user.role] < roleHierarchy['municipal']) return;
    setCityId(id);
    setCityName(name);
    setLevel('city');
  };

  const resetToNational = () => {
    if (user && roleHierarchy[user.role] < roleHierarchy['national']) return;
    setProvinceId(undefined);
    setCityId(undefined);
    setProvinceName(undefined);
    setCityName(undefined);
    setLevel('national');
  };

  const canSwitchToNational = user ? roleHierarchy[user.role] >= roleHierarchy['national'] : true;
  const canSwitchToProvince = user ? roleHierarchy[user.role] >= roleHierarchy['provincial'] : true;

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
        canSwitchToNational,
        canSwitchToProvince,
      } as any}
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
