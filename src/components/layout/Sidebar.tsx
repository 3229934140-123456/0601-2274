import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  FileBarChart,
  Upload,
  Database,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/format';

const menuItems = [
  { path: '/dashboard', label: '核心看板', icon: LayoutDashboard },
  { path: '/warnings', label: '预警管理', icon: AlertTriangle },
  { path: '/plan', label: '年度计划', icon: Upload },
  { path: '/reports', label: '运营报告', icon: FileBarChart },
  { path: '/data', label: '数据管理', icon: Database },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'h-screen bg-gradient-to-b from-dark-900 to-dark-950 border-r border-primary-800/30 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="h-16 flex items-center justify-center border-b border-primary-800/30">
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">住房保障监测</div>
              <div className="text-dark-400 text-xs">运营分析平台</div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'text-dark-300 hover:bg-dark-800/50 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="h-12 border-t border-primary-800/30 flex items-center justify-center text-dark-400 hover:text-white transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
