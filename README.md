# Imereti — Georgian Tradition

Static site for Imereti, a Georgian restaurant and bakery at 1001 Brighton Beach Ave,
Brooklyn. No build step, no dependencies.

```
index.html    markup + JSON-LD structured data
styles.css    all styling (mobile-first)
script.js     nav, reveals, menu tabs, open/closed status
images/       8 food photographs (1.8 MB total)
```

Deploy: drop at the repo root, enable GitHub Pages. Nothing to compile.

---

## Design

**The palette is bourbon, and that turns out to be the honest choice.** Georgia has
been making wine for eight thousand years in buried clay qvevri, and its signature
qvevri-fermented white is literally called *amber wine*. So amber, aged oak and copper
read as authentically Georgian rather than as an imported American whiskey look. The
story section says so out loud.

It is tuned dark and muted rather than bright: near-black browns for the ground
(`#0F0A06` → `#33261A`), a **light brown** rather than a saturated amber for the accent
(`#C0965F`), and a genuine warm **creme** for the paper (`#EFE5D2` / `#E5D8C0`) instead
of near-white. Cards sit a step lighter than their section (`#F7F1E4`) so they separate
without a hard white edge. Accent colours were checked for contrast on the creme grounds
— the small uppercase copper (`#7E5E3D`) clears 5:1 on creme, so the eyebrow labels stay
legible.

**Typography**
- Display — **Fraunces**. Warm, old-style, slightly oily. Carries the aged-oak feeling.
- Body — **Karla**.
- Georgian — **Noto Serif Georgian**, letterspaced and set in copper/amber.

Google Fonts serves exactly three families with Georgian coverage: Noto Sans Georgian,
Noto Serif Georgian, and Google Sans. Noto Serif Georgian is the only serif among them.
There is no warm display serif in Georgian on Google Fonts, so Georgian is used as a
short decorative accent — dish names, section marks — where letterspacing and colour do
the work the letterforms can't. If a genuinely characterful Georgian display face is
ever wanted, the BPG collection is the Georgian-design standard, but its licences are
inconsistent and each font must be checked individually before shipping.

**Ornament** — the mark is a **borjgali**, the pre-Christian Georgian sun symbol: seven
wings turning, meaning the flow of time and eternity. It's drawn as a fine outline in the
hero rather than filled, because a solid fill over a photograph collapses into a muddy
blob and fights the wordmark.

---

## Mobile

Built mobile-first. Breakpoints at 600 / 900 / 1200px.

- Sticky bottom bar with **Order Online** as the centre, amber, largest target
- Full-screen drawer nav with staggered reveal
- 44px minimum tap targets
- Horizontally scrollable menu tabs; the active tab auto-centres
- Verified **zero horizontal overflow at 360 / 430 / 820px**
- Images carry explicit width/height and aspect-ratio, so no layout shift
- Hero image preloaded with `fetchpriority="high"`; everything else lazy-loaded
- `prefers-reduced-motion` disables every animation

Photos were resized to 1500px on the long edge and re-encoded at JPEG q82 — 2.56 MB
down to 1.81 MB. Only the hero image loads up front.

---

## Prices

**There are no prices on this site — by decision, not omission.** The menu lists dishes
and descriptions, and the footer of the menu section routes pricing questions to the
phone.

That's the right call here for two reasons. The only pricing data that exists anywhere
online is the restaurant's own DoorDash-powered storefront, and delivery-platform prices
are commonly set above dine-in — so publishing them risked being wrong at the table. And
several Google reviews already describe billing disputes with this restaurant, so wrong
prices on their website would have poured fuel on an existing problem.

If the client later supplies a confirmed dine-in price list, prices slot back in easily:
each menu item is a `<li>` containing a `<b>` name and a `<p>` description, so a price
element drops in beside the name.

One thing to know: the JSON-LD block still carries `"priceRange": "$10-20"`. That is
schema.org business metadata — the same coarse band Google already publishes on their
listing, equivalent to a "$$" symbol — not a menu price, and it is never rendered to a
visitor. It helps local SEO. Say the word if you'd rather it went.

**Section placement inferred for 12 items.** The storefront's category lists are
virtualised and only partly readable, so these came from the Featured carousel with
confirmed prices but no confirmed section: khinkali, lula kebab, both mtsvadi, fkhlovana,
khachapuri shampurze, penovani, guruli, lobio, eggplants, baby potatoes, assorted pkhali.
They're placed where they belong culinarily. Worth a glance from the client.

**Their spelling was corrected.** The ordering menu has "borgomi", "baby potates",
"olivie" and "borshi"; the site says Borjomi, Baby Potatoes, Olivier and Borscht.

---

## Georgian script

Every Georgian word on the site was verified against English **and** Georgian Wikipedia
plus Wiktionary, cross-checked through the Wikipedia langlinks API so the Georgian
article title itself confirms the spelling. Words that could not be confirmed to that
standard were left in English only — fkhlovana, kuchmachi, chashushuli, lobiani and
tabaka appear without Georgian for exactly that reason.

Traps that were specifically avoided, in case anyone edits this later:

- **კუდი is "tail," not "hat."** The khinkali knot is კუდი (k'udi, tail). Much English
  food writing prints "kudi (hat)" — that's ქუდი, a different word. The site says tail.
- **თამადა, not ტამადა** — aspirated თ, not ejective ტ.
- **ფხალი** is used for the walnut-paste dish, which is standard usage even though
  Georgian Wikipedia titles the article მხალი (that article describes boiled greens as
  an ingredient, not the appetizer).
- **შქმერული**, named for the Racha village Shkmeri — not ჩქმერული.

If the client has a Georgian speaker on hand, the one thing worth a 30-second check is
the footer's **გმადლობთ** (formal "thank you") — it's correct, but it's the only
customer-facing phrase rather than a dish name.

---

## Dish detail modals

Every menu item (42 of them) and the three signature cards open a detail view on
click/tap: banner photo, Georgian name in Noto Serif Georgian, a note line, description,
tags, and **Order Online + Call to Order** buttons. On phones it presents as a
bottom sheet; on desktop as a centred dialog.

- Dish data lives in one `DISHES` object at the top of the dish-details section of
  `script.js` — name, Georgian spelling (verified set only; do not add Georgian without
  checking it), description, image, tags. Edit there, nothing else.
- Dishes without a verified photo get an animated borjgali ornament banner instead —
  deliberately, because a wrong photo is worse than none.
- Banner images load on demand (first open), so they cost nothing on page load.
- Accessible: real `<button>` wrappers, `role="dialog"`, focus trap, Esc closes, focus
  returns to the opener, `prefers-reduced-motion` respected.

## Photos — placeholders

All are free-licence stock, each visually verified to be the correct dish (Turkish pide
gets mistaken for acharuli khachapuri constantly; those candidates were rejected — as
were mislabeled kharcho and badrijani shots). **Swap in the client's real photos by
overwriting the file — keep the same filename** and nothing else needs touching.

No attribution needed (Pexels): khinkali, acharuli-khachapuri, imeruli-khachapuri,
mtsvadi, supra, pkhali, churchkhela, borscht, salad, cake, wine.

**Attribution required (Wikimedia Commons — credit line is in the footer; keep it in
sync if any of these are replaced, and remove it entirely once all seven are):**

| File | Author | Licence |
|---|---|---|
| lobio.jpg | Georgian Recipes at Georgia About | CC BY 3.0 |
| chakapuli.jpg | Georgian Recipes at Georgia About | CC BY 3.0 |
| mchadi.jpg | Georgian Recipes at Georgia About | CC BY 3.0 |
| kharcho.jpg | EugSan | CC BY-SA 4.0 |
| shkmeruli.jpg | Francesc Fort | CC BY-SA 4.0 |
| tabaka.jpg | Pannet | CC BY-SA 4.0 |
| badrijani.jpg | salvagekat | CC BY-SA 2.0 |
| lobiani.jpg | Sandra C | CC BY-SA 2.0 |

Weakest images, replace-first: **lobio.jpg** (flash-lit amateur shot — Pexels has no
genuine lobio; their clay-pot shots show no beans and could equally be kharcho) and
**lobiani.jpg** (authentic, restaurant-labeled, but pale — reads as generic filled bread
at a glance). `cake.jpg` (a medovik) is on disk but deliberately unused: putting a honey
cake photo on "Fruit Cake" or "Tartaletka" would be the wrong dish; it's there for
whenever the client confirms medovik on the menu. No photo exists for kupati anywhere at
usable size — it gets the ornament fallback.

---

## Worth raising with the client

Turned up while researching. None of it is on the site, but the agency should know.

1. **An undisclosed automatic 10% gratuity** is described by two unrelated reviewers, one
   saying it applied to parties of two and was neither mentioned nor posted. In NYC,
   mandatory service charges have to be disclosed. This is a legal exposure, not just a
   review problem.
2. **Their Facebook page is set to "Always open,"** and that is propagating to Yelp,
   Yahoo Local and MapQuest, all of which claim the restaurant is open 24 hours. Google's
   AI Overview repeats it. Real hours are 9am–10pm daily. Fixing the Facebook setting
   should clear most of it.
3. **No website on the Google Business Profile** — the panel is actively showing an "Add
   website" prompt. Adding this once live is probably the single highest-value SEO action
   available to them.
4. **No link in the Instagram bio** (@imereti.restaurant, 27 posts).
5. **Service, not food, is the review problem.** Nearly every critical reviewer praises
   the cooking and criticises the service — slow, dismissive, disorganised order of
   dishes. The food ratings are genuinely strong. Not a website issue, but it's the thing
   holding a 4.5 back from higher.

---

## Ordering

The Order Online buttons point to `https://order.online/store/-34135905/` — the
restaurant's own DoorDash-powered storefront, marked "No fee". Google's ordering picker
lists only DoorDash destinations for this business; there is no Toast, ChowNow, Slice,
Clover, Grubhub or UberEats integration.

Online ordering closes around 9:10pm, earlier than the 10pm dining room; the Visit
section says so.
