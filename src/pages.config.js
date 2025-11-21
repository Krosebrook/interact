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
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};