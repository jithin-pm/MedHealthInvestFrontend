import Navbar from './HomeComponents/Navbar'
import Banner from './HomeComponents/Banner'
import AboutBrief from './HomeComponents/AboutBrief'
import ActiveProjects from './HomeComponents/ActiveProjects'
import OngoingProjects from './HomeComponents/OngoingProjects'
import CompletedProjects from './HomeComponents/CompletedProjects'
import Footer from '../../Components/Footer'

export default function Home() {
  return (
    <main className="bg-black min-h-screen relative overflow-hidden">
      <Navbar />
      <Banner />
      <AboutBrief />
      <ActiveProjects />
      <OngoingProjects />
      <CompletedProjects />
      <Footer />
    </main>
  )
}
