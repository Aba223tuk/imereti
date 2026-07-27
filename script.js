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
    'safirmo': {
      en: 'Khachapuri Safirmo', ka: 'საფირმო ხაჭაპური', img: 'safirmo.jpg',
      alt: 'Khachapuri safirmo — round house khachapuri with a browned cheese crust, cut into wedges',
      note: 'The house signature',
      desc: 'Our signature khachapuri — loaded with extra cheese, baked until the top browns, and cut into wedges to share.',
      descKa: 'ჩვენი საფირმო ხაჭაპური — უხვი ყველით, ზემოდან შემოზარდულ ქერქამდე გამომცხვარი, ნაჭრებად დაჭრილი.',
      tags: ['Vegetarian', 'Baked to order']
    },
    'imeruli': {
      en: 'Imeruli Khachapuri', ka: 'იმერული ხაჭაპური', img: 'imeruli-khachapuri.jpg',
      alt: 'Imeruli khachapuri — round enclosed Georgian cheese bread, cut open',
      note: 'The one we are named for',
      desc: 'A round cheese-filled bread from the Imereti region, made with imeruli cheese sealed inside leavened dough and baked flat.',
      descKa: 'მრგვალი, ყველით გატენილი პური იმერეთის რეგიონიდან — აფუებულ ცომში ჩაკრული იმერული ყველი, გაბრტყელებული და გამომცხვარი.',
      tags: ['Vegetarian', 'Baked to order']
    },
    'acharuli': {
      en: 'Acharuli Khachapuri', ka: 'აჭარული ხაჭაპური', img: 'acharuli-khachapuri.jpg',
      alt: 'Acharuli khachapuri — boat-shaped bread with molten cheese, egg yolk and butter',
      note: 'The famous one',
      desc: 'An open, boat-shaped bread from Adjara, filled with melted cheese and topped with a raw egg and butter before serving.',
      descKa: 'ღია, ნავის ფორმის პური აჭარიდან, გამდნარი ყველით სავსე; მიტანის წინ ემატება უმი კვერცხი და კარაქი.',
      tags: ['Vegetarian', 'Eat it hot']
    },
    'megruli': {
      en: 'Megruli Khachapuri', ka: 'მეგრული ხაჭაპური', img: 'megruli.jpg',
      alt: 'Megruli khachapuri — round Georgian cheese bread with melted cheese over the top',
      note: 'For cheese people',
      desc: 'A round cheese bread from Samegrelo, filled with cheese and topped with an additional layer of melted cheese.',
      descKa: 'მრგვალი ყველიანი პური სამეგრელოდან, ყველის გულითა და ზემოდან დამატებული გამდნარი ყველის ფენით.',
      tags: ['Vegetarian']
    },
    'shampurze': {
      en: 'Khachapuri Shampurze', img: 'shampurze.jpg',
      alt: 'Khachapuri shampurze — bread baked wrapped around a skewer',
      note: 'From the grill',
      desc: 'Khachapuri baked on a skewer over charcoal.',
      descKa: 'შამფურზე, ნაკვერჩხალზე გამომცხვარი ხაჭაპური.',
      tags: ['From the charcoal']
    },
    'achma': {
      en: 'Achma', ka: 'აჩმა', img: 'achma.jpg',
      alt: 'Achma — layered Georgian cheese pastry slice on a white plate',
      note: 'Georgian lasagne',
      desc: 'A layered pastry of boiled dough, cheese and butter, traditional to Adjara and Abkhazia.',
      descKa: 'მოხარშული ცომის, ყველისა და კარაქის ფენოვანი ნამცხვარი, ტრადიციული აჭარასა და აფხაზეთში.',
      tags: ['Vegetarian']
    },
    'penovani': {
      en: 'Penovani Khachapuri', ka: 'პენოვანი',
      note: 'The flaky one',
      desc: 'A square khachapuri made with layered puff pastry filled with cheese.',
      descKa: 'კვადრატული ხაჭაპური ფენოვანი ცომით, ყველის გულით.',
      tags: ['Vegetarian']
    },
    'guruli': {
      en: 'Guruli', ka: 'გურული', img: 'guruli.jpg',
      alt: 'Guruli — folded crescent of Georgian cheese bread, baked golden',
      note: 'The Christmas one',
      desc: 'A crescent-shaped bread from Guria filled with cheese and hard-boiled egg, traditionally baked for Christmas.',
      descKa: 'ნახევარმთვარის ფორმის პური გურიიდან, ყველისა და მოხარშული კვერცხის გულით; ტრადიციულად შობისთვის ცხვება.',
      tags: ['Vegetarian']
    },
    'lobiani': {
      en: 'Lobiani', img: 'lobiani.jpg',
      alt: 'Lobiani — round Georgian bread cut in wedges, bean filling at the cut edges',
      note: 'Bean bread',
      desc: 'A Georgian bread filled with mashed, seasoned kidney beans, originating in the Racha region.',
      descKa: 'ქართული პური დანაყილი, შეზავებული ლობიოს გულით, წარმოშობით რაჭის რეგიონიდან.',
      tags: ['Vegetarian']
    },
    'fkhlovana': {
      en: 'Fkhlovana', img: 'fkhlovana.jpg',
      alt: 'Fkhlovana — round Georgian bread filled with greens and herbs, cut in wedges',
      note: 'Greens & herbs',
      desc: 'A khachapuri-style bread baked with a filling of greens, herbs and cheese.',
      descKa: 'ხაჭაპურის ტიპის პური მწვანილის, ბალახეულისა და ყველის გულით.',
      tags: ['Vegetarian']
    },
    'mchadi': {
      en: 'Cornbread “Mchadi”', ka: 'მჭადი', img: 'mchadi.jpg',
      alt: 'Mchadi — small round golden Georgian corn cakes in a clay dish',
      note: 'Three pieces',
      desc: 'A traditional Georgian cornbread, typically served with cheese or lobio.',
      descKa: 'ტრადიციული ქართული სიმინდის პური; ჩვეულებრივ ყველთან ან ლობიოსთან ერთად მიირთმევა.',
      tags: ['Vegetarian']
    },

    /* khinkali & grill */
    'khinkali': {
      en: 'Khinkali', ka: 'ხინკალი', img: 'khinkali.jpg',
      alt: 'Khinkali — hand-pleated Georgian soup dumplings with twisted knots',
      note: 'Six pieces, boiled to order',
      desc: 'Georgian dumplings of twisted dough filled with spiced meat and broth, originating in the mountain regions of Pshavi, Mtiuleti and Khevsureti.',
      descKa: 'ქართული ცომეული დახვეული ცომით, სანელებლიანი ხორცისა და წვენის გულით; წარმოშობით ფშავის, მთიულეთისა და ხევსურეთის მთიანეთიდან.',
      tags: ['The signature']
    },
    'mtsvadi': {
      en: 'Mtsvadi', ka: 'მწვადი', img: 'mtsvadi.jpg',
      alt: 'Mtsvadi — meat grilling on flat skewers over charcoal',
      note: 'Pork or chicken',
      desc: 'Georgian shashlik — cubes of meat threaded onto a skewer and grilled over charcoal.',
      descKa: 'ქართული მწვადი — შამფურზე ასხმული ხორცის ნაჭრები, ნაკვერჩხალზე შემწვარი.',
      tags: ['From the charcoal']
    },
    'mtsvadi-pork': {
      en: 'Pork Mtsvadi', ka: 'მწვადი', img: 'mtsvadi.jpg',
      alt: 'Mtsvadi — meat grilling on flat skewers over charcoal',
      note: 'From the charcoal',
      desc: 'Cubes of pork threaded onto a skewer and grilled over charcoal.',
      descKa: 'შამფურზე ასხმული ღორის ხორცის ნაჭრები, ნაკვერჩხალზე შემწვარი.',
      tags: ['From the charcoal']
    },
    'mtsvadi-chicken': {
      en: 'Chicken Mtsvadi', ka: 'მწვადი', img: 'mtsvadi.jpg',
      alt: 'Mtsvadi — meat grilling on flat skewers over charcoal',
      note: 'From the charcoal',
      desc: 'Cubes of chicken threaded onto a skewer and grilled over charcoal.',
      descKa: 'შამფურზე ასხმული ქათმის ხორცის ნაჭრები, ნაკვერჩხალზე შემწვარი.',
      tags: ['From the charcoal']
    },
    'lula': {
      en: 'Lula Kebab',
      note: 'Hand-minced',
      desc: 'Ground beef and pork mixed with onion, pressed onto a skewer and grilled over charcoal.',
      descKa: 'ხახვთან შერეული დაკეპილი საქონლისა და ღორის ხორცი, შამფურზე დაჭერით ფორმირებული და ნაკვერჩხალზე შემწვარი.',
      tags: ['From the charcoal']
    },
    'kupati': {
      en: 'Kupati',
      note: 'Georgian sausage',
      desc: 'A Georgian sausage of spiced ground pork and beef, grilled before serving.',
      descKa: 'ქართული ძეხვი სანელებლიანი დაკეპილი ღორისა და საქონლის ხორცისგან, მიტანის წინ შემწვარი.',
      tags: ['From the charcoal']
    },
    'shkmeruli': {
      en: 'Shkmeruli', ka: 'შქმერული', img: 'shkmeruli.jpg',
      alt: 'Shkmeruli — golden chicken pieces in white garlic-milk sauce in a clay bowl',
      note: 'Garlic milk chicken',
      desc: 'A Georgian dish of fried chicken cooked in a garlic and milk sauce, named after the village of Shkmeri in Racha.',
      descKa: 'ქართული კერძი — შემწვარი ქათამი ნივრისა და რძის სოუსში; სახელი მომდინარეობს რაჭის სოფელ შქმერიდან.',
      tags: ['For garlic people']
    },
    'tabaka': {
      en: 'Chicken Tabaka', img: 'tabaka.jpg',
      alt: 'Chicken tabaka — whole flattened chicken, pan-fried golden and crisp',
      note: 'Flattened & crisped',
      desc: 'A whole chicken pressed flat under a weight and pan-fried, served with garlic.',
      descKa: 'მთელი ქათამი, საწონის ქვეშ გაბრტყელებული და ტაფაზე შემწვარი; ნივრით მიირთმევა.',
      tags: []
    },
    'kuchmachi': {
      en: 'Kuchmachi', img: 'kuchmachi.jpg',
      note: 'The old-country classic',
      desc: 'A Georgian dish of liver, heart and gizzards cooked with walnuts, herbs and pomegranate seeds.',
      descKa: 'ქართული კერძი ღვიძლის, გულისა და კუჭისგან, ნიგვზით, მწვანილითა და ბროწეულის მარცვლებით მომზადებული.',
      tags: []
    },

    /* cold dishes */
    'pkhali': {
      en: 'Assorted Pkhali', ka: 'ფხალი', img: 'pkhali.jpg',
      alt: 'Pkhali — green walnut and herb vegetable pâtés topped with pomegranate seeds',
      note: 'Cold, to share',
      desc: 'A Georgian appetizer of chopped vegetables and greens combined with ground walnuts, garlic, onion and herbs, topped with pomegranate seeds.',
      descKa: 'ქართული ცივი კერძი დაჭრილი ბოსტნეულისა და მწვანილისგან, დანაყილი ნიგვზით, ნივრით, ხახვითა და სუნელებით; ზემოდან ბროწეულის მარცვლები.',
      tags: ['Vegetarian']
    },
    'lobio': {
      en: 'Beans with Walnuts “Lobio”', ka: 'ლობიო', img: 'lobio.jpg',
      alt: 'Lobio — red bean stew in a clay pot with herbs and onion',
      note: 'In the clay pot',
      desc: 'A Georgian dish of kidney beans cooked with walnuts, coriander and onion, traditionally served in a clay pot.',
      descKa: 'ქართული კერძი — ნიგვზით, ქინძითა და ხახვით მოხარშული ლობიო; ტრადიციულად თიხის ქოთანში მიირთმევა.',
      tags: ['Vegetarian']
    },
    'badrijani': {
      en: 'Eggplant with Walnut', ka: 'ბადრიჯანი ნიგვზით', img: 'badrijani.jpg',
      alt: 'Badrijani — fried eggplant rolls filled with walnut paste, topped with pomegranate',
      note: 'Five pieces',
      desc: 'Fried eggplant rolled around a filling of spiced walnut paste, topped with pomegranate seeds.',
      descKa: 'შემწვარი ბადრიჯანი სანელებლიანი ნიგვზის პასტის გულით, ზემოდან ბროწეულის მარცვლებით.',
      tags: ['Vegetarian']
    },
    'gebzhalia': {
      en: 'Gebzhalia', ka: 'გებჟალია', img: 'gebzhalia.jpg',
      alt: 'Gebzhalia — rolled cheese slices with mint in a milky matsoni sauce, garnished with fresh mint',
      note: 'Cold, from Samegrelo',
      desc: 'A Megrelian dish of fresh cheese kneaded with mint, rolled, sliced and served cool in a milky matsoni sauce.',
      descKa: 'მეგრული კერძი — პიტნით მოზელილი ახალი ყველი, დახვეული და დაჭრილი, ცივად მიირთმევა მაწვნის სოუსში.',
      tags: ['Vegetarian']
    },
    'salad-walnut': {
      en: 'Tomato & Cucumber Salad with Walnuts', img: 'salad.jpg',
      alt: 'Chopped tomato and cucumber salad with herbs',
      note: 'The Georgian table salad',
      desc: 'Tomato and cucumber salad dressed with ground walnut sauce.',
      descKa: 'პომიდვრისა და კიტრის სალათი დანაყილი ნიგვზის საკაზმით.',
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
      desc: 'A salad of boiled potatoes and vegetables with egg and mayonnaise.',
      descKa: 'მოხარშული კარტოფილისა და ბოსტნეულის სალათი კვერცხითა და მაიონეზით.',
      tags: []
    },
    'bazhe': {
      en: 'Walnut Sauce “Bazhe”', ka: 'ბაჟე',
      note: 'For dipping',
      desc: 'A Georgian sauce made from ground walnuts, garlic and spices, served cold with poultry or bread.',
      descKa: 'ქართული საწებელი დანაყილი ნიგვზის, ნივრისა და სუნელებისგან; ცივად მიირთმევა ფრინველთან ან პურთან.',
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
      desc: 'A fresh, lightly salted brined cheese from the Imereti region, used in khachapuri.',
      descKa: 'ახალი, ოდნავ მარილიანი ყველი იმერეთის რეგიონიდან; გამოიყენება ხაჭაპურში.',
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
      desc: 'A Georgian stew of lamb cooked with tarragon, unripe tkemali plums, white wine and herbs.',
      descKa: 'ქართული ჩაშუშული — ბატკნის ხორცი ტარხუნით, მკვახე ტყემლით, თეთრი ღვინითა და მწვანილით.',
      tags: ['House favourite']
    },
    'kharcho': {
      en: 'Kharcho', ka: 'ხარჩო', img: 'kharcho.jpg',
      alt: 'Kharcho — thick reddish-brown Georgian beef soup with cilantro',
      note: 'Beef, walnut, rice',
      desc: 'A Georgian soup of beef, rice and ground walnuts, soured with plum purée and seasoned with herbs and spices.',
      descKa: 'ქართული წვნიანი საქონლის ხორცით, ბრინჯითა და დანაყილი ნიგვზით; ტყემლით მჟავდება და მწვანილითა და სუნელებით იკმაზება.',
      tags: []
    },
    'chashushuli': {
      en: 'Chashushuli',
      note: 'Stewed down',
      desc: 'A spicy Georgian stew of beef braised with tomatoes, onion and peppers.',
      descKa: 'ცხარე ქართული კერძი — პომიდვრით, ხახვითა და წიწაკით ჩაშუშული საქონლის ხორცი.',
      tags: []
    },
    'borscht': {
      en: 'Borscht', img: 'borscht.jpg',
      alt: 'Borscht — deep red beet soup with a swirl of sour cream',
      note: 'With sour cream',
      desc: 'A sour beet soup of Eastern European origin, made with beef and served with sour cream.',
      descKa: 'აღმოსავლეთევროპული წარმოშობის მჟავე ჭარხლის წვნიანი საქონლის ხორცით; არაჟნით მიირთმევა.',
      tags: []
    },

    /* bakery */
    'fruit-cake': {
      en: 'Fruit Cake',
      note: 'From the counter',
      desc: 'From the bakery case at the front — the selection changes through the day.',
      descKa: 'წინა საკონდიტრო ვიტრინიდან — არჩევანი დღის განმავლობაში იცვლება.',
      tags: []
    },
    'ideal': {
      en: '“Ideal” Cake',
      note: 'The house cake',
      desc: 'The house layer cake, from the bakery counter.',
      descKa: 'სახლის ფენოვანი ტორტი, საკონდიტრო ვიტრინიდან.',
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
      en: 'Georgian Lemonade — Tarragon', img: 'natakhtari.jpg',
      alt: 'Bottles of Natakhtari Georgian soda — tarragon, cream, berberis and pear',
      note: 'Bright green',
      desc: 'A carbonated Georgian soft drink flavored with tarragon extract, green in color.',
      descKa: 'გაზიანი ქართული გამაგრილებელი სასმელი ტარხუნის ექსტრაქტით, მწვანე ფერის.',
      tags: []
    },
    'lemonade-pear': {
      en: 'Georgian Lemonade — Pear', img: 'natakhtari.jpg',
      alt: 'Bottles of Natakhtari Georgian soda — tarragon, cream, berberis and pear',
      note: 'Natakhtari',
      desc: 'A pear-flavored Georgian lemonade produced by Natakhtari.',
      descKa: 'მსხლის გემოს ქართული ლიმონათი, „ნატახტარის" წარმოებული.',
      tags: []
    },
    'borjomi': {
      en: 'Borjomi', img: 'mineral-water.jpg',
      alt: 'Bottles of Georgian mineral water — Borjomi, Nabeglavi and Likani',
      note: 'From the gorge',
      desc: 'A naturally carbonated mineral water from the Borjomi Gorge in central Georgia, bottled since 1890.',
      descKa: 'ბუნებრივად გაზიანი მინერალური წყალი ცენტრალური საქართველოს ბორჯომის ხეობიდან; ჩამოისხმება 1890 წლიდან.',
      tags: []
    },
    'nabeglavi': {
      en: 'Nabeglavi', img: 'mineral-water.jpg',
      alt: 'Bottles of Georgian mineral water — Borjomi, Nabeglavi and Likani',
      note: 'Mineral water',
      desc: 'A Georgian mineral water bottled in the village of Nabeghlavi in the Guria region.',
      descKa: 'ქართული მინერალური წყალი, გურიის სოფელ ნაბეღლავში ჩამოსხმული.',
      tags: []
    },
    'compote': {
      en: 'Georgian Compote', ka: 'კომპოტი', img: 'compote.jpg',
      alt: 'Bottles of Georgian fruit compote — quince, cherry, white cherry, feijoa, plum, peach and pear',
      note: 'By the bottle',
      desc: 'Georgian fruit compote — whole fruit steeped in lightly sweetened water. Flavors rotate: quince, cherry, white cherry, feijoa, plum, peach and pear all pass through.',
      descKa: 'ქართული ხილის კომპოტი — მთლიანი ხილი მსუბუქად დატკბილულ წყალში. გემოები იცვლება: კომში, ალუბალი, თეთრი ბალი, ფეიხოა, ქლიავი, ატამი და მსხალი.',
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
      en: 'Sodas', img: 'sodas.jpg',
      alt: 'A pyramid of soda cans — Pepsi, Sprite, Fanta, Coca-Cola, Coke Zero and Diet Coke',
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
