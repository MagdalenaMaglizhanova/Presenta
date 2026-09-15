import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileJson,
  Upload,
  Play,
  Layout,
  Image as ImageIcon,
  Video,
  HelpCircle,
  BarChart3,
  Lock,
  FileText,
  Delete,
  ShieldCheck,
  Users,
  Circle,
  Save,
  FolderOpen,
  X,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// 🔐 УЧИТЕЛСКИ PIN КОД
// ═══════════════════════════════════════════════════════════════════
const TEACHER_PIN = "2024";
const PIN_STORAGE_KEY = "presenta_teacher_unlocked";

// ═══════════════════════════════════════════════════════════════════
// 🌐 API CONFIG
// ═══════════════════════════════════════════════════════════════════
const API_URL = import.meta.env.VITE_API_URL || "https://server-presenta.onrender.com";
const WS_URL = import.meta.env.VITE_WS_URL || "wss://server-presenta.onrender.com";

// ─── Types ──────────────────────────────────────────────────────────

type SlideType =
  | "title"
  | "content"
  | "image"
  | "video"
  | "quiz"
  | "poll"
  | "crypto";

interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  hasIcon?: boolean;
  blocks?: any[];
  tags?: string[];
  imageUrl?: string;
  videoUrl?: string;
  question?: string;
  options?: string[];
  correctAnswer?: number;
  encrypted?: string;
  decrypted?: string;
  knowledgeBase?: string;
}

interface Presentation {
  title: string;
  slides: Slide[];
}

interface Student {
  name: string;
  avatar?: string;
  joinedAt: number;
}

interface SavedPresentation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ───────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).substring(2, 11);

const createSlide = (type: SlideType, overrides: any = {}): Slide => {
  const base = { id: generateId(), type, title: "" };
  switch (type) {
    case "title":
      return { ...base, subtitle: "", hasIcon: true, ...overrides };
    case "content":
      return { ...base, blocks: [], tags: [], ...overrides };
    case "image":
      return { ...base, imageUrl: "", ...overrides };
    case "video":
      return { ...base, videoUrl: "", ...overrides };
    case "quiz":
      return { ...base, question: "", options: ["", ""], correctAnswer: 0, ...overrides };
    case "poll":
      return { ...base, question: "", options: ["", ""], ...overrides };
    case "crypto":
      return { ...base, encrypted: "", decrypted: "", knowledgeBase: "", ...overrides };
    default:
      return { ...base, ...overrides };
  }
};

const SLIDE_META: Record<SlideType, { icon: React.ReactNode; label: string; color: string }> = {
  title:     { icon: <Layout className="w-4 h-4" />,     label: "Заглавие",     color: "from-[#5B3FD1] to-[#7C5CE7]" },
  content:   { icon: <FileText className="w-4 h-4" />,   label: "Съдържание",   color: "from-[#18BFC7] to-[#4cc9ff]" },
  image:     { icon: <ImageIcon className="w-4 h-4" />,  label: "Изображение",  color: "from-[#FFB800] to-[#FF8A00]" },
  video:     { icon: <Video className="w-4 h-4" />,      label: "Видео",        color: "from-[#FF4B4B] to-[#FF6B6B]" },
  quiz:      { icon: <HelpCircle className="w-4 h-4" />, label: "Тест",         color: "from-[#00E676] to-[#00BFA5]" },
  poll:      { icon: <BarChart3 className="w-4 h-4" />,  label: "Анкета",       color: "from-[#7C5CE7] to-[#B47CFF]" },
  crypto:    { icon: <Lock className="w-4 h-4" />,       label: "Криптиране",   color: "from-[#FF8A00] to-[#FF4B4B]" },
};

// ─── Default Presentation ────────────────────────────────────────

const DEFAULT_PRESENTATION: Presentation = {
  title: "Нова презентация",
  slides: [createSlide("title")],
};

// ─── Date formatter ──────────────────────────────────────────────

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ═══════════════════════════════════════════════════════════════════
// 🍞 TOAST COMPONENT
// ═══════════════════════════════════════════════════════════════════

const Toast: React.FC<{
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "from-green-500/20 to-green-600/10 border-green-500/40 text-green-300",
    error: "from-red-500/20 to-red-600/10 border-red-500/40 text-red-300",
    info: "from-[#5B3FD1]/20 to-[#18BFC7]/10 border-[#5B3FD1]/40 text-[#A78BFA]",
  };

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <FileText className="w-5 h-5" />,
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-br ${colors[type]} backdrop-blur-md shadow-2xl border`}
      style={{ animation: "slideIn 0.3s ease-out" }}
    >
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// 🔐 PIN LOCK COMPONENT
// ═══════════════════════════════════════════════════════════════════

const PinLock: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length >= 4) return;
    setError(false);
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      setTimeout(() => {
        if (newPin === TEACHER_PIN) {
          sessionStorage.setItem(PIN_STORAGE_KEY, "true");
          onUnlock();
        } else {
          setError(true);
          setShake(true);
          setTimeout(() => {
            setPin("");
            setShake(false);
          }, 600);
        }
      }, 200);
    }
  }, [pin, onUnlock]);

  const handleBackspace = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) handleDigit(e.key);
      if (e.key === "Backspace") handleBackspace();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDigit, handleBackspace]);

  return (
    <div className="min-h-screen bg-[#0A162B] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] border border-white/5 rounded-full" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] border border-white/5 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5B3FD1]/5 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center shadow-2xl shadow-[#5B3FD1]/40 mb-4">
            <Layout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white to-[#4cc9ff] bg-clip-text text-transparent">
            Presenta
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1 font-semibold">
            Учителски достъп
          </p>
        </div>

        <div
          className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl transition-transform ${
            shake ? "animate-shake" : ""
          }`}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#5B3FD1]/20 border border-[#5B3FD1]/30 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-[#7C5CE7]" />
            </div>
            <h2 className="text-lg font-bold text-white">Въведете PIN код</h2>
            <p className="text-xs text-white/40 mt-1">4-цифрен код за достъп</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? "bg-red-500 shadow-lg shadow-red-500/50"
                    : i < pin.length
                    ? "bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] scale-110 shadow-lg shadow-[#5B3FD1]/50"
                    : "bg-white/10 border border-white/20"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-red-400 text-xs mb-4 font-medium">
              ❌ Грешен код. Опитайте отново.
            </p>
          )}

          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                disabled={pin.length >= 4}
                className="aspect-square rounded-2xl bg-white/5 hover:bg-white/10 active:bg-[#5B3FD1]/30 border border-white/10 hover:border-[#5B3FD1]/40 text-white text-2xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleDigit("0")}
              disabled={pin.length >= 4}
              className="aspect-square rounded-2xl bg-white/5 hover:bg-white/10 active:bg-[#5B3FD1]/30 border border-white/10 hover:border-[#5B3FD1]/40 text-white text-2xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              disabled={pin.length === 0}
              className="aspect-square rounded-2xl bg-white/5 hover:bg-white/10 active:bg-red-500/20 border border-white/10 hover:border-red-500/40 flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Изтрий"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>

        <p className="text-center text-white/30 text-[11px] mt-6">
          Само учителят има достъп до редактора. Учениците влизат с код за достъп.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// 📂 PRESENTATIONS MODAL
// ═══════════════════════════════════════════════════════════════════

const PresentationsModal: React.FC<{
  presentations: SavedPresentation[];
  currentId: string | null;
  isLoading: boolean;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onRefresh: () => void;
}> = ({ presentations, currentId, isLoading, onLoad, onDelete, onClose, onRefresh }) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0F1E36] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Моите презентации</h2>
              <p className="text-xs text-white/40">
                {presentations.length} {presentations.length === 1 ? "презентация" : "презентации"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-30"
              title="Обнови"
            >
              <Loader2 className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#5B3FD1] animate-spin mb-3" />
              <p className="text-sm text-white/50">Зареждане...</p>
            </div>
          ) : presentations.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/50 mb-1">Няма запазени презентации</p>
              <p className="text-xs text-white/30">
                Натисни „Запази" за да запазиш текущата
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {presentations.map((p) => {
                const isCurrent = p.id === currentId;
                return (
                  <div
                    key={p.id}
                    className={`group flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? "bg-[#5B3FD1]/20 border-[#7C5CE7]/40"
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5B3FD1]/40 to-[#18BFC7]/30 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-white/80" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">
                          {p.title}
                        </p>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 font-bold shrink-0">
                            ● ТЕКУЩА
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        Обновена: {formatDate(p.updated_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onLoad(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#5B3FD1]/30 hover:bg-[#5B3FD1]/50 border border-[#7C5CE7]/40 text-white text-xs font-medium transition-colors flex items-center gap-1"
                        title="Зареди"
                      >
                        <FolderOpen className="w-3 h-3" />
                        Зареди
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-300 transition-colors"
                        title="Изтрий"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {confirmDelete && (
          <div className="p-4 border-t border-white/10 bg-red-500/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="flex-1 text-sm text-white/90">
                Сигурен ли си, че искаш да изтриеш тази презентация?
              </p>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs transition-colors"
              >
                Отказ
              </button>
              <button
                onClick={() => {
                  onDelete(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
              >
                Изтрий
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Slide Thumbnail ──────────────────────────────────────────────

const SlideThumbnail: React.FC<{
  slide: Slide;
  index: number;
  isActive: boolean;
}> = ({ slide, index, isActive }) => {
  const meta = SLIDE_META[slide.type];
  return (
    <div className="relative aspect-video rounded-lg bg-[#0F1E36] border border-white/10 overflow-hidden shadow-sm">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.color}`} />
      <div className="absolute inset-0 pt-1 p-2 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-white/40">
            {meta.label}
          </span>
          <span className="text-[10px] text-white/30">#{index + 1}</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          {slide.type === "image" && slide.imageUrl ? (
            <img src={slide.imageUrl} alt="" className="max-h-full max-w-full object-contain rounded" />
          ) : slide.type === "title" ? (
            <div className="text-center px-1 w-full">
              <p className="text-[11px] font-bold text-white/90 truncate">
                {slide.title || "Без заглавие"}
              </p>
              {slide.subtitle && (
                <p className="text-[8px] text-white/50 truncate mt-0.5">{slide.subtitle}</p>
              )}
            </div>
          ) : (
            <div className="text-center px-1 w-full">
              <p className="text-[10px] font-medium text-white/80 truncate">
                {slide.title || "Слайд " + (index + 1)}
              </p>
            </div>
          )}
        </div>
      </div>
      {isActive && (
        <div className="absolute inset-0 ring-2 ring-[#7C5CE7] ring-offset-1 ring-offset-[#0A162B] rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────

export const PresentationEditor: React.FC = () => {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(PIN_STORAGE_KEY) === "true";
  });

  const [presentation, setPresentation] = useState<Presentation>(DEFAULT_PRESENTATION);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [liveStatus, setLiveStatus] = useState<"offline" | "online" | "connecting">("connecting");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // 💾 SAVE / LOAD state
  const [currentPresentationId, setCurrentPresentationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [savedPresentations, setSavedPresentations] = useState<SavedPresentation[]>([]);
  const [showPresentationsModal, setShowPresentationsModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // 🔧 Ref за skip на hasUnsavedChanges при load/new/import
  const skipNextUnsavedRef = useRef(false);
  // 🔧 Ref за да не маркираме като unsaved при първоначалния mount
  const isFirstMountRef = useRef(true);

  const currentSlide = presentation.slides[selectedIndex];

  // ─── Mark as unsaved when presentation changes ────────────────
  useEffect(() => {
    if (!unlocked) return;
    
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    if (skipNextUnsavedRef.current) {
      skipNextUnsavedRef.current = false;
      return;
    }

    setHasUnsavedChanges(true);
  }, [presentation, unlocked]);

  // ─── Toast helper ─────────────────────────────────────────────
  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
  };

  // ═════════════════════════════════════════════════════════════
  // 💾 SAVE / LOAD FUNCTIONS
  // ═════════════════════════════════════════════════════════════

  const savePresentation = useCallback(async (saveAsNew: boolean = false) => {
    setIsSaving(true);

    try {
      const isUpdate = !saveAsNew && currentPresentationId !== null;
      const url = isUpdate
        ? `${API_URL}/api/presentations/${currentPresentationId}`
        : `${API_URL}/api/presentations`;
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: presentation.title || "Без заглавие",
          slides: presentation.slides,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Грешка при запазване");
      }

      const data = await res.json();
      setCurrentPresentationId(data.id);
      setHasUnsavedChanges(false);
      showToast("success", isUpdate ? "✅ Презентацията е обновена!" : "✅ Презентацията е запазена!");
    } catch (err: any) {
      console.error("Save error:", err);
      showToast("error", `❌ ${err.message || "Грешка при запазване"}`);
    } finally {
      setIsSaving(false);
    }
  }, [presentation, currentPresentationId]);

  const loadPresentationsList = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch(`${API_URL}/api/presentations`);
      if (!res.ok) throw new Error("Грешка при зареждане");
      const data = await res.json();
      setSavedPresentations(data.presentations || []);
    } catch (err: any) {
      console.error("List error:", err);
      showToast("error", "❌ Не мога да заредя списъка");
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  const loadPresentation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/presentations/${id}`);
      if (!res.ok) throw new Error("Презентацията не е намерена");
      const data = await res.json();

      skipNextUnsavedRef.current = true;
      setPresentation({
        title: data.title || "Без заглавие",
        slides: data.slides || [],
      });
      setCurrentPresentationId(data.id);
      setSelectedIndex(0);
      setHasUnsavedChanges(false);
      setShowPresentationsModal(false);
      showToast("success", `📂 Заредена: ${data.title}`);
    } catch (err: any) {
      console.error("Load error:", err);
      showToast("error", `❌ ${err.message}`);
    }
  }, []);

  const deletePresentation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/presentations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Грешка при изтриване");

      setSavedPresentations((prev) => prev.filter((p) => p.id !== id));

      if (id === currentPresentationId) {
        setCurrentPresentationId(null);
      }

      showToast("success", "🗑️ Презентацията е изтрита");
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast("error", `❌ ${err.message}`);
    }
  }, [currentPresentationId]);

  const openPresentationsModal = useCallback(() => {
    setShowPresentationsModal(true);
    loadPresentationsList();
  }, [loadPresentationsList]);

  // ─── WebSocket ─────────────────────────────────────────────────

  const connectToServer = useCallback(async (presentationId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presentationId,
          presentationTitle: presentation.title,
          totalSlides: presentation.slides.length,
        }),
      });
      const data = await res.json();
      if (!data.sessionId) throw new Error("No session");
      setSessionId(data.sessionId);
      setLiveStatus("connecting");

      const ws = new WebSocket(`${WS_URL}/ws?session=${data.sessionId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setLiveStatus("online");
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "PRESENTATION_DATA",
              slides: presentation.slides,
              title: presentation.title,
            })
          );
        }
      };

      ws.onclose = () => setLiveStatus("offline");
      ws.onerror = () => setLiveStatus("offline");

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);

          if (msg.type === "REQUEST_PRESENTATION") {
            console.log("📥 Заявка за презентация – изпращаме слайдовете");
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "PRESENTATION_DATA",
                  slides: presentation.slides,
                  title: presentation.title,
                })
              );
            }
          }

          if (msg.type === "STUDENT_LIST") {
            setStudents(msg.students || []);
            console.log(`👥 Ученици в сесията: ${msg.count || 0}`);
          }
        } catch (err) {
          console.error("Грешка при парсване:", err);
        }
      };
    } catch (err) {
      console.error(err);
      setLiveStatus("offline");
    }
  }, [presentation.slides, presentation.title]);

  // ─── Actions ───────────────────────────────────────────────────

  const addSlide = useCallback(
    (type: SlideType) => {
      const newSlide = createSlide(type);
      setPresentation((p) => ({ ...p, slides: [...p.slides, newSlide] }));
      setSelectedIndex(presentation.slides.length);
    },
    [presentation.slides.length]
  );

  const deleteSlide = useCallback(
    (index: number) => {
      if (presentation.slides.length <= 1) return;
      setPresentation((p) => ({
        ...p,
        slides: p.slides.filter((_, i) => i !== index),
      }));
      if (selectedIndex >= index && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      }
    },
    [presentation.slides.length, selectedIndex]
  );

  const duplicateSlide = useCallback(
    (index: number) => {
      const slide = presentation.slides[index];
      const newSlide = { ...slide, id: generateId() };
      setPresentation((p) => ({
        ...p,
        slides: [...p.slides.slice(0, index + 1), newSlide, ...p.slides.slice(index + 1)],
      }));
      setSelectedIndex(index + 1);
    },
    [presentation.slides]
  );

  const moveSlide = useCallback((from: number, to: number) => {
    if (from === to) return;
    setPresentation((p) => {
      const slides = [...p.slides];
      const [removed] = slides.splice(from, 1);
      slides.splice(to, 0, removed);
      return { ...p, slides };
    });
    setSelectedIndex(to);
  }, []);

  const updateSlide = useCallback((index: number, updates: Partial<Slide>) => {
    setPresentation((p) => {
      const slides = [...p.slides];
      slides[index] = { ...slides[index], ...updates };
      return { ...p, slides };
    });
  }, []);

  const updateCurrent = useCallback(
    (updates: Partial<Slide>) => {
      if (selectedIndex < 0) return;
      updateSlide(selectedIndex, updates);
    },
    [selectedIndex, updateSlide]
  );

  const newPresentation = useCallback(() => {
    if (hasUnsavedChanges) {
      const ok = window.confirm(
        "Имаш незаписани промени. Сигурен ли си, че искаш да създадеш нова презентация?"
      );
      if (!ok) return;
    }

    skipNextUnsavedRef.current = true;
    setPresentation({
      title: "Нова презентация",
      slides: [createSlide("title")],
    });
    setCurrentPresentationId(null);
    setSelectedIndex(0);
    setHasUnsavedChanges(false);
    showToast("info", "📄 Нова презентация");
  }, [hasUnsavedChanges]);

  // ─── Presentation Mode ─────────────────────────────────────────

  const togglePresent = useCallback(async () => {
    if (isPresenting) {
      wsRef.current?.close();
      setIsPresenting(false);
      setLiveStatus("offline");
      setSessionId(null);
      setStudents([]);
      return;
    }

    await connectToServer(presentation.title || "presentation");
    setIsPresenting(true);
  }, [isPresenting, presentation.title, connectToServer]);

  useEffect(() => {
    if (isPresenting && sessionId) {
      const url = `/present?session=${sessionId}`;
      const newTab = window.open(url, "_blank");

      if (!newTab) {
        window.location.href = url;
        return;
      }

      setIsPresenting(false);
    }
  }, [isPresenting, sessionId]);

  // ─── Export / Import ───────────────────────────────────────────

  const exportData = useCallback(() => {
    const data = { version: "1.0", exportedAt: new Date().toISOString(), presentation };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presenta-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [presentation]);

  const importData = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.presentation && data.presentation.slides) {
            skipNextUnsavedRef.current = true;
            setPresentation(data.presentation);
            setSelectedIndex(0);
            setCurrentPresentationId(null);
            showToast("success", "📥 Импортирана презентация");
          }
        } catch {
          showToast("error", "❌ Невалиден JSON файл");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // ─── Keyboard shortcut: Ctrl+S ────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (unlocked && !isSaving) {
          savePresentation(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [unlocked, isSaving, savePresentation]);

  // ══════════════════════════════════════════════════════════════
  // 🔐 PIN CHECK
  // ══════════════════════════════════════════════════════════════
  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />;
  }

  // ─── Editor ────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-[#0A162B] text-white flex flex-col overflow-hidden">
      {/* ═══ TOOLBAR ═══ */}
      <header className="shrink-0 bg-[#0A162B]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center shadow-lg shadow-[#5B3FD1]/30">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold bg-gradient-to-r from-white to-[#4cc9ff] bg-clip-text text-transparent hidden sm:inline">
            Presenta
          </span>
        </div>

        <div className="w-px h-8 bg-white/10 hidden sm:block" />

        <div className="flex-1 flex items-center gap-2 min-w-[180px]">
          <input
            value={presentation.title}
            onChange={(e) => setPresentation((p) => ({ ...p, title: e.target.value }))}
            placeholder="Име на презентацията"
            className="flex-1 bg-transparent border-none text-base font-semibold text-white placeholder-white/30 focus:outline-none focus:bg-white/5 rounded-lg px-3 py-1.5 transition-colors"
          />
          {hasUnsavedChanges && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold whitespace-nowrap">
              ● незаписано
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${
              liveStatus === "online"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : liveStatus === "connecting"
                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                : "border-white/10 bg-white/5 text-white/40"
            }`}
          >
            {liveStatus === "online"
              ? "● LIVE"
              : liveStatus === "connecting"
              ? "⟳ свързване"
              : "○ извън линия"}
          </span>
          {sessionId && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#4cc9ff] font-mono hidden md:inline">
              {sessionId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={newPresentation}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
            title="Нова презентация"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={openPresentationsModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors text-sm"
            title="Моите презентации"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden md:inline">Моите</span>
          </button>

          <button
            onClick={() => savePresentation(false)}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold transition-all disabled:opacity-50 ${
              hasUnsavedChanges
                ? "bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-500 hover:to-green-600 border-green-500/40 text-white"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-white/60"
            }`}
            title={currentPresentationId ? "Обнови (Ctrl+S)" : "Запази (Ctrl+S)"}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden md:inline">
              {currentPresentationId ? "Обнови" : "Запази"}
            </span>
          </button>

          <div className="w-px h-6 bg-white/10 hidden sm:block" />

          <button
            onClick={importData}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
            title="Импорт на JSON"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={exportData}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
            title="Експорт на JSON"
          >
            <FileJson className="w-4 h-4" />
          </button>

          <button
            onClick={togglePresent}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#5B3FD1] to-[#18BFC7] hover:shadow-lg hover:shadow-[#5B3FD1]/30 text-sm font-semibold transition-all"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">{isPresenting ? "Спри" : "Презентация"}</span>
          </button>
        </div>
      </header>

      {/* ═══ BODY ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── SIDEBAR: SLIDES ─── */}
        <aside className="w-64 shrink-0 bg-[#0A162B]/60 border-r border-white/5 flex flex-col overflow-hidden">
          <div className="shrink-0 px-3 py-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] uppercase tracking-wider text-white/40 font-bold">
                Слайдове · {presentation.slides.length}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowAddMenu((v) => !v)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#5B3FD1] to-[#18BFC7] hover:shadow-lg hover:shadow-[#5B3FD1]/30 text-sm font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                Нов слайд
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAddMenu ? "rotate-180" : ""}`} />
              </button>

              {showAddMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowAddMenu(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-[#0F1E36] border border-white/10 rounded-lg shadow-2xl p-1.5 space-y-0.5">
                    {(Object.keys(SLIDE_META) as SlideType[]).map((type) => {
                      const meta = SLIDE_META[type];
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            addSlide(type);
                            setShowAddMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-md hover:bg-white/5 text-white/70 hover:text-white transition-colors text-left"
                        >
                          <span className={`w-6 h-6 rounded-md bg-gradient-to-br ${meta.color} flex items-center justify-center text-white shrink-0`}>
                            {meta.icon}
                          </span>
                          <span className="font-medium">{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {presentation.slides.length === 0 && (
              <div className="text-center text-white/30 text-xs py-8">
                Няма слайдове. Натиснете „Нов слайд".
              </div>
            )}

            {presentation.slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`group relative cursor-pointer rounded-xl transition-all ${
                  idx === selectedIndex ? "scale-[1.02]" : "hover:scale-[1.01]"
                }`}
                onClick={() => setSelectedIndex(idx)}
              >
                <SlideThumbnail slide={slide} index={idx} isActive={idx === selectedIndex} />

                <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm rounded-md p-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateSlide(idx); }}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Дублирай"
                  >
                    <Copy className="w-3 h-3 text-white/70" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (idx > 0) moveSlide(idx, idx - 1); }}
                    className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                    disabled={idx === 0}
                    title="Премести нагоре"
                  >
                    <ChevronUp className="w-3 h-3 text-white/70" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (idx < presentation.slides.length - 1) moveSlide(idx, idx + 1); }}
                    className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                    disabled={idx === presentation.slides.length - 1}
                    title="Премести надолу"
                  >
                    <ChevronDown className="w-3 h-3 text-white/70" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }}
                    className="p-1 hover:bg-red-500/30 rounded disabled:opacity-30"
                    disabled={presentation.slides.length <= 1}
                    title="Изтрий"
                  >
                    <Trash2 className="w-3 h-3 text-red-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ─── PREVIEW ─── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-[#0A162B] via-[#1A2B4A]/30 to-[#5B3FD1]/10">
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
            {currentSlide ? (
              <div className="w-full max-w-5xl aspect-video bg-white/5 rounded-2xl border border-white/10 p-6 md:p-10 overflow-y-auto backdrop-blur-sm shadow-2xl">
                <SlideViewer slide={currentSlide} />
              </div>
            ) : (
              <div className="text-center text-white/30">
                <Layout className="w-16 h-16 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Няма избран слайд</p>
              </div>
            )}
          </div>

          {presentation.slides.length > 0 && (
            <div className="shrink-0 flex items-center justify-center gap-3 py-3 border-t border-white/5">
              <button
                onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                disabled={selectedIndex === 0}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/50 min-w-[60px] text-center font-mono">
                {selectedIndex + 1} / {presentation.slides.length}
              </span>
              <button
                onClick={() => setSelectedIndex(Math.min(presentation.slides.length - 1, selectedIndex + 1))}
                disabled={selectedIndex === presentation.slides.length - 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>

        {/* ─── RIGHT SIDEBAR: STUDENTS + PROPERTIES ─── */}
        <aside className="w-80 shrink-0 bg-[#0A162B]/60 border-l border-white/5 flex flex-col overflow-hidden">
          <div className="shrink-0 border-b border-white/5">
            <div className="px-4 py-3 flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Гледат сега
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5B3FD1]/20 border border-[#5B3FD1]/40 text-[#A78BFA] font-bold">
                {students.length}
              </span>
            </div>

            <div className="px-3 pb-3">
              {students.length === 0 ? (
                <div className="text-center py-4 rounded-xl bg-white/5 border border-dashed border-white/10">
                  <p className="text-[11px] text-white/30">
                    Никой още не се е свързал
                  </p>
                  <p className="text-[10px] text-white/20 mt-0.5">
                    Сподели кода за достъп
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                  {students.map((s, i) => (
                    <div
                      key={`${s.name}-${i}`}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5B3FD1] to-[#18BFC7] flex items-center justify-center text-base shrink-0">
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
          </div>

          {/* PROPERTIES */}
          <div className="flex-1 overflow-y-auto">
            {currentSlide ? (
              <div className="p-4 space-y-5">
                <div className="space-y-3">
                  <h3 className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                    Основно
                  </h3>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Тип на слайда</label>
                    <select
                      value={currentSlide.type}
                      onChange={(e) => updateCurrent({ type: e.target.value as SlideType })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5B3FD1]/50"
                    >
                      {(Object.keys(SLIDE_META) as SlideType[]).map((t) => (
                        <option key={t} value={t}>{SLIDE_META[t].label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Заглавие</label>
                    <input
                      value={currentSlide.title || ""}
                      onChange={(e) => updateCurrent({ title: e.target.value })}
                      placeholder="Заглавие на слайда"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#5B3FD1]/50"
                    />
                  </div>
                </div>

                {currentSlide.type === "title" && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <h3 className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                      Заглавен слайд
                    </h3>
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Подзаглавие</label>
                      <input
                        value={currentSlide.subtitle || ""}
                        onChange={(e) => updateCurrent({ subtitle: e.target.value })}
                        placeholder="Подзаглавие"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#5B3FD1]/50"
                      />
                    </div>
                  </div>
                )}

                {currentSlide.type === "image" && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <h3 className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                      Изображение
                    </h3>
                    <input
                      value={currentSlide.imageUrl || ""}
                      onChange={(e) => updateCurrent({ imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#5B3FD1]/50"
                    />
                  </div>
                )}

                {currentSlide.type === "video" && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <h3 className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                      Видео
                    </h3>
                    <input
                      value={currentSlide.videoUrl || ""}
                      onChange={(e) => updateCurrent({ videoUrl: e.target.value })}
                      placeholder="https://example.com/video.mp4"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#5B3FD1]/50"
                    />
                  </div>
                )}

                {currentSlide.type === "content" && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <h3 className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                      Съдържание
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {(currentSlide.blocks || []).map((block, idx) => (
                        <div key={idx} className="bg-white/5 p-2 rounded-lg border border-white/5 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={block.type || "text"}
                              onChange={(e) => {
                                const blocks = [...(currentSlide.blocks || [])];
                                blocks[idx] = { ...blocks[idx], type: e.target.value };
                                updateCurrent({ blocks });
                              }}
                              className="bg-white/5 border border-white/10 rounded text-white/70 text-xs px-1.5 py-0.5 focus:outline-none"
                            >
                              <option value="text">Текст</option>
                              <option value="bullets">Списък</option>
                              <option value="highlight">Акцент</option>
                              <option value="image">Снимка</option>
                            </select>
                            <button
                              onClick={() => {
                                const blocks = (currentSlide.blocks || []).filter((_, i) => i !== idx);
                                updateCurrent({ blocks });
                              }}
                              className="ml-auto text-white/20 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <input
                            value={block.content || block.items?.join(", ") || block.url || ""}
                            onChange={(e) => {
                              const blocks = [...(currentSlide.blocks || [])];
                              if (block.type === "bullets") {
                                blocks[idx] = { ...blocks[idx], items: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) };
                              } else {
                                blocks[idx] = { ...blocks[idx], content: e.target.value };
                              }
                              updateCurrent({ blocks });
                            }}
                            placeholder={block.type === "bullets" ? "Елемент 1, Елемент 2..." : "Съдържание..."}
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#5B3FD1]/50"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const blocks = [...(currentSlide.blocks || []), { type: "text", content: "" }];
                        updateCurrent({ blocks });
                      }}
                      className="w-full text-xs text-white/50 hover:text-white py-2 border border-dashed border-white/10 hover:border-white/30 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Добави блок
                    </button>
                  </div>
                )}

                {(currentSlide.type === "quiz" || currentSlide.type === "poll") && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <h3 className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                      {currentSlide.type === "quiz" ? "Тест" : "Анкета"}
                    </h3>
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Въпрос</label>
                      <input
                        value={currentSlide.question || ""}
                        onChange={(e) => updateCurrent({ question: e.target.value })}
                        placeholder="Въведете въпрос..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#5B3FD1]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Опции</label>
                      <div className="space-y-1.5">
                        {(currentSlide.options || []).map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="text-xs text-white/30 w-5 font-mono">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <input
                              value={opt || ""}
                              onChange={(e) => {
                                const options = [...(currentSlide.options || [])];
                                options[idx] = e.target.value;
                                updateCurrent({ options });
                              }}
                              placeholder={`Опция ${idx + 1}`}
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#5B3FD1]/50"
                            />
                            {currentSlide.type === "quiz" && (
                              <button
                                onClick={() => updateCurrent({ correctAnswer: idx })}
                                className={`text-sm ${idx === currentSlide.correctAnswer ? "text-green-400" : "text-white/20 hover:text-white/40"}`}
                                title="Маркирай като верен отговор"
                              >
                                {idx === currentSlide.correctAnswer ? "●" : "○"}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if ((currentSlide.options || []).length <= 2) return alert("Трябват поне 2 опции.");
                                const options = (currentSlide.options || []).filter((_, i) => i !== idx);
                                if (currentSlide.correctAnswer === idx) updateCurrent({ options, correctAnswer: 0 });
                                else updateCurrent({ options });
                              }}
                              className="text-white/20 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const options = [...(currentSlide.options || []), ""];
                          updateCurrent({ options });
                        }}
                        className="mt-2 w-full text-xs text-white/50 hover:text-white py-1.5 border border-dashed border-white/10 hover:border-white/30 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Добави опция
                      </button>
                    </div>
                  </div>
                )}

                {currentSlide.type === "crypto" && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <h3 className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                      Криптиране
                    </h3>
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Шифрован текст</label>
                      <textarea
                        value={currentSlide.encrypted || ""}
                        onChange={(e) => updateCurrent({ encrypted: e.target.value })}
                        rows={2}
                        placeholder="Въведете шифрован текст..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#5B3FD1]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Декриптиран текст</label>
                      <textarea
                        value={currentSlide.decrypted || ""}
                        onChange={(e) => updateCurrent({ decrypted: e.target.value })}
                        rows={2}
                        placeholder="Декриптиран текст..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#5B3FD1]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Knowledge Base</label>
                      <textarea
                        value={currentSlide.knowledgeBase || ""}
                        onChange={(e) => updateCurrent({ knowledgeBase: e.target.value })}
                        rows={3}
                        placeholder="code(a,g). code(b,h). ..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#5B3FD1]/50"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-white/20 text-sm">
                Няма избран слайд
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ═══ MODALS & TOASTS ═══ */}
      {showPresentationsModal && (
        <PresentationsModal
          presentations={savedPresentations}
          currentId={currentPresentationId}
          isLoading={isLoadingList}
          onLoad={loadPresentation}
          onDelete={deletePresentation}
          onClose={() => setShowPresentationsModal(false)}
          onRefresh={loadPresentationsList}
        />
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// ─── Slide Viewer (непроменен) ────────────────────────────────────

export const SlideViewer: React.FC<{ slide: Slide }> = ({ slide }) => {
  if (!slide) return <div className="text-white/20">Изберете слайд</div>;

  const renderContent = () => {
    switch (slide.type) {
      case "title":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-[#4cc9ff] bg-clip-text text-transparent">
              {slide.title || "Без заглавие"}
            </h1>
            {slide.subtitle && <p className="text-xl text-white/50 mt-2">{slide.subtitle}</p>}
            {slide.hasIcon && (
              <div className="mt-8 relative w-40 h-40">
                <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse" />
                <div className="absolute inset-4 rounded-full border border-[#5B3FD1]/20" />
                <div className="absolute inset-8 rounded-full border border-[#18BFC7]/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-[80%] h-[80%] bg-white/20 blur-[40px] rounded-full" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-10 drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#5B3FD1" />
                        <stop offset="100%" stopColor="#18BFC7" />
                      </linearGradient>
                    </defs>
                    <path d="M 15 20 L 60 20 C 65 20 68 23 68 28 L 68 55 C 68 60 65 63 60 63 L 30 63 L 22 72 L 22 63 C 17 63 15 60 15 55 L 15 28 C 15 23 17 20 15 20 Z" fill="none" stroke="url(#logoGrad)" strokeWidth="4" strokeLinejoin="round" />
                    <path d="M 22 63 L 30 63 L 22 72 Z" fill="url(#logoGrad)" />
                    <circle cx="30" cy="38" r="5" fill="none" stroke="#18BFC7" strokeWidth="10" strokeDasharray="12 31.4" />
                    <circle cx="30" cy="38" r="5" fill="none" stroke="#FFB800" strokeWidth="10" strokeDasharray="10 31.4" strokeDashoffset="-12" />
                    <circle cx="30" cy="38" r="5" fill="none" stroke="#5B3FD1" strokeWidth="10" strokeDasharray="9.4 31.4" strokeDashoffset="-22" />
                    <rect x="42" y="32" width="18" height="3" rx="1.5" fill="#5B3FD1" />
                    <rect x="42" y="38" width="13" height="3" rx="1.5" fill="#5B3FD1" />
                    <rect x="42" y="44" width="15" height="3" rx="1.5" fill="#5B3FD1" />
                    <rect x="62" y="45" width="22" height="38" rx="4" fill="white" stroke="url(#logoGrad)" strokeWidth="3" />
                    <rect x="66" y="52" width="14" height="26" rx="2" fill="#F0F4F8" />
                    <circle cx="70" cy="58" r="2.5" fill="#00E676" />
                    <circle cx="70" cy="65" r="2.5" fill="#5B3FD1" />
                    <circle cx="70" cy="72" r="2.5" fill="#FFB800" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        );

      case "content":
        return (
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#4cc9ff] bg-clip-text text-transparent">
              {slide.title || "Съдържание"}
            </h2>
            <div className="mt-4 space-y-3 text-white/80">
              {(slide.blocks || []).map((block, idx) => {
                if (block.type === "text") return <p key={idx}>{block.content}</p>;
                if (block.type === "bullets")
                  return (
                    <ul key={idx} className="list-none space-y-1">
                      {(block.items || []).map((item: string, i: number) => (
                        <li key={i} className="pl-5 relative before:content-['✦'] before:absolute before:left-0 before:text-[#4cc9ff]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                if (block.type === "highlight")
                  return (
                    <div key={idx} className="border-l-4 border-[#4cc9ff] pl-4 py-2 bg-white/5 rounded-r-lg">
                      <p className="font-medium">{block.content}</p>
                    </div>
                  );
                if (block.type === "image")
                  return (
                    <div key={idx} className="rounded-lg overflow-hidden border border-white/10">
                      <img src={block.url} alt="" className="w-full max-h-48 object-cover" />
                    </div>
                  );
                return null;
              })}
            </div>
            {(slide.tags || []).map((tag, i) => (
              <span key={i} className="inline-block mt-4 mr-2 px-3 py-1 text-xs uppercase tracking-wider rounded-full bg-white/5 border border-white/10 text-white/50">
                {tag}
              </span>
            ))}
          </div>
        );

      case "image":
        return (
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#4cc9ff] bg-clip-text text-transparent">
              {slide.title || "Изображение"}
            </h2>
            {slide.imageUrl ? (
              <div className="mt-4 rounded-lg overflow-hidden border border-white/10">
                <img src={slide.imageUrl} alt={slide.title || ""} className="w-full max-h-72 object-cover" />
              </div>
            ) : (
              <div className="text-white/20 mt-4">Няма изображение</div>
            )}
          </div>
        );

      case "video":
        return (
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#4cc9ff] bg-clip-text text-transparent">
              {slide.title || "Видео"}
            </h2>
            {slide.videoUrl ? (
              <div className="mt-4 rounded-lg overflow-hidden border border-white/10">
                <video src={slide.videoUrl} controls className="w-full max-h-72" />
              </div>
            ) : (
              <div className="text-white/20 mt-4">Няма видео</div>
            )}
          </div>
        );

      case "quiz":
        return (
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#4cc9ff] bg-clip-text text-transparent">
              {slide.title || "Тест"}
            </h2>
            <p className="text-xl font-semibold mt-4 text-white/90">{slide.question || "Въпрос"}</p>
            <div className="mt-4 space-y-2">
              {(slide.options || []).map((opt, idx) => {
                const isCorrect = idx === slide.correctAnswer;
                return (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${isCorrect ? "border-green-500/30 bg-green-500/10" : "border-white/10 bg-white/5"}`}>
                    <span className="font-bold text-white/30 w-6">{String.fromCharCode(65 + idx)}</span>
                    <span className="flex-1">{opt || `Опция ${idx + 1}`}</span>
                    {isCorrect && <span className="text-green-400">✅</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "poll":
        return (
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#4cc9ff] bg-clip-text text-transparent">
              {slide.title || "Анкета"}
            </h2>
            <p className="text-xl font-semibold mt-4 text-white/90">{slide.question || "Въпрос"}</p>
            <div className="mt-4 space-y-2">
              {(slide.options || []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
                  <span className="font-bold text-white/30 w-6">{String.fromCharCode(65 + idx)}</span>
                  <span className="flex-1">{opt || `Опция ${idx + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "crypto":
        return (
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#4cc9ff] bg-clip-text text-transparent">
              {slide.title || "Криптиране"}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm font-semibold text-orange-400">🔐 Шифрован</p>
                <pre className="mt-2 text-sm text-orange-300 bg-black/20 p-2 rounded font-mono break-all whitespace-pre-wrap">
                  {slide.encrypted || "nkrru lxoktjy"}
                </pre>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm font-semibold text-green-400">✅ Декриптиран</p>
                <pre className="mt-2 text-sm text-green-300 bg-black/20 p-2 rounded font-mono break-all whitespace-pre-wrap">
                  {slide.decrypted || "Hello friends"}
                </pre>
              </div>
            </div>
            {slide.knowledgeBase && (
              <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm font-semibold text-white/40">📖 Knowledge Base</p>
                <pre className="mt-2 text-xs text-white/40 bg-black/20 p-2 rounded font-mono max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {slide.knowledgeBase}
                </pre>
              </div>
            )}
          </div>
        );

      default:
        return <div className="text-white/20">Непознат тип</div>;
    }
  };

  return <div className="h-full flex flex-col overflow-y-auto">{renderContent()}</div>;
};

export default PresentationEditor;