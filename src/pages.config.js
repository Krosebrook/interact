import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import ParticipantEvent from './pages/ParticipantEvent';
import Settings from './pages/Settings';
import FacilitatorView from './pages/FacilitatorView';
import FacilitatorDashboard from './pages/FacilitatorDashboard';
import ParticipantPortal from './pages/ParticipantPortal';
import EventWizard from './pages/EventWizard';
import Gamification from './pages/Gamification';
import RewardsStore from './pages/RewardsStore';
import RewardsAdmin from './pages/RewardsAdmin';
import GamificationDashboard from './pages/GamificationDashboard';
import Teams from './pages/Teams';
import TeamDashboard from './pages/TeamDashboard';
import UserProfile from './pages/UserProfile';
import EventTemplates from './pages/EventTemplates';
import TeamPerformanceDashboard from './pages/TeamPerformanceDashboard';
import SkillsDashboard from './pages/SkillsDashboard';
import Integrations from './pages/Integrations';
import ProjectPlan from './pages/ProjectPlan';
import GamificationSettings from './pages/GamificationSettings';
import TeamCompetition from './pages/TeamCompetition';
import AIEventPlanner from './pages/AIEventPlanner';
import Channels from './pages/Channels';
import Documentation from './pages/Documentation';
import PointStore from './pages/PointStore';
import Recognition from './pages/Recognition';
import Leaderboards from './pages/Leaderboards';
import PublicProfile from './pages/PublicProfile';
import RoleSelection from './pages/RoleSelection';
import AdvancedGamificationAnalytics from './pages/AdvancedGamificationAnalytics';
import RoleSetup from './pages/RoleSetup';
import OnboardingHub from './pages/OnboardingHub';
import EmployeeDirectory from './pages/EmployeeDirectory';
import AuditLog from './pages/AuditLog';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Activities": Activities,
    "Calendar": Calendar,
    "Analytics": Analytics,
    "ParticipantEvent": ParticipantEvent,
    "Settings": Settings,
    "FacilitatorView": FacilitatorView,
    "FacilitatorDashboard": FacilitatorDashboard,
    "ParticipantPortal": ParticipantPortal,
    "EventWizard": EventWizard,
    "Gamification": Gamification,
    "RewardsStore": RewardsStore,
    "RewardsAdmin": RewardsAdmin,
    "GamificationDashboard": GamificationDashboard,
    "Teams": Teams,
    "TeamDashboard": TeamDashboard,
    "UserProfile": UserProfile,
    "EventTemplates": EventTemplates,
    "TeamPerformanceDashboard": TeamPerformanceDashboard,
    "SkillsDashboard": SkillsDashboard,
    "Integrations": Integrations,
    "ProjectPlan": ProjectPlan,
    "GamificationSettings": GamificationSettings,
    "TeamCompetition": TeamCompetition,
    "AIEventPlanner": AIEventPlanner,
    "Channels": Channels,
    "Documentation": Documentation,
    "PointStore": PointStore,
    "Recognition": Recognition,
    "Leaderboards": Leaderboards,
    "PublicProfile": PublicProfile,
    "RoleSelection": RoleSelection,
    "AdvancedGamificationAnalytics": AdvancedGamificationAnalytics,
    "RoleSetup": RoleSetup,
    "OnboardingHub": OnboardingHub,
    "EmployeeDirectory": EmployeeDirectory,
    "AuditLog": AuditLog,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};