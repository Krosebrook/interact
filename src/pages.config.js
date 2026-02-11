/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ABTestingDashboard from './pages/ABTestingDashboard';
import AIAdminDashboard from './pages/AIAdminDashboard';
import AIEnhancedCoaching from './pages/AIEnhancedCoaching';
import AIEventPlanner from './pages/AIEventPlanner';
import AIPersonalization from './pages/AIPersonalization';
import Activities from './pages/Activities';
import AdminAnalyticsDashboard from './pages/AdminAnalyticsDashboard';
import AdminHub from './pages/AdminHub';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import AdvancedGamificationAnalytics from './pages/AdvancedGamificationAnalytics';
import AdvancedReportingSuite from './pages/AdvancedReportingSuite';
import Analytics from './pages/Analytics';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AuditLog from './pages/AuditLog';
import AvatarShopHub from './pages/AvatarShopHub';
import Blog from './pages/Blog';
import Calendar from './pages/Calendar';
import CaseStudies from './pages/CaseStudies';
import Channels from './pages/Channels';
import ComprehensiveProfile from './pages/ComprehensiveProfile';
import ContentModerationAdmin from './pages/ContentModerationAdmin';
import CustomAnalytics from './pages/CustomAnalytics';
import CustomReportBuilder from './pages/CustomReportBuilder';
import CustomizableAnalyticsDashboard from './pages/CustomizableAnalyticsDashboard';
import Dashboard from './pages/Dashboard';
import DawnHub from './pages/DawnHub';
import Documentation from './pages/Documentation';
import EmployeeDirectory from './pages/EmployeeDirectory';
import EngagementHub from './pages/EngagementHub';
import EventAnalyticsDashboard from './pages/EventAnalyticsDashboard';
import EventTemplates from './pages/EventTemplates';
import EventWizard from './pages/EventWizard';
import ExampleModulePage from './pages/ExampleModulePage';
import ExpandedUserProfile from './pages/ExpandedUserProfile';
import FacilitatorDashboard from './pages/FacilitatorDashboard';
import FacilitatorView from './pages/FacilitatorView';
import FeedbackAdmin from './pages/FeedbackAdmin';
import Gamification from './pages/Gamification';
import GamificationAdmin from './pages/GamificationAdmin';
import GamificationAnalytics from './pages/GamificationAnalytics';
import GamificationDashboard from './pages/GamificationDashboard';
import GamificationRuleBuilder from './pages/GamificationRuleBuilder';
import GamificationRulesAdmin from './pages/GamificationRulesAdmin';
import GamificationSettings from './pages/GamificationSettings';
import GamifiedOnboarding from './pages/GamifiedOnboarding';
import Home from './pages/Home';
import HorizonHub from './pages/HorizonHub';
import Integrations from './pages/Integrations';
import IntegrationsAdmin from './pages/IntegrationsAdmin';
import IntegrationsHub from './pages/IntegrationsHub';
import KnowledgeBase from './pages/KnowledgeBase';
import KnowledgeHub from './pages/KnowledgeHub';
import Landing from './pages/Landing';
import LeaderboardRankCelebration from './pages/LeaderboardRankCelebration';
import Leaderboards from './pages/Leaderboards';
import LearningDashboard from './pages/LearningDashboard';
import LearningPath from './pages/LearningPath';
import LifecycleAnalyticsDashboard from './pages/LifecycleAnalyticsDashboard';
import LifecycleIntelligenceDashboard from './pages/LifecycleIntelligenceDashboard';
import ManagerOnboardingDashboard from './pages/ManagerOnboardingDashboard';
import MarketingHome from './pages/MarketingHome';
import MarketingLanding from './pages/MarketingLanding';
import MentorshipHub from './pages/MentorshipHub';
import Milestones from './pages/Milestones';
import NewEmployeeOnboarding from './pages/NewEmployeeOnboarding';
import NewHireOnboarding from './pages/NewHireOnboarding';
import OnboardingDashboard from './pages/OnboardingDashboard';
import OnboardingHub from './pages/OnboardingHub';
import PRDGenerator from './pages/PRDGenerator';
import ParticipantEvent from './pages/ParticipantEvent';
import ParticipantHub from './pages/ParticipantHub';
import ParticipantPortal from './pages/ParticipantPortal';
import PointStore from './pages/PointStore';
import PowerUserHub from './pages/PowerUserHub';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import PredictiveAnalyticsDashboard from './pages/PredictiveAnalyticsDashboard';
import Product from './pages/Product';
import ProductShowcase from './pages/ProductShowcase';
import ProfileCustomization from './pages/ProfileCustomization';
import ProjectPlan from './pages/ProjectPlan';
import PublicProfile from './pages/PublicProfile';
import RealTimeAnalytics from './pages/RealTimeAnalytics';
import Recognition from './pages/Recognition';
import RecognitionEngine from './pages/RecognitionEngine';
import RecognitionFeed from './pages/RecognitionFeed';
import ReportBuilder from './pages/ReportBuilder';
import Resources from './pages/Resources';
import RewardsAdmin from './pages/RewardsAdmin';
import RewardsStore from './pages/RewardsStore';
import RoleManagement from './pages/RoleManagement';
import RoleSelection from './pages/RoleSelection';
import RoleSetup from './pages/RoleSetup';
import SegmentationDashboard from './pages/SegmentationDashboard';
import Settings from './pages/Settings';
import SkillsDashboard from './pages/SkillsDashboard';
import SkillsMatrix from './pages/SkillsMatrix';
import SocialGamification from './pages/SocialGamification';
import SocialHub from './pages/SocialHub';
import Splash from './pages/Splash';
import Surveys from './pages/Surveys';
import TeamAnalyticsDashboard from './pages/TeamAnalyticsDashboard';
import TeamAutomation from './pages/TeamAutomation';
import TeamAutomations from './pages/TeamAutomations';
import TeamChallenges from './pages/TeamChallenges';
import TeamCompetition from './pages/TeamCompetition';
import TeamDashboard from './pages/TeamDashboard';
import TeamLeaderDashboard from './pages/TeamLeaderDashboard';
import TeamLeaderboard from './pages/TeamLeaderboard';
import TeamPerformanceDashboard from './pages/TeamPerformanceDashboard';
import Teams from './pages/Teams';
import UserProfile from './pages/UserProfile';
import UserRoleAssignment from './pages/UserRoleAssignment';
import UserSegmentation from './pages/UserSegmentation';
import WellnessAdmin from './pages/WellnessAdmin';
import WellnessAnalyticsReport from './pages/WellnessAnalyticsReport';
import WellnessDashboard from './pages/WellnessDashboard';
import Whitepapers from './pages/Whitepapers';
import AdminDashboard from './pages/AdminDashboard';
import Challenges from './pages/Challenges';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ABTestingDashboard": ABTestingDashboard,
    "AIAdminDashboard": AIAdminDashboard,
    "AIEnhancedCoaching": AIEnhancedCoaching,
    "AIEventPlanner": AIEventPlanner,
    "AIPersonalization": AIPersonalization,
    "Activities": Activities,
    "AdminAnalyticsDashboard": AdminAnalyticsDashboard,
    "AdminHub": AdminHub,
    "AdvancedAnalytics": AdvancedAnalytics,
    "AdvancedGamificationAnalytics": AdvancedGamificationAnalytics,
    "AdvancedReportingSuite": AdvancedReportingSuite,
    "Analytics": Analytics,
    "AnalyticsDashboard": AnalyticsDashboard,
    "AuditLog": AuditLog,
    "AvatarShopHub": AvatarShopHub,
    "Blog": Blog,
    "Calendar": Calendar,
    "CaseStudies": CaseStudies,
    "Channels": Channels,
    "ComprehensiveProfile": ComprehensiveProfile,
    "ContentModerationAdmin": ContentModerationAdmin,
    "CustomAnalytics": CustomAnalytics,
    "CustomReportBuilder": CustomReportBuilder,
    "CustomizableAnalyticsDashboard": CustomizableAnalyticsDashboard,
    "Dashboard": Dashboard,
    "DawnHub": DawnHub,
    "Documentation": Documentation,
    "EmployeeDirectory": EmployeeDirectory,
    "EngagementHub": EngagementHub,
    "EventAnalyticsDashboard": EventAnalyticsDashboard,
    "EventTemplates": EventTemplates,
    "EventWizard": EventWizard,
    "ExampleModulePage": ExampleModulePage,
    "ExpandedUserProfile": ExpandedUserProfile,
    "FacilitatorDashboard": FacilitatorDashboard,
    "FacilitatorView": FacilitatorView,
    "FeedbackAdmin": FeedbackAdmin,
    "Gamification": Gamification,
    "GamificationAdmin": GamificationAdmin,
    "GamificationAnalytics": GamificationAnalytics,
    "GamificationDashboard": GamificationDashboard,
    "GamificationRuleBuilder": GamificationRuleBuilder,
    "GamificationRulesAdmin": GamificationRulesAdmin,
    "GamificationSettings": GamificationSettings,
    "GamifiedOnboarding": GamifiedOnboarding,
    "Home": Home,
    "HorizonHub": HorizonHub,
    "Integrations": Integrations,
    "IntegrationsAdmin": IntegrationsAdmin,
    "IntegrationsHub": IntegrationsHub,
    "KnowledgeBase": KnowledgeBase,
    "KnowledgeHub": KnowledgeHub,
    "Landing": Landing,
    "LeaderboardRankCelebration": LeaderboardRankCelebration,
    "Leaderboards": Leaderboards,
    "LearningDashboard": LearningDashboard,
    "LearningPath": LearningPath,
    "LifecycleAnalyticsDashboard": LifecycleAnalyticsDashboard,
    "LifecycleIntelligenceDashboard": LifecycleIntelligenceDashboard,
    "ManagerOnboardingDashboard": ManagerOnboardingDashboard,
    "MarketingHome": MarketingHome,
    "MarketingLanding": MarketingLanding,
    "MentorshipHub": MentorshipHub,
    "Milestones": Milestones,
    "NewEmployeeOnboarding": NewEmployeeOnboarding,
    "NewHireOnboarding": NewHireOnboarding,
    "OnboardingDashboard": OnboardingDashboard,
    "OnboardingHub": OnboardingHub,
    "PRDGenerator": PRDGenerator,
    "ParticipantEvent": ParticipantEvent,
    "ParticipantHub": ParticipantHub,
    "ParticipantPortal": ParticipantPortal,
    "PointStore": PointStore,
    "PowerUserHub": PowerUserHub,
    "PredictiveAnalytics": PredictiveAnalytics,
    "PredictiveAnalyticsDashboard": PredictiveAnalyticsDashboard,
    "Product": Product,
    "ProductShowcase": ProductShowcase,
    "ProfileCustomization": ProfileCustomization,
    "ProjectPlan": ProjectPlan,
    "PublicProfile": PublicProfile,
    "RealTimeAnalytics": RealTimeAnalytics,
    "Recognition": Recognition,
    "RecognitionEngine": RecognitionEngine,
    "RecognitionFeed": RecognitionFeed,
    "ReportBuilder": ReportBuilder,
    "Resources": Resources,
    "RewardsAdmin": RewardsAdmin,
    "RewardsStore": RewardsStore,
    "RoleManagement": RoleManagement,
    "RoleSelection": RoleSelection,
    "RoleSetup": RoleSetup,
    "SegmentationDashboard": SegmentationDashboard,
    "Settings": Settings,
    "SkillsDashboard": SkillsDashboard,
    "SkillsMatrix": SkillsMatrix,
    "SocialGamification": SocialGamification,
    "SocialHub": SocialHub,
    "Splash": Splash,
    "Surveys": Surveys,
    "TeamAnalyticsDashboard": TeamAnalyticsDashboard,
    "TeamAutomation": TeamAutomation,
    "TeamAutomations": TeamAutomations,
    "TeamChallenges": TeamChallenges,
    "TeamCompetition": TeamCompetition,
    "TeamDashboard": TeamDashboard,
    "TeamLeaderDashboard": TeamLeaderDashboard,
    "TeamLeaderboard": TeamLeaderboard,
    "TeamPerformanceDashboard": TeamPerformanceDashboard,
    "Teams": Teams,
    "UserProfile": UserProfile,
    "UserRoleAssignment": UserRoleAssignment,
    "UserSegmentation": UserSegmentation,
    "WellnessAdmin": WellnessAdmin,
    "WellnessAnalyticsReport": WellnessAnalyticsReport,
    "WellnessDashboard": WellnessDashboard,
    "Whitepapers": Whitepapers,
    "AdminDashboard": AdminDashboard,
    "Challenges": Challenges,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};