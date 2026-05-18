import { useState, useEffect, useRef } from "react";

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

function InvitationPage({ guestName, onRSVP }) {
  return (
    <div style={{...gs.page, position:'relative'}}>
      <DamaskBg />
      <div style={{...gs.container, position:'relative', zIndex:1}}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', justifyContent:'center', marginBottom:'0.5rem' }}>
          <div style={{ flex:1, maxWidth:60, height:'0.5px', background:S.borderStrong }} />
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1L8 6L13 7L8 8L7 13L6 8L1 7L6 6L7 1Z" fill="#b8924a"/>
          </svg>
          <div style={{ flex:1, maxWidth:60, height:'0.5px', background:S.borderStrong }} />
        </div>
        <p style={gs.salutation}>Dragă,</p>
        <p style={gs.guestName}>{guestName || 'Invitat Drag'}</p>
        <Divider />
        <div style={gs.coupleNames}>
          Beatrice
          <span style={gs.amp}>&amp;</span>
          Ciprian
        </div>
        <Divider />
        <p style={gs.invText}>
          Împreună cu părinții și nașii noștri,<br />
          te invităm să fii alături de noi<br />
          în cea mai importantă zi din viața noastră.
        </p>

        <div style={{ margin: '1.8rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem 1rem', textAlign: 'center' }}>
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
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, margin: '1.8rem 0', alignItems: 'start' }}>
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
        </div>
        <div style={{ margin: '1.5rem 0' }}>
          <div style={gs.dateBig}>12 Septembrie 2026</div>
          <div style={gs.dateSub}>Sâmbătă · Vă așteptăm</div>
        </div>
        <Divider />
        <button onClick={onRSVP} style={{
          marginTop: '1.5rem', padding: '0.85rem 3rem',
          border: `1px solid ${S.gold}`, background: 'transparent',
          color: S.goldDark, fontFamily: 'inherit', fontSize: '0.75rem',
          fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase',
          cursor: 'pointer'
        }}>
          Confirmă prezența
        </button>
      </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {[{ label: 'Adulți', val: adults, set: setAdults }, { label: 'Copii', val: children, set: setChildren }].map(f => (
                <div key={f.label}>
                  <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: S.textMid, marginBottom: '0.5rem' }}>{f.label}</label>
                  <input type="number" min="0" max="10" value={f.val} onChange={e => f.set(parseInt(e.target.value)||0)} style={inp} />
                </div>
              ))}
            </div>

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
  return (
    <div style={{ ...gs.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom:'1rem'}}>
      <path d="M24 4L26.5 21.5L44 24L26.5 26.5L24 44L21.5 26.5L4 24L21.5 21.5L24 4Z" stroke="#b8924a" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(184,146,74,0.1)"/>
      <path d="M24 10L25.5 22.5L38 24L25.5 25.5L24 38L22.5 25.5L10 24L22.5 22.5L24 10Z" fill="#b8924a" opacity="0.3"/>
    </svg>
      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 300, color: S.text, marginBottom: '0.5rem' }}>
        {attending ? 'Ne bucurăm!' : 'Cu regret...'}
      </h1>
      <p style={{ fontStyle: 'italic', fontSize: '1.1rem', color: S.textMid, maxWidth: 380, lineHeight: 1.7 }}>
        {attending
          ? 'Inimile noastre sunt pline de bucurie! Abia așteptăm să sărbătorim alături de tine pe 12 septembrie 2026. Te îmbrățișăm cu drag, Beatrice & Ciprian'
          : 'Îți mulțumim că ne-ai anunțat. Deși ne pare nespus de rău că nu vei putea fi alături de noi, gândurile noastre bune te vor însoți mereu. Cu drag, Beatrice & Ciprian'}
      </p>
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

function DashboardPage({ onLogout }) {
  const [guests, setGuests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await fetchGuests();
    setGuests(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const fileInputRef = useRef(null);

  const exportXLSX = () => {
    const headers = ['Nume','Email','Telefon','Status','Adulți','Copii','Mesaj','Link invitație'];
    const baseUrl = 'https://nunta-ciprian-beatrice.netlify.app/?invite=';
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

  const filtered = guests.filter(g => filter==='all'?true:filter==='yes'?g.attending===true:filter==='no'?g.attending===false:g.attending===null);
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
          {statCard(guests.length,'Invitați totali')}
          {statCard(yes.length,'Confirmați ✓')}
          {statCard(no.length,'Refuzați')}
          {statCard(pend.length,'Fără răspuns')}
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

        {/* Table */}
        <div style={{ fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', color:S.gold, marginBottom:'0.6rem', paddingBottom:'0.4rem', borderBottom:`1px solid ${S.border}` }}>Lista invitaților</div>
        <div style={{ display:'flex', gap:'0.4rem', marginBottom:'0.8rem', flexWrap:'wrap' }}>
          {filterBtn('Toți','all')}{filterBtn('Confirmați','yes')}{filterBtn('Refuzați','no')}{filterBtn('În așteptare','pending')}
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
                  {['Nume','Status','Persoane','Dietă','Mesaj','Link'].map(h=>(
                    <th key={h} style={{ padding:'0.65rem 0.9rem', textAlign:'left', fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', color:S.textLight, borderBottom:`1px solid ${S.border}`, whiteSpace:'nowrap', fontWeight:400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => {
                  const badge = g.attending===true ? { bg:'rgba(39,174,96,0.1)', color:'#1a6b3c', label:'Vine ✓' } : g.attending===false ? { bg:'rgba(231,76,60,0.1)', color:'#922b21', label:'Nu vine' } : { bg:'rgba(184,146,74,0.15)', color:S.goldDark, label:'În așteptare' };
                  const diet = (g.dietary_preferences||[]).join(', ') || '—';
                  const persons = g.attending ? `${g.adults||0}a + ${g.children||0}c` : '—';
                  const link = `https://nunta-ciprian-beatrice.netlify.app/?invite=${encodeURIComponent(g.slug)}`;
                  return (
                    <tr key={g.id} style={{ borderBottom:`1px solid ${S.border}` }}>
                      <td style={{ padding:'0.7rem 0.9rem', fontWeight:500, color:S.text }}>{g.name}</td>
                      <td style={{ padding:'0.7rem 0.9rem' }}>
                        <span style={{ display:'inline-block', padding:'0.18rem 0.55rem', fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', background:badge.bg, color:badge.color }}>{badge.label}</span>
                      </td>
                      <td style={{ padding:'0.7rem 0.9rem', color:S.textMid }}>{persons}</td>
                      <td style={{ padding:'0.7rem 0.9rem', fontSize:'0.74rem', color:S.textMid, maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={diet}>{diet}</td>
                      <td style={{ padding:'0.7rem 0.9rem', fontSize:'0.74rem', color:S.textMid, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={g.message||''}>{g.message ? (g.message.length>28?g.message.slice(0,28)+'…':g.message) : '—'}</td>
                      <td style={{ padding:'0.7rem 0.9rem' }}>
                        <button onClick={()=>navigator.clipboard.writeText(link).then(()=>showToast('Link copiat!'))} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.68rem', color:S.gold, fontFamily:'inherit', letterSpacing:'0.08em', textTransform:'uppercase', padding:0 }}>
                          Copiază link
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── APP ──

function EnvelopeIntro({ onOpen, guestName }) {
  const [phase, setPhase] = useState('idle'); // idle -> crack -> open -> done

  const handleClick = () => {
    if (phase !== 'idle') return;
    setPhase('crack');
    setTimeout(() => setPhase('open'), 900);
    setTimeout(() => setPhase('done'), 2200);
    setTimeout(() => onOpen(), 2600);
  };

  const sealCracked = phase === 'crack' || phase === 'open' || phase === 'done';
  const flapOpen = phase === 'open' || phase === 'done';
  const fadeOut = phase === 'done';

  return (
    <div
      onClick={handleClick}
      style={{
        minHeight: '100svh',
        height: '100svh',
        background: '#1a2e1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: phase === 'idle' ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'opacity 0.6s ease',
        opacity: fadeOut ? 0 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle texture overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'radial-gradient(circle, #b8924a 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      {/* Envelope SVG */}
      <div style={{ position: 'relative', width: 320, height: 220 }}>
        <svg viewBox="0 0 320 220" width="320" height="220" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}>
          {/* Envelope body */}
          <rect x="10" y="80" width="300" height="130" rx="4" fill="#1e3a1e" stroke="#3a6b3a" strokeWidth="1.5"/>
          {/* Bottom triangle folds */}
          <path d="M10 210 L160 130 L310 210Z" fill="#172e17" stroke="#3a6b3a" strokeWidth="0.8"/>
          {/* Left fold */}
          <path d="M10 80 L160 155 L10 210Z" fill="#1a321a" stroke="#3a6b3a" strokeWidth="0.8"/>
          {/* Right fold */}
          <path d="M310 80 L160 155 L310 210Z" fill="#1a321a" stroke="#3a6b3a" strokeWidth="0.8"/>

          {/* Flap - animates open */}
          <g style={{
            transformOrigin: '160px 80px',
            transform: flapOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
            transition: 'transform 0.9s cubic-bezier(0.4,0,0.2,1)',
            transformBox: 'fill-box',
          }}>
            <path d="M10 80 L160 170 L310 80Z" fill="#1e3a1e" stroke="#3a6b3a" strokeWidth="1.5"/>
            {/* Flap inner shadow */}
            <path d="M30 80 L160 158 L290 80Z" fill="#172e17" opacity="0.5"/>
          </g>
        </svg>

        {/* Wax Seal */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -30%)',
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          opacity: sealCracked ? 0 : 1,
          zIndex: 10,
        }}>
          <svg viewBox="0 0 90 90" width="90" height="90" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
            {/* Outer ring */}
            <circle cx="45" cy="45" r="42" fill="#c9a84c"/>
            <circle cx="45" cy="45" r="38" fill="#b8924a"/>
            <circle cx="45" cy="45" r="36" fill="#c9a84c"/>
            {/* Wax texture */}
            <circle cx="45" cy="45" r="34" fill="#b8924a" opacity="0.6"/>
            {/* Wheat stalks (like in photo) */}
            <g stroke="#7a5c20" strokeWidth="1.2" fill="none" strokeLinecap="round">
              {/* Left stalk */}
              <path d="M38 65 C36 55 34 45 36 32"/>
              <path d="M36 32 C33 28 30 30 31 34"/>
              <path d="M36 32 C34 27 36 24 38 27"/>
              <path d="M36 36 C33 32 30 33 31 37"/>
              <path d="M36 36 C34 31 37 29 38 33"/>
              <path d="M36 40 C33 37 31 38 32 42"/>
              <path d="M36 40 C35 36 37 34 38 37"/>
              <path d="M36 44 C34 41 32 43 33 46"/>
              <path d="M36 44 C35 41 37 39 38 42"/>
              {/* Right stalk */}
              <path d="M50 65 C51 55 52 45 50 32"/>
              <path d="M50 32 C52 28 55 30 54 34"/>
              <path d="M50 32 C52 27 50 24 48 27"/>
              <path d="M50 36 C53 32 56 33 55 37"/>
              <path d="M50 36 C52 31 49 29 48 33"/>
              <path d="M50 40 C53 37 55 38 54 42"/>
              <path d="M50 40 C52 36 49 34 48 37"/>
              <path d="M50 44 C52 41 54 43 53 46"/>
              <path d="M50 44 C52 41 49 39 48 42"/>
              {/* Binding */}
              <path d="M38 58 Q44 55 50 58" strokeWidth="1.5"/>
              <path d="M38 60 Q44 57 50 60" strokeWidth="1.5"/>
            </g>
          </svg>
        </div>

        {/* Crack effect */}
        {sealCracked && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -30%)',
            zIndex: 10, animation: 'sealCrack 0.3s ease-out forwards',
          }}>
            <svg viewBox="0 0 90 90" width="90" height="90">
              <circle cx="45" cy="45" r="42" fill="#c9a84c" opacity="0.4"/>
              <path d="M45 20 L50 38 L65 30 L52 45 L70 50 L50 52 L55 70 L44 55 L30 65 L40 48 L22 45 L38 40Z" fill="none" stroke="#7a5c20" strokeWidth="1" opacity="0.6"/>
            </svg>
          </div>
        )}
      </div>

      {/* Greeting + Hint */}
      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        transition: 'opacity 0.5s',
        opacity: phase === 'idle' ? 1 : 0,
      }}>
        <p style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
          color: 'rgba(212,176,122,0.95)',
          marginBottom: '0.6rem',
          letterSpacing: '0.02em',
        }}>
          Dragă, {guestName || 'Invitat Drag'}
        </p>
        <p style={{
          fontSize: '0.68rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(184,146,74,0.6)',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          Apasă pentru a deschide
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes sealCrack {
          0% { transform: translate(-50%, -30%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -30%) scale(1.15); opacity: 0.7; }
          100% { transform: translate(-50%, -30%) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('envelope');
  const [guestName, setGuestName] = useState('Ion Popescu');
  const [guestId] = useState(null);
  const [attending, setAttending] = useState(null);

  if (page === 'envelope') return <EnvelopeIntro guestName={guestName} onOpen={() => setPage('invitation')} />;
  if (page === 'invitation') return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(250,246,240,0.95)', borderBottom: '0.5px solid rgba(184,146,74,0.3)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a0856a', whiteSpace: 'nowrap' }}>Preview invitat:</span>
        <input
          value={guestName}
          onChange={e => setGuestName(e.target.value)}
          style={{ border: '0.5px solid rgba(184,146,74,0.5)', background: 'transparent', padding: '0.25rem 0.6rem', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.95rem', color: '#8a6a2e', outline: 'none', minWidth: 160, textAlign: 'center' }}
        />
        <button onClick={() => setPage('dashboard')} style={{ marginLeft: '0.5rem', padding: '0.25rem 0.9rem', border: '0.5px solid rgba(184,146,74,0.6)', background: 'transparent', fontFamily: 'inherit', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a6a2e', cursor: 'pointer' }}>
          Dashboard →
        </button>
      </div>
      <div style={{ paddingTop: '3.5rem' }}>
        <InvitationPage guestName={guestName} onRSVP={() => setPage('rsvp')} />
      </div>
    </>
  );
  if (page === 'rsvp') return <RSVPPage guestId={guestId} onDone={(a) => { setAttending(a); setPage('thankyou'); }} onBack={() => setPage('invitation')} />;
  if (page === 'thankyou') return <ThankYouPage attending={attending} />;
  if (page === 'admin-login') return <AdminLoginPage onLogin={() => setPage('dashboard')} onBack={() => setPage('invitation')} />;
  if (page === 'dashboard') return <DashboardPage onLogout={() => setPage('invitation')} />;
  return null;
}
