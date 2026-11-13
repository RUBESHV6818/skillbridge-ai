import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_ORIGIN } from '../../../skillbridge-ai/src/services/apiBaseUrl';

function LandingGlyph({ name, size = 20 }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    sparkle: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 9"/></>,
    resume: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6"/></>,
    cap: <><path d="m2 10 10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c3.5 3 8.5 3 12 0v-5M22 10v6"/></>,
    bars: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...common}>{paths[name]}</svg>;
}

function PublicLanding() {
  const features = [
    { icon: 'resume', number: '01', title: 'Understand your resume', description: 'Get an AI review grounded in the resume you uploaded, with evidence and practical suggestions.' },
    { icon: 'target', number: '02', title: 'Focus on the right skills', description: 'Compare your experience with a role you choose and see which skills deserve your attention.' },
    { icon: 'mic', number: '03', title: 'Practice with confidence', description: 'Prepare with voice interviews, aptitude drills, and coding challenges built for placement rounds.' },
  ];

  return (
    <div className="public-landing">
      <style>{`
        @keyframes landing-rise { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes landing-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        .public-landing * { box-sizing: border-box; }
        .public-landing { --ink: #17152b; --muted: #66677f; --purple: #5145ad; --line: #e6e3f0; color: var(--ink); background: #faf9fd; min-height: 100%; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; }
        .landing-shell { width: min(1180px, calc(100% - 48px)); margin: 0 auto; }
        .landing-nav { height: 82px; display: flex; align-items: center; justify-content: space-between; gap: 24px; border-bottom: 1px solid rgba(229,226,239,.8); }
        .landing-brand { display: inline-flex; gap: 12px; align-items: center; color: var(--ink); text-decoration: none; }
        .landing-brand-mark { display: grid; place-items: center; width: 43px; height: 43px; border-radius: 14px; color: white; background: var(--purple); box-shadow: 0 8px 20px rgba(81,69,173,.22); }
        .landing-brand-name { font: 700 23px/1.1 'Playfair Display', Georgia, serif; letter-spacing: -.03em; }
        .landing-brand-sub { display: block; margin-top: 4px; color: #77758a; font-size: 12px; }
        .landing-nav-links { display: flex; gap: 34px; align-items: center; }
        .landing-nav-links a { color: #58586e; text-decoration: none; font-size: 14px; font-weight: 600; }
        .landing-nav-links a:hover, .landing-text-link:hover { color: var(--purple); }
        .landing-nav-actions { display: flex; gap: 12px; align-items: center; }
        .landing-text-link { color: var(--ink); font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 12px; }
        .landing-button { display: inline-flex; justify-content: center; align-items: center; gap: 9px; text-decoration: none; font-weight: 650; font-size: 14px; border-radius: 12px; padding: 14px 20px; transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
        .landing-button:hover { transform: translateY(-2px); }
        .landing-button-primary { color: white; background: var(--purple); box-shadow: 0 10px 22px rgba(81,69,173,.2); }
        .landing-button-primary:hover { background: #433898; box-shadow: 0 14px 28px rgba(81,69,173,.27); }
        .landing-button-secondary { color: var(--ink); border: 1px solid var(--line); background: white; }
        .landing-hero { display: grid; grid-template-columns: 1fr .94fr; align-items: center; gap: clamp(32px, 6vw, 76px); padding: 76px 0 82px; }
        .landing-hero-copy { animation: landing-rise .7s ease-out both; }
        .landing-eyebrow { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #e1ddf5; color: #5145ad; background: #f2f0fb; border-radius: 99px; padding: 8px 13px; font-size: 12px; font-weight: 700; letter-spacing: .045em; text-transform: uppercase; }
        .landing-hero h1 { max-width: 620px; margin: 22px 0 19px; font: 700 clamp(43px, 5.3vw, 68px)/1.04 'Playfair Display', Georgia, serif; letter-spacing: -.045em; }
        .landing-hero h1 em { color: var(--purple); font-style: normal; }
        .landing-hero p { max-width: 560px; margin: 0; color: var(--muted); font-size: 17px; line-height: 1.75; }
        .landing-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
        .landing-trust { display: flex; align-items: center; gap: 10px; margin-top: 25px; color: #77758a; font-size: 13px; }
        .landing-trust svg { color: #31856b; flex: 0 0 auto; }
        .landing-visual { position: relative; min-height: 430px; border-radius: 30px; overflow: hidden; background: linear-gradient(145deg, #7770c8 0%, #443a94 52%, #24204f 100%); box-shadow: 0 28px 70px rgba(49,42,117,.24); animation: landing-rise .8s .12s ease-out both; }
        .landing-visual::before, .landing-visual::after { content: ''; position: absolute; border-radius: 50%; pointer-events: none; }
        .landing-visual::before { width: 300px; height: 300px; right: -54px; top: -80px; background: rgba(255,245,213,.16); filter: blur(2px); }
        .landing-visual::after { inset: 0; border: 1px solid rgba(255,255,255,.2); border-radius: inherit; }
        .landing-campus-art { position: absolute; inset: 0; width: 100%; height: 100%; }
        .landing-visual-caption { position: absolute; left: 30px; right: 30px; bottom: 27px; z-index: 2; color: white; }
        .landing-visual-caption strong { display: block; font: 700 26px/1.15 'Playfair Display', Georgia, serif; }
        .landing-visual-caption span { display: block; margin-top: 8px; color: rgba(255,255,255,.78); font-size: 13px; }
        .landing-float-card { position: absolute; z-index: 3; display: flex; align-items: center; gap: 11px; padding: 13px 15px; border: 1px solid rgba(255,255,255,.72); border-radius: 16px; background: rgba(255,255,255,.94); box-shadow: 0 18px 40px rgba(26,22,67,.22); animation: landing-float 5s ease-in-out infinite; }
        .landing-float-card.top { top: 32px; left: 25px; }
        .landing-float-card.bottom { bottom: 105px; right: 22px; animation-delay: -2s; }
        .landing-float-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; color: #5145ad; background: #efedfa; }
        .landing-float-card b { display: block; color: #25233c; font-size: 12px; }
        .landing-float-card small { display: block; color: #77758a; margin-top: 3px; font-size: 10px; }
        .landing-section { padding: 75px 0; }
        .landing-section-heading { max-width: 650px; margin-bottom: 34px; }
        .landing-section-heading h2 { margin: 12px 0; font: 700 clamp(30px, 3.5vw, 42px)/1.12 'Playfair Display', Georgia, serif; letter-spacing: -.035em; }
        .landing-section-heading p { color: var(--muted); line-height: 1.7; margin: 0; }
        .landing-feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .landing-feature { border: 1px solid var(--line); border-radius: 20px; padding: 25px; background: #fff; box-shadow: 0 10px 35px rgba(45,40,85,.035); transition: transform .2s ease, box-shadow .2s ease; }
        .landing-feature:hover { transform: translateY(-4px); box-shadow: 0 18px 42px rgba(45,40,85,.09); }
        .landing-feature-icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 15px; color: var(--purple); background: #f0eef9; }
        .landing-feature-number { float: right; color: #aaa6bd; font-size: 12px; font-weight: 700; }
        .landing-feature h3 { margin: 22px 0 9px; font: 700 21px/1.2 'Playfair Display', Georgia, serif; }
        .landing-feature p { color: var(--muted); font-size: 14px; line-height: 1.7; margin: 0; }
        .landing-steps { background: #f0eef8; border-top: 1px solid #e8e5f0; border-bottom: 1px solid #e8e5f0; }
        .landing-step-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .landing-step { display: flex; gap: 14px; }
        .landing-step-index { flex: 0 0 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; background: var(--purple); color: #fff; font-size: 13px; font-weight: 700; }
        .landing-step h3 { margin: 3px 0 7px; font-size: 15px; }
        .landing-step p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.65; }
        .landing-audience { text-align: center; padding-bottom: 78px; }
        .landing-audience .landing-section-heading { margin: 0 auto 25px; }
        .landing-audience-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
        .landing-audience-pills span { border: 1px solid var(--line); border-radius: 99px; padding: 11px 17px; background: white; color: #55536a; font-size: 13px; font-weight: 600; }
        .landing-footer { border-top: 1px solid var(--line); padding: 25px 0; color: #858297; font-size: 12px; }
        .landing-footer-inner { display: flex; justify-content: space-between; align-items: center; gap: 18px; }
        .landing-footer a { color: var(--purple); text-decoration: none; font-weight: 600; }
        @media (max-width: 850px) { .landing-nav-links { display: none; } .landing-hero { grid-template-columns: 1fr; padding-top: 54px; } .landing-visual { min-height: 390px; } }
        @media (max-width: 620px) { .landing-shell { width: min(100% - 32px, 520px); } .landing-nav { height: 72px; } .landing-brand-name { font-size: 20px; } .landing-brand-sub { font-size: 10px; } .landing-nav-actions { gap: 2px; } .landing-text-link { padding: 9px 7px; font-size: 13px; } .landing-nav-actions .landing-button { padding: 11px 13px; font-size: 12px; } .landing-hero { padding: 44px 0 55px; gap: 35px; } .landing-hero h1 { font-size: 43px; } .landing-hero p { font-size: 15px; } .landing-visual { min-height: 340px; border-radius: 23px; } .landing-feature-grid, .landing-step-grid { grid-template-columns: 1fr; } .landing-section { padding: 56px 0; } .landing-footer-inner { align-items: flex-start; flex-direction: column; } }
        @media (prefers-reduced-motion: reduce) { .public-landing *, .public-landing *::before, .public-landing *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; } }
      `}</style>

      <main>
        <section className="landing-shell landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow"><LandingGlyph name="sparkle" size={15} /> Career preparation, made personal</span>
            <h1>Make your next career step <em>your strongest.</em></h1>
            <p>Turn your resume and career goals into a clear preparation plan. Build the skills, practice the interviews, and track your progress with SkillBridge AI.</p>
            <div className="landing-hero-actions"><Link to="/register" className="landing-button landing-button-primary">Start your journey <LandingGlyph name="arrow" size={17} /></Link><a href="#workflow" className="landing-button landing-button-secondary">Explore the platform</a></div>
            <div className="landing-trust"><LandingGlyph name="check" size={17} /> Resume-based insights. Role-focused practice. Your progress, in one place.</div>
          </div>
          <div className="landing-visual" aria-label="Illustration of a campus and students">
            <svg className="landing-campus-art" viewBox="0 0 700 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs><linearGradient id="landing-sky" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8b83dc"/><stop offset="1" stopColor="#393276"/></linearGradient><linearGradient id="landing-path" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#d7d1f1"/><stop offset="1" stopColor="#8e87c4"/></linearGradient></defs>
              <rect width="700" height="560" fill="url(#landing-sky)"/><circle cx="540" cy="126" r="74" fill="#fff2c9" opacity=".55"/><circle cx="540" cy="126" r="105" fill="#fff2c9" opacity=".13"/>
              <path d="M0 345Q150 300 290 355T700 330V560H0Z" fill="#403a7e" opacity=".54"/><path d="M135 380V230L350 118 565 230V380Z" fill="#e9e5f4" opacity=".92"/><path d="m102 235 248-132 248 132-18 20-230-122-230 122Z" fill="#fff3de"/>
              <rect x="160" y="250" width="380" height="13" fill="#8981bd"/>{[0,1,2,3].map((i)=><g key={i}><rect x={190+i*86} y="278" width="35" height="91" rx="16" fill="#fff8eb"/><rect x={199+i*86} y="288" width="17" height="75" rx="8" fill="#7770b1" opacity=".68"/></g>)}
              <rect x="145" y="372" width="410" height="16" fill="#f7efdc"/><path d="M0 388H700V560H0Z" fill="#322c69"/><path d="m265 560 60-172h50l60 172Z" fill="url(#landing-path)" opacity=".36"/><path d="M115 425h470M175 462h350M225 500h250" stroke="#fff" strokeWidth="3" opacity=".14"/>
              <g opacity=".9"><circle cx="290" cy="396" r="11" fill="#f5c4a2"/><path d="M275 411q15-14 30 0v38h-30Z" fill="#f0b760"/><path d="m280 449-8 23m22-23 8 23" stroke="#24204f" strokeWidth="6" strokeLinecap="round"/></g><g opacity=".9"><circle cx="435" cy="399" r="11" fill="#ecc1a4"/><path d="M420 414q15-14 30 0v38h-30Z" fill="#bbb5ed"/><path d="m425 452-8 23m22-23 8 23" stroke="#24204f" strokeWidth="6" strokeLinecap="round"/></g>
            </svg>
            <div className="landing-float-card top"><span className="landing-float-icon"><LandingGlyph name="resume" size={18}/></span><span><b>Resume insights</b><small>Evidence from your resume</small></span></div>
            <div className="landing-float-card bottom"><span className="landing-float-icon"><LandingGlyph name="bars" size={18}/></span><span><b>Your next steps</b><small>Clear goals. Visible progress.</small></span></div>
            <div className="landing-visual-caption"><strong>Every step forward, built around you.</strong><span>From first resume review to interview-ready confidence.</span></div>
          </div>
        </section>

        <section className="landing-shell landing-section" id="features">
          <div className="landing-section-heading"><span className="landing-eyebrow">A focused path to readiness</span><h2>Everything you need to prepare with intention.</h2><p>Know what is working, what to improve, and what to do next—without losing sight of your own goals.</p></div>
          <div className="landing-feature-grid">{features.map(({ icon, number, title, description }) => <article className="landing-feature" key={number}><span className="landing-feature-number">{number}</span><span className="landing-feature-icon"><LandingGlyph name={icon} size={22}/></span><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>

        <section className="landing-steps" id="workflow"><div className="landing-shell landing-section"><div className="landing-section-heading"><span className="landing-eyebrow">How it works</span><h2>A few clear steps. A more confident you.</h2></div><div className="landing-step-grid"><div className="landing-step"><span className="landing-step-index">1</span><div><h3>Choose your direction</h3><p>Set the role you are working toward and upload the resume you want to improve.</p></div></div><div className="landing-step"><span className="landing-step-index">2</span><div><h3>See your opportunities</h3><p>Review role-focused strengths, skill gaps, and a learning roadmap shaped around your profile.</p></div></div><div className="landing-step"><span className="landing-step-index">3</span><div><h3>Practice and progress</h3><p>Build interview confidence and keep your preparation and placement activity organized.</p></div></div></div></div></section>

        <section className="landing-shell landing-section landing-audience" id="audience"><div className="landing-section-heading"><span className="landing-eyebrow">Built for the people behind every placement</span><h2>One connected space for your campus career journey.</h2><p>Students prepare with direction. Mentors and placement teams can support that progress.</p></div><div className="landing-audience-pills"><span>Engineering students</span><span>Placement coordinators</span><span>Career mentors</span></div></section>
        <section className="landing-shell" id="faq" style={{ paddingBottom: 70 }}><div className="landing-section-heading"><span className="landing-eyebrow">A few quick answers</span><h2>Good to know before you begin.</h2></div><div className="landing-feature-grid"><article className="landing-feature"><h3>Do I choose my target role?</h3><p>Yes. You can set the role you are preparing for and use it for role-focused analysis.</p></article><article className="landing-feature"><h3>Does AI review my actual resume?</h3><p>Resume insights are based on extracted text from the resume you upload. Mentions are treated as evidence to inspect, not proof of proficiency.</p></article><article className="landing-feature"><h3>Can I change my goals later?</h3><p>Yes. Update your profile and target role as your career plans develop.</p></article></div></section>
      </main>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [activeIntel, setActiveIntel] = useState(null);
  const [loadingIntel, setLoadingIntel] = useState(false);

  // JD Matching state
  const [sampleJDs, setSampleJDs] = useState([]);
  const [selectedJD, setSelectedJD] = useState('');
  const [customJDText, setCustomJDText] = useState('');
  const [matchingJD, setMatchingJD] = useState(false);
  const [jdMatchResult, setJdMatchResult] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchResumes = async (authToken) => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/resumes`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (e) {
      console.error('Error fetching resumes:', e);
    }
  };

  const fetchSampleJDs = async () => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/jd/samples`);
      if (res.ok) {
        const data = await res.json();
        setSampleJDs(data);
        if (data.length > 0) setSelectedJD(data[0].id);
      }
    } catch (e) {
      console.error('Error fetching JDs:', e);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_ORIGIN}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setUser(data);
        fetchResumes(token);
        fetchSampleJDs();
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setStatusMsg('');

    const formData = new FormData();
    formData.append('resume', uploadFile);

    try {
      const res = await fetch(`${API_ORIGIN}/api/resumes/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg('✅ Resume uploaded and analyzed successfully!');
        setUploadFile(null);
        const inputElem = document.getElementById('resumeFileInput');
        if (inputElem) inputElem.value = '';

        await fetchResumes(token);
        loadIntelligence(data.id || data._id);
      } else {
        setStatusMsg(`❌ Upload failed: ${data.message || 'Error uploading file'}`);
      }
    } catch {
      setStatusMsg('❌ Network error during upload.');
    } finally {
      setUploading(false);
    }
  };

  const loadIntelligence = async (resumeId) => {
    setLoadingIntel(true);
    setActiveIntel(null);
    try {
      const res = await fetch(`${API_ORIGIN}/api/resumes/${resumeId}/intelligence`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveIntel(data);
      } else {
        setStatusMsg('❌ Could not load intelligence for this resume.');
      }
    } catch {
      setStatusMsg('❌ Network error loading intelligence.');
    } finally {
      setLoadingIntel(false);
    }
  };

  const handleSetPrimary = async (resumeId) => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/resumes/${resumeId}/set-primary`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchResumes(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      const res = await fetch(`${API_ORIGIN}/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (activeIntel && (activeIntel.resumeId === resumeId || activeIntel.id === resumeId)) {
          setActiveIntel(null);
        }
        fetchResumes(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunJDMatch = async () => {
    const textToSend = selectedJD === 'custom' ? customJDText : selectedJD;
    if (!textToSend || (selectedJD === 'custom' && !customJDText.trim())) {
      alert('Please select a campus drive or paste a job description.');
      return;
    }

    setMatchingJD(true);
    setJdMatchResult(null);

    try {
      const res = await fetch(`${API_ORIGIN}/api/jd/match`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToSend }),
      });

      const data = await res.json();
      if (res.ok) {
        setJdMatchResult(data);
      } else {
        alert(data.message || 'Error running JD Match');
      }
    } catch {
      alert('Network error while matching Job Description.');
    } finally {
      setMatchingJD(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h2>Loading your profile...</h2>
      </div>
    );
  }

  if (!user) return <PublicLanding />;

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '840px', margin: '20px auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1f2937' }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.9rem', color: '#111827' }}>🎓 SkillBridge</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.95rem' }}>AI-Powered Career & Placement Diagnostic Engine</p>
        </div>
        {user && (
          <button
            onClick={handleLogout}
            style={{
              padding: '0.55rem 1.1rem',
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#4b5563',
            }}
          >
            Log Out
          </button>
        )}
      </div>

      {user ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          {/* User Profile Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{user.name}</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                      {user.role}
                    </span>
                    <span style={{ color: user.verified ? '#15803d' : '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
                      {user.verified ? '✅ Verified' : '⚠️ Pending'}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Database ID:</strong> <span style={{ fontFamily: 'monospace' }}>{user._id}</span></div>
              </div>
            </div>
          </div>

          {/* Upload Resume Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#111827' }}>
              📄 Upload Your Resume for Real ATS Intelligence
            </h3>
            <p style={{ margin: '0 0 1.2rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
              Upload your PDF or DOCX resume. The backend extracts your genuine skills, verifies section completeness, and calculates your authentic ATS score!
            </p>

            <form onSubmit={handleUpload} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                id="resumeFileInput"
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setUploadFile(e.target.files[0])}
                style={{
                  padding: '0.5rem',
                  border: '1px dashed #9ca3af',
                  borderRadius: '8px',
                  background: '#f9fafb',
                  fontSize: '0.9rem',
                  flex: 1,
                  minWidth: '240px',
                }}
              />
              <button
                type="submit"
                disabled={!uploadFile || uploading}
                style={{
                  padding: '0.65rem 1.4rem',
                  background: uploadFile && !uploading ? '#2563eb' : '#9ca3af',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: uploadFile && !uploading ? 'pointer' : 'not-allowed',
                }}
              >
                {uploading ? 'Analyzing Resume...' : 'Upload & Analyze'}
              </button>
            </form>

            {statusMsg && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', background: statusMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: statusMsg.startsWith('✅') ? '#166534' : '#991b1b', border: `1px solid ${statusMsg.startsWith('✅') ? '#bbf7d0' : '#fecaca'}` }}>
                {statusMsg}
              </div>
            )}
          </div>

          {/* Resumes List */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#111827' }}>
              📁 Your Uploaded Resumes ({resumes.length})
            </h3>

            {resumes.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '1.5rem 0' }}>
                No resumes uploaded yet. Upload a resume above to generate your customized AI report!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {resumes.map((r) => (
                  <div
                    key={r.id || r._id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '1rem 1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.8rem',
                      background: r.isPrimary ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <strong style={{ fontSize: '1rem' }}>{r.fileName}</strong>
                        {r.isPrimary && (
                          <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                            PRIMARY
                          </span>
                        )}
                        {r.atsScore && (
                          <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                            ATS: {r.atsScore}/100
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '4px' }}>
                        Uploaded: {r.uploadedAt} • Size: {(r.fileSize / 1024).toFixed(0)} KB
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => loadIntelligence(r.id || r._id)}
                        style={{
                          padding: '0.45rem 0.9rem',
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        ⚡ View Intelligence
                      </button>
                      {!r.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(r.id || r._id)}
                          style={{
                            padding: '0.45rem 0.8rem',
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 500,
                          }}
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteResume(r.id || r._id)}
                        style={{
                          padding: '0.45rem 0.7rem',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real AI Intelligence Report */}
          {activeIntel && (
            <div style={{ background: '#ffffff', border: '1px solid #3b82f6', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 16px rgba(59,130,246,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.2rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Authentic Diagnostic Report
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{activeIntel.fileName}</h2>
                  <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                    Target Role: <strong>{activeIntel.targetRole}</strong> • Matched Keywords: <strong>{activeIntel.matchedKeywordsCount}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: activeIntel.overallScore >= 75 ? '#16a34a' : '#d97706' }}>
                      {activeIntel.overallScore}
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Overall ATS Score</div>
                  </div>
                  <div style={{ textAlign: 'center', borderLeft: '1px solid #e5e7eb', paddingLeft: '1.2rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2563eb' }}>
                      {activeIntel.percentile}th
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Percentile</div>
                  </div>
                </div>
              </div>

              {/* Diagnostic Breakdown */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#111827' }}>📊 Section Diagnostic Breakdown</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {activeIntel.breakdown?.map((b) => (
                    <div key={b.id} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{b.label}</span>
                        <span style={{ fontWeight: 700, color: b.score >= 75 ? '#16a34a' : '#d97706', fontSize: '0.95rem' }}>
                          {b.score}/100
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.4 }}>{b.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Skills from Actual Resume */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#111827' }}>💡 Extracted Technical Skills (From Your File)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {['frontend', 'backend', 'database', 'tools'].map((cat) => {
                    const skills = activeIntel.extractedSkills?.[cat] || [];
                    return (
                      <div key={cat} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.9rem' }}>
                        <h5 style={{ margin: '0 0 0.6rem 0', textTransform: 'capitalize', color: '#374151', fontSize: '0.88rem', fontWeight: 700 }}>
                          {cat} ({skills.length})
                        </h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {skills.length > 0 ? (
                            skills.map((s) => (
                              <span key={s} style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px' }}>
                                {s}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontStyle: 'italic' }}>None detected</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actionable Rewrite Suggestions */}
              <div>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#111827' }}>✍️ AI High-Impact Bullet Rewrites</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeIntel.rewriteSuggestions?.map((sug) => (
                    <div key={sug.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1f2937' }}>{sug.section}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: sug.severity === 'critical' ? '#fee2e2' : '#fef3c7', color: sug.severity === 'critical' ? '#b91c1c' : '#b45309' }}>
                          {sug.severity.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>Original: </span>
                        <span style={{ color: '#4b5563', textDecoration: 'line-through' }}>{sug.before}</span>
                      </div>
                      <div style={{ marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>Recommended: </span>
                        <span style={{ color: '#111827', fontWeight: 500 }}>{sug.after}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
                        💡 {sug.rationale}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Job Description (JD) Matcher Section */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', color: '#111827' }}>
                  🎯 Campus Job Description (JD) Matcher
                </h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                  Benchmark your uploaded resume against real campus drives or paste any target job description!
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', color: '#374151' }}>
                  Select Target Company / Campus Drive:
                </label>
                <select
                  value={selectedJD}
                  onChange={(e) => setSelectedJD(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    background: '#fff',
                  }}
                >
                  {sampleJDs.map((jd) => (
                    <option key={jd.id} value={jd.id}>
                      {jd.company} — {jd.role} ({jd.packageRange})
                    </option>
                  ))}
                  <option value="custom">📝 Paste a Custom Job Description...</option>
                </select>
              </div>

              {selectedJD === 'custom' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', color: '#374151' }}>
                    Paste Custom Job Description Text:
                  </label>
                  <textarea
                    rows={5}
                    value={customJDText}
                    onChange={(e) => setCustomJDText(e.target.value)}
                    placeholder="Paste job requirements, tech stack, and responsibilities here..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.8rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              )}

              <button
                onClick={handleRunJDMatch}
                disabled={matchingJD || resumes.length === 0}
                style={{
                  alignSelf: 'flex-start',
                  padding: '0.75rem 1.6rem',
                  background: resumes.length > 0 && !matchingJD ? '#10b981' : '#9ca3af',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: resumes.length > 0 && !matchingJD ? 'pointer' : 'not-allowed',
                }}
              >
                {matchingJD ? 'Matching Skills & Requirements...' : '🔍 Run Instant JD Match'}
              </button>

              {resumes.length === 0 && (
                <p style={{ margin: 0, color: '#dc2626', fontSize: '0.82rem' }}>
                  Please upload a resume first to run JD matching.
                </p>
              )}
            </div>

            {/* JD Match Result Card */}
            {jdMatchResult && (
              <div style={{ marginTop: '1.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>{jdMatchResult.company}</h4>
                    <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.92rem' }}>
                      {jdMatchResult.role} • Package: <strong>{jdMatchResult.packageRange}</strong>
                    </p>
                    <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.82rem' }}>
                      Matched against: <strong>{jdMatchResult.resumeFileName}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', background: '#ffffff', padding: '0.8rem 1.2rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: jdMatchResult.matchPercentage >= 70 ? '#16a34a' : '#d97706' }}>
                      {jdMatchResult.matchPercentage}%
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Role Match Fit
                    </div>
                  </div>
                </div>

                {/* Recommendation Alert */}
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.2rem', fontWeight: 500 }}>
                  {jdMatchResult.recommendation}
                </div>

                {/* Skills Match List */}
                <div>
                  <h5 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#334155' }}>
                    Skills Evaluation ({jdMatchResult.matchedCount} Matched • {jdMatchResult.missingCount} Missing):
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.6rem' }}>
                    {jdMatchResult.requirements?.mustHave?.map((req, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: req.matched ? '#f0fdf4' : '#fef2f2',
                          border: `1px solid ${req.matched ? '#bbf7d0' : '#fecaca'}`,
                          borderRadius: '6px',
                          padding: '0.65rem 0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: req.matched ? '#166534' : '#991b1b' }}>
                            {req.matched ? '✅' : '❌'} {req.skill}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            {req.context}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: req.matched ? '#dcfce7' : '#fee2e2', color: req.matched ? '#15803d' : '#b91c1c' }}>
                          {req.matched ? 'MATCHED' : 'MISSING'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '1.5rem' }}>
            Please sign in to access your SkillBridge dashboard.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" style={{ padding: '0.75rem 1.8rem', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>
              Sign In
            </Link>
            <Link to="/register" style={{ padding: '0.75rem 1.8rem', border: '1px solid #2563eb', color: '#2563eb', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
