// src/pages/JoinPage.tsx
// Страница за присъединяване към презентация чрез код

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Hash } from "lucide-react";

const CODE_LENGTH = 6;

export const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus при зареждане
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCodeChange = (value: string) => {
    // Премахваме всичко освен букви и цифри, uppercase
    const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (cleaned.length <= CODE_LENGTH) {
      setCode(cleaned);
      setError(null);
    }
  };

  const handleJoin = () => {
    if (code.length < CODE_LENGTH) {
      setError(`Въведи пълен код (${CODE_LENGTH} символа)`);
      return;
    }

    // Navigate to /view with the code
    navigate(`/view?session=${code}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && code.length === CODE_LENGTH) {
      handleJoin();
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    handleCodeChange(pasted);
  };

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
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-[#4cc9ff] bg-clip-text text-transparent">
            Presenta
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-1 font-semibold">
            Включи се в презентацията
          </p>
        </div>

        {/* Картичка с код */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#5B3FD1]/20 border border-[#5B3FD1]/30 flex items-center justify-center mb-3">
              <Hash className="w-7 h-7 text-[#7C5CE7]" />
            </div>
            <h2 className="text-lg font-bold text-white">Въведи код на сесията</h2>
            <p className="text-xs text-white/40 mt-1 text-center">
              Кодът е на екрана на учителя
            </p>
          </div>

          {/* Input за код */}
          <div className="mb-6">
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="ABC123"
              maxLength={CODE_LENGTH}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-5 text-center text-3xl sm:text-4xl font-black tracking-[0.4em] text-white placeholder-white/20 focus:outline-none focus:border-[#5B3FD1]/60 focus:bg-white/10 transition-all uppercase"
              style={{ letterSpacing: code ? "0.4em" : "0.4em" }}
            />
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-white/30 text-xs">
                {code.length} / {CODE_LENGTH} символа
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-red-400 text-xs mb-4 font-medium"
            >
              ❌ {error}
            </motion.p>
          )}

          {/* Бутон */}
          <button
            onClick={handleJoin}
            disabled={code.length < CODE_LENGTH}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#5B3FD1] to-[#18BFC7] hover:shadow-lg hover:shadow-[#5B3FD1]/40 text-white text-base font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            Влез в презентацията
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-center text-white/30 text-[11px] mt-6">
          Питай учителя ако не виждаш кода
        </p>
      </motion.div>
    </div>
  );
};

export default JoinPage;