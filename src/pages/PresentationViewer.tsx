// src/components/PresentationViewer.tsx
// Компонент за презентиране от УЧИТЕЛЯ.
// Показва QR код, слайдове, ученици и реакции в реално време.

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

  // 🔥 Reactions
  const [reactions, setReactions] = useState<ReactionBurst[]>([]);
  const reactionIdRef = useRef(0);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});

  // ⏱ Session timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  // 🚪 End session state
  const [isEnding, setIsEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const currentIndexRef = useRef(0);
  const slidesRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionEndedRef = useRef(false);

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

  const isShowingQR = currentIndex === 0;
  const actualSlideIndex = currentIndex - 1;
  const totalSlides = slidesWithQR.length;

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

          // 🔥 Reaction от ученик
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

  // ─── Broadcast ─────────────────────────────────────────────────
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
    if (actualIndex >= 0) broadcast(actualIndex);
  }, [totalSlides, broadcast]);

  const goPrev = useCallback(() => {
    const prevIndex = currentIndexRef.current - 1;
    if (prevIndex < 0) return;
    setDirection(-1);
    setCurrentIndex(prevIndex);
    const actualIndex = prevIndex - 1;
    if (actualIndex >= 0) broadcast(actualIndex);
  }, [broadcast]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      setDirection(index > currentIndexRef.current ? 1 : -1);
      setCurrentIndex(index);
      const actualIndex = index - 1;
      if (actualIndex >= 0) broadcast(actualIndex);
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

  // ─── End Session ───────────────────────────────────────────────
  const endSession = useCallback(async () => {
    if (!sessionId) return;

    setIsEnding(true);
    sessionEndedRef.current = true;

    try {
      // 1. Затваряме WS
      wsRef.current?.close();

      // 2. Изтриваме сесията от сървъра (записва ended_at в DB)
      await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      console.log("✅ Сесията е приключена");
    } catch (err) {
      console.error("End session error:", err);
    } finally {
      // 3. Пренасочваме към редактора
      window.location.href = "/create";
    }
  }, [sessionId]);

  // ─── Auto-end при затваряне на таба ────────────────────────────
  // Използваме fetch с keepalive (поддържа DELETE), НЕ sendBeacon
  // (sendBeacon изпраща само POST и не работи с DELETE endpoint)
  useEffect(() => {
    const handler = () => {
      if (sessionId && !sessionEndedRef.current) {
        sessionEndedRef.current = true;

        // fetch с keepalive гарантира, че заявката ще се изпрати
        // дори когато потребителят затваря таба
        fetch(`${API_URL}/api/sessions/${sessionId}`, {
          method: "DELETE",
          keepalive: true,
        }).catch(() => {
          // Игнорираме грешки – табът се затваря все пак
        });
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
          <p className="mt-4 text-xs text-white/30 font-mono">Session: {sessionId}</p>
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

  const currentSlideData = slidesWithQR[currentIndex];
  const progress = isShowingQR ? 0 : ((actualSlideIndex + 1) / slides.length) * 100;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalSlides - 1;
  const joinUrl = `${window.location.origin}/view?session=${sessionId}`;

  // Общо реакции
  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + b, 0);

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
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Status pill */}
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

          {/* ⏱ Timer */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <Clock className="w-3.5 h-3.5 text-[#4cc9ff]" />
            <span className="text-xs text-white/80 font-mono font-medium">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {/* 🔥 Reactions count */}
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
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Students toggle */}
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
            {students.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#5B3FD1] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0A162B]">
                {students.length}
              </span>
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* 🚪 End session */}
          <button
            onClick={() => setShowEndConfirm(true)}
            className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md border border-red-500/40 flex items-center justify-center text-red-300 hover:text-red-200 transition-all"
            title="Приключи сесията"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 🔥 Floating reactions overlay */}
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

        {/* Slides area */}
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
                  {isShowingQR ? (
                    <QRCodeSlide sessionId={sessionId} />
                  ) : (
                    <SlideViewer slide={currentSlideData} />
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
                      <p className="text-[10px] text-white/20 mt-0.5">Сподели QR кода</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {students.map((s, i) => (
                        <div
                          key={`${s.name}-${i}`}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center text-base shrink-0 border border-[#7C5CE7]/40">
                            {s.avatar || s.name.charAt(0).toUpperCase()}
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
            />
          ))}
        </div>

        <span className="text-xs sm:text-sm text-white/50 font-mono">
          {isShowingQR ? (
            <span className="text-[#18BFC7]">📱 QR код</span>
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

                {/* Кратка статистика */}
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