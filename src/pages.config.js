import AIEventPlanner from './pages/AIEventPlanner';
import Activities from './pages/Activities';
import AdvancedGamificationAnalytics from './pages/AdvancedGamificationAnalytics';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import Calendar from './pages/Calendar';
import Channels from './pages/Channels';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import EmployeeDirectory from './pages/EmployeeDirectory';
import EventTemplates from './pages/EventTemplates';
import EventWizard from './pages/EventWizard';
import FacilitatorDashboard from './pages/FacilitatorDashboard';
import FacilitatorView from './pages/FacilitatorView';
import Gamification from './pages/Gamification';
import GamificationDashboard from './pages/GamificationDashboard';
import GamificationSettings from './pages/GamificationSettings';
import Home from './pages/Home';
import Integrations from './pages/Integrations';
import Leaderboards from './pages/Leaderboards';
import OnboardingHub from './pages/OnboardingHub';
import ParticipantEvent from './pages/ParticipantEvent';
import ParticipantPortal from './pages/ParticipantPortal';
import PointStore from './pages/PointStore';
import ProjectPlan from './pages/ProjectPlan';
import PublicProfile from './pages/PublicProfile';
import Recognition from './pages/Recognition';
import RewardsAdmin from './pages/RewardsAdmin';
import RewardsStore from './pages/RewardsStore';
import RoleSelection from './pages/RoleSelection';
import RoleSetup from './pages/RoleSetup';
import Settings from './pages/Settings';
import SkillsDashboard from './pages/SkillsDashboard';
import TeamCompetition from './pages/TeamCompetition';
import TeamDashboard from './pages/TeamDashboard';
import TeamPerformanceDashboard from './pages/TeamPerformanceDashboard';
import Teams from './pages/Teams';
import UserProfile from './pages/UserProfile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIEventPlanner": AIEventPlanner,
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
    "FacilitatorDashboard": FacilitatorDashboard,
    "FacilitatorView": FacilitatorView,
    "Gamification": Gamification,
    "GamificationDashboard": GamificationDashboard,
    "GamificationSettings": GamificationSettings,
    "Home": Home,
    "Integrations": Integrations,
    "Leaderboards": Leaderboards,
    "OnboardingHub": OnboardingHub,
    "ParticipantEvent": ParticipantEvent,
    "ParticipantPortal": ParticipantPortal,
    "PointStore": PointStore,
    "ProjectPlan": ProjectPlan,
    "PublicProfile": PublicProfile,
    "Recognition": Recognition,
    "RewardsAdmin": RewardsAdmin,
    "RewardsStore": RewardsStore,
    "RoleSelection": RoleSelection,
    "RoleSetup": RoleSetup,
    "Settings": Settings,
    "SkillsDashboard": SkillsDashboard,
    "TeamCompetition": TeamCompetition,
    "TeamDashboard": TeamDashboard,
    "TeamPerformanceDashboard": TeamPerformanceDashboard,
    "Teams": Teams,
    "UserProfile": UserProfile,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};