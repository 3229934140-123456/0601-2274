import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ChevronDown,
  Bell,
  User,
  LogOut,
  Shield,
} from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import { useAuth } from '../../context/AuthContext';
import { provinces, getCitiesByProvince } from '../../data/mockData';
import { cn, getRoleName } from '../../utils/format';
import type { UserRole } from '../../types';

export default function Header() {
  const { level, provinceId, cityId, provinceName, cityName, setProvince, setCity, resetToNational } = useRegion();
  const { user, login, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setRegionDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentRegionName = () => {
    if (level === 'national') return '全国';
    if (level === 'province') return provinceName;
    if (level === 'city') return `${provinceName} / ${cityName}`;
    return '全国';
  };

  const handleProvinceClick = (id: string, name: string) => {
    if (hasPermission(['provincial', 'municipal'])) {
      setProvince(id, name);
      setRegionDropdownOpen(false);
    }
  };

  const handleCityClick = (id: string, name: string) => {
    if (hasPermission(['municipal'])) {
      setCity(id, name);
      setRegionDropdownOpen(false);
    }
  };

  const roleOptions: { role: UserRole; label: string }[] = [
    { role: 'national', label: '国家级用户' },
    { role: 'provincial', label: '省级用户' },
    { role: 'municipal', label: '市级用户' },
    { role: 'district', label: '区级用户' },
    { role: 'property', label: '物业用户' },
  ];

  return (
    <header className="h-16 bg-dark-900/80 backdrop-blur-md border-b border-primary-800/30 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-white">保障性住房运营监测分析平台</h1>

        {hasPermission(['national', 'provincial', 'municipal']) && (
          <div className="relative" ref={regionRef}>
            <button
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg border border-primary-800/30 text-sm text-dark-200 transition-colors"
            >
              <MapPin className="w-4 h-4 text-primary-400" />
              <span>{getCurrentRegionName()}</span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', regionDropdownOpen && 'rotate-180')} />
            </button>

            {regionDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 glass-card py-2 z-50 max-h-96 overflow-y-auto scrollbar-thin">
                <div
                  className="px-4 py-2 hover:bg-dark-700/50 cursor-pointer text-sm text-dark-200 flex items-center gap-2"
                  onClick={() => {
                    resetToNational();
                    setRegionDropdownOpen(false);
                  }}
                >
                  <MapPin className="w-4 h-4 text-primary-400" />
                  全国
                </div>
                <div className="border-t border-dark-700 my-1" />
                {provinces.map((province) => (
                  <div key={province.id}>
                    <div
                      className="px-4 py-2 hover:bg-dark-700/50 cursor-pointer text-sm text-dark-200 flex items-center justify-between group"
                      onClick={() => handleProvinceClick(province.id, province.name)}
                    >
                      <span>{province.name}</span>
                      <ChevronDown className="w-4 h-4 rotate-[-90deg] text-dark-500 group-hover:text-primary-400" />
                    </div>
                    {provinceId === province.id && level === 'city' && (
                      <div className="bg-dark-900/50">
                        {getCitiesByProvince(province.id).map((city) => (
                          <div
                            key={city.id}
                            className={cn(
                              'pl-8 pr-4 py-2 hover:bg-dark-700/50 cursor-pointer text-sm',
                              cityId === city.id ? 'text-primary-400 bg-primary-500/10' : 'text-dark-300'
                            )}
                            onClick={() => handleCityClick(city.id, city.name)}
                          >
                            {city.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="tag tag-primary">
          <Shield className="w-3 h-3" />
          {user ? getRoleName(user.role) : '未登录'}
        </div>

        <button className="relative p-2 text-dark-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full animate-pulse" />
        </button>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-dark-200">{user?.name || '用户'}</span>
            <ChevronDown className={cn('w-4 h-4 text-dark-400 transition-transform', userDropdownOpen && 'rotate-180')} />
          </button>

          {userDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 glass-card py-2 z-50">
              <div className="px-4 py-2 border-b border-dark-700">
                <div className="text-sm font-medium text-white">{user?.name}</div>
                <div className="text-xs text-dark-400 mt-0.5">{user?.regionName}</div>
              </div>
              <div className="px-4 py-2 text-xs text-dark-400">切换角色</div>
              {roleOptions.map((option) => (
                <div
                  key={option.role}
                  className={cn(
                    'px-4 py-2 cursor-pointer text-sm flex items-center gap-2',
                    user?.role === option.role
                      ? 'bg-primary-500/20 text-primary-300'
                      : 'text-dark-300 hover:bg-dark-700/50'
                  )}
                  onClick={() => {
                    login(option.role);
                    setUserDropdownOpen(false);
                    navigate('/dashboard');
                  }}
                >
                  <Shield className="w-4 h-4" />
                  {option.label}
                </div>
              ))}
              <div className="border-t border-dark-700 mt-2 pt-2">
                <div
                  className="px-4 py-2 cursor-pointer text-sm text-dark-300 hover:bg-dark-700/50 flex items-center gap-2"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
