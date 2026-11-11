/**
 * BuildSafe AI - Construction Safety AI Assistant (SafeyBot)
 * Multilingual knowledge engine for OSHA 1926, ISO 45001, Heat Stress & Construction Safety
 */

const GuideBot = (() => {
  // Knowledge Base indexed by multilingual keywords
  const KNOWLEDGE_BASE = [
    {
      keywords: ["scaffold", "guardrail", "toeboard", "مقال", "سقالة", "سقالات", "مچان", "मचान", "andamio", "barandilla"],
      en: "<strong>OSHA 1926.451 Scaffolding Standard:</strong><br/>• Scaffolds must support their own weight plus at least 4 times the maximum intended load.<br/>• Fall protection (guardrails: top-rail 38-45 inches, mid-rail halfway, and toeboards 3.5 inches high) is mandatory on all open sides for platforms 10 feet or higher.<br/>• Supported scaffolds with height-to-base ratio > 4:1 must be tied off or guyed.<br/>• Daily inspection by a Competent Person is required prior to every shift.",
      ar: "<strong>معيار السقالات حسب OSHA 1926.451 وكود البناء الموحد:</strong><br/>• يجب أن تتحمل السقالة وزنها الذاتي إضافة إلى 4 أضعاف الحمولة القصوى المخططة.<br/>• حواجز الحماية (الحاجز العلوي بارتفاع 38-45 بوصة، والحاجز الأوسط، وحواجز القدمين بارتفاع 3.5 بوصة) إلزامية على جميع الجهات المفتوحة للارتفاعات من 3 أمتار (10 أقدام) فأكثر.<br/>• يجب ربط وتثبيت السقالات ذات نسبة الارتفاع للقاعدة 4:1 بالهيكل الإنشائي.<br/>• يجب فحص السقالة يومياً قبل كل وردية من قبل المشرف المعتمد ووضع البطاقة الخضراء.",
      hi: "<strong>मचान (Scaffolding) सुरक्षा नियम (OSHA 1926.451):</strong><br/>• मचान को अपने वजन के अलावा कम से कम 4 गुना भार सहने में सक्षम होना चाहिए।<br/>• 10 फीट या उससे अधिक ऊंचाई वाले प्लेटफॉर्म पर गार्डरेल (ऊपरी रेल, मध्य रेल और टो-बोर्ड) अनिवार्य हैं।<br/>• प्रत्येक शिफ्ट से पहले सक्षम व्यक्ति (Competent Person) द्वारा निरीक्षण अनिवार्य है।",
      es: "<strong>Normativa OSHA 1926.451 para Andamios:</strong><br/>• Todo andamio debe soportar su peso más al menos 4 veces la carga máxima prevista.<br/>• Es obligatorio instalar barandillas completas (superior, intermedia y rodapiés) en plataformas a partir de 3 metros (10 pies) de altura.<br/>• Se requiere inspección diaria por personal competente antes de cada turno."
    },
    {
      keywords: ["helmet", "hard hat", "head", "خوذة", "راس", "رأس", "خوذات", "हेलमेट", "सिर", "casco", "cabeza"],
      en: "<strong>OSHA 1926.100 Head Protection (Hard Hats):</strong><br/>• Mandatory for anyone working in areas with danger of head injury from impact, falling/flying objects, or electrical shock.<br/>• Must comply with ANSI Z89.1 (Type 1 for top impact, Type 2 for lateral & top impact; Class E for electrical insulation up to 20,000V).<br/>• Chin straps must be firmly fastened during high winds or elevated work.<br/>• Hard hats must be replaced immediately after sustaining an impact, or every 3-5 years per manufacturer guidance.",
      ar: "<strong>حماية الرأس وخوذات السلامة (OSHA 1926.100 و ANSI Z89.1):</strong><br/>• ارتداء الخوذة إلزامي لجميع المتواجدين في الموقع لحمايتهم من تساقط الأجسام والصدمات والصعق الكهربائي.<br/>• يجب أن تكون الخوذة مطابقة لمواصفة ANSI Z89.1 من النوع Type 1 أو Type 2 ومن فئة Class E العازلة للكهرباء حتى 20,000 فولت.<br/>• يجب ربط حزام الذقن بإحكام خصوصاً عند العمل على المرتفعات أو في وجود رياح شديدة.<br/>• يتم استبدال الخوذة فوراً في حال تعرضت لأي صدمة، أو كل 3 إلى 5 سنوات.",
      hi: "<strong>हेलमेट और सिर सुरक्षा नियम (OSHA 1926.100):</strong><br/>• निर्माण क्षेत्र में काम करते समय ANSI Z89.1 प्रमाणित हार्ड हैट पहनना अनिवार्य है।<br/>• तेज हवा और ऊंचाई पर काम करते समय चिन स्ट्रैप को कसकर लॉक रखना चाहिए।<br/>• किसी भी भारी वस्तु के गिरने के प्रभाव के बाद हेलमेट को तुरंत बदला जाना चाहिए।",
      es: "<strong>Protección de Cabeza y Cascos (OSHA 1926.100):</strong><br/>• Uso obligatorio de casco certificado ANSI Z89.1 en toda la obra contra caídas de objetos y golpes.<br/>• El barbiquejo debe estar abrochado en trabajos de altura o con viento fuerte.<br/>• Reemplazar el casco de inmediato si sufre un impacto o tras 3-5 años de vida útil."
    },
    {
      keywords: ["heat", "hydration", "water", "stroke", "حرارة", "ماء", "شرب", "شمس", "ترطيب", "गर्मी", "पानी", "लू", "calor", "agua", "hidratacion"],
      en: "<strong>Heat Stress & 20-Minute Hydration Protocol:</strong><br/>• During hot weather (>30°C / 86°F), workers should drink 250ml (8 oz) of cold water every 20 minutes, even if not thirsty.<br/>• Provide shaded rest stations with active ventilation or cooling fans.<br/>• Recognize Heat Stroke warning signs: confusion, slurred speech, rapid pulse, loss of consciousness. (Immediate medical emergency - cool worker rapidly with ice/water and call emergency services).<br/>• In Gulf/UAE regions, the mandatory Midday Work Ban (12:30 PM - 3:00 PM) must be strictly enforced during peak summer.",
      ar: "<strong>بروتوكول مكافحة الإجهاد الحراري والترطيب كل 20 دقيقة:</strong><br/>• عند تجاوز الحرارة 30 درجة مئوية، يجب على العامل شرب كوب ماء بارد (250 مل) كل 20 دقيقة حتى لو لم يشعر بالعطش.<br/>• توفير استراحات مظللة مزودة بمراوح رذاذ ووسائل تبريد.<br/>• علامات ضربة الشمس الخطيرة: الارتباك، التعثر في الكلام، تسارع النبض، فقدان الوعي (حالة طوارئ فورية - تبريد العامل بالماء والاتصال بالإسعاف فوراً).<br/>• الالتزام الصارم بقرار حظر العمل وقت الظهيرة (12:30 ظهراً إلى 3:00 عصراً) خلال أشهر الصيف في دول الخليج.",
      hi: "<strong>हीट स्ट्रेस और 20-मिनट हाइड्रेशन प्रोटोकॉल:</strong><br/>• तेज गर्मी में प्रत्येक 20 मिनट में कम से कम 250 मिली ठंडा पानी पिएं।<br/>• छायादार विश्राम स्थल और पर्याप्त वेंटिलेशन होना आवश्यक है।<br/>• अत्यधिक गर्मी और लू लगने पर तुरंत काम रोकें, ठंडे पानी से शरीर को ठंडा करें और प्राथमिक उपचार दें।",
      es: "<strong>Estrés Térmico y Pausas de Hidratación (Cada 20 min):</strong><br/>• Con calor superior a 30°C, beber 250 ml de agua cada 20 minutos, incluso sin sentir sed.<br/>• Habilitar zonas de sombra con ventilación para los descansos.<br/>• Ante síntomas de golpe de calor (mareos, confusión, piel caliente), actuar de inmediato refrescando al trabajador y llamar a emergencias."
    },
    {
      keywords: ["fall", "height", "harness", "سقوط", "ارتفاع", "حزام", "ارتفاعات", "गिरने", "ऊंचाई", "हार्नेस", "caida", "altura", "arnes"],
      en: "<strong>Fall Protection (OSHA 1926.501 - The 6-Foot Rule):</strong><br/>• Fall protection (guardrails, safety nets, or Personal Fall Arrest Systems - PFAS) is mandatory at heights of 6 feet (1.8 meters) or greater.<br/>• PFAS harness anchor points must support at least 5,000 lbs (22.2 kN) per employee attached.<br/>• Lanyards must include shock absorbers to limit arresting forces to under 1,800 lbs.<br/>• Inspect all webbing, D-rings, and snap hooks for fraying or deformation before every single shift.",
      ar: "<strong>الحماية من السقوط (معيار OSHA 1926.501 - قاعدة الـ 1.8 متر):</strong><br/>• الحماية من السقوط (حواجز أو شبكات أمان أو أحزمة أمان مانعة للسقوط PFAS) إلزامية على ارتفاع 1.8 متر (6 أقدام) أو أكثر.<br/>• يجب أن تتحمل نقاط التثبيت (Anchor Points) لحزام الأمان ما لا يقل عن 5,000 رطل (22.2 كيلو نيوتن) لكل عامل.<br/>• يجب أن يتضمن الحزام ممتص صدمات (Shock Absorber) لتقليل قوة السقوط المفاجئ.<br/>• فحص أحزمة الأمان والمشابك المعدنية قبل كل استخدام للتأكد من عدم وجود أي تمزق.",
      hi: "<strong>फॉल प्रोटेक्शन और 6-फीट नियम (OSHA 1926.501):</strong><br/>• 6 फीट (1.8 मीटर) या उससे अधिक ऊंचाई पर काम करते समय फॉल अरेस्ट हार्नेस (PFAS) अनिवार्य है।<br/>• हार्नेस के एंकर पॉइंट को कम से कम 5,000 पाउंड वजन सहने योग्य होना चाहिए।",
      es: "<strong>Protección contra Caídas (Regla de 1.8m - OSHA 1926.501):</strong><br/>• Obligatorio sistema de retención o arnés con línea de vida a partir de 1.8 metros (6 pies) de altura.<br/>• Los puntos de anclaje deben resistir un mínimo de 5,000 libras por trabajador conectado.<br/>• Inspeccionar costuras y mosquetones antes de cada uso."
    },
    {
      keywords: ["trench", "excavation", "cave", "حفر", "خندق", "ردم", "انهيار", "खाई", "खुदाई", "zanja", "excavacion"],
      en: "<strong>Excavation & Trenching (OSHA 1926.652):</strong><br/>• Trenches 5 feet (1.5 meters) or deeper require a protective system (sloping, benching, shoring, or trench shield/box).<br/>• Trenches 20 feet or deeper require custom engineering design.<br/>• Spoil piles and heavy equipment must be placed at least 2 feet (0.6 meters) back from the edge of the trench.<br/>• Ladders or safe exit ramps must be located within 25 feet of travel for workers.",
      ar: "<strong>سلامة الحفريات والخنادق الإنشائية (OSHA 1926.652):</strong><br/>• الحفريات بعمق 1.5 متر (5 أقدام) فأكثر تتطلب نظام حماية من الانهيار (تدعيم الجوانب، الميول المدرجة، أو صناديق حماية الحفر).<br/>• يجب إبعاد نواتج الحفر والمعدات الثقيلة مسافة لا تقل عن 60 سم (قدمين) عن حافة الحفرة.<br/>• يجب توفير سلالم خروج آمنة بحيث لا تبعد أكثر من 7.5 متر (25 قدماً) عن أي عامل داخل الحفرة.",
      hi: "<strong>खाई और खुदाई सुरक्षा (OSHA 1926.652):</strong><br/>• 5 फीट या उससे अधिक गहरी खाई में किनारों को धंसने से बचाने के लिए शोरिंग या ट्रेंच बॉक्स आवश्यक है।<br/>• निकाली गई मिट्टी को खाई के किनारे से कम से कम 2 फीट दूर रखना अनिवार्य है।",
      es: "<strong>Excavaciones y Zanjas (OSHA 1926.652):</strong><br/>• Zanjas de más de 1.5 metros (5 pies) exigen entibación o caja protectora contra derrumbes.<br/>• El material excavado debe ubicarse a mínimo 60 cm (2 pies) del borde.<br/>• Escaleras de salida obligatorias a menos de 7.5 metros de cualquier trabajador."
    }
  ];

  function getAnswer(userQuery, lang = 'en') {
    const qLower = userQuery.toLowerCase();
    
    // Search knowledge base
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some(kw => qLower.includes(kw.toLowerCase()))) {
        return item[lang] || item.en;
      }
    }

    // Default intelligent fallbacks
    const defaults = {
      en: "<strong>OSHA Construction Safety Recommendation:</strong> Always consult the Site Safety Officer and review the Job Hazard Analysis (JHA) before proceeding. Ensure Type 1 Class E Hard Hat, High-Vis Vest, Steel-toe Boots, and proper Fall Arrest harnesses are inspected and worn. All tools must be tethered when working at heights.",
      ar: "<strong>توجيه السلامة المهنية:</strong> يرجى دائماً مراجعة مسؤول السلامة في الموقع ودراسة تحليل مخاطر العمل (JHA). تأكد من ارتداء خوذة الأمان المعتمدة وسترة الوضوح العالي وأحذية السلامة الفولاذية وربط أحزمة الأمان. احرص على ربط وتأمين جميع الأدوات المحمولة عند العمل على المرتفعات لمنع سقوطها.",
      hi: "<strong>सामान्य सुरक्षा सलाह:</strong> काम शुरू करने से पहले हमेशा साइट सुरक्षा अधिकारी से परामर्श करें। सुनिश्चित करें कि आपने अनुमोदित हेलमेट, सुरक्षा जैकेट और स्टील-टो जूते पहने हैं।",
      es: "<strong>Recomendación General de Seguridad:</strong> Consulta siempre con el Supervisor de Seguridad de la obra antes de iniciar labores críticas. Asegúrate de portar casco certificado, chaleco reflectante, botas con casquillo y arnés."
    };

    return defaults[lang] || defaults.en;
  }

  function speakText(htmlText, lang = 'en') {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    // Strip HTML tags for clean speech
    const plainText = htmlText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(plainText);

    // Language codes
    const langMap = {
      en: 'en-US',
      ar: 'ar-SA',
      hi: 'hi-IN',
      es: 'es-ES',
      tl: 'fil-PH',
      ur: 'ur-PK',
      ta: 'ta-IN',
      ml: 'ml-IN',
      fr: 'fr-FR'
    };

    utterance.lang = langMap[lang] || 'en-US';
    utterance.rate = 0.95; // Clear industrial advisory speed
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }

  function handleUserMessage(query, lang = 'en') {
    const chatContainer = document.getElementById('ai-chat-messages');
    if (!chatContainer) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = `flex justify-end mb-3`;
    userMsg.innerHTML = `
      <div class="bg-amber-500 text-slate-950 font-medium px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%] text-sm shadow">
        ${query}
      </div>
    `;
    chatContainer.appendChild(userMsg);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Simulate AI thinking and typing response
    setTimeout(() => {
      const answer = getAnswer(query, lang);
      const botMsg = document.createElement('div');
      botMsg.className = `flex justify-start mb-3`;
      botMsg.innerHTML = `
        <div class="flex items-start gap-2.5 max-w-[85%]">
          <div class="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/50 flex items-center justify-center text-sm shrink-0 shadow">
            🤖
          </div>
          <div class="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs sm:text-sm p-3.5 rounded-2xl rounded-tl-sm leading-relaxed shadow-lg relative group">
            <div>${answer}</div>
            <div class="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span class="text-[10px] text-amber-400 font-mono">SiteShield AI Guide</span>
              <button class="speak-btn text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold flex items-center gap-1 transition-all">
                <span>🔊</span> <span>Listen / Read Aloud</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Wire up speech button
      const speakBtn = botMsg.querySelector('.speak-btn');
      if (speakBtn) {
        speakBtn.addEventListener('click', () => {
          speakText(answer, lang);
          speakBtn.innerHTML = '<span>🔊</span> <span>Speaking...</span>';
          setTimeout(() => {
            speakBtn.innerHTML = '<span>🔊</span> <span>Listen / Read Aloud</span>';
          }, 4000);
        });
      }

      chatContainer.appendChild(botMsg);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // Award points for learning safety regulations
      Gamification.awardPoints(30, "Consulted AI Construction Safety Guide");
    }, 400);
  }

  return {
    getAnswer,
    handleUserMessage,
    speakText
  };
})();

