(function () {
  'use strict';

  // ─── 1. DETERMINE VARIANT ───────────────────────────────────────────────
  // Priority: URL param ?variant=a|b → localStorage → random assignment
  var COOKIE_NAME = 'swb_variant';
  var variant;

  // Helper: read a cookie by name
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return match ? match[1] : null;
  }

  // Helper: set a cookie for 90 days
  function setCookie(name, value) {
    var expires = new Date(Date.now() + 90 * 864e5).toUTCString();
    document.cookie = name + '=' + value + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  var urlParam = new URLSearchParams(window.location.search).get('variant');
  if (urlParam === 'a' || urlParam === 'A') {
    variant = 'A';
  } else if (urlParam === 'b' || urlParam === 'B') {
    variant = 'B';
  } else {
    var stored = getCookie(COOKIE_NAME);
    if (stored === 'A' || stored === 'B') {
      variant = stored;
    } else {
      variant = Math.random() < 0.5 ? 'A' : 'B';
    }
  }

  // Persist assignment via cookie
  setCookie(COOKIE_NAME, variant);

  // Expose globally for debugging
  window.sawubonaVariant = variant;

  // ─── 2. VARIANT CONTENT MAP ─────────────────────────────────────────────
  var content = {
    A: {
      heroBadge:        '🇳🇬 🇬🇭 &nbsp; Sawubona — We see you. Launching London &amp; Hertfordshire',
      heroHeadline:     'She didn\'t leave Nigeria<br/>to be <em>lonely in London</em>.',
      heroSub:          'Sawubona connects Nigerian and Ghanaian elders in the UK with companions who speak their language, share their culture, and understand their story. Not a care service — just genuine human connection, delivered to their home. Sawubona means we see you. And we do.',
      heroCard1:        '<strong>Adunola, 74 — Peckham</strong><span>Matched with Funmi, Yoruba speaker</span>',
      heroCard2:        '<strong>Kwame, 81 — Harrow</strong><span>Matched with Adjoa, Twi speaker</span>',
      heroBg:           'hero-bg.webp',
      storyHeading:     'The call you dread making.',
      storyCTAHeading:  'Find a companion for your family',
      videoCaption:     '"She speaks Yoruba. She understands me. It feels like family."',
      videoAttr:        '— The kind of match Sawubona makes',
      videoSrc:         'hero-video-loop.mp4',
      companionHeading: 'Thirty years of working. Now, something that matters.',
      waitlistHeading:  'Be first when we launch. We see you.',
      waitlistSub:      'We\'re building Sawubona now. The more we know about you upfront, the faster we can find the right match and get started.',
      familyFormHeading:'Find a companion for my family',
      familyFormSub:    'Tell us a little about your elder so we can find the right match',
      elderNamePH:      'e.g. Mama Abike',
      notesPH:          'e.g. She speaks Yoruba and loves watching NTA. She\'s independent but the days are long...',
      sceneHomeVisit:   'scene-home-visit.webp',
      sceneConversation:'scene-conversation.webp',
      sceneVideoCall:   'scene-video-call.webp',
    },
    B: {
      heroBadge:        '🇬🇭 &nbsp; Sawubona — We see you. Launching London &amp; Hertfordshire',
      heroHeadline:     'He didn\'t leave Ghana<br/>to be <em>invisible in London</em>.',
      heroSub:          'Sawubona connects Ghanaian elders in the UK with companions who speak Twi, share their culture, and understand their story. Not a care service — just genuine human connection, delivered to their home. Sawubona means we see you. And we do.',
      heroCard1:        '<strong>Kofi, 77 — Harrow</strong><span>Matched with Kweku, Twi speaker</span>',
      heroCard2:        '<strong>Emmanuel, 83 — Enfield</strong><span>Matched with Yaw, Twi speaker</span>',
      heroBg:           'hero-bg-b.webp',
      storyHeading:     'The call you make every Sunday.',
      storyCTAHeading:  'Find a companion for your father',
      videoCaption:     '"He speaks Twi. He understands me. It feels like family."',
      videoAttr:        '— The kind of match Sawubona makes for Ghanaian elders',
      videoSrc:         'hero-video-loop-b.mp4',
      companionHeading: 'You built a life here. Now give something back to it.',
      waitlistHeading:  'Be first when we launch. We see you.',
      waitlistSub:      'We\'re building Sawubona now. The more we know about your father upfront, the faster we can find the right Twi-speaking companion and get started.',
      familyFormHeading:'Find a companion for my father',
      familyFormSub:    'Tell us a little about him so we can find the right Twi-speaking match',
      elderNamePH:      'e.g. Papa Kofi',
      notesPH:          'e.g. He speaks Twi and watches GTV on his tablet. Very independent, but the days are long since he retired...',
      sceneHomeVisit:   'scene-home-visit-b.webp',
      sceneConversation:'scene-conversation-b.webp',
      sceneVideoCall:   'scene-video-call-b.webp',
    }
  };

  var v = content[variant];

  // ─── 3. APPLY CONTENT ───────────────────────────────────────────────────
  function set(id, html, attr, val) {
    var el = document.getElementById(id);
    if (!el) return;
    if (attr) { el[attr] = val; }
    else { el.innerHTML = html; }
  }

  function show(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = '';
  }

  function hide(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  // Hero
  set('hero-badge', v.heroBadge);
  set('hero-headline', v.heroHeadline);
  set('hero-sub', v.heroSub);
  set('hero-card-1', v.heroCard1);
  set('hero-card-2', v.heroCard2);
  set('hero-bg-img', null, 'src', v.heroBg);

  // Story
  set('story-heading', v.storyHeading);
  set('story-cta-heading', v.storyCTAHeading);
  if (variant === 'A') { show('story-a'); hide('story-b'); }
  else                 { hide('story-a'); show('story-b'); }

  // Video
  set('video-caption', v.videoCaption);
  set('video-attribution', v.videoAttr);
  var vid = document.getElementById('hero-video');
  if (vid) vid.setAttribute('data-src', v.videoSrc);

  // Companion section
  set('companion-heading', v.companionHeading);
  if (variant === 'A') { show('companion-a'); hide('companion-b'); }
  else                 { hide('companion-a'); show('companion-b'); }

  // Waitlist section
  set('waitlist-heading', v.waitlistHeading);
  set('waitlist-sub', v.waitlistSub);

  // Family form
  set('family-form-heading', v.familyFormHeading);
  set('family-form-sub', v.familyFormSub);
  var elderNameEl = document.getElementById('family-elder-name');
  if (elderNameEl) elderNameEl.placeholder = v.elderNamePH;
  var notesEl = document.getElementById('family-notes');
  if (notesEl) notesEl.placeholder = v.notesPH;

  // Scene images
  set('scene-home-visit-img', null, 'src', v.sceneHomeVisit);
  set('scene-conversation-img', null, 'src', v.sceneConversation);
  set('scene-video-call-img', null, 'src', v.sceneVideoCall);

  // ─── 4. STAMP VARIANT INTO BOTH FORM HIDDEN FIELDS ──────────────────────
  var familyField = document.getElementById('family-variant-field');
  var companionField = document.getElementById('companion-variant-field');
  if (familyField) familyField.value = variant;
  if (companionField) companionField.value = variant;

  // ─── 5. WIRE VIDEO SRC (respects lazy-load in main.js) ──────────────────
  // Override data-src so main.js IntersectionObserver picks up correct file
  if (vid) {
    vid.setAttribute('data-src', v.videoSrc);
  }

})();
