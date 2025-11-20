import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import ParticipantEvent from './pages/ParticipantEvent';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Activities": Activities,
    "Calendar": Calendar,
    "Analytics": Analytics,
    "ParticipantEvent": ParticipantEvent,
    "Settings": Settings,
    "Leaderboard": Leaderboard,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};