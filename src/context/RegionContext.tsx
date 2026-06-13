import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { RegionContextType } from '../types';
import { useAuth } from './AuthContext';
import { getCitiesByProvince, provinces } from '../data/mockData';
import { roleHierarchy } from './AuthContext';
import { useAppStore } from '../store';
import { mockUsers } from './AuthContext';

const RegionContext = createContext<RegionContextType | undefined>(undefined);

interface RegionProviderProps {
  children: ReactNode;
}

function getInitialRegion() {
  const storedRole = useAppStore.getState().currentRole;
  const user = storedRole && mockUsers[storedRole] ? mockUsers[storedRole] : mockUsers.municipal;

  if (user.role === 'national') {
    return {
      level: 'national' as const,
      provinceId: undefined,
      cityId: undefined,
      provinceName: undefined,
      cityName: undefined,
    };
  } else if (user.role === 'provincial') {
    const province = provinces.find(p => p.id === user.regionId);
    if (province) {
      return {
        level: 'province' as const,
        provinceId: province.id,
        cityId: undefined,
        provinceName: province.name,
        cityName: undefined,
      };
    }
  } else if (user.role === 'municipal') {
    const cities = getCitiesByProvince('110000');
    const city = cities.find(c => c.id === user.regionId);
    if (city) {
      return {
        level: 'city' as const,
        provinceId: '110000',
        cityId: city.id,
        provinceName: '北京市',
        cityName: city.name,
      };
    }
  } else if (user.role === 'district' || user.role === 'property') {
    return {
      level: 'city' as const,
      provinceId: '110000',
      cityId: '110100',
      provinceName: '北京市',
      cityName: '北京市',
    };
  }

  return {
    level: 'national' as const,
    provinceId: undefined,
    cityId: undefined,
    provinceName: undefined,
    cityName: undefined,
  };
}

export function RegionProvider({ children }: RegionProviderProps) {
  const { user } = useAuth();
  const initialRegion = getInitialRegion();
  const [level, setLevel] = useState<'national' | 'province' | 'city'>(initialRegion.level);
  const [provinceId, setProvinceId] = useState<string | undefined>(initialRegion.provinceId);
  const [cityId, setCityId] = useState<string | undefined>(initialRegion.cityId);
  const [provinceName, setProvinceName] = useState<string | undefined>(initialRegion.provinceName);
  const [cityName, setCityName] = useState<string | undefined>(initialRegion.cityName);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'national') {
      if (level !== 'national') {
        setLevel('national');
        setProvinceId(undefined);
        setCityId(undefined);
        setProvinceName(undefined);
        setCityName(undefined);
      }
    } else if (user.role === 'provincial') {
      const province = provinces.find(p => p.id === user.regionId);
      if (province && provinceId !== province.id) {
        setLevel('province');
        setProvinceId(province.id);
        setProvinceName(province.name);
        setCityId(undefined);
        setCityName(undefined);
      }
    } else if (user.role === 'municipal') {
      const cities = getCitiesByProvince('110000');
      const city = cities.find(c => c.id === user.regionId);
      if (city && cityId !== city.id) {
        setLevel('city');
        setProvinceId('110000');
        setProvinceName('北京市');
        setCityId(city.id);
        setCityName(city.name);
      }
    } else if (user.role === 'district' || user.role === 'property') {
      if (cityId !== '110100') {
        setLevel('city');
        setProvinceId('110000');
        setProvinceName('北京市');
        setCityId('110100');
        setCityName('北京市');
      }
    }
  }, [user, level, provinceId, cityId]);

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
