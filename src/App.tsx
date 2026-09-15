import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import './index.css'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

import Home from './pages/Home'
import Directions from './pages/Directions'
import About from './pages/About'
import Projects from './pages/Projects'
import Contact from './pages/Contact'

// Редактор на презентации (учител)
import PresentationEditor from './pages/PresentationEditor'

// Компонент за гледане САМО от учителя (с контроли, QR, статус)
import PresentationViewer from './pages/PresentationViewer'

// Компонент за гледане САМО от ученици (минимален)
import StudentViewer from './pages/StudentViewer'

// 🆕 Join страница – учениците влизат с код
import JoinPage from './pages/JoinPage'

// ─── Layout wrapper, който скрива Header/Footer на fullscreen страниците ───
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()

  // Страници, на които НЕ искаме Header и Footer
  const fullscreenRoutes = ['/create', '/view', '/present', '/join']
  const isFullscreen = fullscreenRoutes.some((route) =>
    location.pathname.startsWith(route)
  )

  if (isFullscreen) {
    // Само съдържанието – без Header, без Footer, без padding
    return <>{children}</>
  }

  // Нормален сайт layout
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 main-content">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* ─── Публични страници на сайта ─── */}
          <Route path="/" element={<Home />} />
          <Route path="/directions" element={<Directions />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />

          {/* ─── Редактор на презентации (учител, защитен с PIN) ─── */}
          <Route path="/create" element={<PresentationEditor />} />

          {/* ─── Гледане на живо от УЧИТЕЛЯ (с контроли, QR, статус) ─── */}
          {/* Учителят може да отвори този route ръчно, ако иска отделен таб */}
          <Route path="/present" element={<PresentationViewer />} />

          {/* ─── Гледане на живо от УЧЕНИЦИТЕ (минимален) ─── */}
          {/* Това е route-ът, който се отваря след сканиране на QR кода */}
          <Route path="/view" element={<StudentViewer />} />

          {/* 🆕 Join страница – учениците влизат с 6-цифрен код */}
          {/* URL: presenta-rose.vercel.app/join */}
          <Route path="/join" element={<JoinPage />} />

          {/* ─── 404 fallback (по избор) ─── */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-[#0A162B] flex items-center justify-center text-white/60 p-6">
                <div className="text-center">
                  <p className="text-6xl font-bold text-white/20 mb-4">404</p>
                  <p className="text-lg text-white/50">Страницата не е намерена</p>
                </div>
              </div>
            }
          />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App