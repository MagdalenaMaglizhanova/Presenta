import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

// ==========================================
// НОВО SVG ЛОГО (Вградено директно в кода)
// ==========================================
const PresentaLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 500 600"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Градиент за рамката и логото */}
      <linearGradient id="gradPurpleCyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5B3FD1" />
        <stop offset="100%" stopColor="#18BFC7" />
      </linearGradient>
      
      {/* Градиент за текста "Presenta" */}
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0A162B" />
        <stop offset="100%" stopColor="#5B3FD1" />
      </linearGradient>
    </defs>

    {/* Презентационен екран с прегънат ъгъл */}
    <path
      d="M 100 100 L 340 100 C 360 100 380 120 380 140 L 380 300 C 380 320 360 340 340 340 L 160 340 L 120 380 L 120 340 C 100 340 80 320 80 300 L 80 140 C 80 120 100 100 100 100 Z"
      fill="none"
      stroke="url(#gradPurpleCyan)"
      strokeWidth="16"
      strokeLinejoin="round"
    />
    {/* Запълване на прегънатия ъгъл */}
    <path d="M 120 340 L 160 340 L 120 380 Z" fill="url(#gradPurpleCyan)" />

    {/* Кръгова диаграма */}
    <circle cx="160" cy="180" r="20" fill="none" stroke="#18BFC7" strokeWidth="40" strokeDasharray="50 125.6" />
    <circle cx="160" cy="180" r="20" fill="none" stroke="#FFB800" strokeWidth="40" strokeDasharray="40 125.6" strokeDashoffset="-50" />
    <circle cx="160" cy="180" r="20" fill="none" stroke="#5B3FD1" strokeWidth="40" strokeDasharray="35.6 125.6" strokeDashoffset="-90" />

    {/* Линии до диаграмата */}
    <rect x="210" y="155" width="100" height="12" rx="6" fill="#5B3FD1" />
    <rect x="210" y="179" width="70" height="12" rx="6" fill="#5B3FD1" />
    <rect x="210" y="203" width="85" height="12" rx="6" fill="#5B3FD1" />

    {/* Смартфон */}
    <rect x="300" y="190" width="90" height="160" rx="16" fill="#ffffff" stroke="url(#gradPurpleCyan)" strokeWidth="12" />
    {/* Екран на смартфона */}
    <rect x="315" y="210" width="60" height="120" rx="8" fill="#F0F4F8" />

    {/* Списък в смартфона */}
    {/* Зелена отметка */}
    <circle cx="330" cy="230" r="10" fill="#00E676" />
    <path d="M 326 230 L 329 233 L 334 227" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <rect x="345" y="226" width="20" height="8" rx="4" fill="#E0E0E0" />

    {/* Лилаво кръгче */}
    <circle cx="330" cy="255" r="10" fill="#5B3FD1" />
    <rect x="345" y="251" width="20" height="8" rx="4" fill="#E0E0E0" />

    {/* Жълто кръгче */}
    <circle cx="330" cy="280" r="10" fill="#FFB800" />
    <rect x="345" y="276" width="20" height="8" rx="4" fill="#E0E0E0" />

    {/* Червено сърце */}
    <circle cx="330" cy="305" r="10" fill="#FF4B4B" />
    <path d="M 330 307 C 330 307 325 302 325 298 C 325 295 327 293 330 293 C 333 293 335 295 335 298 C 335 302 330 307 330 307 Z" fill="#fff" />

    {/* Текст "Presenta" */}
    <text
      x="250"
      y="480"
      textAnchor="middle"
      fontFamily="'Inter', 'Segoe UI', sans-serif"
      fontWeight="900"
      fontSize="80"
      fill="url(#textGrad)"
      letterSpacing="-2"
    >
      Presenta
    </text>

    {/* Слоган */}
    <text
      x="250"
      y="520"
      textAnchor="middle"
      fontFamily="'Inter', 'Segoe UI', sans-serif"
      fontWeight="700"
      fontSize="16"
      letterSpacing="4"
    >
      <tspan fill="#5B3FD1">PRESENT</tspan>
      <tspan fill="#18BFC7"> • </tspan>
      <tspan fill="#18BFC7">ENGAGE</tspan>
      <tspan fill="#18BFC7"> • </tspan>
      <tspan fill="#FF4B4B">CONNECT</tspan>
    </text>
  </svg>
)

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0)

  const slides: string[] = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=1600&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=80',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0A162B]">
      {/* Background Slides */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${slide})` }}
          />
        ))}
        {/* По-светъл градиент, за да се виждат снимките */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A162B]/60 via-[#1A2B4A]/40 to-[#5B3FD1]/20" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute z-1 right-[-200px] top-[80px] w-[500px] h-[500px] border border-white/8 rounded-full shadow-[0_0_0_60px_rgba(91,63,209,0.04),0_0_0_120px_rgba(91,63,209,0.02)]" />
      <div className="absolute z-1 left-[-150px] bottom-[100px] w-[300px] h-[300px] border border-white/5 rounded-full" />

      {/* Main Content */}
      <div className="relative z-10 container-custom min-h-[calc(100vh-80px)] flex items-center pt-20">
        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-[60px] items-center w-full">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/70 text-[11px] font-medium tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B3FD1]" />
              <span>SIMPL × PRESENTA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#18BFC7]" />
            </div>

            {/* Main Heading */}
            <h1 className="text-[clamp(3.2rem,7vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.06em] text-white drop-shadow-lg">
              Teach
              <span className="block bg-gradient-to-r from-[#5B3FD1] via-[#7C5CE7] to-[#18BFC7] bg-clip-text text-transparent drop-shadow-lg">
                Problems Differently.
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-[560px] mt-6 text-white/80 text-[15px] leading-relaxed drop-shadow-md">
              A practical platform that helps teachers apply the SIMPL methodology
              in the classroom — turning real-world problems into engaging
              presentations, activities and meaningful learning experiences with Presenta.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3.5 mt-9">
              <Link
                to="/create"
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white text-[13px] font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="absolute inset-0 bg-[#5B3FD1] transition-all duration-300 group-hover:bg-[#4A32B8]" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#5B3FD1] to-[#18BFC7] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="absolute inset-0 shadow-lg shadow-[#5B3FD1]/30 group-hover:shadow-[#5B3FD1]/50 transition-shadow" />
                <span className="relative flex items-center gap-2">
                  Create a SIMPL Lesson
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>

              <Link
                to="/how-it-works"
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white text-[13px] font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/25 transition-all duration-300 group-hover:bg-white/20 group-hover:border-white/40" />
                <span className="relative">
                  How SIMPL Works
                </span>
              </Link>
            </div>

            {/* Key Information */}
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold text-white drop-shadow-md">SIMPL</p>
                <p className="text-[12px] text-white/60 font-medium tracking-wide uppercase">
                  Methodology
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white drop-shadow-md">Presenta</p>
                <p className="text-[12px] text-white/60 font-medium tracking-wide uppercase">
                  Learning Tool
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white drop-shadow-md">1 → ∞</p>
                <p className="text-[12px] text-white/60 font-medium tracking-wide uppercase">
                  Problems to Explore
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Logo with Rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: 'easeOut'
            }}
            className="relative min-h-[400px] flex items-center justify-center"
          >
            {/* Animated Rings */}
            <div className="relative w-[min(420px,75vw)] aspect-square">
              {/* Outer Ring */}
              <div className="absolute inset-0 border border-white/15 rounded-full animate-pulse" />

              {/* Middle Ring */}
              <div className="absolute inset-[30px] border border-[#5B3FD1]/20 rounded-full">
                <div className="absolute inset-[-2px] rounded-full border border-[#18BFC7]/10 animate-spin-slow" />
              </div>

              {/* Inner Ring */}
              <div className="absolute inset-[60px] border border-white/10 rounded-full" />

              {/* Новото SVG Лого с бял glow зад него */}
              {/* Новото SVG Лого с бял glow зад него */}
<div className="absolute inset-0 flex items-center justify-center">
  {/* Голямо бяло сияние с радиален градиент за по-мек и естествен ефект */}
  <div
    className="absolute w-[130%] h-[130%] rounded-full pointer-events-none"
    style={{
      background:
        'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 35%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 80%)',
      filter: 'blur(40px)',
    }}
  />
  {/* Втори слой за още по-силно сияние точно зад логото */}
  <div className="absolute w-[85%] h-[85%] bg-white/60 blur-[70px] rounded-full pointer-events-none" />

  <PresentaLogo className="w-[65%] h-auto object-contain drop-shadow-2xl relative z-10" />
</div>
            </div>

            {/* Декоративни точки около логото */}
            <div className="absolute top-[8%] right-[8%] w-2 h-2 rounded-full bg-[#5B3FD1] animate-pulse" />
            <div className="absolute bottom-[12%] left-[6%] w-1.5 h-1.5 rounded-full bg-[#18BFC7] animate-pulse delay-300" />
            <div className="absolute top-[30%] left-[3%] w-1 h-1 rounded-full bg-white/30 animate-pulse delay-700" />
            <div className="absolute bottom-[35%] right-[5%] w-1.5 h-1.5 rounded-full bg-[#7C5CE7]/50 animate-pulse delay-500" />
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-8 h-1.5 bg-[#5B3FD1]'
                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default Hero