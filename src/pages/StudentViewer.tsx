// src/components/StudentViewer.tsx
// Минимален компонент САМО за ученици – само гледат слайда.
// 1. Въвеждат име + избират аватар (Kahoot стил)
// 2. Виждат countdown 3, 2, 1, START!
// 3. Гледат презентацията + реагират с emoji

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, User, ArrowRight, Sparkles } from "lucide-react";
import { SlideViewer } from "./PresentationEditor";

// ═══════════════════════════════════════════════════════════════════
// 🌐 API CONFIG
// ═══════════════════════════════════════════════════════════════════
const WS_URL = import.meta.env.VITE_WS_URL || "wss://server-presenta.onrender.com";

// ─── Аватари (emoji, за да няма нужда от файлове) ─────────────
const AVATARS = [
  "🦊", "🐼", "🐯", "🦁",
  "🐸", "🐙", "🦄", "🐲",
  "🐵", "🐧", "🦉", "🐺",
];

// 🔥 Emoji за реакции
const REACTION_EMOJIS = ["❤️", "👍", "😂", "😮", "🔥", "👏", "💡", "🎉"];

// Ключове за sessionStorage
const getNameKey = (sessionId: string) => `presenta_student_name_${sessionId}`;
const getAvatarKey = (sessionId: string) => `presenta_student_avatar_${sessionId}`;

type Phase = "name" | "countdown" | "live";

// ─── Floating emoji за реакции ─────────────────────────────────
interface FloatingEmoji {
  id: number;
  emoji: string;
}

const FloatingEmojiItem: React.FC<{ item: FloatingEmoji; onDone: () => void }> = ({
  item,
  onDone,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ y: 0, opacity: 1, scale: 0.5 }}
      animate={{ y: -200, opacity: 0, scale: 1.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: "easeOut" }}
      className="absolute pointer-events-none text-5xl"
      style={{
        left: `${20 + Math.random() * 60}%`,
        bottom: "80px",
      }}
    >
      {item.emoji}
    </motion.div>
  );
};

export const StudentViewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  // 🔥 Име + аватар
  const [studentName, setStudentName] = useState<string>("");
  const [studentAvatar, setStudentAvatar] = useState<string>("🦊");
  const [nameConfirmed, setNameConfirmed] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");

  // 🔥 Фаза: име → countdown → live
  const [phase, setPhase] = useState<Phase>("name");

  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [status, setStatus] = useState<"connecting" | "online" | "offline">("connecting");

  // 🔥 Floating reactions (визуален feedback при натискане)
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const floatingIdRef = useRef(0);
  // Cooldown per emoji за да не спами
  const lastSentRef = useRef<Record<string, number>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const currentIndexRef = useRef(0);
  const slidesRef = useRef<any[]>([]);
  const nameRef = useRef<string>("");
  const avatarRef = useRef<string>("");

  // Синхронизираме refs
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    nameRef.current = studentName;
  }, [studentName]);

  useEffect(() => {
    avatarRef.current = studentAvatar;
  }, [studentAvatar]);

  // 🔥 Проверяваме sessionStorage при зареждане
  useEffect(() => {
    if (!sessionId) return;
    const savedName = sessionStorage.getItem(getNameKey(sessionId));
    const savedAvatar = sessionStorage.getItem(getAvatarKey(sessionId));

    if (savedName && savedName.trim().length > 0) {
      setStudentName(savedName);
      if (savedAvatar) setStudentAvatar(savedAvatar);
      setNameConfirmed(true);
      setPhase("live");
    }
  }, [sessionId]);

  // ─── Потвърждаване на име ─────────────────────────────────────
  const handleConfirmName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) return;

    setStudentName(trimmed);
    setNameConfirmed(true);
    setPhase("countdown");

    if (sessionId) {
      sessionStorage.setItem(getNameKey(sessionId), trimmed);
      sessionStorage.setItem(getAvatarKey(sessionId), studentAvatar);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirmName();
    }
  };

  // ─── WebSocket – свързваме се СЛЕД като има име ───────────────
  useEffect(() => {
    if (!sessionId || !nameConfirmed || !studentName) return;

    const ws = new WebSocket(`${WS_URL}/ws?session=${sessionId}`);
    wsRef.current = ws;

    let requestInterval: ReturnType<typeof setInterval> | null = null;
    let giveUpTimeout: ReturnType<typeof setTimeout> | null = null;

    ws.onopen = () => {
      setStatus("online");
      console.log("✅ Ученик свързан към сесия:", sessionId, "| Име:", nameRef.current, "| Аватар:", avatarRef.current);

      ws.send(
        JSON.stringify({
          type: "STUDENT_JOINED",
          name: nameRef.current,
          avatar: avatarRef.current,
          joinedAt: Date.now(),
        })
      );

      ws.send(JSON.stringify({ type: "REQUEST_PRESENTATION" }));

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

      giveUpTimeout = setTimeout(() => {
        if (requestInterval) clearInterval(requestInterval);
      }, 60000);
    };

    ws.onclose = () => {
      setStatus("offline");
      if (requestInterval) clearInterval(requestInterval);
      if (giveUpTimeout) clearTimeout(giveUpTimeout);
    };

    ws.onerror = () => {
      setStatus("offline");
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);

        switch (msg.type) {
          case "SESSION_STATE":
          case "SLIDE_CHANGED": {
            if (Number.isInteger(msg.slide)) {
              setDirection(msg.slide >= currentIndexRef.current ? 1 : -1);
              setCurrentIndex(msg.slide);
            }
            if (msg.slides && Array.isArray(msg.slides) && msg.slides.length > 0) {
              setSlides(msg.slides);
            }
            break;
          }

          case "PRESENTATION_DATA": {
            if (msg.slides && Array.isArray(msg.slides)) {
              setSlides(msg.slides);
              if (Number.isInteger(msg.slide)) {
                setDirection(msg.slide >= currentIndexRef.current ? 1 : -1);
                setCurrentIndex(msg.slide);
              }
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error("Грешка при парсване:", err);
      }
    };

    return () => {
      if (requestInterval) clearInterval(requestInterval);
      if (giveUpTimeout) clearTimeout(giveUpTimeout);
      ws.close();
    };
  }, [sessionId, nameConfirmed, studentName]);

  // ─── Изпращане на реакция ─────────────────────────────────────
  const sendReaction = (emoji: string) => {
    // Cooldown 500ms за същия emoji (за да не спами)
    const now = Date.now();
    const lastSent = lastSentRef.current[emoji] || 0;
    if (now - lastSent < 500) return;
    lastSentRef.current[emoji] = now;

    // Визуален feedback (floating emoji)
    const id = ++floatingIdRef.current;
    setFloatingEmojis((prev) => [...prev, { id, emoji }]);

    // Изпращане към сървъра → всички го виждат
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "REACTION",
          reaction: emoji,
          name: nameRef.current,
          avatar: avatarRef.current,
          slide: currentIndexRef.current,
          timestamp: Date.now(),
        })
      );
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // 🔴 1. Липсва session ID
  // ═══════════════════════════════════════════════════════════════
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#0A162B] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-xl font-bold text-white mb-2">Липсва код на сесията</p>
          <p className="text-white/50 text-sm">
            Сканирайте QR кода от екрана на учителя.
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 👤 2. ЕКРАН ЗА ВЪВЕЖДАНЕ НА ИМЕ + АВАТАР
  // ═══════════════════════════════════════════════════════════════
  if (phase === "name") {
    return (
      <div className="min-h-screen bg-[#0A162B] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] border border-white/5 rounded-full" />
        <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5B3FD1]/10 blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center shadow-2xl shadow-[#5B3FD1]/40 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white to-[#4cc9ff] bg-clip-text text-transparent">
              Presenta
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest mt-1 font-semibold">
              Включи се в презентацията
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* Avatar picker */}
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-lg font-bold text-white mb-1">Избери си аватар</h2>
              <p className="text-xs text-white/40 mb-4">Ще се вижда до името ти</p>

              <motion.div
                key={studentAvatar}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#5B3FD1]/30 to-[#18BFC7]/20 border-2 border-[#7C5CE7]/50 flex items-center justify-center text-5xl mb-4 shadow-xl shadow-[#5B3FD1]/30"
              >
                {studentAvatar}
              </motion.div>

              <div className="grid grid-cols-6 gap-2 w-full max-w-md">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setStudentAvatar(avatar)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                      studentAvatar === avatar
                        ? "bg-[#5B3FD1]/40 border-2 border-[#7C5CE7] scale-110 shadow-lg shadow-[#5B3FD1]/40"
                        : "bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:scale-105"
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                После
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#5B3FD1]/20 border border-[#5B3FD1]/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#7C5CE7]" />
                </div>
                <h2 className="text-base font-bold text-white">Как се казваш?</h2>
              </div>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={handleNameKeyDown}
                placeholder="Въведи име или псевдоним..."
                maxLength={30}
                autoFocus
                className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-4 text-center text-lg font-semibold text-white placeholder-white/30 focus:outline-none focus:border-[#5B3FD1]/60 focus:bg-white/10 transition-all"
              />
              <p className="text-center text-white/30 text-[11px] mt-2">
                {nameInput.length}/30 символа
              </p>
            </div>

            <button
              onClick={handleConfirmName}
              disabled={nameInput.trim().length < 2}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#5B3FD1] to-[#18BFC7] hover:shadow-lg hover:shadow-[#5B3FD1]/40 text-white text-base font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              Влез в презентацията
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">
                Сесия
              </span>
              <span className="text-[11px] text-[#4cc9ff] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {sessionId}
              </span>
            </div>
          </div>

          <p className="text-center text-white/30 text-[11px] mt-6">
            Ако въведеш обидно име, учителят може да те изключи.
          </p>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎬 3. COUNTDOWN: 3 → 2 → 1 → START!
  // ═══════════════════════════════════════════════════════════════
  if (phase === "countdown") {
    return (
      <CountdownScreen
        name={studentName}
        avatar={studentAvatar}
        onFinish={() => setPhase("live")}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔴 4. Връзката е прекъсната
  // ═══════════════════════════════════════════════════════════════
  if (status === "offline") {
    return (
      <div className="min-h-screen bg-[#0A162B] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-xl font-bold text-red-400 mb-2">Връзката е прекъсната</p>
          <p className="text-white/50 text-sm">
            Уверете се, че учителят е активен и опитайте отново.
          </p>
          <p className="mt-3 text-xs text-white/30 font-mono">Сесия: {sessionId}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm transition-colors"
          >
            Опитай отново
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // ⏳ 5. Изчакване на първите слайдове
  // ═══════════════════════════════════════════════════════════════
  if (slides.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A162B] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5B3FD1]/5 blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-md"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[#5B3FD1]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#18BFC7] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">{studentAvatar}</span>
            </div>
          </div>

          <p className="text-2xl font-bold text-white mb-2">
            Здравей, <span className="text-[#4cc9ff]">{studentName}</span>! 👋
          </p>
          <p className="text-white/50 text-sm mb-6">
            Свързваме се с презентацията на учителя...
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[11px] text-white/40 font-mono">{sessionId}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // ✅ 6. Показваме слайда + Reaction bar
  // ═══════════════════════════════════════════════════════════════
  const currentSlide = slides[currentIndex] || slides[0];
  const progress = ((currentIndex + 1) / slides.length) * 100;

  return (
    <div className="min-h-screen bg-[#0A162B] flex flex-col overflow-hidden relative">
      {/* Progress bar горе */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-[#5B3FD1] to-[#18BFC7]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Badge с аватар + име */}
      <div className="fixed top-3 right-3 z-40 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center text-base shrink-0">
          {studentAvatar}
        </div>
        <span className="text-xs text-white/80 font-medium max-w-[120px] truncate">
          {studentName}
        </span>
      </div>

      {/* 🔥 Floating reactions overlay */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <AnimatePresence>
          {floatingEmojis.map((item) => (
            <FloatingEmojiItem
              key={item.id}
              item={item}
              onDone={() =>
                setFloatingEmojis((prev) => prev.filter((x) => x.id !== item.id))
              }
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Слайдът */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 pb-24 sm:pb-28">
        <div className="w-full max-w-7xl mx-auto">
          <div className="relative w-full aspect-video bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-2xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 p-6 sm:p-10 md:p-12 overflow-y-auto"
              >
                <SlideViewer slide={currentSlide} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 🔥 REACTION BAR долу */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 25 }}
        className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-6 bg-gradient-to-t from-[#0A162B] via-[#0A162B]/95 to-transparent"
      >
        <div className="max-w-3xl mx-auto">
          {/* Етикет */}
          <p className="text-center text-[10px] uppercase tracking-widest text-white/30 font-bold mb-2">
            Реагирай на слайда
          </p>

          {/* Emoji бутони */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {REACTION_EMOJIS.map((emoji, idx) => (
              <motion.button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.15, y: -4 }}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 0.6 + idx * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/10 hover:border-[#7C5CE7]/50 flex items-center justify-center text-2xl sm:text-3xl transition-colors shadow-lg shadow-black/20 active:shadow-[#5B3FD1]/40"
                title={emoji}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 🎬 COUNTDOWN COMPONENT: 3 → 2 → 1 → START!
// ═══════════════════════════════════════════════════════════════

const CountdownScreen: React.FC<{
  name: string;
  avatar: string;
  onFinish: () => void;
}> = ({ name, avatar, onFinish }) => {
  const [count, setCount] = useState(3);
  const [showStart, setShowStart] = useState(false);
  const [bgColor, setBgColor] = useState("#5B3FD1");

  const colors = ["#5B3FD1", "#18BFC7", "#FF4B4B", "#00E676"];

  useEffect(() => {
    if (count > 0) {
      setBgColor(colors[3 - count] || "#5B3FD1");
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setBgColor("#00E676");
      setShowStart(true);
      const timer = setTimeout(() => {
        onFinish();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [count, onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at center, ${bgColor}40 0%, #0A162B 70%)`,
        transition: "background 0.5s ease",
      }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />

      <div className="absolute top-8 left-0 right-0 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
          <span className="text-2xl">{avatar}</span>
          <span className="text-sm font-semibold text-white/90">{name}</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!showStart ? (
            <motion.div
              key={`num-${count}`}
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 2, rotate: 180, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, duration: 0.5 }}
              className="text-[12rem] sm:text-[16rem] font-black leading-none"
              style={{
                background: `linear-gradient(135deg, #ffffff 0%, ${bgColor} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: `drop-shadow(0 0 60px ${bgColor})`,
              }}
            >
              {count}
            </motion.div>
          ) : (
            <motion.div
              key="start"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 3, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-center"
            >
              <div
                className="text-7xl sm:text-9xl md:text-[10rem] font-black tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #00E676 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 80px #00E676)",
                }}
              >
                START!
              </div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/60 text-lg mt-4 font-medium"
              >
                Приготви се...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-3">
        {[3, 2, 1].map((n) => (
          <motion.div
            key={n}
            animate={{
              scale: count <= n && count > 0 ? 1.4 : 1,
              backgroundColor:
                count < n
                  ? "#00E676"
                  : count === n
                  ? bgColor
                  : "rgba(255,255,255,0.1)",
            }}
            transition={{ duration: 0.3 }}
            className="w-3 h-3 rounded-full"
          />
        ))}
        <motion.div
          animate={{
            scale: showStart ? 1.4 : 1,
            backgroundColor: showStart ? "#00E676" : "rgba(255,255,255,0.1)",
          }}
          transition={{ duration: 0.3 }}
          className="w-3 h-3 rounded-full"
        />
      </div>
    </motion.div>
  );
};

export default StudentViewer;