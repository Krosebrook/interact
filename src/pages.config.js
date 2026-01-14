import { lazy } from 'react';

import AIEventPlanner from './pages/AIEventPlanner';
import AIPersonalization from './pages/AIPersonalization';
import Activities from './pages/Activities';
import AdvancedGamificationAnalytics from './pages/AdvancedGamificationAnalytics';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import Calendar from './pages/Calendar';
import Channels from './pages/Channels';
import Dashboard from './pages/Dashboard';
// Lazy load largest pages to improve initial bundle size and performance
// These pages are converted to lazy loading as they are large and not needed on initial load
// Safe refactor: React.lazy() is a standard React feature for code splitting
const Documentation = lazy(() => import('./pages/Documentation')); // 1154 lines
import EmployeeDirectory from './pages/EmployeeDirectory';
import EventTemplates from './pages/EventTemplates';
// Lazy load EventWizard (687 lines) - complex form with many steps
const EventWizard = lazy(() => import('./pages/EventWizard'));
import ExampleModulePage from './pages/ExampleModulePage';
import FacilitatorDashboard from './pages/FacilitatorDashboard';
import FacilitatorView from './pages/FacilitatorView';
import Gamification from './pages/Gamification';
import GamificationAdmin from './pages/GamificationAdmin';
// Lazy load GamificationDashboard (761 lines) - heavy dashboard with many charts
const GamificationDashboard = lazy(() => import('./pages/GamificationDashboard'));
import GamificationRulesAdmin from './pages/GamificationRulesAdmin';
import GamificationSettings from './pages/GamificationSettings';
import Home from './pages/Home';
import Integrations from './pages/Integrations';
import IntegrationsHub from './pages/IntegrationsHub';
import KnowledgeHub from './pages/KnowledgeHub';
import Leaderboards from './pages/Leaderboards';
import LearningDashboard from './pages/LearningDashboard';
import LearningPath from './pages/LearningPath';
import Milestones from './pages/Milestones';
import NewEmployeeOnboarding from './pages/NewEmployeeOnboarding';
import OnboardingDashboard from './pages/OnboardingDashboard';
import OnboardingHub from './pages/OnboardingHub';
import ParticipantEvent from './pages/ParticipantEvent';
import ParticipantPortal from './pages/ParticipantPortal';
import PointStore from './pages/PointStore';
import ProfileCustomization from './pages/ProfileCustomization';
import ProjectPlan from './pages/ProjectPlan';
import PublicProfile from './pages/PublicProfile';
import RealTimeAnalytics from './pages/RealTimeAnalytics';
import Recognition from './pages/Recognition';
// Lazy load RewardsAdmin (670 lines) - admin panel with complex tables and filters
const RewardsAdmin = lazy(() => import('./pages/RewardsAdmin'));
import RewardsStore from './pages/RewardsStore';
import RoleManagement from './pages/RoleManagement';
import RoleSelection from './pages/RoleSelection';
import RoleSetup from './pages/RoleSetup';
import Settings from './pages/Settings';
import SkillsDashboard from './pages/SkillsDashboard';
import SocialGamification from './pages/SocialGamification';
import SocialHub from './pages/SocialHub';
import Surveys from './pages/Surveys';
import TeamAutomation from './pages/TeamAutomation';
import TeamAutomations from './pages/TeamAutomations';
import TeamCompetition from './pages/TeamCompetition';
import TeamDashboard from './pages/TeamDashboard';
import TeamLeaderDashboard from './pages/TeamLeaderDashboard';
import TeamPerformanceDashboard from './pages/TeamPerformanceDashboard';
import Teams from './pages/Teams';
import UserProfile from './pages/UserProfile';
import UserRoleAssignment from './pages/UserRoleAssignment';
import GamificationAnalytics from './pages/GamificationAnalytics';
import ContentModerationAdmin from './pages/ContentModerationAdmin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIEventPlanner": AIEventPlanner,
    "AIPersonalization": AIPersonalization,
    "Activities": Activities,
    "AdvancedGamificationAnalytics": AdvancedGamificationAnalytics,
    "Analytics": Analytics,
    "AuditLog": AuditLog,
    "Calendar": Calendar,
    "Channels": Channels,
    "Dashboard": Dashboard,
    "Documentation": Documentation,
    "EmployeeDirectory": EmployeeDirectory,
    "EventTemplates": EventTemplates,
    "EventWizard": EventWizard,
    "ExampleModulePage": ExampleModulePage,
    "FacilitatorDashboard": FacilitatorDashboard,
    "FacilitatorView": FacilitatorView,
    "Gamification": Gamification,
    "GamificationAdmin": GamificationAdmin,
    "GamificationDashboard": GamificationDashboard,
    "GamificationRulesAdmin": GamificationRulesAdmin,
    "GamificationSettings": GamificationSettings,
    "Home": Home,
    "Integrations": Integrations,
    "IntegrationsHub": IntegrationsHub,
    "KnowledgeHub": KnowledgeHub,
    "Leaderboards": Leaderboards,
    "LearningDashboard": LearningDashboard,
    "LearningPath": LearningPath,
    "Milestones": Milestones,
    "NewEmployeeOnboarding": NewEmployeeOnboarding,
    "OnboardingDashboard": OnboardingDashboard,
    "OnboardingHub": OnboardingHub,
    "ParticipantEvent": ParticipantEvent,
    "ParticipantPortal": ParticipantPortal,
    "PointStore": PointStore,
    "ProfileCustomization": ProfileCustomization,
    "ProjectPlan": ProjectPlan,
    "PublicProfile": PublicProfile,
    "RealTimeAnalytics": RealTimeAnalytics,
    "Recognition": Recognition,
    "RewardsAdmin": RewardsAdmin,
    "RewardsStore": RewardsStore,
    "RoleManagement": RoleManagement,
    "RoleSelection": RoleSelection,
    "RoleSetup": RoleSetup,
    "Settings": Settings,
    "SkillsDashboard": SkillsDashboard,
    "SocialGamification": SocialGamification,
    "SocialHub": SocialHub,
    "Surveys": Surveys,
    "TeamAutomation": TeamAutomation,
    "TeamAutomations": TeamAutomations,
    "TeamCompetition": TeamCompetition,
    "TeamDashboard": TeamDashboard,
    "TeamLeaderDashboard": TeamLeaderDashboard,
    "TeamPerformanceDashboard": TeamPerformanceDashboard,
    "Teams": Teams,
    "UserProfile": UserProfile,
    "UserRoleAssignment": UserRoleAssignment,
    "GamificationAnalytics": GamificationAnalytics,
    "ContentModerationAdmin": ContentModerationAdmin,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};