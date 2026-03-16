import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────
//  JOYJUMP v5 — CHARACTER SYSTEM
//  Phase 2: Real illustrated SVG characters with emotion states
//
//  5 characters, 5 moods each, typing animation, expanded phrases
// ─────────────────────────────────────────────────────────────────

export const CHARACTERS = {
  max: {
    name: 'Max', full: 'Max the Panda', emoji: '🐼',
    color: '#FB8C00', bg: '#FFF3E0', border: '#FFCC80',
    accentLight: '#FFF8F0', accentDark: '#E65100',
    world: 'Math Mountain',
    phrases: {
      intro: ["Hi! I'm Max! Let's count some bamboo! 🎋","Ready for a maths adventure? I'll help you! 🏔️","Numbers are fun when we learn together! ✨","Ooh, a new problem! I love problems! 🧮","Max here! Let's crack this together! 💪","Bamboo and numbers — my two favourite things! 🎋","I've been waiting for you! Let's start! 🌟","Every great mathematician starts right here! 🏆"],
      correct: ["AMAZING! You got it! ⭐","Wow, you're SO smart! 🌟","Perfect! I knew you could do it! 🎉","Brilliant! High five! ✋","You just solved that like a pro! 🏆","That's my star student! 🌠","Max is doing a happy dance! 🐼💃","Incredible! You're getting better every time! 🚀","YES! That is exactly right! 🎊","You make maths look easy! ✨"],
      wrong: ["Oops! Let's try again — you're almost there! 💪","Not quite! I know you can get it! 🌟","Good try! Let me give you a hint... 💡","Hmm, let's think about this differently! 🤔","Even pandas get it wrong sometimes! Try again! 🐼","So close! One more attempt! 🌈","Don't give up! The answer is closer than you think! 💪","That's how we learn — let's try once more! 🎯"],
      hint: ["Psst! Here's a secret tip! 🤫","Let me help you think about this... 🤔","Max's hint: look carefully at the numbers! 🔍","Think about what we just learned — it's in there! 💡","Here's a clue from my bamboo notes! 🎋","You know this! Just think step by step! 👣"],
      celebrate: ["YOU DID IT!! You're a SUPERSTAR! 🌟🎉","AMAZING! I'm SO proud of you! 🏆✨","WOOHOO!! You're incredible! 🎊🌈","MAX IS OVER THE MOON!! 🌙🐼","That was PERFECT! Every single answer! 🎯","You're a maths genius and I'm your biggest fan! 🏆","Bamboo celebration time!! 🎋🎋🎋","I'm going to tell every panda about this! 🐼🌟"],
      thinking: ["Hmm, let me think... 🤔","Good question! Let me consider... 💭","Almost got it? Take your time! ⏰","Think think think... 🧠"],
    },
  },
  lila: {
    name: 'Lila', full: 'Lila the Owl', emoji: '🦉',
    color: '#43A047', bg: '#E8F5E9', border: '#A5D6A7',
    accentLight: '#F1F8F1', accentDark: '#1B5E20',
    world: 'Story Forest',
    phrases: {
      intro: ["Hoot hoot! I'm Lila! Let's read together! 📚","Words are magical! I'll help you understand! ✨","Every word you learn is a new superpower! 🦉","Welcome to Story Forest! Words live here! 🌲","I've read every book in the forest — let's explore! 📖","Grammar is the map that helps us read stories! 🗺️","Hoot! Ready to discover the magic of language? 🌟","Let's go on a word adventure together! 🎒"],
      correct: ["Excellent word work! 📖","You're a reading star! 🌟","Lila is impressed! That was perfect! 🦉✨","Your grammar is growing stronger! 💪","That's exactly right — you're a natural! 🎯","I'm going to add that to my library! 📚","Wise answer! The forest is proud of you! 🌲","Hoot hoot! Brilliantly done! 🦉🌟","You understood it better than I expected! ⭐","That answer deserves a gold bookmark! 🔖"],
      wrong: ["Let's sound it out together! 🔤","Almost! Try again! 💪","Hmm, let's look at that more carefully! 🔍","Every great reader makes mistakes — that's how we learn! 📖","Not quite, but you're thinking in the right direction! 🌟","Lila says: re-read the clue! 🦉💡","Let's think about the rule again... 🤔","You're very close! One more try! 🌈"],
      hint: ["Here's a clue from my library! 📚","Think about the rule we just learned! 📏","Lila's tip: look at the example! 🦉","Remember: every sentence needs a subject! 💡","The answer is hiding in the words themselves! 🔍","My library whispers: check the ending! 📖"],
      celebrate: ["You're a story champion! 🏆📚","HOOT HOOT HOORAY!! 🦉🎉","The whole forest heard that perfect answer! 🌲🌟","You've earned your Grammar Badge! 🏅","Lila has never been prouder! Every answer perfect! 📚✨","Words will never be a mystery to you again! 🌟","The Story Forest welcomes its newest champion! 🌲🏆","I'm dedicating a whole shelf to you! 📚💛"],
      thinking: ["Let me check my books... 📖","Hmm, which rule applies here? 🤔","My owl brain is thinking! 🦉💭","Almost there — just think! 📚"],
    },
  },
  nova: {
    name: 'Nova', full: 'Nova the Fox', emoji: '🦊',
    color: '#1E88E5', bg: '#E3F2FD', border: '#90CAF9',
    accentLight: '#EFF6FE', accentDark: '#0D47A1',
    world: 'Science Ocean',
    phrases: {
      intro: ["Hey scientist! I'm Nova! Let's discover! 🔬","Science is all around us! Let's explore! 🌊","I've been waiting to experiment with you! 🧪","Every question is the start of an adventure! 🦊","Nova's lab is open! Put on your thinking cap! 🔭","Scientists observe, question, and discover — let's do all three! 🌍","Ready to unlock the secrets of the universe? 🌌","The best science starts with curiosity! 🤔"],
      correct: ["Excellent discovery! 🔬","Science superstar! 🌟","Nova approves this answer 100%! 🦊✅","That's the scientific method working perfectly! 🧪","You thought like a real scientist! 🔭","Hypothesis confirmed! You're brilliant! 💡","The data supports your answer perfectly! 📊","I'm adding this to my science journal! 📓","Nova's top student of the day! 🏆","Right on! Your brain is like a supercomputer! 🧠"],
      wrong: ["Scientists always try again! 💪","Let's investigate more! 🔍","Every failed experiment teaches us something! 🧪","Even Einstein got things wrong! Keep going! 🌟","Observation time! Look at the clues more carefully! 🔬","Hypothesis not confirmed — let's rethink! 💭","Nova says: science is about trying until you get it right! 🦊","So close to the answer! One more observation! 🔭"],
      hint: ["Science hint coming up! 🧪","Nova's lab note: think about cause and effect! 📓","Look at the evidence around you! 🔍","What does the story tell us? Connect the dots! 💡","Fox instinct says: trust the science! 🦊","Hint from the lab: re-read the fact! 🔬"],
      celebrate: ["You're a science genius! 🏆🔬","NOVA IS HOWLING WITH JOY! 🦊🎉","Groundbreaking results!! You're a superstar! 🌟","That performance belongs in a science journal! 📓✨","The Science Ocean is yours to explore! 🌊🏆","A perfect score! The data doesn't lie! 📊🌟","You've graduated from Nova's Academy! 🎓🦊","Every answer was EXACTLY correct! I'm amazed! 🔬💫"],
      thinking: ["Processing... 🔬","Analysing the data... 📊","Fox brain at full power! 🦊💭","Scientific thinking mode activated! 🧪"],
    },
  },
  orbit: {
    name: 'Orbit', full: 'Orbit the Turtle', emoji: '🐢',
    color: '#E91E63', bg: '#FCE4EC', border: '#F48FB1',
    accentLight: '#FFF0F5', accentDark: '#880E4F',
    world: 'Discovery Space',
    phrases: {
      intro: ["Slow and steady! I'm Orbit! Let's explore! 🌍","There's so much world to discover! 🗺️","Orbit has travelled every continent — let me guide you! 🐢","The world is an amazing place — let's learn about it! 🌍","Every explorer starts with one question! What's yours? 🗺️","I've been to every corner of the Earth — ready to join me? 🌏","Discovery begins when we're curious! Let's begin! ✨","Orbit's compass is pointing toward adventure! 🧭"],
      correct: ["Wonderful discovery! 🌍","You're a true explorer! 🗺️","Orbit is proud of you! 🐢⭐","That's expert geographer knowledge! 🌐","Slow and steady wins the race — and so do you! 🏆","You'd make a great world traveller! ✈️","Every answer brings you closer to being a world expert! 🌍","That's what I call an educated explorer! 🎒","I'll add a flag on my map for you! 🚩","Brilliant navigation! 🧭"],
      wrong: ["Keep exploring! 💪","Every explorer tries again! 🌟","Orbit once got lost too — we always find the way! 🗺️","Let's consult the map again! 🧭","Not quite the right destination — recalculate! 🌍","Every wrong turn teaches us the right path! 🐢","Even the best explorers backtrack sometimes! 💪","The right answer is on the map — look again! 🔍"],
      hint: ["Here's a geography hint! 🗺️","Check your mental map! 🧭","Orbit's tip: think about what you know about this place! 🌍","The clue is in the name — listen carefully! 💡","Every location has something unique — find it! 🔍","A good explorer always uses all the clues available! 🐢"],
      celebrate: ["World explorer extraordinaire! 🏆🌍","ORBIT IS SPINNING WITH HAPPINESS! 🐢🎉","You've mapped your way to perfection! 🗺️✨","The whole world is celebrating your answers! 🌍🌟","You just completed the explorer's challenge! 🏅","Orbit awards you the Golden Compass! 🧭🏆","An explorer for the ages! Every answer spot on! 🌍💫","I'd trust you to navigate any expedition! 🎒🌟"],
      thinking: ["Consulting my map... 🗺️","Turtle brain scanning... 🐢💭","Which direction? Let me think... 🧭","The answer is somewhere in here! 🌍"],
    },
  },
  juno: {
    name: 'Juno', full: 'Juno the Rabbit', emoji: '🐰',
    color: '#7B1FA2', bg: '#EDE7F6', border: '#CE93D8',
    accentLight: '#F5EEF8', accentDark: '#4A148C',
    world: 'All Worlds',
    phrases: {
      intro: ["Welcome to JoyJump! I'm Juno! 🌈","I'm so excited to learn with you today! ⭐","Juno is here and ready to adventure! 🐰","Every lesson is a new hop in the right direction! 🌟","Hi! I've been bouncing with excitement waiting for you! 🐰💜","JoyJump is YOUR universe — let's explore it together! 🌈","Ready? Steady? Let's LEARN! 🚀","Juno's golden rule: never stop being curious! ✨","You + me + learning = the best combination! 🌟"],
      correct: ["Incredible! You're amazing! ⭐","That's my favourite explorer! 🌟","JUNO IS HOPPING! CORRECT! 🐰🎉","You just proved how brilliant you are! 💜","Another perfect answer! 😄","The whole JoyJump universe cheers for you! 🌈🏆","Juno's heart is bursting with pride! 💜✨","That's the smartest answer I've heard today! 🌟","You're on FIRE today! 🔥⭐","Nothing can stop you when you're this focused! 💪"],
      wrong: ["You can do it! Juno believes in you! 💪","Let's hop back and try again! 🐰","Every bunny hop forward counts — keep going! 🌟","Juno has made mistakes too — we bounce back! 🐰💜","Not the answer, but you're learning! ✨","Shake it off and try once more! You've got this! 💪","Juno's whiskers are twitching — you're so close! 🐰","One more try — I know you know this! 🌈"],
      hint: ["Juno's tip: think carefully! 🤔","Purple ears are for great hints — here's one! 🐰💜","Juno whispers: look at what the character said! 💡","The clue is closer than you think! ✨","Hop back to the story — the answer is there! 📖","Trust your first instinct — rabbits always know! 🐰"],
      celebrate: ["JUMPING FOR JOY! You're incredible! 🎉🐰","JUNO IS DOING THE HAPPY HOP!! 🐰🌈🎊","PERFECT SCORE! JoyJump's greatest ever learner! 🏆✨","That. Was. PERFECT. I'm so proud of you! 💜🌟","You've made Juno the happiest rabbit in the universe! 🐰💜","Stars are raining down because of YOU! 🌟🌟🌟","You just levelled up your entire brain! 🧠🚀","Juno is officially your number one fan! 🐰🏆"],
      thinking: ["Hmm, Juno is thinking... 🤔","Let's hop through the options! 🐰","My purple ears hear something... 💜","Almost got it! Think think think! 💭"],
    },
  },
}

export function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// ── SVG CHARACTERS ────────────────────────────────────────────────

function MaxSVG({ mood, s }) {
  const happy = mood==='correct'||mood==='celebrate'
  const sad   = mood==='wrong'
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
      <ellipse cx="60" cy="92" rx="28" ry="20" fill="#2D2D2D"/>
      <ellipse cx="60" cy="93" rx="18" ry="13" fill="#F5E6D3"/>
      <circle cx="60" cy="54" r="32" fill="#2D2D2D"/>
      <circle cx="34" cy="29" r="12" fill="#2D2D2D"/>
      <circle cx="86" cy="29" r="12" fill="#2D2D2D"/>
      <circle cx="34" cy="29" r="7"  fill="#FFAB91"/>
      <circle cx="86" cy="29" r="7"  fill="#FFAB91"/>
      <ellipse cx="60" cy="57" rx="22" ry="20" fill="#F5E6D3"/>
      <ellipse cx="51" cy="51" rx="6" ry={happy?5:sad?3:6} fill="white"/>
      <ellipse cx="69" cy="51" rx="6" ry={happy?5:sad?3:6} fill="white"/>
      <circle cx="52" cy="52" r="3.5" fill="#1A1A1A"/>
      <circle cx="70" cy="52" r="3.5" fill="#1A1A1A"/>
      <circle cx="53" cy="50.5" r="1.2" fill="white"/>
      <circle cx="71" cy="50.5" r="1.2" fill="white"/>
      <ellipse cx="60" cy="60" rx="4.5" ry="3.5" fill="#1A1A1A"/>
      {happy
        ? <path d="M50 66 Q60 74 70 66" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        : sad
        ? <path d="M50 70 Q60 63 70 70" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        : <path d="M51 66 Q60 72 69 66" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none"/>}
      {mood==='celebrate' && <><text x="86" y="28" fontSize="14" fill="#FFD700">⭐</text><text x="6" y="33" fontSize="12" fill="#FFD700">✨</text></>}
      {mood==='thinking' && <path d="M45 42 Q51 38 57 42" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none"/>}
    </svg>
  )
}

function LilaSVG({ mood, s }) {
  const happy = mood==='correct'||mood==='celebrate'
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
      <ellipse cx="60" cy="92" rx="24" ry="18" fill="#5D4037"/>
      <ellipse cx="38" cy="87" rx="14" ry="20" fill="#795548" transform="rotate(-15 38 87)"/>
      <ellipse cx="82" cy="87" rx="14" ry="20" fill="#795548" transform="rotate(15 82 87)"/>
      <circle cx="60" cy="55" r="30" fill="#795548"/>
      <ellipse cx="44" cy="30" rx="6" ry="11" fill="#5D4037" transform="rotate(-15 44 30)"/>
      <ellipse cx="76" cy="30" rx="6" ry="11" fill="#5D4037" transform="rotate(15 76 30)"/>
      <ellipse cx="60" cy="58" rx="22" ry="21" fill="#FFE0B2"/>
      <circle cx="51" cy="52" r="10" fill="#FFF9C4"/>
      <circle cx="69" cy="52" r="10" fill="#FFF9C4"/>
      <circle cx="51" cy="52" r="7"  fill="#FF8F00"/>
      <circle cx="69" cy="52" r="7"  fill="#FF8F00"/>
      <circle cx="51" cy="52" r="4"  fill="#1A1A1A"/>
      <circle cx="69" cy="52" r="4"  fill="#1A1A1A"/>
      <circle cx="52" cy="50.5" r="1.4" fill="white"/>
      <circle cx="70" cy="50.5" r="1.4" fill="white"/>
      <path d="M56 63 L60 69 L64 63 Z" fill="#FF8F00"/>
      {happy && <path d="M44 69 Q60 77 76 69" stroke="#FF8F00" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>}
      {mood==='celebrate' && <text x="83" y="42" fontSize="16">📚</text>}
    </svg>
  )
}

function NovaSVG({ mood, s }) {
  const happy = mood==='correct'||mood==='celebrate'
  const sad   = mood==='wrong'
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
      <path d="M85 95 Q108 78 102 62 Q110 73 96 90Z" fill="#BF360C"/>
      <ellipse cx="58" cy="91" rx="26" ry="19" fill="#FF7043"/>
      <ellipse cx="58" cy="92" rx="16" ry="12" fill="#FFCCBC"/>
      <circle cx="60" cy="54" r="30" fill="#FF7043"/>
      <path d="M38 32 L29 11 L49 24Z" fill="#FF7043"/>
      <path d="M82 32 L91 11 L71 24Z" fill="#FF7043"/>
      <path d="M40 30 L33 15 L47 25Z" fill="#FFAB91"/>
      <path d="M80 30 L87 15 L73 25Z" fill="#FFAB91"/>
      <ellipse cx="60" cy="59" rx="22" ry="19" fill="#FFCCBC"/>
      <ellipse cx="50" cy="51" rx="7.5" ry={happy?4:7.5} fill="white"/>
      <ellipse cx="70" cy="51" rx="7.5" ry={happy?4:7.5} fill="white"/>
      <circle cx="51" cy="52" r="4.5" fill="#1565C0"/>
      <circle cx="71" cy="52" r="4.5" fill="#1565C0"/>
      <circle cx="52" cy="50.5" r="1.6" fill="white"/>
      <circle cx="72" cy="50.5" r="1.6" fill="white"/>
      <ellipse cx="60" cy="62" rx="5" ry="3.5" fill="#BF360C"/>
      {happy
        ? <path d="M49 67 Q60 75 71 67" stroke="#BF360C" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        : sad
        ? <path d="M50 71 Q60 64 70 71" stroke="#BF360C" strokeWidth="2" strokeLinecap="round" fill="none"/>
        : <path d="M51 67 Q60 72 69 67" stroke="#BF360C" strokeWidth="2" strokeLinecap="round" fill="none"/>}
      {mood==='celebrate' && <text x="83" y="36" fontSize="15">🧪</text>}
    </svg>
  )
}

function OrbitSVG({ mood, s }) {
  const happy = mood==='correct'||mood==='celebrate'
  const sad   = mood==='wrong'
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
      <ellipse cx="60" cy="83" rx="36" ry="26" fill="#2E7D32"/>
      <ellipse cx="60" cy="83" rx="27" ry="18" fill="#388E3C"/>
      <path d="M44 73 L60 65 L76 73" stroke="#1B5E20" strokeWidth="2" fill="none"/>
      <path d="M42 83 L60 79 L78 83" stroke="#1B5E20" strokeWidth="2" fill="none"/>
      <path d="M44 93 L60 97 L76 93" stroke="#1B5E20" strokeWidth="2" fill="none"/>
      <ellipse cx="60" cy="65" rx="14" ry="11" fill="#66BB6A"/>
      <circle cx="60" cy="50" r="24" fill="#66BB6A"/>
      <circle cx="50" cy="46" r="8" fill="white"/>
      <circle cx="70" cy="46" r="8" fill="white"/>
      <circle cx="50" cy="47" r={happy?6:4.5} fill="#1A237E"/>
      <circle cx="70" cy="47" r={happy?6:4.5} fill="#1A237E"/>
      <circle cx="51" cy="45.5" r="1.6" fill="white"/>
      <circle cx="71" cy="45.5" r="1.6" fill="white"/>
      {happy
        ? <path d="M47 58 Q60 67 73 58" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        : sad
        ? <path d="M49 62 Q60 56 71 62" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" fill="none"/>
        : <path d="M49 59 Q60 65 71 59" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" fill="none"/>}
      {mood==='celebrate' && <text x="81" y="33" fontSize="15">🗺️</text>}
      <ellipse cx="36" cy="97" rx="9" ry="6" fill="#66BB6A" transform="rotate(-20 36 97)"/>
      <ellipse cx="84" cy="97" rx="9" ry="6" fill="#66BB6A" transform="rotate(20 84 97)"/>
    </svg>
  )
}

function JunoSVG({ mood, s }) {
  const happy = mood==='correct'||mood==='celebrate'
  const sad   = mood==='wrong'
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
      <ellipse cx="60" cy="91" rx="24" ry="19" fill="#7B1FA2"/>
      <ellipse cx="60" cy="92" rx="15" ry="12" fill="#F3E5F5"/>
      <ellipse cx="40" cy="23" rx="7.5" ry="19" fill="#7B1FA2" transform="rotate(-8 40 23)"/>
      <ellipse cx="80" cy="23" rx="7.5" ry="19" fill="#7B1FA2" transform="rotate(8 80 23)"/>
      <ellipse cx="40" cy="23" rx="4.5" ry="13" fill="#CE93D8" transform="rotate(-8 40 23)"/>
      <ellipse cx="80" cy="23" rx="4.5" ry="13" fill="#CE93D8" transform="rotate(8 80 23)"/>
      <circle cx="60" cy="57" r="30" fill="#9C27B0"/>
      <ellipse cx="60" cy="59" rx="22" ry="21" fill="#F3E5F5"/>
      <circle cx="50" cy="53" r="7.5" fill="white"/>
      <circle cx="70" cy="53" r="7.5" fill="white"/>
      <circle cx="50" cy="54" r={happy?5.5:4.5} fill="#4A148C"/>
      <circle cx="70" cy="54" r={happy?5.5:4.5} fill="#4A148C"/>
      <circle cx="51" cy="52.5" r="1.6" fill="white"/>
      <circle cx="71" cy="52.5" r="1.6" fill="white"/>
      <circle cx="42" cy="63" r="5.5" fill="#CE93D8" opacity="0.5"/>
      <circle cx="78" cy="63" r="5.5" fill="#CE93D8" opacity="0.5"/>
      <ellipse cx="60" cy="64" rx="4.5" ry="3" fill="#7B1FA2"/>
      {happy
        ? <path d="M49 69 Q60 78 71 69" stroke="#7B1FA2" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        : sad
        ? <path d="M49 73 Q60 66 71 73" stroke="#7B1FA2" strokeWidth="2" strokeLinecap="round" fill="none"/>
        : <path d="M50 69 Q60 75 70 69" stroke="#7B1FA2" strokeWidth="2" strokeLinecap="round" fill="none"/>}
      <ellipse cx="83" cy="96" rx="10" ry="8" fill="#F3E5F5"/>
      {mood==='celebrate' && <text x="82" y="31" fontSize="16">🌈</text>}
    </svg>
  )
}

const SVG_MAP = { max: MaxSVG, lila: LilaSVG, nova: NovaSVG, orbit: OrbitSVG, juno: JunoSVG }

// ── MOOD → ANIMATION VARIANTS ─────────────────────────────────────
const MOODS = {
  idle:      { animate: { y: [0,-8,0] },                             transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } },
  intro:     { animate: { y: [0,-8,0] },                             transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
  correct:   { animate: { rotate:[-5,5,-5,5,0], scale:[1,1.18,1] }, transition: { duration: 0.55 } },
  celebrate: { animate: { y:[0,-20,0,-14,0], rotate:[-8,8,-8,8,0], scale:[1,1.28,1.1,1.22,1] }, transition: { duration: 0.9, repeat: 2 } },
  wrong:     { animate: { x:[-8,8,-6,6,-4,4,0] },                   transition: { duration: 0.5 } },
  thinking:  { animate: { rotate:[0,-6,6,-4,0], y:[0,-3,0] },        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
}

// ── MAIN CHARACTER COMPONENT ──────────────────────────────────────
export function Character({ char='max', size=100, mood='idle', onClick }) {
  const SVGComp = SVG_MAP[char] || SVG_MAP.max
  const c = CHARACTERS[char] || CHARACTERS.max
  const v = MOODS[mood] || MOODS.idle
  return (
    <motion.div
      animate={v.animate}
      transition={v.transition}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%', flexShrink: 0, position: 'relative', overflow: 'hidden',
        width: size, height: size,
        background: `radial-gradient(circle at 35% 30%, white 0%, ${c.accentLight} 50%, ${c.bg} 100%)`,
        border: `3px solid ${c.border}`,
        boxShadow: `0 8px 24px ${c.border}60, 0 2px 8px rgba(0,0,0,0.1)`,
      }}
    >
      <SVGComp mood={mood} s={size * 0.86} />
      {/* Shine */}
      <div style={{ position:'absolute', top: size*0.07, left: size*0.1, width: size*0.22, height: size*0.17, borderRadius:'50%', background:'rgba(255,255,255,0.44)', pointerEvents:'none' }}/>
    </motion.div>
  )
}

// ── TYPING TEXT ANIMATION ─────────────────────────────────────────
function TypingText({ text }) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setShown('')
    setDone(false)
    if (text.length < 20) { setShown(text); setDone(true); return }
    let i = 0
    const speed = text.length > 60 ? 16 : 22
    const t = setInterval(() => {
      i++; setShown(text.slice(0, i))
      if (i >= text.length) { clearInterval(t); setDone(true) }
    }, speed)
    return () => clearInterval(t)
  }, [text])
  return (
    <span>
      {shown}
      {!done && <span style={{ opacity:0.5, animation:'joyjump-blink 0.7s step-end infinite' }}>▌</span>}
    </span>
  )
}

// ── CHARACTER WITH SPEECH BUBBLE ─────────────────────────────────
export function CharacterSays({ char='max', mood='intro', message, className='' }) {
  const c = CHARACTERS[char] || CHARACTERS.max
  const text = message || getRandom(c.phrases[mood] || c.phrases.intro)
  const [visible, setVisible] = useState(false)
  const [msgKey, setMsgKey] = useState(0)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => { setVisible(true); setMsgKey(k => k+1) }, 130)
    return () => clearTimeout(t)
  }, [text])

  const bubbleBg = (mood==='correct'||mood==='celebrate')
    ? 'linear-gradient(135deg,#E8F5E9,white)'
    : mood==='wrong'
    ? 'linear-gradient(135deg,#FFF3E0,white)'
    : 'white'
  const bubbleBorder = (mood==='correct'||mood==='celebrate')
    ? '#A5D6A7'
    : mood==='wrong'
    ? '#FFCC80'
    : `${c.color}40`

  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Character char={char} size={90} mood={mood} />
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={msgKey}
            initial={{ opacity:0, x:-14, scale:0.88 }}
            animate={{ opacity:1, x:0, scale:1 }}
            exit={{ opacity:0, scale:0.94 }}
            transition={{ type:'spring', damping:18, stiffness:300 }}
            className="speech-bubble flex-1 max-w-xs"
            style={{ background: bubbleBg, borderColor: bubbleBorder }}
          >
            <p style={{ color:'#334155', fontSize:'0.94rem', lineHeight:1.55, margin:0, fontWeight:600, fontFamily:'Nunito,sans-serif' }}>
              <TypingText key={text} text={text} />
            </p>
            <p style={{ color:c.color, fontWeight:800, fontSize:'0.7rem', marginTop:5, fontFamily:'Baloo 2,sans-serif', letterSpacing:'0.02em' }}>
              {c.full}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── CELEBRATION CHARACTER ─────────────────────────────────────────
export function CelebrationCharacter({ char='max' }) {
  const c = CHARACTERS[char] || CHARACTERS.max
  return (
    <motion.div
      initial={{ scale:0, rotate:-25, opacity:0 }}
      animate={{ scale:1, rotate:0, opacity:1 }}
      transition={{ type:'spring', damping:8, stiffness:200 }}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}
    >
      <Character char={char} size={150} mood="celebrate" />
      <motion.div
        animate={{ scale:[1,1.1,1], opacity:[1,0.85,1] }}
        transition={{ duration:1.2, repeat:Infinity }}
        style={{ fontFamily:'Fredoka,sans-serif', fontSize:21, color:c.color, textAlign:'center', maxWidth:260, textShadow:`0 2px 8px ${c.border}80` }}
      >
        {getRandom(c.phrases.celebrate)}
      </motion.div>
    </motion.div>
  )
}

export default Character
