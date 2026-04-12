import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home/Home'
import ActiveProjectDetails from './Pages/ProjectDetails/ActiveProjectDetails'
import About from './Pages/About/About'
import Auth from './Pages/Auth/Auth'
import ViewAllActiveProjects from './Pages/ViewAllActiveProjects/ViewAllActiveProjects'
import ViewAllOngoingProjects from './Pages/ViewAllOngoingProjects/ViewAllOngoingProjects'
import ViewAllCompletedProjects from './Pages/ViewAllCompletedProjects/ViewAllCompletedProjects'
import ChatIcon from './Components/ChatIcon'

function App() {
  return (
    <Router>
      <ChatIcon />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ActiveProjectDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/active-projects" element={<ViewAllActiveProjects />} />
        <Route path="/ongoing-projects" element={<ViewAllOngoingProjects />} />
        <Route path="/completed-projects" element={<ViewAllCompletedProjects />} />
      </Routes>
    </Router>
  )
}

export default App
