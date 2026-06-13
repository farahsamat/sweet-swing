# Sweet Swing ⛳ // Golf Swing Tracker & Performance Analyzer

*Sweet Swing* is a modern, responsive, mobile-first golf practice companion designed for range players to log shots, calculate strike consistency ratios, and get custom diagnostic feedback to improve their swings.

Everything runs 100% locally in your browser to respect your data privacy.

---

## 💡 The Problem

Improving your golf swing requires consistent practice, but standard driving range sessions lack feedback. Many golfers face these challenges:
* **Manual Logs & Mental Math**: Writing down shot results on paper and manually calculating sweet-spot percentages is tedious and disrupts practice tempo.
* **Lack of Critique**: It’s hard to self-diagnose *why* a shot was thin, fat, or sliced, leading to reinforcing bad habits instead of fixing them.
* **Complex Terminology**: Professional golf diagnostics are filled with dense jargon that is overwhelming for beginner and high-handicap players.

---

## 🚀 The Solution: Beginner-Friendly Practice

Sweet Swing automates golf self-assessment and makes range sessions productive and structured:
* **Glove-Friendly, One-Tap Input**: Log shots in under **2 seconds** between swings. No typing required.
* **Built-in Keywords**: Button labels include simple keyword helpers (e.g., *Fat* ➔ *Hit turf first*, *Draw* ➔ *Right-to-left curve*) so you don’t have to memorize complex ball flights.
* **Instant Ratios**: Get live contact quality percentages (e.g., *72% Sweet Spot*) as you swing.
* **Simple Diagnostics**: Translates your miss patterns into clear, step-by-step mechanical suggestions and beginner drills.

---

## ✨ Features

* **⚡ One-Tap Practice Logger**: Fast, big-button mobile interface for recording Club, Contact Grade, and Ball Flight.
* **🎯 Flight Dispersion Map**: Visualizes your shot trajectories using an interactive SVG target landing grid.
* **🧠 Diagnostic Swing Coach**: Pinpoints your primary contact error or flight curve and recommends targeted drills (e.g., *Towel Drill* or *Headcover Drill*).
* **📅 Expandable Session History**: Tracks dates, star ratings, club-by-club consistency, and text reflections.
* **🔒 100% Local Privacy**: Runs entirely in your browser with zero external servers. All data is saved in `localStorage`.

---

## 🔮 The Roadmap: Future Expansion

We envision expanding Sweet Swing from a simple range logger into a comprehensive digital golf coach. The next phases of development will introduce:

### 1. 📹 AI Video Analysis (Swing Mechanics)
* **Local Joint Tracking**: Incorporate *Google MediaPipe* in-browser to trace your wrists, shoulders, hips, and knees. The app will visually overlay your swing plane, detect head sway, and critique your posture angles.
* **Gemini Coach Integration**: Allow quick video uploads to get a detailed AI swing analysis text critique: identifying setup errors, backswing release issues, and follow-through balance.

### 2. 🏌️‍♂️ Play Mode (On-Course Scorecard & Analytics)
* **Round Statistics Log**: Log actual golf rounds hole-by-hole, tracking strokes, Putts per Hole, Green in Regulation (GIR), and Fairways Hit (Off the Tee).
* **Range-to-Course Correlation**: Connect range metrics with on-course performance: *"On the range, you slice 40% of Driver shots. In today's round, you missed 5 fairways to the right. Try the Headcover Armpit Drill before your next tee time."*
* **Club Average Yardage Matrix**: Aggregates only your *pure* contact shots to map out exactly how far you hit each club.

### 3. 🗺️ GPS Rangefinder & Hole Mapping (Course Intelligence)
* **Live Satellite Rangefinder**: Integrates with Mapbox or Google Maps Satellite view, using your phone’s browser GPS coordinates to show your exact position on the hole and dynamic yardage distance to the center of the green.
* **Tap-to-Plot Shot Log**: Plot your exact landing locations on the map as you walk the course, automatically measuring your shot distances (e.g. tracking a 230-yard drive).
* **Landing Heatmaps**: Aggregates multiple rounds on the same course to display visual shot-dispersion heatmaps over each hole layout, highlighting where you routinely miss or clear hazards.


---

## ⚙️ Local Setup & Run

### Prerequisites
* **Node.js** (v20+ recommended)
* **npm**

### Installation

1. Navigate to the project directory:
   ```bash
   cd golf-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5174/` (or the terminal's **Network URL** on your phone).

---

## 📖 Glossary of Golf Swing Terms

Use this glossary as a quick reference for identifying your hits:

### 1. Contact Quality (Impact Feel)
* **Pure ✨ (Sweet Spot)**: Perfect contact. feels soft, sounds solid, goes maximum distance.
* **Thin ↗️ (Bladed)**: Struck too high on the ball. Travel is low, fast, stings hands, and rolls long.
* **Fat ↙️ (Chunked)**: Hit turf before the ball. Grass slows the club down, causing a very high, short shot.
* **Topped ⬆️**: Struck only the top of the ball, sending it rolling along the grass.
* **Shank ❌**: Ball hit the hosel (metal connector). Shoots sharply off to the right.

### 2. Ball Flight Shape (Trajectory Curve)
* **Straight ⬆️**: Flies in a direct line with no curve, landing on target.
* **Draw ↖️**: Starts right of target and curves gently left to land on-target. *(Adds distance)*
* **Fade ↗️ (Cut)**: Starts left of target and curves gently right to land on-target. *(Lands softly)*
* **Hook ⏪**: Exaggerated, aggressive curve to the left.
* **Slice ⏩**: Exaggerated, aggressive curve to the right. *(Most common beginner miss)*
* **Pull ◀️**: Goes straight diagonal left from launch with no curve.
* **Push ▶️**: Goes straight diagonal right from launch with no curve.
