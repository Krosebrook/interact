import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  LayoutDashboard, 
  Calendar, 
  Sparkles, 
  BarChart3, 
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Users,
  Gift,
  User,
  Download,
  Plug,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from './components/notifications/NotificationBell';
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt';

const HEADER_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691e3ae3bd4916f2e05ae35e/1b2b117bd_ChatGPTImageNov25202503_31_49PM.png';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  // If participant page, show minimal layout
  if (currentPageName === 'ParticipantEvent') {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  const navigation = isAdmin ? [
        { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
        { name: 'Facilitator', icon: Users, page: 'FacilitatorDashboard' },
        { name: 'Activities', icon: Sparkles, page: 'Activities' },
        { name: 'Templates', icon: LayoutDashboard, page: 'EventTemplates' },
        { name: 'Calendar', icon: Calendar, page: 'Calendar' },
        { name: 'Teams', icon: Users, page: 'Teams' },
        { name: 'Channels', icon: Users, page: 'Channels' },
        { name: 'Recognition', icon: Gift, page: 'Recognition' },
        { name: 'Leaderboards', icon: BarChart3, page: 'Leaderboards' },
        { name: 'Team Competition', icon: Users, page: 'TeamCompetition' },
        { name: 'Skills', icon: BarChart3, page: 'SkillsDashboard' },
        { name: 'Gamification', icon: Gift, page: 'GamificationDashboard' },
        { name: 'Gamification Settings', icon: SettingsIcon, page: 'GamificationSettings' },
        { name: 'AI Event Planner', icon: Sparkles, page: 'AIEventPlanner' },
        { name: 'Analytics', icon: BarChart3, page: 'Analytics' },
        { name: 'Integrations', icon: Plug, page: 'Integrations' },
        { name: 'Project Plan', icon: LayoutDashboard, page: 'ProjectPlan' },
        { name: 'Documentation', icon: LayoutDashboard, page: 'Documentation' },
        { name: 'Settings', icon: SettingsIcon, page: 'Settings' },
      ] : [
        { name: 'My Events', icon: Calendar, page: 'ParticipantPortal' },
        { name: 'Teams', icon: Users, page: 'Teams' },
        { name: 'Channels', icon: Users, page: 'Channels' },
        { name: 'Rewards', icon: Gift, page: 'RewardsStore' },
        { name: 'Point Store', icon: Gift, page: 'PointStore' },
        { name: 'Leaderboards', icon: BarChart3, page: 'Leaderboards' },
        { name: 'My Profile', icon: User, page: 'UserProfile' },
      ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Header with scenic image */}
      <header 
        className="relative h-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HEADER_IMAGE})`, backgroundPosition: 'center top' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-int-orange rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white drop-shadow-lg">Team Engage</h1>
                <p className="text-xs text-white/80">Activity Hub</p>
              </div>
            </Link>
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <NotificationBell userEmail={user.email} />
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-white drop-shadow">{user.full_name}</p>
                  <p className="text-xs text-white/80">{user.role}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-white hover:bg-white/20"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* PWA Install Prompt */}
                  <PWAInstallPrompt />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer with scenic image */}
      <footer 
        className="relative h-16 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HEADER_IMAGE})`, backgroundPosition: 'center bottom' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-sm text-white/80">© 2025 Team Engage</p>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span>Powered by FlashFusion</span>
          </div>
        </div>
      </footer>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Popout Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div 
          className="h-20 bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: `url(${HEADER_IMAGE})`, backgroundPosition: 'center top' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
          <div className="relative z-10 h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-int-orange rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Team Engage</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-4 py-4 border-b border-slate-200">
            <p className="font-medium text-slate-900">{user.full_name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-int-orange/10 text-int-orange rounded-full">
              {user.role}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-int-orange text-white font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-slate-600"
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </div>
  );
}