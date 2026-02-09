/**
 * pages.config.js - Page routing configuration with lazy loading
 * 
 * MODIFIED FOR CODE SPLITTING: This file now uses React.lazy() for route-based code splitting.
 * Each page is loaded on demand rather than all at once, significantly reducing initial bundle size.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 */
import { lazy } from 'react';
import __Layout from './Layout.jsx';

// Lazy load all pages for code splitting
const ABTestingDashboard = lazy(() => import('./pages/ABTestingDashboard'));
const AIAdminDashboard = lazy(() => import('./pages/AIAdminDashboard'));
const AIEnhancedCoaching = lazy(() => import('./pages/AIEnhancedCoaching'));
const AIEventPlanner = lazy(() => import('./pages/AIEventPlanner'));
const AIPersonalization = lazy(() => import('./pages/AIPersonalization'));
const Activities = lazy(() => import('./pages/Activities'));
const AdminAnalyticsDashboard = lazy(() => import('./pages/AdminAnalyticsDashboard'));
const AdminHub = lazy(() => import('./pages/AdminHub'));
const AdvancedAnalytics = lazy(() => import('./pages/AdvancedAnalytics'));
const AdvancedGamificationAnalytics = lazy(() => import('./pages/AdvancedGamificationAnalytics'));
const AdvancedReportingSuite = lazy(() => import('./pages/AdvancedReportingSuite'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const AuditLog = lazy(() => import('./pages/AuditLog'));
const AvatarShopHub = lazy(() => import('./pages/AvatarShopHub'));
const Blog = lazy(() => import('./pages/Blog'));
const Calendar = lazy(() => import('./pages/Calendar'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const Channels = lazy(() => import('./pages/Channels'));
const ComprehensiveProfile = lazy(() => import('./pages/ComprehensiveProfile'));
const ContentModerationAdmin = lazy(() => import('./pages/ContentModerationAdmin'));
const CustomAnalytics = lazy(() => import('./pages/CustomAnalytics'));
const CustomizableAnalyticsDashboard = lazy(() => import('./pages/CustomizableAnalyticsDashboard'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DawnHub = lazy(() => import('./pages/DawnHub'));
const Documentation = lazy(() => import('./pages/Documentation'));
const EmployeeDirectory = lazy(() => import('./pages/EmployeeDirectory'));
const EngagementHub = lazy(() => import('./pages/EngagementHub'));
const EventAnalyticsDashboard = lazy(() => import('./pages/EventAnalyticsDashboard'));
const EventTemplates = lazy(() => import('./pages/EventTemplates'));
const EventWizard = lazy(() => import('./pages/EventWizard'));
const ExampleModulePage = lazy(() => import('./pages/ExampleModulePage'));
const ExpandedUserProfile = lazy(() => import('./pages/ExpandedUserProfile'));
const FacilitatorDashboard = lazy(() => import('./pages/FacilitatorDashboard'));
const FacilitatorView = lazy(() => import('./pages/FacilitatorView'));
const FeedbackAdmin = lazy(() => import('./pages/FeedbackAdmin'));
const Gamification = lazy(() => import('./pages/Gamification'));
const GamificationAdmin = lazy(() => import('./pages/GamificationAdmin'));
const GamificationAnalytics = lazy(() => import('./pages/GamificationAnalytics'));
const GamificationDashboard = lazy(() => import('./pages/GamificationDashboard'));
const GamificationRuleBuilder = lazy(() => import('./pages/GamificationRuleBuilder'));
const GamificationRulesAdmin = lazy(() => import('./pages/GamificationRulesAdmin'));
const GamificationSettings = lazy(() => import('./pages/GamificationSettings'));
const GamifiedOnboarding = lazy(() => import('./pages/GamifiedOnboarding'));
const Home = lazy(() => import('./pages/Home'));
const HorizonHub = lazy(() => import('./pages/HorizonHub'));
const Integrations = lazy(() => import('./pages/Integrations'));
const IntegrationsAdmin = lazy(() => import('./pages/IntegrationsAdmin'));
const IntegrationsHub = lazy(() => import('./pages/IntegrationsHub'));
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'));
const KnowledgeHub = lazy(() => import('./pages/KnowledgeHub'));
const Landing = lazy(() => import('./pages/Landing'));
const LeaderboardRankCelebration = lazy(() => import('./pages/LeaderboardRankCelebration'));
const Leaderboards = lazy(() => import('./pages/Leaderboards'));
const LearningDashboard = lazy(() => import('./pages/LearningDashboard'));
const LearningPath = lazy(() => import('./pages/LearningPath'));
const LifecycleAnalyticsDashboard = lazy(() => import('./pages/LifecycleAnalyticsDashboard'));
const LifecycleIntelligenceDashboard = lazy(() => import('./pages/LifecycleIntelligenceDashboard'));
const ManagerOnboardingDashboard = lazy(() => import('./pages/ManagerOnboardingDashboard'));
const MarketingHome = lazy(() => import('./pages/MarketingHome'));
const MarketingLanding = lazy(() => import('./pages/MarketingLanding'));
const MentorshipHub = lazy(() => import('./pages/MentorshipHub'));
const Milestones = lazy(() => import('./pages/Milestones'));
const NewEmployeeOnboarding = lazy(() => import('./pages/NewEmployeeOnboarding'));
const NewHireOnboarding = lazy(() => import('./pages/NewHireOnboarding'));
const OnboardingDashboard = lazy(() => import('./pages/OnboardingDashboard'));
const OnboardingHub = lazy(() => import('./pages/OnboardingHub'));
const PRDGenerator = lazy(() => import('./pages/PRDGenerator'));
const ParticipantEvent = lazy(() => import('./pages/ParticipantEvent'));
const ParticipantHub = lazy(() => import('./pages/ParticipantHub'));
const ParticipantPortal = lazy(() => import('./pages/ParticipantPortal'));
const PointStore = lazy(() => import('./pages/PointStore'));
const PowerUserHub = lazy(() => import('./pages/PowerUserHub'));
const PredictiveAnalytics = lazy(() => import('./pages/PredictiveAnalytics'));
const PredictiveAnalyticsDashboard = lazy(() => import('./pages/PredictiveAnalyticsDashboard'));
const Product = lazy(() => import('./pages/Product'));
const ProductShowcase = lazy(() => import('./pages/ProductShowcase'));
const ProfileCustomization = lazy(() => import('./pages/ProfileCustomization'));
const ProjectPlan = lazy(() => import('./pages/ProjectPlan'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const RealTimeAnalytics = lazy(() => import('./pages/RealTimeAnalytics'));
const Recognition = lazy(() => import('./pages/Recognition'));
const RecognitionEngine = lazy(() => import('./pages/RecognitionEngine'));
const RecognitionFeed = lazy(() => import('./pages/RecognitionFeed'));
const ReportBuilder = lazy(() => import('./pages/ReportBuilder'));
const Resources = lazy(() => import('./pages/Resources'));
const RewardsAdmin = lazy(() => import('./pages/RewardsAdmin'));
const RewardsStore = lazy(() => import('./pages/RewardsStore'));
const RoleManagement = lazy(() => import('./pages/RoleManagement'));
const RoleSelection = lazy(() => import('./pages/RoleSelection'));
const RoleSetup = lazy(() => import('./pages/RoleSetup'));
const SegmentationDashboard = lazy(() => import('./pages/SegmentationDashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const SkillsDashboard = lazy(() => import('./pages/SkillsDashboard'));
const SkillsMatrix = lazy(() => import('./pages/SkillsMatrix'));
const SocialGamification = lazy(() => import('./pages/SocialGamification'));
const SocialHub = lazy(() => import('./pages/SocialHub'));
const Splash = lazy(() => import('./pages/Splash'));
const Surveys = lazy(() => import('./pages/Surveys'));
const TeamAnalyticsDashboard = lazy(() => import('./pages/TeamAnalyticsDashboard'));
const TeamAutomation = lazy(() => import('./pages/TeamAutomation'));
const TeamAutomations = lazy(() => import('./pages/TeamAutomations'));
const TeamChallenges = lazy(() => import('./pages/TeamChallenges'));
const TeamCompetition = lazy(() => import('./pages/TeamCompetition'));
const TeamDashboard = lazy(() => import('./pages/TeamDashboard'));
const TeamLeaderDashboard = lazy(() => import('./pages/TeamLeaderDashboard'));
const TeamLeaderboard = lazy(() => import('./pages/TeamLeaderboard'));
const TeamPerformanceDashboard = lazy(() => import('./pages/TeamPerformanceDashboard'));
const Teams = lazy(() => import('./pages/Teams'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const UserRoleAssignment = lazy(() => import('./pages/UserRoleAssignment'));
const UserSegmentation = lazy(() => import('./pages/UserSegmentation'));
const WellnessAdmin = lazy(() => import('./pages/WellnessAdmin'));
const WellnessAnalyticsReport = lazy(() => import('./pages/WellnessAnalyticsReport'));
const WellnessDashboard = lazy(() => import('./pages/WellnessDashboard'));
const Whitepapers = lazy(() => import('./pages/Whitepapers'));
const CustomReportBuilder = lazy(() => import('./pages/CustomReportBuilder'));

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
    "CustomReportBuilder": CustomReportBuilder,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};
