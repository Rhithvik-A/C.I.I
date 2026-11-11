/**
 * SiteShield - Gamification & Workforce Protection Engine
 * Manages worker safety points, badge distribution, age verification & child labor protection
 */

const Gamification = (() => {
  const STORAGE_KEY = 'siteshield_gamification_v3';
  const CURRENT_USER_KEY = 'siteshield_current_user_v3';
  const AUTH_STATE_KEY = 'siteshield_authenticated_v3';

  const DEFAULT_USERS = [
    {
      id: "WRK-104",
      name: "Priya Sharma",
      age: 29,
      role: "Site Electrical Engineer",
      points: 920,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      badges: ["helmet", "hydration", "sentinel", "eagle"],
      status: "onDuty",
      checksCount: 42,
      hydrationLogged: 28,
      zone: "Zone 2 - Tower Crane & Grid"
    },
    {
      id: "WRK-101",
      name: "Ahmed Al-Mansoor",
      age: 32,
      role: "High-Rise Steel Worker",
      points: 860,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      badges: ["helmet", "hydration", "sentinel"],
      status: "onDuty",
      checksCount: 38,
      hydrationLogged: 24,
      zone: "Zone 4 - High-Rise Tower B"
    },
    {
      id: "WRK-105",
      name: "Fatima Al-Zahra",
      age: 28,
      role: "HSE Compliance Officer",
      points: 810,
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      badges: ["helmet", "eagle", "sentinel"],
      status: "onDuty",
      checksCount: 35,
      hydrationLogged: 22,
      zone: "Zone 1 - Site Perimeter"
    },
    {
      id: "WRK-102",
      name: "Carlos Rodriguez",
      age: 35,
      role: "Scaffolding Specialist",
      points: 740,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      badges: ["helmet", "hydration"],
      status: "breakTime",
      checksCount: 31,
      hydrationLogged: 19,
      zone: "Zone 3 - Scaffolding Assembly"
    },
    {
      id: "WRK-103",
      name: "Liam O'Connor",
      age: 39,
      role: "Heavy Crane Operator",
      points: 680,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      badges: ["helmet"],
      status: "onDuty",
      checksCount: 26,
      hydrationLogged: 15,
      zone: "Zone 2 - Heavy Machinery"
    }
  ];

  const BADGE_DEFINITIONS = {
    gold: {
      id: "gold",
      icon: "🏆",
      keyName: "badgeGoldName",
      keyDesc: "badgeGoldDesc",
      exclusiveTop: true,
      glow: "border-yellow-400 bg-amber-500/10 text-yellow-500"
    },
    helmet: {
      id: "helmet",
      icon: "🪖",
      keyName: "badgeHelmetName",
      keyDesc: "badgeHelmetDesc",
      minChecks: 10,
      glow: "border-emerald-500 bg-emerald-500/10 text-emerald-500"
    },
    hydration: {
      id: "hydration",
      icon: "💧",
      keyName: "badgeHydrationName",
      keyDesc: "badgeHydrationDesc",
      minHydration: 15,
      glow: "border-cyan-500 bg-cyan-500/10 text-cyan-400"
    },
    sentinel: {
      id: "sentinel",
      icon: "🛡️",
      keyName: "badgeSentinelName",
      keyDesc: "badgeSentinelDesc",
      minPoints: 700,
      glow: "border-purple-500 bg-purple-500/10 text-purple-400"
    },
    eagle: {
      id: "eagle",
      icon: "🔍",
      keyName: "badgeEagleName",
      keyDesc: "badgeEagleDesc",
      minPoints: 800,
      glow: "border-amber-500 bg-amber-500/10 text-amber-400"
    }
  };

  function initData() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }

  function isAuthenticated() {
    return localStorage.getItem(AUTH_STATE_KEY) === 'true' && localStorage.getItem(CURRENT_USER_KEY) !== null;
  }

  function getAllUsers() {
    initData();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return data.sort((a, b) => b.points - a.points);
    } catch (e) {
      return DEFAULT_USERS;
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    initData();
    const currentId = localStorage.getItem(CURRENT_USER_KEY);
    const users = getAllUsers();
    return users.find(u => u.id === currentId) || users[0];
  }

  function setCurrentUser(workerId) {
    localStorage.setItem(CURRENT_USER_KEY, workerId);
    localStorage.setItem(AUTH_STATE_KEY, 'true');
    window.dispatchEvent(new CustomEvent('buildsafe:user-changed'));
  }

  function logout() {
    localStorage.removeItem(AUTH_STATE_KEY);
    window.dispatchEvent(new CustomEvent('siteshield:logged-out'));
  }

  /**
   * Child Labor Protection & Age Verification Handler
   * Enforces ILO Convention 138/182 & OSHA Prohibition of minors (< 18)
   */
  function loginWorker({ name, id, age, role, zone }) {
    const numAge = parseInt(age, 10);
    
    // Check Child Labor Law: Under 18 strictly prohibited
    if (isNaN(numAge) || numAge < 18) {
      return {
        success: false,
        reason: "child_labor_prohibited",
        age: numAge || 0,
        message: "Underage individual detected. Child labor in hazardous construction is illegal under OSHA & ILO Convention 138/182."
      };
    }

    const users = getAllUsers();
    const cleanId = id ? id.trim().toUpperCase() : `WRK-${Math.floor(100 + Math.random() * 900)}`;
    const cleanName = name ? name.trim() : `Worker ${cleanId}`;
    
    let existingIndex = users.findIndex(u => u.id === cleanId);
    if (existingIndex !== -1) {
      users[existingIndex].name = cleanName;
      users[existingIndex].age = numAge;
      if (role) users[existingIndex].role = role;
      if (zone) users[existingIndex].zone = zone;
    } else {
      const newUser = {
        id: cleanId,
        name: cleanName,
        age: numAge,
        role: role || "Site Construction Specialist",
        zone: zone || "Zone 1 - Foundation & Excavation",
        points: 500,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        badges: ["helmet"],
        status: "onDuty",
        checksCount: 1,
        hydrationLogged: 1
      };
      users.push(newUser);
    }

    saveUsers(users);
    setCurrentUser(cleanId);
    return {
      success: true,
      user: users.find(u => u.id === cleanId)
    };
  }

  function awardPoints(amount, reason = "Safety Action") {
    const users = getAllUsers();
    const currentId = localStorage.getItem(CURRENT_USER_KEY);
    const userIndex = users.findIndex(u => u.id === currentId);

    if (userIndex === -1) return null;

    const prevPoints = users[userIndex].points;
    const wasTop = users[0].id === currentId;

    users[userIndex].points += amount;
    if (reason.toLowerCase().includes("ppe") || reason.toLowerCase().includes("gear")) {
      users[userIndex].checksCount = (users[userIndex].checksCount || 0) + 1;
    }
    if (reason.toLowerCase().includes("hydration") || reason.toLowerCase().includes("water")) {
      users[userIndex].hydrationLogged = (users[userIndex].hydrationLogged || 0) + 1;
    }

    // Check automatic badge unlocks
    const user = users[userIndex];
    if (user.checksCount >= 10 && !user.badges.includes("helmet")) user.badges.push("helmet");
    if (user.hydrationLogged >= 15 && !user.badges.includes("hydration")) user.badges.push("hydration");
    if (user.points >= 700 && !user.badges.includes("sentinel")) user.badges.push("sentinel");
    if (user.points >= 800 && !user.badges.includes("eagle")) user.badges.push("eagle");

    // Re-sort
    users.sort((a, b) => b.points - a.points);
    saveUsers(users);

    const isNowTop = users[0].id === currentId;
    const overtakenLeader = !wasTop && isNowTop;

    // Trigger visual notification & points popup
    showPointsToast(amount, reason, overtakenLeader);

    if (overtakenLeader) {
      triggerConfetti();
      playCheerAudio();
    }

    window.dispatchEvent(new CustomEvent('buildsafe:points-updated', {
      detail: { user: users.find(u => u.id === currentId), amount, reason, overtakenLeader }
    }));

    return users.find(u => u.id === currentId);
  }

  function showPointsToast(amount, reason, overtakenLeader) {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-6 ${document.dir === 'rtl' ? 'left-6' : 'right-6'} z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 bg-slate-900 border border-amber-500/40 text-white`;
    
    toast.innerHTML = `
      <div class="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-xl text-amber-400 font-bold shrink-0 animate-bounce">
        +${amount}
      </div>
      <div>
        <div class="text-xs uppercase tracking-wider text-amber-400 font-bold">Safety Points Earned!</div>
        <div class="text-sm font-semibold">${reason}</div>
        ${overtakenLeader ? '<div class="text-xs text-yellow-300 font-bold mt-1">👑 NEW #1 SAFETY LEADER! Golden Badge Awarded!</div>' : ''}
      </div>
    `;

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-10', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  function playCheerAudio() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 triumph
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
      });
    } catch(e) {}
  }

  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }

  return {
    initData,
    isAuthenticated,
    getAllUsers,
    getCurrentUser,
    setCurrentUser,
    loginWorker,
    logout,
    awardPoints,
    BADGE_DEFINITIONS,
    triggerConfetti,
    playCheerAudio
  };
})();

