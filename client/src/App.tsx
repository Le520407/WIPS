import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Docs from './pages/Docs';
import DemoLogin from './pages/DemoLogin';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import TemplatesUnified from './pages/TemplatesUnified';
import CallSettingsUnified from './pages/CallSettingsUnified';
import ReviewTips from './pages/ReviewTips';
import MarketingLimits from './pages/MarketingLimits';
import PacingMonitor from './pages/PacingMonitor';
import TemplateLibrary from './pages/TemplateLibrary';
import TemplateComparison from './pages/TemplateComparison';
import WebhookSettings from './pages/WebhookSettings';
import Calls from './pages/Calls';
import MissedCalls from './pages/MissedCalls';
import CallButton from './pages/CallButton';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import GroupJoinRequests from './pages/GroupJoinRequests';
import GroupMessages from './pages/GroupMessages';
import WebsiteManagement from './pages/WebsiteManagement';
import ApiKeyManagement from './pages/ApiKeyManagement';
import UsageDashboard from './pages/UsageDashboard';
import BusinessProfile from './pages/BusinessProfile';
import Commerce from './pages/Commerce';
import MarketingInfo from './pages/MarketingInfo';
import AdminDashboard from './pages/AdminDashboard';
import AccountManagement from './pages/AccountManagement';
import UserManagement from './pages/UserManagement';
import AccountSettings from './pages/AccountSettings';
import ConversationalComponents from './pages/ConversationalComponents';
import BlockedUsers from './pages/BlockedUsers';
import AuthenticationTemplates from './pages/AuthenticationTemplates';
import PhoneNumberStatus from './pages/PhoneNumberStatus';
import DisplayNameManagement from './pages/DisplayNameManagement';
import TwoStepVerification from './pages/TwoStepVerification';
import PhoneRegistration from './pages/PhoneRegistration';
import AuthCallback from './pages/AuthCallback';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import NotificationManager from './components/NotificationManager';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificationManager />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/login" element={<DemoLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="messages" element={<Messages />} />
            <Route path="templates" element={<TemplatesUnified />} />
            <Route path="quality" element={<TemplatesUnified />} />
            <Route path="webhook-settings" element={<WebhookSettings />} />
            <Route path="calls" element={<Calls />} />
            <Route path="missed-calls" element={<MissedCalls />} />
            <Route path="call-settings" element={<CallSettingsUnified />} />
            <Route path="call-button" element={<CallButton />} />
            <Route path="review-tips" element={<ReviewTips />} />
            <Route path="marketing-limits" element={<MarketingLimits />} />
            <Route path="pacing" element={<PacingMonitor />} />
            <Route path="template-library" element={<TemplateLibrary />} />
            <Route path="template-comparison" element={<TemplateComparison />} />
            <Route path="groups" element={<Groups />} />
            <Route path="groups/:groupId" element={<GroupDetail />} />
            <Route path="groups/:groupId/join-requests" element={<GroupJoinRequests />} />
            <Route path="groups/:groupId/messages" element={<GroupMessages />} />
            <Route path="websites" element={<WebsiteManagement />} />
            <Route path="api-keys/:websiteId" element={<ApiKeyManagement />} />
            <Route path="usage" element={<UsageDashboard />} />
            <Route path="business-profile" element={<BusinessProfile />} />
            <Route path="commerce" element={<Commerce />} />
            <Route path="marketing" element={<MarketingInfo />} />
            <Route path="conversational-components" element={<ConversationalComponents />} />
            <Route path="blocked-users" element={<BlockedUsers />} />
            <Route path="authentication-templates" element={<AuthenticationTemplates />} />
            <Route path="phone-number-status" element={<PhoneNumberStatus />} />
            <Route path="display-name" element={<DisplayNameManagement />} />
            <Route path="two-step-verification" element={<TwoStepVerification />} />
            <Route path="phone-registration" element={<PhoneRegistration />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/accounts" element={<AccountManagement />} />
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="account-settings" element={<AccountSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
