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
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};