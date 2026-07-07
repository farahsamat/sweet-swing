import React from 'react';
import { Play, ShieldAlert, Award, ChevronRight, Activity } from 'lucide-react';

export default function Dashboard({ 
  sessions, 
  onStartSession, 
  activeSession, 
  onNavigate,
  rounds = [],
  activeRound
}) {

  // Aggregate statistics
  const totalSessions = sessions.length;
  const allShots = sessions.flatMap(s => s.shots || []);
  const totalShots = allShots.length;
  
  const pureShots = allShots.filter(s => s.contact === 'Pure').length;
  const purePercentage = totalShots > 0 ? Math.round((pureShots / totalShots) * 100) : 0;
  
  // Calculate miss rates
  const fatShots = allShots.filter(s => s.contact === 'Fat').length;
  const thinShots = allShots.filter(s => s.contact === 'Thin').length;
  const toppedShots = allShots.filter(s => s.contact === 'Topped').length;
  const shankShots = allShots.filter(s => s.contact === 'Shank/Miss').length;
  const totalMisses = fatShots + thinShots + toppedShots + shankShots;
  const missPercentage = totalShots > 0 ? Math.round((totalMisses / totalShots) * 100) : 0;

  // Find most used club
  const clubCounts = allShots.reduce((acc, shot) => {
    acc[shot.club] = (acc[shot.club] || 0) + 1;
    return acc;
  }, {});
  
  let topClub = 'None';
  let maxClubShots = 0;
  Object.entries(clubCounts).forEach(([club, count]) => {
    if (count > maxClubShots) {
      maxClubShots = count;
      topClub = club;
    }
  });

  // On-Course statistics
  const totalRounds = rounds.length;
  let avgStrokesDiff = 0;
  let avgPuttsPerRound = 0;
  let avgGirPct = 0;
  let avgFwPct = 0;
  
  if (totalRounds > 0) {
    let totalDiff = 0;
    let totalPutts = 0;
    let totalHoles = 0;
    let totalGir = 0;
    let totalFwHoles = 0;
    let totalFwHits = 0;

    rounds.forEach(r => {
      const rPar = r.holes.reduce((s, h) => s + h.par, 0);
      const rScore = r.holes.reduce((s, h) => s + (h.score || 0), 0);
      totalDiff += (rScore - rPar);

      r.holes.forEach(h => {
        totalHoles += 1;
        totalPutts += h.putts || 0;
        if (h.gir) totalGir += 1;

        if (h.par > 3) {
          totalFwHoles += 1;
          if (h.fairway === 'Hit') totalFwHits += 1;
        }
      });
    });

    avgStrokesDiff = Math.round(totalDiff / totalRounds);
    avgPuttsPerRound = (totalPutts / totalHoles).toFixed(1);
    avgGirPct = Math.round((totalGir / totalHoles) * 100);
    avgFwPct = totalFwHoles > 0 ? Math.round((totalFwHits / totalFwHoles) * 100) : 0;
  }

  const avgStrokesDiffDisplay = totalRounds > 0 ? (avgStrokesDiff >= 0 ? `+${avgStrokesDiff}` : avgStrokesDiff) : '-';
  const avgPuttsPerRoundDisplay = totalRounds > 0 ? avgPuttsPerRound : '-';
  const avgGirPctDisplay = totalRounds > 0 ? `${avgGirPct}%` : '-%';
  const avgFwPctDisplay = totalRounds > 0 ? `${avgFwPct}%` : '-%';

  // Range flight patterns
  const rangeRightMisses = allShots.filter(s => s.flight === 'Slice' || s.flight === 'Push').length;
  const rangeLeftMisses = allShots.filter(s => s.flight === 'Hook' || s.flight === 'Pull').length;
  
  // On-course fairway misses
  let onCourseMissRight = 0;
  let onCourseMissLeft = 0;
  let totalOnCourseFwMisses = 0;

  if (totalRounds > 0) {
    rounds.forEach(r => {
      r.holes.forEach(h => {
        if (h.par > 3) {
          if (h.fairway === 'Right') {
            onCourseMissRight += 1;
            totalOnCourseFwMisses += 1;
          } else if (h.fairway === 'Left') {
            onCourseMissLeft += 1;
            totalOnCourseFwMisses += 1;
          }
        }
      });
    });
  }

  // Correlation Diagnostic
  let correlationTip = null;
  if (totalShots > 10 && totalOnCourseFwMisses > 3) {
    const rangeRightPct = Math.round((rangeRightMisses / totalShots) * 100);
    const rangeLeftPct = Math.round((rangeLeftMisses / totalShots) * 100);
    const courseRightPct = Math.round((onCourseMissRight / totalOnCourseFwMisses) * 100);
    const courseLeftPct = Math.round((onCourseMissLeft / totalOnCourseFwMisses) * 100);

    if (rangeRightPct > 15 && courseRightPct > 45) {
      correlationTip = {
        type: 'Slice/Push Right',
        message: `On the range, you miss ${rangeRightPct}% of shots to the Right. On the course, you missed ${courseRightPct}% of fairways to the Right. Your range tendency matches your on-course misses! Try the 'Headcover Armpit Drill' to keep your trail elbow tucked and eliminate the outside-in slice path.`
      };
    } else if (rangeLeftPct > 15 && courseLeftPct > 45) {
      correlationTip = {
        type: 'Hook/Pull Left',
        message: `On the range, you miss ${rangeLeftPct}% of shots to the Left. On the course, you missed ${courseLeftPct}% of fairways to the Left. Your range tendency matches your on-course misses! Focus on the 'Hips Open at Impact Drill' to prevent rolling your wrists early.`
      };
    }
  }

  // Calculate flight distribution for the SVG visualizer (excluding shanks/misses)
  const nonShankShots = allShots.filter(s => s.contact !== 'Shank/Miss');
  const totalNonShankShots = nonShankShots.length;

  const flightCounts = nonShankShots.reduce((acc, shot) => {
    acc[shot.flight] = (acc[shot.flight] || 0) + 1;
    return acc;
  }, {});

  const getFlightPercentage = (flightType) => {
    if (totalNonShankShots === 0) return 0;
    return Math.round(((flightCounts[flightType] || 0) / totalNonShankShots) * 100);
  };

  const flights = {
    Straight: getFlightPercentage('Straight'),
    Draw: getFlightPercentage('Draw'),
    Fade: getFlightPercentage('Fade'),
    Hook: getFlightPercentage('Hook'),
    Slice: getFlightPercentage('Slice'),
    Pull: getFlightPercentage('Pull'),
    Push: getFlightPercentage('Push'),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Welcome Header */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Sweet Swing Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Your central golf analytics dashboard. View driving range consistency, on-course scorecards, club yardage progress, and personalized swing coaching diagnostics. Choose tabs in the header to start a range session or scorecard.
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="stats-card-grid">
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Sessions</span>
          <span className="stat-val-huge">{totalSessions}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total driving range visits</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Shots</span>
          <span className="stat-val-huge">{totalShots}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Registered range hits</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Sweet Spot Contact</span>
          <span className="stat-val-huge primary">{purePercentage}%</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Pure hit ratio</span>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, color: 'var(--color-primary)' }}>
            <Award size={80} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Primary Club</span>
          <span className="stat-val-huge" style={{ fontSize: '2rem' }}>{topClub}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{maxClubShots > 0 ? `${maxClubShots} shots logged` : 'No shots logged yet'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '-12px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          On-Course Performance
        </h3>
        <div className="stats-card-grid">
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '3px solid var(--color-accent-gold)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Rounds Played</span>
            <span className="stat-val-huge">{totalRounds}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{totalRounds > 0 ? 'Completed scorecards' : 'No rounds played'}</span>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '3px solid var(--color-accent-gold)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Avg Score vs Par</span>
            <span className="stat-val-huge" style={{ color: totalRounds > 0 ? (avgStrokesDiff > 0 ? 'var(--color-danger)' : 'var(--color-primary)') : 'var(--text-primary)' }}>
              {avgStrokesDiffDisplay}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Relative to par average</span>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '3px solid var(--color-accent-gold)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Putts / Hole</span>
            <span className="stat-val-huge">{avgPuttsPerRoundDisplay}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Average short game strokes</span>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '3px solid var(--color-accent-gold)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>GIR % / Fairway %</span>
            <span className="stat-val-huge" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
              <span style={{ color: totalRounds > 0 ? 'var(--color-primary)' : 'var(--text-muted)' }}>{avgGirPctDisplay}</span> / <span style={{ color: totalRounds > 0 ? 'var(--color-info)' : 'var(--text-muted)' }}>{avgFwPctDisplay}</span>
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Accuracy ratios</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Interactive Section */}
      <div className="dashboard-grid">
        
        {/* Left Side: Ball Flight dispersion visualization */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Ball Flight Dispersion Map</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Visual representation of shot paths. Shading thickness corresponds to your landing shape percentage.
            </p>
          </div>

          <div className="dispersion-container">
            
            {/* Custom SVG Ball Flight Visual Target */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <svg width="280" height="280" viewBox="0 0 300 300" style={{ overflow: 'visible' }}>
                {/* Out-of-bounds / grid background */}
                <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" />
                <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" strokeDasharray="4" />
                <circle cx="150" cy="150" r="60" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" />
                <circle cx="150" cy="150" r="20" fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1.5" />
                
                {/* Horizontal & Vertical Gridlines */}
                <line x1="10" y1="150" x2="290" y2="150" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                <line x1="150" y1="10" x2="150" y2="290" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />

                {/* Range Markers */}
                <text x="150" y="25" fill="var(--text-muted)" fontSize="8" textAnchor="middle">200m</text>
                <text x="150" y="65" fill="var(--text-muted)" fontSize="8" textAnchor="middle">150m</text>
                <text x="150" y="105" fill="var(--text-muted)" fontSize="8" textAnchor="middle">100m</text>

                {/* Trajectory lines starting from bottom tee (150, 270) */}
                {/* Tee position */}
                <circle cx="150" cy="270" r="4" fill="white" />
                
                {/* Straight Path */}
                <path 
                  d="M150,270 Q150,150 150,50" 
                  fill="none" 
                  stroke={flights.Straight > 0 ? "var(--color-primary)" : "rgba(255, 255, 255, 0.05)"} 
                  strokeWidth={flights.Straight > 0 ? Math.max(1, flights.Straight * 0.15) : 1}
                  strokeDasharray={flights.Straight === 0 ? "3" : "none"}
                  opacity={flights.Straight > 0 ? Math.max(0.2, flights.Straight / 100) : 0.2}
                />
                
                {/* Draw (Left Curve) */}
                <path 
                  d="M150,270 Q120,160 100,70" 
                  fill="none" 
                  stroke={flights.Draw > 0 ? "var(--color-info)" : "rgba(255, 255, 255, 0.05)"} 
                  strokeWidth={flights.Draw > 0 ? Math.max(1, flights.Draw * 0.15) : 1}
                  strokeDasharray={flights.Draw === 0 ? "3" : "none"}
                  opacity={flights.Draw > 0 ? Math.max(0.2, flights.Draw / 100) : 0.2}
                />

                {/* Fade (Right Curve) */}
                <path 
                  d="M150,270 Q180,160 200,70" 
                  fill="none" 
                  stroke={flights.Fade > 0 ? "var(--color-info)" : "rgba(255, 255, 255, 0.05)"} 
                  strokeWidth={flights.Fade > 0 ? Math.max(1, flights.Fade * 0.15) : 1}
                  strokeDasharray={flights.Fade === 0 ? "3" : "none"}
                  opacity={flights.Fade > 0 ? Math.max(0.2, flights.Fade / 100) : 0.2}
                />

                {/* Hook (Sharp Left Curve) */}
                <path 
                  d="M150,270 Q90,180 50,90" 
                  fill="none" 
                  stroke={flights.Hook > 0 ? "var(--color-danger)" : "rgba(255, 255, 255, 0.05)"} 
                  strokeWidth={flights.Hook > 0 ? Math.max(1, flights.Hook * 0.15) : 1}
                  strokeDasharray={flights.Hook === 0 ? "3" : "none"}
                  opacity={flights.Hook > 0 ? Math.max(0.2, flights.Hook / 100) : 0.2}
                />

                {/* Slice (Sharp Right Curve) */}
                <path 
                  d="M150,270 Q210,180 250,90" 
                  fill="none" 
                  stroke={flights.Slice > 0 ? "var(--color-danger)" : "rgba(255, 255, 255, 0.05)"} 
                  strokeWidth={flights.Slice > 0 ? Math.max(1, flights.Slice * 0.15) : 1}
                  strokeDasharray={flights.Slice === 0 ? "3" : "none"}
                  opacity={flights.Slice > 0 ? Math.max(0.2, flights.Slice / 100) : 0.2}
                />

                {/* Pull (Straight Left Diagonal) */}
                <line 
                  x1="150" y1="270" x2="70" y2="150" 
                  stroke={flights.Pull > 0 ? "var(--color-danger)" : "rgba(255, 255, 255, 0.05)"}
                  strokeWidth={flights.Pull > 0 ? Math.max(1, flights.Pull * 0.15) : 1}
                  strokeDasharray={flights.Pull === 0 ? "3" : "none"}
                  opacity={flights.Pull > 0 ? Math.max(0.2, flights.Pull / 100) : 0.2}
                />

                {/* Push (Straight Right Diagonal) */}
                <line 
                  x1="150" y1="270" x2="230" y2="150" 
                  stroke={flights.Push > 0 ? "var(--color-danger)" : "rgba(255, 255, 255, 0.05)"}
                  strokeWidth={flights.Push > 0 ? Math.max(1, flights.Push * 0.15) : 1}
                  strokeDasharray={flights.Push === 0 ? "3" : "none"}
                  opacity={flights.Push > 0 ? Math.max(0.2, flights.Push / 100) : 0.2}
                />

                {/* Landing indicators / labels */}
                {flights.Straight > 0 && <circle cx="150" cy="50" r="5" fill="var(--color-primary)" filter="drop-shadow(0 0 4px var(--color-primary))" />}
                {flights.Draw > 0 && <circle cx="100" cy="70" r="5" fill="var(--color-info)" filter="drop-shadow(0 0 4px var(--color-info))" />}
                {flights.Fade > 0 && <circle cx="200" cy="70" r="5" fill="var(--color-info)" filter="drop-shadow(0 0 4px var(--color-info))" />}
                {flights.Hook > 0 && <circle cx="50" cy="90" r="5" fill="var(--color-danger)" filter="drop-shadow(0 0 4px var(--color-danger))" />}
                {flights.Slice > 0 && <circle cx="250" cy="90" r="5" fill="var(--color-danger)" filter="drop-shadow(0 0 4px var(--color-danger))" />}
                {flights.Pull > 0 && <circle cx="70" cy="150" r="5" fill="var(--color-danger)" filter="drop-shadow(0 0 4px var(--color-danger))" />}
                {flights.Push > 0 && <circle cx="230" cy="150" r="5" fill="var(--color-danger)" filter="drop-shadow(0 0 4px var(--color-danger))" />}
              </svg>
            </div>

            {/* Dispersion Percentages List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Flight Path</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Frequency</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                  Straight
                </span>
                <span style={{ fontWeight: 600, color: flights.Straight > 25 ? 'var(--color-primary)' : 'var(--text-primary)' }}>{flights.Straight}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-info)' }}></span>
                  Draw / Fade
                </span>
                <span style={{ fontWeight: 600 }}>{flights.Draw + flights.Fade}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-danger)' }}></span>
                  Slice / Hook
                </span>
                <span style={{ fontWeight: 600, color: (flights.Slice + flights.Hook) > 30 ? 'var(--color-danger)' : 'var(--text-primary)' }}>{flights.Slice + flights.Hook}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.6)' }}></span>
                  Pull / Push
                </span>
                <span style={{ fontWeight: 600 }}>{flights.Pull + flights.Push}%</span>
              </div>
              {totalShots === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', marginTop: '10px' }}>
                  No shots logged yet. Start a session to generate flight dispersion.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats summary & Recent Sessions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Diagnostic Coach Recommendation Box */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid var(--color-accent-gold)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--color-accent-gold)' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Coach Focus Recommendation</h3>
            </div>
            {totalShots === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                Log your first range session to analyze hit consistency and receive mechanical drills from the Coach!
              </p>
            ) : missPercentage > 40 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  Your miss rate is currently <strong>{missPercentage}%</strong>. Let's practice setup posture drills to lock down consistent clean contact.
                </p>
                <button 
                  className="btn btn-secondary" 
                  style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => onNavigate('coach')}
                >
                  View Custom Drills
                </button>
              </div>
            ) : flights.Slice + flights.Hook > 30 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  You have a high tendency of horizontal curves (<strong>{flights.Slice + flights.Hook}%</strong>). Let's review the clubface path alignment tips.
                </p>
                <button 
                  className="btn btn-secondary" 
                  style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => onNavigate('coach')}
                >
                  Analyze Ball Flights
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  Great swing work! Your clean contact is at <strong>{purePercentage}%</strong>. Visit the Coach page to refine timing and tempo keys.
                </p>
                <button 
                  className="btn btn-secondary" 
                  style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => onNavigate('coach')}
                >
                  View Swing Keys
                </button>
              </div>
            )}
          </div>

          {/* Range-to-Course Correlation Box */}
          {correlationTip && (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid var(--color-info)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(10, 18, 14, 0.8) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-display)', fontWeight: 'bold' }}>
                  🎯 Range-to-Course Correlation
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                {correlationTip.message}
              </p>
              <button 
                className="btn btn-secondary" 
                style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => onNavigate('coach')}
              >
                View Recommended Drill
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }
