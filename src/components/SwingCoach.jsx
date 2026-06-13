import React from 'react';
import { BookOpen, Target, CheckCircle } from 'lucide-react';

export default function SwingCoach({ sessions }) {
  const allShots = sessions.flatMap(s => s.shots || []);
  const totalShots = allShots.length;

  // Track contact counts to diagnose major miss
  const contactCounts = allShots.reduce((acc, s) => {
    if (s.contact !== 'Pure') acc[s.contact] = (acc[s.contact] || 0) + 1;
    return acc;
  }, {});

  // Track flight counts to diagnose major curve shape
  const flightCounts = allShots.reduce((acc, s) => {
    if (s.flight !== 'Straight') acc[s.flight] = (acc[s.flight] || 0) + 1;
    return acc;
  }, {});

  // Identify top misses
  let primaryContactMiss = 'None';
  let primaryContactMissCount = 0;
  Object.entries(contactCounts).forEach(([contact, count]) => {
    if (count > primaryContactMissCount) {
      primaryContactMissCount = count;
      primaryContactMiss = contact;
    }
  });

  let primaryFlightMiss = 'None';
  let primaryFlightMissCount = 0;
  Object.entries(flightCounts).forEach(([flight, count]) => {
    if (count > primaryFlightMissCount) {
      primaryFlightMissCount = count;
      primaryFlightMiss = flight;
    }
  });

  // Drill database definitions
  const DRILLS = {
    Fat: {
      title: "The Towel Impact Drill",
      subtitle: "Fix ground-first contact",
      desc: "Place a flat golf towel or alignment stick 2-3 inches behind the golf ball. Take your normal stance and practice striking the golf ball cleanly without hitting the towel. This forces you to hit down on the ball first before hitting the ground.",
      cues: ["Weight shifts forward early", "Keep wrists hinged on downswing", "Compress the ball"],
      difficulty: "Intermediate"
    },
    Thin: {
      title: "The Penny Strike Drill",
      subtitle: "Fix lifting out of posture",
      desc: "Place a flat coin (like a penny) or a small leaf directly in front of the golf ball. When you take your swing, focus on striking the penny away. This keeps your posture down and guarantees your club bottoms out after the ball.",
      cues: ["Keep chest down through impact", "Maintain spine angle", "Look at the turf after impact"],
      difficulty: "Beginner"
    },
    Topped: {
      title: "Spine Angle Wall Drill",
      subtitle: "Stop standing up too early",
      desc: "Without a club, cross your arms over your chest and place your forehead lightly against a wall. Take practice backswings and downswings, keeping your head lightly touching the wall. If your head pulls off, you are raising your spine angle.",
      cues: ["Keep chest over the ball", "Hips rotatate, not lift", "Maintain knee flex"],
      difficulty: "Beginner"
    },
    'Shank/Miss': {
      title: "The Two-Ball Gate Drill",
      subtitle: "Prevent heel/hosel strikes",
      desc: "Place two golf balls on the turf side by side, leaving just enough room (about 1.5 clubheads wide) between them. Address the inner ball, but swing and hit only the inner ball. This prevents your hands from reaching outwards.",
      cues: ["Keep hands close on downswing", "Weight balanced in midfoot", "Swing path inside-out"],
      difficulty: "Advanced"
    },
    Slice: {
      title: "The Headcover Armpit Drill",
      subtitle: "Fix over-the-top/outside swing paths",
      desc: "Place a headcover under your trail armpit (right arm for right-handers). Take practice swings (or soft half-swings) keeping the headcover trapped. If the cover falls on the downswing, your arms are separating, causing a slice.",
      cues: ["Tuck trail elbow in", "Initiate downswing with hips", "Smooth takeaway rotation"],
      difficulty: "Intermediate"
    },
    Hook: {
      title: "Hips Open at Impact Drill",
      subtitle: "Stop flipping the wrist early",
      desc: "Set up normally. On your backswing, focus on making a full rotation, then lead the downswing with your hips. Your hands should pull through the impact zone *before* your wrists release. This opens the face to neutral.",
      cues: ["Lead hips forward first", "Maintain firm lead wrist", "Neutral grip pressure"],
      difficulty: "Intermediate"
    },
    Pull: {
      title: "The Gate Tee Drill",
      subtitle: "Adjust outside-in swing path",
      desc: "Place a golf tee 1 inch outside and 1 inch ahead of your target ball. Focus on swinging the club through the inside channel. This counteracts pulling the ball left.",
      cues: ["Swing to right-center field", "Extend arms down target line", "Stay balanced"],
      difficulty: "Intermediate"
    },
    Push: {
      title: "The Trail Hip Release Drill",
      subtitle: "Ensure full rotation release",
      desc: "Take practice swings focusing on turning your trail hip fully toward the target at finish. Pushing occurs when the hips stall and the arms block out to the right.",
      cues: ["Rotate trail hip fully", "Let club release naturally", "Complete follow-through"],
      difficulty: "Beginner"
    }
  };

  const activeContactDrill = DRILLS[primaryContactMiss];
  const activeFlightDrill = DRILLS[primaryFlightMiss];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
          Swing Coach & Performance Diagnostics
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Local rule-based coaching analysis generated from your practice ranges.
        </p>
      </div>

      {totalShots === 0 ? (
        /* Empty Coach State */
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <BookOpen size={48} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '1.4rem' }}>No Diagnostic Data Available</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '0.9rem', lineHeight: '1.5' }}>
            We need logged swings to analyze your contact profile and trajectory shape. Once you complete your first practice range session, personalized diagnoses and drills will appear here!
          </p>
        </div>
      ) : (
        /* Analysis Screen */
        <div className="dashboard-grid">
          
          {/* Left Side: Custom Drills & Diagnoses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Diagnosis Overview Card */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '1.3rem' }}>Swing Miss Pattern Analysis</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>Primary Strike Error</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: primaryContactMiss !== 'None' ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                    {primaryContactMiss !== 'None' ? `${primaryContactMiss} Contact` : 'Clean Strike'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                    {primaryContactMissCount > 0 ? `${primaryContactMissCount} counts logged` : 'Zero fat/thin misses'}
                  </span>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>Primary Flight Curve</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: (primaryFlightMiss === 'Slice' || primaryFlightMiss === 'Hook') ? 'var(--color-danger)' : 'var(--color-info)' }}>
                    {primaryFlightMiss !== 'None' ? primaryFlightMiss : 'Straight Ball'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                    {primaryFlightMissCount > 0 ? `${primaryFlightMissCount} counts logged` : 'Perfect linear flight'}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Drills section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>Your Custom Training Drills</h3>

              {/* Contact Drill Card */}
              {activeContactDrill ? (
                <div className="glass-panel coach-drill-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-primary)', fontWeight: 600 }}>
                        Contact Fix ({activeContactDrill.difficulty})
                      </span>
                      <h4 style={{ fontSize: '1.25rem', marginTop: '6px' }}>{activeContactDrill.title}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{activeContactDrill.subtitle}</p>
                    </div>
                  </div>
                  
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.5', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                    {activeContactDrill.desc}
                  </p>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                      Recommended Swing thoughts:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {activeContactDrill.cues.map(cue => (
                        <span key={cue} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-slate)', padding: '4px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={10} style={{ color: 'var(--color-primary)' }} />
                          {cue}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Flight Drill Card */}
              {activeFlightDrill ? (
                <div className="glass-panel coach-drill-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeftColor: 'var(--color-info)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-info)', fontWeight: 600 }}>
                        Flight Trajectory Fix ({activeFlightDrill.difficulty})
                      </span>
                      <h4 style={{ fontSize: '1.25rem', marginTop: '6px' }}>{activeFlightDrill.title}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{activeFlightDrill.subtitle}</p>
                    </div>
                  </div>
                  
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.5', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                    {activeFlightDrill.desc}
                  </p>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                      Recommended Swing thoughts:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {activeFlightDrill.cues.map(cue => (
                        <span key={cue} style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-slate)', padding: '4px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={10} style={{ color: 'var(--color-info)' }} />
                          {cue}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {!activeContactDrill && !activeFlightDrill && (
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No major swing faults identified! Continue maintaining clean strikes and straight trajectories.
                </div>
              )}

            </div>

          </div>

          {/* Right Side: Coach Checklist Guidelines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Pre-Practice Setup Checklist</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                Before starting your swings, execute these foundational checkmarks:
              </p>
              
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                  <CheckCircle size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <div>
                    <strong>Stance Width:</strong> Shoulder-width for mid-irons, slightly wider for drivers, narrower for wedges.
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                  <CheckCircle size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <div>
                    <strong>Grip Pressure:</strong> 4 out of 10 scale. Hold it like a baby bird — firm but not strangling.
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                  <CheckCircle size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <div>
                    <strong>Posture Spine:</strong> Bend from hips, keep back straight, slight flex in knees. Balance in mid-foot.
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                  <CheckCircle size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <div>
                    <strong>Ball Alignment:</strong> Center stance for wedges, 1-2 balls forward for irons, inside lead heel for Driver.
                  </div>
                </li>
              </ul>
            </div>

            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid var(--color-accent-gold)' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={16} style={{ color: 'var(--color-accent-gold)' }} />
                Aesthetic Flight Shapes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <p>
                  <strong>Draw:</strong> Starts slightly right of target line and curves back left to target. (Ideal for distance)
                </p>
                <p>
                  <strong>Fade:</strong> Starts slightly left of target line and curves back right to target. (Ideal for landing control)
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
