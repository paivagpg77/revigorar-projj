import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home/Home.jsx'
import About from './pages/About/About.jsx'
import Features from './pages/Features/Features.jsx'
import Plans from './pages/Plans/Plans.jsx'
import Contact from './pages/Contact/Contact.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sobre-nos" element={<About />} />
        <Route path="/funcionalidades" element={<Features />} />
        <Route path="/planos" element={<Plans />} />
        <Route path="/contatos" element={<Contact />} />
      </Route>
    </Routes>
  )
}
