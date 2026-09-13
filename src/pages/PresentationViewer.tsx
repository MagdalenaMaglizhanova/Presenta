// src/components/PresentationViewer.tsx
// Компонент за презентиране от УЧИТЕЛЯ.
// QR кодът е ВИРТУАЛЕН слайд на позиция 0.
// Реалните слайдове започват от позиция 1.
// Показва и списък с учениците, които гледат в реално време.

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
  X,
  Users,
  Circle,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { SlideViewer } from "./PresentationEditor";

// ─── Types ────────────────────────────────────────────────────────

interface Student {
  name: string;
  joinedAt: number;
}

// ─── QR Code Slide (вграден) ──────────────────────────────────────
const QRCodeSlide: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const joinUrl = useMemo(
    () => `${window.location.origin}/view?session=${sessionId}`,
    [sessionId]
  );

  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
        📱 Сканирайте QR кода
      </h2>
      <div className="bg-white p-4 rounded-xl shadow-2xl">
        <QRCode
          value={joinUrl}
          size={256}
          style={{ height: "256px", width: "256px" }}
          bgColor="#ffffff"
          fgColor="#0A162B"
        />
      </div>
      <p className="mt-6 text-white/60 text-sm max-w-md">
        или отворете този линк на друго устройство:
      </p>
      <div className="mt-2 flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg border border-white/10">
        <span className="text-sm text-[#4cc9ff] break-all">{joinUrl}</span>
        <button
          onClick={() => navigator.clipboard.writeText(joinUrl)}
          className="text-xs text-white/40 hover:text-white/70 shrink-0"
        >
          📋 Копирай
        </button>
      </div>
    </div>
  );
};

export const PresentationViewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // 0 = QR, 1..N = реални
  const [direction, setDirection] = useState<1 | -1>(1);
  const [status, setStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [showStudents, setShowStudents] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const currentIndexRef = useRef(0);
  const slidesRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Синхронизираме refs
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  // 🔥 ОБЕДИНЕН масив: QR + реални слайдове
  const slidesWithQR = useMemo(() => {
    if (!sessionId) return slides;
    return [{ id: "__qr__", type: "__qr__", title: "QR код" }, ...slides];
  }, [slides, sessionId]);

  // 🔥 Помощни изчисления
  const isShowingQR = currentIndex === 0;
  const actualSlideIndex = currentIndex - 1;
  const totalSlides = slidesWithQR.length;

  // ─── WebSocket ─────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) {
      setStatus("offline");
      return;
    }

    const ws = new WebSocket(`wss://server-presenta.onrender.com/ws?session=${sessionId}`);
    wsRef.current = ws;

    let requestInterval: ReturnType<typeof setInterval> | null = null;

    ws.onopen = () => {
      setStatus("online");
      console.log("✅ WebSocket свързан – учител презентира");

      // 🔥 Изчакваме малко да видим дали SESSION_STATE носи слайдовете
      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) return;
        if (slidesRef.current.length === 0) {
          ws.send(JSON.stringify({ type: "REQUEST_PRESENTATION" }));
          console.log("📤 Изпратена заявка за презентация (нямаше слайдове)");
        } else {
          console.log("✅ Слайдовете дойдоха със SESSION_STATE");
        }
      }, 300);

      // Retry само ако още няма слайдове
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
    };

    ws.onclose = () => {
      setStatus("offline");
      console.warn("⚠️ WebSocket затворен");
      if (requestInterval) clearInterval(requestInterval);
    };

    ws.onerror = () => {
      setStatus("offline");
      console.error("❌ WebSocket грешка");
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);

        switch (msg.type) {
          case "SESSION_STATE":
          case "SLIDE_CHANGED":
          case "PRESENTATION_DATA": {
            // Обновяваме само slides, НЕ пипаме currentIndex.
            // Учителят контролира навигацията ЛОКАЛНО.
            if (msg.slides && Array.isArray(msg.slides) && msg.slides.length > 0) {
              setSlides(msg.slides);
              console.log(`📄 Получени ${msg.slides.length} слайда (${msg.type})`);
            }
            // Ако SESSION_STATE носи и списък с ученици
            if (msg.students && Array.isArray(msg.students)) {
              setStudents(msg.students);
            }
            break;
          }

          // 🔥 НОВО: Списък с ученици
          case "STUDENT_LIST": {
            if (Array.isArray(msg.students)) {
              setStudents(msg.students);
              console.log(`👥 Ученици: ${msg.count || msg.students.length}`);
            }
            break;
          }

          default:
            break;
        }
      } catch (error) {
        console.error("Грешка при обработка на съобщение:", error);
      }
    };

    return () => {
      if (requestInterval) clearInterval(requestInterval);
      ws.close();
    };
  }, [sessionId]);

  // ─── Broadcast към учениците (само реален индекс) ──────────────
  const broadcast = useCallback((actualIndex: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "SLIDE_CHANGED",
          slide: actualIndex,
          slides: slidesRef.current,
        })
      );
    }
  }, []);

  // ─── Навигация ─────────────────────────────────────────────────
  const goNext = useCallback(() => {
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= totalSlides) return;

    setDirection(1);
    setCurrentIndex(nextIndex);

    const actualIndex = nextIndex - 1;
    if (actualIndex >= 0) {
      broadcast(actualIndex);
    }
  }, [totalSlides, broadcast]);

  const goPrev = useCallback(() => {
    const prevIndex = currentIndexRef.current - 1;
    if (prevIndex < 0) return;

    setDirection(-1);
    setCurrentIndex(prevIndex);

    const actualIndex = prevIndex - 1;
    if (actualIndex >= 0) {
      broadcast(actualIndex);
    }
  }, [broadcast]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      setDirection(index > currentIndexRef.current ? 1 : -1);
      setCurrentIndex(index);

      const actualIndex = index - 1;
      if (actualIndex >= 0) {
        broadcast(actualIndex);
      }
    },
    [totalSlides, broadcast]
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

  // ─── Визуализация ──────────────────────────────────────────────

  // 1. Липсва sessionId
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

  // 2. Връзката е неуспешна
  if (status === "offline") {
    return (
      <div className="min-h-screen bg-[#0A162B] flex items-center justify-center text-white/60 p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-10 h-10 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400 mb-2">Свързването неуспешно</p>
          <p className="text-white/50 text-sm">Моля, опитайте отново.</p>
          <p className="mt-4 text-xs text-white/30 font-mono">Session: {sessionId}</p>
        </div>
      </div>
    );
  }

  // 3. Все още няма получени слайдове
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
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-xs text-white/50 font-mono">{sessionId}</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Всичко е готово
  const currentSlideData = slidesWithQR[currentIndex];
  const progress = isShowingQR ? 0 : ((actualSlideIndex + 1) / slides.length) * 100;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalSlides - 1;
  const joinUrl = `${window.location.origin}/view?session=${sessionId}`;

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
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
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

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* 🔥 Бутон за показване/скриване на списъка с ученици */}
          <button
            onClick={() => setShowStudents((v) => !v)}
            className="relative w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
            title={showStudents ? "Скрий списъка с ученици" : "Покажи списъка с ученици"}
          >
            {showStudents ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
            {/* Badge с брой ученици */}
            {students.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#5B3FD1] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0A162B]">
                {students.length}
              </span>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
            aria-label={isFullscreen ? "Изход от fullscreen" : "Цял екран"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main content: slides + optional students panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slides area */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden">
          <div className="w-full max-w-7xl flex items-center justify-center gap-4 sm:gap-6">
            {/* ◀ Лява стрелка */}
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed group
                bg-gradient-to-br from-[#5B3FD1]/40 to-[#7C5CE7]/30
                hover:from-[#5B3FD1]/70 hover:to-[#7C5CE7]/60
                border border-[#7C5CE7]/40 hover:border-[#7C5CE7]/80
                backdrop-blur-md shadow-xl shadow-[#5B3FD1]/20
                text-white"
              title="Предишен слайд (←)"
            >
              <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Слайд */}
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
                  {isShowingQR ? (
                    <QRCodeSlide sessionId={sessionId} />
                  ) : (
                    <SlideViewer slide={currentSlideData} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ▶ Дясна стрелка */}
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed group
                bg-gradient-to-br from-[#5B3FD1]/40 to-[#7C5CE7]/30
                hover:from-[#5B3FD1]/70 hover:to-[#7C5CE7]/60
                border border-[#7C5CE7]/40 hover:border-[#7C5CE7]/80
                backdrop-blur-md shadow-xl shadow-[#5B3FD1]/20
                text-white"
              title="Следващ слайд (→)"
            >
              <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 🔥 STUDENTS PANEL (дясно) */}
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
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Гледат сега
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5B3FD1]/20 border border-[#5B3FD1]/40 text-[#A78BFA] font-bold">
                    {students.length}
                  </span>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-3">
                  {students.length === 0 ? (
                    <div className="text-center py-6 rounded-xl bg-white/5 border border-dashed border-white/10">
                      <Users className="w-8 h-8 mx-auto mb-2 text-white/20" />
                      <p className="text-[11px] text-white/30">
                        Никой още не се е свързал
                      </p>
                      <p className="text-[10px] text-white/20 mt-0.5">
                        Сподели QR кода
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {students.map((s, i) => (
                        <div
                          key={`${s.name}-${i}`}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-white/85 font-medium truncate flex-1">
                            {s.name}
                          </span>
                          <Circle className="w-2 h-2 fill-green-400 text-green-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer – брой */}
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
        {/* Dots */}
        <div className="flex gap-1.5 sm:gap-2 max-w-[30%] overflow-x-auto items-center">
          {slidesWithQR.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`shrink-0 h-2.5 rounded-full transition-all ${
                i === currentIndex
                  ? i === 0
                    ? "bg-[#18BFC7] w-8"
                    : "bg-[#5B3FD1] w-8"
                  : "bg-white/20 hover:bg-white/40 w-2.5"
              }`}
              aria-label={i === 0 ? "QR код" : `Слайд ${i}`}
              title={i === 0 ? "QR код" : `Слайд ${i}`}
            />
          ))}
        </div>

        {/* Брояч */}
        <span className="text-xs sm:text-sm text-white/50 font-mono">
          {isShowingQR ? (
            <span className="text-[#18BFC7]">📱 QR код</span>
          ) : (
            <>
              {actualSlideIndex + 1} / {slides.length}
            </>
          )}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(joinUrl)}
            className="px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 text-xs flex items-center gap-1.5 transition-colors"
            title="Копирай линк за учениците"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Копирай линк</span>
          </button>
          <a
            href="/create"
            className="px-3 sm:px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs sm:text-sm flex items-center gap-1 transition-colors"
            title="Изход от презентацията"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Изход</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PresentationViewer;