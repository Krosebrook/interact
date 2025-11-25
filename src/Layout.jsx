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
  Plug
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

  // If participant page, show minimal layout with immersive bg
  if (currentPageName === 'ParticipantEvent') {
    return (
      <div className="min-h-screen relative">
        <div className="immersive-bg" />
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
    { name: 'Integrations', icon: Plug, page: 'Integrations', adminOnly: true },
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
    <div className="min-h-screen relative">
      {/* Immersive Background */}
      <div className="immersive-bg" />
      
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="relative z-50 glass-panel-dark mx-4 mt-4 rounded-xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white">Install Team Engage for a better experience</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
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

      {/* Glass Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-int-orange to-[#C46322] rounded-xl flex items-center justify-center relative shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white text-shadow">
                  Team Engage
                </h1>
                <p className="text-xs text-white/70">Activity Hub</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white/25 text-white font-medium shadow-lg'
                        : 'text-white/80 hover:bg-white/15 hover:text-white'
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
                    <p className="text-sm font-medium text-white">{user.full_name}</p>
                    <p className="text-xs text-white/70">{user.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white hover:bg-white/15"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-white/15"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden glass-panel-dark mx-4 mb-4 rounded-xl">
            <nav className="p-3 space-y-1">
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
                        ? 'bg-white/25 text-white font-medium'
                        : 'text-white/80 hover:bg-white/15 hover:text-white'
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
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}