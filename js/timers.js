/**
 * SiteShield - Site Safety Status & Hydration Engine
 * Monitors Real-time Site Safety, triggers Unsafe Alerts, and manages 20-Minute Hydration Break
 */

const SafetyTimers = (() => {
  const HYDRATION_INTERVAL_SEC = 20 * 60; // 20 minutes

  let hydrationSecondsRemaining = HYDRATION_INTERVAL_SEC;
  let timerInterval = null;
  let audioContext = null;
  let isSiteSafe = true;

  function getAudioCtx() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  function playEmergencySirenSound() {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      // Powerful emergency warble siren
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.5);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.75);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch(e) {}
  }

  function playHydrationWaterSound() {
    try {
      const ctx = getAudioCtx();
      const freqs = [587.33, 880, 1174.66]; // D5, A5, D6 melodic water chime
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.5);
      });
    } catch(e) {}
  }

  function start() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      hydrationSecondsRemaining--;

      if (hydrationSecondsRemaining <= 0) {
        triggerHydrationAlert();
        hydrationSecondsRemaining = HYDRATION_INTERVAL_SEC;
      }

      updateDisplay();
    }, 1000);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function updateDisplay() {
    const hydrationEl = document.getElementById('header-hydration-timer');
    const hydrationTabEl = document.getElementById('tab-hydration-timer');
    const hydrationProgress = document.getElementById('hydration-progress-bar');

    const hydrationStr = formatTime(hydrationSecondsRemaining);

    if (hydrationEl) hydrationEl.textContent = hydrationStr;
    if (hydrationTabEl) hydrationTabEl.textContent = hydrationStr;

    if (hydrationProgress) {
      const pct = (hydrationSecondsRemaining / HYDRATION_INTERVAL_SEC) * 100;
      hydrationProgress.style.width = `${pct}%`;
    }
  }

  function updateSiteSafetyStatus(safe, violationsCount = 0) {
    isSiteSafe = safe;
    const pill = document.getElementById('header-site-status-pill');
    const icon = document.getElementById('site-status-icon');
    const text = document.getElementById('site-status-text');

    const condVal = document.getElementById('tab-site-condition-val');
    const condSub = document.getElementById('tab-site-condition-sub');
    const riskPct = document.getElementById('tab-site-risk-pct');
    const riskBar = document.getElementById('tab-site-risk-bar');
    const hazardCard = document.getElementById('timers-site-hazard-card');

    if (!safe) {
      // Unsafe Site Warning Active!
      if (pill) {
        pill.className = 'flex items-center gap-2.5 bg-red-950/80 border-2 border-red-500 px-3 py-1.5 rounded-xl shadow-lg hazard-strobe';
      }
      if (icon) icon.textContent = '🚨';
      if (text) {
        text.className = 'font-mono text-xs font-black text-red-400 animate-pulse';
        text.textContent = `UNSAFE (${violationsCount} Hazards)`;
      }

      if (condVal) {
        condVal.textContent = 'UNSAFE CONDITIONS';
        condVal.className = 'font-black text-3xl text-red-500 tracking-wide';
      }
      if (condSub) {
        condSub.textContent = `${violationsCount} active OSHA violations identified on site. Stop work order advisory.`;
      }
      if (riskPct) {
        riskPct.textContent = 'CRITICAL RISK';
        riskPct.className = 'text-red-400 font-bold';
      }
      if (riskBar) {
        riskBar.style.width = '85%';
        riskBar.className = 'bg-red-500 h-2 rounded-full transition-all duration-1000';
      }
      if (hazardCard) {
        hazardCard.classList.add('border-red-500', 'hazard-strobe');
      }
    } else {
      // Safe Site
      if (pill) {
        pill.className = 'flex items-center gap-2.5 bg-slate-800/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl shadow-sm';
      }
      if (icon) icon.textContent = '🛡️';
      if (text) {
        text.className = 'font-mono text-xs font-bold text-emerald-400';
        text.textContent = 'SAFE (Compliant)';
      }

      if (condVal) {
        condVal.textContent = 'SITE COMPLIANT';
        condVal.className = 'font-black text-3xl text-emerald-400 tracking-wide';
      }
      if (condSub) {
        condSub.textContent = 'Zero critical violations detected. All personnel certified and wearing PPE.';
      }
      if (riskPct) {
        riskPct.textContent = 'LOW RISK (SAFE)';
        riskPct.className = 'text-emerald-400 font-bold';
      }
      if (riskBar) {
        riskBar.style.width = '10%';
        riskBar.className = 'bg-emerald-500 h-2 rounded-full transition-all duration-1000';
      }
      if (hazardCard) {
        hazardCard.classList.remove('hazard-strobe');
        hazardCard.classList.add('border-slate-800');
      }
    }
  }

  function triggerSiteSafetyWarning() {
    playEmergencySirenSound();
    const modal = document.getElementById('site-safety-alert-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  function acknowledgeSiteWarning() {
    const modal = document.getElementById('site-safety-alert-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (typeof App !== 'undefined') {
      App.switchTab('inspector');
    }
  }

  function triggerHydrationAlert() {
    playHydrationWaterSound();
    const modal = document.getElementById('hydration-alert-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  function acknowledgeHydration() {
    const modal = document.getElementById('hydration-alert-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    Gamification.awardPoints(20, "20-Min Hydration Break Completed");
    hydrationSecondsRemaining = HYDRATION_INTERVAL_SEC;
    updateDisplay();
  }

  function snoozeHydration(mins = 5) {
    const modal = document.getElementById('hydration-alert-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    hydrationSecondsRemaining = mins * 60;
    updateDisplay();
  }

  // Alias for backward compatibility if called
  const triggerHelmetAlert = triggerSiteSafetyWarning;

  return {
    start,
    updateSiteSafetyStatus,
    triggerSiteSafetyWarning,
    acknowledgeSiteWarning,
    triggerHelmetAlert,
    triggerHydrationAlert,
    acknowledgeHydration,
    snoozeHydration,
    formatTime,
    getTimers: () => ({
      hydration: hydrationSecondsRemaining
    })
  };
})();
})();

