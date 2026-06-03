import React, { useState, useEffect, useRef } from "react";

// Load handwriting font
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap';
  document.head.appendChild(link);
}

const SUPABASE_URL = 'https://uyetxbutknlylhwpgvuc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ZXR4YnV0a25seWxod3BndnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MzkxMjYsImV4cCI6MjA5NDUxNTEyNn0.xaNXP5fUHT0qFgDGHkZchjxtontVkFb_UBege3-sYFc';
const ADMIN_EMAIL = 'ciprian.beatrice.2026@gmail.com';
const ADMIN_PASS  = 'Nunta2026!';

const sb = {
  from: (table) => ({
    select: (cols = '*') => ({
      eq: (col, val) => ({
        single: async () => {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}&${col}=eq.${val}`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
          });
          const data = await res.json();
          return { data: data[0] || null };
        }
      }),
      order: (col, opts) => ({
        then: async (cb) => {
          const dir = opts?.ascending ? 'asc' : 'desc';
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}&order=${col}.${dir}`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
          });
          const data = await res.json();
          return cb({ data });
        }
      })
    }),
    insert: (rows) => ({
      select: () => ({
        single: async () => {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
            body: JSON.stringify(rows[0])
          });
          const data = await res.json();
          return { data: Array.isArray(data) ? data[0] : data };
        }
      }),
      then: async (cb) => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify(rows[0])
        });
        const data = await res.json();
        return cb({ data });
      }
    })
  })
};

async function fetchGuests() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/dashboard_view?select=*&order=created_at.desc`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  return await res.json();
}

async function insertRSVP(payload) {
  await fetch(`${SUPABASE_URL}/rest/v1/rsvp_responses`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function insertGuest(payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/guests`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

// ── Styles ──
const S = {
  cream: '#faf6f0', cream2: '#f3ede3',
  gold: '#b8924a', goldLight: '#d4b07a', goldDark: '#8a6a2e',
  text: '#2c2218', textMid: '#6b5a45', textLight: '#a0856a',
  border: 'rgba(184,146,74,0.3)', borderStrong: 'rgba(184,146,74,0.6)',
};

const gs = {
  page: { minHeight: '100vh', background: S.cream, fontFamily: "'Georgia', serif" },
  container: { maxWidth: 700, margin: '0 auto', padding: '2.5rem 0.5rem 4rem', textAlign: 'center' },
  ornament: { display: 'block', fontSize: '1.2rem', letterSpacing: '0.3em', color: S.gold, marginBottom: '0.4rem' },
  salutation: { fontStyle: 'italic', fontSize: '1rem', color: S.textMid, marginBottom: '0.2rem', fontWeight: 300 },
  guestName: { fontSize: 'clamp(1.5rem,5vw,2.2rem)', fontWeight: 600, color: S.goldDark, letterSpacing: '0.02em', marginBottom: '1.8rem' },
  coupleNames: { fontSize: 'clamp(2.8rem,9vw,5.2rem)', fontWeight: 400, color: S.text, lineHeight: 1.1, margin: '0.5rem 0', fontFamily: "'Great Vibes', cursive" },
  amp: { color: S.gold, display: 'block', fontSize: '0.65em', fontFamily: "'Great Vibes', cursive" },
  invText: { fontStyle: 'italic', fontSize: '1.1rem', color: S.textMid, lineHeight: 1.8, margin: '1.5rem 0', fontWeight: 300 },
  dateBig: { fontSize: 'clamp(1.2rem,3.5vw,1.6rem)', fontWeight: 600, color: S.text, letterSpacing: '0.08em', textTransform: 'uppercase' },
  dateSub: { fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: S.gold, marginTop: '0.3rem' },
};

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.4rem auto', maxWidth: 320 }}>
      <div style={{ flex: 1, height: '0.5px', background: S.borderStrong }} />
      <div style={{ width: 6, height: 6, background: S.gold, transform: 'rotate(45deg)', flexShrink: 0 }} />
      <div style={{ flex: 1, height: '0.5px', background: S.borderStrong }} />
    </div>
  );
}

// ── PAGE: Invitation ──

function DamaskBg() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.06 }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="floral" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
            <g transform="translate(120,120) scale(0.65)">
              <circle cx="0" cy="0" r="3.5" fill="#b8924a"/>
              <ellipse cx="0" cy="-17" rx="3.5" ry="8" fill="#b8924a" transform="rotate(0 0 0)"/>
              <ellipse cx="0" cy="-17" rx="3.5" ry="8" fill="#b8924a" transform="rotate(60 0 0)"/>
              <ellipse cx="0" cy="-17" rx="3.5" ry="8" fill="#b8924a" transform="rotate(120 0 0)"/>
              <ellipse cx="0" cy="-17" rx="3.5" ry="8" fill="#b8924a" transform="rotate(180 0 0)"/>
              <ellipse cx="0" cy="-17" rx="3.5" ry="8" fill="#b8924a" transform="rotate(240 0 0)"/>
              <ellipse cx="0" cy="-17" rx="3.5" ry="8" fill="#b8924a" transform="rotate(300 0 0)"/>
              <path d="M0 0 Q-25 -25 -50 -50" stroke="#b8924a" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
              <path d="M0 0 Q25 -25 50 -50" stroke="#b8924a" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
              <path d="M0 0 Q-25 25 -50 50" stroke="#b8924a" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
              <path d="M0 0 Q25 25 50 50" stroke="#b8924a" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
              <ellipse cx="-25" cy="-25" rx="2.5" ry="5" fill="#b8924a" transform="rotate(-45 -25 -25)"/>
              <ellipse cx="25" cy="-25" rx="2.5" ry="5" fill="#b8924a" transform="rotate(45 25 -25)"/>
              <ellipse cx="-25" cy="25" rx="2.5" ry="5" fill="#b8924a" transform="rotate(45 -25 25)"/>
              <ellipse cx="25" cy="25" rx="2.5" ry="5" fill="#b8924a" transform="rotate(-45 25 25)"/>
              <circle cx="-50" cy="-50" r="2" fill="#b8924a"/>
              <circle cx="50" cy="-50" r="2" fill="#b8924a"/>
              <circle cx="-50" cy="50" r="2" fill="#b8924a"/>
              <circle cx="50" cy="50" r="2" fill="#b8924a"/>
            </g>
            <g transform="translate(0,120) scale(0.65)">
              <circle cx="0" cy="0" r="2" fill="#b8924a"/>
              <ellipse cx="0" cy="-10" rx="2" ry="5" fill="#b8924a" transform="rotate(0 0 0)"/>
              <ellipse cx="0" cy="-10" rx="2" ry="5" fill="#b8924a" transform="rotate(90 0 0)"/>
            </g>
            <g transform="translate(240,120) scale(0.65)">
              <circle cx="0" cy="0" r="2" fill="#b8924a"/>
              <ellipse cx="0" cy="-10" rx="2" ry="5" fill="#b8924a" transform="rotate(0 0 0)"/>
              <ellipse cx="0" cy="-10" rx="2" ry="5" fill="#b8924a" transform="rotate(90 0 0)"/>
            </g>
            <g transform="translate(120,0) scale(0.65)">
              <circle cx="0" cy="0" r="2" fill="#b8924a"/>
              <ellipse cx="0" cy="-10" rx="2" ry="5" fill="#b8924a" transform="rotate(0 0 0)"/>
              <ellipse cx="0" cy="-10" rx="2" ry="5" fill="#b8924a" transform="rotate(90 0 0)"/>
            </g>
            <g transform="translate(120,240) scale(0.65)">
              <circle cx="0" cy="0" r="2" fill="#b8924a"/>
              <ellipse cx="0" cy="-10" rx="2" ry="5" fill="#b8924a" transform="rotate(0 0 0)"/>
              <ellipse cx="0" cy="-10" rx="2" ry="5" fill="#b8924a" transform="rotate(90 0 0)"/>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#floral)"/>
      </svg>
    </div>
  );
}

function DaysCounter() {
  const target = new Date('2026-09-12T16:30:00');
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return null;
  return (
    <div style={{ marginTop: '1.2rem', display: 'inline-block', textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'baseline', gap: '0.3rem',
        padding: '0.5rem 1.4rem',
        border: `0.5px solid ${S.border}`,
        background: 'rgba(184,146,74,0.04)',
      }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,5vw,2.4rem)', fontWeight: 300, color: S.goldDark, lineHeight: 1 }}>{diff}</span>
        <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.gold }}>{diff === 1 ? 'zi rămasă' : 'zile rămase'}</span>
      </div>
    </div>
  );
}

function FadeIn({ children, delay = 0 }) {
  const [visible, setVisible] = React.useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(18px)',
      transition: 'opacity 0.9s ease, transform 0.9s ease',
    }}>
      {children}
    </div>
  );
}

function MuteBtn({ onToggleMute, muted }) {
  return (
    <button onClick={onToggleMute}
      style={{
        position: 'fixed', bottom: '1.2rem', right: '1.2rem', zIndex: 200,
        background: 'rgba(250,246,240,0.9)', border: `0.5px solid rgba(184,146,74,0.4)`,
        borderRadius: '50%', width: 36, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        {muted ? (
          <>
            <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="#b8924a"/>
            <line x1="23" y1="9" x2="17" y2="15" stroke="#b8924a" strokeWidth="2" strokeLinecap="round"/>
            <line x1="17" y1="9" x2="23" y2="15" stroke="#b8924a" strokeWidth="2" strokeLinecap="round"/>
          </>
        ) : (
          <>
            <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="#b8924a"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
          </>
        )}
      </svg>
    </button>
  );
}

function InvitationPage({ guestName, onRSVP, onToggleMute, muted }) {
  return (
    <div style={{...gs.page, position:'relative'}}>
      <DamaskBg />
      <div style={{...gs.container, position:'relative', zIndex:1}}>
        <FadeIn delay={200}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', justifyContent:'center', marginBottom:'0.5rem' }}>
            <div style={{ flex:1, maxWidth:60, height:'0.5px', background:S.borderStrong }} />
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1L8 6L13 7L8 8L7 13L6 8L1 7L6 6L7 1Z" fill="#b8924a"/>
            </svg>
            <div style={{ flex:1, maxWidth:60, height:'0.5px', background:S.borderStrong }} />
          </div>
          <p style={gs.salutation}>Dragă,</p>
          <p style={gs.guestName}>{guestName || 'Invitat'}</p>
        </FadeIn>
        <FadeIn delay={600}><Divider /></FadeIn>
        <FadeIn delay={900}>
          <div style={gs.coupleNames}>
            Beatrice
            <span style={gs.amp}>&amp;</span>
            Ciprian
          </div>
        </FadeIn>
        <FadeIn delay={1200}><Divider /></FadeIn>
        <FadeIn delay={1500}>
          <p style={gs.invText}>
            Împreună cu părinții și nașii noștri,<br />
            te invităm să fii alături de noi<br />
            în cea mai importantă zi din viața noastră.
          </p>
        </FadeIn>

        <FadeIn delay={1900}><div style={{ margin: '1.8rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem 1rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.gold, marginBottom: '0.4rem' }}>Părinții miresei</div>
            <div style={{ fontFamily: "Georgia, serif", fontStyle: 'italic', fontSize: '0.9rem', color: S.textMid, lineHeight: 1.6 }}>
              Adriana<br />& Gheorghe Toporăscu
            </div>
          </div>
          <div style={{ borderLeft: `0.5px solid ${S.border}`, borderRight: `0.5px solid ${S.border}`, padding: '0 0.8rem' }}>
            <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', color: S.gold, marginBottom: '0.4rem' }}>NAȘII</div>
            <div style={{ fontFamily: "Georgia, serif", fontStyle: 'italic', fontSize: '0.9rem', color: S.textMid, lineHeight: 1.6 }}>
              Sorina<br />& Cătălin Naftan
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.gold, marginBottom: '0.4rem' }}>Părinții mirelui</div>
            <div style={{ fontFamily: "Georgia, serif", fontStyle: 'italic', fontSize: '0.9rem', color: S.textMid, lineHeight: 1.6 }}>
              Violeta<br />& Constantin Bădic
            </div>
          </div>
        </div></FadeIn>
        <FadeIn delay={2300}><div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, margin: '1.8rem 0', alignItems: 'start' }}>
          <div style={{ padding: '0 1rem', textAlign: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block',margin:'0 auto 0.4rem'}}>
              <line x1="16" y1="2" x2="16" y2="10" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="5" x2="20" y2="5" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7 30V18C7 14.686 11.029 12 16 12C20.971 12 25 14.686 25 18V30" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 30H25" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13 30V23C13 21.343 14.343 20 16 20C17.657 20 19 21.343 19 23V30" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 18.5C9 16.015 12.134 14 16 14C19.866 14 23 16.015 23 18.5" stroke="#b8924a" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: S.gold, marginBottom: '0.5rem' }}>Cununia religioasă</div>
            <div style={{ fontFamily: "Georgia, serif", fontStyle: 'italic', fontSize: '0.9rem', color: S.text, marginBottom: '0.4rem', lineHeight: 1.5 }}>
              <a href="https://maps.app.goo.gl/tWnuqjFCTursxxM19" target="_blank" rel="noopener noreferrer" style={{
                color: S.goldDark, textDecoration: 'underline', textDecorationStyle: 'dotted',
                textUnderlineOffset: '3px', cursor: 'pointer', fontStyle: 'inherit'
              }}>Biserica Sf. Teodosie<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline',marginLeft:'4px',verticalAlign:'middle'}}>
              <path d="M12 2C8.134 2 5 5.134 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.134 15.866 2 12 2Z" stroke="#8a6a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="9" r="2.5" stroke="#8a6a2e" strokeWidth="1.5"/>
            </svg></a>
            </div>
            <div style={{ fontSize: '0.8rem', color: S.textMid, letterSpacing: '0.08em' }}>ora 16:30</div>
          </div>
          <div style={{ width: '0.5px', background: S.borderStrong, alignSelf: 'stretch', margin: '0.4rem 0' }} />
          <div style={{ padding: '0 1rem', textAlign: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block',margin:'0 auto 0.4rem'}}>
              <path d="M10 4L8 14C8 17.314 10.686 20 14 20" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 4L24 14C24 17.314 21.314 20 18 20" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="20" x2="16" y2="28" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="28" x2="20" y2="28" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14" y1="20" x2="18" y2="20" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14" y1="9" x2="18" y2="11" stroke="#b8924a" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
            </svg>
            <div style={{ fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: S.gold, marginBottom: '0.5rem' }}>Petrecerea nunții</div>
            <a href="https://maps.app.goo.gl/9xezaKYQ6hvYQtUaA" target="_blank" rel="noopener noreferrer" style={{
              fontFamily: "Georgia, serif", fontStyle: 'italic', fontSize: '0.9rem',
              color: S.goldDark, lineHeight: 1.5, display: 'block',
              textDecoration: 'underline', textDecorationStyle: 'dotted',
              textUnderlineOffset: '3px', cursor: 'pointer', marginBottom: '0.4rem'
            }}>
              Ballroom President<br />Adjud<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline',marginLeft:'4px',verticalAlign:'middle'}}>
              <path d="M12 2C8.134 2 5 5.134 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.134 15.866 2 12 2Z" stroke="#8a6a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="9" r="2.5" stroke="#8a6a2e" strokeWidth="1.5"/>
            </svg>
            </a>
            <div style={{ fontSize: '0.8rem', color: S.textMid, letterSpacing: '0.08em' }}>ora 19:30</div>
          </div>
        </div></FadeIn>
        <FadeIn delay={2700}>
          <div style={{ margin: '1.5rem 0' }}>
            <div style={gs.dateBig}>12 Septembrie 2026</div>
            <div style={gs.dateSub}>Sâmbătă · Vă așteptăm</div>
            <DaysCounter />
          </div>
        </FadeIn>
        <FadeIn delay={3100}><Divider /></FadeIn>
        <FadeIn delay={3400}><button onClick={onRSVP} style={{
          marginTop: '1.5rem', padding: '0.85rem 3rem',
          border: `1px solid ${S.gold}`, background: 'transparent',
          color: S.goldDark, fontFamily: 'inherit', fontSize: '0.75rem',
          fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase',
          cursor: 'pointer'
        }}>
          Confirmă prezența
        </button></FadeIn>
      </div>
      <MuteBtn onToggleMute={onToggleMute} muted={muted} />
    </div>
  );
}

// ── PAGE: RSVP ──
const DIETS = [
  { id: 'bio', label: 'Bio / Organic' },
  { id: 'fara_zahar', label: 'Fără zahăr' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'fara_gluten', label: 'Fără gluten' },
  { id: 'fara_lactoza', label: 'Fără lactoză' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
];

function RSVPPage({ guestId, onDone, onBack }) {
  const [attending, setAttending] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [diets, setDiets] = useState([]);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleDiet = (d) => setDiets(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const submit = async () => {
    if (attending === null) return;
    setLoading(true);
    let gid = guestId;
    if (!gid) {
      const d = await insertGuest({ slug: 'anon-' + Date.now(), name: 'Anonim' });
      gid = d[0]?.id;
    }
    if (gid) {
      await insertRSVP({
        guest_id: gid,
        attending,
        adults: attending ? adults : 0,
        children: attending ? children : 0,
        dietary_preferences: diets,
        dietary_notes: notes,
        message
      });
    }
    setLoading(false);
    onDone(attending);
  };

  const inp = { width: '100%', padding: '0.7rem 0.9rem', border: `1px solid ${S.border}`, background: '#fff', fontFamily: 'inherit', fontSize: '0.9rem', color: S.text, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ ...gs.page, padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,5vw,2.4rem)', fontWeight: 300, textAlign: 'center', color: S.text, marginBottom: '0.3rem' }}>
          Confirmare
        </h1>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.gold, marginBottom: '2rem' }}>
          Răspunsul tău · 12 Sep 2026
        </p>

        {/* Attend */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.textMid, marginBottom: '0.6rem' }}>
            Vei fi prezent(ă)?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            {[{ val: true, icon: 'champagne', label: 'Da, vin cu drag!' }, { val: false, icon: 'flower', label: 'Nu pot veni' }].map(opt => (
              <div key={String(opt.val)} onClick={() => setAttending(opt.val)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem',
                border: `1px solid ${attending === opt.val ? S.gold : S.border}`,
                background: attending === opt.val ? 'rgba(184,146,74,0.05)' : '#fff',
                cursor: 'pointer', gap: '0.3rem', transition: 'all 0.2s'
              }}>
                {opt.icon === 'champagne' ? (
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4L8 14C8 17.314 10.686 20 14 20" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L24 14C24 17.314 21.314 20 18 20" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="20" x2="16" y2="28" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="12" y1="28" x2="20" y2="28" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="14" y1="20" x2="18" y2="20" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="14" cy="7" rx="3" ry="5" fill="#d4b07a" opacity="0.7"/>
                    <ellipse cx="14" cy="7" rx="3" ry="5" fill="#d4b07a" opacity="0.7" transform="rotate(60 14 14)"/>
                    <ellipse cx="14" cy="7" rx="3" ry="5" fill="#d4b07a" opacity="0.7" transform="rotate(120 14 14)"/>
                    <ellipse cx="14" cy="7" rx="3" ry="5" fill="#d4b07a" opacity="0.7" transform="rotate(180 14 14)"/>
                    <ellipse cx="14" cy="7" rx="3" ry="5" fill="#d4b07a" opacity="0.7" transform="rotate(240 14 14)"/>
                    <ellipse cx="14" cy="7" rx="3" ry="5" fill="#d4b07a" opacity="0.7" transform="rotate(300 14 14)"/>
                    <circle cx="14" cy="14" r="4" fill="#b8924a"/>
                  </svg>
                )}
                <span style={{ fontStyle: 'italic', color: attending === opt.val ? S.goldDark : S.textMid, fontSize: '1rem' }}>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {attending === true && (
          <>
            {[{ label: 'Adulți', val: adults, set: setAdults, min: 1, max: 8 }, { label: 'Copii', val: children, set: setChildren, min: 0, max: 8 }].map(f => (
              <div key={f.label} style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.textMid, marginBottom: '0.7rem' }}>{f.label}</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {Array.from({ length: f.max - f.min + 1 }, (_, i) => f.min + i).map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => f.set(n)}
                      style={{
                        width: '3rem', height: '3rem',
                        border: `1px solid ${f.val === n ? S.gold : S.border}`,
                        background: f.val === n ? S.gold : '#fff',
                        color: f.val === n ? '#fff' : S.textMid,
                        fontFamily: 'inherit', fontSize: '1rem',
                        cursor: 'pointer', borderRadius: 0,
                        fontWeight: f.val === n ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}

          </>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.textMid, marginBottom: '0.5rem' }}>
            Un mesaj pentru noi <span style={{ opacity: 0.5 }}>(opțional)</span>
          </label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="Urări, gânduri..." />
        </div>

        <button onClick={submit} disabled={attending === null || loading} style={{
          width: '100%', padding: '0.95rem', background: attending !== null ? S.gold : S.border,
          color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '0.75rem',
          fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase',
          cursor: attending !== null ? 'pointer' : 'not-allowed', marginBottom: '1rem'
        }}>
          {loading ? 'Se trimite...' : 'Trimite răspunsul'}
        </button>

        <div onClick={onBack} style={{ textAlign: 'center', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: S.textLight, cursor: 'pointer' }}>
          ← Înapoi
        </div>
      </div>
    </div>
  );
}

// ── PAGE: Thank You ──
function ThankYouPage({ attending }) {
  // Calendar links — 12 Sep 2026, 16:30 cununie, 19:30 petrecere
  const title = encodeURIComponent('Nunta Beatrice & Ciprian');
  const details = encodeURIComponent('Cununia religioasă: Biserica Sf. Teodosie, ora 16:30\nPetrecerea: Ballroom President Adjud, ora 19:30');
  const location = encodeURIComponent('Adjud, Vrancea, România');
  const start = '20260912T163000';
  const end = '20260913T020000';

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Nunta Beatrice & Ciprian`,
    `DESCRIPTION:Cununia: Biserica Sf. Teodosie 16:30 | Petrecere: Ballroom President Adjud 19:30`,
    `LOCATION:Adjud, Vrancea, Romania`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');

  const downloadIcs = () => {
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nunta-beatrice-ciprian.ics';
    a.click();
  };

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.75rem 1.5rem',
    border: `1px solid ${S.border}`,
    background: '#fff', color: S.goldDark,
    fontFamily: 'inherit', fontSize: '0.72rem',
    letterSpacing: '0.15em', textTransform: 'uppercase',
    cursor: 'pointer', textDecoration: 'none',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ ...gs.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom:'1rem'}}>
        <path d="M24 4L26.5 21.5L44 24L26.5 26.5L24 44L21.5 26.5L4 24L21.5 21.5L24 4Z" stroke="#b8924a" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(184,146,74,0.1)"/>
        <path d="M24 10L25.5 22.5L38 24L25.5 25.5L24 38L22.5 25.5L10 24L22.5 22.5L24 10Z" fill="#b8924a" opacity="0.3"/>
      </svg>
      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 300, color: S.text, marginBottom: '0.5rem' }}>
        {attending ? 'Ne bucurăm!' : 'Cu regret...'}
      </h1>
      <p style={{ fontStyle: 'italic', fontSize: '1.1rem', color: S.textMid, maxWidth: 380, lineHeight: 1.7, marginBottom: attending ? '2rem' : '0' }}>
        {attending
          ? 'Inimile noastre sunt pline de bucurie! Abia așteptăm să sărbătorim alături de tine pe 12 septembrie 2026. Te îmbrățișăm cu drag, Beatrice & Ciprian'
          : 'Îți mulțumim că ne-ai anunțat. Deși ne pare nespus de rău că nu vei putea fi alături de noi, gândurile noastre bune te vor însoți mereu. Cu drag, Beatrice & Ciprian'}
      </p>

      {attending && (
        <>
          <div style={{ fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: S.gold, marginBottom: '1rem' }}>
            Salvează în calendar
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Google Calendar */}
            <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={btnStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#b8924a" strokeWidth="1.5"/>
                <line x1="3" y1="9" x2="21" y2="9" stroke="#b8924a" strokeWidth="1.5"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Google Calendar
            </a>
            {/* Apple / Outlook .ics */}
            <button onClick={downloadIcs} style={btnStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#b8924a" strokeWidth="1.5"/>
                <line x1="3" y1="9" x2="21" y2="9" stroke="#b8924a" strokeWidth="1.5"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 13v4M10 15l2 2 2-2" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Apple / Outlook
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── PAGE: Admin Login ──
function AdminLoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  const login = () => {
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) { onLogin(); }
    else { setErr('Email sau parolă incorectă.'); setTimeout(() => setErr(''), 3000); }
  };

  const inp = { width: '100%', padding: '0.7rem 0.9rem', border: `1px solid ${S.border}`, background: '#fff', fontFamily: 'inherit', fontSize: '0.9rem', color: S.text, outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' };

  return (
    <div style={{ ...gs.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', border: `1px solid ${S.border}`, padding: '2.5rem', width: '100%', maxWidth: 340 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontStyle: 'italic', color: S.gold, fontSize: '1.1rem' }}>C &amp; B</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', fontWeight: 300, textAlign: 'center', color: S.text, marginBottom: '1.8rem' }}>Acces Dashboard</h2>
        <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.textMid, marginBottom: '0.4rem' }}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} style={inp} placeholder="email@nunta.ro" />
        <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.textMid, marginBottom: '0.4rem' }}>Parolă</label>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} style={inp} placeholder="••••••••" />
        {err && <p style={{ color: '#c0392b', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.5rem' }}>{err}</p>}
        <button onClick={login} style={{ width: '100%', padding: '0.9rem', background: S.gold, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer', marginTop: '0.5rem' }}>
          Intră în dashboard
        </button>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: S.textLight, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }} onClick={onBack}>
          ← Invitație demo
        </p>
      </div>
    </div>
  );
}

// ── PAGE: Dashboard ──
let XLSX;
if (typeof window !== 'undefined' && !window._xlsxLoaded) {
  window._xlsxLoaded = true;
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  s.onload = () => { XLSX = window.XLSX; };
  document.head.appendChild(s);
} else if (typeof window !== 'undefined') {
  XLSX = window.XLSX;
}


// ── SEATING EDITOR ──
async function fetchTables() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/seating_tables?select=*&order=created_at.asc`, { headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` } });
  return r.json();
}
async function fetchAssignments() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/seating_assignments?select=*`, { headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` } });
  return r.json();
}

function SeatingEditor({ guests }) {
  const [tables, setTables] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [draggingTable, setDraggingTable] = useState(null);
  const [dragOffset, setDragOffset] = useState({x:0,y:0});
  const [selectedSeat, setSelectedSeat] = useState(null); // {tableId, seatIndex}
  const [editingTable, setEditingTable] = useState(null);
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x:0, y:0});
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({x:0, y:0});
  const ROOM_PRESETS = [
    { label: 'Pătrat', w: 800, h: 800 },
    { label: 'Dreptunghiular', w: 1000, h: 600 },
    { label: 'Lung', w: 1200, h: 500 },
    { label: 'Lat', w: 700, h: 900 },
  ];
  const [canvasDims, setCanvasDims] = useState({ w: 1000, h: 600 });
  const CANVAS_W = canvasDims.w, CANVAS_H = canvasDims.h;

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [t, a] = await Promise.all([fetchTables(), fetchAssignments()]);
    setTables(Array.isArray(t) ? t : []);
    setAssignments(Array.isArray(a) ? a : []);
  };

  const addTable = async () => {
    const name = `Masa ${tables.length + 1}`;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/seating_tables`, {
      method:'POST', headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, 'Content-Type':'application/json', Prefer:'return=representation' },
      body: JSON.stringify({ name, seats:10, x: 150 + (tables.length % 4)*180, y: 150 + Math.floor(tables.length/4)*200 })
    });
    const d = await r.json();
    setTables(prev => [...prev, Array.isArray(d) ? d[0] : d]);
  };

  const deleteTable = async (id) => {
    if (!window.confirm('Ștergi masa?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/seating_tables?id=eq.${id}`, { method:'DELETE', headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` } });
    setTables(prev => prev.filter(t => t.id !== id));
    setAssignments(prev => prev.filter(a => a.table_id !== id));
  };

  const saveTablePos = async (id, x, y) => {
    await fetch(`${SUPABASE_URL}/rest/v1/seating_tables?id=eq.${id}`, {
      method:'PATCH', headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ x, y })
    });
  };

  const saveTableName = async (id, name, seats) => {
    await fetch(`${SUPABASE_URL}/rest/v1/seating_tables?id=eq.${id}`, {
      method:'PATCH', headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ name, seats: parseInt(seats)||10 })
    });
    setTables(prev => prev.map(t => t.id===id ? {...t, name, seats:parseInt(seats)||10} : t));
    setEditingTable(null);
    loadAll();
  };

  const assignGuest = async (tableId, seatIndex, guestId) => {
    // Remove existing assignment for this seat
    await fetch(`${SUPABASE_URL}/rest/v1/seating_assignments?table_id=eq.${tableId}&seat_index=eq.${seatIndex}`, {
      method:'DELETE', headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` }
    });
    if (guestId) {
      // Remove guest from any other seat
      await fetch(`${SUPABASE_URL}/rest/v1/seating_assignments?guest_id=eq.${guestId}`, {
        method:'DELETE', headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` }
      });
      await fetch(`${SUPABASE_URL}/rest/v1/seating_assignments`, {
        method:'POST', headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ table_id:tableId, guest_id:guestId, seat_index:seatIndex })
      });
    }
    await loadAll();
    setSelectedSeat(null);
  };

  // Mouse drag handlers
  const onCanvasMouseDown = (e) => {
    // Only pan if clicking the canvas background (not a table group)
    if (e.target.closest && e.target.closest('[data-table]')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const onMouseDown = (e, table) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPanning(false);
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    // Account for zoom and pan
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const wx = (mx - pan.x) / zoom;
    const wy = (my - pan.y) / zoom;
    setDraggingTable(table.id);
    setDragOffset({ x: wx - table.x, y: wy - table.y });
  };

  const onMouseMove = (e) => {
    if (isPanning && !draggingTable) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (!draggingTable) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const wx = (mx - pan.x) / zoom;
    const wy = (my - pan.y) / zoom;
    const x = Math.max(40, Math.min(CANVAS_W-40, wx - dragOffset.x));
    const y = Math.max(40, Math.min(CANVAS_H-40, wy - dragOffset.y));
    setTables(prev => prev.map(t => t.id===draggingTable ? {...t, x, y} : t));
  };

  const onMouseUp = () => {
    setIsPanning(false);
    if (draggingTable) {
      const t = tables.find(t => t.id===draggingTable);
      if (t) saveTablePos(t.id, t.x, t.y);
      setDraggingTable(null);
    }
  };

  // Touch handlers
  const onTouchStart = (e, table) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const touch = e.touches[0];
    setDraggingTable(table.id);
    setDragOffset({ x: (touch.clientX - rect.left)*scaleX - table.x, y: (touch.clientY - rect.top)*scaleY - table.y });
  };
  const onTouchMove = (e) => {
    if (!draggingTable) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const touch = e.touches[0];
    const x = Math.max(60, Math.min(CANVAS_W-60, (touch.clientX - rect.left)*scaleX - dragOffset.x));
    const y = Math.max(60, Math.min(CANVAS_H-60, (touch.clientY - rect.top)*scaleY - dragOffset.y));
    setTables(prev => prev.map(t => t.id===draggingTable ? {...t, x, y} : t));
  };
  const onTouchEnd = () => onMouseUp();

  const getAssignedGuest = (tableId, seatIndex) => {
    const a = assignments.find(a => a.table_id===tableId && a.seat_index===seatIndex);
    if (!a || !a.guest_id) return null;
    return guests.find(g => g.id===a.guest_id);
  };

  const assignedGuestIds = new Set(assignments.filter(a=>a.guest_id).map(a=>a.guest_id));
  const unassignedGuests = guests.filter(g => !assignedGuestIds.has(g.id));

  const TABLE_R = 42;
  const SEAT_R = 16;

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.8rem', flexWrap:'wrap', gap:'0.5rem' }}>
        <div style={{ fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:S.gold }}>
          Plan sală · drag pentru a muta mesele
        </div>
        <button onClick={addTable} style={{ padding:'0.45rem 1.2rem', background:S.gold, border:'none', color:'#fff', fontFamily:'inherit', fontSize:'0.7rem', letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>
          + Masă nouă
        </button>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.8rem', flexWrap:'wrap' }}>
        <span style={{ fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', color:S.textLight }}>Forma sălii:</span>
        {ROOM_PRESETS.map(p => (
          <button key={p.label} onClick={() => setCanvasDims({w:p.w, h:p.h})}
            style={{ padding:'0.25rem 0.7rem', border:`1px solid ${canvasDims.w===p.w&&canvasDims.h===p.h?S.gold:S.border}`, background: canvasDims.w===p.w&&canvasDims.h===p.h?'rgba(184,146,74,0.08)':'#fff', fontFamily:'inherit', fontSize:'0.65rem', letterSpacing:'0.1em', color: canvasDims.w===p.w&&canvasDims.h===p.h?S.goldDark:S.textMid, cursor:'pointer' }}>
            {p.label}
          </button>
        ))}
        <span style={{ fontSize:'0.6rem', color:S.textLight, marginLeft:'0.5rem' }}>
          sau: <input type="number" value={canvasDims.w} min="500" max="2000" step="50"
            onChange={e => setCanvasDims(d=>({...d, w:parseInt(e.target.value)||d.w}))}
            style={{ width:60, padding:'0.2rem 0.4rem', border:`1px solid ${S.border}`, fontFamily:'inherit', fontSize:'0.75rem', color:S.text, outline:'none' }}/>
          {' × '}
          <input type="number" value={canvasDims.h} min="300" max="1500" step="50"
            onChange={e => setCanvasDims(d=>({...d, h:parseInt(e.target.value)||d.h}))}
            style={{ width:60, padding:'0.2rem 0.4rem', border:`1px solid ${S.border}`, fontFamily:'inherit', fontSize:'0.75rem', color:S.text, outline:'none' }}/>
        </span>
      </div>

      {/* Canvas */}
      {/* Zoom controls */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
        <span style={{ fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', color:S.textLight }}>Zoom:</span>
        <button onClick={() => setZoom(z => Math.min(3, +(z+0.25).toFixed(2)))} style={{ width:28, height:28, border:`1px solid ${S.border}`, background:'#fff', cursor:'pointer', fontSize:'1rem', color:S.goldDark, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
        <span style={{ fontSize:'0.75rem', color:S.textMid, minWidth:36, textAlign:'center' }}>{Math.round(zoom*100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.25, +(z-0.25).toFixed(2)))} style={{ width:28, height:28, border:`1px solid ${S.border}`, background:'#fff', cursor:'pointer', fontSize:'1rem', color:S.goldDark, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
        <button onClick={() => { setZoom(1); setPan({x:0,y:0}); }} style={{ padding:'0.2rem 0.6rem', border:`1px solid ${S.border}`, background:'#fff', cursor:'pointer', fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase', color:S.textMid, fontFamily:'inherit' }}>Reset</button>
        <span style={{ fontSize:'0.6rem', color:S.textLight, marginLeft:'0.5rem' }}>scroll = zoom · drag pe fundal = pan</span>
      </div>

      <div
        ref={canvasRef}
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onWheel={e => { e.preventDefault(); setZoom(z => Math.max(0.25, Math.min(3, +(z - e.deltaY*0.001).toFixed(3)))); }}
        style={{ width:'100%', aspectRatio:`${CANVAS_W}/${CANVAS_H}`, background:'#f8f4ee', border:`1px solid ${S.border}`, position:'relative', overflow:'hidden', cursor: draggingTable ? 'grabbing' : isPanning ? 'grabbing' : 'grab', userSelect:'none', touchAction:'none' }}
      >
        <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} style={{ width:'100%', height:'100%', position:'absolute', top:0, left:0, transform:`scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)`, transformOrigin:'0 0' }}>
          {/* Grid dots */}
          {Array.from({length:18},(_,i)=>Array.from({length:12},(_,j)=>(
            <circle key={`${i}-${j}`} cx={i*52+26} cy={j*52+26} r="1.5" fill={S.border} opacity="0.5"/>
          )))}

          {tables.map(table => {
            const seats = table.seats || 10;
            return (
              <g key={table.id}
                data-table={table.id}
                onMouseDown={e => onMouseDown(e, table)}
                onTouchStart={e => onTouchStart(e, table)}
                style={{ cursor:'grab' }}
              >
                {/* Seats */}
                {Array.from({length:seats},(_,i) => {
                  const angle = (i/seats)*2*Math.PI - Math.PI/2;
                  const sx = table.x + (TABLE_R+SEAT_R+6)*Math.cos(angle);
                  const sy = table.y + (TABLE_R+SEAT_R+6)*Math.sin(angle);
                  const guest = getAssignedGuest(table.id, i);
                  const isSelected = selectedSeat?.tableId===table.id && selectedSeat?.seatIndex===i;
                  return (
                    <g key={i} onClick={e => { e.stopPropagation(); if (!draggingTable) setSelectedSeat({tableId:table.id, seatIndex:i}); }}>
                      <circle cx={sx} cy={sy} r={SEAT_R}
                        fill={guest ? 'rgba(184,146,74,0.15)' : '#fff'}
                        stroke={isSelected ? S.gold : guest ? S.gold : S.border}
                        strokeWidth={isSelected ? 2 : 1}
                        style={{ cursor:'pointer' }}
                      />
                      {guest ? (
                        <text x={sx} y={sy} textAnchor="middle" dominantBaseline="middle"
                          fontSize="7" fill={S.goldDark} fontFamily="Georgia,serif"
                          style={{ pointerEvents:'none' }}>
                          {guest.name.split(' ')[0].slice(0,8)}
                        </text>
                      ) : (
                        <text x={sx} y={sy} textAnchor="middle" dominantBaseline="middle"
                          fontSize="9" fill={S.border} style={{ pointerEvents:'none' }}>+</text>
                      )}
                    </g>
                  );
                })}

                {/* Table circle */}
                <circle cx={table.x} cy={table.y} r={TABLE_R}
                  fill="#fff" stroke={S.gold} strokeWidth="1.5"
                />
                <text x={table.x} y={table.y-8} textAnchor="middle" fontSize="11" fill={S.goldDark} fontFamily="Georgia,serif" fontWeight="600">
                  {table.name}
                </text>
                <text x={table.x} y={table.y+8} textAnchor="middle" fontSize="9" fill={S.textLight} fontFamily="Georgia,serif">
                  {assignments.filter(a=>a.table_id===table.id && a.guest_id).length}/{seats}
                </text>

                {/* Edit / delete icons */}
                <g onClick={e=>{e.stopPropagation(); setEditingTable(table);}} style={{cursor:'pointer'}}>
                  <circle cx={table.x+TABLE_R-8} cy={table.y-TABLE_R+8} r="10" fill="rgba(184,146,74,0.15)" stroke={S.border}/>
                  <text x={table.x+TABLE_R-8} y={table.y-TABLE_R+8} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={S.gold}>✎</text>
                </g>
                <g onClick={e=>{e.stopPropagation(); deleteTable(table.id);}} style={{cursor:'pointer'}}>
                  <circle cx={table.x-TABLE_R+8} cy={table.y-TABLE_R+8} r="10" fill="rgba(231,76,60,0.1)" stroke="rgba(231,76,60,0.3)"/>
                  <text x={table.x-TABLE_R+8} y={table.y-TABLE_R+8} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#c0392b">×</text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Seat assignment popup */}
      {selectedSeat && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={() => setSelectedSeat(null)}>
          <div style={{ background:'#fff', border:`1px solid ${S.border}`, padding:'1.5rem', width:300, maxHeight:'80vh', overflowY:'auto' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:S.gold, marginBottom:'1rem' }}>
              Atribuie loc · {tables.find(t=>t.id===selectedSeat.tableId)?.name} · Scaun {selectedSeat.seatIndex+1}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              <button onClick={() => assignGuest(selectedSeat.tableId, selectedSeat.seatIndex, null)}
                style={{ padding:'0.5rem', border:`1px solid ${S.border}`, background:'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:'0.8rem', color:S.textLight, textAlign:'left' }}>
                — Gol
              </button>
              {guests.map(g => {
                const isHere = assignments.some(a=>a.guest_id===g.id && a.table_id===selectedSeat.tableId && a.seat_index===selectedSeat.seatIndex);
                const assigned = assignedGuestIds.has(g.id) && !isHere;
                return (
                  <button key={g.id} onClick={() => assignGuest(selectedSeat.tableId, selectedSeat.seatIndex, g.id)}
                    style={{ padding:'0.5rem 0.8rem', border:`1px solid ${isHere?S.gold:S.border}`, background: isHere?'rgba(184,146,74,0.08)':'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:'0.85rem', color: assigned ? S.textLight : S.text, textAlign:'left', display:'flex', justifyContent:'space-between' }}>
                    <span>{g.name}</span>
                    {assigned && <span style={{fontSize:'0.65rem', color:S.textLight}}>deja asignat</span>}
                    {isHere && <span style={{fontSize:'0.65rem', color:S.gold}}>✓ aici</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Edit table popup */}
      {editingTable && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={() => setEditingTable(null)}>
          <div style={{ background:'#fff', border:`1px solid ${S.border}`, padding:'1.5rem', width:280 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:S.gold, marginBottom:'1rem' }}>Editează masa</div>
            <input defaultValue={editingTable.name} id="edit-table-name"
              style={{ width:'100%', padding:'0.6rem', border:`1px solid ${S.border}`, fontFamily:'inherit', fontSize:'0.9rem', marginBottom:'0.8rem', boxSizing:'border-box', outline:'none' }}
              placeholder="Numele mesei"/>
            <input defaultValue={editingTable.seats} id="edit-table-seats" type="number" min="4" max="20"
              style={{ width:'100%', padding:'0.6rem', border:`1px solid ${S.border}`, fontFamily:'inherit', fontSize:'0.9rem', marginBottom:'1rem', boxSizing:'border-box', outline:'none' }}
              placeholder="Număr scaune"/>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button onClick={() => saveTableName(editingTable.id, document.getElementById('edit-table-name').value, document.getElementById('edit-table-seats').value)}
                style={{ flex:1, padding:'0.6rem', background:S.gold, border:'none', color:'#fff', fontFamily:'inherit', fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>
                Salvează
              </button>
              <button onClick={() => setEditingTable(null)}
                style={{ padding:'0.6rem 1rem', background:'none', border:`1px solid ${S.border}`, fontFamily:'inherit', fontSize:'0.72rem', cursor:'pointer', color:S.textMid }}>
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unassigned guests */}
      {unassignedGuests.length > 0 && (
        <div style={{ marginTop:'1.5rem' }}>
          <div style={{ fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:S.gold, marginBottom:'0.6rem', paddingBottom:'0.4rem', borderBottom:`1px solid ${S.border}` }}>
            Neasignați ({unassignedGuests.length})
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
            {unassignedGuests.map(g => (
              <span key={g.id} style={{ padding:'0.3rem 0.7rem', border:`1px solid ${S.border}`, fontSize:'0.78rem', color:S.textMid, background:'#fff' }}>
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardPage({ onLogout }) {
  const [guests, setGuests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('guests'); // 'guests' | 'seating'
  const [seatAssignments, setSeatAssignments] = useState([]);
  const [search, setSearch] = useState('');
  const [editingGuest, setEditingGuest] = useState(null); // {id, name}
  const [seatTables, setSeatTables] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [data, tables, assignments] = await Promise.all([
      fetchGuests(),
      fetchTables(),
      fetchAssignments(),
    ]);
    setGuests(Array.isArray(data) ? data : []);
    setSeatTables(Array.isArray(tables) ? tables : []);
    setSeatAssignments(Array.isArray(assignments) ? assignments : []);
    setLoading(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const fileInputRef = useRef(null);

  const exportXLSX = () => {
    const headers = ['Nume','Email','Telefon','Status','Adulți','Copii','Mesaj','Link invitație'];
    const baseUrl = window.location.origin + '/?invite=';
    const rows = guests.map(g => [
      g.name, g.email||'', g.phone||'',
      g.attending===true?'Vine':g.attending===false?'Nu vine':'Neconfirmat',
      g.adults||0, g.children||0, g.message||'',
      baseUrl + encodeURIComponent(g.slug)
    ]);
    const ws_data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    // Column widths
    ws['!cols'] = [30,28,18,14,8,8,40,50].map(w=>({wch:w}));
    // Style header row
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invitați');
    XLSX.writeFile(wb, 'nuntasi-beatrice-ciprian-2026.xlsx');
  };

  const importXLSX = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        // Skip header row, process rest
        const toImport = rows.slice(1).filter(r => r[0]); // must have name
        let added = 0;
        for (const row of toImport) {
          const name = String(row[0]||'').trim();
          const email = String(row[1]||'').trim() || null;
          const phone = String(row[2]||'').trim() || null;
          if (!name) continue;
          const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now().toString(36) + added;
          await insertGuest({ name, slug, email, phone });
          added++;
        }
        showToast(`${added} invitați importați cu succes!`);
        await load();
      } catch(err) {
        showToast('Eroare la import — verifică formatul fișierului');
      }
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const addGuest = async () => {
    if (!newName.trim()) return;
    const slug = newName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now().toString(36);
    await insertGuest({ name: newName.trim(), slug, email: newEmail||null, phone: newPhone||null });
    setNewName(''); setNewEmail(''); setNewPhone('');
    setShowAdd(false);
    showToast(`${newName.trim()} a fost adăugat!`);
    await load();
  };

  const exportCSV = () => {
    const headers = ['Nume','Status','Adulți','Copii','Dietă','Note','Mesaj'];
    const rows = guests.map(g => [g.name, g.attending===true?'Vine':g.attending===false?'Nu vine':'Neconfirmat', g.adults||0, g.children||0, (g.dietary_preferences||[]).join('; '), g.dietary_notes||'', g.message||'']);
    const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv'})); a.download='nuntasi-2026.csv'; a.click();
  };

  const deleteGuest = async (id, name) => {
    if (!window.confirm(`Ștergi invitatul "${name}"?`)) return;
    await fetch(`${SUPABASE_URL}/rest/v1/rsvp_responses?guest_id=eq.${id}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    await fetch(`${SUPABASE_URL}/rest/v1/guests?id=eq.${id}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    showToast(`${name} a fost șters.`);
    await load();
  };

  const updateStatus = async (id, attending) => {
    // Upsert rsvp_response
    const existing = await fetch(`${SUPABASE_URL}/rest/v1/rsvp_responses?guest_id=eq.${id}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    }).then(r => r.json());

    if (existing && existing.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/rsvp_responses?guest_id=eq.${id}`, {
        method: 'PATCH',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ attending })
      });
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/rsvp_responses`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: id, attending, adults: attending ? 1 : 0, children: 0 })
      });
    }
    await load();
  };

  const saveGuestName = async (id, name) => {
    if (!name.trim()) return;
    await fetch(`${SUPABASE_URL}/rest/v1/guests?id=eq.${id}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });
    setGuests(prev => prev.map(g => g.id === id ? { ...g, name: name.trim() } : g));
    setEditingGuest(null);
  };

  const toggleLinkSent = async (id, current) => {
    await fetch(`${SUPABASE_URL}/rest/v1/guests?id=eq.${id}`, {
      method: 'PATCH',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ link_sent: !current })
    });
    setGuests(prev => prev.map(g => g.id === id ? { ...g, link_sent: !current } : g));
  };

  const filtered = guests.filter(g => (filter==='all'?true:filter==='yes'?g.attending===true:filter==='no'?g.attending===false:g.attending===null) && (!search || g.name.toLowerCase().includes(search.toLowerCase())));
  const yes = guests.filter(g=>g.attending===true);
  const no = guests.filter(g=>g.attending===false);
  const pend = guests.filter(g=>g.attending===null);
  const persons = yes.reduce((s,g)=>s+(g.adults||0)+(g.children||0),0);

  const statCard = (num, label) => (
    <div style={{ background:'#fff', border:`1px solid ${S.border}`, padding:'1.1rem 0.8rem', textAlign:'center' }}>
      <div style={{ fontFamily:'Georgia,serif', fontSize:'2.2rem', fontWeight:600, color:S.goldDark, lineHeight:1 }}>{num}</div>
      <div style={{ fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:S.textLight, marginTop:'0.3rem' }}>{label}</div>
    </div>
  );

  const btnSm = (label, onClick, primary=false) => (
    <button onClick={onClick} style={{ padding:'0.45rem 1rem', fontFamily:'inherit', fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', border:`1px solid ${primary?S.gold:S.borderStrong}`, background:primary?S.gold:'#fff', color:primary?'#fff':S.textMid }}>
      {label}
    </button>
  );

  const filterBtn = (label, val) => (
    <button onClick={() => setFilter(val)} style={{ padding:'0.28rem 0.8rem', border:`1px solid ${filter===val?S.gold:S.border}`, background:filter===val?S.gold:'#fff', fontFamily:'inherit', fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase', color:filter===val?'#fff':S.textMid, cursor:'pointer' }}>
      {label}
    </button>
  );

  const inp = { padding:'0.55rem 0.75rem', border:`1px solid ${S.border}`, fontFamily:'inherit', fontSize:'0.82rem', color:S.text, outline:'none', flex:1, minWidth:0 };

  return (
    <div style={{ background:S.cream2, minHeight:'100vh', padding:'1.8rem 1rem 4rem' }}>
      {toast && <div style={{ position:'fixed', bottom:'1.5rem', left:'50%', transform:'translateX(-50%)', background:S.text, color:'#fff', padding:'0.5rem 1.2rem', fontSize:'0.78rem', letterSpacing:'0.08em', zIndex:1000 }}>{toast}</div>}

      <div style={{ maxWidth:860, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.8rem', marginBottom:'1.8rem' }}>
          <div>
            <div style={{ fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:S.gold, marginBottom:'0.2rem' }}>Dashboard nuntași</div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'1.6rem', fontWeight:300, color:S.text }}>Beatrice &amp; Ciprian 2026</div>
          </div>
          <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
            {btnSm('+ Adaugă', () => setShowAdd(s=>!s), true)}
            {btnSm('↓ Export Excel', exportXLSX)}
            {btnSm('↑ Import Excel', () => fileInputRef.current?.click())}
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={importXLSX} style={{display:'none'}} />
            <button onClick={onLogout} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.68rem', letterSpacing:'0.1em', textTransform:'uppercase', color:S.textLight, fontFamily:'inherit' }}>Ieșire</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:'0.8rem', marginBottom:'1.8rem' }}>
          <div onClick={() => { setView('guests'); setFilter('all'); setSearch(''); }} style={{ background:'#fff', border:`1px solid ${S.border}`, padding:'1.1rem 0.8rem', textAlign:'center', cursor:'pointer' }}>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'2.2rem', fontWeight:600, color:S.goldDark, lineHeight:1 }}>{guests.length}</div>
            <div style={{ fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:S.textLight, marginTop:'0.3rem' }}>Invitați totali</div>
          </div>
          <div onClick={() => { setView('guests'); setFilter('yes'); setSearch(''); }} style={{ background:'rgba(39,174,96,0.04)', border:`1px solid rgba(39,174,96,0.2)`, padding:'1.1rem 0.8rem', textAlign:'center', cursor:'pointer' }}>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'2.2rem', fontWeight:600, color:'#1a6b3c', lineHeight:1 }}>{yes.length}</div>
            <div style={{ fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'#1a6b3c', marginTop:'0.3rem', opacity:0.7 }}>Confirmați ✓</div>
          </div>
          <div onClick={() => { setView('guests'); setFilter('no'); setSearch(''); }} style={{ background:'rgba(231,76,60,0.04)', border:`1px solid rgba(231,76,60,0.2)`, padding:'1.1rem 0.8rem', textAlign:'center', cursor:'pointer' }}>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'2.2rem', fontWeight:600, color:'#922b21', lineHeight:1 }}>{no.length}</div>
            <div style={{ fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'#922b21', marginTop:'0.3rem', opacity:0.7 }}>Refuzați</div>
          </div>
          <div onClick={() => { setView('guests'); setFilter('pending'); setSearch(''); }} style={{ background:'rgba(184,146,74,0.04)', border:`1px solid ${S.border}`, padding:'1.1rem 0.8rem', textAlign:'center', cursor:'pointer' }}>
            <div style={{ fontFamily:'Georgia,serif', fontSize:'2.2rem', fontWeight:600, color:S.goldDark, lineHeight:1 }}>{pend.length}</div>
            <div style={{ fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:S.textLight, marginTop:'0.3rem' }}>Fără răspuns</div>
          </div>
          {statCard(persons,'Persoane totale')}
        </div>

        {/* Import hint */}
        <div style={{ background:'rgba(184,146,74,0.06)', border:`1px solid ${S.border}`, padding:'0.7rem 1rem', marginBottom:'1.5rem', fontSize:'0.72rem', color:S.textMid, display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="10" stroke="#b8924a" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span>Import Excel: coloane <strong>Nume</strong> · <strong>Email</strong> · <strong>Telefon</strong> (primul rând = antet, ignorat automat)</span>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{ background:'#fff', border:`1px solid ${S.border}`, padding:'1.2rem', marginBottom:'1.5rem' }}>
            <div style={{ fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:S.gold, marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:`1px solid ${S.border}` }}>Invitat nou</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.7rem', marginBottom:'0.7rem' }}>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nume complet *" style={inp} />
              <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="Email (opțional)" style={inp} />
              <input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="Telefon (opțional)" style={inp} />
            </div>
            <div style={{ display:'flex', gap:'0.6rem' }}>
              {btnSm('Adaugă', addGuest, true)}
              {btnSm('Anulează', () => setShowAdd(false))}
            </div>
          </div>
        )}

        {/* View tabs */}
        <div style={{ display:'flex', gap:'0', marginBottom:'1.5rem', borderBottom:`1px solid ${S.border}` }}>
          {[['guests','Lista invitaților'],['seating','Aranjament la masă']].map(([val,label]) => (
            <button key={val} onClick={() => setView(val)} style={{
              padding:'0.6rem 1.4rem', background:'none', border:'none', borderBottom: view===val ? `2px solid ${S.gold}` : '2px solid transparent',
              fontFamily:'inherit', fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase',
              color: view===val ? S.goldDark : S.textLight, cursor:'pointer', marginBottom:'-1px',
            }}>{label}</button>
          ))}
        </div>

        {view === 'seating' && <SeatingEditor guests={guests} />}

        {view === 'guests' && <>
        {/* Table */}
        <div style={{ fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:S.gold, marginBottom:'0.6rem', paddingBottom:'0.4rem', borderBottom:`1px solid ${S.border}` }}>Lista invitaților</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', marginBottom:'0.8rem' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Caută după nume..."
            style={{ padding:'0.5rem 0.8rem', border:`1px solid ${S.border}`, fontFamily:'inherit', fontSize:'0.9rem', color:S.text, outline:'none', width:'100%', boxSizing:'border-box', background:'#fff' }}
          />
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
            {filterBtn('Toți','all')}{filterBtn('Confirmați','yes')}{filterBtn('Refuzați','no')}{filterBtn('În așteptare','pending')}
          </div>
        </div>

        <div style={{ background:'#fff', border:`1px solid ${S.border}`, overflowX:'auto' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:'3rem', fontStyle:'italic', color:S.textLight }}>Se încarcă...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', fontStyle:'italic', color:S.textLight, fontFamily:'Georgia,serif', fontSize:'1.05rem' }}>Niciun invitat găsit</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
              <thead>
                <tr>
                  {['Nume','Status','Persoane','Masă','Mesaj','Trimis','Link',''].map(h=>(
                    <th key={h} style={{ padding:'0.65rem 0.9rem', textAlign:'left', fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', color:S.textLight, borderBottom:`1px solid ${S.border}`, whiteSpace:'nowrap', fontWeight:400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => {
                  const badge = g.attending===true ? { bg:'rgba(39,174,96,0.1)', color:'#1a6b3c', label:'Vine ✓' } : g.attending===false ? { bg:'rgba(231,76,60,0.1)', color:'#922b21', label:'Nu vine' } : { bg:'rgba(184,146,74,0.15)', color:S.goldDark, label:'În așteptare' };
                  const persons = g.attending ? `${g.adults||0}a + ${g.children||0}c` : '—';
                  const seatA = seatAssignments.find(a => a.guest_id === g.id);
                  const seatTable = seatA ? seatTables.find(t => t.id === seatA.table_id) : null;
                  const link = `${window.location.origin}/?invite=${encodeURIComponent(g.slug)}`;
                  return (
                    <tr key={g.id} style={{ borderBottom:`1px solid ${S.border}` }}>
                      <td style={{ padding:'0.7rem 0.9rem' }}>
                    {editingGuest?.id === g.id ? (
                      <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                        <input
                          autoFocus
                          defaultValue={g.name}
                          onKeyDown={e => { if (e.key==='Enter') saveGuestName(g.id, e.target.value); if (e.key==='Escape') setEditingGuest(null); }}
                          style={{ padding:'0.25rem 0.5rem', border:`1px solid ${S.gold}`, fontFamily:'inherit', fontSize:'0.85rem', color:S.text, outline:'none', width:140 }}
                        />
                        <button onClick={e => saveGuestName(g.id, e.target.closest('td').querySelector('input').value)} style={{ background:'none', border:'none', cursor:'pointer', color:S.gold, fontSize:'0.75rem', fontFamily:'inherit' }}>✓</button>
                        <button onClick={() => setEditingGuest(null)} style={{ background:'none', border:'none', cursor:'pointer', color:S.textLight, fontSize:'0.75rem', fontFamily:'inherit' }}>✕</button>
                      </div>
                    ) : (
                      <span
                        onClick={() => setEditingGuest({id:g.id, name:g.name})}
                        style={{ fontWeight:500, color:S.text, cursor:'pointer', borderBottom:`1px dashed ${S.border}` }}
                        title="Click pentru a edita"
                      >{g.name}</span>
                    )}
                  </td>
                      <td style={{ padding:'0.7rem 0.9rem' }}>
                        <select
                          value={g.attending === true ? 'yes' : g.attending === false ? 'no' : 'pending'}
                          onChange={e => updateStatus(g.id, e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}
                          style={{
                            padding:'0.2rem 0.4rem',
                            border:`1px solid ${badge.color}`,
                            background: badge.bg,
                            color: badge.color,
                            fontFamily:'inherit',
                            fontSize:'0.62rem',
                            letterSpacing:'0.08em',
                            cursor:'pointer',
                            outline:'none',
                            borderRadius:0,
                          }}
                        >
                          <option value="yes">Vine ✓</option>
                          <option value="no">Nu vine</option>
                          <option value="pending">În așteptare</option>
                        </select>
                      </td>
                      <td style={{ padding:'0.7rem 0.9rem', color:S.textMid }}>{persons}</td>
                      <td style={{ padding:'0.7rem 0.9rem', fontSize:'0.74rem', color: seatTable ? S.goldDark : S.textLight }}>
                        {seatTable ? (
                          <span style={{ display:'inline-block', padding:'0.15rem 0.5rem', background:'rgba(184,146,74,0.1)', border:`1px solid ${S.border}`, fontSize:'0.68rem', letterSpacing:'0.05em' }}>
                            {seatTable.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding:'0.7rem 0.9rem', fontSize:'0.74rem', color:S.textMid, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={g.message||''}>{g.message ? (g.message.length>28?g.message.slice(0,28)+'…':g.message) : '—'}</td>
                      <td style={{ padding:'0.7rem 0.9rem', textAlign:'center' }}>
                        <div
                          onClick={() => toggleLinkSent(g.id, g.link_sent)}
                          style={{
                            width: 22, height: 22, margin: '0 auto',
                            border: `1.5px solid ${g.link_sent ? S.gold : S.border}`,
                            background: g.link_sent ? S.gold : '#fff',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                        >
                          {g.link_sent && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </td>
                      <td style={{ padding:'0.7rem 0.9rem' }}>
                        <button onClick={()=>navigator.clipboard.writeText(link).then(()=>showToast('Link copiat!'))} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.68rem', color:S.gold, fontFamily:'inherit', letterSpacing:'0.08em', textTransform:'uppercase', padding:0 }}>
                          Copiază link
                        </button>
                      </td>
                      <td style={{ padding:'0.7rem 0.9rem' }}>
                        <button onClick={()=>deleteGuest(g.id, g.name)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.68rem', color:'#c0392b', fontFamily:'inherit', letterSpacing:'0.08em', textTransform:'uppercase', padding:0, opacity:0.7 }}>
                          ✕ Șterge
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        </>}
      </div>
    </div>
  );
}

// ── APP ──

function EnvelopeIntro({ onOpen, guestName, onStartAudio, onToggleMute, muted }) {
  const [phase, setPhase] = useState('idle');
  const [particles, setParticles] = useState([]);
  const [lightRings, setLightRings] = useState([]);
  const canvasRef = React.useRef(null);

  const handleClick = () => {
    if (phase !== 'idle') return;
    setPhase('crack');
    if (onStartAudio) onStartAudio();
    // Generate gold particles
    const pts = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: 50, y: 42,
      angle: (Math.random() * 360),
      speed: 1.5 + Math.random() * 4,
      size: 2 + Math.random() * 4,
      opacity: 1,
      color: ['#f0d060','#c9a84c','#b8924a','#ffe080','#e8c860'][Math.floor(Math.random()*5)],
    }));
    setParticles(pts);
    // Light rings
    setLightRings([1,2,3]);
    setTimeout(() => setPhase('open'), 1200);
    setTimeout(() => setPhase('done'), 3500);
    setTimeout(() => onOpen(), 5200);
  };

  useEffect(() => {
    if (phase !== 'crack' && phase !== 'open') return;
    let frame;
    let tick = 0;
    const animate = () => {
      tick++;
      setParticles(prev => prev.map(p => {
        const rad = p.angle * Math.PI / 180;
        return {
          ...p,
          x: p.x + Math.cos(rad) * p.speed * 0.6,
          y: p.y + Math.sin(rad) * p.speed * 0.6 + tick * 0.04,
          opacity: Math.max(0, p.opacity - 0.012),
          size: p.size * 0.995,
        };
      }));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const sealCracked = phase === 'crack' || phase === 'open' || phase === 'done';
  const flapOpen = phase === 'open' || phase === 'done';
  const fadeOut = phase === 'done';

  return (
    <div
      onClick={handleClick}
      style={{
        minHeight: '100svh', height: '100svh',
        background: 'radial-gradient(ellipse at 50% 60%, #1e3a1e 0%, #0d1a0d 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: phase === 'idle' ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'opacity 0.2s ease 5s',
        opacity: fadeOut ? 0 : 1,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Animated gold dust background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'radial-gradient(circle, #b8924a 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        animation: phase === 'idle' ? 'bgFloat 8s ease-in-out infinite' : 'none',
      }} />

      {/* Light burst on crack */}
      {sealCracked && lightRings.map((r, i) => (
        <div key={r} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 10, height: 10,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,220,80,0.9) 0%, rgba(184,146,74,0.4) 40%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          animation: `lightBurst${i+1} 1.2s ease-out forwards`,
          animationDelay: `${i * 0.15}s`,
          zIndex: 20,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Gold particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15 }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '1px',
            background: p.color,
            opacity: p.opacity,
            transform: `rotate(${p.angle}deg)`,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            transition: 'none',
          }} />
        ))}
      </div>

      {/* Envelope wrapper with 3D perspective */}
      <div style={{
        perspective: 900,
        transform: phase === 'crack' ? 'scale(1.06)' : phase === 'open' ? 'scale(1.0)' : 'scale(1)',
        transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
      {/* Envelope SVG */}
      <div style={{
        position: 'relative', width: 320, height: 220,
        transform: flapOpen ? 'rotateY(3deg)' : 'rotateY(0deg)',
        transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
        transformStyle: 'preserve-3d',
      }}>
        <svg viewBox="0 0 320 220" width="320" height="220" style={{
          filter: `drop-shadow(0 ${flapOpen ? 30 : 20}px ${flapOpen ? 60 : 40}px rgba(0,0,0,0.6)) drop-shadow(0 0 ${sealCracked ? 20 : 0}px rgba(184,146,74,0.3))`,
          transition: 'filter 0.8s ease',
        }}>
          {/* Envelope body */}
          <rect x="10" y="80" width="300" height="130" rx="4" fill="#1e3a1e" stroke="#3a6b3a" strokeWidth="1.5"/>
          {/* Gold border glow on open */}
          {flapOpen && <rect x="10" y="80" width="300" height="130" rx="4" fill="none" stroke="#b8924a" strokeWidth="0.8" opacity="0.4"/>}
          {/* Bottom triangle folds */}
          <path d="M10 210 L160 130 L310 210Z" fill="#172e17" stroke="#3a6b3a" strokeWidth="0.8"/>
          {/* Left fold */}
          <path d="M10 80 L160 155 L10 210Z" fill="#1a321a" stroke="#3a6b3a" strokeWidth="0.8"/>
          {/* Right fold */}
          <path d="M310 80 L160 155 L310 210Z" fill="#1a321a" stroke="#3a6b3a" strokeWidth="0.8"/>
          {/* Flap */}
          <g style={{
            transformOrigin: '160px 80px',
            transform: flapOpen ? 'rotateX(185deg)' : 'rotateX(0deg)',
            transition: 'transform 1.4s cubic-bezier(0.4,0,0.2,1)',
            transformBox: 'fill-box',
          }}>
            <path d="M10 80 L160 170 L310 80Z" fill="#1e3a1e" stroke="#3a6b3a" strokeWidth="1.5"/>
            <path d="M30 80 L160 158 L290 80Z" fill="#172e17" opacity="0.5"/>
            {flapOpen && <path d="M10 80 L160 170 L310 80Z" fill="none" stroke="#b8924a" strokeWidth="0.6" opacity="0.3"/>}
          </g>
          {/* Letter peeking out when open */}
          {flapOpen && (
            <g style={{ animation: 'letterRise 1s 0.8s ease-out forwards', opacity: 0 }}>
              <rect x="60" y="90" width="200" height="110" rx="2" fill="#faf6f0" opacity="0.95"/>
              <line x1="80" y1="115" x2="240" y2="115" stroke="#d4b07a" strokeWidth="0.8" opacity="0.5"/>
              <line x1="80" y1="128" x2="240" y2="128" stroke="#d4b07a" strokeWidth="0.8" opacity="0.5"/>
              <line x1="80" y1="141" x2="200" y2="141" stroke="#d4b07a" strokeWidth="0.8" opacity="0.5"/>
              <path d="M145 100 C145 100 135 93 130 96 C125 99 128 106 135 106 C140 106 145 102 145 100 C145 98 150 94 155 96 C161 99 158 106 153 106 C148 106 145 100 145 100Z" fill="#b8924a" opacity="0.6"/>
            </g>
          )}
        </svg>

        {/* Wax Seal */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(-50%, -30%) ${sealCracked ? 'scale(1.3) rotate(15deg)' : 'scale(1) rotate(0deg)'}`,
          transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
          opacity: sealCracked ? 0 : 1,
          zIndex: 10,
          filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.5))',
        }}>
          <svg viewBox="0 0 90 90" width="90" height="90" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
            {/* Outer ring */}
            <circle cx="45" cy="45" r="42" fill="#c9a84c"/>
            <circle cx="45" cy="45" r="38" fill="#b8924a"/>
            <circle cx="45" cy="45" r="36" fill="#c9a84c"/>
            {/* Wax texture */}
            <circle cx="45" cy="45" r="34" fill="#b8924a" opacity="0.6"/>
            {/* Elegant heart with flourishes */}
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Main heart */}
              <path d="M45 58 C45 58 28 47 28 37 C28 31 33 27 38 27 C41 27 44 29 45 31 C46 29 49 27 52 27 C57 27 62 31 62 37 C62 47 45 58 45 58Z" fill="#7a5c20" opacity="0.85"/>
              {/* Inner highlight */}
              <path d="M45 54 C45 54 31 44 31 37 C31 33 35 30 38 30 C41 30 43 32 45 34" stroke="#c9a84c" strokeWidth="0.8" opacity="0.5"/>
              {/* Top flourish left */}
              <path d="M33 30 C30 25 25 24 24 20" stroke="#7a5c20" strokeWidth="1" opacity="0.7"/>
              <path d="M24 20 C26 19 28 20 28 22" stroke="#7a5c20" strokeWidth="0.8" opacity="0.6"/>
              <circle cx="23" cy="19" r="1.2" fill="#7a5c20" opacity="0.6"/>
              {/* Top flourish right */}
              <path d="M57 30 C60 25 65 24 66 20" stroke="#7a5c20" strokeWidth="1" opacity="0.7"/>
              <path d="M66 20 C64 19 62 20 62 22" stroke="#7a5c20" strokeWidth="0.8" opacity="0.6"/>
              <circle cx="67" cy="19" r="1.2" fill="#7a5c20" opacity="0.6"/>
              {/* Bottom flourish */}
              <path d="M45 58 C45 62 43 65 45 68" stroke="#7a5c20" strokeWidth="0.8" opacity="0.6"/>
              <path d="M45 68 C43 67 41 68 42 70" stroke="#7a5c20" strokeWidth="0.8" opacity="0.5"/>
              <path d="M45 68 C47 67 49 68 48 70" stroke="#7a5c20" strokeWidth="0.8" opacity="0.5"/>
              <circle cx="41" cy="71" r="1" fill="#7a5c20" opacity="0.5"/>
              <circle cx="49" cy="71" r="1" fill="#7a5c20" opacity="0.5"/>
              {/* Small dots around */}
              <circle cx="32" cy="24" r="1" fill="#7a5c20" opacity="0.5"/>
              <circle cx="58" cy="24" r="1" fill="#7a5c20" opacity="0.5"/>
            </g>
          </svg>
        </div>

        {/* Crack effect - fragments flying */}
        {sealCracked && (
          <>
            {[0,60,120,180,240,300].map((angle, i) => (
              <div key={i} style={{
                position: 'absolute', top: '50%', left: '50%',
                zIndex: 12,
                animation: `fragment${i} 0.8s ease-out forwards`,
                transformOrigin: 'center',
              }}>
                <svg viewBox="0 0 30 30" width="28" height="28">
                  <path d="M15 2 L22 12 L15 22 L8 12Z" fill="#c9a84c" opacity="0.8"/>
                  <path d="M15 5 L20 12 L15 19 L10 12Z" fill="#b8924a" opacity="0.6"/>
                </svg>
              </div>
            ))}
          </>
        )}
      </div>
      </div>{/* end 3D wrapper */}

      {/* Organic paper zoom transition */}
      {phase === 'done' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute',
            width: '10px', height: '10px',
            borderRadius: '50%',
            background: '#faf6f0',
            animation: 'paperGrow 1.4s cubic-bezier(0.22,1,0.36,1) forwards',
          }} />
        </div>
      )}

      {/* Greeting + Hint */}
      <div style={{
        marginTop: '2.5rem', textAlign: 'center',
        transition: 'opacity 0.8s, transform 0.8s',
        opacity: phase === 'idle' ? 1 : 0,
        transform: phase === 'idle' ? 'translateY(0)' : 'translateY(20px)',
      }}>
        <p style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          color: 'rgba(212,176,122,0.98)',
          marginBottom: '0.8rem',
          letterSpacing: '0.02em',
          textShadow: '0 0 30px rgba(184,146,74,0.4)',
          animation: 'nameGlow 3s ease-in-out infinite',
        }}>
          Dragă, {guestName || 'Invitat'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', opacity: 0.7 }}>
          <div style={{ width: 40, height: '0.5px', background: 'rgba(184,146,74,0.5)' }} />
          <p style={{
            fontSize: '0.62rem', letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'rgba(184,146,74,0.8)', animation: 'pulse 2.5s ease-in-out infinite', margin: 0,
          }}>
            Apasă pentru a deschide
          </p>
          <div style={{ width: 40, height: '0.5px', background: 'rgba(184,146,74,0.5)' }} />
        </div>
      </div>

      {/* Mute button */}
      {phase !== 'idle' && phase !== 'done' && (
        <button
          onClick={e => { e.stopPropagation(); if (onToggleMute) onToggleMute(); }}
          style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem',
            background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(184,146,74,0.4)',
            borderRadius: '50%', width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 200, backdropFilter: 'blur(4px)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            {muted ? (
              <>
                <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="#b8924a"/>
                <line x1="23" y1="9" x2="17" y2="15" stroke="#b8924a" strokeWidth="2" strokeLinecap="round"/>
                <line x1="17" y1="9" x2="23" y2="15" stroke="#b8924a" strokeWidth="2" strokeLinecap="round"/>
              </>
            ) : (
              <>
                <path d="M11 5L6 9H2v6h4l5 4V5Z" fill="#b8924a"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#b8924a" strokeWidth="1.5" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes bgFloat { 0%,100%{background-position:0 0} 50%{background-position:14px 14px} }
        @keyframes nameGlow { 0%,100%{text-shadow:0 0 20px rgba(184,146,74,0.3)} 50%{text-shadow:0 0 40px rgba(184,146,74,0.7), 0 0 80px rgba(184,146,74,0.2)} }
        @keyframes letterRise { 0%{opacity:0;transform:translateY(30px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes lightBurst1 { 0%{width:10px;height:10px;opacity:1} 100%{width:600px;height:600px;opacity:0} }
        @keyframes lightBurst2 { 0%{width:10px;height:10px;opacity:0.8} 100%{width:400px;height:400px;opacity:0} }
        @keyframes lightBurst3 { 0%{width:10px;height:10px;opacity:0.6} 100%{width:250px;height:250px;opacity:0} }
        @keyframes fragment0 { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% - 80px),calc(-50% - 80px)) scale(0.3) rotate(120deg);opacity:0} }
        @keyframes fragment1 { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% + 20px),calc(-50% - 100px)) scale(0.2) rotate(-90deg);opacity:0} }
        @keyframes fragment2 { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% + 90px),calc(-50% - 60px)) scale(0.4) rotate(200deg);opacity:0} }
        @keyframes fragment3 { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% + 80px),calc(-50% + 60px)) scale(0.25) rotate(-150deg);opacity:0} }
        @keyframes fragment4 { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% - 20px),calc(-50% + 90px)) scale(0.35) rotate(80deg);opacity:0} }
        @keyframes fragment5 { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% - 90px),calc(-50% + 40px)) scale(0.2) rotate(-200deg);opacity:0} }
        @keyframes paperGrow {
          0%   { width:10px; height:10px; }
          100% { width:300vmax; height:300vmax; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const slug = new URLSearchParams(window.location.search).get('invite');
  const isAdmin = slug === 'admin';

  const alreadyLoggedIn = isAdmin && sessionStorage.getItem('wedding_admin') === 'true';
  const [page, setPage] = useState(isAdmin ? (alreadyLoggedIn ? 'dashboard' : 'admin-login') : 'envelope');
  const [guestName, setGuestName] = useState('Invitat');
  const [guestId, setGuestId] = useState(null);
  const [attending, setAttending] = useState(null);

  // Load guest name from slug
  useEffect(() => {
    if (!slug || slug === 'admin') return;
    fetch(`${SUPABASE_URL}/rest/v1/guests?select=id,name&slug=eq.${slug}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    })
    .then(r => r.json())
    .then(data => {
      if (data && data[0]) {
        setGuestName(data[0].name);
        setGuestId(data[0].id);
      }
    })
    .catch(() => {});
  }, []);
  const [muted, setMuted] = useState(false);
  const globalAudioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/experience.mp3');
    audio.loop = true;
    audio.volume = 0;
    globalAudioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  const startAudio = () => {
    const audio = globalAudioRef.current;
    if (!audio) return;
    audio.play().catch(() => {});
    let vol = 0;
    const fade = setInterval(() => {
      vol = Math.min(0.35, vol + 0.01);
      audio.volume = vol;
      if (vol >= 0.35) clearInterval(fade);
    }, 80);
  };

  const toggleMute = () => {
    setMuted(m => {
      const next = !m;
      if (globalAudioRef.current) globalAudioRef.current.muted = next;
      return next;
    });
  };

  if (page === 'envelope') return <EnvelopeIntro guestName={guestName} onOpen={() => setPage('invitation')} onStartAudio={startAudio} onToggleMute={toggleMute} muted={muted} />;
  if (page === 'invitation') return <InvitationPage guestName={guestName} onRSVP={() => setPage('rsvp')} onToggleMute={toggleMute} muted={muted} />;
  if (page === 'rsvp') return <RSVPPage guestId={guestId} onDone={(a) => { setAttending(a); setPage('thankyou'); }} onBack={() => setPage('invitation')} />;
  if (page === 'thankyou') return <ThankYouPage attending={attending} />;
  if (page === 'admin-login') return <AdminLoginPage onLogin={() => { sessionStorage.setItem('wedding_admin','true'); setPage('dashboard'); }} onBack={() => setPage('invitation')} />;
  if (page === 'dashboard') return <DashboardPage onLogout={() => { sessionStorage.removeItem('wedding_admin'); setPage('invitation'); }} />;
  return null;
}
