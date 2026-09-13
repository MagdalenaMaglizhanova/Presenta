import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const Contact: React.FC = () => {
  return (
    <section className="relative py-24 bg-[#1A1F36] overflow-hidden" id="contact">
      {/* Декоративни елементи */}
      <div className="absolute -right-[250px] -top-[150px] w-[600px] h-[600px] rounded-full bg-[#5B3FD1]/10 blur-3xl" />
      <div className="absolute -left-[200px] -bottom-[100px] w-[400px] h-[400px] rounded-full bg-[#18BFC7]/8 blur-3xl" />
      
      {/* Декоративни пръстени */}
      <div className="absolute right-[5%] top-[20%] w-[300px] h-[300px] border border-white/5 rounded-full" />
      <div className="absolute left-[10%] bottom-[30%] w-[200px] h-[200px] border border-white/5 rounded-full" />
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-[60px] items-center">
          {/* Лява колона - Текст */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B3FD1]" />
              <span className="text-[11px] font-medium tracking-widest uppercase text-white/60">
                Get in Touch
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#18BFC7]" />
            </div>

            <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-white">
              Let's Build
              <span className="block bg-gradient-to-r from-[#5B3FD1] via-[#7C5CE7] to-[#18BFC7] bg-clip-text text-transparent">
                Your Next Presentation.
              </span>
            </h2>

            <p className="max-w-[520px] text-white/60 text-lg mt-5 leading-relaxed">
              Connect with our team for keynote speaking, workshop collaborations, 
              presentation design, and professional development opportunities.
            </p>

            {/* Опции за контакт */}
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-[#18BFC7]" />
                <span className="text-white/70 text-sm font-medium">Book a session</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-[#5B3FD1]" />
                <span className="text-white/70 text-sm font-medium">Custom workshops</span>
              </div>
            </div>
          </motion.div>

          {/* Дясна колона - Бутони */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 lg:justify-end"
          >
            {/* Основен бутон - Контакт */}
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#5B3FD1] text-white font-semibold text-sm rounded-full shadow-lg shadow-[#5B3FD1]/30 transition-all duration-300 hover:shadow-[#5B3FD1]/50 hover:-translate-y-0.5 hover:bg-[#4A32B8]"
            >
              <span>Contact Us</span>
              <ArrowRight 
                size={16} 
                className="transition-transform duration-300 group-hover:translate-x-1" 
              />
            </Link>

            {/* Вторичен бутон - Нагоре */}
            <a
              href="#top"
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm rounded-full transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5"
            >
              <span>Back to Top</span>
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </a>
          </motion.div>
        </div>

        {/* Долен декоративен елемент */}
        <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
          <p className="text-white/30 text-xs font-medium tracking-widest uppercase">
            Present • Engage • Connect
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B3FD1]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#18BFC7]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CE7]" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact