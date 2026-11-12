import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const fetchResumes = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/api/resumes`, {
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
      const res = await fetch(`${API_BASE}/api/jd/samples`);
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

    fetch(`${API_BASE}/api/auth/me`, {
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
      const res = await fetch(`${API_BASE}/api/resumes/upload`, {
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
      const res = await fetch(`${API_BASE}/api/resumes/${resumeId}/intelligence`, {
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
      const res = await fetch(`${API_BASE}/api/resumes/${resumeId}/set-primary`, {
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
      const res = await fetch(`${API_BASE}/api/resumes/${resumeId}`, {
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
      const res = await fetch(`${API_BASE}/api/jd/match`, {
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
