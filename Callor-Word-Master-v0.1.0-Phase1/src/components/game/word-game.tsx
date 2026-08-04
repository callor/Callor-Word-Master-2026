"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Code2, Flame, Moon, Pause, Play, RotateCcw, Sun, Trophy, UserRound } from "lucide-react";
import { conversationWords, type ConversationWord } from "@/data/conversation-words";

type Phase = "english" | "meaning" | "cleared" | "paused";
type Theme = "light" | "dark";

const PLAY_WORDS = conversationWords.filter((word) => word.difficulty === "BEGINNER");

function pickWord(previous?: string): ConversationWord {
  const candidates = PLAY_WORDS.filter((word) => word.english !== previous);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickMeaning(word: ConversationWord, previous?: string) {
  const candidates = word.meanings.filter((meaning) => meaning !== previous);
  const pool = candidates.length ? candidates : word.meanings;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function WordGame() {
  const [word, setWord] = useState(() => PLAY_WORDS[0]);
  const [meaning, setMeaning] = useState("");
  const [phase, setPhase] = useState<Phase>("english");
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [cleared, setCleared] = useState(0);
  const [missed, setMissed] = useState(0);
  const [feedback, setFeedback] = useState("영단어를 입력해 보세요");
  const [theme, setTheme] = useState<Theme>("light");
  const [x, setX] = useState(50);
  const [y, setY] = useState(4);
  const [burst, setBurst] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const yRef = useRef(4);
  const phaseRef = useRef<Phase>("english");
  const wordRef = useRef(word);
  const lastMeaningRef = useRef<Record<string, string>>({});
  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("callor-word-master-theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = saved === "dark" || saved === "light" ? saved : preferred;
    document.documentElement.dataset.theme = initial;
    const id = requestAnimationFrame(() => setTheme(initial));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    wordRef.current = word;
  }, [word]);

  const spawnWord = useCallback((previous?: string) => {
    const next = pickWord(previous);
    wordRef.current = next;
    setWord(next);
    setMeaning("");
    setInput("");
    setPhase("english");
    phaseRef.current = "english";
    setFeedback("영단어를 입력해 보세요");
    const nextY = 4;
    yRef.current = nextY;
    setY(nextY);
    setX(18 + Math.random() * 64);
    setBurst(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const missWord = useCallback(() => {
    setMissed((value) => value + 1);
    setCombo(0);
    setLives((value) => {
      const next = Math.max(0, value - 1);
      if (next === 0) setFeedback("괜찮아요. 다시 시작하면 됩니다!");
      return next;
    });
    spawnWord(wordRef.current.english);
  }, [spawnWord]);

  useEffect(() => {
    const tick = (time: number) => {
      if (lastFrameRef.current === null) lastFrameRef.current = time;
      const delta = Math.min(50, time - lastFrameRef.current);
      lastFrameRef.current = time;
      if (phaseRef.current === "english" || phaseRef.current === "meaning") {
        const nextY = yRef.current + delta * 0.0039;
        yRef.current = nextY;
        setY(nextY);
        if (nextY >= 79) missWord();
      }
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [missWord]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("callor-word-master-theme", next);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const answer = input.trim();
    if (!answer || phase === "paused" || phase === "cleared") return;

    if (phase === "english") {
      if (answer.toLowerCase() !== word.english.toLowerCase()) {
        setFeedback("철자를 다시 확인해 보세요");
        setInput("");
        return;
      }
      const selected = pickMeaning(word, lastMeaningRef.current[word.english]);
      lastMeaningRef.current[word.english] = selected;
      setMeaning(selected);
      setPhase("meaning");
      setFeedback("좋아요! 보이는 한글 뜻을 입력하세요");
      setInput("");
      return;
    }

    if (answer.replaceAll(" ", "") !== meaning.replaceAll(" ", "")) {
      setFeedback("화면의 한글 뜻을 그대로 입력해 주세요");
      setInput("");
      return;
    }

    setPhase("cleared");
    setBurst(true);
    setScore((value) => value + 10);
    setCombo((value) => value + 1);
    setCleared((value) => value + 1);
    setFeedback("완벽해요! +10 포인트");
    setTimeout(() => spawnWord(word.english), 720);
  };

  const togglePause = () => {
    if (phase === "cleared") return;
    if (phase === "paused") {
      setPhase(meaning ? "meaning" : "english");
      setFeedback(meaning ? "한글 뜻 입력을 계속하세요" : "영단어 입력을 계속하세요");
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setPhase("paused");
      setFeedback("게임을 잠시 멈췄습니다");
    }
  };

  const resetGame = () => {
    setScore(0);
    setCombo(0);
    setLives(3);
    setCleared(0);
    setMissed(0);
    spawnWord(word.english);
  };

  const progress = useMemo(() => `${Math.round(Math.max(0, 100 - y))}%`, [y]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Callor Word Master">
          <span className="brand-mark"><Flame size={21} strokeWidth={2.3} /></span>
          <span><strong>Callor</strong> Word Master</span>
        </div>
        <nav className="top-actions" aria-label="사용자 메뉴">
          <span className="word-count">기본 단어 <strong>200</strong></span>
          <button className="icon-button" onClick={toggleTheme} aria-label={theme === "light" ? "다크 테마" : "라이트 테마"}>
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <button className="login-button" type="button"><UserRound size={17} /> 로그인 <span>예정</span></button>
        </nav>
      </header>

      <section className="game-layout">
        <aside className="side-panel intro-panel">
          <p className="eyebrow">DAILY PRACTICE</p>
          <h1>두 번 타이핑하고,<br /><em>한 번 더 기억하세요.</em></h1>
          <p className="intro-copy">떨어지는 영단어와 무작위로 나타나는 한글 뜻을 순서대로 입력합니다.</p>
          <div className="steps" aria-label="게임 단계">
            <div className={phase === "english" ? "step active" : "step"}><span>1</span><div><strong>영문 타이핑</strong><small>철자를 정확하게 입력</small></div></div>
            <div className={phase === "meaning" ? "step active" : "step"}><span>2</span><div><strong>한글 타이핑</strong><small>표시된 뜻을 입력</small></div></div>
            <div className={phase === "cleared" ? "step active" : "step"}><span>3</span><div><strong>기억 완성</strong><small>불꽃과 함께 10점 획득</small></div></div>
          </div>
        </aside>

        <section className="game-card" aria-label="타자 연습 게임">
          <div className="scorebar">
            <div><small>POINT</small><strong>{score.toLocaleString()}</strong></div>
            <div><small>COMBO</small><strong>{combo}<span>x</span></strong></div>
            <div><small>LIFE</small><strong className="lives" aria-label={`남은 기회 ${lives}`}>{"●".repeat(lives)}{"○".repeat(3-lives)}</strong></div>
            <button onClick={togglePause} className="round-control" aria-label={phase === "paused" ? "계속하기" : "일시정지"}>
              {phase === "paused" ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
            </button>
          </div>

          <div className="fall-zone">
            <div className="sky-glow" />
            <div className="remaining" style={{ width: progress }} />
            <span className="zone-label">TYPE BEFORE THE LINE</span>
            <div className={`falling-word phase-${phase}`} style={{ left: `${x}%`, top: `${y}%` }}>
              {burst && <span className="burst" aria-hidden="true">{Array.from({ length: 10 }).map((_, index) => <i key={index} />)}</span>}
              <span className="english-word">{word.english}</span>
              {meaning && <span className="meaning-word">{meaning}</span>}
            </div>
            <div className="danger-line"><span>LIMIT LINE</span></div>
            {phase === "paused" && <div className="pause-layer"><Pause size={28} /><strong>PAUSED</strong><span>계속 버튼을 눌러 주세요</span></div>}
          </div>

          <form className="typing-panel" onSubmit={submit}>
            <div className="phase-badge">{phase === "meaning" ? "2 / 2" : "1 / 2"}</div>
            <label htmlFor="typing-input">
              <span>{phase === "meaning" ? "한글 뜻 타이핑" : "영단어 타이핑"}</span>
              <input
                ref={inputRef}
                id="typing-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={phase === "meaning" ? `“${meaning}” 입력` : "떨어지는 영단어 입력"}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={phase === "paused" || phase === "cleared"}
                autoFocus
              />
            </label>
            <button type="submit" disabled={phase === "paused" || phase === "cleared"}>ENTER</button>
          </form>
          <p className={`feedback ${feedback.includes("다시") ? "warning" : ""}`} aria-live="polite">{feedback}</p>
        </section>

        <aside className="side-panel stats-panel">
          <div className="level-card">
            <span className="level-icon"><Trophy size={21} /></span>
            <div><small>CURRENT LEVEL</small><strong>BEGINNER</strong></div>
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

      <footer className="footer-note"><span>영문 타자</span><i /> <span>한글 타자</span><i /> <span>단어 암기</span><b>Prototype v0.1</b></footer>
    </main>
  );
}
