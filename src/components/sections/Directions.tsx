import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const simplSteps = [
  {
    id: 1,
    letter: 'S',
    title: 'SEE',
    description: 'Започнете с реален проблем, който има значение за учениците.',
    number: '01',
    color: '#5B3FD1',
  },
  {
    id: 2,
    letter: 'I',
    title: 'IDENTIFY',
    description: 'Разбийте проблема на конкретни въпроси и възможни посоки.',
    number: '02',
    color: '#18BFC7',
  },
  {
    id: 3,
    letter: 'M',
    title: 'MAKE WITH AI',
    description: 'Създайте и тествайте възможни решения на практика.',
    number: '03',
    color: '#7C5CE7',
  },
  {
    id: 4,
    letter: 'P',
    title: 'PRESENT',
    description: 'Представете решението и обяснете защо то работи.',
    number: '04',
    color: '#4A32B8',
  },
  {
    id: 5,
    letter: 'L',
    title: 'LEARN',
    description: 'Анализирайте резултата и извлечете нови знания.',
    number: '05',
    color: '#18BFC7',
  },
]

const Presentations: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % simplSteps.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section
      className="relative py-24 bg-gradient-to-b from-[#F8FAFF] to-white overflow-hidden"
      id="presentations"
    >
      {/* Decorative elements */}
      <div className="absolute -right-[300px] top-[100px] w-[600px] h-[600px] rounded-full bg-[#5B3FD1]/5 blur-3xl" />
      <div className="absolute -left-[200px] bottom-[100px] w-[400px] h-[400px] rounded-full bg-[#18BFC7]/5 blur-3xl" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-5 rounded-full bg-white/80 backdrop-blur-sm border border-[#EEF0F6] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B3FD1]" />
            <span className="text-[11px] font-medium tracking-widest uppercase text-[#4A506B]">
              SIMPL Methodology
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#18BFC7]" />
          </div>

          <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-[#1A1F36]">
            From Problem
            <span className="block bg-gradient-to-r from-[#5B3FD1] to-[#18BFC7] bg-clip-text text-transparent">
              To Solution
            </span>
          </h2>

          <p className="text-[#6B7280] text-lg max-w-[620px] mt-4 leading-relaxed">
            SIMPL gives teachers a practical way to turn real-world problems
            into meaningful learning experiences. Each step helps students
            understand, create, present and learn through action with Presenta.
          </p>
        </motion.div>

        {/* SIMPL Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mt-12">
          {simplSteps.map((step, index) => {
            const isActive = index === activeIndex

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                }}
                viewport={{ once: true }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`group relative bg-white rounded-2xl p-6 transition-all duration-500 cursor-pointer ${
                  isActive
                    ? 'shadow-[0_20px_60px_rgba(91,63,209,0.14)] -translate-y-2'
                    : 'shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1'
                }`}
              >
                {/* Top color line */}
                <div
                  className="absolute top-0 left-6 right-6 h-[3px] rounded-full transition-all duration-500"
                  style={{
                    background: `linear-gradient(90deg, ${step.color}, ${step.color}dd)`,
                    opacity: isActive ? 1 : 0.3,
                  }}
                />

                {/* Number */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] font-bold tracking-[0.18em] text-[#8B92A8]">
                    STEP
                  </span>
                  <span className="text-sm font-extrabold text-[#E5E7F0]">
                    {step.number}
                  </span>
                </div>

                {/* SIMPL Letter */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold transition-all duration-300 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                    boxShadow: isActive
                      ? `0 12px 30px ${step.color}30`
                      : 'none',
                  }}
                >
                  {step.letter}
                </div>

                {/* Step title */}
                <h3 className="text-xl font-bold text-[#1A1F36] mt-5 tracking-tight">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[#6B7280] text-sm leading-relaxed mt-3">
                  {step.description}
                </p>

                {/* Bottom accent */}
                <div
                  className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full transition-all duration-500"
                  style={{
                    background: step.color,
                    opacity: isActive ? 0.5 : 0,
                  }}
                />

                {/* Hover glow */}
                <div
                  className="absolute -z-10 inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${step.color}15, transparent 70%)`,
                  }}
                />
              </motion.div>
            )
          })}
        </div>

        {/* SIMPL Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-[#0A162B] rounded-3xl px-6 py-10 md:px-10 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -right-32 -top-32 w-80 h-80 rounded-full bg-[#5B3FD1]/20 blur-3xl" />
            <div className="absolute -left-32 -bottom-32 w-80 h-80 rounded-full bg-[#18BFC7]/15 blur-3xl" />

            <div className="relative z-10">
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/40">
                  The SIMPL Process
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-white mt-3">
                  One methodology.
                  <span className="block text-white/60">
                    Five connected steps.
                  </span>
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mt-4">
                  From identifying a real problem to creating a solution and
                  learning from the result.
                </p>
              </div>

              
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            to="/get-started"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#5B3FD1] text-white text-sm font-semibold rounded-full shadow-lg shadow-[#5B3FD1]/25 transition-all duration-300 hover:shadow-[#5B3FD1]/40 hover:-translate-y-0.5 hover:bg-[#4A32B8]"
          >
            Explore SIMPL with Presenta
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default Presentations