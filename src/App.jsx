import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home/Home'
import ActiveProjectDetails from './Pages/ProjectDetails/ActiveProjectDetails'
import About from './Pages/About/About'
import Auth from './Pages/Auth/Auth'
import ViewAllActiveProjects from './Pages/ViewAllActiveProjects/ViewAllActiveProjects'
import ViewAllOngoingProjects from './Pages/ViewAllOngoingProjects/ViewAllOngoingProjects'
import ViewAllCompletedProjects from './Pages/ViewAllCompletedProjects/ViewAllCompletedProjects'
import ChatIcon from './Components/ChatIcon'
import Chat from './Pages/Chat/Chat'
import PaymentSuccess from './Pages/PaymentSuccess/PaymentSuccess'
import Profile from './Pages/Profile/Profile'
import ExclusiveProjects from './Pages/ExclusiveProjects/ExclusiveProjects'
import TransactionHistory from './Pages/TransactionHistory/TransactionHistory'
import ProtectedRoute from './Components/ProtectedRoute'
import ScrollToTop from './Components/ScrollToTop'
import PrivacyPolicy from './Pages/Legal/PrivacyPolicy'
import TermsAndConditions from './Pages/Legal/TermsAndConditions'
import IdleLogout from './Components/IdleLogout'
import SessionExpiredModal from './Components/SessionExpiredModal'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <IdleLogout />
      <SessionExpiredModal />
      <ChatIcon />
      <Routes>
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ActiveProjectDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/active-projects" element={<ViewAllActiveProjects />} />
        <Route path="/ongoing-projects" element={<ViewAllOngoingProjects />} />
        <Route path="/completed-projects" element={<ViewAllCompletedProjects />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/exclusive-projects" element={<ExclusiveProjects />} />
        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/transaction-history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsAndConditions />} />
      </Routes>
    </Router>
  )
}

export default App
