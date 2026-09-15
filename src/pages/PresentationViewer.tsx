// src/components/PresentationViewer.tsx
// Компонент за презентиране от УЧИТЕЛЯ.
// Показва Join слайд (URL + код), слайдове, ученици, реакции, live quiz резултати и Results слайд.

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  Loader2,
  Link as LinkIcon,
  Users,
  Circle,
  PanelRightClose,
  PanelRightOpen,
  Clock,
  Heart,
  LogOut,
  HelpCircle,
  BarChart3,
  Check,
  X,
  TrendingUp,
  Trophy,
  Award,
  Globe,
} from "lucide-react";
import { SlideViewer } from "./PresentationEditor";

// ═══════════════════════════════════════════════════════════════════
// 🌐 API CONFIG
// ═══════════════════════════════════════════════════════════════════
const API_URL = import.meta.env.VITE_API_URL || "https://server-presenta.onrender.com";
const WS_URL = import.meta.env.VITE_WS_URL || "wss://server-presenta.onrender.com";

// ─── Types ────────────────────────────────────────────────────────

interface Student {
  name: string;
  avatar?: string;
  joinedAt: number;
}

interface ReactionBurst {
  id: number;
  emoji: string;
  name: string;
  avatar?: string;
}

interface AnswerData {
  optionIndex: number;
  answerText: string;
  isCorrect: boolean | null;
  name: string;
  avatar?: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 JOIN SLIDE (заменя QRCodeSlide)
// Показва URL + код с анимирани букви + малък QR код
// ═══════════════════════════════════════════════════════════════

const JoinSlide: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const joinUrl = useMemo(() => `${window.location.origin}/join`, []);
  const viewUrl = useMemo(
    () => `${window.location.origin}/view?session=${sessionId}`,
    [sessionId]
  );

  // Показваме URL без протокол и без trailing slash
  const displayUrl = useMemo(() => {
    return joinUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }, [joinUrl]);

  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center px-4 py-6 overflow-y-auto">
      {/* Заглавие */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-4xl font-bold text-white mb-2"
      >
        Включи се в презентацията
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-white/50 text-sm md:text-base mb-6 md:mb-8"
      >
        Отвори линка в браузъра и въведи кода
      </motion.p>

      {/* URL на сайта */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6 md:mb-8 w-full max-w-2xl"
      >
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-2 flex items-center justify-center gap-1.5">
          <Globe className="w-3 h-3" />
          Адрес на сайта
        </p>
        <div className="inline-flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <span className="text-lg md:text-2xl font-bold text-[#4cc9ff] break-all">
            {displayUrl}
          </span>
          <button
            onClick={handleCopyUrl}
            className="text-sm text-white/40 hover:text-white/80 shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Копирай линка"
          >
            {copied ? "✅" : "📋"}
          </button>
        </div>
      </motion.div>

      {/* Код на сесията */}
      <div className="mb-6 md:mb-8">
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3">
          Код на сесията
        </p>
        <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
          {sessionId.split("").map((char, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0, y: 30, rotateX: -90 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                delay: 0.3 + i * 0.08,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="w-12 h-14 sm:w-16 sm:h-20 md:w-20 md:h-24 rounded-2xl bg-gradient-to-br from-[#5B3FD1] to-[#7C5CE7] border-2 border-[#7C5CE7]/50 flex items-center justify-center shadow-2xl shadow-[#5B3FD1]/40"
            >
              <span className="text-2xl sm:text-4xl md:text-5xl font-black text-white">
                {char}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* QR код (малък, за телефони) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex flex-col items-center gap-3"
      >
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
          или сканирай с телефон
        </p>
        <div className="bg-white p-3 rounded-xl shadow-2xl">
          <QRCode
            value={viewUrl}
            size={130}
            style={{ height: "130px", width: "130px" }}
            bgColor="#ffffff"
            fgColor="#0A162B"
          />
        </div>
      </motion.div>
    </div>
  );
};

// ─── Floating Reaction ────────────────────────────────────────────
const FloatingReaction: React.FC<{ reaction: ReactionBurst; onDone: () => void }> = ({
  reaction,
  onDone,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ y: 0, opacity: 1, scale: 0.5 }}
      animate={{ y: -250, opacity: 0, scale: 1.3 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2.5, ease: "easeOut" }}
      className="absolute pointer-events-none text-4xl"
      style={{
        left: `${20 + Math.random() * 60}%`,
        bottom: "10%",
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-5xl drop-shadow-lg">{reaction.emoji}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/60 text-white/80 backdrop-blur-sm whitespace-nowrap">
          {reaction.avatar} {reaction.name}
        </span>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 🥧 DONUT CHART (SVG)
// ═══════════════════════════════════════════════════════════════

const DonutChart: React.FC<{
  value: number;
  label: string;
  sublabel?: string;
  color: string;
  bgColor?: string;
  size?: number;
}> = ({ value, label, sublabel, color, bgColor = "rgba(255,255,255,0.08)", size = 180 }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        className="transform -rotate-90"
        style={{ width: size, height: size }}
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth="10"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl font-black text-white leading-none">
          {Math.round(value)}%
        </span>
        {label && (
          <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold mt-1.5">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] text-white/30 mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 📊 LIVE QUIZ/POLL RESULTS (по време на гласуване)
// ═══════════════════════════════════════════════════════════════

const LiveResults: React.FC<{
  slide: any;
  slideIndex: number;
  answers: AnswerData[];
}> = ({ slide, answers }) => {
  const isQuiz = slide.type === "quiz";
  const options: string[] = slide.options || [];
  const correctAnswer = slide.correctAnswer;

  const counts: number[] = options.map(
    (_, idx) => answers.filter((a) => a.optionIndex === idx).length
  );
  const total = answers.length;
  const maxCount = Math.max(...counts, 1);
  const uniqueResponders = new Set(answers.map((a) => a.name)).size;
  const correctCount = isQuiz ? answers.filter((a) => a.isCorrect === true).length : 0;
  const correctPercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const BAR_COLORS = [
    "from-[#5B3FD1] to-[#7C5CE7]",
    "from-[#18BFC7] to-[#4cc9ff]",
    "from-[#FFB800] to-[#FF8A00]",
    "from-[#FF4B4B] to-[#FF6B6B]",
    "from-[#00E676] to-[#00BFA5]",
    "from-[#B47CFF] to-[#7C5CE7]",
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            {isQuiz ? (
              <>
                <HelpCircle className="w-3.5 h-3.5 text-[#00E676]" />
                <span className="text-[10px] uppercase tracking-widest text-[#00E676] font-bold">
                  Тест
                </span>
              </>
            ) : (
              <>
                <BarChart3 className="w-3.5 h-3.5 text-[#B47CFF]" />
                <span className="text-[10px] uppercase tracking-widest text-[#B47CFF] font-bold">
                  Анкета
                </span>
              </>
            )}
          </div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/40"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-green-300 font-bold">
              LIVE
            </span>
          </motion.div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Users className="w-3.5 h-3.5 text-[#4cc9ff]" />
            <span className="text-xs text-white/80 font-bold">
              {uniqueResponders} отговорили
            </span>
          </div>

          {isQuiz && total > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                correctPercent >= 70
                  ? "bg-green-500/20 border-green-500/40"
                  : correctPercent >= 40
                  ? "bg-yellow-500/20 border-yellow-500/40"
                  : "bg-red-500/20 border-red-500/40"
              }`}
            >
              <TrendingUp
                className={`w-3.5 h-3.5 ${
                  correctPercent >= 70
                    ? "text-green-400"
                    : correctPercent >= 40
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              />
              <span
                className={`text-xs font-bold ${
                  correctPercent >= 70
                    ? "text-green-300"
                    : correctPercent >= 40
                    ? "text-yellow-300"
                    : "text-red-300"
                }`}
              >
                {correctPercent}% верни
              </span>
            </motion.div>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mt-4">
          {slide.title || (isQuiz ? "Тест" : "Анкета")}
        </h2>

        {slide.question && (
          <p className="text-lg sm:text-xl font-semibold mt-3 text-white/90">
            {slide.question}
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const count = counts[idx] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const barWidth = total > 0 ? (count / maxCount) * 100 : 0;
          const isCorrectOption = isQuiz && idx === correctAnswer;
          const colorClass = BAR_COLORS[idx % BAR_COLORS.length];

          const voters = answers
            .filter((a) => a.optionIndex === idx)
            .map((a) => ({ name: a.name, avatar: a.avatar }));

          return (
            <div
              key={idx}
              className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
                isCorrectOption
                  ? "border-green-500/60 bg-green-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {total > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorClass} opacity-25`}
                />
              )}

              <div className="relative p-4 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg ${
                      isCorrectOption && total > 0
                        ? "bg-green-500 text-white"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {letter}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-semibold text-white">
                        {opt || `Опция ${idx + 1}`}
                      </span>
                      {isCorrectOption && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/30 border border-green-500/50">
                          <Check className="w-3 h-3 text-green-300" />
                          <span className="text-[10px] text-green-300 font-bold uppercase">
                            Верен
                          </span>
                        </span>
                      )}
                    </div>

                    {voters.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {voters.slice(0, 8).map((v, vi) => (
                          <div
                            key={vi}
                            className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center text-[10px] border border-white/20"
                            title={v.name}
                          >
                            {v.avatar || v.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {voters.length > 8 && (
                          <span className="text-[10px] text-white/50 font-medium ml-1">
                            +{voters.length - 8}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="flex items-baseline gap-1.5 justify-end">
                      <motion.span
                        key={count}
                        initial={{ scale: 1.3, color: "#00E676" }}
                        animate={{ scale: 1, color: "#ffffff" }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl sm:text-3xl font-black"
                      >
                        {count}
                      </motion.span>
                      <span className="text-sm text-white/50 font-medium">
                        {total > 0 ? `${percentage}%` : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {total === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
              <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
            </div>
            <p className="text-sm text-white/50 font-medium">
              Чакаме първите отговори...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 🏆 RESULTS SLIDE (обобщен слайд след quiz/poll)
// ═══════════════════════════════════════════════════════════════

const ResultsSlide: React.FC<{
  slide: any;
  answers: AnswerData[];
  totalStudents: number;
}> = ({ slide, answers, totalStudents }) => {
  const isQuiz = slide.type === "quiz";

  const total = answers.length;
  const uniqueResponders = new Set(answers.map((a) => a.name)).size;
  const correctCount = isQuiz ? answers.filter((a) => a.isCorrect === true).length : 0;
  const wrongCount = isQuiz ? answers.filter((a) => a.isCorrect === false).length : 0;
  const correctPercent = total > 0 ? (correctCount / total) * 100 : 0;
  const wrongPercent = total > 0 ? (wrongCount / total) * 100 : 0;

  const studentStats = Array.from(new Set(answers.map((a) => a.name)))
    .map((name) => {
      const studentAnswers = answers.filter((a) => a.name === name);
      const correct = studentAnswers.filter((a) => a.isCorrect === true).length;
      const wrong = studentAnswers.filter((a) => a.isCorrect === false).length;
      const answered = studentAnswers[0];
      return {
        name,
        avatar: answered?.avatar,
        optionIndex: answered?.optionIndex,
        answerText: answered?.answerText,
        isCorrect: answered?.isCorrect,
        correct,
        wrong,
      };
    })
    .sort((a, b) => b.correct - a.correct);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#5B3FD1]/30 to-[#18BFC7]/30 border border-[#7C5CE7]/40">
            <Trophy className="w-3.5 h-3.5 text-[#FFB800]" />
            <span className="text-[10px] uppercase tracking-widest text-[#FFB800] font-black">
              Резултати
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Users className="w-3.5 h-3.5 text-[#4cc9ff]" />
            <span className="text-xs text-white/80 font-bold">
              {uniqueResponders} / {totalStudents} отговорили
            </span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mt-4">
          {slide.title || (isQuiz ? "Тест" : "Анкета")}
        </h2>

        {slide.question && (
          <p className="text-base sm:text-lg font-semibold mt-2 text-white/70">
            {slide.question}
          </p>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-8 flex-wrap justify-center">
            {isQuiz ? (
              <DonutChart
                value={correctPercent}
                label="ВЕРНИ"
                sublabel={`${correctCount} от ${total}`}
                color="#00E676"
                size={200}
              />
            ) : (
              <DonutChart
                value={100}
                label="ОТГОВОРИЛИ"
                sublabel={`${total} гласа`}
                color="#5B3FD1"
                size={200}
              />
            )}

            <div className="flex-1 min-w-[200px] space-y-4">
              {isQuiz ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-white/70 font-medium">Верни</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-green-400">{correctCount}</span>
                        <span className="text-sm text-white/50 font-bold">{Math.round(correctPercent)}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${correctPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-white/70 font-medium">Грешни</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-red-400">{wrongCount}</span>
                        <span className="text-sm text-white/50 font-bold">{Math.round(wrongPercent)}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${wrongPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-white/40 font-bold">
                      Общо отговори
                    </span>
                    <span className="text-3xl font-black text-white">{total}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70 font-medium">Общо гласове</span>
                    <span className="text-3xl font-black text-white">{total}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70 font-medium">Ученици</span>
                    <span className="text-3xl font-black text-[#4cc9ff]">{uniqueResponders}</span>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-white/40 font-bold">
                        Опции
                      </span>
                      <span className="text-2xl font-bold text-white">{slide.options?.length || 0}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col overflow-hidden">
          <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-4 flex items-center gap-2 shrink-0">
            <Award className="w-3.5 h-3.5" />
            Отговори на учениците ({studentStats.length})
          </h3>

          <div className="flex-1 overflow-y-auto -mx-2 px-2">
            {studentStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-white/30" />
                </div>
                <p className="text-sm text-white/50">Няма отговори</p>
              </div>
            ) : (
              <div className="space-y-2">
                {studentStats.map((s, idx) => (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                      s.isCorrect === true
                        ? "bg-green-500/10 border-green-500/30"
                        : s.isCorrect === false
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center text-base shrink-0 border border-white/20">
                      {s.avatar || s.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">
                          {s.name}
                        </span>
                        {s.isCorrect === true && (
                          <Check className="w-3.5 h-3.5 text-green-400 shrink-0" strokeWidth={3} />
                        )}
                        {s.isCorrect === false && (
                          <X className="w-3.5 h-3.5 text-red-400 shrink-0" strokeWidth={3} />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            s.isCorrect === true
                              ? "bg-green-500/30 text-green-300"
                              : s.isCorrect === false
                              ? "bg-red-500/30 text-red-300"
                              : "bg-white/10 text-white/60"
                          }`}
                        >
                          {String.fromCharCode(65 + (s.optionIndex ?? 0))}
                        </span>
                        <span className="text-xs text-white/60 truncate">
                          {s.answerText || "—"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────

export const PresentationViewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [status, setStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [showStudents, setShowStudents] = useState(true);

  const [reactions, setReactions] = useState<ReactionBurst[]>([]);
  const reactionIdRef = useRef(0);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});

  const [answersBySlide, setAnswersBySlide] = useState<Record<number, AnswerData[]>>({});

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  const [isEnding, setIsEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const currentIndexRef = useRef(0);
  const slidesRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionEndedRef = useRef(false);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  // 🔥 VIRTUAL SLIDES: Join + real slides + Results slides after each quiz/poll
  const virtualSlides = useMemo(() => {
    const result: any[] = [];

    if (sessionId) {
      result.push({
        id: "__join__",
        type: "__join__",
        title: "Join",
        __isVirtual: true,
        __realIndex: -1,
      });
    }

    slides.forEach((slide, idx) => {
      result.push({
        ...slide,
        __isVirtual: false,
        __realIndex: idx,
      });

      if (slide.type === "quiz" || slide.type === "poll") {
        result.push({
          id: `__results_${idx}__`,
          type: "__results__",
          originalSlide: slide,
          originalSlideIndex: idx,
          title: "Резултати",
          __isVirtual: true,
          __realIndex: idx,
        });
      }
    });

    return result;
  }, [slides, sessionId]);

  const currentVirtualSlide = virtualSlides[currentIndex];
  const isShowingJoin = currentVirtualSlide?.type === "__join__";
  const isShowingResults = currentVirtualSlide?.type === "__results__";
  const actualSlideIndex = currentVirtualSlide?.__realIndex ?? -1;
  const totalVirtualSlides = virtualSlides.length;

  // ⏱ Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ─── WebSocket ─────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) {
      setStatus("offline");
      return;
    }

    const ws = new WebSocket(`${WS_URL}/ws?session=${sessionId}`);
    wsRef.current = ws;

    let requestInterval: ReturnType<typeof setInterval> | null = null;

    ws.onopen = () => {
      setStatus("online");
      console.log("✅ WebSocket свързан – учител презентира");

      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) return;
        if (slidesRef.current.length === 0) {
          ws.send(JSON.stringify({ type: "REQUEST_PRESENTATION" }));
        }
      }, 300);

      requestInterval = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          if (requestInterval) clearInterval(requestInterval);
          return;
        }
        if (slidesRef.current.length > 0) {
          if (requestInterval) clearInterval(requestInterval);
          return;
        }
        ws.send(JSON.stringify({ type: "REQUEST_PRESENTATION" }));
      }, 2000);
    };

    ws.onclose = () => {
      setStatus("offline");
      if (requestInterval) clearInterval(requestInterval);
    };

    ws.onerror = () => {
      setStatus("offline");
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);

        switch (msg.type) {
          case "SESSION_STATE":
          case "SLIDE_CHANGED":
          case "PRESENTATION_DATA": {
            if (msg.slides && Array.isArray(msg.slides) && msg.slides.length > 0) {
              setSlides(msg.slides);
            }
            if (msg.students && Array.isArray(msg.students)) {
              setStudents(msg.students);
            }
            break;
          }

          case "STUDENT_LIST": {
            if (Array.isArray(msg.students)) {
              setStudents(msg.students);
            }
            break;
          }

          case "REACTION": {
            if (msg.reaction) {
              const burst: ReactionBurst = {
                id: ++reactionIdRef.current,
                emoji: msg.reaction,
                name: msg.name || "Анонимен",
                avatar: msg.avatar,
              };
              setReactions((prev) => [...prev, burst].slice(-20));
              setReactionCounts((prev) => ({
                ...prev,
                [msg.reaction]: (prev[msg.reaction] || 0) + 1,
              }));
            }
            break;
          }

          case "POLL_ANSWER": {
            const slideIdx =
              msg.slideIndex !== undefined
                ? msg.slideIndex
                : msg.slide ?? currentIndexRef.current - 1;

            const optionIdx =
              msg.answerIndex !== undefined ? msg.answerIndex : null;

            if (optionIdx === null) break;

            const answerData: AnswerData = {
              optionIndex: optionIdx,
              answerText: msg.answerText || "",
              isCorrect: msg.isCorrect ?? null,
              name: msg.name || "Анонимен",
              avatar: msg.avatar,
              timestamp: msg.timestamp || Date.now(),
            };

            setAnswersBySlide((prev) => {
              const existing = prev[slideIdx] || [];
              const filtered = existing.filter((a) => a.name !== answerData.name);
              return {
                ...prev,
                [slideIdx]: [...filtered, answerData],
              };
            });

            console.log(
              `📊 Отговор: ${answerData.avatar || ""} ${answerData.name} → слайд ${slideIdx}, опция ${optionIdx}`
            );
            break;
          }

          case "SESSION_ENDED": {
            sessionEndedRef.current = true;
            break;
          }

          default:
            break;
        }
      } catch (error) {
        console.error("Грешка при парсване:", error);
      }
    };

    return () => {
      if (requestInterval) clearInterval(requestInterval);
      ws.close();
    };
  }, [sessionId]);

  // ─── Broadcast ───────────────────────────────────────────────
  const broadcast = useCallback((virtualIndex: number) => {
    const virtualSlide = virtualSlides[virtualIndex];
    if (!virtualSlide) return;

    const realIndex = virtualSlide.__realIndex;
    if (realIndex < 0) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "SLIDE_CHANGED",
          slide: realIndex,
          slides: slidesRef.current,
        })
      );
    }
  }, [virtualSlides]);

  // ─── Навигация ─────────────────────────────────────────────────
  const goNext = useCallback(() => {
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= totalVirtualSlides) return;
    setDirection(1);
    setCurrentIndex(nextIndex);
    broadcast(nextIndex);
  }, [totalVirtualSlides, broadcast]);

  const goPrev = useCallback(() => {
    const prevIndex = currentIndexRef.current - 1;
    if (prevIndex < 0) return;
    setDirection(-1);
    setCurrentIndex(prevIndex);
    broadcast(prevIndex);
  }, [broadcast]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalVirtualSlides) return;
      setDirection(index > currentIndexRef.current ? 1 : -1);
      setCurrentIndex(index);
      broadcast(index);
    },
    [totalVirtualSlides, broadcast]
  );

  // ─── Keyboard ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // ─── Fullscreen ────────────────────────────────────────────────
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen грешка:", err);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ─── End Session ───────────────────────────────────────────────
  const endSession = useCallback(async () => {
    if (!sessionId) return;
    setIsEnding(true);
    sessionEndedRef.current = true;

    try {
      wsRef.current?.close();
      await fetch(`${API_URL}/api/sessions/${sessionId}`, { method: "DELETE" });
      console.log("✅ Сесията е приключена");
    } catch (err) {
      console.error("End session error:", err);
    } finally {
      window.location.href = "/create";
    }
  }, [sessionId]);

  useEffect(() => {
    const handler = () => {
      if (sessionId && !sessionEndedRef.current) {
        sessionEndedRef.current = true;
        fetch(`${API_URL}/api/sessions/${sessionId}`, {
          method: "DELETE",
          keepalive: true,
        }).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [sessionId]);

  // ─── Визуализация ──────────────────────────────────────────────

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#0A162B] flex items-center justify-center text-white/60 p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-10 h-10 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-2">Липсва session ID</p>
          <p className="text-white/50 text-sm">Моля, отворете презентацията от редактора.</p>
        </div>
      </div>
    );
  }

  if (status === "offline") {
    return (
      <div className="min-h-screen bg-[#0A162B] flex items-center justify-center text-white/60 p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-10 h-10 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400 mb-2">Свързването неуспешно</p>
          <p className="text-white/50 text-sm">Моля, опитайте отново.</p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A162B] flex items-center justify-center text-white/60 p-6">
        <div className="text-center max-w-md">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#5B3FD1]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#18BFC7] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#4cc9ff]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#4cc9ff] mb-2">Изчакване на презентация...</p>
          <p className="text-white/50 text-sm">Свързваме се със сесията.</p>
        </div>
      </div>
    );
  }

  const progress = isShowingJoin ? 0 : ((currentIndex) / (totalVirtualSlides - 1)) * 100;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalVirtualSlides - 1;
  const joinUrl = `${window.location.origin}/join`;

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

  const currentRealSlide = actualSlideIndex >= 0 ? slides[actualSlideIndex] : null;
  const currentAnswers = answersBySlide[actualSlideIndex] || [];
  const isCurrentInteractive = currentRealSlide &&
    (currentRealSlide.type === "quiz" || currentRealSlide.type === "poll");

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#0A162B] flex flex-col overflow-hidden select-none"
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-30">
        <motion.div
          className="h-full bg-gradient-to-r from-[#5B3FD1] to-[#18BFC7]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {status === "online" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/80 font-medium">На живо</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-white/80 font-medium">Свързване...</span>
              </>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <Clock className="w-3.5 h-3.5 text-[#4cc9ff]" />
            <span className="text-xs text-white/80 font-mono font-medium">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {totalReactions > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/30 to-red-500/30 backdrop-blur-md border border-pink-500/40"
            >
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span className="text-xs text-white font-bold">{totalReactions}</span>
            </motion.div>
          )}

          {isCurrentInteractive && !isShowingResults && currentAnswers.length > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00E676]/30 to-[#00BFA5]/30 backdrop-blur-md border border-[#00E676]/40"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#00E676]" />
              <span className="text-xs text-white font-bold">
                {currentAnswers.length} отговора
              </span>
            </motion.div>
          )}

          {isShowingResults && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FFB800]/30 to-[#FF8A00]/30 backdrop-blur-md border border-[#FFB800]/40"
            >
              <Trophy className="w-3.5 h-3.5 text-[#FFB800]" />
              <span className="text-xs text-white font-black uppercase tracking-wider">
                РЕЗУЛТАТИ
              </span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowStudents((v) => !v)}
            className="relative w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            {showStudents ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
            {students.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#5B3FD1] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0A162B]">
                {students.length}
              </span>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowEndConfirm(true)}
            className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md border border-red-500/40 flex items-center justify-center text-red-300 hover:text-red-200 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none z-30">
          <AnimatePresence>
            {reactions.map((r) => (
              <FloatingReaction
                key={r.id}
                reaction={r}
                onDone={() => setReactions((prev) => prev.filter((x) => x.id !== r.id))}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden">
          <div className="w-full max-w-7xl flex items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed group
                bg-gradient-to-br from-[#5B3FD1]/40 to-[#7C5CE7]/30
                hover:from-[#5B3FD1]/70 hover:to-[#7C5CE7]/60
                border border-[#7C5CE7]/40 hover:border-[#7C5CE7]/80
                backdrop-blur-md shadow-xl shadow-[#5B3FD1]/20
                text-white"
            >
              <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div className="relative flex-1 aspect-video bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-2xl">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-0 p-6 sm:p-10 md:p-12 overflow-y-auto"
                >
                  {isShowingJoin ? (
                    <JoinSlide sessionId={sessionId} />
                  ) : isShowingResults ? (
                    <ResultsSlide
                      slide={currentVirtualSlide.originalSlide}
                      answers={currentAnswers}
                      totalStudents={students.length}
                    />
                  ) : isCurrentInteractive ? (
                    <LiveResults
                      slide={currentRealSlide}
                      slideIndex={actualSlideIndex}
                      answers={currentAnswers}
                    />
                  ) : (
                    <SlideViewer slide={currentRealSlide} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed group
                bg-gradient-to-br from-[#5B3FD1]/40 to-[#7C5CE7]/30
                hover:from-[#5B3FD1]/70 hover:to-[#7C5CE7]/60
                border border-[#7C5CE7]/40 hover:border-[#7C5CE7]/80
                backdrop-blur-md shadow-xl shadow-[#5B3FD1]/20
                text-white"
            >
              <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Students panel */}
        <AnimatePresence>
          {showStudents && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="shrink-0 border-l border-white/5 bg-[#0A162B]/95 backdrop-blur-md overflow-hidden z-20"
            >
              <div className="w-72 h-full flex flex-col">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Гледат сега
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5B3FD1]/20 border border-[#5B3FD1]/40 text-[#A78BFA] font-bold">
                    {students.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  {students.length === 0 ? (
                    <div className="text-center py-6 rounded-xl bg-white/5 border border-dashed border-white/10">
                      <Users className="w-8 h-8 mx-auto mb-2 text-white/20" />
                      <p className="text-[11px] text-white/30">Никой още не се е свързал</p>
                      <p className="text-[10px] text-white/20 mt-0.5">Сподели кода</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {students.map((s, i) => {
                        const hasAnsweredCurrent =
                          isCurrentInteractive &&
                          currentAnswers.some((a) => a.name === s.name);

                        return (
                          <div
                            key={`${s.name}-${i}`}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-colors ${
                              hasAnsweredCurrent
                                ? "bg-green-500/10 border-green-500/30"
                                : "bg-white/5 border-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center text-base shrink-0 border border-[#7C5CE7]/40">
                              {s.avatar || s.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-white/85 font-medium truncate flex-1">
                              {s.name}
                            </span>
                            {hasAnsweredCurrent ? (
                              <Check className="w-3 h-3 text-green-400 shrink-0" strokeWidth={3} />
                            ) : (
                              <Circle className="w-2 h-2 fill-green-400 text-green-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 border-t border-white/5">
                  <div className="text-[10px] text-white/30 text-center">
                    {students.length === 0
                      ? "Няма свързани ученици"
                      : `${students.length} ${students.length === 1 ? "ученик" : "ученици"}`}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-black/30 backdrop-blur-sm border-t border-white/5 z-20">
        <div className="flex gap-1.5 sm:gap-2 max-w-[30%] overflow-x-auto items-center">
          {virtualSlides.map((slide, i) => {
            const isJoin = slide.type === "__join__";
            const isResults = slide.type === "__results__";

            return (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`shrink-0 h-2.5 rounded-full transition-all ${
                  i === currentIndex
                    ? isJoin
                      ? "bg-[#18BFC7] w-8"
                      : isResults
                      ? "bg-[#FFB800] w-8"
                      : "bg-[#5B3FD1] w-8"
                    : isResults
                    ? "bg-[#FFB800]/30 hover:bg-[#FFB800]/60 w-2.5"
                    : "bg-white/20 hover:bg-white/40 w-2.5"
                }`}
                title={isJoin ? "Join" : isResults ? "Резултати" : `Слайд ${i}`}
              />
            );
          })}
        </div>

        <span className="text-xs sm:text-sm text-white/50 font-mono">
          {isShowingJoin ? (
            <span className="text-[#18BFC7]">🎯 Join</span>
          ) : isShowingResults ? (
            <span className="text-[#FFB800]">🏆 Резултати</span>
          ) : (
            <>
              {actualSlideIndex + 1} / {slides.length}
            </>
          )}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(joinUrl)}
            className="px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 text-xs flex items-center gap-1.5 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Копирай линк</span>
          </button>
          <button
            onClick={() => setShowEndConfirm(true)}
            className="px-3 sm:px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Приключи</span>
          </button>
        </div>
      </div>

      {/* ═══ END CONFIRM MODAL ═══ */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !isEnding && setShowEndConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0F1E36] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Приключване на сесията?
                </h2>
                <p className="text-sm text-white/60 mb-6">
                  Учениците ще загубят връзка с презентацията. Данните ще бъдат запазени в статистиката.
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-2xl font-bold text-white">{formatTime(elapsedSeconds)}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Време</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-2xl font-bold text-white">{students.length}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Ученици</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-2xl font-bold text-white">{totalReactions}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Реакции</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEndConfirm(false)}
                    disabled={isEnding}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    Отказ
                  </button>
                  <button
                    onClick={endSession}
                    disabled={isEnding}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isEnding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Приключва...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        Приключи
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PresentationViewer;