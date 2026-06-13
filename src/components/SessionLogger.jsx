import React, { useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';

export default function SessionLogger({ 
  activeSession, 
  onLogShot, 
  onUndoShot, 
  onFinishSession, 
  onDiscardSession 
}) {
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedCues, setSelectedCues] = useState([]);
  
  // Finish session states
  const [isFinishing, setIsFinishing] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState(4);

  // Available options
  const CLUBS = [
    'Driver', '3-Wood', '5-Wood', 
    '3-Iron', '4-Iron', '5-Iron', '6-Iron', '7-Iron', '8-Iron', '9-Iron', 
    'PW', 'GW', 'SW', 'LW'
  ];

  const CONTACTS = [
    { label: 'Pure ✨', value: 'Pure', desc: 'Sweetspot contact', colorClass: 'active-pure' },
    { label: 'Thin ↗️', value: 'Thin', desc: 'Low strike/flight', colorClass: 'active' },
    { label: 'Fat ↙️', value: 'Fat', desc: 'Hit turf first', colorClass: 'active' },
    { label: 'Topped ⬆️', value: 'Topped', desc: 'Hit ball top', colorClass: 'active-danger' },
    { label: 'Shank ❌', value: 'Shank/Miss', desc: 'Hard right miss', colorClass: 'active-danger' },
  ];

  const FLIGHTS = [
    { label: 'Straight ⬆️', value: 'Straight', desc: 'On-target line' },
    { label: 'Draw ↖️', value: 'Draw', desc: 'Right-to-left curve' },
    { label: 'Fade ↗️', value: 'Fade', desc: 'Left-to-right curve' },
    { label: 'Hook ⏪', value: 'Hook', desc: 'Sharp left curve' },
    { label: 'Slice ⏩', value: 'Slice', desc: 'Sharp right curve' },
    { label: 'Pull ◀️', value: 'Pull', desc: 'Straight diagonal left' },
    { label: 'Push ▶️', value: 'Push', desc: 'Straight diagonal right' },
  ];

  const COMMON_CUES = [
    'Smooth Tempo', 'Keep Head Steady', 'Slow Takeaway', 
    'Loose Grip Pressure', 'Full Shoulder Turn', 'Lead Hips First',
    'Hold the Finish', 'Target Focus'
  ];

  // Shot logging triggers
  const handleSelectContact = (contactVal) => {
    setSelectedContact(contactVal);
    // If flight is already selected, log immediately
    if (selectedFlight) {
      triggerLogShot(contactVal, selectedFlight);
    }
  };

  const handleSelectFlight = (flightVal) => {
    setSelectedFlight(flightVal);
    // If contact is already selected, log immediately
    if (selectedContact) {
      triggerLogShot(selectedContact, flightVal);
    }
  };

  const triggerLogShot = (contact, flight) => {
    onLogShot({
      club: activeSession.currentClub,
      contact: contact,
      flight: flight,
      cues: [...selectedCues]
    });
    
    // Reset selection for next shot
    setSelectedContact(null);
    setSelectedFlight(null);
  };

  // Toggle active swing thoughts
  const handleToggleCue = (cue) => {
    if (selectedCues.includes(cue)) {
      setSelectedCues(selectedCues.filter(c => c !== cue));
    } else {
      setSelectedCues([...selectedCues, cue]);
    }
  };

  // Stats for the active session
  const totalShots = activeSession.shots.length;
  const pureShots = activeSession.shots.filter(s => s.contact === 'Pure').length;
  const currentPurePct = totalShots > 0 ? Math.round((pureShots / totalShots) * 100) : 0;
  
  // Last 3 shots
  const lastShots = activeSession.shots.slice(-3).reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Session Header / Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Range Session 
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulseGlow 1.5s infinite' }}></span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Logging live swings &bull; Data saved automatically
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={onDiscardSession}>
            Discard
          </button>
          <button 
            className="btn btn-primary" 
            style={{ minWidth: '130px' }}
            onClick={() => setIsFinishing(true)}
            disabled={totalShots === 0}
          >
            Finish & Save
          </button>
        </div>
      </div>

      {/* Main Grid: Split controls */}
      <div className="dashboard-grid">
        
        {/* Left Side: Club Selector & Shot Tap Pads */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Club selector container */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1. Selected Club
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CLUBS.map(clubName => (
                <button
                  key={clubName}
                  className={`btn btn-secondary ${activeSession.currentClub === clubName ? 'active' : ''}`}
                  style={{ 
                    padding: '8px 14px', 
                    fontSize: '0.85rem',
                    borderColor: activeSession.currentClub === clubName ? 'var(--color-primary)' : 'var(--border-slate)',
                    minWidth: '55px'
                  }}
                  onClick={() => onLogShot({ ...activeSession.shots[activeSession.shots.length - 1], club: clubName, changeClubOnly: true })}
                >
                  {clubName}
                </button>
              ))}
            </div>
          </div>

          {/* Shot Input Grid (Contact & Flight) */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Tap Swing Details
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Tap Contact Feel and Ball Flight to log. It will automatically record when both are tapped.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Contact Grade */}
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Contact Quality:
                </span>
                <div className="log-grid">
                  {CONTACTS.map(item => (
                    <button
                      key={item.value}
                      className={`log-option-btn ${selectedContact === item.value ? item.colorClass : ''}`}
                      onClick={() => handleSelectContact(item.value)}
                    >
                      <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: '0.68rem', color: selectedContact === item.value ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ball Flight */}
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Ball Flight Shape:
                </span>
                <div className="log-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))' }}>
                  {FLIGHTS.map(item => (
                    <button
                      key={item.value}
                      className={`log-option-btn ${selectedFlight === item.value ? 'active' : ''}`}
                      onClick={() => handleSelectFlight(item.value)}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: '0.68rem', color: selectedFlight === item.value ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Active Cues / Focus swing thoughts */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3. Focus Cues / Swing Thoughts (Optional)
            </h3>
            <div className="cues-container">
              {COMMON_CUES.map(cue => (
                <div 
                  key={cue}
                  className={`cue-tag ${selectedCues.includes(cue) ? 'selected' : ''}`}
                  onClick={() => handleToggleCue(cue)}
                >
                  {selectedCues.includes(cue) && <Check size={12} />}
                  {cue}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Live Session Stats & Recents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Active Session Stats */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Session Stats</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Shots</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalShots}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Pure Hit %</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: currentPurePct > 60 ? 'var(--color-primary)' : 'inherit' }}>
                  {currentPurePct}%
                </span>
              </div>
            </div>

            {/* Quick Helper Tip */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(16,185,129,0.04)', padding: '10px', borderRadius: '8px', border: '1px dashed var(--border-glow)' }}>
              Tip: Keep your head still and focus on dynamic ground compression!
            </div>
          </div>

          {/* Last Logged Shots with Undo */}
          <div className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Last Recorded Shots</h3>
              {totalShots > 0 && (
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={onUndoShot}
                >
                  <RotateCcw size={12} />
                  Undo Last
                </button>
              )}
            </div>

            {totalShots === 0 ? (
              <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem', padding: '30px 0' }}>
                No shots logged in this session
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {lastShots.map((shot, idx) => (
                  <div 
                    key={shot.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: idx === 0 ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255,255,255,0.01)',
                      border: idx === 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{shot.club}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {shot.flight}
                      </span>
                    </div>
                    <div>
                      <span 
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '3px 8px', 
                          borderRadius: '4px',
                          background: shot.contact === 'Pure' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.08)',
                          color: shot.contact === 'Pure' ? 'var(--color-accent-gold)' : 'var(--text-primary)',
                          border: shot.contact === 'Pure' ? '1px solid var(--color-accent-gold-glow)' : 'none'
                        }}
                      >
                        {shot.contact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Finish Session Details Modal Overlay */}
      {isFinishing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 10, 8, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass-panel finish-modal-content">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>Save Range Practice Session</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Review and save your statistics to your digital golf logbook.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase' }}>Total Hits</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{totalShots}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase' }}>Pure Contact</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>{currentPurePct}%</span>
              </div>
            </div>

            {/* Session Rating */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Rate today's swing consistency:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      fontSize: '1.8rem', 
                      cursor: 'pointer',
                      color: star <= sessionRating ? 'var(--color-accent-gold)' : 'var(--text-muted)',
                      transition: 'transform 0.1s ease'
                    }}
                    onClick={() => setSessionRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Session Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Practice Notes & Reflections:
              </span>
              <textarea
                style={{
                  width: '100%',
                  height: '100px',
                  background: 'rgba(8, 15, 12, 0.8)',
                  border: '1px solid var(--border-slate)',
                  borderRadius: '10px',
                  padding: '12px',
                  color: 'white',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  resize: 'none',
                  outline: 'none'
                }}
                placeholder="Felt solid downswing hips leading. Slice happened with driver when swing tempo rushed..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
              />
            </div>

            {/* Save Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flexGrow: 1 }}
                onClick={() => setIsFinishing(false)}
              >
                Go Back
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flexGrow: 2 }}
                onClick={() => onFinishSession(sessionNotes, sessionRating)}
              >
                Save Log & Exit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
