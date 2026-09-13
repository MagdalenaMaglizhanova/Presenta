import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-[#1A1F36] text-white/60 pt-16 pb-6 overflow-hidden">
      {/* Декоративни елементи */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#5B3FD1]/30 to-transparent" />
      <div className="absolute -right-[150px] -bottom-[150px] w-[400px] h-[400px] rounded-full bg-[#5B3FD1]/5 blur-3xl" />
      <div className="absolute -left-[100px] top-[50%] w-[300px] h-[300px] rounded-full bg-[#18BFC7]/5 blur-3xl" />
      
      <div className="container-custom relative z-10">
        {/* Горна част - основно съдържание */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/5">
          {/* Колона 1 - Бранд */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xl font-extrabold tracking-tight text-white">
                Presenta
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B3FD1]" />
            </div>
            <p className="text-sm text-white/40 max-w-[200px] leading-relaxed">
              Where ideas become impactful presentations.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-1 h-1 rounded-full bg-[#5B3FD1]" />
              <span className="text-[10px] font-medium tracking-widest uppercase text-white/30">
                Present • Engage • Connect
              </span>
              <span className="w-1 h-1 rounded-full bg-[#18BFC7]" />
            </div>
          </div>

          {/* Колона 2 - Навигация */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.12em] mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors duration-200">About</Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors duration-200">Features</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors duration-200">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Колона 3 - Услуги */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.12em] mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/presentations" className="hover:text-white transition-colors duration-200">Keynotes</Link>
              </li>
              <li>
                <Link to="/workshops" className="hover:text-white transition-colors duration-200">Workshops</Link>
              </li>
              <li>
                <Link to="/consulting" className="hover:text-white transition-colors duration-200">Consulting</Link>
              </li>
              <li>
                <Link to="/training" className="hover:text-white transition-colors duration-200">Training</Link>
              </li>
            </ul>
          </div>

          {/* Колона 4 - Контакти */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.12em] mb-4">
              Connect
            </h4>
            <div className="flex gap-3 mb-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a 
                href="mailto:presentations@example.com" 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5"
                aria-label="Email"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
            <p className="text-sm text-white/40">
              <a href="mailto:presentations@example.com" className="hover:text-white transition-colors">
                hello@presenta.com
              </a>
            </p>
          </div>
        </div>

        {/* Долна част - копирайт и бутон нагоре */}
        <div className="flex flex-wrap justify-between items-center gap-4 pt-6 text-sm">
          <div>
            <span className="text-white/40">
              © 2026 <span className="text-white font-semibold">Presenta</span> · All rights reserved
            </span>
          </div>
          <div className="flex gap-6 text-white/40">
            <Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors duration-200">Terms</Link>
            <Link to="/cookies" className="hover:text-white transition-colors duration-200">Cookies</Link>
          </div>
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 text-white/50 hover:text-white text-xs font-medium uppercase tracking-wider hover:-translate-y-0.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer