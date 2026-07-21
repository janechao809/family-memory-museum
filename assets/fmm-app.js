/* 线上家庭记忆博物馆 · 共享前端数据层
 * 纯前端 localStorage 持久化，跨页面数据传递，无后端依赖
 * 部署到静态托管（dkfile.net）即可使用
 */
(function (global) {
  'use strict';
  var FMM_KEY = 'fmm_museum_v2';

  /* 默认数据骨架：5 件家庭展品的占位信息 */
  function defaultData() {
    return {
      museum: { name: '我们家的小博物馆', cover: 0, identity: '妈妈', privacy: 'family' },
      theme: { selected: '一件物品里的陪伴', discussion: { support: '', missing: '', confirm: '' }, customTheme: '' },
      exhibits: [
        { id: 'exhibit-001', owner: '妈妈', number: '01', name: '搪瓷杯', year: '约 1978', source: '外婆陪嫁', teller: '林雯',
          what: '一只白底红花的搪瓷杯，1978 年随外婆的陪嫁来到这个家。杯口有一处米粒大的掉瓷，露出黑色的铁胎。',
          story: '一杯热水，三十年。杯口缺了一小块瓷，是表哥小时候磕的。外婆没舍得换，说缺口也是日子的一部分。',
          meaning: '它装的不只是水，是三十个被提前等好的清晨。缺口不是破损，是日子在杯上留下的记号。',
          emotion: ['温暖'], visibility: 'family', photo: '', audio: '', label: '一杯热水，三十年。杯口缺了一小块瓷，是表哥小时候磕的。外婆没舍得换，说缺口也是日子的一部分。' },
        { id: 'exhibit-002', owner: '外婆', number: '02', name: '相册', year: '约 1980s', source: '外婆整理', teller: '外婆',
          what: '一本蓝布面的老式相册，丝脊已经磨毛，里面夹着黑白和褪色彩照。',
          story: '相册停在外婆四十岁那一年。那一页之后是空的，她说后面的日子都还在过着，不用拍。',
          meaning: '留下来的不是照片，是被照片接住的那段时间。',
          emotion: ['想念'], visibility: 'family', photo: '', audio: '', label: '' },
        { id: 'exhibit-003', owner: '爸爸', number: '03', name: '机械表', year: '约 1990s', source: '爸爸的第一份工资', teller: '爸爸',
          what: '一块手动机械表，表盘有一道细划痕，秒针仍在走。',
          story: '爸爸用第一个月工资买的，戴了三十年。那道划痕是我出生那年磕的，他没修。',
          meaning: '时间一直在走，但有些瞬间被表盘记住了。',
          emotion: ['安心'], visibility: 'family', photo: '', audio: '', label: '' },
        { id: 'exhibit-004', owner: '孩子', number: '04', name: '课本', year: '约 2023', source: '初一开学', teller: '孩子',
          what: '初一数学课本，牛皮纸包皮，扉页有妈妈写的"慢慢来"三个字。',
          story: '初一开学那天，妈妈用牛皮纸把这本数学课本包好，在内页写了"慢慢来"三个字。那年我数学跟不上，她每晚陪我重做错题。',
          meaning: '三个字比任何辅导都管用，它让我知道跟不上也没关系。',
          emotion: ['陪伴'], visibility: 'family', photo: '', audio: '', label: '' },
        { id: 'exhibit-005', owner: '外公', number: '05', name: '钢笔', year: '约 1980s', source: '外公退休留念', teller: '外公',
          what: '一支墨绿色的老式钢笔，笔帽有一道细纹，笔尖磨出了外公握笔的凹痕。',
          story: '外公用了四十年的钢笔。他每天早起练字，写家信、记账都靠它。笔尖的凹痕，是几十年同一姿势留下的。',
          meaning: '一支笔写完了大半辈子，磨出的凹痕比任何字迹都更像他。',
          emotion: ['想念'], visibility: 'family', photo: '', audio: '', label: '' }
      ],
      labelStyle: 'circle', /* circle / square / text */
      structure: 'timeline', /* timeline / room / question / contrast */
      notes: [
        { type: '我看见了', text: '一只缺了口的杯子，和三十年没换的人。' },
        { type: '我想知道', text: '外婆现在还用它喝水吗？' },
        { type: '我看见了', text: '三十年冒白气的清晨。' },
        { type: '我想知道', text: '缺口会不会有一天，也变成被记住的部分。' }
      ],
      finalAnswer: '因为它不是一件东西，是一段还在继续的时间。'
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(FMM_KEY);
      if (!raw) { var d = defaultData(); save(d); return d; }
      var parsed = JSON.parse(raw);
      /* 合并默认值，保证新字段不缺失 */
      var base = defaultData();
      return deepMerge(base, parsed);
    } catch (e) {
      var d2 = defaultData(); save(d2); return d2;
    }
  }
  function save(data) {
    try { localStorage.setItem(FMM_KEY, JSON.stringify(data || load())); }
    catch (e) { /* localStorage 满或禁用，静默降级 */ }
  }
  function deepMerge(base, over) {
    if (Array.isArray(base)) { return over !== undefined ? over : base; }
    if (typeof base === 'object' && base && typeof over === 'object' && over) {
      var out = {};
      Object.keys(base).forEach(function (k) { out[k] = deepMerge(base[k], over[k]); });
      return out;
    }
    return over !== undefined ? over : base;
  }

  var FMM = {
    KEY: FMM_KEY,
    load: load,
    save: save,
    reset: function () { localStorage.removeItem(FMM_KEY); return load(); },
    /* 展品快捷操作 */
    getExhibit: function (idx) { var d = load(); return d.exhibits[idx] || d.exhibits[0]; },
    setExhibit: function (idx, patch) {
      var d = load();
      if (d.exhibits[idx]) { Object.keys(patch).forEach(function (k) { d.exhibits[idx][k] = patch[k]; }); save(d); }
      return d.exhibits[idx];
    },
    /* 便签 */
    addNote: function (type, text) { var d = load(); d.notes.push({ type: type, text: text }); save(d); return d.notes; },
    /* 当前展品索引（跨页传递，默认 0） */
    currentIdx: function () { return parseInt(sessionStorage.getItem('fmm_current_idx') || '0', 10) || 0; },
    setCurrentIdx: function (i) { sessionStorage.setItem('fmm_current_idx', String(i)); },

    /* 背景音乐模块（Web Audio API · 纯前端生成温馨钢琴旋律） */
    music: {
      ctx: null, gain: null, playing: false, timer: null, noteIndex: 0,
      /* 五声音阶温馨旋律 */
      notes: [523.25,659.25,783.99,659.25,523.25,440,523.25,659.25,783.99,880,783.99,659.25,587.33,659.25,523.25,440],
      init: function(){ if(this.ctx) return; try{ var AC=window.AudioContext||window.webkitAudioContext; this.ctx=new AC(); this.gain=this.ctx.createGain(); this.gain.gain.value=0.12; this.gain.connect(this.ctx.destination); }catch(e){} },
      playNote: function(){
        if(!this.ctx||!this.playing) return;
        var f=this.notes[this.noteIndex%this.notes.length]; var t=this.ctx.currentTime;
        var o=this.ctx.createOscillator(); var g=this.ctx.createGain();
        o.type='sine'; o.frequency.value=f;
        g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.22,t+0.05); g.gain.exponentialRampToValueAtTime(0.001,t+2);
        o.connect(g); g.connect(this.gain); o.start(t); o.stop(t+2);
        var o2=this.ctx.createOscillator(); var g2=this.ctx.createGain();
        o2.type='triangle'; o2.frequency.value=f*2;
        g2.gain.setValueAtTime(0,t); g2.gain.linearRampToValueAtTime(0.06,t+0.05); g2.gain.exponentialRampToValueAtTime(0.001,t+1.5);
        o2.connect(g2); g2.connect(this.gain); o2.start(t); o2.stop(t+1.5);
        this.noteIndex++;
      },
      start: function(){ this.init(); if(!this.ctx) return false; if(this.ctx.state==='suspended') this.ctx.resume(); this.playing=true; localStorage.setItem('fmm_music','on'); this.playNote(); var s=this; this.timer=setInterval(function(){ s.playNote(); },1800); return true; },
      stop: function(){ this.playing=false; localStorage.setItem('fmm_music','off'); if(this.timer){ clearInterval(this.timer); this.timer=null; } },
      toggle: function(){ if(this.playing){ this.stop(); return false; } return this.start(); },
      isPlaying: function(){ return this.playing; },
      shouldPlay: function(){ return localStorage.getItem('fmm_music')==='on'; },
      tryRestore: function(){ if(this.shouldPlay()){ return this.start(); } return false; }
    }
  };

  /* 自动注入背景音乐控制按钮到页面 */
  function injectMusicButton(){
    if(document.getElementById('fmm-music-btn')) return;
    var btn=document.createElement('div');
    btn.id='fmm-music-btn';
    btn.style.cssText='position:fixed;top:14px;right:14px;z-index:9998;width:38px;height:38px;border-radius:50%;border:1px solid #E7DDD0;background:rgba(255,253,248,0.92);backdrop-filter:blur(4px);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);transition:all .2s;';
    btn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#63736D"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    btn.title='点击播放/暂停背景音乐';
    function updateBtn(){
      var svg=btn.querySelector('svg');
      if(FMM.music.isPlaying()){ svg.style.color='#315B50'; btn.style.animation='fmm-pulse 2s ease-in-out infinite'; }
      else { svg.style.color='#63736D'; btn.style.animation=''; }
    }
    btn.addEventListener('click',function(){ FMM.music.toggle(); updateBtn(); });
    document.body.appendChild(btn);
    var style=document.createElement('style');
    style.textContent='@keyframes fmm-pulse{0%,100%{box-shadow:0 2px 8px rgba(0,0,0,0.06)}50%{box-shadow:0 2px 16px rgba(49,91,80,0.25)}}';
    document.head.appendChild(style);
    if(FMM.music.shouldPlay()){ setTimeout(function(){ if(FMM.music.tryRestore()) updateBtn(); },500); }
    document.addEventListener('click',function(){ if(FMM.music.shouldPlay()&&!FMM.music.isPlaying()){ if(FMM.music.tryRestore()) updateBtn(); } },{passive:true});
  }
  /* 按钮悬浮动效（温馨提升感，全站通用，覆盖 14 个页面） */
  function injectButtonHoverFx(){
    if(document.getElementById('fmm-hover-fx')) return;
    var css='button,a[role="button"],input[type="submit"],input[type="button"],.fmm-btn,[data-fmm-role="member-select"],[data-fmm-role="member-switch"],#fmm-music-btn{transition:transform .28s cubic-bezier(.34,1.2,.64,1),box-shadow .28s ease,background-color .22s ease,border-color .22s ease,color .2s ease}'
      +'button:hover:not(:disabled):not([data-fmm-no-hover]),a[role="button"]:hover,input[type="submit"]:hover,input[type="button"]:hover,.fmm-btn:hover,[data-fmm-role="member-select"]:hover,[data-fmm-role="member-switch"]:hover,#fmm-music-btn:hover{transform:translateY(-2px);box-shadow:0 10px 24px -8px rgba(49,91,80,0.28),0 4px 10px -4px rgba(49,91,80,0.14)}'
      +'button:active:not(:disabled),a[role="button"]:active,.fmm-btn:active,#fmm-music-btn:active{transform:translateY(0);transition-duration:.1s}'
      +'.bg-primary:hover{box-shadow:0 12px 28px -8px rgba(49,91,80,0.38)}'
      +'.bg-terracotta:hover{box-shadow:0 12px 28px -8px rgba(184,106,74,0.38)}'
      +'@media (prefers-reduced-motion:reduce){button,a[role="button"],.fmm-btn,#fmm-music-btn{transition:none!important}button:hover,a[role="button"]:hover,.fmm-btn:hover,#fmm-music-btn:hover{transform:none!important}}';
    var s=document.createElement('style');s.id='fmm-hover-fx';s.textContent=css;document.head.appendChild(s);
  }
  function fmmReady(fn){ if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',fn); } else { fn(); } }
  fmmReady(injectMusicButton);
  fmmReady(injectButtonHoverFx);

  global.FMM = FMM;
})(window);
