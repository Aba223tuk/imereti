/* ═══════════════════════════════════════════════════════════
   Imereti — interactions
   Nothing here is required to read the menu, see the hours,
   or reach the phone number. It all degrades cleanly.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── year ─────────────────────────────────────────────── */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── sticky header + mobile bar ───────────────────────── */
  var hdr = document.getElementById('hdr');
  var mbar = document.querySelector('.mbar');

  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('stuck', y > 40);
    if (mbar) mbar.classList.toggle('show', y > window.innerHeight * 0.55);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── drawer ───────────────────────────────────────────── */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');

  if (burger && drawer) {
    drawer.removeAttribute('hidden');

    var setNav = function (open) {
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    burger.addEventListener('click', function () {
      setNav(!document.body.classList.contains('nav-open'));
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        setNav(false);
        burger.focus();
      }
    });
  }

  /* ── scroll reveals ───────────────────────────────────── */
  var revs = document.querySelectorAll('.rv');

  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revs, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });

    Array.prototype.forEach.call(revs, function (el) { io.observe(el); });
  }

  /* ── menu tabs ────────────────────────────────────────── */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));

  tabs.forEach(function (tab) {
    var cat = tab.dataset.cat;
    var panel = panels.filter(function (p) { return p.dataset.cat === cat; })[0];
    tab.id = 'tab-' + cat;
    tab.setAttribute('aria-controls', 'panel-' + cat);
    if (panel) {
      panel.id = 'panel-' + cat;
      panel.setAttribute('aria-labelledby', 'tab-' + cat);
    }
  });

  function pick(tab, focus) {
    var cat = tab.dataset.cat;

    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;           // roving tabindex
    });

    panels.forEach(function (p) {
      p.classList.toggle('is-on', p.dataset.cat === cat);
    });

    if (focus) tab.focus();
    tab.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  }

  tabs.forEach(function (tab, i) {
    tab.tabIndex = tab.classList.contains('is-on') ? 0 : -1;
    tab.addEventListener('click', function () { pick(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); pick(next, true); }
    });
  });

  /* ── counting stats ───────────────────────────────────── */
  var counters = document.querySelectorAll('[data-count]');

  function count(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.dec || '0', 10);
    var dur = 1400, start = null;

    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (counters.length && !reduced && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { count(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(counters, function (c) { cio.observe(c); });
  }

  /* ── open / closed ────────────────────────────────────────
     Worked out in New York time, not the visitor's.
     Open 9:00am–10:00pm, every day.
     ─────────────────────────────────────────────────────── */
  (function status() {
    var badge = document.getElementById('openNow');
    if (!badge) return;

    var mins;
    try {
      var fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false
      });
      var parts = {};
      fmt.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      var h = parseInt(parts.hour, 10) % 24;   // some engines emit "24" at midnight
      mins = h * 60 + parseInt(parts.minute, 10);
    } catch (err) {
      var now = new Date();
      mins = now.getHours() * 60 + now.getMinutes();
    }
    if (isNaN(mins)) return;

    var open = 9 * 60, close = 22 * 60;
    var isOpen = mins >= open && mins < close;

    badge.hidden = false;
    badge.classList.add(isOpen ? 'open' : 'shut');

    if (isOpen) {
      var left = close - mins;
      badge.textContent = left <= 60
        ? 'Open now · closing in ' + left + ' min'
        : 'Open now · until 10pm';
    } else if (mins < open) {
      badge.textContent = 'Closed · opens 9am';
    } else {
      badge.textContent = 'Closed · opens 9am tomorrow';
    }
  })();

  /* ═══════════════════════════════════════════════════════
     DISH DETAILS
     Georgian spellings below are the verified set only —
     dishes whose spelling could not be confirmed against
     ka.wikipedia get English only. Do not add Georgian here
     without checking it the same way.
     descKa is the house Georgian translation of each
     description — shown above the English one in the modal.
     ═══════════════════════════════════════════════════════ */
  var DISHES = {
    /* khachapuri & breads */
    'imeruli': {
      en: 'Imeruli Khachapuri', ka: 'იმერული ხაჭაპური', img: 'imeruli-khachapuri.jpg',
      alt: 'Imeruli khachapuri — round enclosed Georgian cheese bread, cut open',
      note: 'The one we are named for',
      desc: 'Fresh Imeretian cheese sealed inside soft dough, pressed flat and baked into a round — traditionally on a ketsi, a clay pan set on embers. This is the baseline: say "khachapuri" anywhere in Georgia with no region attached, and this is what arrives.',
      descKa: 'ახალი იმერული ყველი რბილ ცომში ჩაკრული, გაბრტყელებული და მრგვალად გამომცხვარი — ტრადიციულად კეცზე, ნაკვერჩხლებზე შემდგარ თიხის ტაფაზე. ეს არის საწყისი წერტილი: თქვით „ხაჭაპური" საქართველოში რეგიონის დაუზუსტებლად — და სწორედ ეს მოვა.',
      tags: ['Vegetarian', 'Baked to order']
    },
    'acharuli': {
      en: 'Acharuli Khachapuri', ka: 'აჭარული ხაჭაპური', img: 'acharuli-khachapuri.jpg',
      alt: 'Acharuli khachapuri — boat-shaped bread with molten cheese, egg yolk and butter',
      note: 'The famous one',
      desc: 'An open boat of bread flooded with molten cheese, a raw yolk and a knob of butter dropped in at the last second. Stir it all together while everything is still moving, then tear the crust and use it as your spoon.',
      descKa: 'პურის ღია ნავი, გამდნარი ყველით სავსე — ბოლო წამს კი უმი გული და კარაქის ნაჭერი ეშვება შიგ. აურიეთ ყველაფერი, სანამ ჯერ კიდევ დუღს, შემდეგ ჩამოგლიჯეთ ქერქი და კოვზად გამოიყენეთ.',
      tags: ['Vegetarian', 'Eat it hot']
    },
    'megruli': {
      en: 'Megruli Khachapuri', ka: 'მეგრული ხაჭაპური', img: 'megruli.jpg',
      alt: 'Megruli khachapuri — round Georgian cheese bread with melted cheese over the top',
      note: 'For cheese people',
      desc: 'Built like the imeruli — then more cheese melted over the top, so it comes to the table cheese inside and out. Western Georgia’s answer to the question "could there be more?"',
      descKa: 'იმერულივით აწყობილი — შემდეგ ზემოდანაც ყველი ედნობა, ასე რომ სუფრაზე ყველით შიგნით და გარეთ მოდის. დასავლეთ საქართველოს პასუხი კითხვაზე: „კიდევ მეტი შეიძლება?"',
      tags: ['Vegetarian']
    },
    'shampurze': {
      en: 'Khachapuri Shampurze', img: 'shampurze.jpg',
      alt: 'Khachapuri shampurze — bread baked wrapped around a skewer',
      note: 'From the grill',
      desc: 'Khachapuri baked wrapped around the skewer, over the same charcoal as the mtsvadi — crisp outside, molten inside, straight off the mangal.',
      descKa: 'შამფურზე შემოხვეული და გამომცხვარი ხაჭაპური, იმავე ნაკვერჩხალზე, სადაც მწვადი — გარედან ხრაშუნა, შიგნით გამდნარი, პირდაპირ მანგალიდან.',
      tags: ['From the charcoal']
    },
    'achma': {
      en: 'Achma', ka: 'აჩმა', img: 'achma.jpg',
      alt: 'Achma — layered Georgian cheese pastry slice on a white plate',
      note: 'Georgian lasagne',
      desc: 'Layered sheets of boiled dough with cheese and butter between every layer — no sauce, just richness. One guest’s review reads, in full: "yum yum yum."',
      descKa: 'მოხარშული ცომის ფენები, ყოველ ფენას შორის ყველი და კარაქი — სოუსი არ სჭირდება, სინოყივრე თავად ლაპარაკობს. ერთი სტუმრის შეფასება მთლიანად ასე იკითხება: „გემრიელია, გემრიელია, გემრიელია."',
      tags: ['Vegetarian']
    },
    'penovani': {
      en: 'Penovani Khachapuri', ka: 'პენოვანი',
      note: 'The flaky one',
      desc: 'Khachapuri in puff pastry — square, flaky, buttery, and built to be eaten out of hand walking down Brighton Beach Avenue.',
      descKa: 'ხაჭაპური ფენოვან ცომში — კვადრატული, ფხვიერი, კარაქიანი, ხელში დასაჭერად და ბრაიტონ ბიჩის გამზირზე სასეირნოდ შექმნილი.',
      tags: ['Vegetarian']
    },
    'guruli': {
      en: 'Guruli', ka: 'გურული', img: 'guruli.jpg',
      alt: 'Guruli — folded crescent of Georgian cheese bread, baked golden',
      note: 'The Christmas one',
      desc: 'A folded crescent of dough with cheese and chopped hard-boiled egg — the khachapuri Guria bakes for Christmas.',
      descKa: 'ცომის გადაკეცილი ნახევარმთვარე ყველითა და დაჭრილი მოხარშული კვერცხით — ხაჭაპური, რომელსაც გურია შობისთვის აცხობს.',
      tags: ['Vegetarian']
    },
    'lobiani': {
      en: 'Lobiani', img: 'lobiani.jpg',
      alt: 'Lobiani — round Georgian bread cut in wedges, bean filling at the cut edges',
      note: 'Bean bread',
      desc: 'Flat bread baked around a filling of spiced, mashed beans — the khachapuri shape with the lobio soul.',
      descKa: 'ბრტყელი პური, სანელებლებიანი დანაყილი ლობიოს გულით გამომცხვარი — ხაჭაპურის ფორმა, ლობიოს სულით.',
      tags: ['Vegetarian']
    },
    'fkhlovana': {
      en: 'Fkhlovana', img: 'fkhlovana.jpg',
      alt: 'Fkhlovana — round Georgian bread filled with greens and herbs, cut in wedges',
      note: 'Greens & herbs',
      desc: 'Baked with a filling of greens, herbs and cheese — the green counterpart to the cheese breads.',
      descKa: 'მწვანილის, ბალახეულისა და ყველის გულით გამომცხვარი — ყველიანი პურების მწვანე ტოლი.',
      tags: ['Vegetarian']
    },
    'mchadi': {
      en: 'Cornbread “Mchadi”', ka: 'მჭადი', img: 'mchadi.jpg',
      alt: 'Mchadi — small round golden Georgian corn cakes in a clay dish',
      note: 'Three pieces',
      desc: 'Small rounds of cornbread with crisp edges, made the old way. Corn reached western Georgia four centuries ago and became the staple grain — order these with the lobio and eat them together.',
      descKa: 'პატარა, კიდეებხრაშუნა სიმინდის კვერები, ძველებურად გამომცხვარი. სიმინდი დასავლეთ საქართველოში ოთხი საუკუნის წინ მოვიდა და მთავარ მარცვლეულად იქცა — შეუკვეთეთ ლობიოსთან ერთად და ერთად მიირთვით.',
      tags: ['Vegetarian']
    },

    /* khinkali & grill */
    'khinkali': {
      en: 'Khinkali', ka: 'ხინკალი', img: 'khinkali.jpg',
      alt: 'Khinkali — hand-pleated Georgian soup dumplings with twisted knots',
      note: 'Six pieces, boiled to order',
      desc: 'Spiced meat and hot broth sealed inside a pleated purse of dough. Hold it by the tail, bite the side, drink the broth first — then eat the rest. Leave the tails on your plate; that is how a Georgian counts what you managed.',
      descKa: 'ცომის დანაოჭებულ ქისაში ჩაკეტილი სანელებლიანი ხორცი და ცხელი წვენი. დაიჭირეთ კუდით, მოკბიჩეთ გვერდიდან, ჯერ წვენი შესვით — მერე დანარჩენი. კუდები თეფშზე დატოვეთ; ასე ითვლის ქართველი, რამდენს გაუძელით.',
      tags: ['The signature']
    },
    'mtsvadi': {
      en: 'Mtsvadi', ka: 'მწვადი', img: 'mtsvadi.jpg',
      alt: 'Mtsvadi — meat grilling on flat skewers over charcoal',
      note: 'Pork or chicken',
      desc: 'Meat threaded onto flat skewers and turned over live charcoal until the edges char and the middle stays running with juice. Salt and smoke do all the talking.',
      descKa: 'ბრტყელ შამფურზე ასხმული ხორცი, ცოცხალ ნაკვერჩხალზე ტრიალით შემწვარი — კიდეები შებოლილი, შუაგული წვნიანი. მარილი და კვამლი თავად ლაპარაკობენ.',
      tags: ['From the charcoal']
    },
    'mtsvadi-pork': {
      en: 'Pork Mtsvadi', ka: 'მწვადი', img: 'mtsvadi.jpg',
      alt: 'Mtsvadi — meat grilling on flat skewers over charcoal',
      note: 'From the charcoal',
      desc: 'Pork on the flat skewer, turned over live coals — char at the edges, juice in the middle. The classic.',
      descKa: 'ღორის ხორცი ბრტყელ შამფურზე, ცოცხალ ნაკვერჩხალზე — კიდეებზე ნახშირი, შუაში წვენი. კლასიკა.',
      tags: ['From the charcoal']
    },
    'mtsvadi-chicken': {
      en: 'Chicken Mtsvadi', ka: 'მწვადი', img: 'mtsvadi.jpg',
      alt: 'Mtsvadi — meat grilling on flat skewers over charcoal',
      note: 'From the charcoal',
      desc: 'Chicken on the flat skewer over live coals — lighter than the pork, same smoke.',
      descKa: 'ქათამი ბრტყელ შამფურზე, ცოცხალ ნაკვერჩხალზე — ღორისაზე მსუბუქი, იგივე კვამლი.',
      tags: ['From the charcoal']
    },
    'lula': {
      en: 'Lula Kebab',
      note: 'Hand-minced',
      desc: 'Beef and pork minced with onion, worked onto the skewer until it clings, and grilled over the coals.',
      descKa: 'საქონლისა და ღორის ხორცი ხახვთან ერთად დაკეპილი, შამფურზე მიკრული და ნაკვერჩხალზე შემწვარი.',
      tags: ['From the charcoal']
    },
    'kupati': {
      en: 'Kupati',
      note: 'Georgian sausage',
      desc: 'Spiced pork-and-beef sausage, grilled dark over the coals — a western-Georgian staple.',
      descKa: 'სანელებლიანი ღორისა და საქონლის ძეხვი, ნაკვერჩხალზე მუქად შემწვარი — დასავლურ-ქართული კლასიკა.',
      tags: ['From the charcoal']
    },
    'shkmeruli': {
      en: 'Shkmeruli', ka: 'შქმერული', img: 'shkmeruli.jpg',
      alt: 'Shkmeruli — golden chicken pieces in white garlic-milk sauce in a clay bowl',
      note: 'Garlic milk chicken',
      desc: 'Fried chicken finished in a sauce of garlic and milk, named for the mountain village of Shkmeri. The sauce is the point — keep bread within reach.',
      descKa: 'შემწვარი ქათამი ნივრისა და რძის სოუსში ჩაშუშული, მთის სოფელ შქმერის სახელობის. სოუსი მთავარია — პური ახლოს გქონდეთ.',
      tags: ['For garlic people']
    },
    'tabaka': {
      en: 'Chicken Tabaka', img: 'tabaka.jpg',
      alt: 'Chicken tabaka — whole flattened chicken, pan-fried golden and crisp',
      note: 'Flattened & crisped',
      desc: 'A whole chicken flattened under a weight and pan-fried until the skin crackles. Heavy on garlic, exactly as it should be.',
      descKa: 'მთელი ქათამი, საწონის ქვეშ გაბრტყელებული და ტაფაზე შემწვარი, სანამ კანი არ ახრაშუნდება. ბლომად ნიორი — ზუსტად ისე, როგორც უნდა იყოს.',
      tags: []
    },
    'kuchmachi': {
      en: 'Kuchmachi',
      note: 'The old-country classic',
      desc: 'A rich sauté of offal with walnuts, herbs and pomegranate — deeply savoury, and better than the word "offal" is selling it.',
      descKa: 'შიგნეულის ნოყიერი მოშუშება ნიგვზით, მწვანილითა და ბროწეულით — ღრმად არომატული, და გაცილებით უკეთესი, ვიდრე სიტყვა „შიგნეული" ჰპირდება.',
      tags: []
    },

    /* cold dishes */
    'pkhali': {
      en: 'Assorted Pkhali', ka: 'ფხალი', img: 'pkhali.jpg',
      alt: 'Pkhali — green walnut and herb vegetable pâtés topped with pomegranate seeds',
      note: 'Cold, to share',
      desc: 'Vegetables and greens pounded into walnut paste, rolled and crowned with pomegranate seeds. Cold, dense, deeply savoury — and entirely vegetarian.',
      descKa: 'ბოსტნეული და მწვანილი ნიგვზის პასტაში დანაყილი, დაგუნდავებული და ბროწეულის მარცვლებით შემკული. ცივი, მკვრივი, ღრმად არომატული — და მთლიანად უხორცო.',
      tags: ['Vegetarian']
    },
    'lobio': {
      en: 'Beans with Walnuts “Lobio”', ka: 'ლობიო', img: 'lobio.jpg',
      alt: 'Lobio — red bean stew in a clay pot with herbs and onion',
      note: 'In the clay pot',
      desc: 'Red beans stewed soft with walnuts, coriander and onion, served in the pot they were cooked in. Order the mchadi cornbread alongside — that is the pairing.',
      descKa: 'ნიგვზით, ქინძითა და ხახვით რბილად მოშუშული წითელი ლობიო, იმავე ქოთანში მოტანილი, რომელშიც მოიხარშა. გვერდით მჭადი შეუკვეთეთ — ეს არის ნამდვილი წყვილი.',
      tags: ['Vegetarian']
    },
    'badrijani': {
      en: 'Eggplant with Walnut', ka: 'ბადრიჯანი ნიგვზით', img: 'badrijani.jpg',
      alt: 'Badrijani — fried eggplant rolls filled with walnut paste, topped with pomegranate',
      note: 'Five pieces',
      desc: 'Thin fried eggplant rolled around garlicky walnut paste and topped with pomegranate seeds. Cold, rich, and usually the first plate emptied.',
      descKa: 'თხლად შემწვარი ბადრიჯანი, ნივრიან ნიგვზის პასტაზე შემოხვეული და ბროწეულის მარცვლებით მოთავებული. ცივი, ნოყიერი — და ჩვეულებრივ პირველი თეფში, რომელიც იცლება.',
      tags: ['Vegetarian']
    },
    'salad-walnut': {
      en: 'Tomato & Cucumber Salad with Walnuts', img: 'salad.jpg',
      alt: 'Chopped tomato and cucumber salad with herbs',
      note: 'The Georgian table salad',
      desc: 'Tomato and cucumber under a thick walnut dressing — the salad that sits on every table in Georgia.',
      descKa: 'პომიდორი და კიტრი სქელი ნიგვზის საკაზმის ქვეშ — სალათი, რომელიც საქართველოში ყველა სუფრაზე დგას.',
      tags: ['Vegetarian']
    },
    'salad-plain': {
      en: 'Tomato & Cucumber Salad', img: 'salad.jpg',
      alt: 'Chopped tomato and cucumber salad with herbs',
      note: 'Fresh',
      desc: 'Tomato, cucumber, onion and herbs, simply dressed with vinegar.',
      descKa: 'პომიდორი, კიტრი, ხახვი და მწვანილი, უბრალოდ ძმრით შეზავებული.',
      tags: ['Vegetarian']
    },
    'olivier': {
      en: 'Olivier Salad',
      note: 'The family classic',
      desc: 'The potato salad every family makes a little differently. Ours is ours.',
      descKa: 'კარტოფილის სალათი, რომელსაც ყველა ოჯახი ცოტა სხვანაირად აკეთებს. ჩვენი — ჩვენია.',
      tags: []
    },
    'bazhe': {
      en: 'Walnut Sauce “Bazhe”', ka: 'ბაჟე',
      note: 'For dipping',
      desc: 'Thick, garlicky walnut sauce — for bread, for chicken, or for eating in ways you do not have to explain to anyone.',
      descKa: 'სქელი, ნივრიანი ნიგვზის საწებელი — პურისთვის, ქათმისთვის, ან ისე მისართმევად, როგორსაც არავის უნდა უხსნიდეთ.',
      tags: ['Vegetarian']
    },
    'potatoes': {
      en: 'Baby Potatoes with Dill',
      note: 'Buttered & herbed',
      desc: 'Baby potatoes turned in butter and dill.',
      descKa: 'პატარა კარტოფილი კარაქსა და კამაში ამოვლებული.',
      tags: ['Vegetarian']
    },
    'cheese-imeruli': {
      en: 'Imeruli Cheese', ka: 'იმერული ყველი',
      note: 'Fresh from the west',
      desc: 'The fresh, milky, lightly salted cheese of Imereti — soft and springy. Protected by name since 2021: if it is not made in Imereti, it cannot legally be called this.',
      descKa: 'იმერეთის ახალი, რძიანი, ოდნავ მარილიანი ყველი — რბილი და დრეკადი. 2021 წლიდან სახელი დაცულია: თუ იმერეთში არ არის დამზადებული, ამ სახელს კანონით ვერ ატარებს.',
      tags: ['Vegetarian']
    },
    'cheese-board': {
      en: 'Assorted Cheese',
      note: 'To share',
      desc: 'A board of cheeses to start the table.',
      descKa: 'ყველის დაფა სუფრის დასაწყებად.',
      tags: []
    },

    /* soups & stews */
    'chakapuli': {
      en: 'Chakapuli', ka: 'ჩაქაფული', img: 'chakapuli.jpg',
      alt: 'Chakapuli — green Georgian lamb stew with tarragon and whole unripe plums',
      note: 'The green stew',
      desc: 'Lamb stewed green with tarragon and whole unripe tkemali plums — bright, sour, herbal. Nothing else on the menu tastes like it; nothing else in the city much does either.',
      descKa: 'ტარხუნითა და მთლიანი მკვახე ტყემლით მწვანედ მოშუშული ბატკანი — მჟავე, ბალახოვანი, კაშკაშა. მენიუში მსგავსი გემო არაფერს აქვს; მთელ ქალაქშიც — თითქმის არაფერს.',
      tags: ['House favourite']
    },
    'kharcho': {
      en: 'Kharcho', ka: 'ხარჩო', img: 'kharcho.jpg',
      alt: 'Kharcho — thick reddish-brown Georgian beef soup with cilantro',
      note: 'Beef, walnut, rice',
      desc: 'Beef soup thickened with rice and ground walnut, soured with plum. One guest called the soups here "joyful" — this is the one they meant.',
      descKa: 'ბრინჯითა და დანაყილი ნიგვზით შესქელებული საქონლის წვნიანი, ტყემლით დამჟავებული. ერთმა სტუმარმა აქაურ წვნიანებს „სიხარულიანი" უწოდა — სწორედ ეს იგულისხმა.',
      tags: []
    },
    'chashushuli': {
      en: 'Chashushuli',
      note: 'Stewed down',
      desc: 'Beef stewed down with tomato, onion and chilli until the sauce clings to the meat.',
      descKa: 'პომიდვრით, ხახვითა და წიწაკით ჩაშუშული საქონლის ხორცი, სანამ სოუსი ხორცს არ მიეკვრება.',
      tags: []
    },
    'borscht': {
      en: 'Borscht', img: 'borscht.jpg',
      alt: 'Borscht — deep red beet soup with a swirl of sour cream',
      note: 'With sour cream',
      desc: 'Beetroot and beef, deep red, finished with sour cream. Not Georgian — beloved anyway.',
      descKa: 'ჭარხალი და საქონლის ხორცი, მუქი წითელი, არაჟნით დაგვირგვინებული. ქართული არ არის — მაინც საყვარელი.',
      tags: []
    },

    /* bakery */
    'fruit-cake': {
      en: 'Fruit Cake',
      note: 'From the counter',
      desc: 'From the bakery case at the front — the case changes through the day, so what is in it when you arrive is the menu.',
      descKa: 'წინა საკონდიტრო ვიტრინიდან — ვიტრინა დღის განმავლობაში იცვლება, ასე რომ მენიუ ის არის, რაც მოსვლისას დაგხვდებათ.',
      tags: []
    },
    'ideal': {
      en: '“Ideal” Cake',
      note: 'The house cake',
      desc: 'A house layer cake one guest described as "both huge and delicious." We can confirm both.',
      descKa: 'სახლის ფენოვანი ტორტი, რომელიც ერთმა სტუმარმა ასე აღწერა: „უზარმაზარიც და გემრიელიც." ორივეს ვადასტურებთ.',
      tags: []
    },
    'tartaletka': {
      en: 'Tartaletka',
      note: 'Little tart',
      desc: 'A crisp tart shell filled with cream, from the bakery counter.',
      descKa: 'ხრაშუნა ტარტის კალათა კრემით, საკონდიტრო ვიტრინიდან.',
      tags: []
    },
    'trubochka': {
      en: 'Trubochka',
      note: 'Pastry horn',
      desc: 'A crisp pastry horn, piped full of cream.',
      descKa: 'ხრაშუნა ფენოვანი რქა, კრემით გამოტენილი.',
      tags: []
    },

    /* drinks */
    'lemonade-tarragon': {
      en: 'Georgian Lemonade — Tarragon',
      note: 'Bright green',
      desc: 'Georgian tarragon lemonade — bright green, sweet, and exactly as it should be.',
      descKa: 'ქართული ტარხუნის ლიმონათი — კაშკაშა მწვანე, ტკბილი და ზუსტად ისეთი, როგორიც უნდა იყოს.',
      tags: []
    },
    'lemonade-pear': {
      en: 'Georgian Lemonade — Pear',
      note: 'Natakhtari',
      desc: 'Georgian pear lemonade by Natakhtari — soft, honeyed, nostalgic.',
      descKa: 'ქართული მსხლის ლიმონათი „ნატახტარისგან" — რბილი, თაფლიანი, ნოსტალგიური.',
      tags: []
    },
    'borjomi': {
      en: 'Borjomi',
      note: 'From the gorge',
      desc: 'Georgia’s famous volcanic mineral water, bottled in the Borjomi gorge since the 1890s.',
      descKa: 'საქართველოს სახელგანთქმული ვულკანური მინერალური წყალი, ბორჯომის ხეობაში 1890-იანი წლებიდან ჩამოსხმული.',
      tags: []
    },
    'nabeglavi': {
      en: 'Nabeglavi',
      note: 'Mineral water',
      desc: 'Georgian mineral water from the village of Nabeglavi.',
      descKa: 'ქართული მინერალური წყალი სოფელ ნაბეღლავიდან.',
      tags: []
    },
    'water': {
      en: 'Still Water',
      note: '',
      desc: 'Bottled still water.',
      descKa: 'ჩამოსხმული უგაზო წყალი.',
      tags: []
    },
    'sodas': {
      en: 'Sodas',
      note: 'The usual',
      desc: 'Coca-Cola, Diet Coke, Coke Zero, Pepsi, Sprite and Fanta.',
      descKa: 'კოკა-კოლა, დიეტ კოკა, კოკა ზერო, პეპსი, სპრაიტი და ფანტა.',
      tags: []
    }
  };

  /* ── modal machinery ──────────────────────────────────── */
  var modal = document.getElementById('dmodal');

  if (modal) {
    var dmBanner = document.getElementById('dmBanner');
    var dmImg = document.getElementById('dmImg');
    var dmKa = document.getElementById('dmKa');
    var dmTitle = document.getElementById('dmTitle');
    var dmNote = document.getElementById('dmNote');
    var dmDesc = document.getElementById('dmDesc');
    var dmDescKa = document.getElementById('dmDescKa');
    var dmTags = document.getElementById('dmTags');
    var opener = null;
    var hideTimer = null;

    var openDish = function (id, from) {
      var d = DISHES[id];
      if (!d) return;

      dmKa.textContent = d.ka || '';
      dmTitle.textContent = d.en;
      dmNote.textContent = d.note || '';
      dmDesc.textContent = d.desc;
      if (dmDescKa) dmDescKa.textContent = d.descKa || '';

      dmTags.innerHTML = '';
      (d.tags || []).forEach(function (t) {
        var li = document.createElement('li');
        li.textContent = t;
        dmTags.appendChild(li);
      });

      if (d.img) {
        dmBanner.classList.remove('no-img');
        dmImg.alt = d.alt || d.en;
        dmImg.src = 'images/' + d.img;      // loaded on demand, cached after first open
      } else {
        dmBanner.classList.add('no-img');
        dmImg.removeAttribute('src');
        dmImg.alt = '';
      }

      opener = from || null;
      clearTimeout(hideTimer);
      modal.removeAttribute('hidden');
      // force a layout pass so the open transition actually runs
      void modal.offsetWidth;
      modal.classList.add('open');
      document.body.classList.add('dm-open');
      modal.querySelector('.dm-close').focus();
    };

    var closeDish = function () {
      modal.classList.remove('open');
      document.body.classList.remove('dm-open');
      hideTimer = setTimeout(function () {
        modal.setAttribute('hidden', '');
      }, reduced ? 0 : 380);
      if (opener) { opener.focus(); opener = null; }
    };

    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeDish();
    });

    document.addEventListener('keydown', function (e) {
      if (modal.hasAttribute('hidden')) return;
      if (e.key === 'Escape') { closeDish(); return; }
      if (e.key === 'Tab') {
        // keep focus inside the dialog
        var focusables = modal.querySelectorAll('button, a[href]');
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    /* menu list items → wrap contents in a real button */
    Array.prototype.forEach.call(document.querySelectorAll('.list li[data-dish]'), function (li) {
      var id = li.dataset.dish;
      if (!DISHES[id]) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dish-btn';
      btn.setAttribute('aria-haspopup', 'dialog');
      while (li.firstChild) btn.appendChild(li.firstChild);
      li.appendChild(btn);
      btn.addEventListener('click', function () { openDish(id, btn); });
    });

    /* signature cards → whole card clickable */
    Array.prototype.forEach.call(document.querySelectorAll('.card[data-dish]'), function (card) {
      var id = card.dataset.dish;
      if (!DISHES[id]) return;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-haspopup', 'dialog');
      card.addEventListener('click', function () { openDish(id, card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDish(id, card); }
      });
    });
  }

})();
