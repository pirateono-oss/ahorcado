'use client';
import { useState, useCallback, useMemo } from 'react';
import type { Locale, TranslationDict } from '@/lib/types';
import { wordCategories, getRandomWord, getRandomCategory, getCategoryHint } from '@/lib/words';

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

interface HangmanDrawingProps { wrong: number; }
function HangmanDrawing({ wrong }: HangmanDrawingProps) {
  return (
    <svg viewBox="0 0 200 250" className="w-48 h-56 sm:w-56 sm:h-64 mx-auto">
      {/* Base */}
      <line x1="20" y1="240" x2="180" y2="240" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="240" x2="60" y2="20" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <line x1="55" y1="20" x2="140" y2="20" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <line x1="140" y1="20" x2="140" y2="50" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      {/* Rope */}
      {wrong >= 1 && <line x1="140" y1="50" x2="140" y2="70" stroke="#94a3b8" strokeWidth="2" />}
      {/* Head */}
      {wrong >= 2 && <circle cx="140" cy="88" r="18" fill="none" stroke="#334155" strokeWidth="3" />}
      {/* Eyes */}
      {wrong >= 2 && <circle cx="134" cy="85" r="2" fill="#334155" />}
      {wrong >= 2 && <circle cx="146" cy="85" r="2" fill="#334155" />}
      {/* Mouth */}
      {wrong >= 2 && wrong < MAX_WRONG && <line x1="133" y1="95" x2="147" y2="95" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />}
      {wrong >= MAX_WRONG && <line x1="131" y1="93" x2="137" y2="99" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {wrong >= MAX_WRONG && <line x1="137" y1="93" x2="131" y2="99" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {/* X eyes for death */}
      {wrong >= MAX_WRONG && <line x1="131" y1="82" x2="137" y2="88" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {wrong >= MAX_WRONG && <line x1="137" y1="82" x2="131" y2="88" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {wrong >= MAX_WRONG && <line x1="143" y1="82" x2="149" y2="88" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {wrong >= MAX_WRONG && <line x1="149" y1="82" x2="143" y2="88" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />}
      {/* Body */}
      {wrong >= 3 && <line x1="140" y1="106" x2="140" y2="160" stroke="#334155" strokeWidth="3" />}
      {/* Left arm */}
      {wrong >= 4 && <line x1="140" y1="120" x2="112" y2="145" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Right arm */}
      {wrong >= 5 && <line x1="140" y1="120" x2="168" y2="145" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Left leg */}
      {wrong >= 6 && <line x1="140" y1="160" x2="115" y2="200" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Right leg - appears on last wrong */}
      {wrong >= 6 && <line x1="140" y1="160" x2="165" y2="200" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />}
    </svg>
  );
}

interface Props { locale: Locale; dict: TranslationDict; }

export function HomePageClient({ locale, dict }: Props) {
  const t = dict.ahorcado;
  const [category, setCategory] = useState(() => getRandomCategory());
  const [word, setWord] = useState(() => getRandomWord(getRandomCategory()));
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const normalizedWord = useMemo(() => word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(), [word]);

  const displayWord = useMemo(() =>
    word.split('').map((char, i) => {
      const normalized = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      return guessed.has(normalized) || guessed.has(char.toUpperCase()) ? char : '_';
    }),
    [word, guessed]
  );

  const categoryKeys = Object.keys(wordCategories);
  const currentCategoryLabel = t.categories[category as keyof typeof t.categories] || category;

  const handleGuess = useCallback((letter: string) => {
    if (status !== 'playing' || guessed.has(letter)) return;

    setGuessed(prev => new Set(prev).add(letter));

    if (!normalizedWord.includes(letter)) {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      if (newWrong >= MAX_WRONG) {
        setStatus('lost');
      }
    } else {
      // Check if won - need to check if all letters (after normalization) are guessed
      const allGuessed = word.split('').every(char => {
        const n = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
        return guessed.has(n) || n === letter;
      });
      if (allGuessed) {
        setStatus('won');
      }
    }
  }, [word, normalizedWord, guessed, wrongCount, status]);

  const startNewGame = useCallback((cat?: string) => {
    const cat_ = cat || getRandomCategory();
    setCategory(cat_);
    setWord(getRandomWord(cat_));
    setGuessed(new Set());
    setWrongCount(0);
    setStatus('playing');
  }, []);

  const letterStatus = useCallback((letter: string) => {
    if (!guessed.has(letter)) return 'unused';
    if (normalizedWord.includes(letter)) return 'correct';
    return 'wrong';
  }, [guessed, normalizedWord]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl tool-icon shadow-lg text-2xl">
          💀
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">{t.siteTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.siteTagline}</p>
      </div>

      {/* Category Selector + New Game */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
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
          <HangmanDrawing wrong={wrongCount} />
        </div>

        {/* Status message */}
        {status !== 'playing' && (
          <div className={`mb-6 rounded-lg p-4 text-center text-lg font-bold ${
            status === 'won'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {status === 'won' ? t.youWon : t.youLost}
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
          <span className="font-medium text-red-600 dark:text-red-400">{wrongCount}/{MAX_WRONG}</span>
        </div>

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
