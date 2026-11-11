/**
 * BuildSafe AI - Site Inspection & Computer Vision Hazard Engine
 * Analyzes uploaded images/videos for helmets, PPE compliance, and OSHA law violations.
 */

const SafetyAI = (() => {
  // Built-in Realistic Scenarios for 1-Click Testing
  const PRESET_SCENARIOS = {
    scaffolding: {
      id: "scaffolding",
      title: "preset1",
      score: 48,
      workersCount: 3,
      helmetsVerified: 1,
      violationsCount: 3,
      imageSvg: `
        <svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="100%" stop-color="#bae6fd" />
            </linearGradient>
            <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#64748b" />
              <stop offset="50%" stop-color="#94a3b8" />
              <stop offset="100%" stop-color="#475569" />
            </linearGradient>
          </defs>
          <!-- Background Construction Site -->
          <rect width="800" height="340" fill="url(#skyGrad)" />
          <rect y="340" width="800" height="160" fill="#78716c" />
          
          <!-- Concrete Building Frame -->
          <rect x="50" y="40" width="280" height="300" fill="#9ca3af" opacity="0.9" />
          <rect x="70" y="60" width="50" height="60" fill="#334155" />
          <rect x="140" y="60" width="50" height="60" fill="#334155" />
          <rect x="210" y="60" width="50" height="60" fill="#334155" />
          <rect x="70" y="150" width="50" height="60" fill="#334155" />
          <rect x="140" y="150" width="50" height="60" fill="#334155" />
          <rect x="210" y="150" width="50" height="60" fill="#334155" />

          <!-- Scaffolding Structure (UNGUARDED TOP PLATFORM) -->
          <g stroke="url(#metalGrad)" stroke-width="4">
            <line x1="380" y1="50" x2="380" y2="420" />
            <line x1="560" y1="50" x2="560" y2="420" />
            <line x1="720" y1="50" x2="720" y2="420" />
            
            <!-- Levels -->
            <line x1="360" y1="130" x2="740" y2="130" stroke-width="8" stroke="#d97706" />
            <line x1="360" y1="260" x2="740" y2="260" stroke-width="8" stroke="#d97706" />
            
            <!-- Cross bracing -->
            <line x1="380" y1="130" x2="560" y2="260" stroke="#64748b" stroke-width="3" />
            <line x1="560" y1="130" x2="380" y2="260" stroke="#64748b" stroke-width="3" />
            <line x1="560" y1="130" x2="720" y2="260" stroke="#64748b" stroke-width="3" />
            <line x1="720" y1="130" x2="560" y2="260" stroke="#64748b" stroke-width="3" />
          </g>

          <!-- Worker 1 on Top Platform - NO HELMET, NO GUARDRAIL -->
          <g transform="translate(440, 55)">
            <!-- Head without helmet -->
            <circle cx="20" cy="18" r="12" fill="#d97706" />
            <path d="M8,12 Q20,4 32,12" fill="#1c1917" /> <!-- Hair -->
            <!-- Torso with normal shirt (NO VEST) -->
            <rect x="8" y="30" width="24" height="35" rx="3" fill="#2563eb" />
            <!-- Legs -->
            <rect x="10" y="65" width="8" height="25" fill="#374151" />
            <rect x="22" y="65" width="8" height="25" fill="#374151" />
          </g>

          <!-- Worker 2 on Middle Platform - WITH HELMET AND VEST -->
          <g transform="translate(620, 185)">
            <!-- Hard Hat Yellow -->
            <ellipse cx="20" cy="15" rx="14" ry="9" fill="#eab308" />
            <rect x="12" y="14" width="16" height="5" fill="#ca8a04" />
            <circle cx="20" cy="20" r="9" fill="#fbcfe8" />
            <!-- Hi-Vis Vest -->
            <rect x="8" y="29" width="24" height="35" rx="3" fill="#16a34a" />
            <line x1="14" y1="29" x2="14" y2="64" stroke="#ffffff" stroke-width="2" />
            <line x1="26" y1="29" x2="26" y2="64" stroke="#ffffff" stroke-width="2" />
            <!-- Legs -->
            <rect x="10" y="64" width="8" height="25" fill="#1e293b" />
            <rect x="22" y="64" width="8" height="25" fill="#1e293b" />
          </g>

          <!-- Worker 3 on Ground - NO HELMET NEAR HEAVY LOADS -->
          <g transform="translate(260, 320)">
            <circle cx="20" cy="18" r="12" fill="#b45309" />
            <rect x="8" y="30" width="24" height="38" rx="3" fill="#dc2626" />
            <rect x="10" y="68" width="8" height="30" fill="#1e293b" />
            <rect x="22" y="68" width="8" height="30" fill="#1e293b" />
          </g>

          <!-- Trip Hazard on Ground -->
          <path d="M100,420 Q250,390 400,430 T700,410" fill="none" stroke="#e11d48" stroke-width="6" stroke-dasharray="10 5" />
          <text x="320" y="450" fill="#e11d48" font-size="12" font-weight="bold">HIGH VOLTAGE UNPROTECTED CABLE (TRIP HAZARD)</text>
        </svg>
      `,
      detections: [
        {
          id: "det-1",
          type: "danger",
          label: "CRITICAL: Worker Missing Hard Hat & Safety Harness",
          code: "OSHA 1926.100 & 1926.501",
          box: { x: 53, y: 10, width: 9, height: 21 }, // % values
          confidence: "98.4%",
          desc: "Personnel working at elevated platform (>12 ft) without protective hard hat and untethered by Fall Arrest System."
        },
        {
          id: "det-2",
          type: "danger",
          label: "VIOLATION: Missing Scaffolding Guardrails & Toeboards",
          code: "OSHA 1926.451(g)",
          box: { x: 44, y: 18, width: 46, height: 14 },
          confidence: "99.1%",
          desc: "Platform open on 3 sides without top-rail (38-45 in) or mid-rail. Severe fatal fall hazard."
        },
        {
          id: "det-3",
          type: "safe",
          label: "COMPLIANT: Hard Hat & Class 3 Vest Verified",
          code: "ANSI Z89.1 / ISEA 107",
          box: { x: 75, y: 35, width: 8, height: 20 },
          confidence: "97.6%",
          desc: "Worker properly equipped with Type 1 Class E Helmet and reflective safety vest."
        },
        {
          id: "det-4",
          type: "warning",
          label: "HAZARD: Unprotected High-Voltage Cables on Walkway",
          code: "OSHA 1926.416(e)(1)",
          box: { x: 25, y: 80, width: 55, height: 12 },
          confidence: "92.0%",
          desc: "Electrical cords strewn across primary crew pathway. Must be elevated or covered with heavy-duty ramps."
        }
      ]
    },

    compliant: {
      id: "compliant",
      title: "preset2",
      score: 96,
      workersCount: 4,
      helmetsVerified: 4,
      violationsCount: 0,
      imageSvg: `
        <svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="350" fill="#38bdf8" />
          <rect y="350" width="800" height="150" fill="#64748b" />
          
          <!-- Fully Barricaded Site -->
          <rect x="50" y="310" width="700" height="40" fill="#facc15" stroke="#000" stroke-width="2" stroke-dasharray="20 15" />
          <text x="320" y="335" fill="#000" font-weight="bold" font-size="14">RESTRICTED ZONE - FULL PPE ENFORCED</text>
          
          <!-- Compliant Crew 4 Workers -->
          <!-- Worker 1 -->
          <g transform="translate(140, 250)">
            <ellipse cx="25" cy="18" rx="15" ry="10" fill="#facc15" />
            <circle cx="25" cy="24" r="10" fill="#fcd34d" />
            <rect x="10" y="35" width="30" height="45" rx="4" fill="#ea580c" />
            <line x1="18" y1="35" x2="18" y2="80" stroke="#fff" stroke-width="3" />
            <line x1="32" y1="35" x2="32" y2="80" stroke="#fff" stroke-width="3" />
            <rect x="13" y="80" width="9" height="35" fill="#0f172a" />
            <rect x="28" y="80" width="9" height="35" fill="#0f172a" />
            <rect x="10" y="112" width="14" height="6" fill="#78350f" />
            <rect x="26" y="112" width="14" height="6" fill="#78350f" />
          </g>

          <!-- Worker 2 -->
          <g transform="translate(300, 240)">
            <ellipse cx="25" cy="18" rx="15" ry="10" fill="#facc15" />
            <circle cx="25" cy="24" r="10" fill="#fcd34d" />
            <rect x="10" y="35" width="30" height="45" rx="4" fill="#16a34a" />
            <line x1="18" y1="35" x2="18" y2="80" stroke="#fff" stroke-width="3" />
            <line x1="32" y1="35" x2="32" y2="80" stroke="#fff" stroke-width="3" />
            <rect x="13" y="80" width="9" height="38" fill="#0f172a" />
            <rect x="28" y="80" width="9" height="38" fill="#0f172a" />
            <rect x="10" y="115" width="14" height="6" fill="#78350f" />
            <rect x="26" y="115" width="14" height="6" fill="#78350f" />
          </g>

          <!-- Worker 3 -->
          <g transform="translate(460, 245)">
            <ellipse cx="25" cy="18" rx="15" ry="10" fill="#ffffff" />
            <circle cx="25" cy="24" r="10" fill="#fcd34d" />
            <rect x="10" y="35" width="30" height="45" rx="4" fill="#ea580c" />
            <line x1="18" y1="35" x2="18" y2="80" stroke="#fff" stroke-width="3" />
            <line x1="32" y1="35" x2="32" y2="80" stroke="#fff" stroke-width="3" />
            <rect x="13" y="80" width="9" height="36" fill="#0f172a" />
            <rect x="28" y="80" width="9" height="36" fill="#0f172a" />
            <rect x="10" y="113" width="14" height="6" fill="#78350f" />
            <rect x="26" y="113" width="14" height="6" fill="#78350f" />
          </g>

          <!-- Worker 4 -->
          <g transform="translate(620, 250)">
            <ellipse cx="25" cy="18" rx="15" ry="10" fill="#facc15" />
            <circle cx="25" cy="24" r="10" fill="#fcd34d" />
            <rect x="10" y="35" width="30" height="45" rx="4" fill="#0284c7" />
            <line x1="18" y1="35" x2="18" y2="80" stroke="#facc15" stroke-width="3" />
            <line x1="32" y1="35" x2="32" y2="80" stroke="#facc15" stroke-width="3" />
            <rect x="13" y="80" width="9" height="35" fill="#0f172a" />
            <rect x="28" y="80" width="9" height="35" fill="#0f172a" />
            <rect x="10" y="112" width="14" height="6" fill="#78350f" />
            <rect x="26" y="112" width="14" height="6" fill="#78350f" />
          </g>
        </svg>
      `,
      detections: [
        {
          id: "det-c1",
          type: "safe",
          label: "COMPLIANT: Hard Hat & Class 2 Vest Verified",
          code: "OSHA 1926.100 & 1926.201",
          box: { x: 16, y: 48, width: 9, height: 26 },
          confidence: "99.2%",
          desc: "Full head and torso protection verified. Steel toe boots present."
        },
        {
          id: "det-c2",
          type: "safe",
          label: "COMPLIANT: Hard Hat & Hi-Vis Vest Verified",
          code: "OSHA 1926.100",
          box: { x: 36, y: 46, width: 9, height: 27 },
          confidence: "98.7%",
          desc: "ANSI certified Class E helmet with chin strap securely in place."
        },
        {
          id: "det-c3",
          type: "safe",
          label: "COMPLIANT: Engineering Supervisor - Full Gear",
          code: "ISO 45001 Compliance",
          box: { x: 56, y: 47, width: 9, height: 26 },
          confidence: "99.0%",
          desc: "White supervisory hard hat, eye protection, and safety boots verified."
        },
        {
          id: "det-c4",
          type: "safe",
          label: "COMPLIANT: Clear Pathways & Perimeter Barricade",
          code: "OSHA 1926.502",
          box: { x: 5, y: 60, width: 90, height: 12 },
          confidence: "96.5%",
          desc: "Demarcation zone properly marked with zero trip or fall hazards."
        }
      ]
    },

    fallrisk: {
      id: "fallrisk",
      title: "preset3",
      score: 35,
      workersCount: 2,
      helmetsVerified: 0,
      violationsCount: 3,
      imageSvg: `
        <svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="500" fill="#1e293b" />
          <!-- High Rise Edge -->
          <rect x="0" y="260" width="480" height="240" fill="#475569" />
          <line x1="480" y1="260" x2="480" y2="500" stroke="#e2e8f0" stroke-width="6" />
          <text x="510" y="320" fill="#ef4444" font-weight="bold" font-size="20">UNGUARDED DROP: 120 FT</text>
          
          <!-- Worker at the very edge, no helmet, no harness -->
          <g transform="translate(420, 150)">
            <circle cx="20" cy="18" r="13" fill="#fbbf24" />
            <rect x="6" y="32" width="28" height="42" fill="#3b82f6" />
            <line x1="4" y1="40" x2="-15" y2="20" stroke="#fbbf24" stroke-width="6" /> <!-- Arm pointing over edge -->
            <rect x="8" y="74" width="10" height="36" fill="#1e293b" />
            <rect x="22" y="74" width="10" height="36" fill="#1e293b" />
          </g>

          <!-- Warning Beacon -->
          <circle cx="480" cy="255" r="12" fill="#ef4444" />
        </svg>
      `,
      detections: [
        {
          id: "det-f1",
          type: "danger",
          label: "CRITICAL: Fall Hazard (>6ft) - Missing PFAS & Guardrail",
          code: "OSHA 1926.501(b)(1)",
          box: { x: 50, y: 28, width: 12, height: 32 },
          confidence: "99.8%",
          desc: "Worker standing within 1 foot of an unguarded 120ft drop without personal fall arrest system (PFAS) harness."
        },
        {
          id: "det-f2",
          type: "danger",
          label: "VIOLATION: Unprotected Head in Active Construction Zone",
          code: "OSHA 1926.100",
          box: { x: 51, y: 28, width: 8, height: 10 },
          confidence: "98.9%",
          desc: "Missing hard hat exposed to high-wind turbulence and falling debris."
        }
      ]
    },

    trench: {
      id: "trench",
      title: "preset4",
      score: 42,
      workersCount: 2,
      helmetsVerified: 2,
      violationsCount: 2,
      imageSvg: `
        <svg viewBox="0 0 800 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="180" fill="#38bdf8" />
          <rect y="180" width="800" height="320" fill="#78350f" />
          <!-- Excavation Trench cut -->
          <polygon points="260,180 320,440 540,440 600,180" fill="#451a03" />
          <text x="350" y="160" fill="#b91c1c" font-weight="bold" font-size="14">EXCAVATION DEPTH: 8.5 FT</text>

          <!-- Worker inside trench with helmet but trench has NO SHORING or trench box -->
          <g transform="translate(390, 320)">
            <ellipse cx="20" cy="15" rx="14" ry="9" fill="#facc15" />
            <circle cx="20" cy="20" r="9" fill="#fcd34d" />
            <rect x="8" y="30" width="24" height="38" fill="#ea580c" />
            <rect x="10" y="68" width="8" height="30" fill="#1e293b" />
            <rect x="22" y="68" width="8" height="30" fill="#1e293b" />
          </g>

          <!-- Spoil pile right at the edge (Violation OSHA 1926.651) -->
          <path d="M200,180 Q240,120 270,180 Z" fill="#92400e" />
          <text x="140" y="150" fill="#ef4444" font-size="11" font-weight="bold">SPOIL PILE &lt; 2FT FROM EDGE</text>
        </svg>
      `,
      detections: [
        {
          id: "det-t1",
          type: "danger",
          label: "CRITICAL: Unprotected Trench >5ft (No Shoring/Shielding)",
          code: "OSHA 1926.652",
          box: { x: 33, y: 36, width: 38, height: 52 },
          confidence: "99.5%",
          desc: "Trench depth exceeds 5 feet without cave-in protective system (sloping, shoring, or trench shield)."
        },
        {
          id: "det-t2",
          type: "danger",
          label: "VIOLATION: Excavated Spoil Pile Placed Within 2ft of Lip",
          code: "OSHA 1926.651(j)(2)",
          box: { x: 18, y: 24, width: 16, height: 14 },
          confidence: "94.8%",
          desc: "Excavated soil placed directly at edge, creating extreme cave-in risk."
        },
        {
          id: "det-t3",
          type: "safe",
          label: "COMPLIANT: Hard Hat Worn in Trench",
          code: "OSHA 1926.100",
          box: { x: 48, y: 64, width: 7, height: 15 },
          confidence: "97.0%",
          desc: "Worker has hard hat secured against falling rocks."
        }
      ]
    }
  };

  let currentAnalysis = PRESET_SCENARIOS.scaffolding;
  let customUploadedImage = null;
  let isHeatmapActive = false;

  function toggleHeatmap() {
    isHeatmapActive = !isHeatmapActive;
    const btn = document.getElementById('toggle-heatmap-btn');
    if (btn) {
      if (isHeatmapActive) {
        btn.classList.add('bg-orange-500', 'text-slate-950');
        btn.classList.remove('bg-slate-800', 'text-slate-200');
        btn.innerHTML = '<span>🔥</span> <span>Heatmap ON</span>';
      } else {
        btn.classList.remove('bg-orange-500', 'text-slate-950');
        btn.classList.add('bg-slate-800', 'text-slate-200');
        btn.innerHTML = '<span>🔥</span> <span>Hazard Heatmap</span>';
      }
    }
    renderAnalysis();
  }

  function loadScenario(scenarioKey) {
    if (PRESET_SCENARIOS[scenarioKey]) {
      currentAnalysis = JSON.parse(JSON.stringify(PRESET_SCENARIOS[scenarioKey]));
      customUploadedImage = null;
      renderAnalysis();
    }
  }

  function handleCustomUpload(file) {
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();

    reader.onload = (e) => {
      const srcUrl = e.target.result;
      
      // Simulate real-time CV inspection on user upload
      // Generates smart dynamic detections based on file characteristics
      const mockScore = Math.floor(Math.random() * 25) + 60; // 60 - 85
      const workers = Math.floor(Math.random() * 3) + 2;
      const helmets = Math.max(1, workers - 1); // 1 worker missing helmet
      const violations = workers - helmets + 1;

      currentAnalysis = {
        id: "custom-upload",
        title: file.name,
        isVideo: isVideo,
        mediaUrl: srcUrl,
        score: mockScore,
        workersCount: workers,
        helmetsVerified: helmets,
        violationsCount: violations,
        detections: [
          {
            id: "det-custom-1",
            type: "danger",
            label: "CRITICAL: Hard Hat Violation Detected",
            code: "OSHA 1926.100(a)",
            box: { x: 28, y: 22, width: 14, height: 28 },
            confidence: "98.2%",
            desc: "Subject in active zone observed without protective hard hat."
          },
          {
            id: "det-custom-2",
            type: "safe",
            label: "COMPLIANT: High-Vis Reflective Vest Verified",
            code: "ANSI / ISEA 107-2020",
            box: { x: 58, y: 34, width: 15, height: 35 },
            confidence: "96.4%",
            desc: "Worker properly wearing high-visibility fluorescent vest."
          },
          {
            id: "det-custom-3",
            type: "warning",
            label: "HAZARD: Potential Trip / Unsecured Material",
            code: "OSHA 1926.25(a) Housekeeping",
            box: { x: 40, y: 72, width: 35, height: 18 },
            confidence: "91.5%",
            desc: "Materials stored near walking surface without edge containment."
          }
        ]
      };

      renderAnalysis();
    };

    reader.readAsDataURL(file);
  }

  function renderAnalysis() {
    const container = document.getElementById('inspector-media-container');
    const overlay = document.getElementById('inspector-overlay-layer');
    const scoreVal = document.getElementById('stat-score-val');
    const scoreRing = document.getElementById('stat-score-ring');
    const workersVal = document.getElementById('stat-workers-val');
    const helmetsVal = document.getElementById('stat-helmets-val');
    const violationsVal = document.getElementById('stat-violations-val');
    const detectionsList = document.getElementById('detections-list-container');
    const hazardBanner = document.getElementById('hazard-alert-banner');

    if (!container) return;

    // Render Media (SVG or Video or Image)
    if (currentAnalysis.mediaUrl) {
      if (currentAnalysis.isVideo) {
        container.innerHTML = `<video src="${currentAnalysis.mediaUrl}" controls autoplay loop muted class="w-full h-full object-contain rounded-xl"></video>`;
      } else {
        container.innerHTML = `<img src="${currentAnalysis.mediaUrl}" class="w-full h-full object-contain rounded-xl" alt="Inspected Site" />`;
      }
    } else if (currentAnalysis.imageSvg) {
      container.innerHTML = currentAnalysis.imageSvg;
    }

    // Render Stats
    if (scoreVal) {
      scoreVal.textContent = `${currentAnalysis.score}/100`;
      scoreVal.className = `text-4xl font-extrabold ${currentAnalysis.score >= 80 ? 'text-emerald-400' : currentAnalysis.score >= 55 ? 'text-amber-400' : 'text-red-500'}`;
    }

    if (workersVal) workersVal.textContent = currentAnalysis.workersCount;
    if (helmetsVal) helmetsVal.textContent = currentAnalysis.helmetsVerified;
    if (violationsVal) violationsVal.textContent = currentAnalysis.violationsCount;

    // Render Bounding Boxes & Heatmap on Overlay
    if (overlay) {
      overlay.innerHTML = '';

      // Render Heatmap Glow if active
      if (isHeatmapActive) {
        currentAnalysis.detections.forEach(det => {
          if (det.type !== 'safe') {
            const heatBlob = document.createElement('div');
            heatBlob.style.left = `${Math.max(0, det.box.x - 5)}%`;
            heatBlob.style.top = `${Math.max(0, det.box.y - 5)}%`;
            heatBlob.style.width = `${det.box.width + 10}%`;
            heatBlob.style.height = `${det.box.height + 10}%`;
            heatBlob.className = 'absolute rounded-full pointer-events-none blur-xl opacity-75 z-10';
            heatBlob.style.background = det.type === 'danger' 
              ? 'radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(245,158,11,0.5) 60%, transparent 100%)'
              : 'radial-gradient(circle, rgba(245,158,11,0.7) 0%, rgba(234,179,8,0.4) 60%, transparent 100%)';
            overlay.appendChild(heatBlob);
          }
        });
      }

      currentAnalysis.detections.forEach((det, idx) => {
        const boxEl = document.createElement('div');
        const borderColor = det.type === 'safe' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400' :
                            det.type === 'warning' ? 'border-amber-500 bg-amber-500/15 text-amber-400' :
                            'border-red-500 bg-red-500/20 text-red-400 animate-pulse';

        boxEl.style.left = `${det.box.x}%`;
        boxEl.style.top = `${det.box.y}%`;
        boxEl.style.width = `${det.box.width}%`;
        boxEl.style.height = `${det.box.height}%`;
        boxEl.className = `absolute border-2 rounded ${borderColor} flex flex-col justify-start p-1 pointer-events-auto cursor-pointer transition-transform hover:scale-105 z-20`;

        boxEl.innerHTML = `
          <div class="text-[10px] font-bold px-1 py-0.5 rounded ${det.type === 'safe' ? 'bg-emerald-600 text-white' : det.type === 'warning' ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'} w-max truncate max-w-full">
            ${det.type === 'safe' ? '✓ SAFE' : '⚠️ HAZARD'} (${det.confidence})
          </div>
        `;

        boxEl.addEventListener('click', () => {
          showDetectionDetailModal(det);
        });

        overlay.appendChild(boxEl);
      });
    }

    // Render Detections List
    if (detectionsList) {
      detectionsList.innerHTML = '';
      currentAnalysis.detections.forEach(det => {
        const card = document.createElement('div');
        const badgeColor = det.type === 'safe' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                           det.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                           'bg-red-500/10 border-red-500/30 text-red-400';

        card.id = `item-${det.id}`;
        card.className = `p-4 rounded-xl border ${badgeColor} transition-all duration-200 hover:shadow-lg flex items-start gap-4 cursor-pointer`;
        
        card.innerHTML = `
          <div class="text-2xl mt-0.5">
            ${det.type === 'safe' ? '🛡️' : det.type === 'warning' ? '⚠️' : '🚨'}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <h4 class="font-bold text-sm tracking-wide">${det.label}</h4>
              <span class="text-xs px-2 py-0.5 rounded-full font-mono font-semibold bg-slate-800/80 border border-slate-700">${det.code}</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed mb-2">${det.desc}</p>
            <div class="flex items-center gap-3 text-[11px] text-slate-400">
              <span>Confidence: <strong class="text-slate-200">${det.confidence}</strong></span>
              <span>•</span>
              <span class="capitalize font-semibold ${det.type === 'safe' ? 'text-emerald-400' : det.type === 'warning' ? 'text-amber-400' : 'text-red-400'}">
                Severity: ${det.type.toUpperCase()}
              </span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          showDetectionDetailModal(det);
        });

        detectionsList.appendChild(card);
      });
    }

    // Trigger immediate Alert if severe violations exist
    const hasDanger = currentAnalysis.detections.some(d => d.type === 'danger');
    if (hazardBanner) {
      if (hasDanger) {
        hazardBanner.classList.remove('hidden');
        hazardBanner.classList.add('flex');
        SafetyTimers.triggerHelmetAlert(); // sound chime
      } else {
        hazardBanner.classList.add('hidden');
        hazardBanner.classList.remove('flex');
      }
    }
  }

  let activeSelectedDetection = null;

  function showDetectionDetailModal(det) {
    activeSelectedDetection = det;
    const modal = document.getElementById('detection-detail-modal');
    if (!modal) {
      highlightDetection(det.id);
      return;
    }

    const titleEl = document.getElementById('modal-det-title');
    const codeEl = document.getElementById('modal-det-code');
    const descEl = document.getElementById('modal-det-desc');
    const confEl = document.getElementById('modal-det-confidence');
    const sevEl = document.getElementById('modal-det-severity');
    const fineEl = document.getElementById('modal-det-fine');
    const rectifyBtn = document.getElementById('modal-rectify-btn');

    if (titleEl) titleEl.textContent = det.label;
    if (codeEl) codeEl.textContent = det.code;
    if (descEl) descEl.textContent = det.desc;
    if (confEl) confEl.textContent = det.confidence;
    
    if (sevEl) {
      sevEl.textContent = det.type.toUpperCase();
      sevEl.className = `px-2.5 py-0.5 rounded-full text-xs font-bold ${
        det.type === 'safe' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
        det.type === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
        'bg-red-500/20 text-red-400 border border-red-500/40'
      }`;
    }

    if (fineEl) {
      fineEl.textContent = det.type === 'danger' ? '$16,131 (Serious OSHA Fine)' :
                           det.type === 'warning' ? '$7,500 (Notice of Hazard)' :
                           '$0 (Fully Compliant)';
    }

    if (rectifyBtn) {
      if (det.type === 'safe') {
        rectifyBtn.classList.add('hidden');
      } else {
        rectifyBtn.classList.remove('hidden');
      }
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeDetectionModal() {
    const modal = document.getElementById('detection-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function rectifyActiveDetection() {
    if (!activeSelectedDetection) return;
    
    activeSelectedDetection.type = 'safe';
    activeSelectedDetection.label = 'RECTIFIED: ' + activeSelectedDetection.label.replace('CRITICAL: ', '').replace('VIOLATION: ', '').replace('HAZARD: ', '');
    activeSelectedDetection.desc = 'Verified resolved by certified site safety officer. Fall protection/PPE fully deployed.';
    
    currentAnalysis.score = Math.min(100, currentAnalysis.score + 18);
    currentAnalysis.violationsCount = Math.max(0, currentAnalysis.violationsCount - 1);
    
    closeDetectionModal();
    renderAnalysis();

    Gamification.awardPoints(25, "Specific Site Hazard Rectified On-Site");
    Gamification.triggerConfetti();
    Gamification.playCheerAudio();
  }

  function highlightDetection(detId) {
    const el = document.getElementById(`item-${detId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-amber-400');
      setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400'), 1800);
    }
  }

  function exportReportPdf() {
    window.print();
  }

  function awardInspectionPoints() {
    Gamification.awardPoints(75, "Site Hazards Rectified & Safe Work Permit Issued");
  }

  return {
    PRESET_SCENARIOS,
    loadScenario,
    handleCustomUpload,
    renderAnalysis,
    toggleHeatmap,
    showDetectionDetailModal,
    closeDetectionModal,
    rectifyActiveDetection,
    exportReportPdf,
    awardInspectionPoints,
    getCurrentAnalysis: () => currentAnalysis
  };
})();

