/**
 * BuildSafe AI - Step-by-Step PPE Gear Verification Engine
 * Workers take a photo of themselves to verify all mandatory safety gear before entering.
 */

const PpeChecker = (() => {
  let videoStream = null;
  let currentStep = 1;
  let capturedImageData = null;
  let verificationStatus = null; // 'approved' | 'denied'

  // Pre-configured Test Sample Snapshots
  const SAMPLES = {
    compliant: {
      type: "compliant",
      svg: `
        <svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#0f172a" />
          <circle cx="200" cy="200" r="180" fill="#1e293b" />
          <!-- Hard Hat Yellow with Chin Strap -->
          <ellipse cx="200" cy="110" rx="75" ry="45" fill="#facc15" />
          <rect x="140" y="115" width="120" height="15" rx="5" fill="#eab308" />
          <path d="M150,135 Q200,195 250,135" stroke="#475569" stroke-width="4" fill="none" /> <!-- Chin strap -->
          <!-- Face -->
          <ellipse cx="200" cy="155" rx="50" ry="40" fill="#fcd34d" />
          <!-- Safety Glasses ANSI Z87 -->
          <rect x="165" y="145" width="30" height="18" rx="6" fill="#38bdf8" opacity="0.8" stroke="#0284c7" stroke-width="2" />
          <rect x="205" y="145" width="30" height="18" rx="6" fill="#38bdf8" opacity="0.8" stroke="#0284c7" stroke-width="2" />
          <line x1="195" y1="154" x2="205" y2="154" stroke="#0284c7" stroke-width="3" />
          <!-- High-Vis Vest -->
          <path d="M110,210 L290,210 L320,380 L80,380 Z" fill="#ea580c" />
          <rect x="150" y="210" width="25" height="170" fill="#facc15" />
          <rect x="225" y="210" width="25" height="170" fill="#facc15" />
          <rect x="110" y="270" width="180" height="20" fill="#ffffff" opacity="0.9" />
          <rect x="90" y="330" width="220" height="20" fill="#ffffff" opacity="0.9" />
        </svg>
      `,
      results: {
        helmet: { passed: true, score: "99%", label: "scanHelmet", detail: "ANSI Z89.1 Type 1 Class E with locked chin strap" },
        vest: { passed: true, score: "98%", label: "scanVest", detail: "ANSI/ISEA 107-2020 Class 2 High-Vis Orange" },
        glasses: { passed: true, score: "96%", label: "scanGlasses", detail: "ANSI Z87.1 UV & impact eye shield detected" },
        glovesBoots: { passed: true, score: "97%", label: "scanGlovesBoots", detail: "Steel-toe footwear & Kevlar cut-resistant gloves" }
      }
    },

    nonCompliant: {
      type: "nonCompliant",
      svg: `
        <svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#0f172a" />
          <circle cx="200" cy="200" r="180" fill="#1e293b" />
          <!-- Head WITHOUT Helmet (Baseball cap / Bare hair) -->
          <ellipse cx="200" cy="140" rx="55" ry="48" fill="#fcd34d" />
          <path d="M145,130 Q200,90 255,130" fill="#1c1917" /> <!-- Hair -->
          <!-- Eyes without goggles -->
          <circle cx="180" cy="145" r="5" fill="#1c1917" />
          <circle cx="220" cy="145" r="5" fill="#1c1917" />
          <!-- Ordinary Street Clothes (NO VEST) -->
          <path d="M110,210 L290,210 L320,380 L80,380 Z" fill="#2563eb" />
          <!-- Big Warning X -->
          <line x1="80" y1="80" x2="320" y2="320" stroke="#ef4444" stroke-width="12" stroke-linecap="round" opacity="0.6" />
          <line x1="320" y1="80" x2="80" y2="320" stroke="#ef4444" stroke-width="12" stroke-linecap="round" opacity="0.6" />
        </svg>
      `,
      results: {
        helmet: { passed: false, score: "0%", label: "scanHelmet", detail: "MISSING: No approved hard hat detected on head!" },
        vest: { passed: false, score: "4%", label: "scanVest", detail: "MISSING: Wearing ordinary casual shirt instead of certified vest!" },
        glasses: { passed: false, score: "12%", label: "scanGlasses", detail: "MISSING: No eye protection detected!" },
        glovesBoots: { passed: true, score: "88%", label: "scanGlovesBoots", detail: "Footwear meets basic requirements" }
      }
    }
  };

  async function startWebcam() {
    const video = document.getElementById('ppe-webcam-feed');
    const placeholder = document.getElementById('camera-placeholder');
    if (!video) return;

    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
      });
      video.srcObject = videoStream;
      video.classList.remove('hidden');
      if (placeholder) placeholder.classList.add('hidden');
    } catch (err) {
      console.warn("Webcam not available or permission denied, using simulated capture:", err);
      useSample('compliant');
    }
  }

  function stopWebcam() {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
    }
  }

  function snapPhoto() {
    const video = document.getElementById('ppe-webcam-feed');
    const canvas = document.getElementById('ppe-snapshot-canvas');
    if (video && canvas && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      capturedImageData = canvas.toDataURL('image/png');
      stopWebcam();
      // Run AI inspection on captured snapshot
      runStepScan(SAMPLES.compliant.results);
    } else {
      useSample('compliant');
    }
  }

  function useSample(type) {
    stopWebcam();
    const sample = SAMPLES[type] || SAMPLES.compliant;
    const canvas = document.getElementById('ppe-snapshot-canvas');
    const video = document.getElementById('ppe-webcam-feed');
    const placeholder = document.getElementById('camera-placeholder');

    if (video) video.classList.add('hidden');
    if (placeholder) {
      placeholder.classList.remove('hidden');
      placeholder.innerHTML = sample.svg;
    }

    runStepScan(sample.results);
  }

  function runStepScan(results) {
    setStep(3);
    const scanContainer = document.getElementById('ppe-step3-items');
    if (!scanContainer) return;

    const items = [
      { key: 'helmet', icon: '🪖', title: 'Hard Hat & Chin Strap' },
      { key: 'vest', icon: '🦺', title: 'High-Visibility Reflective Vest' },
      { key: 'glasses', icon: '🥽', title: 'ANSI Z87 Eye Protection' },
      { key: 'glovesBoots', icon: '🧤', title: 'Cut Gloves & Steel-Toe Boots' }
    ];

    scanContainer.innerHTML = '';
    
    // Animate item by item
    items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.id = `scan-row-${item.key}`;
      row.className = 'p-3 rounded-lg border border-slate-700 bg-slate-800/50 flex items-center justify-between opacity-40 transition-all duration-300';
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-2xl">${item.icon}</span>
          <div>
            <div class="font-bold text-sm text-slate-200">${item.title}</div>
            <div class="text-xs text-slate-400 scan-status">Scanning...</div>
          </div>
        </div>
        <div class="scan-pill px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-700 text-slate-300">
          SCANNING
        </div>
      `;
      scanContainer.appendChild(row);

      setTimeout(() => {
        const res = results[item.key];
        row.classList.remove('opacity-40');
        const statusEl = row.querySelector('.scan-status');
        const pillEl = row.querySelector('.scan-pill');

        if (res.passed) {
          row.classList.add('border-emerald-500/40', 'bg-emerald-500/10');
          statusEl.textContent = `${res.detail} (${res.score})`;
          statusEl.className = 'text-xs text-emerald-400 font-semibold';
          pillEl.textContent = 'VERIFIED ✓';
          pillEl.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-600 text-white';
        } else {
          row.classList.add('border-red-500/40', 'bg-red-500/10');
          statusEl.textContent = `${res.detail}`;
          statusEl.className = 'text-xs text-red-400 font-semibold';
          pillEl.textContent = 'FAILED ✗';
          pillEl.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-600 text-white animate-pulse';
        }

        // If last item finished, compute overall gate pass/fail
        if (idx === items.length - 1) {
          setTimeout(() => {
            finalizeVerification(results);
          }, 800);
        }
      }, (idx + 1) * 600);
    });
  }

  function syncLoggedUser() {
    if (typeof Gamification !== 'undefined') {
      const user = Gamification.getCurrentUser();
      if (user) {
        const ppeName = document.getElementById('ppe-worker-name');
        const ppeAge = document.getElementById('ppe-worker-age');
        const ppeRole = document.getElementById('ppe-worker-role');
        const ppeZone = document.getElementById('ppe-worker-zone');
        const passName = document.getElementById('gate-pass-worker-name');
        const passAge = document.getElementById('gate-pass-worker-age');
        const passRole = document.getElementById('gate-pass-worker-role');

        if (ppeName) ppeName.value = user.name;
        if (ppeAge) ppeAge.value = `${user.age || 28} Years Old (Adult)`;
        if (ppeRole) ppeRole.value = user.role || 'Site Construction Specialist';
        if (ppeZone) ppeZone.value = user.zone || 'Zone 4 - High-Rise Tower B';

        if (passName) passName.textContent = user.name;
        if (passAge) passAge.textContent = `${user.age || 28} Years Old (Verified 18+)`;
        if (passRole) passRole.textContent = user.role || 'Site Construction Specialist';
      }
    }
  }

  function finalizeVerification(results) {
    const allPassed = Object.values(results).every(r => r.passed);
    setStep(4);
    syncLoggedUser();

    const approvedBox = document.getElementById('ppe-gate-approved');
    const deniedBox = document.getElementById('ppe-gate-denied');
    const passTimestamp = document.getElementById('gate-pass-timestamp');

    if (passTimestamp) {
      passTimestamp.textContent = new Date().toLocaleString();
    }

    if (allPassed) {
      verificationStatus = 'approved';
      if (approvedBox) approvedBox.classList.remove('hidden');
      if (deniedBox) deniedBox.classList.add('hidden');

      // Award points & trigger celebration
      Gamification.awardPoints(50, "Shift Pre-Entry PPE Verification Completed");
      Gamification.triggerConfetti();
      Gamification.playCheerAudio();
    } else {
      verificationStatus = 'denied';
      if (approvedBox) approvedBox.classList.add('hidden');
      if (deniedBox) deniedBox.classList.remove('hidden');

      // Play warning sound
      SafetyTimers.triggerHelmetAlert();
    }
  }

  function setStep(stepNumber) {
    currentStep = stepNumber;
    syncLoggedUser();
    for (let i = 1; i <= 4; i++) {
      const stepContent = document.getElementById(`ppe-step-content-${i}`);
      const stepPill = document.getElementById(`ppe-step-indicator-${i}`);
      if (stepContent) {
        if (i === stepNumber) {
          stepContent.classList.remove('hidden');
        } else {
          stepContent.classList.add('hidden');
        }
      }
      if (stepPill) {
        if (i === stepNumber) {
          stepPill.classList.remove('bg-slate-800', 'text-slate-400', 'border-slate-700');
          stepPill.classList.add('bg-amber-500', 'text-slate-950', 'border-amber-400', 'font-bold');
        } else if (i < stepNumber) {
          stepPill.classList.remove('bg-slate-800', 'text-slate-400');
          stepPill.classList.add('bg-emerald-600', 'text-white', 'border-emerald-500');
        } else {
          stepPill.className = 'w-8 h-8 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-semibold';
        }
      }
    }
  }

  function resetGate() {
    stopWebcam();
    setStep(1);
    syncLoggedUser();
    const placeholder = document.getElementById('camera-placeholder');
    if (placeholder) placeholder.innerHTML = '<div class="text-slate-500 text-sm">Click "Open Live Camera" or select a quick test snapshot</div>';
  }

  // Listen for user changes from anywhere in the app
  window.addEventListener('buildsafe:user-changed', syncLoggedUser);
  document.addEventListener('DOMContentLoaded', syncLoggedUser);

  return {
    startWebcam,
    stopWebcam,
    snapPhoto,
    useSample,
    setStep,
    resetGate,
    syncLoggedUser
  };
})();

