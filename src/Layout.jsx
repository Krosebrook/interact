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
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from './components/notifications/NotificationBell';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    // PWA install prompt
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {children}
      </div>
    );
  }

  // Admin layout
  const isAdmin = user?.role === 'admin';

  const navigation = isAdmin ? [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard', adminOnly: true },
    { name: 'Facilitator', icon: Users, page: 'FacilitatorDashboard', adminOnly: true },
    { name: 'Activities', icon: Sparkles, page: 'Activities', adminOnly: true },
    { name: 'Templates', icon: LayoutDashboard, page: 'EventTemplates', adminOnly: true },
    { name: 'Calendar', icon: Calendar, page: 'Calendar', adminOnly: true },
    { name: 'Teams', icon: Users, page: 'Teams', adminOnly: true },
    { name: 'Skills', icon: BarChart3, page: 'SkillsDashboard', adminOnly: true },
    { name: 'Gamification', icon: Gift, page: 'GamificationDashboard', adminOnly: true },
    { name: 'Analytics', icon: BarChart3, page: 'Analytics', adminOnly: true },
    { name: 'Settings', icon: SettingsIcon, page: 'Settings', adminOnly: true },
  ] : [
    { name: 'My Events', icon: Calendar, page: 'ParticipantPortal', adminOnly: false },
    { name: 'Teams', icon: Users, page: 'Teams', adminOnly: false },
    { name: 'Rewards', icon: Gift, page: 'RewardsStore', adminOnly: false },
    { name: 'Leaderboard', icon: BarChart3, page: 'Gamification', adminOnly: false },
    { name: 'My Profile', icon: User, page: 'UserProfile', adminOnly: false },
  ];

  const filteredNav = navigation.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="bg-int-orange text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5" />
            <span className="text-sm font-medium">Install Team Engage for a better experience</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white text-int-orange hover:bg-white/90"
              onClick={handleInstallClick}
            >
              Install
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={dismissInstallBanner}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-int-navy rounded-xl flex items-center justify-center relative">
                <Sparkles className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-int-orange rounded-full"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-int-navy">
                  Team Engage
                </h1>
                <p className="text-xs text-slate-gray">Activity Hub</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-int-orange text-white font-medium'
                        : 'text-slate-gray hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <NotificationBell userEmail={user.email} />
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-slate-700">{user.full_name}</p>
                    <p className="text-xs text-slate-500">{user.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-int-orange text-white font-medium'
                        : 'text-slate-gray hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}