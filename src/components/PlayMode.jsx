import React, { useState, useEffect } from 'react';
import { Flag, Trash2, Calendar, ChevronDown, ChevronUp, Trophy, TrendingUp, Plus, Minus, Check, MapPin, Sparkles } from 'lucide-react';
import { calculateDistanceInYards } from '../utils/courses.js';

export default function PlayMode({
  rounds = [],
  activeRound,
  onStartRound,
  onLogHole,
  onFinishRound,
  onDiscardRound,
  onDeleteRound,
  customCourses = [],
  onSaveCustomCourse,
  onDeleteCustomCourse
}) {
  // Setup round states
  // Setup round states
  const [courseName, setCourseName] = useState('');
  const [numHoles, setNumHoles] = useState(18);
  const [pars, setPars] = useState(Array(18).fill(4));
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [selectedSavedCourseId, setSelectedSavedCourseId] = useState('');
  const [expandedRoundId, setExpandedRoundId] = useState(null);

  // Active round state helpers
  const [currentHoleIdx, setCurrentHoleIdx] = useState(0);

  // GPS / Rangefinder states
  const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'fetching' | 'active' | 'error' | 'simulated'
  const [userCoords, setUserCoords] = useState(null);
  const [gpsMessage, setGpsMessage] = useState('');

  const handleLoadSaved = (id) => {
    setSelectedSavedCourseId(id);
    if (id === '') {
      setCourseName('');
      setNumHoles(18);
      setPars(Array(18).fill(4));
      setSaveAsTemplate(false);
    } else {
      const found = customCourses.find(c => c.id.toString() === id || c.id === Number(id));
      if (found) {
        setCourseName(found.name);
        setNumHoles(found.numHoles);
        setPars([...found.pars]);
        setSaveAsTemplate(true);
      }
    }
  };

  const handleUpdatePar = (idx, delta) => {
    const updated = [...pars];
    updated[idx] = Math.max(3, Math.min(5, (updated[idx] || 4) + delta));
    setPars(updated);
  };

  const handleQuickSetPars = (val) => {
    setPars(Array(numHoles).fill(val));
  };

  const handleNumHolesChange = (h) => {
    setNumHoles(h);
    const updated = Array(h).fill(4);
    for (let i = 0; i < h; i++) {
      if (pars[i] !== undefined) {
        updated[i] = pars[i];
      }
    }
    setPars(updated);
  };
  const [simulatedDistance, setSimulatedDistance] = useState(380);

  // When active round changes, or current hole changes, update simulated distance
  useEffect(() => {
    if (activeRound) {
      const hole = activeRound.holes[currentHoleIdx];
      if (hole) {
        // Reset simulated distance based on par
        let baseDist = 380;
        if (hole.par === 3) baseDist = 155;
        if (hole.par === 5) baseDist = 515;
        
        // Adjust simulated distance based on how many strokes logged
        const loggedScore = hole.score || hole.par;
        const remaining = Math.max(0, baseDist - (loggedScore - 1) * 230);
        setSimulatedDistance(remaining === 0 ? 0 : (remaining < 30 ? 15 : remaining));
      }
    }
  }, [activeRound, currentHoleIdx]);

  // Handle GPS start
  const handleStartGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsMessage('Geolocation not supported by your browser.');
      return;
    }

    setGpsStatus('fetching');
    setGpsMessage('Accessing satellite location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lon: longitude });
        setGpsStatus('active');
        setGpsMessage('');
      },
      (err) => {
        setGpsStatus('error');
        setGpsMessage(err.message || 'GPS location permission denied.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Get distance to green based on GPS or Simulation
  const getDistanceDisplay = () => {
    if (!activeRound) return null;
    
    // 1. Simulation Mode
    if (gpsStatus === 'simulated') {
      return {
        value: simulatedDistance,
        type: 'Simulated Distance',
        statusColor: 'var(--color-accent-gold)'
      };
    }

    // 2. GPS Active Mode
    if (gpsStatus === 'active' && userCoords) {
      // No preloaded static course library greens
      const course = null;
      if (course && course.greens && course.greens[currentHoleIdx]) {
        const green = course.greens[currentHoleIdx];
        const dist = calculateDistanceInYards(userCoords.lat, userCoords.lon, green.lat, green.lon);
        
        // If distance is too far, suggest simulation
        if (dist > 15000) {
          return {
            value: dist,
            type: 'GPS (Testing at home/office)',
            statusColor: 'var(--color-danger)',
            warning: 'You are too far from the course green coordinates. Try Simulation Mode to test rangefinder updates!'
          };
        }

        return {
          value: dist,
          type: 'GPS Live Rangefinder',
          statusColor: 'var(--color-primary)'
        };
      } else {
        return {
          value: simulatedDistance,
          type: 'GPS Active (Custom Course - Simulating)',
          statusColor: 'var(--color-accent-gold)',
          warning: 'No green coordinates defined for custom course.'
        };
      }
    }

    return null;
  };

  const distanceData = getDistanceDisplay();

  // Setup round logic
  const handleCreateRound = (e) => {
    e.preventDefault();
    const finalCourseName = courseName.trim() || 'Custom Course';
    
    if (saveAsTemplate && finalCourseName) {
      const existing = customCourses.find(c => c.name.toLowerCase() === finalCourseName.toLowerCase());
      const id = existing ? existing.id : Date.now();
      onSaveCustomCourse({
        id,
        name: finalCourseName,
        numHoles,
        pars: pars.slice(0, numHoles)
      });
    }

    onStartRound(finalCourseName, numHoles, pars.slice(0, numHoles));

    // Reset form states
    setCourseName('');
    setPars(Array(18).fill(4));
    setSaveAsTemplate(false);
    setSelectedSavedCourseId('');

    setCurrentHoleIdx(0);
    setGpsStatus('simulated'); // Default to simulated so they see the rangefinder
  };

  // Log active hole inputs
  const handleUpdateHole = (field, value) => {
    if (!activeRound) return;
    const currentHole = activeRound.holes[currentHoleIdx];
    const updatedHole = { ...currentHole, [field]: value };
    
    // Auto-calculate GIR
    if (field === 'score' || field === 'putts' || field === 'par') {
      const par = field === 'par' ? value : currentHole.par;
      const score = field === 'score' ? value : currentHole.score;
      const putts = field === 'putts' ? value : currentHole.putts;
      updatedHole.gir = (score - putts) <= (par - 2);
    }

    onLogHole(currentHoleIdx, updatedHole);
  };

  // Helper calculation for active round relative score
  const getRelativeScore = () => {
    if (!activeRound) return 'E';
    let totalPar = 0;
    let totalScore = 0;
    activeRound.holes.forEach((hole, idx) => {
      if (idx <= currentHoleIdx || hole.score > 0) {
        totalPar += hole.par;
        totalScore += hole.score || hole.par;
      }
    });
    const diff = totalScore - totalPar;
    if (diff === 0) return 'E';
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  // Complete active round
  const handleSaveActiveRound = () => {
    if (window.confirm('Finish and save this round to your history?')) {
      onFinishRound();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* View Header */}
      <div>
        <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-display)' }}>
          <Trophy style={{ color: 'var(--color-accent-gold)' }} />
          On-Course Scorecard & GPS
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Log hole scorecards, measure green distance, and visualize hole layouts.
        </p>
      </div>

      {activeRound ? (
        /* ACTIVE ROUND SCORECARD & GPS */
        <div className="dashboard-grid">
          
          {/* Left panel: Hole Logger Controls */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Active Round Progress Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'white' }}>{activeRound.course}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {activeRound.date} &bull; {activeRound.numHoles} Holes
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>To Par</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: getRelativeScore().startsWith('+') ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                  {getRelativeScore()}
                </span>
              </div>
            </div>

            {/* Hole Navigation & Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setCurrentHoleIdx(Math.max(0, currentHoleIdx - 1))}
                disabled={currentHoleIdx === 0}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                &larr; Hole {currentHoleIdx}
              </button>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
                Hole {currentHoleIdx + 1}
              </h2>
              <button 
                className="btn btn-secondary" 
                onClick={() => setCurrentHoleIdx(Math.min(activeRound.numHoles - 1, currentHoleIdx + 1))}
                disabled={currentHoleIdx === activeRound.numHoles - 1}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Hole {currentHoleIdx + 2} &rarr;
              </button>
            </div>

            {/* Hole Stats Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Par Selector */}
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Hole Par:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[3, 4, 5].map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`btn btn-secondary ${activeRound.holes[currentHoleIdx].par === p ? 'active' : ''}`}
                      onClick={() => handleUpdateHole('par', p)}
                      style={{ flexGrow: 1, padding: '8px' }}
                    >
                      Par {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score Counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <span style={{ fontWeight: 600, display: 'block', fontSize: '0.9rem' }}>Strokes (Score)</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Include putts and penalties</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '6px', borderRadius: '50%', minWidth: '30px', height: '30px' }}
                    onClick={() => handleUpdateHole('score', Math.max(1, activeRound.holes[currentHoleIdx].score - 1))}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>
                    {activeRound.holes[currentHoleIdx].score}
                  </span>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '6px', borderRadius: '50%', minWidth: '30px', height: '30px' }}
                    onClick={() => handleUpdateHole('score', activeRound.holes[currentHoleIdx].score + 1)}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Putts Counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <span style={{ fontWeight: 600, display: 'block', fontSize: '0.9rem' }}>Putts on Green</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Strokes taken on green</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '6px', borderRadius: '50%', minWidth: '30px', height: '30px' }}
                    onClick={() => handleUpdateHole('putts', Math.max(0, activeRound.holes[currentHoleIdx].putts - 1))}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>
                    {activeRound.holes[currentHoleIdx].putts}
                  </span>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '6px', borderRadius: '50%', minWidth: '30px', height: '30px' }}
                    onClick={() => handleUpdateHole('putts', activeRound.holes[currentHoleIdx].putts + 1)}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Fairway (only if par > 3) */}
              {activeRound.holes[currentHoleIdx].par > 3 ? (
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Fairway Hit (Off Tee):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '6px' }}>
                    <button
                      type="button"
                      className={`btn btn-secondary ${activeRound.holes[currentHoleIdx].fairway === 'Left' ? 'btn-danger' : ''}`}
                      style={{ padding: '8px 4px', fontSize: '0.75rem' }}
                      onClick={() => handleUpdateHole('fairway', 'Left')}
                    >
                      Miss Left
                    </button>
                    <button
                      type="button"
                      className={`btn btn-secondary ${activeRound.holes[currentHoleIdx].fairway === 'Hit' ? 'active' : ''}`}
                      style={{ padding: '8px 4px', fontSize: '0.75rem' }}
                      onClick={() => handleUpdateHole('fairway', 'Hit')}
                    >
                      Hit Fairway
                    </button>
                    <button
                      type="button"
                      className={`btn btn-secondary ${activeRound.holes[currentHoleIdx].fairway === 'Right' ? 'btn-danger' : ''}`}
                      style={{ padding: '8px 4px', fontSize: '0.75rem' }}
                      onClick={() => handleUpdateHole('fairway', 'Right')}
                    >
                      Miss Right
                    </button>
                  </div>
                </div>
              ) : null}

              {/* GIR Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Green in Regulation:</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '3px 8px', 
                  borderRadius: '10px', 
                  fontWeight: 600,
                  background: activeRound.holes[currentHoleIdx].gir ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeRound.holes[currentHoleIdx].gir ? 'var(--color-primary)' : 'var(--text-muted)'
                }}>
                  {activeRound.holes[currentHoleIdx].gir ? '✓ GIR Reached' : 'Missed'}
                </span>
              </div>

            </div>

            {/* Save Ribbon */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '14px' }}>
              <button className="btn btn-secondary" style={{ flexGrow: 1, padding: '10px' }} onClick={onDiscardRound}>
                Discard
              </button>
              <button className="btn btn-primary" style={{ flexGrow: 2, padding: '10px' }} onClick={handleSaveActiveRound}>
                Save Scorecard
              </button>
            </div>

          </div>

          {/* Right panel: GPS Rangefinder & Hole Visualizer Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Rangefinder Board Card */}
            <div className="glass-panel active-round-glow" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid var(--color-accent-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                  <MapPin size={14} style={{ color: 'var(--color-accent-gold)' }} />
                  Course GPS Rangefinder
                </span>
                
                {gpsStatus !== 'fetching' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className={`btn btn-secondary`} 
                      style={{ padding: '2px 8px', fontSize: '0.68rem', borderColor: gpsStatus === 'simulated' ? 'var(--color-accent-gold)' : 'var(--border-slate)' }}
                      onClick={() => setGpsStatus('simulated')}
                    >
                      Simulate
                    </button>
                    <button 
                      className={`btn btn-secondary`} 
                      style={{ padding: '2px 8px', fontSize: '0.68rem', borderColor: gpsStatus === 'active' ? 'var(--color-primary)' : 'var(--border-slate)' }}
                      onClick={handleStartGPS}
                    >
                      Live GPS
                    </button>
                  </div>
                )}
              </div>

              {/* Big Yardage Value Display */}
              {distanceData ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', textShadow: '0 0 15px rgba(255,255,255,0.15)' }}>
                    {distanceData.value}
                  </span>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginLeft: '4px', fontWeight: 600 }}>yds</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: distanceData.statusColor, marginTop: '4px', fontWeight: 600 }}>
                    {distanceData.type}
                  </span>
                  {distanceData.warning && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)', background: 'rgba(239, 68, 68, 0.05)', padding: '6px', borderRadius: '4px', marginTop: '8px', border: '1px solid rgba(239,68,68,0.15)' }}>
                      {distanceData.warning}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
                  {gpsStatus === 'fetching' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                      <span className="spin-animation" style={{ fontSize: '1.2rem' }}>⏳</span>
                      <span style={{ fontSize: '0.8rem' }}>{gpsMessage}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem' }}>GPS Rangefinder is currently inactive.</span>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem', alignSelf: 'center' }} onClick={handleStartGPS}>
                        Activate Geolocation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SVG Hole Layout Map Visualizer */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'white' }}>Hole Layout Map</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Par {activeRound.holes[currentHoleIdx].par} &bull; Hole {currentHoleIdx + 1}
                </span>
              </div>
              
              <div style={{ background: 'rgba(5, 10, 8, 0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', padding: '16px', display: 'flex', justifyContent: 'center' }}>
                <svg width="240" height="280" viewBox="0 0 200 240" style={{ overflow: 'visible' }}>
                  {/* Fairway path boundary (curved polygon) */}
                  <path 
                    d="M 100 220 Q 90 140 85 100 T 100 25" 
                    fill="none" 
                    stroke="rgba(16, 185, 129, 0.08)" 
                    strokeWidth="45" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 100 220 Q 90 140 85 100 T 100 25" 
                    fill="none" 
                    stroke="rgba(16, 185, 129, 0.12)" 
                    strokeWidth="20" 
                    strokeLinecap="round" 
                  />

                  {/* Sand Bunkers (SVG shapes) */}
                  <ellipse cx="68" cy="110" rx="10" ry="6" fill="#fef08a" opacity="0.3" transform="rotate(-15 68 110)" />
                  <ellipse cx="120" cy="50" rx="8" ry="5" fill="#fef08a" opacity="0.3" transform="rotate(10 120 50)" />
                  
                  {/* Water Hazard */}
                  <path d="M 130 140 Q 140 160 125 180 T 140 200" fill="none" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="8" strokeLinecap="round" />

                  {/* Green area at top */}
                  <circle cx="100" cy="25" r="14" fill="rgba(16, 185, 129, 0.35)" stroke="var(--color-primary)" strokeWidth="1" />
                  <circle cx="100" cy="25" r="3" fill="#ffffff" /> {/* The pin flag location */}

                  {/* Flagpole indicator */}
                  <line x1="100" y1="25" x2="100" y2="12" stroke="white" strokeWidth="1" />
                  <polygon points="100,12 110,15 100,18" fill="var(--color-danger)" />

                  {/* Tee Box at bottom */}
                  <rect x="92" y="210" width="16" height="8" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <circle cx="100" cy="214" r="2" fill="white" />

                  {/* Golfer position marker based on distance to green */}
                  {distanceData && (
                    <g>
                      {/* Calculate coordinates based on percentage of distance */}
                      {/* Tee: (100, 214). Green: (100, 25). Fairway: (85, 100) */}
                      {(() => {
                        const holePar = activeRound.holes[currentHoleIdx].par;
                        const maxDist = holePar === 3 ? 155 : (holePar === 5 ? 515 : 380);
                        const pct = Math.max(0, Math.min(1, distanceData.value / maxDist));
                        
                        let markerX = 100;
                        let markerY = 214;
                        
                        if (pct > 0.8) {
                          // Near Tee
                          markerY = 214;
                        } else if (pct > 0.2) {
                          // Fairway
                          markerX = 85;
                          markerY = 100;
                        } else {
                          // Green
                          markerX = 100;
                          markerY = 32;
                        }
                        
                        return (
                          <>
                            <circle cx={markerX} cy={markerY} r="8" fill="rgba(16, 185, 129, 0.15)" stroke="var(--color-primary)" strokeWidth="1" className="spin-animation" strokeDasharray="3" />
                            <circle cx={markerX} cy={markerY} r="4" fill="var(--color-primary)" filter="drop-shadow(0 0 4px var(--color-primary))" />
                            <text x={markerX} y={markerY - 10} fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">You</text>
                          </>
                        );
                      })()}
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Scorecard Quick Grid */}
            <div className="glass-panel" style={{ overflowX: 'auto', padding: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th style={{ padding: '6px 2px', textAlign: 'left' }}>Hole</th>
                    {activeRound.holes.map((h, i) => (
                      <th 
                        key={i} 
                        onClick={() => setCurrentHoleIdx(i)}
                        style={{ 
                          padding: '6px 2px', 
                          cursor: 'pointer',
                          background: currentHoleIdx === i ? 'rgba(16, 185, 129, 0.15)' : 'none',
                          color: currentHoleIdx === i ? 'var(--color-primary)' : 'inherit',
                          borderRadius: '4px'
                        }}
                      >
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <td style={{ padding: '6px 2px', textAlign: 'left', color: 'var(--text-muted)' }}>Par</td>
                    {activeRound.holes.map((h, i) => (
                      <td key={i} style={{ padding: '6px 2px', background: currentHoleIdx === i ? 'rgba(16, 185, 129, 0.08)' : 'none' }}>{h.par}</td>
                    ))}
                  </tr>
                  <tr style={{ fontWeight: 'bold' }}>
                    <td style={{ padding: '6px 2px', textAlign: 'left' }}>Score</td>
                    {activeRound.holes.map((h, i) => {
                      const diff = h.score - h.par;
                      let color = 'white';
                      if (h.score > 0) {
                        if (diff < 0) color = 'var(--color-primary)';
                        if (diff > 0) color = 'var(--color-danger)';
                      }
                      return (
                        <td 
                          key={i} 
                          onClick={() => setCurrentHoleIdx(i)}
                          style={{ 
                            padding: '6px 2px', 
                            color,
                            cursor: 'pointer',
                            background: currentHoleIdx === i ? 'rgba(16, 185, 129, 0.08)' : 'none' 
                          }}
                        >
                          {h.score || '-'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
      ) : (
        /* ROUNDS HISTORY & CREATION VIEWS */
        <div className="dashboard-grid">
          
          {/* Left panel: Rounds list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'white' }}>Completed Rounds History</h2>
            
            {rounds.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No completed scorecard rounds found. Start a new round on the right!
              </div>
            ) : (
              rounds.map(round => {
                const isExpanded = expandedRoundId === round.id;
                
                // Aggregate stats
                const totalStrokes = round.holes.reduce((acc, h) => acc + (h.score || 0), 0);
                const totalPar = round.holes.reduce((acc, h) => acc + h.par, 0);
                const relativeDiff = totalStrokes - totalPar;
                const scoreDisplay = relativeDiff === 0 ? 'E' : (relativeDiff > 0 ? `+${relativeDiff}` : `${relativeDiff}`);
                
                const totalPutts = round.holes.reduce((acc, h) => acc + (h.putts || 0), 0);
                const avgPutts = (totalPutts / round.numHoles).toFixed(1);
                
                const girCount = round.holes.filter(h => h.gir).length;
                const girPct = Math.round((girCount / round.numHoles) * 100);
                
                const trackedFairwayHoles = round.holes.filter(h => h.par > 3);
                const fwCount = trackedFairwayHoles.filter(h => h.fairway === 'Hit').length;
                const fwPct = trackedFairwayHoles.length > 0 ? Math.round((fwCount / trackedFairwayHoles.length) * 100) : 0;

                return (
                  <div 
                    key={round.id} 
                    className="glass-panel"
                    style={{ 
                      padding: '14px 18px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: isExpanded ? '16px' : '0px',
                      borderLeft: isExpanded ? '4px solid var(--color-accent-gold)' : '1px solid var(--border-glow)'
                    }}
                  >
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => setExpandedRoundId(isExpanded ? null : round.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '8px', borderRadius: '8px', color: 'var(--color-accent-gold)' }}>
                          <Flag size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{round.course}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {round.date} &bull; {round.numHoles} holes
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, display: 'block' }}>{totalStrokes}</span>
                          <span style={{ fontSize: '0.72rem', color: relativeDiff > 0 ? 'var(--color-danger)' : 'var(--color-primary)', fontWeight: 600 }}>
                            {scoreDisplay}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideIn 0.2s ease-out' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Total Putts</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>{totalPutts} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({avgPutts}/hole)</span></span>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Green in Reg</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}>{girPct}%</span>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Fairway Accuracy</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-info)' }}>{fwPct}%</span>
                          </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'center' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '6px', textAlign: 'left' }}>Hole</th>
                                {round.holes.map((_, i) => (
                                  <th key={i} style={{ padding: '6px' }}>{i + 1}</th>
                                ))}
                                <th style={{ padding: '6px', fontWeight: 'bold' }}>Tot</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '6px', textAlign: 'left', color: 'var(--text-muted)' }}>Par</td>
                                {round.holes.map((h, i) => (
                                  <td key={i} style={{ padding: '6px' }}>{h.par}</td>
                                ))}
                                <td style={{ padding: '6px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{totalPar}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: 'bold' }}>
                                <td style={{ padding: '6px', textAlign: 'left' }}>Score</td>
                                {round.holes.map((h, i) => {
                                  const diff = h.score - h.par;
                                  let color = 'white';
                                  if (diff < 0) color = 'var(--color-primary)';
                                  if (diff > 0) color = 'var(--color-danger)';
                                  return (
                                    <td key={i} style={{ padding: '6px', color }}>{h.score}</td>
                                  );
                                })}
                                <td style={{ padding: '6px', color: relativeDiff > 0 ? 'var(--color-danger)' : 'var(--color-primary)' }}>{totalStrokes}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '6px', textAlign: 'left', color: 'var(--text-muted)' }}>Putts</td>
                                {round.holes.map((h, i) => (
                                  <td key={i} style={{ padding: '6px' }}>{h.putts}</td>
                                ))}
                                <td style={{ padding: '6px', color: 'var(--text-muted)' }}>{totalPutts}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '14px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Round ID: {round.id}</span>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => onDeleteRound(round.id)}
                          >
                            <Trash2 size={12} />
                            Delete Round
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right panel: Start Round Form */}
          <div className="glass-panel" style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
              Start New Round
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: '1.4' }}>
              Type your course name and configure hole pars below. Check 'Save Course Template' to store it for future rounds!
            </p>

            <form onSubmit={handleCreateRound} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {customCourses.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Quick Load Saved Course</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select 
                      value={selectedSavedCourseId}
                      onChange={(e) => handleLoadSaved(e.target.value)}
                      style={{
                        background: 'rgba(8, 15, 12, 0.95)',
                        border: '1px solid var(--border-slate)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        color: 'white',
                        fontSize: '0.85rem',
                        outline: 'none',
                        flexGrow: 1
                      }}
                    >
                      <option value="">-- Select a saved course --</option>
                      {customCourses.map(course => (
                        <option key={course.id} value={course.id.toString()}>{course.name} ({course.numHoles} holes)</option>
                      ))}
                    </select>
                    {selectedSavedCourseId && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', color: 'var(--color-danger)', border: '1px solid rgba(220, 53, 69, 0.2)' }}
                        onClick={() => {
                          onDeleteCustomCourse(Number(selectedSavedCourseId));
                          handleLoadSaved('');
                        }}
                        title="Delete template"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Course Name</label>
                <input 
                  type="text" 
                  placeholder="Enter golf course name..."
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-slate)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Number of Holes
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[9, 18].map(h => (
                    <button
                      key={h}
                      type="button"
                      className={`btn btn-secondary ${numHoles === h ? 'active' : ''}`}
                      onClick={() => handleNumHolesChange(h)}
                      style={{ flexGrow: 1, padding: '8px', fontSize: '0.8rem' }}
                    >
                      {h} Holes
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Configure Pars</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[3, 4, 5].map(pVal => (
                      <button
                        key={pVal}
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '2px 6px', fontSize: '0.68rem' }}
                        onClick={() => handleQuickSetPars(pVal)}
                      >
                        All Par {pVal}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '8px', 
                  maxHeight: '150px', 
                  overflowY: 'auto', 
                  padding: '4px',
                  background: 'rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-slate)'
                }}>
                  {pars.map((parValue, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hole {idx + 1}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button 
                          type="button" 
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 4px', fontSize: '0.8rem' }}
                          onClick={() => handleUpdatePar(idx, -1)}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>{parValue || 4}</span>
                        <button 
                          type="button" 
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 4px', fontSize: '0.8rem' }}
                          onClick={() => handleUpdatePar(idx, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input 
                  type="checkbox" 
                  id="saveAsTemplate" 
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
                <label htmlFor="saveAsTemplate" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                  Save course template for future play
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem', marginTop: '6px' }}
              >
                Start Scorecard
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
