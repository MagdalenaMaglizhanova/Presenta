import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const About: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <section className="relative py-24 bg-white overflow-hidden" id="about">
      {/* Декоративни елементи */}
      <div className="absolute -left-[300px] top-[200px] w-[500px] h-[500px] rounded-full bg-[#5B3FD1]/5 blur-3xl" />
      <div className="absolute -right-[250px] bottom-[100px] w-[400px] h-[400px] rounded-full bg-[#18BFC7]/5 blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-[70px] items-center">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-6 rounded-full bg-[#F4F1FF] border border-[#5B3FD1]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B3FD1]" />
              <span className="text-[11px] font-medium tracking-widest uppercase text-[#5B3FD1]">
                About Us
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#18BFC7]" />
            </div>

            <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-[#1A1F36]">
              Where Ideas
              <span className="block bg-gradient-to-r from-[#5B3FD1] to-[#18BFC7] bg-clip-text text-transparent">
                Become Presentations.
              </span>
            </h2>

            <p className="max-w-[560px] text-[#6B7280] text-lg my-6 leading-relaxed">
              We create an environment where speakers, educators, and industry partners 
              collaborate to deliver impactful presentations using cutting-edge technology 
              and real-world case studies.
            </p>

            <Link 
              to="/contact" 
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#5B3FD1] text-white font-semibold text-sm rounded-full shadow-lg shadow-[#5B3FD1]/25 transition-all duration-300 hover:shadow-[#5B3FD1]/40 hover:-translate-y-0.5 hover:bg-[#4A32B8]"
            >
              <span>Learn More</span>
              <ArrowRight 
                size={16} 
                className="transition-transform duration-300 group-hover:translate-x-1" 
              />
            </Link>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-[#F3F4F8]">
              <div>
                <p className="text-3xl font-extrabold text-[#1A1F36]">12+</p>
                <p className="text-xs font-medium tracking-widest uppercase text-[#8B92A8] mt-1">
                  Presentations
                </p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#1A1F36]">04</p>
                <p className="text-xs font-medium tracking-widest uppercase text-[#8B92A8] mt-1">
                  Topics
                </p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#1A1F36]">∞</p>
                <p className="text-xs font-medium tracking-widest uppercase text-[#8B92A8] mt-1">
                  Opportunities
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Image Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="relative flex items-center justify-center"
          >
            {/* Декоративни пръстени */}
            <div className="absolute w-[500px] h-[500px] border border-[#5B3FD1]/8 rounded-full animate-spin-slow" />
            <div className="absolute w-[440px] h-[440px] border border-[#18BFC7]/6 rounded-full animate-spin-slower" />
            
            {/* Main circular frame */}
            <div className="relative w-[400px] h-[400px] md:w-[440px] md:h-[440px] rounded-full overflow-hidden shadow-2xl shadow-[#5B3FD1]/10 border-4 border-[#5B3FD1]/20">
              {/* Slides */}
              <AnimatePresence mode="wait">
                {slides.map((slide, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ 
                      opacity: index === currentSlide ? 1 : 0,
                      scale: index === currentSlide ? 1 : 1.1
                    }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className={`absolute inset-0 bg-cover bg-center ${
                      index === currentSlide ? 'z-10' : 'z-0'
                    }`}
                    style={{ backgroundImage: `url(${slide})` }}
                  />
                ))}
              </AnimatePresence>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#5B3FD1]/40 via-transparent to-[#5B3FD1]/10 z-20" />

              {/* Вътрешни декоративни пръстени */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="absolute inset-[30px] border border-white/15 rounded-full" />
                <div className="absolute inset-[65px] border border-white/8 rounded-full" />
              </div>

              {/* Center text overlay */}
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-white text-2xl md:text-3xl font-extrabold tracking-[-0.04em] uppercase drop-shadow-2xl">
                    PRESENT
                  </div>
                  <div className="w-10 h-[2px] bg-white/50 mx-auto my-2.5" />
                  <div className="text-white/70 text-xs font-semibold tracking-[0.3em] uppercase drop-shadow-2xl">
                    INSPIRE
                  </div>
                </div>
              </div>

              {/* Slide indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'w-8 bg-white' 
                        : 'w-1.5 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Малки декоративни точки около рамката */}
            <div className="absolute top-[5%] right-[8%] w-2 h-2 rounded-full bg-[#5B3FD1] animate-pulse" />
            <div className="absolute bottom-[10%] left-[5%] w-1.5 h-1.5 rounded-full bg-[#18BFC7] animate-pulse delay-300" />
            <div className="absolute top-[25%] left-[2%] w-1 h-1 rounded-full bg-[#7C5CE7]/50 animate-pulse delay-700" />
            <div className="absolute bottom-[30%] right-[3%] w-1 h-1 rounded-full bg-[#5B3FD1]/40 animate-pulse delay-500" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About