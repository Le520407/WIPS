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
import AuthCallback from './pages/AuthCallback';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
            <Route path="marketing-limits" element={<MarketingLimits />} />
            <Route path="review-tips" element={<ReviewTips />} />
            <Route path="pacing" element={<PacingMonitor />} />
            <Route path="template-library" element={<TemplateLibrary />} />
            <Route path="template-comparison" element={<TemplateComparison />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
