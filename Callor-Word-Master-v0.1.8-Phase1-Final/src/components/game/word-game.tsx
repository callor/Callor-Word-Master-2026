"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Code2,
  Flame,
  Gamepad2,
  Maximize2,
  Minimize2,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sun,
  Trophy,
  UserRound,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { conversationWords, type ConversationWord } from "@/data/conversation-words";

type Theme = "light" | "dark";
type WordPhase = "english" | "meaning" | "cleared";

type FallingWord = {
  id: number;
  word: ConversationWord;
  meaning: string;
  phase: WordPhase;
  lane: number;
  y: number;
  speed: number;
  burst: boolean;
};

const PLAY_WORDS = conversationWords.filter((word) => word.difficulty === "BEGINNER");
const MAX_LIVES = 5;

const LANES = [12, 27, 42, 58, 73, 88];

function randomWordSpeed() {
  const tier = Math.random();
  if (tier < 0.3) return 0.075 + Math.random() * 0.045;
  if (tier < 0.75) return 0.13 + Math.random() * 0.065;
  return 0.22 + Math.random() * 0.09;
}

const INITIAL_WORDS: FallingWord[] = PLAY_WORDS.slice(0, 6).map((word, index) => ({
  id: index + 1,
  word,
  meaning: "",
  phase: "english",
  lane: LANES[index],
  y: 4 + (index % 3) * 12,
  speed: 0.15 + index * 0.005,
  burst: false,
}));

function createRandomStartingWords(): FallingWord[] {
  const pool = [...PLAY_WORDS];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[target]] = [pool[target], pool[index]];
  }
  return pool.slice(0, 6).map((word, index) => ({
    id: index + 1,
    word,
    meaning: "",
    phase: "english",
    lane: 7 + Math.random() * 86,
    y: -18 + Math.random() * 42,
    speed: randomWordSpeed(),
    burst: false,
  }));
}

function pickWord(excluded: string[]) {
  const candidates = PLAY_WORDS.filter((word) => !excluded.includes(word.english));
  const pool = candidates.length ? candidates : PLAY_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickMeaning(word: ConversationWord, previous?: string) {
  const candidates = word.meanings.filter((meaning) => meaning !== previous);
  const pool = candidates.length ? candidates : word.meanings;
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomSpawnDelay() {
  return 320 + Math.random() * 720;
}

export function WordGame() {
  const [fallingWords, setFallingWords] = useState<FallingWord[]>(INITIAL_WORDS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [cleared, setCleared] = useState(0);
  const [missed, setMissed] = useState(0);
  const [feedback, setFeedback] = useState("화면의 영단어 중 하나를 선택해 입력하세요");
  const [theme, setTheme] = useState<Theme>("light");
  const [wordFontSize, setWordFontSize] = useState(12);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<FallingWord[]>(INITIAL_WORDS);
  const selectedIdRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const gameOverRef = useRef(false);
  const livesRef = useRef(MAX_LIVES);
  const soundEnabledRef = useRef(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextIdRef = useRef(7);
  const recentWordsRef = useRef<string[]>(INITIAL_WORDS.map((item) => item.word.english));
  const lastMeaningRef = useRef<Record<string, string>>({});
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const commitWords = (next: FallingWord[]) => {
    wordsRef.current = next;
    setFallingWords(next);
  };

  const focusTypingInput = () => {
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
  };

  const playTone = (frequency: number, duration = 0.09) => {
    if (!soundEnabledRef.current) return;
    const context = audioContextRef.current ?? new window.AudioContext();
    audioContextRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.06, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };

  const replacement = (lane: number, current: FallingWord[]) => {
    const nextWord = pickWord([
      ...current.map((item) => item.word.english),
      ...recentWordsRef.current,
    ]);
    recentWordsRef.current = [...recentWordsRef.current, nextWord.english].slice(-30);
    return {
      id: nextIdRef.current++,
      word: nextWord,
      meaning: "",
      phase: "english" as const,
      lane: Math.max(7, Math.min(93, lane + (Math.random() - 0.5) * 34)),
      y: -7 - Math.random() * 30,
      speed: randomWordSpeed(),
      burst: false,
    };
  };

  useEffect(() => {
    const saved = localStorage.getItem("callor-word-master-theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = saved === "dark" || saved === "light" ? saved : preferred;
    const savedFontSize = Number(localStorage.getItem("callor-word-master-font-size"));
    const initialFontSize = [10, 12, 15, 20, 25].includes(savedFontSize) ? savedFontSize : 12;
    const initialSound = localStorage.getItem("callor-word-master-sound") !== "off";
    const initialEffects = localStorage.getItem("callor-word-master-effects") !== "off";
    const tutorialSeen = localStorage.getItem("callor-word-master-tutorial-seen") === "yes";
    document.documentElement.dataset.theme = initial;
    const id = requestAnimationFrame(() => {
      setTheme(initial);
      setWordFontSize(initialFontSize);
      setSoundEnabled(initialSound);
      soundEnabledRef.current = initialSound;
      setEffectsEnabled(initialEffects);
      if (!tutorialSeen) {
        setShowTutorial(true);
        setPaused(true);
        pausedRef.current = true;
      }
      const randomized = createRandomStartingWords();
      wordsRef.current = randomized;
      recentWordsRef.current = randomized.map((item) => item.word.english);
      setFallingWords(randomized);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (pausedRef.current || gameOverRef.current) return;

      const current = wordsRef.current;
      let missCount = 0;
      let selectedMissed = false;
      const next = current.map((item) => {
        if (item.phase === "cleared") return item;
        const y = item.y + item.speed;
        if (y < 79) return { ...item, y };
        missCount += 1;
        if (selectedIdRef.current === item.id) selectedMissed = true;
        return replacement(item.lane, current);
      });

      if (missCount) {
        setMissed((value) => value + missCount);
        setCombo(0);
        const nextLives = Math.max(0, livesRef.current - missCount);
        livesRef.current = nextLives;
        setLives(nextLives);
        if (nextLives === 0) {
          gameOverRef.current = true;
          pausedRef.current = true;
          setGameOver(true);
          setPaused(true);
        }
        if (selectedMissed) {
          selectedIdRef.current = null;
          setSelectedId(null);
          setInput("");
        }
        setFeedback(
          livesRef.current === 0
            ? "게임 오버! 결과를 확인하고 다시 도전하세요."
            : missCount > 1
              ? `${missCount}개 단어를 놓쳤어요. 다음 단어에 집중하세요!`
              : "단어를 놓쳤어요. 다음 단어에 집중하세요!",
        );
      }
      commitWords(next);
    }, 40);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !gameOverRef.current) {
        pausedRef.current = true;
        setPaused(true);
        setFeedback("화면을 벗어나 게임이 자동으로 일시정지되었습니다");
      }
    };
    const handleFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("callor-word-master-theme", next);
  };

  const changeWordFontSize = (size: number) => {
    setWordFontSize(size);
    localStorage.setItem("callor-word-master-font-size", String(size));
    focusTypingInput();
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEnabledRef.current = next;
    localStorage.setItem("callor-word-master-sound", next ? "on" : "off");
    if (next) requestAnimationFrame(() => playTone(520));
  };

  const toggleEffects = () => {
    const next = !effectsEnabled;
    setEffectsEnabled(next);
    localStorage.setItem("callor-word-master-effects", next ? "on" : "off");
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  };

  const closeTutorial = () => {
    localStorage.setItem("callor-word-master-tutorial-seen", "yes");
    setShowTutorial(false);
    pausedRef.current = gameOverRef.current;
    setPaused(gameOverRef.current);
    if (!gameOverRef.current) focusTypingInput();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const answer = input.trim();
    if (!answer || paused || gameOver) return;

    if (selectedId === null) {
      const target = wordsRef.current.find(
        (item) =>
          item.phase === "english" && item.word.english.toLowerCase() === answer.toLowerCase(),
      );
      if (!target) {
        playTone(180, 0.12);
        setFeedback("내려오는 단어 중 하나의 철자를 다시 확인해 보세요");
        setInput("");
        focusTypingInput();
        return;
      }

      const meaning = pickMeaning(target.word, lastMeaningRef.current[target.word.english]);
      lastMeaningRef.current[target.word.english] = meaning;
      const next = wordsRef.current.map((item) =>
        item.id === target.id ? { ...item, meaning, phase: "meaning" as const } : item,
      );
      commitWords(next);
      selectedIdRef.current = target.id;
      setSelectedId(target.id);
      setFeedback("선택한 단어의 한글 뜻을 입력하세요");
      setInput("");
      playTone(440);
      focusTypingInput();
      return;
    }

    const target = wordsRef.current.find((item) => item.id === selectedId);
    if (!target) return;
    if (answer.replaceAll(" ", "") !== target.meaning.replaceAll(" ", "")) {
      playTone(180, 0.12);
      setFeedback("선택된 단어에 표시된 한글 뜻을 그대로 입력해 주세요");
      setInput("");
      focusTypingInput();
      return;
    }

    const clearedWords = wordsRef.current.map((item) =>
      item.id === target.id ? { ...item, phase: "cleared" as const, burst: true } : item,
    );
    commitWords(clearedWords);
    setScore((value) => value + 10);
    setCombo((value) => value + 1);
    setCleared((value) => value + 1);
    setFeedback("완벽해요! 새로운 단어가 곧 나타납니다. +10 포인트");
    setInput("");
    selectedIdRef.current = null;
    setSelectedId(null);
    playTone(740, 0.16);
    navigator.vibrate?.(35);
    focusTypingInput();

    const timeout = setTimeout(() => {
      const current = wordsRef.current;
      const next = current.map((item) =>
        item.id === target.id ? replacement(item.lane, current) : item,
      );
      commitWords(next);
      focusTypingInput();
    }, randomSpawnDelay());
    timeoutsRef.current.push(timeout);
  };

  const togglePause = () => {
    if (gameOver || showTutorial) return;
    const next = !paused;
    pausedRef.current = next;
    setPaused(next);
    setFeedback(
      next
        ? "게임을 잠시 멈췄습니다"
        : selectedIdRef.current
          ? "선택한 단어의 한글 뜻을 입력하세요"
          : "화면의 영단어 중 하나를 선택해 입력하세요",
    );
    if (!next) focusTypingInput();
  };

  const resetGame = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    const fresh = createRandomStartingWords();
    recentWordsRef.current = fresh.map((item) => item.word.english);
    commitWords(fresh);
    selectedIdRef.current = null;
    setSelectedId(null);
    setInput("");
    setScore(0);
    setCombo(0);
    setLives(3);
    livesRef.current = MAX_LIVES;
    setGameOver(false);
    gameOverRef.current = false;
    setPaused(false);
    pausedRef.current = false;
    setCleared(0);
    setMissed(0);
    setFeedback("화면의 영단어 중 하나를 선택해 입력하세요");
    focusTypingInput();
  };

  const selectedWord = fallingWords.find((item) => item.id === selectedId);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Callor Word Master">
          <span className="brand-mark">
            <Flame size={21} strokeWidth={2.3} />
          </span>
          <span>
            <strong>Callor</strong> Word Master
          </span>
        </div>
        <nav className="top-actions" aria-label="사용자 메뉴">
          <span className="word-count">
            동시 출제 <strong>6</strong> · 기본 단어 <strong>200</strong>
          </span>
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "다크 테마" : "라이트 테마"}
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <button className="login-button" type="button">
            <UserRound size={17} /> 로그인 <span>예정</span>
          </button>
        </nav>
      </header>

      <section className="game-layout">
        <aside className="side-panel intro-panel">
          <div className="brand-hero-mark">
            <Flame size={30} strokeWidth={2.2} />
          </div>
          <p className="eyebrow">ENGLISH · KOREAN · MEMORY</p>
          <h1>
            <em>Callor</em>
            <br />
            Word Master
          </h1>
          <p className="intro-copy">
            영문 타자와 한글 타자를 함께 연습하며 회화 단어를 자연스럽게 기억하는 타이핑 게임입니다.
          </p>
          <div className="steps" aria-label="게임 단계">
            <div className={selectedId === null ? "step active" : "step"}>
              <span>1</span>
              <div>
                <strong>단어 선택</strong>
                <small>보이는 영단어 중 하나를 입력</small>
              </div>
            </div>
            <div className={selectedId !== null ? "step active" : "step"}>
              <span>2</span>
              <div>
                <strong>한글 타이핑</strong>
                <small>선택한 단어의 뜻을 입력</small>
              </div>
            </div>
            <div className="step">
              <span>3</span>
              <div>
                <strong>기억 완성</strong>
                <small>단어 하나마다 10점 획득</small>
              </div>
            </div>
          </div>
        </aside>

        <section
          className={`game-card${effectsEnabled ? "" : " effects-off"}`}
          aria-label="다중 단어 타자 연습 게임"
        >
          <div className="scorebar">
            <div>
              <small>POINT</small>
              <strong>{score.toLocaleString()}</strong>
            </div>
            <div>
              <small>COMBO</small>
              <strong>
                {combo}
                <span>x</span>
              </strong>
            </div>
            <div>
              <small>LIFE</small>
              <strong className="lives" aria-label={`남은 기회 ${lives}`}>
                {"●".repeat(lives)}
                {"○".repeat(Math.max(0, MAX_LIVES - lives))}
              </strong>
            </div>
            <button
              onClick={togglePause}
              className="round-control"
              aria-label={paused ? "계속하기" : "일시정지"}
            >
              {paused ? (
                <Play size={18} fill="currentColor" />
              ) : (
                <Pause size={18} fill="currentColor" />
              )}
            </button>
          </div>

          <div className="fall-zone">
            <div className="sky-glow" />
            <span className="zone-label">TYPE ANY WORD BEFORE THE LINE</span>
            {fallingWords.map((item) => (
              <div
                key={item.id}
                className={`falling-word phase-${item.phase}${item.id === selectedId ? " selected" : ""}`}
                style={{ left: `${item.lane}%`, top: `${item.y}%` }}
              >
                {item.burst && effectsEnabled && (
                  <span className="burst" aria-hidden="true">
                    {Array.from({ length: 16 }).map((_, index) => (
                      <i key={index} />
                    ))}
                  </span>
                )}
                <span className="english-word" style={{ fontSize: `${wordFontSize}pt` }}>
                  {item.word.english}
                </span>
                {item.meaning && (
                  <span className="meaning-word" style={{ fontSize: `${wordFontSize}pt` }}>
                    {item.meaning}
                  </span>
                )}
              </div>
            ))}
            <div className="danger-line">
              <span>LIMIT LINE</span>
            </div>
            {paused && !gameOver && !showTutorial && (
              <div className="pause-layer">
                <Pause size={28} />
                <strong>PAUSED</strong>
                <span>계속 버튼을 눌러 주세요</span>
              </div>
            )}
            {gameOver && (
              <div className="game-over-layer">
                <Gamepad2 size={34} />
                <small>FINAL SCORE</small>
                <strong>{score.toLocaleString()}</strong>
                <p>
                  {cleared}개 클리어 · 콤보 {combo}
                </p>
                <button type="button" onClick={resetGame}>
                  <RotateCcw size={16} /> 다시 시작
                </button>
              </div>
            )}
          </div>

          <form className="typing-panel" onSubmit={submit}>
            <div className="phase-badge">{selectedWord ? "2 / 2" : "1 / 2"}</div>
            <label htmlFor="typing-input">
              <span className="input-label">
                {selectedWord ? "선택된 단어의 한글 뜻" : "영단어 선택 타이핑"}
                <b className={selectedWord ? "ime-badge korean" : "ime-badge english"}>
                  {selectedWord ? "한글" : "ENG"}
                </b>
              </span>
              <input
                ref={inputRef}
                id="typing-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  selectedWord ? `“${selectedWord.meaning}” 입력` : "화면의 영단어 중 하나 입력"
                }
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                lang={selectedWord ? "ko" : "en"}
                inputMode="text"
                enterKeyHint="done"
                aria-label={selectedWord ? "한글 뜻 입력" : "영단어 입력"}
                disabled={paused || gameOver || selectedWord?.phase === "cleared"}
                autoFocus
                onBlur={(event) => {
                  const nextTarget = event.relatedTarget as HTMLElement | null;
                  if (!paused && !nextTarget?.closest("button")) focusTypingInput();
                }}
              />
            </label>
            <button type="submit" disabled={paused}>
              ENTER
            </button>
          </form>
          <p
            className={`feedback ${feedback.includes("다시") || feedback.includes("놓쳤") ? "warning" : ""}`}
            aria-live="polite"
          >
            {feedback}
          </p>
        </section>

        <aside className="side-panel stats-panel">
          <div className="level-card">
            <span className="level-icon">
              <Trophy size={21} />
            </span>
            <div>
              <small>CURRENT LEVEL</small>
              <strong>BEGINNER · 6 WORDS</strong>
            </div>
          </div>
          <div className="font-card">
            <div className="card-heading">
              <span>단어 글자 크기</span>
              <strong>{wordFontSize}pt</strong>
            </div>
            <div className="font-options" role="group" aria-label="단어 글자 크기 선택">
              {[10, 12, 15, 20, 25].map((size) => (
                <button
                  key={size}
                  className={wordFontSize === size ? "active" : ""}
                  onClick={() => changeWordFontSize(size)}
                  type="button"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-card">
            <div className="card-heading">
              <span>플레이 설정</span>
              <button
                type="button"
                onClick={() => {
                  setShowTutorial(true);
                  pausedRef.current = true;
                  setPaused(true);
                }}
                aria-label="게임 방법 보기"
              >
                ?
              </button>
            </div>
            <div className="setting-actions">
              <button type="button" className={soundEnabled ? "active" : ""} onClick={toggleSound}>
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />} 소리
              </button>
              <button
                type="button"
                className={effectsEnabled ? "active" : ""}
                onClick={toggleEffects}
              >
                <Sparkles size={15} /> 효과
              </button>
              <button type="button" onClick={toggleFullscreen}>
                {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />} 전체화면
              </button>
            </div>
          </div>
          <div className="today-card">
            <div className="card-heading">
              <span>오늘의 기록</span>
              <button onClick={resetGame} aria-label="기록 초기화">
                <RotateCcw size={16} />
              </button>
            </div>
            <dl>
              <div>
                <dt>클리어</dt>
                <dd>
                  {cleared}
                  <small>단어</small>
                </dd>
              </div>
              <div>
                <dt>놓친 단어</dt>
                <dd>
                  {missed}
                  <small>단어</small>
                </dd>
              </div>
              <div>
                <dt>정확도</dt>
                <dd>
                  {cleared + missed ? Math.round((cleared / (cleared + missed)) * 100) : 100}
                  <small>%</small>
                </dd>
              </div>
            </dl>
          </div>
          <div className="coming-card">
            <div className="provider-icons">
              <span>G</span>
              <span>
                <Code2 size={18} />
              </span>
              <span>Ka</span>
              <span>N</span>
            </div>
            <strong>회원 기능은 2단계에서</strong>
            <p>Google·GitHub 로그인과 PostgreSQL 기록 저장이 연결됩니다.</p>
          </div>
        </aside>
      </section>

      <footer className="footer-note">
        <span>CopyRight HanQube Solution</span>
        <i />
        <a href="mailto:callor@callor.com">callor@callor.com</a>
        <b>Callor Word Master v0.1.8 · Phase 1 Final</b>
      </footer>
      {showTutorial && (
        <div
          className="tutorial-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutorial-title"
        >
          <div className="tutorial-card">
            <button
              className="tutorial-close"
              type="button"
              onClick={closeTutorial}
              aria-label="게임 방법 닫기"
            >
              <X size={18} />
            </button>
            <span className="tutorial-icon">
              <Flame size={28} />
            </span>
            <p className="eyebrow">HOW TO PLAY</p>
            <h2 id="tutorial-title">두 번 타이핑하면 기억 완성!</h2>
            <ol>
              <li>
                <b>영단어 선택</b>
                <span>내려오는 단어 중 하나를 영문으로 입력합니다.</span>
              </li>
              <li>
                <b>한글 뜻 입력</b>
                <span>무작위로 나온 한글 뜻을 그대로 입력합니다.</span>
              </li>
              <li>
                <b>폭발 &amp; 점수</b>
                <span>단어가 사라지고 10점이 쌓입니다. 제한선 전에 도전하세요.</span>
              </li>
            </ol>
            <button className="tutorial-start" type="button" onClick={closeTutorial}>
              게임 시작
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
