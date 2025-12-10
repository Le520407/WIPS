import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import DemoLogin from './pages/DemoLogin';
import DemoInfo from './pages/DemoInfo';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Templates from './pages/Templates';
import TemplateGroups from './pages/TemplateGroups';
import QualityMonitor from './pages/QualityMonitor';
import PausedTemplates from './pages/PausedTemplates';
import MarketingLimits from './pages/MarketingLimits';
import ReviewTips from './pages/ReviewTips';
import PacingMonitor from './pages/PacingMonitor';
import TemplateLibrary from './pages/TemplateLibrary';
import TemplateComparison from './pages/TemplateComparison';
import WebhookSettings from './pages/WebhookSettings';
import Calls from './pages/Calls';
import CallSettings from './pages/CallSettings';
import CallQualityMonitor from './pages/CallQualityMonitor';
import MissedCalls from './pages/MissedCalls';
import CallLimits from './pages/CallLimits';
import CallButton from './pages/CallButton';
import CallAnalytics from './pages/CallAnalytics';
import SipSettings from './pages/SipSettings';
import SipStatus from './pages/SipStatus';
import Groups from './pages/Groups';
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
          <Route path="/login" element={<DemoLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/demo-info" replace />} />
            <Route path="demo-info" element={<DemoInfo />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="messages" element={<Messages />} />
            <Route path="templates" element={<Templates />} />
            <Route path="template-groups" element={<TemplateGroups />} />
            <Route path="quality" element={<QualityMonitor />} />
            <Route path="paused" element={<PausedTemplates />} />
            <Route path="webhook-settings" element={<WebhookSettings />} />
            <Route path="calls" element={<Calls />} />
            <Route path="missed-calls" element={<MissedCalls />} />
            <Route path="call-settings" element={<CallSettings />} />
            <Route path="call-quality" element={<CallQualityMonitor />} />
            <Route path="call-limits" element={<CallLimits />} />
            <Route path="call-button" element={<CallButton />} />
            <Route path="call-analytics" element={<CallAnalytics />} />
            <Route path="sip-settings" element={<SipSettings />} />
            <Route path="sip-status" element={<SipStatus />} />
            <Route path="groups" element={<Groups />} />
            <Route path="review-tips" element={<ReviewTips />} />
            <Route path="marketing-limits" element={<MarketingLimits />} />
            <Route path="pacing" element={<PacingMonitor />} />
            <Route path="template-library" element={<TemplateLibrary />} />
            <Route path="template-comparison" element={<TemplateComparison />} />
            <Route path="resources" element={<Navigate to="/review-tips" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
