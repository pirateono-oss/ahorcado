'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Locale, TranslationDict } from '@/lib/types';
import { wordCategories, getRandomWord, getRandomCategory, getCategoryHint, difficultyConfig } from '@/lib/words';
import type { Difficulty } from '@/lib/words';

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

// Confetti particle
interface Particle { id: number; x: number; y: number; color: string; size: number; delay: number; rotation: number; }

function generateConfetti(): Particle[] {
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6b9d','#c084fc','#f97316','#22d3ee'];
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
  }));
}

interface HangmanDrawingProps { wrong: number; maxWrong: number; }
function HangmanDrawing({ wrong, maxWrong }: HangmanDrawingProps) {
  // For easy (8), add extra rope section; for hard (4), remove some limbs
  const showHead = wrong >= 1;
  const showBody = wrong >= 2;
  const showLeftArm = wrong >= 3;
  const showRightArm = wrong >= 4;
  // Extra limbs for easy mode
  const showLeftLeg = maxWrong >= 6 && wrong >= 5;
  const showRightLeg = maxWrong >= 6 && wrong >= 6;
  const showExtraRope = maxWrong >= 8 && wrong >= 7;
  const showFinalRope = maxWrong >= 8 && wrong >= 8;

  return (
    <svg viewBox="0 0 200 260" className="w-48 h-56 sm:w-56 sm:h-64 mx-auto">
      {/* Base */}
      <line x1="20" y1="240" x2="180" y2="240" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="240" x2="60" y2="20" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <line x1="55" y1="20" x2="140" y2="20" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <line x1="140" y1="20" x2="140" y2="50" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      {/* Rope */}
      {wrong >= 1 && <line x1="140" y1="50" x2="140" y2="70" stroke="#94a3b8" strokeWidth="2" />}
      {/* Head */}
      {showHead && <circle cx="140" cy="88" r="18" fill="none" stroke="#334155" strokeWidth="3" />}
      {/* Eyes */}
      {showHead && <circle cx="134" cy="85" r="2" fill="#334155" />}
      {showHead && <circle cx="146" cy="85" r="2" fill="#334155" />}
      {/* Mouth */}
      {showHead && wrong < maxWrong && <line x1="133" y1="95" x2="147" y2="95" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />}
      {wrong >= maxWrong && <line x1="131" y1="93" x2="137" y2="99" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {wrong >= maxWrong && <line x1="137" y1="93" x2="131" y2="99" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {/* X eyes for death */}
      {wrong >= maxWrong && <line x1="131" y1="82" x2="137" y2="88" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {wrong >= maxWrong && <line x1="137" y1="82" x2="131" y2="88" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {wrong >= maxWrong && <line x1="143" y1="82" x2="149" y2="88" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {wrong >= maxWrong && <line x1="149" y1="82" x2="143" y2="88" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {/* Body */}
      {showBody && <line x1="140" y1="106" x2="140" y2="160" stroke="#334155" strokeWidth="3" />}
      {/* Left arm */}
      {showLeftArm && <line x1="140" y1="120" x2="112" y2="145" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Right arm */}
      {showRightArm && <line x1="140" y1="120" x2="168" y2="145" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Left leg */}
      {showLeftLeg && <line x1="140" y1="160" x2="115" y2="200" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Right leg */}
      {showRightLeg && <line x1="140" y1="160" x2="165" y2="200" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Extra rope hang for easy mode */}
      {showExtraRope && <line x1="130" y1="55" x2="150" y2="55" stroke="#94a3b8" strokeWidth="1.5" />}
      {showFinalRope && <line x1="125" y1="42" x2="155" y2="42" stroke="#94a3b8" strokeWidth="1.5" />}
    </svg>
  );
}

interface Props { locale: Locale; dict: TranslationDict; }

export function HomePageClient({ locale, dict }: Props) {
  const t = dict.ahorcado;

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const maxWrong = difficultyConfig[difficulty].maxWrong;

  const [category, setCategory] = useState(() => getRandomCategory());
  const [word, setWord] = useState(() => getRandomWord(getRandomCategory(), difficulty));
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [lastStatus, setLastStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles] = useState<Particle[]>(() => generateConfetti());

  const normalizedWord = useMemo(() => word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(), [word]);

  const displayWord = useMemo(() =>
    word.split('').map((char, i) => {
      const normalized = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      return guessed.has(normalized) || guessed.has(char.toUpperCase()) ? char : '_';
    }),
    [word, guessed]
  );

  // First letter (for hint reveal)
  const firstLetter = useMemo(() => {
    const char = word[0];
    return char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }, [word]);

  const allLettersGuessed = useMemo(() => {
    const guessedCheck = new Set(guessed);
    if (hintUsed) guessedCheck.add(firstLetter);
    return word.split('').every(char => {
      const n = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      return guessedCheck.has(n);
    });
  }, [word, guessed, hintUsed, firstLetter]);

  const categoryKeys = Object.keys(wordCategories);
  const currentCategoryLabel = t.categories[category as keyof typeof t.categories] || category;

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || status !== 'playing') return;
      const key = e.key.toUpperCase();
      // Support Ñ key
      if (key === 'Ñ' || key === 'ñ') {
        handleGuess('Ñ');
        return;
      }
      if (/^[A-Z]$/.test(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, guessed, wrongCount]);

  // Celebration effect
  useEffect(() => {
    if (status === 'won' && lastStatus === 'playing') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, lastStatus]);

  const handleGuess = useCallback((letter: string) => {
    if (status !== 'playing' || guessed.has(letter)) return;

    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);

    if (!normalizedWord.includes(letter)) {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      if (newWrong >= maxWrong) {
        setStatus('lost');
        setStreak(0);
      }
    } else {
      // Check if won
      const checkSet = new Set(newGuessed);
      if (hintUsed) checkSet.add(firstLetter);
      const allGuessed = word.split('').every(char => {
        const n = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
        return checkSet.has(n);
      });
      if (allGuessed) {
        setStatus('won');
        const newStreak = streak + 1;
        setStreak(newStreak);
        // Score: remaining guesses * 10, plus streak bonus
        const points = (maxWrong - wrongCount) * 10 + newStreak * 5;
        setScore(s => s + points);
        setLastStatus('won');
      }
    }
  }, [word, normalizedWord, guessed, wrongCount, status, maxWrong, hintUsed, firstLetter, streak]);

  const useHint = useCallback(() => {
    if (hintUsed || status !== 'playing') return;
    setHintUsed(true);
    // Auto-reveal the first letter
    setGuessed(prev => new Set(prev).add(firstLetter));
    // Check if that wins the game
    const newGuessed = new Set(guessed);
    newGuessed.add(firstLetter);
    const allGuessed = word.split('').every(char => {
      const n = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      return newGuessed.has(n);
    });
    if (allGuessed) {
      setStatus('won');
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(s => s + (maxWrong - wrongCount) * 5);
      setLastStatus('won');
    }
  }, [hintUsed, status, firstLetter, guessed, word, streak, maxWrong, wrongCount]);

  const startNewGame = useCallback((cat?: string, diff?: Difficulty) => {
    const d = diff || difficulty;
    const cat_ = cat || getRandomCategory();
    const mw = difficultyConfig[d].maxWrong;
    setCategory(cat_);
    setWord(getRandomWord(cat_, d));
    setGuessed(new Set());
    setWrongCount(0);
    setStatus('playing');
    setHintUsed(false);
    setShowConfetti(false);
    if (diff) setDifficulty(diff);
  }, [difficulty]);

  const letterStatus = useCallback((letter: string) => {
    if (!guessed.has(letter)) return 'unused';
    if (normalizedWord.includes(letter)) return 'correct';
    return 'wrong';
  }, [guessed, normalizedWord]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiParticles.map(p => (
            <div
              key={p.id}
              className="absolute animate-confetti"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animationDelay: `${p.delay}s`,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl tool-icon shadow-lg text-2xl">
          💀
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">{t.siteTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.siteTagline}</p>
      </div>

      {/* Score & Streak display */}
      <div className="mb-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5">
          <span className="text-muted-foreground">{t.score}:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">{score}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5">
          <span className="text-muted-foreground">{t.streak}:</span>
          <span className={`font-bold ${streak >= 3 ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
            {streak}🔥
          </span>
        </div>
      </div>

      {/* Controls: Difficulty + Category + New Game */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <select
          value={difficulty}
          onChange={(e) => startNewGame(category, e.target.value as Difficulty)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="easy">{t.difficulty}: Fácil ({difficultyConfig.easy.maxWrong})</option>
          <option value="normal">{t.difficulty}: Normal ({difficultyConfig.normal.maxWrong})</option>
          <option value="hard">{t.difficulty}: Difícil ({difficultyConfig.hard.maxWrong})</option>
        </select>
        <select
          value={category}
          onChange={(e) => startNewGame(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {categoryKeys.map((key) => (
            <option key={key} value={key}>
              {getCategoryHint(key)} {t.categories[key as keyof typeof t.categories]}
            </option>
          ))}
        </select>
        <button
          onClick={() => startNewGame()}
          className="tool-icon inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          ↻ {t.newGame}
        </button>
      </div>

      {/* Game area */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {/* Hangman drawing */}
        <div className="mb-6">
          <HangmanDrawing wrong={wrongCount} maxWrong={maxWrong} />
        </div>

        {/* Status message */}
        {status !== 'playing' && (
          <div className={`mb-6 rounded-lg p-4 text-center text-lg font-bold ${
            status === 'won'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 animate-pulse'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {status === 'won' ? (
              <>
                🎉 {t.youWon} 🎉
                <div className="mt-1 text-sm font-normal text-green-600 dark:text-green-400">
                  +{(maxWrong - wrongCount) * 10 + streak * 5} {t.score!.toLowerCase()}
                </div>
              </>
            ) : t.youLost}
            <div className="mt-1 text-base font-normal">
              {t.wordWas}: <span className="font-bold">{word}</span>
            </div>
          </div>
        )}

        {/* Word display */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {displayWord.map((char, i) => (
            <span
              key={i}
              className={`flex h-10 w-9 items-center justify-center rounded-lg text-xl font-bold sm:h-12 sm:w-11 sm:text-2xl ${
                char === '_'
                  ? 'border-b-4 border-primary bg-muted text-transparent'
                  : 'border-b-4 border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              }`}
            >
              {char === '_' ? '\u00A0' : char}
            </span>
          ))}
        </div>

        {/* Category hint */}
        <div className="mb-4 text-center text-sm text-muted-foreground">
          {t.hint}: {getCategoryHint(category)} {currentCategoryLabel}
        </div>

        {/* Wrong guesses */}
        <div className="mb-4 text-center text-sm">
          <span className="text-muted-foreground">{t.wrongGuesses}: </span>
          <span className={`font-medium ${
            wrongCount >= maxWrong - 1 ? 'text-red-600 dark:text-red-400' : 'text-foreground'
          }`}>
            {wrongCount}/{maxWrong}
          </span>
          {/* Visual progress bar */}
          <div className="mx-auto mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                wrongCount >= maxWrong - 1 ? 'bg-red-500' : wrongCount >= Math.floor(maxWrong / 2) ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${(wrongCount / maxWrong) * 100}%` }}
            />
          </div>
        </div>

        {/* Hint button */}
        {!hintUsed && status === 'playing' && (
          <div className="mb-4 text-center">
            <button
              onClick={useHint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100 active:scale-95 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30"
            >
              {t.useHint}
            </button>
          </div>
        )}

        {/* Hint revealed */}
        {hintUsed && status === 'playing' && (
          <div className="mb-4 text-center text-sm font-medium text-amber-600 dark:text-amber-400">
            {t.hintRevealed} &quot;{word[0]}&quot;
          </div>
        )}

        {/* Letter buttons */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {ALPHABET.map((letter) => {
            const ls = letterStatus(letter);
            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={status !== 'playing' || ls !== 'unused'}
                className={`flex h-9 w-8 items-center justify-center rounded-md text-sm font-semibold transition-all active:scale-90 sm:h-10 sm:w-9 ${
                  ls === 'unused'
                    ? 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm'
                    : ls === 'correct'
                    ? 'bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                    : 'bg-red-100 text-red-400 dark:bg-red-900/20 dark:text-red-500 cursor-default'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Keyboard hint */}
        {status === 'playing' && (
          <div className="mt-3 text-center text-xs text-muted-foreground/60">
            ⌨️ {locale === 'es' ? 'Presiona las teclas del teclado' : locale === 'pt' ? 'Pressione as teclas do teclado' : 'Press keyboard keys'}
          </div>
        )}

        {/* Play again on game over */}
        {status !== 'playing' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => startNewGame()}
              className="tool-icon inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-medium text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
            >
              🎮 {t.newGame}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
