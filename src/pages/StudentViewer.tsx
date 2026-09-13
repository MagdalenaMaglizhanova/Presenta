// src/components/StudentViewer.tsx
// Минимален компонент САМО за ученици – само гледат слайда.
// Първо въвеждат име (като в Kahoot), после гледат.

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Loader2, User, ArrowRight, Sparkles } from "lucide-react";
import { SlideViewer } from "./PresentationEditor";

// Ключ за sessionStorage (за да не пита при презареждане)
const getNameKey = (sessionId: string) => `presenta_student_name_${sessionId}`;

export const StudentViewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  // 🔥 Име на ученика
  const [studentName, setStudentName] = useState<string>("");
  const [nameConfirmed, setNameConfirmed] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");

  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [status, setStatus] = useState<"connecting" | "online" | "offline">("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const currentIndexRef = useRef(0);
  const slidesRef = useRef<any[]>([]);
  const nameRef = useRef<string>("");

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

  // 🔥 Проверяваме sessionStorage при зареждане
  useEffect(() => {
    if (!sessionId) return;
    const savedName = sessionStorage.getItem(getNameKey(sessionId));
    if (savedName && savedName.trim().length > 0) {
      setStudentName(savedName);
      setNameConfirmed(true);
    }
  }, [sessionId]);

  // ─── Потвърждаване на име ─────────────────────────────────────
  const handleConfirmName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) return;

    setStudentName(trimmed);
    setNameConfirmed(true);

    // Запазваме в sessionStorage
    if (sessionId) {
      sessionStorage.setItem(getNameKey(sessionId), trimmed);
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

    const ws = new WebSocket(`wss://server-presenta.onrender.com/ws?session=${sessionId}`);
    wsRef.current = ws;

    let requestInterval: ReturnType<typeof setInterval> | null = null;
    let giveUpTimeout: ReturnType<typeof setTimeout> | null = null;

    ws.onopen = () => {
      setStatus("online");
      console.log("✅ Ученик свързан към сесия:", sessionId, "| Име:", nameRef.current);

      // 🔥 Първо съобщаваме на сървъра кой е ученикът
      ws.send(
        JSON.stringify({
          type: "STUDENT_JOINED",
          name: nameRef.current,
          joinedAt: Date.now(),
        })
      );

      // После искаме презентацията
      ws.send(JSON.stringify({ type: "REQUEST_PRESENTATION" }));
      console.log("📤 Изпратена заявка за презентация");

      // Retry на всеки 2 сек, докато не получим слайдовете
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
        console.log("📤 Retry: заявка за презентация");
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
              console.log(`📄 Получени ${msg.slides.length} слайда (${msg.type})`);
            }
            break;
          }

          case "PRESENTATION_DATA": {
            if (msg.slides && Array.isArray(msg.slides)) {
              setSlides(msg.slides);
              console.log(`📄 Получени ${msg.slides.length} слайда (PRESENTATION_DATA)`);
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
  // 👤 2. ЕКРАН ЗА ВЪВЕЖДАНЕ НА ИМЕ (Kahoot стил)
  // ═══════════════════════════════════════════════════════════════
  if (!nameConfirmed) {
    return (
      <div className="min-h-screen bg-[#0A162B] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Декоративни елементи */}
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] border border-white/5 rounded-full" />
        <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5B3FD1]/10 blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Лого */}
          <div className="flex flex-col items-center mb-8">
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

          {/* Картичка за име */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#5B3FD1]/20 border border-[#5B3FD1]/30 flex items-center justify-center mb-3">
                <User className="w-7 h-7 text-[#7C5CE7]" />
              </div>
              <h2 className="text-lg font-bold text-white">Как се казваш?</h2>
              <p className="text-xs text-white/40 mt-1 text-center">
                Името ще се вижда само от учителя
              </p>
            </div>

            {/* Input за име */}
            <div className="mb-6">
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

            {/* Бутон за потвърждение */}
            <button
              onClick={handleConfirmName}
              disabled={nameInput.trim().length < 2}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#5B3FD1] to-[#18BFC7] hover:shadow-lg hover:shadow-[#5B3FD1]/40 text-white text-base font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              Влез в презентацията
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Session ID */}
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
  // 🔴 3. Връзката е прекъсната
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
  // ⏳ 4. Изчакване на първите слайдове
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
              <Loader2 className="w-8 h-8 text-[#4cc9ff]" />
            </div>
          </div>

          {/* Поздрав с името */}
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
  // ✅ 5. Показваме слайда
  // ═══════════════════════════════════════════════════════════════
  const currentSlide = slides[currentIndex] || slides[0];
  const progress = ((currentIndex + 1) / slides.length) * 100;

  return (
    <div className="min-h-screen bg-[#0A162B] flex items-center justify-center overflow-hidden">
      {/* Progress bar горе */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-[#5B3FD1] to-[#18BFC7]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Badge с името (горе вдясно) */}
      <div className="fixed top-3 right-3 z-40 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center text-white text-[10px] font-bold">
          {studentName.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs text-white/80 font-medium max-w-[120px] truncate">
          {studentName}
        </span>
      </div>

      {/* Слайдът */}
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
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
  );
};

export default StudentViewer;