import { clsx } from 'clsx';
import {
  LayoutDashboard,
  CalendarDays,
  Layers,
  BarChart3,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import type { NavView } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface NavItem {
  id: NavView;
  label: string;
  Icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'calendar', label: 'Content Calendar', Icon: CalendarDays },
  { id: 'pipeline', label: 'Campaign Pipeline', Icon: Layers },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3 },
  { id: 'grader', label: 'Grader', Icon: Star },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export function Sidebar() {
  const { state, dispatch } = useAppContext();
  const { activeView, sidebarCollapsed } = state;

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'hidden md:flex flex-col h-screen bg-[#0A0A0A] border-r border-[#1A1A1A] transition-all duration-200 flex-shrink-0',
          sidebarCollapsed ? 'w-14' : 'w-56'
        )}
      >
        {/* Logo */}
        <div
          className={clsx(
            'flex items-center border-b border-[#1A1A1A] flex-shrink-0',
            sidebarCollapsed ? 'justify-center px-0 py-4' : 'px-4 py-4 gap-2.5'
          )}
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-heading font-bold text-[#F5F5F5] tracking-widest uppercase leading-none">
                BVP
              </p>
              <p className="text-[10px] text-[#6B6B6B] leading-none mt-0.5 whitespace-nowrap">
                Marketing Agent
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: id })}
              className={clsx(
                'w-full flex items-center transition-all duration-150 rounded-lg mx-1 focus:outline-none focus:ring-2 focus:ring-orange-500/40',
                sidebarCollapsed ? 'justify-center px-0 py-2.5 mx-1' : 'gap-3 px-3 py-2.5',
                activeView === id
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#111111] border border-transparent',
                'mb-0.5'
              )}
              title={sidebarCollapsed ? label : undefined}
              aria-current={activeView === id ? 'page' : undefined}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-[#1A1A1A] p-2">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className={clsx(
              'w-full flex items-center justify-center py-2 text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#111111] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40',
              !sidebarCollapsed && 'gap-2'
            )}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : (
              <>
                <ChevronLeft size={14} />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A] border-t border-[#1A1A1A] flex items-center justify-around px-1 h-14 safe-area-inset-bottom">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: id })}
            className={clsx(
              'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-lg transition-colors focus:outline-none',
              activeView === id ? 'text-orange-400' : 'text-[#6B6B6B]'
            )}
            aria-label={label}
            aria-current={activeView === id ? 'page' : undefined}
          >
            <Icon size={18} />
            <span className="text-[9px] font-medium truncate leading-none">
              {label.split(' ')[0]}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}
