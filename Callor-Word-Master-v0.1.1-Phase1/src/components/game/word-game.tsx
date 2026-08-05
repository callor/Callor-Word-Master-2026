"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Code2, Flame, Moon, Pause, Play, RotateCcw, Sun, Trophy, UserRound } from "lucide-react";
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
const LANES = [18, 50, 82];

const INITIAL_WORDS: FallingWord[] = PLAY_WORDS.slice(0, 3).map((word, index) => ({
  id: index + 1,
  word,
  meaning: "",
  phase: "english",
  lane: LANES[index],
  y: 5 + index * 13,
  speed: 0.105 + index * 0.008,
  burst: false,
}));

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

export function WordGame() {
  const [fallingWords, setFallingWords] = useState<FallingWord[]>(INITIAL_WORDS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [cleared, setCleared] = useState(0);
  const [missed, setMissed] = useState(0);
  const [feedback, setFeedback] = useState("화면의 영단어 중 하나를 선택해 입력하세요");
  const [theme, setTheme] = useState<Theme>("light");
  const [paused, setPaused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<FallingWord[]>(INITIAL_WORDS);
  const selectedIdRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const nextIdRef = useRef(4);
  const lastMeaningRef = useRef<Record<string, string>>({});
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const commitWords = (next: FallingWord[]) => {
    wordsRef.current = next;
    setFallingWords(next);
  };

  const replacement = (lane: number, current: FallingWord[]) => {
    const nextWord = pickWord(current.map((item) => item.word.english));
    return {
      id: nextIdRef.current++,
      word: nextWord,
      meaning: "",
      phase: "english" as const,
      lane,
      y: -8 - Math.random() * 12,
      speed: 0.1 + Math.random() * 0.025,
      burst: false,
    };
  };

  useEffect(() => {
    const saved = localStorage.getItem("callor-word-master-theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = saved === "dark" || saved === "light" ? saved : preferred;
    document.documentElement.dataset.theme = initial;
    const id = requestAnimationFrame(() => setTheme(initial));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (pausedRef.current) return;

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
        setLives((value) => Math.max(0, value - missCount));
        if (selectedMissed) {
          selectedIdRef.current = null;
          setSelectedId(null);
          setInput("");
        }
        setFeedback(missCount > 1 ? `${missCount}개 단어를 놓쳤어요. 다음 단어에 집중하세요!` : "단어를 놓쳤어요. 다음 단어에 집중하세요!");
      }
      commitWords(next);
    }, 40);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("callor-word-master-theme", next);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const answer = input.trim();
    if (!answer || paused) return;

    if (selectedId === null) {
      const target = wordsRef.current.find(
        (item) => item.phase === "english" && item.word.english.toLowerCase() === answer.toLowerCase(),
      );
      if (!target) {
        setFeedback("내려오는 단어 중 하나의 철자를 다시 확인해 보세요");
        setInput("");
        return;
      }

      const meaning = pickMeaning(target.word, lastMeaningRef.current[target.word.english]);
      lastMeaningRef.current[target.word.english] = meaning;
      const next = wordsRef.current.map((item) => item.id === target.id ? { ...item, meaning, phase: "meaning" as const } : item);
      commitWords(next);
      selectedIdRef.current = target.id;
      setSelectedId(target.id);
      setFeedback("선택한 단어의 한글 뜻을 입력하세요");
      setInput("");
      return;
    }

    const target = wordsRef.current.find((item) => item.id === selectedId);
    if (!target) return;
    if (answer.replaceAll(" ", "") !== target.meaning.replaceAll(" ", "")) {
      setFeedback("선택된 단어에 표시된 한글 뜻을 그대로 입력해 주세요");
      setInput("");
      return;
    }

    const clearedWords = wordsRef.current.map((item) => item.id === target.id ? { ...item, phase: "cleared" as const, burst: true } : item);
    commitWords(clearedWords);
    setScore((value) => value + 10);
    setCombo((value) => value + 1);
    setCleared((value) => value + 1);
    setFeedback("완벽해요! 새로운 단어가 곧 나타납니다. +10 포인트");
    setInput("");
    selectedIdRef.current = null;
    setSelectedId(null);

    const timeout = setTimeout(() => {
      const current = wordsRef.current;
      const next = current.map((item) => item.id === target.id ? replacement(item.lane, current) : item);
      commitWords(next);
      requestAnimationFrame(() => inputRef.current?.focus());
    }, 680);
    timeoutsRef.current.push(timeout);
  };

  const togglePause = () => {
    const next = !paused;
    pausedRef.current = next;
    setPaused(next);
    setFeedback(next ? "게임을 잠시 멈췄습니다" : selectedIdRef.current ? "선택한 단어의 한글 뜻을 입력하세요" : "화면의 영단어 중 하나를 선택해 입력하세요");
    if (!next) requestAnimationFrame(() => inputRef.current?.focus());
  };

  const resetGame = () => {
    const fresh = INITIAL_WORDS.map((item) => ({ ...item }));
    commitWords(fresh);
    selectedIdRef.current = null;
    setSelectedId(null);
    setInput("");
    setScore(0);
    setCombo(0);
    setLives(3);
    setCleared(0);
    setMissed(0);
    setFeedback("화면의 영단어 중 하나를 선택해 입력하세요");
  };

  const selectedWord = fallingWords.find((item) => item.id === selectedId);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Callor Word Master">
          <span className="brand-mark"><Flame size={21} strokeWidth={2.3} /></span>
          <span><strong>Callor</strong> Word Master</span>
        </div>
        <nav className="top-actions" aria-label="사용자 메뉴">
          <span className="word-count">동시 출제 <strong>3</strong> · 기본 단어 <strong>200</strong></span>
          <button className="icon-button" onClick={toggleTheme} aria-label={theme === "light" ? "다크 테마" : "라이트 테마"}>
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <button className="login-button" type="button"><UserRound size={17} /> 로그인 <span>예정</span></button>
        </nav>
      </header>

      <section className="game-layout">
        <aside className="side-panel intro-panel">
          <p className="eyebrow">MULTI WORD PRACTICE</p>
          <h1>원하는 단어부터,<br /><em>선택해 완성하세요.</em></h1>
          <p className="intro-copy">동시에 내려오는 여러 영단어 중 하나를 골라 입력하고, 이어서 나타나는 한글 뜻을 타이핑합니다.</p>
          <div className="steps" aria-label="게임 단계">
            <div className={selectedId === null ? "step active" : "step"}><span>1</span><div><strong>단어 선택</strong><small>보이는 영단어 중 하나를 입력</small></div></div>
            <div className={selectedId !== null ? "step active" : "step"}><span>2</span><div><strong>한글 타이핑</strong><small>선택한 단어의 뜻을 입력</small></div></div>
            <div className="step"><span>3</span><div><strong>기억 완성</strong><small>단어 하나마다 10점 획득</small></div></div>
          </div>
        </aside>

        <section className="game-card" aria-label="다중 단어 타자 연습 게임">
          <div className="scorebar">
            <div><small>POINT</small><strong>{score.toLocaleString()}</strong></div>
            <div><small>COMBO</small><strong>{combo}<span>x</span></strong></div>
            <div><small>LIFE</small><strong className="lives" aria-label={`남은 기회 ${lives}`}>{"●".repeat(lives)}{"○".repeat(Math.max(0, 3-lives))}</strong></div>
            <button onClick={togglePause} className="round-control" aria-label={paused ? "계속하기" : "일시정지"}>
              {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
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
                {item.burst && <span className="burst" aria-hidden="true">{Array.from({ length: 10 }).map((_, index) => <i key={index} />)}</span>}
                <span className="english-word">{item.word.english}</span>
                {item.meaning && <span className="meaning-word">{item.meaning}</span>}
              </div>
            ))}
            <div className="danger-line"><span>LIMIT LINE</span></div>
            {paused && <div className="pause-layer"><Pause size={28} /><strong>PAUSED</strong><span>계속 버튼을 눌러 주세요</span></div>}
          </div>

          <form className="typing-panel" onSubmit={submit}>
            <div className="phase-badge">{selectedWord ? "2 / 2" : "1 / 2"}</div>
            <label htmlFor="typing-input">
              <span>{selectedWord ? "선택된 단어의 한글 뜻" : "영단어 선택 타이핑"}</span>
              <input
                ref={inputRef}
                id="typing-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={selectedWord ? `“${selectedWord.meaning}” 입력` : "화면의 영단어 중 하나 입력"}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={paused || selectedWord?.phase === "cleared"}
                autoFocus
              />
            </label>
            <button type="submit" disabled={paused}>ENTER</button>
          </form>
          <p className={`feedback ${feedback.includes("다시") || feedback.includes("놓쳤") ? "warning" : ""}`} aria-live="polite">{feedback}</p>
        </section>

        <aside className="side-panel stats-panel">
          <div className="level-card">
            <span className="level-icon"><Trophy size={21} /></span>
            <div><small>CURRENT LEVEL</small><strong>BEGINNER · 3 WORDS</strong></div>
          </div>
          <div className="today-card">
            <div className="card-heading"><span>오늘의 기록</span><button onClick={resetGame} aria-label="기록 초기화"><RotateCcw size={16} /></button></div>
            <dl><div><dt>클리어</dt><dd>{cleared}<small>단어</small></dd></div><div><dt>놓친 단어</dt><dd>{missed}<small>단어</small></dd></div><div><dt>정확도</dt><dd>{cleared + missed ? Math.round(cleared / (cleared + missed) * 100) : 100}<small>%</small></dd></div></dl>
          </div>
          <div className="coming-card">
            <div className="provider-icons"><span>G</span><span><Code2 size={18} /></span><span>Ka</span><span>N</span></div>
            <strong>회원 기능은 2단계에서</strong>
            <p>Google·GitHub 로그인과 PostgreSQL 기록 저장이 연결됩니다.</p>
          </div>
        </aside>
      </section>

      <footer className="footer-note"><span>다중 영단어</span><i /> <span>선택 타이핑</span><i /> <span>한글 뜻 암기</span><b>Prototype v0.1.1</b></footer>
    </main>
  );
}
