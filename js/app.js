/**
 * SiteShield - Core Application Controller
 * Handles Initial Login Gate, Age & Child Labor Verification, Navigation,
 * i18n, Dynamic Theme Switching, Leaderboard & Name Propagation
 */

const App = (() => {
  let currentLang = localStorage.getItem('siteshield_lang') || 'en';
  let currentTheme = localStorage.getItem('siteshield_theme') || 'dark';
  let activeTab = 'inspector';

  function init() {
    applyTheme(currentTheme);
    applyLanguage(currentLang);
    setupNavigation();
    setupEventListeners();
    setupInitialLoginGate();
    SafetyTimers.start();
    SafetyAI.renderAnalysis();
    renderLeaderboard();
    updateUserProfileDisplay();

    // Check if user is already authenticated
    if (!Gamification.isAuthenticated()) {
      showInitialLoginGate();
    } else {
      hideInitialLoginGate();
    }

    // Listen to gamification updates
    window.addEventListener('buildsafe:points-updated', () => {
      updateUserProfileDisplay();
      renderLeaderboard();
    });

    window.addEventListener('buildsafe:user-changed', () => {
      updateUserProfileDisplay();
      renderLeaderboard();
    });

    window.addEventListener('siteshield:logged-out', () => {
      showInitialLoginGate();
    });
  }

  function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('siteshield_theme', theme);
    const htmlEl = document.documentElement;
    const themeIcon = document.getElementById('theme-toggle-icon');
    const initThemeIcon = document.querySelector('#init-theme-toggle-btn span');

    if (theme === 'dark') {
      htmlEl.classList.add('dark');
      if (themeIcon) themeIcon.textContent = '☀️';
      if (initThemeIcon) initThemeIcon.textContent = '☀️';
    } else {
      htmlEl.classList.remove('dark');
      if (themeIcon) themeIcon.textContent = '🌙';
      if (initThemeIcon) initThemeIcon.textContent = '🌙';
    }
  }

  function toggleTheme() {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  function applyLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('siteshield_lang', lang);

    const isRtl = lang === 'ar' || lang === 'ur';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang][key]) {
        el.placeholder = translations[lang][key];
      }
    });

    // Update lang select UI elements
    const langSelect = document.getElementById('language-selector');
    const initLangSelect = document.getElementById('init-login-lang');
    if (langSelect) langSelect.value = lang;
    if (initLangSelect) initLangSelect.value = lang;

    // Refresh components
    renderLeaderboard();
  }

  function showInitialLoginGate() {
    const gate = document.getElementById('initial-login-gate');
    if (gate) {
      gate.classList.remove('hidden');
    }
  }

  function hideInitialLoginGate() {
    const gate = document.getElementById('initial-login-gate');
    if (gate) {
      gate.classList.add('hidden');
    }
  }

  function setupInitialLoginGate() {
    const form = document.getElementById('initial-login-form');
    const ageInput = document.getElementById('init-login-age');
    const ageFeedback = document.getElementById('init-age-feedback');
    const closeChildLaborBtn = document.getElementById('close-child-labor-modal-btn');
    const testMinorBtn = document.getElementById('init-test-minor-btn');
    const initThemeBtn = document.getElementById('init-theme-toggle-btn');
    const initLangSelect = document.getElementById('init-login-lang');
    const switchWorkerBtn = document.getElementById('header-switch-worker-btn');

    if (switchWorkerBtn) {
      switchWorkerBtn.addEventListener('click', () => {
        showInitialLoginGate();
      });
    }

    if (initThemeBtn) {
      initThemeBtn.addEventListener('click', toggleTheme);
    }

    if (initLangSelect) {
      initLangSelect.addEventListener('change', (e) => applyLanguage(e.target.value));
    }

    // Dynamic Live Age Validation Feedback
    if (ageInput && ageFeedback) {
      const updateAgeStatus = () => {
        const val = parseInt(ageInput.value, 10);
        if (isNaN(val) || val < 18) {
          ageFeedback.className = 'text-[11px] text-red-400 font-bold flex items-center gap-1.5 animate-pulse';
          ageFeedback.innerHTML = `<span>🚨 STOP: Age ${isNaN(val) ? '' : val} is UNDER 18! Child labor is illegal in construction.</span>`;
        } else {
          ageFeedback.className = 'text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5';
          ageFeedback.innerHTML = `<span>✓ Verified Adult Worker (${val}+): Legally eligible for construction duty.</span>`;
        }
      };

      ageInput.addEventListener('input', updateAgeStatus);
      updateAgeStatus();
    }

    // Form Submit with Child Labor Barrier
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('init-login-name').value;
        const id = document.getElementById('init-login-id').value;
        const age = document.getElementById('init-login-age').value;
        const role = document.getElementById('init-login-role').value;
        const zone = document.getElementById('init-login-zone').value;

        handleLoginAttempt({ name, id, age, role, zone });
      });
    }

    // Quick Select Demo Profiles
    document.querySelectorAll('.init-quick-profile').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        const id = btn.getAttribute('data-id');
        const age = btn.getAttribute('data-age');
        const role = btn.getAttribute('data-role');
        const zone = btn.getAttribute('data-zone');

        handleLoginAttempt({ name, id, age, role, zone });
      });
    });

    // Test Minor Button (Age 15)
    if (testMinorBtn) {
      testMinorBtn.addEventListener('click', () => {
        handleLoginAttempt({
          name: "Leo Miller (Minor Student)",
          id: "WRK-MINOR",
          age: 15,
          role: "Apprentice / Minor",
          zone: "Zone 1 - Foundation"
        });
      });
    }

    if (closeChildLaborBtn) {
      closeChildLaborBtn.addEventListener('click', () => {
        const modal = document.getElementById('child-labor-alert-modal');
        if (modal) modal.classList.add('hidden');
      });
    }
  }

  function handleLoginAttempt({ name, id, age, role, zone }) {
    const result = Gamification.loginWorker({ name, id, age, role, zone });

    if (!result.success && result.reason === "child_labor_prohibited") {
      // Sound alarm
      SafetyTimers.triggerHelmetAlert();

      // Show Child Labor Alert Modal
      const modal = document.getElementById('child-labor-alert-modal');
      const attemptedAgeEl = document.getElementById('child-labor-attempted-age');
      if (attemptedAgeEl) {
        attemptedAgeEl.textContent = `${result.age || age} Years Old`;
      }
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      return;
    }

    // Login Successful!
    hideInitialLoginGate();
    updateUserProfileDisplay();
    renderLeaderboard();
    Gamification.triggerConfetti();
    Gamification.playCheerAudio();
  }

  function updateUserProfileDisplay() {
    const user = Gamification.getCurrentUser();
    const users = Gamification.getAllUsers();
    const rank = users.findIndex(u => u.id === user.id) + 1;
    const isTopLeader = rank === 1;

    // Header Elements
    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    const pointsEl = document.getElementById('header-user-points');
    const rankEl = document.getElementById('header-user-rank');
    const avatarEl = document.getElementById('header-user-avatar');
    const crownBadge = document.getElementById('header-leader-crown');

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = `${user.role || 'Specialist'} • Age: ${user.age || 28}y`;
    if (pointsEl) pointsEl.textContent = `${user.points} pts`;
    if (rankEl) rankEl.textContent = `#${rank}`;
    if (avatarEl && user.avatar) avatarEl.src = user.avatar;

    if (crownBadge) {
      if (isTopLeader) {
        crownBadge.classList.remove('hidden');
      } else {
        crownBadge.classList.add('hidden');
      }
    }

    // Propagate Name & Age to Step 1 PPE Verification Gate
    const ppeName = document.getElementById('ppe-worker-name');
    const ppeAge = document.getElementById('ppe-worker-age');
    const ppeRole = document.getElementById('ppe-worker-role');
    const ppeZone = document.getElementById('ppe-worker-zone');

    if (ppeName) ppeName.value = user.name;
    if (ppeAge) ppeAge.value = `${user.age || 28} Years Old (Adult)`;
    if (ppeRole) ppeRole.value = user.role || 'Site Specialist';
    if (ppeZone) ppeZone.value = user.zone || 'Zone 4 - High-Rise Tower B';

    // Propagate Name & Age to Step 4 Digital Gate Pass
    const passName = document.getElementById('gate-pass-worker-name');
    const passAge = document.getElementById('gate-pass-worker-age');
    const passRole = document.getElementById('gate-pass-worker-role');

    if (passName) passName.textContent = user.name;
    if (passAge) passAge.textContent = `${user.age || 28} Years Old (Verified 18+)`;
    if (passRole) passRole.textContent = user.role || 'Site Specialist';
  }

  function switchTab(tabId) {
    activeTab = tabId;
    const tabs = ['inspector', 'ppe-gate', 'leaderboard', 'guide', 'timers'];

    tabs.forEach(t => {
      const contentEl = document.getElementById(`tab-content-${t}`);
      const btnEl = document.getElementById(`nav-btn-${t}`);
      if (contentEl) {
        if (t === tabId) {
          contentEl.classList.remove('hidden');
        } else {
          contentEl.classList.add('hidden');
        }
      }
      if (btnEl) {
        if (t === tabId) {
          btnEl.classList.add('bg-amber-500', 'text-slate-950', 'font-bold', 'shadow-md');
          btnEl.classList.remove('text-slate-400', 'hover:text-slate-200');
        } else {
          btnEl.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold', 'shadow-md');
          btnEl.classList.add('text-slate-400', 'hover:text-slate-200');
        }
      }
    });

    // If switching to PPE gate, synchronize the logged-in user name and age
    if (tabId === 'ppe-gate') {
      if (typeof PpeChecker !== 'undefined' && PpeChecker.syncLoggedUser) {
        PpeChecker.syncLoggedUser();
      }
    } else {
      PpeChecker.stopWebcam();
    }
  }

  function setupNavigation() {
    const tabs = ['inspector', 'ppe-gate', 'leaderboard', 'guide', 'timers'];
    tabs.forEach(t => {
      const btn = document.getElementById(`nav-btn-${t}`);
      if (btn) {
        btn.addEventListener('click', () => switchTab(t));
      }
    });
  }

  function updateUserProfileDisplay() {
    const user = Gamification.getCurrentUser();
    const users = Gamification.getAllUsers();
    const rank = users.findIndex(u => u.id === user.id) + 1;
    const isTopLeader = rank === 1;

    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    const pointsEl = document.getElementById('header-user-points');
    const rankEl = document.getElementById('header-user-rank');
    const avatarEl = document.getElementById('header-user-avatar');
    const crownBadge = document.getElementById('header-leader-crown');

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = `${user.role || 'Specialist'} • Age: ${user.age || 28}y`;
    if (pointsEl) pointsEl.textContent = `${user.points} pts`;
    if (rankEl) rankEl.textContent = `#${rank}`;
    if (avatarEl && user.avatar) avatarEl.src = user.avatar;

    if (crownBadge) {
      if (isTopLeader) {
        crownBadge.classList.remove('hidden');
      } else {
        crownBadge.classList.add('hidden');
      }
    }

    // Immediately propagate logged-in name, age, and role into PPE Gate Step 1 & Digital Pass
    if (typeof PpeChecker !== 'undefined' && PpeChecker.syncLoggedUser) {
      PpeChecker.syncLoggedUser();
    }
  }

  function renderLeaderboard() {
    const users = Gamification.getAllUsers();
    const currentUser = Gamification.getCurrentUser();
    const topPerformer = users[0]; // #1 by score

    // Top Performer Hero Card
    const topName = document.getElementById('top-leader-name');
    const topRole = document.getElementById('top-leader-role');
    const topPoints = document.getElementById('top-leader-points');
    const topAvatar = document.getElementById('top-leader-avatar');

    if (topName) topName.textContent = topPerformer.name;
    if (topRole) topRole.textContent = topPerformer.role;
    if (topPoints) topPoints.textContent = `${topPerformer.points} Points`;
    if (topAvatar) topAvatar.src = topPerformer.avatar;

    // Render Table Rows
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    users.forEach((u, idx) => {
      const isTop = idx === 0;
      const isCurrent = u.id === currentUser.id;
      const tr = document.createElement('tr');
      tr.className = `border-b border-slate-700/50 transition-colors ${
        isCurrent ? 'bg-amber-500/10 font-medium' : 'hover:bg-slate-800/40'
      }`;

      // Build badges icons
      let badgeIcons = '';
      if (isTop) {
        badgeIcons += `<span title="${translations[currentLang].badgeGoldName}" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-yellow-400 border border-amber-400/50 mr-1 animate-pulse">🏆 GOLD #1</span>`;
      }
      u.badges.forEach(bId => {
        const def = Gamification.BADGE_DEFINITIONS[bId];
        if (def && !def.exclusiveTop) {
          badgeIcons += `<span title="${translations[currentLang][def.keyName]}" class="text-lg mr-1 inline-block cursor-default">${def.icon}</span>`;
        }
      });

      tr.innerHTML = `
        <td class="py-4 px-4">
          <div class="flex items-center gap-2">
            ${isTop ? '<span class="text-xl">🥇</span>' : idx === 1 ? '<span class="text-xl">🥈</span>' : idx === 2 ? '<span class="text-xl">🥉</span>' : `<span class="font-mono text-slate-400">#${idx + 1}</span>`}
          </div>
        </td>
        <td class="py-4 px-4">
          <div class="flex items-center gap-3">
            <img src="${u.avatar}" class="w-10 h-10 rounded-full object-cover border-2 ${isTop ? 'border-yellow-400' : 'border-slate-700'}" alt="${u.name}" />
            <div>
              <div class="font-bold text-sm ${isCurrent ? 'text-amber-400' : 'text-slate-100'} flex items-center gap-2">
                ${u.name}
                ${isCurrent ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold uppercase">You</span>' : ''}
              </div>
              <div class="text-xs text-slate-400">${u.role}</div>
            </div>
          </div>
        </td>
        <td class="py-4 px-4">
          <span class="font-extrabold text-base ${isTop ? 'text-yellow-400' : 'text-slate-200'}">${u.points}</span>
          <span class="text-xs text-slate-400 ml-1">pts</span>
        </td>
        <td class="py-4 px-4">
          <div class="flex items-center flex-wrap gap-1">
            ${badgeIcons}
          </div>
        </td>
        <td class="py-4 px-4">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            u.status === 'onDuty' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
          }">
            <span class="w-1.5 h-1.5 rounded-full ${u.status === 'onDuty' ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}"></span>
            ${translations[currentLang][u.status] || u.status}
          </span>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  function setupEventListeners() {
    // Language dropdown
    const langSelect = document.getElementById('language-selector');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => applyLanguage(e.target.value));
    }

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    // Site Inspector Scenarios
    document.querySelectorAll('.preset-scenario-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const scenarioKey = btn.getAttribute('data-scenario');
        SafetyAI.loadScenario(scenarioKey);
      });
    });

    // File Upload Drag & Drop / File Input
    const dropZone = document.getElementById('inspector-drop-zone');
    const fileInput = document.getElementById('site-file-input');
    const browseBtn = document.getElementById('browse-files-btn');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          SafetyAI.handleCustomUpload(e.target.files[0]);
        }
      });
    }

    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-amber-500', 'bg-amber-500/5');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-amber-500', 'bg-amber-500/5');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-amber-500', 'bg-amber-500/5');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          SafetyAI.handleCustomUpload(e.dataTransfer.files[0]);
        }
      });
    }

    // Export PDF
    const exportBtn = document.getElementById('export-report-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', SafetyAI.exportReportPdf);
    }

    // Award Inspection Points
    const awardInspectBtn = document.getElementById('award-inspection-btn');
    if (awardInspectBtn) {
      awardInspectBtn.addEventListener('click', () => {
        SafetyAI.awardInspectionPoints();
      });
    }

    // PPE Verification Buttons
    const startCamBtn = document.getElementById('ppe-start-cam-btn');
    if (startCamBtn) {
      startCamBtn.addEventListener('click', PpeChecker.startWebcam);
    }

    const snapPhotoBtn = document.getElementById('ppe-snap-btn');
    if (snapPhotoBtn) {
      snapPhotoBtn.addEventListener('click', PpeChecker.snapPhoto);
    }

    const testGoodBtn = document.getElementById('ppe-test-good-btn');
    if (testGoodBtn) {
      testGoodBtn.addEventListener('click', () => PpeChecker.useSample('compliant'));
    }

    const testBadBtn = document.getElementById('ppe-test-bad-btn');
    if (testBadBtn) {
      testBadBtn.addEventListener('click', () => PpeChecker.useSample('nonCompliant'));
    }

    const resetPpeBtn = document.getElementById('ppe-reset-btn');
    if (resetPpeBtn) {
      resetPpeBtn.addEventListener('click', PpeChecker.resetGate);
    }

    // Timers & Alerts
    const ackHelmetBtn = document.getElementById('ack-helmet-btn');
    if (ackHelmetBtn) {
      ackHelmetBtn.addEventListener('click', SafetyTimers.acknowledgeHelmet);
    }

    const snoozeHelmetBtn = document.getElementById('snooze-helmet-btn');
    if (snoozeHelmetBtn) {
      snoozeHelmetBtn.addEventListener('click', () => SafetyTimers.snoozeHelmet(5));
    }

    const ackHydrationBtn = document.getElementById('ack-hydration-btn');
    if (ackHydrationBtn) {
      ackHydrationBtn.addEventListener('click', SafetyTimers.acknowledgeHydration);
    }

    const snoozeHydrationBtn = document.getElementById('snooze-hydration-btn');
    if (snoozeHydrationBtn) {
      snoozeHydrationBtn.addEventListener('click', () => SafetyTimers.snoozeHydration(5));
    }

    const tabLogHydrationBtn = document.getElementById('tab-log-hydration-btn');
    if (tabLogHydrationBtn) {
      tabLogHydrationBtn.addEventListener('click', () => {
        SafetyTimers.acknowledgeHydration();
      });
    }

    const tabConfirmHelmetBtn = document.getElementById('tab-confirm-helmet-btn');
    if (tabConfirmHelmetBtn) {
      tabConfirmHelmetBtn.addEventListener('click', () => {
        SafetyTimers.acknowledgeHelmet();
      });
    }

    // Test simulation buttons for quick demonstration of 10m / 20m alarms
    const testHelmetAlarmBtn = document.getElementById('test-helmet-alarm-btn');
    if (testHelmetAlarmBtn) {
      testHelmetAlarmBtn.addEventListener('click', () => {
        SafetyTimers.triggerHelmetAlert();
      });
    }

    const testHydrationAlarmBtn = document.getElementById('test-hydration-alarm-btn');
    if (testHydrationAlarmBtn) {
      testHydrationAlarmBtn.addEventListener('click', () => {
        SafetyTimers.triggerHydrationAlert();
      });
    }

    // AI Safety Guide Chat
    const chatInput = document.getElementById('ai-chat-input');
    const chatSendBtn = document.getElementById('ai-chat-send-btn');
    if (chatSendBtn && chatInput) {
      const sendMsg = () => {
        const val = chatInput.value.trim();
        if (val) {
          GuideBot.handleUserMessage(val, currentLang);
          chatInput.value = '';
        }
      };
      chatSendBtn.addEventListener('click', sendMsg);
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMsg();
      });
    }

    // Quick Question chips
    document.querySelectorAll('.quick-question-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.textContent.trim();
        GuideBot.handleUserMessage(query, currentLang);
      });
    });

    // Login Modal
    const openLoginBtn = document.getElementById('open-login-btn');
    const closeLoginBtn = document.getElementById('close-login-btn');
    const loginModal = document.getElementById('login-modal');
    if (openLoginBtn && loginModal) {
      openLoginBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
        loginModal.classList.add('flex');
      });
    }
    if (closeLoginBtn && loginModal) {
      closeLoginBtn.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        loginModal.classList.remove('flex');
      });
    }

    // Quick Login User Cards
    document.querySelectorAll('.demo-login-card').forEach(card => {
      card.addEventListener('click', () => {
        const userId = card.getAttribute('data-user-id');
        Gamification.setCurrentUser(userId);
        if (loginModal) {
          loginModal.classList.add('hidden');
          loginModal.classList.remove('flex');
        }
      });
    });

    // Form login submission
    const loginForm = document.getElementById('custom-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputId = document.getElementById('login-worker-id').value.trim();
        const inputName = document.getElementById('login-worker-name').value.trim();
        const role = document.getElementById('login-worker-role').value;

        if (inputId) {
          const users = Gamification.getAllUsers();
          let user = users.find(u => u.id.toLowerCase() === inputId.toLowerCase());
          if (!user) {
            user = {
              id: inputId,
              name: inputName || `Worker ${inputId}`,
              role: role,
              points: 500,
              avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${inputId}`,
              badges: ["helmet"],
              status: "onDuty",
              checksCount: 5,
              hydrationLogged: 3
            };
            users.push(user);
            localStorage.setItem('buildsafe_gamification_v2', JSON.stringify(users));
          }
          Gamification.setCurrentUser(user.id);
          if (loginModal) {
            loginModal.classList.add('hidden');
            loginModal.classList.remove('flex');
          }
        }
      });
    }
  }

  return {
    init,
    applyLanguage,
    toggleTheme,
    switchTab
  };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

