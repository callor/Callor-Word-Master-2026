"use client";
import { useState } from "react";
import { ArrowDown, ArrowRight, Flame, Keyboard, Play, Sparkles } from "lucide-react";
import { WordGame } from "./word-game";

export function GameLobby() {
  const [playing, setPlaying] = useState(false);
  if (playing) return <WordGame onExit={() => setPlaying(false)} />;
  return (
    <main className="lobby">
      <header className="lobby-header">
        <span className="lobby-brand"><span className="lobby-logo"><Flame size={25} /></span><span>Callor <strong>Word Master</strong></span></span>
        <span className="lobby-edition">TYPING ARCADE <span>VOL. 01</span></span>
      </header>
      <section className="lobby-hero" aria-labelledby="lobby-title">
        <div className="lobby-copy">
          <p className="lobby-kicker"><span /> PLAY. TYPE. REMEMBER.</p>
          <h1 id="lobby-title">손끝에서 터지는<br /><em>단어의 재미.</em></h1>
          <p className="lobby-description">떨어지는 영단어를 잡고, 한글 뜻으로 마무리!<br />두 번의 타이핑으로 단어 하나를 내 것으로 만드세요.</p>
          <button className="lobby-start" type="button" onClick={() => setPlaying(true)}><Play size={20} fill="currentColor" /> 게임 시작 <ArrowRight size={23} /></button>
          <p className="lobby-start-note"><Keyboard size={15} /> 영문 · 한글 타자연습과 단어 암기를 한 번에</p>
          <div className="lobby-facts" aria-label="게임 정보">
            <div><strong>200<span>개</span></strong><small>기본 회화 단어</small></div>
            <div><strong>6<span>개</span></strong><small>동시에 떨어지는 단어</small></div>
            <div><strong>+10<span>점</span></strong><small>단어 하나를 완성할 때마다</small></div>
          </div>
        </div>
        <div className="lobby-art" role="img" aria-label="영단어 spark와 한글 뜻 불꽃을 입력해 10점을 얻는 게임 예시">
          <div className="lobby-orbit orbit-one" /><div className="lobby-orbit orbit-two" />
          <span className="lobby-art-label"><span /> YOUR NEXT WORD</span>
          <span className="lobby-floating word-dream">dream <small>꿈</small></span>
          <span className="lobby-floating word-play">play <small>놀다</small></span>
          <span className="lobby-floating word-grow">grow <small>자라다</small></span>
          <div className="lobby-word-card"><span className="lobby-card-label">01 / ENGLISH</span><strong>spark<span>✦</span></strong><div className="lobby-word-divider"><ArrowDown size={18} /></div><span className="lobby-card-label">02 / 한글 뜻</span><b>불꽃<span className="lobby-cursor" /></b></div>
          <span className="lobby-score"><Sparkles size={19} /> PERFECT! <strong>+10</strong></span>
          <div className="lobby-keyboard">{["S", "P", "A", "R", "K"].map((key) => <kbd key={key}>{key}</kbd>)}<kbd className="lobby-enter">↵</kbd></div>
          <span className="lobby-art-caption">작은 타이핑이 쌓여, 더 큰 어휘가 됩니다.</span>
        </div>
      </section>
      <section className="lobby-guide" aria-label="게임 방법">
        <div className="lobby-guide-title"><span>HOW TO PLAY</span><h2>준비는 간단하게.<br />플레이는 신나게.</h2></div>
        <div className="lobby-step"><span>01</span><div><h3>영단어를 골라 입력</h3><p>떨어지는 단어 중 하나를 입력하고 Enter!</p></div></div>
        <div className="lobby-step"><span>02</span><div><h3>한글 뜻까지 완성</h3><p>단어에 나타난 뜻을 한글로 입력하세요.</p></div></div>
        <div className="lobby-step"><span>03</span><div><h3>팡! 터뜨리고 점수 획득</h3><p>제한선에 닿기 전에 완성하면 10점!</p></div></div>
      </section>
      <footer className="lobby-footer"><span>© HanQube Solution</span><span>조금씩, 매일 더 능숙하게.</span><a href="mailto:callor@callor.com">callor@callor.com</a></footer>
    </main>
  );
}
