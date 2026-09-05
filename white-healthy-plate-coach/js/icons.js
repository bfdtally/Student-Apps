/* ==========================================================================
   Healthy Plate Coach — icon library
   Small, hand-drawn-style flat SVG icons for each food item and UI accent.
   All icons share a 64x64 viewBox so they scale cleanly at any size.
   ========================================================================== */

const FOOD_ICONS = {
  // ---------- GRAINS ----------
  bread: `<svg viewBox="0 0 64 64" role="img" aria-label="Slice of whole wheat bread">
    <path d="M8 30c0-12 8-20 24-20s24 8 24 20v16a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V30z" fill="#E8B84B"/>
    <path d="M8 30c0-12 8-20 24-20s24 8 24 20" fill="none" stroke="#B5822C" stroke-width="2.5"/>
    <rect x="12" y="34" width="40" height="14" rx="3" fill="#F6D98A"/>
    <circle cx="24" cy="24" r="2" fill="#B5822C"/>
    <circle cx="34" cy="20" r="2" fill="#B5822C"/>
    <circle cx="42" cy="26" r="2" fill="#B5822C"/>
  </svg>`,
  rice: `<svg viewBox="0 0 64 64" role="img" aria-label="Bowl of brown rice">
    <path d="M10 30h44a2 2 0 0 1 2 2c0 12-10 20-24 20S8 44 8 32a2 2 0 0 1 2-2z" fill="#C99A4A"/>
    <ellipse cx="32" cy="30" rx="22" ry="8" fill="#EFCF8E"/>
    <ellipse cx="24" cy="28" rx="3" ry="1.6" fill="#B5822C"/>
    <ellipse cx="34" cy="26" rx="3" ry="1.6" fill="#B5822C"/>
    <ellipse cx="42" cy="29" rx="3" ry="1.6" fill="#B5822C"/>
  </svg>`,
  oatmeal: `<svg viewBox="0 0 64 64" role="img" aria-label="Bowl of oatmeal">
    <path d="M9 28h46a3 3 0 0 1 3 3.4C56.4 42.6 47 51 32 51S7.6 42.6 6 31.4A3 3 0 0 1 9 28z" fill="#DDBB88"/>
    <ellipse cx="32" cy="28" rx="23" ry="8" fill="#F1E0BC"/>
    <circle cx="24" cy="18" r="4" fill="#E8B84B"/>
    <circle cx="34" cy="14" r="3" fill="#E8B84B"/>
    <circle cx="42" cy="19" r="3.5" fill="#E8B84B"/>
  </svg>`,
  pasta: `<svg viewBox="0 0 64 64" role="img" aria-label="Bowl of whole wheat pasta">
    <path d="M8 30h48a2 2 0 0 1 2 2.2C56.6 43.6 46.4 52 32 52S7.4 43.6 6 32.2A2 2 0 0 1 8 30z" fill="#D9A441"/>
    <ellipse cx="32" cy="30" rx="24" ry="9" fill="#F3D98E"/>
    <path d="M18 28c3-4 3-6 0-9M27 27c3-4 3-6 0-9M36 27c3-4 3-6 0-9M45 28c3-4 3-6 0-9" stroke="#B5822C" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </svg>`,
  tortilla: `<svg viewBox="0 0 64 64" role="img" aria-label="Corn tortilla">
    <circle cx="32" cy="32" r="24" fill="#F3D98E"/>
    <circle cx="32" cy="32" r="24" fill="none" stroke="#D9A441" stroke-width="2.5"/>
    <circle cx="22" cy="26" r="1.6" fill="#B5822C"/>
    <circle cx="34" cy="20" r="1.6" fill="#B5822C"/>
    <circle cx="44" cy="30" r="1.6" fill="#B5822C"/>
    <circle cx="26" cy="40" r="1.6" fill="#B5822C"/>
    <circle cx="40" cy="42" r="1.6" fill="#B5822C"/>
  </svg>`,

  // ---------- VEGETABLES ----------
  broccoli: `<svg viewBox="0 0 64 64" role="img" aria-label="Broccoli">
    <rect x="28" y="38" width="8" height="18" rx="3" fill="#EAD9B8"/>
    <circle cx="24" cy="28" r="11" fill="#3FA796"/>
    <circle cx="38" cy="26" r="12" fill="#37937F"/>
    <circle cx="32" cy="36" r="10" fill="#48B3A0"/>
  </svg>`,
  carrots: `<svg viewBox="0 0 64 64" role="img" aria-label="Carrots">
    <path d="M22 10c4 2 5 7 4 11l-9 30-8-2 8-30c1-4 2-9 5-9z" fill="#EF8B3C"/>
    <path d="M40 8c4 2 5 7 4 11l-9 32-8-2 8-32c1-4 2-9 5-9z" fill="#F2A15B"/>
    <path d="M20 8l4 6M24 6l3 7" stroke="#3FA796" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M38 6l4 6M42 4l3 7" stroke="#3FA796" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  spinach: `<svg viewBox="0 0 64 64" role="img" aria-label="Spinach salad">
    <ellipse cx="32" cy="46" rx="24" ry="8" fill="#DCEFEA"/>
    <path d="M20 40c-6-8-4-18 4-22 2 8 0 14-4 22z" fill="#2F8F72"/>
    <path d="M32 42c-4-10 0-20 8-24 3 10-1 18-8 24z" fill="#3FA796"/>
    <path d="M44 40c4-8 2-16-4-20-2 8 0 14 4 20z" fill="#37937F"/>
  </svg>`,
  peppers: `<svg viewBox="0 0 64 64" role="img" aria-label="Bell peppers">
    <path d="M24 18c-6 2-9 8-8 16 1 10 8 18 14 18s10-8 8-18c-1-5-4-8-7-10" fill="#E8574A"/>
    <path d="M40 20c5 2 8 8 7 15-1 9-7 16-12 16" fill="#F2A15B" opacity="0"/>
    <path d="M22 16c1-3 4-5 7-4-1 3-3 5-7 4z" fill="#3FA796"/>
    <ellipse cx="24" cy="18" rx="3" ry="2" fill="#3FA796"/>
  </svg>`,
  sweetpotato: `<svg viewBox="0 0 64 64" role="img" aria-label="Sweet potato">
    <path d="M12 34c-2-10 8-20 20-18 8 1 12 6 18 4 6-2 10 2 8 8-3 9-14 18-26 16-12-2-18-6-20-10z" fill="#C9612B"/>
    <path d="M18 32c6-6 16-8 24-4" stroke="#E8874F" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`,

  // ---------- FRUITS ----------
  apple: `<svg viewBox="0 0 64 64" role="img" aria-label="Apple">
    <path d="M32 24c6-6 16-4 18 4 3 12-6 26-18 26S8 40 11 28c2-8 12-10 18-4z" fill="#E8574A"/>
    <path d="M31 22c0-4 2-7 6-8" stroke="#7A4A2B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M34 15c3-2 6-1 7 2-3 1-6 0-7-2z" fill="#3FA796"/>
  </svg>`,
  banana: `<svg viewBox="0 0 64 64" role="img" aria-label="Banana">
    <path d="M14 20c-4 14 2 30 18 34 12 3 22-2 24-10-8 3-16 1-20-4 8 0 13-5 13-11-6 6-14 7-20 3 6-1 10-6 9-12-4 8-14 12-24 0z" fill="#F4CE4A"/>
    <path d="M14 20c1-3 3-5 5-5" stroke="#B5822C" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,
  orange: `<svg viewBox="0 0 64 64" role="img" aria-label="Orange">
    <circle cx="32" cy="34" r="20" fill="#EF8B3C"/>
    <path d="M32 14c3-3 7-4 9-2-2 3-6 4-9 2z" fill="#3FA796"/>
    <circle cx="32" cy="34" r="20" fill="none" stroke="#D9722A" stroke-width="1.5"/>
  </svg>`,
  strawberries: `<svg viewBox="0 0 64 64" role="img" aria-label="Strawberries">
    <path d="M24 22c-8 2-13 10-11 20 2 9 9 14 13 14s11-5 13-14c2-10-3-18-11-20z" fill="#E8574A"/>
    <circle cx="20" cy="34" r="1.4" fill="#FBE8C8"/>
    <circle cx="26" cy="40" r="1.4" fill="#FBE8C8"/>
    <circle cx="30" cy="30" r="1.4" fill="#FBE8C8"/>
    <circle cx="34" cy="42" r="1.4" fill="#FBE8C8"/>
    <path d="M22 22l3-6 3 4 4-5 2 5 3-4 3 6" fill="#3FA796"/>
  </svg>`,
  melon: `<svg viewBox="0 0 64 64" role="img" aria-label="Mixed melon">
    <path d="M10 40a22 14 0 0 1 44 0z" fill="#DCEFEA"/>
    <path d="M10 40a22 14 0 0 0 44 0" fill="#F2A15B"/>
    <path d="M10 40h44" stroke="#3FA796" stroke-width="3"/>
    <circle cx="24" cy="38" r="1.4" fill="#7A4A2B"/>
    <circle cx="32" cy="41" r="1.4" fill="#7A4A2B"/>
    <circle cx="40" cy="38" r="1.4" fill="#7A4A2B"/>
  </svg>`,

  // ---------- PROTEIN ----------
  chicken: `<svg viewBox="0 0 64 64" role="img" aria-label="Grilled chicken">
    <path d="M22 14c10-4 20 2 20 12 0 8-6 12-6 20 0 6-6 10-10 6-3-3-1-8 1-12-6-2-10-8-9-16 1-5 2-8 4-10z" fill="#D9A441"/>
    <path d="M20 44c-2 4-6 8-4 12 2 3 6 1 7-2" fill="#D9A441"/>
    <path d="M22 24l16 4M23 30l14 4" stroke="#8B5E20" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  beans: `<svg viewBox="0 0 64 64" role="img" aria-label="Black beans">
    <path d="M8 30h48a2 2 0 0 1 2 2.2C56.6 43.6 46.4 52 32 52S7.4 43.6 6 32.2A2 2 0 0 1 8 30z" fill="#8B5E3C"/>
    <ellipse cx="32" cy="30" rx="24" ry="8" fill="#C89B77"/>
    <ellipse cx="22" cy="29" rx="3.5" ry="2.4" fill="#3A2A1D"/>
    <ellipse cx="32" cy="26" rx="3.5" ry="2.4" fill="#3A2A1D"/>
    <ellipse cx="42" cy="30" rx="3.5" ry="2.4" fill="#3A2A1D"/>
  </svg>`,
  eggs: `<svg viewBox="0 0 64 64" role="img" aria-label="Scrambled eggs">
    <ellipse cx="32" cy="40" rx="24" ry="10" fill="#F6EADB"/>
    <path d="M20 38a8 6 0 1 1 10 4 7 5 0 0 1 8-2 6 4 0 1 1 8 3" fill="#F4CE4A"/>
  </svg>`,
  salmon: `<svg viewBox="0 0 64 64" role="img" aria-label="Baked salmon">
    <path d="M8 32c8-10 20-14 32-10 8 3 14 8 16 10-2 2-8 7-16 10-12 4-24 0-32-10z" fill="#E8875C"/>
    <path d="M50 32l8-8-2 8 2 8z" fill="#D9722A"/>
    <path d="M18 26c4 2 7 5 8 8m-8 6c4-1 7-4 8-6" stroke="#C9612B" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,
  peanutbutter: `<svg viewBox="0 0 64 64" role="img" aria-label="Peanut butter">
    <rect x="16" y="20" width="32" height="34" rx="6" fill="#E9F4F8"/>
    <rect x="20" y="26" width="24" height="24" rx="4" fill="#B5822C"/>
    <rect x="20" y="12" width="24" height="10" rx="3" fill="#9BB8C4"/>
  </svg>`,

  // ---------- DAIRY ----------
  milk: `<svg viewBox="0 0 64 64" role="img" aria-label="Glass of milk">
    <path d="M20 44c0-14 24-14 24 0v10a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V44z" fill="#EAF6FB"/>
    <path d="M20 44c0-14 24-14 24 0" fill="none" stroke="#4E8FBF" stroke-width="2"/>
    <rect x="20" y="42" width="24" height="8" fill="#4E8FBF" opacity="0.85"/>
  </svg>`,
  yogurt: `<svg viewBox="0 0 64 64" role="img" aria-label="Yogurt cup">
    <path d="M22 20h20l-3 30a5 5 0 0 1-5 4.5h-4A5 5 0 0 1 25 50z" fill="#EAF6FB"/>
    <path d="M22 20h20l-1 8H23z" fill="#4E8FBF"/>
    <path d="M27 42c3 3 7 3 10 0" stroke="#E8574A" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </svg>`,
  cheese: `<svg viewBox="0 0 64 64" role="img" aria-label="Cheese slice">
    <path d="M8 46l24-28 24 28z" fill="#F4CE4A"/>
    <circle cx="30" cy="40" r="2" fill="#D9A441"/>
    <circle cx="38" cy="34" r="1.6" fill="#D9A441"/>
    <circle cx="24" cy="34" r="1.6" fill="#D9A441"/>
  </svg>`,
  stringcheese: `<svg viewBox="0 0 64 64" role="img" aria-label="String cheese">
    <rect x="24" y="10" width="16" height="42" rx="8" fill="#F6E29A"/>
    <path d="M28 14v34M32 12v40M36 14v34" stroke="#D9A441" stroke-width="1.6"/>
  </svg>`,
  soymilk: `<svg viewBox="0 0 64 64" role="img" aria-label="Fortified soy milk">
    <path d="M22 14h20l3 6-3 6 3 24a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4l3-24-3-6z" fill="#EAF6FB"/>
    <rect x="20" y="30" width="24" height="10" fill="#3FA796"/>
  </svg>`,
};

/* Decorative / UI icons */
const UI_ICONS = {
  plate: `<svg viewBox="0 0 200 200" role="img" aria-label="Empty plate">
    <circle cx="100" cy="100" r="94" fill="#FFFFFF" stroke="#CFE7F3" stroke-width="4"/>
    <circle cx="100" cy="100" r="70" fill="none" stroke="#CFE7F3" stroke-width="3" stroke-dasharray="2 8"/>
  </svg>`,
  check: `<svg viewBox="0 0 24 24" role="img" aria-label="Complete"><path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8L6 21l1.7-7L2.3 9.2l7.1-.6z" fill="currentColor"/></svg>`,
};

function renderFoodIcon(itemId) {
  return FOOD_ICONS[itemId] || '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#ccc"/></svg>';
}
