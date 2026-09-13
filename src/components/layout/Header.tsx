import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight, Plus } from 'lucide-react'

import logo from '/logo.png'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'For Teachers', href: '/teachers' },
    { label: 'About', href: '/about' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl" />

      <div className="relative border-b border-[#EEF0F6]">
        <div className="container-custom">
          <div className="flex items-center justify-between h-[72px]">

            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center shrink-0 gap-2.5 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <img
                src={logo}
                alt="Presenta"
                className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105"
              />
              <span className="text-lg font-extrabold bg-gradient-to-r from-[#5B3FD1] via-[#7C5CE7] to-[#18BFC7] bg-clip-text text-transparent tracking-tight">
                Presenta
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `relative py-1.5 text-[14px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[#5B3FD1]'
                        : 'text-[#4A506B] hover:text-[#5B3FD1]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      <span
                        className={`absolute left-0 -bottom-1 h-[2px] bg-[#5B3FD1] transition-all duration-300 rounded-full ${
                          isActive ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* DESKTOP CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-[14px] font-medium text-[#4A506B] hover:text-[#5B3FD1] transition-colors"
              >
                Sign In
              </Link>

              <Link
                to="/create"
                className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[14px] font-medium bg-[#5B3FD1] hover:bg-[#4A32B8] shadow-lg shadow-[#5B3FD1]/30 transition-all duration-300 hover:shadow-[#5B3FD1]/50"
              >
                <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
                <span>Create Presentation</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[#1A1F36] hover:bg-[#F3F4FB] transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X size={20} strokeWidth={1.5} />
              ) : (
                <Menu size={20} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden relative bg-white/98 backdrop-blur-xl border-b border-[#EEF0F6] overflow-hidden shadow-lg"
          >
            <div className="container-custom px-5 py-4">

              <nav className="flex flex-col gap-0.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                        isActive
                          ? 'bg-[#F4F1FF] text-[#5B3FD1]'
                          : 'text-[#4A506B] hover:bg-[#F8F9FC] hover:text-[#5B3FD1]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-[#EEF0F6] flex flex-col gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl text-[15px] font-medium text-[#4A506B] bg-[#F8F9FC] hover:bg-[#EEF0F6] transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  to="/create"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-[15px] font-medium text-white bg-[#5B3FD1] hover:bg-[#4A32B8] shadow-lg shadow-[#5B3FD1]/25 transition-all"
                >
                  <Plus size={18} />
                  <span>Create Presentation</span>
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* Brand statement */}
              <div className="mt-4 pt-3 flex items-center justify-center gap-2.5 text-[10px] font-medium tracking-widest text-[#8B92A8] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B3FD1]" />
                <span>Present</span>
                <span className="text-[#C5C9D9]">•</span>
                <span>Engage</span>
                <span className="text-[#C5C9D9]">•</span>
                <span>Connect</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#5B3FD1]" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header