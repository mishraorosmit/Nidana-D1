import React from 'react';
import { Home, Compass, Map, ListTodo, User } from 'lucide-react';
import { NavDestination } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavigationProps {
  currentDestination: NavDestination;
  onNavigate: (destination: NavDestination) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentDestination,
  onNavigate,
}) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'home' as const, label: t.navHome, icon: Home },
    { id: 'practice' as const, label: t.navPractice, icon: Compass },
    { id: 'map' as const, label: t.navMap, icon: Map },
    { id: 'plan' as const, label: t.navPlan, icon: ListTodo },
    { id: 'profile' as const, label: t.navProfile, icon: User },
  ];
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF5ED]/95 backdrop-blur-md border-t border-[#D7C4A5]/70 shadow-[0_-4px_16px_rgba(41,37,31,0.06)] font-operational"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-[430px] mx-auto grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const isActive = currentDestination === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[44px] py-1 transition-all duration-150 select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-[#C45C38] active:scale-95 ${
                isActive ? 'text-[#C45C38]' : 'text-[#6D675E] hover:text-[#29251F]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-105 stroke-[2.2px] text-[#C45C38]' : 'stroke-[1.75px] text-[#6D675E]'
                  }`}
                  aria-hidden="true"
                />
                {isActive && (
                  <span
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C45C38]"
                    aria-hidden="true"
                  />
                )}
              </div>
              <span
                className={`text-[11px] tracking-tight mt-1 transition-colors ${
                  isActive ? 'font-semibold text-[#C45C38]' : 'font-medium text-[#6D675E]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
