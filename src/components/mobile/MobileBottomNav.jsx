import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Home, Calendar, Award, User, Users } from 'lucide-react';
import { useUserData } from '../hooks/useUserData';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: Home, page: 'Dashboard' },
  { id: 'events', label: 'Events', icon: Calendar, page: 'Calendar' },
  { id: 'wellness', label: 'Wellness', icon: Award, page: 'WellnessDashboard' },
  { id: 'teams', label: 'Teams', icon: Users, page: 'Teams' },
  { id: 'profile', label: 'Profile', icon: User, page: 'UserProfile' }
];

export default function MobileBottomNav({ currentPageName }) {
  const { user } = useUserData(false);
  
  if (!user) return null;
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-40 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentPageName === item.page;
          
          return (
            <Link
              key={item.id}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-int-orange' : 'text-slate-600'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}