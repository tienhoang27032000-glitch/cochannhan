(function (global) {
"use strict";
function _buildShapeMarkup(sp) {
const {shape,c1,c2,c3,glow,accent}=sp;
switch (shape) {
case "cicada":
return `
<g>
  <ellipse cx="32" cy="34" rx="22" ry="18" fill="url(#aura)"/>
  <path d="M30 24 C16 14 6 22 10 38 C13 46 24 44 30 34 Z" fill="url(#wing)" stroke="${accent}" stroke-width="1.2"/>
  <path d="M34 24 C48 14 58 22 54 38 C51 46 40 44 34 34 Z" fill="url(#wing)" stroke="${accent}" stroke-width="1.2"/>
  <path d="M26 27 Q16 26 12 35 M26 31 Q18 33 14 39 M38 27 Q48 26 52 35 M38 31 Q46 33 50 39" stroke="${glow}" stroke-width="0.9" fill="none" opacity="0.8"/>
  <ellipse cx="32" cy="35" rx="7.5" ry="15" fill="url(#body)" stroke="${c3}" stroke-width="1.2"/>
  <path d="M25.5 31 Q32 34 38.5 31 M25.5 36 Q32 39 38.5 36 M26.5 41 Q32 43.5 37.5 41" stroke="${c3}" stroke-width="1.1" fill="none"/>
  <ellipse cx="32" cy="21" rx="6.5" ry="5" fill="url(#body)" stroke="${accent}" stroke-width="1"/>
  <circle cx="26.5" cy="20" r="2.4" fill="#ff9f43" stroke="${glow}" stroke-width="0.7"/>
  <circle cx="37.5" cy="20" r="2.4" fill="#ff9f43" stroke="${glow}" stroke-width="0.7"/>
  <path d="M29 17 Q24 10 19 11 M35 17 Q40 10 45 11" stroke="${accent}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <ellipse cx="30" cy="27" rx="2" ry="4" fill="#fff" opacity="0.45"/>
</g>`;

case "butterfly":
return `
<g>
  <ellipse cx="32" cy="32" rx="25" ry="20" fill="url(#aura)"/>
  <path d="M31 30 C21 12 6 14 9 30 C11 37 22 36 31 32 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M33 30 C43 12 58 14 55 30 C53 37 42 36 33 32 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M31 33 C20 35 12 48 21 51 C27 52 30 43 31 33 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1.1"/>
  <path d="M33 33 C44 35 52 48 43 51 C37 52 34 43 33 33 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1.1"/>
  <circle cx="17" cy="25" r="2.6" fill="${glow}" opacity="0.85"/>
  <circle cx="47" cy="25" r="2.6" fill="${glow}" opacity="0.85"/>
  <circle cx="22" cy="43" r="1.8" fill="${accent}" opacity="0.9"/>
  <circle cx="42" cy="43" r="1.8" fill="${accent}" opacity="0.9"/>
  <path d="M29 29 Q19 22 13 24 M35 29 Q45 22 51 24" stroke="#fff" stroke-width="0.9" fill="none" opacity="0.7"/>
  <ellipse cx="32" cy="34" rx="2.6" ry="12" fill="url(#core)" stroke="${c3}" stroke-width="0.9"/>
  <path d="M30.5 22 Q25 13 21 14 M33.5 22 Q39 13 43 14" stroke="${glow}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <circle cx="21" cy="14" r="1.4" fill="${glow}"/><circle cx="43" cy="14" r="1.4" fill="${glow}"/>
</g>`;

case "crescent_beetle":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M42 12 C24 12 13 24 15 39 C17 51 31 56 44 49 C31 48 24 39 26 28 C28 19 34 15 42 12 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.4"/>
  <path d="M38 16 C25 18 19 28 21 38 C23 45 30 48 37 47" stroke="#fff" stroke-width="1.3" fill="none" opacity="0.65"/>
  <circle cx="24" cy="29" r="2.1" fill="${glow}"/><circle cx="23" cy="36" r="1.5" fill="${accent}"/>
  <path d="M40 24 L46 21 L44 28 L50 32 L43 35 L44 42 L38 38" stroke="${glow}" stroke-width="1.2" fill="none" opacity="0.85"/>
  <circle cx="44" cy="31" r="3.2" fill="url(#core)"/>
</g>`;

case "silkworm":
return `
<g>
  <circle cx="32" cy="34" r="23" fill="url(#aura)"/>
  <circle cx="21" cy="42" r="7.5" fill="url(#body)" stroke="${c3}" stroke-width="1.1"/>
  <circle cx="28" cy="43" r="8.5" fill="url(#body)" stroke="${c3}" stroke-width="1.1"/>
  <circle cx="36" cy="40" r="9" fill="url(#body)" stroke="${c3}" stroke-width="1.1"/>
  <circle cx="41" cy="32" r="8.5" fill="url(#body)" stroke="${c3}" stroke-width="1.1"/>
  <circle cx="37" cy="24" r="7.8" fill="url(#body)" stroke="${accent}" stroke-width="1.2"/>
  <circle cx="34.5" cy="23" r="1.5" fill="#2c3e50"/><circle cx="39.5" cy="23" r="1.5" fill="#2c3e50"/>
  <path d="M35 27 Q37 29 39 27" stroke="#e05252" stroke-width="1" fill="none"/>
  <circle cx="20" cy="22" r="3.2" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.9"/>
  <circle cx="15" cy="16" r="2" fill="${glow}" opacity="0.85"/>
  <circle cx="49" cy="19" r="2.6" fill="none" stroke="${accent}" stroke-width="1.1"/>
</g>`;

case "lotus":
return `
<g>
  <circle cx="32" cy="34" r="24" fill="url(#aura)"/>
  <ellipse cx="32" cy="46" rx="22" ry="7" fill="${c3}" stroke="${c2}" stroke-width="1.2"/>
  <path d="M32 44 C16 42 10 30 16 22 C22 28 28 34 32 44 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1.1"/>
  <path d="M32 44 C48 42 54 30 48 22 C42 28 36 34 32 44 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1.1"/>
  <path d="M32 44 C20 36 18 22 24 15 C28 22 31 31 32 44 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M32 44 C44 36 46 22 40 15 C36 22 33 31 32 44 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M32 10 C25 22 26 36 32 44 C38 36 39 22 32 10 Z" fill="url(#core)" stroke="#fff" stroke-width="1.3"/>
  <circle cx="32" cy="27" r="3.5" fill="${accent}"/>
  <circle cx="27" cy="31" r="1.4" fill="${glow}"/><circle cx="37" cy="31" r="1.4" fill="${glow}"/>
</g>`;

case "ear_grass":
return `
<g>
  <circle cx="32" cy="34" r="23" fill="url(#aura)"/>
  <path d="M32 54 Q18 38 14 18 Q24 30 30 48 Z" fill="url(#wing)" stroke="${accent}" stroke-width="1"/>
  <path d="M32 54 Q46 38 50 18 Q40 30 34 48 Z" fill="url(#wing)" stroke="${accent}" stroke-width="1"/>
  <path d="M32 54 Q26 34 22 24 Q28 34 32 48 Q36 34 42 24 Q38 34 32 54 Z" fill="${c2}"/>
  <path d="M27 22 C20 22 19 36 27 42 C34 46 42 40 42 31 C42 21 34 16 27 22 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.3"/>
  <path d="M29 26 C26 28 26 36 31 38 C35 39 37 34 35 30" stroke="${c3}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M46 24 Q52 31 46 38 M50 20 Q58 31 50 42" stroke="${accent}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.85"/>
</g>`;

case "boar_beetle":
return `
<g>
  <circle cx="32" cy="34" r="23" fill="url(#aura)"/>
  <path d="M18 32 Q10 26 12 18 M46 32 Q54 26 52 18 M16 40 Q10 44 13 50 M48 40 Q54 44 51 50" stroke="${c3}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <ellipse cx="32" cy="36" rx="14" ry="15" fill="url(#body)" stroke="${accent}" stroke-width="1.4"/>
  <line x1="32" y1="26" x2="32" y2="51" stroke="${c3}" stroke-width="1.4"/>
  <ellipse cx="32" cy="24" rx="11" ry="8" fill="url(#body)" stroke="${accent}" stroke-width="1.3"/>
  <path d="M23 21 Q15 14 21 9 Q24 14 27 18 Z" fill="${accent}" stroke="#fff" stroke-width="0.9"/>
  <path d="M41 21 Q49 14 43 9 Q40 14 37 18 Z" fill="${accent}" stroke="#fff" stroke-width="0.9"/>
  <circle cx="27" cy="23" r="2" fill="${glow}"/><circle cx="37" cy="23" r="2" fill="${glow}"/>
  <path d="M24 35 L32 32 L40 35" stroke="${glow}" stroke-width="1.1" fill="none" opacity="0.6"/>
</g>`;

case "rhino_beetle":
return `
<g>
  <circle cx="32" cy="34" r="24" fill="url(#aura)"/>
  <path d="M18 34 L10 30 L12 38 M46 34 L54 30 L52 38 M20 44 L12 48 M44 44 L52 48" stroke="${c3}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M32 25 L26 11 L30 14 L32 6 L34 14 L38 11 Z" fill="url(#core)" stroke="${glow}" stroke-width="1.2"/>
  <ellipse cx="32" cy="37" rx="15" ry="15" fill="url(#body)" stroke="${glow}" stroke-width="1.4"/>
  <path d="M19 32 Q32 25 45 32" stroke="${accent}" stroke-width="2" fill="none"/>
  <line x1="32" y1="29" x2="32" y2="52" stroke="${c3}" stroke-width="1.5"/>
  <circle cx="26" cy="25" r="2.2" fill="${glow}"/><circle cx="38" cy="25" r="2.2" fill="${glow}"/>
  <path d="M23 39 Q27 44 30 46 M41 39 Q37 44 34 46" stroke="${glow}" stroke-width="1.2" fill="none" opacity="0.7"/>
</g>`;

case "armor_scarab":
return `
<g>
  <circle cx="32" cy="33" r="24" fill="url(#aura)"/>
  <path d="M32 10 L50 18 L48 39 C46 49 32 55 32 55 C32 55 18 49 16 39 L14 18 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.6"/>
  <path d="M32 15 L45 21 L43 38 C42 45 32 50 32 50 C32 50 22 45 21 38 L19 21 Z" fill="url(#wing)" stroke="${accent}" stroke-width="1.1"/>
  <line x1="32" y1="15" x2="32" y2="50" stroke="${glow}" stroke-width="1.3" opacity="0.8"/>
  <path d="M21 28 L32 34 L43 28" stroke="${glow}" stroke-width="1.3" fill="none" opacity="0.8"/>
  <circle cx="32" cy="32" r="4.5" fill="url(#core)" stroke="${c3}" stroke-width="1"/>
  <circle cx="25" cy="21" r="1.6" fill="${glow}"/><circle cx="39" cy="21" r="1.6" fill="${glow}"/>
</g>`;

case "bell_beetle":
return `
<g>
  <circle cx="32" cy="34" r="24" fill="url(#aura)"/>
  <circle cx="32" cy="14" r="4.5" fill="none" stroke="${accent}" stroke-width="2.4"/>
  <path d="M22 20 C22 14 42 14 42 20 L48 44 L16 44 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.5"/>
  <ellipse cx="32" cy="44" rx="16" ry="5" fill="url(#wing)" stroke="${glow}" stroke-width="1.4"/>
  <circle cx="32" cy="48" r="4" fill="${glow}" stroke="${c3}" stroke-width="1"/>
  <path d="M21 34 Q32 38 43 34 M23 26 Q32 29 41 26" stroke="${c3}" stroke-width="1.4" fill="none"/>
  <path d="M12 36 Q8 42 12 48 M52 36 Q56 42 52 48" stroke="${accent}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</g>`;

case "dragonfly_blade":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M30 26 C18 14 6 16 8 24 C10 30 22 30 30 29 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M34 26 C46 14 58 16 56 24 C54 30 42 30 34 29 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M30 31 C16 30 10 38 14 43 C18 46 26 40 30 34 Z" fill="url(#wing)" stroke="${accent}" stroke-width="1"/>
  <path d="M34 31 C48 30 54 38 50 43 C46 46 38 40 34 34 Z" fill="url(#wing)" stroke="${accent}" stroke-width="1"/>
  <path d="M32 10 L36 22 L34 52 L32 56 L30 52 L28 22 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.2"/>
  <circle cx="29" cy="18" r="2" fill="${glow}"/><circle cx="35" cy="18" r="2" fill="${glow}"/>
  <line x1="32" y1="12" x2="32" y2="52" stroke="#fff" stroke-width="1" opacity="0.7"/>
</g>`;

case "wind_wheel":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M32 10 C44 10 52 20 46 28 C44 20 38 16 32 18 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.1"/>
  <path d="M54 32 C54 44 44 52 36 46 C44 44 48 38 46 32 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.1"/>
  <path d="M32 54 C20 54 12 44 18 36 C20 44 26 48 32 46 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.1"/>
  <path d="M10 32 C10 20 20 12 28 18 C20 20 16 26 18 32 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.1"/>
  <circle cx="32" cy="32" r="11" fill="url(#wing)" stroke="${accent}" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="5" fill="url(#core)"/>
</g>`;

case "flame_moth":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M32 8 C24 18 10 18 12 34 C14 44 24 46 32 52 C40 46 50 44 52 34 C54 18 40 18 32 8 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.3"/>
  <path d="M32 16 C26 24 19 26 21 36 C23 42 29 44 32 48 C35 44 41 42 43 36 C45 26 38 24 32 16 Z" fill="url(#core)" opacity="0.9"/>
  <ellipse cx="32" cy="35" rx="4.5" ry="10" fill="${c3}" stroke="${accent}" stroke-width="1"/>
  <circle cx="30" cy="27" r="1.6" fill="#fff"/><circle cx="34" cy="27" r="1.6" fill="#fff"/>
  <path d="M29 22 Q24 13 20 15 M35 22 Q40 13 44 15" stroke="${glow}" stroke-width="1.2" fill="none"/>
</g>`;

case "fire_dragon":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M46 46 C54 36 48 20 34 18 C20 16 12 28 18 40 C22 48 34 50 40 42 C44 36 40 28 32 28 C26 28 24 34 28 38" stroke="url(#body)" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M46 46 C54 36 48 20 34 18 C20 16 12 28 18 40 C22 48 34 50 40 42" stroke="${glow}" stroke-width="1.4" fill="none" stroke-dasharray="4 3"/>
  <path d="M36 14 L43 9 L40 17 L48 16 L41 22 L33 21 Z" fill="url(#core)" stroke="${c3}" stroke-width="1"/>
  <circle cx="38" cy="18" r="1.8" fill="#ff3b30"/>
  <path d="M18 16 L23 19 M12 28 L17 29 M18 46 L23 43 M46 48 L43 44" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>
</g>`;

case "phoenix_moth":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M31 30 C16 12 6 18 10 34 C14 40 24 38 31 34 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M33 30 C48 12 58 18 54 34 C50 40 40 38 33 34 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M32 36 Q24 46 20 56 M32 36 Q32 48 32 58 M32 36 Q40 46 44 56" stroke="${accent}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="20" cy="56" r="2.2" fill="${glow}"/><circle cx="32" cy="58" r="2.5" fill="${glow}"/><circle cx="44" cy="56" r="2.2" fill="${glow}"/>
  <path d="M32 14 L36 22 L32 38 L28 22 Z" fill="url(#core)" stroke="${c3}" stroke-width="1"/>
  <path d="M32 14 L27 8 M32 14 L32 6 M32 14 L37 8" stroke="${glow}" stroke-width="1.4" stroke-linecap="round"/>
</g>`;

case "frost_cicada":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M32 10 L40 24 L54 24 L43 35 L48 50 L32 42 L16 50 L21 35 L10 24 L24 24 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1.2" opacity="0.85"/>
  <ellipse cx="32" cy="34" rx="7" ry="14" fill="url(#body)" stroke="#fff" stroke-width="1.2"/>
  <circle cx="29" cy="23" r="1.8" fill="#fff"/><circle cx="35" cy="23" r="1.8" fill="#fff"/>
  <path d="M32 20 L32 48 M26 30 L38 30 M26 38 L38 38" stroke="#fff" stroke-width="1" opacity="0.7"/>
</g>`;

case "snowflake_moth":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <g stroke="${glow}" stroke-width="2" stroke-linecap="round">
    <line x1="32" y1="9" x2="32" y2="55"/><line x1="12" y1="21" x2="52" y2="43"/><line x1="52" y1="21" x2="12" y2="43"/>
  </g>
  <polygon points="32,14 44,25 44,39 32,50 20,39 20,25" fill="url(#body)" stroke="#fff" stroke-width="1.4" opacity="0.9"/>
  <polygon points="32,21 39,28 39,36 32,43 25,36 25,28" fill="url(#core)" stroke="${accent}" stroke-width="1.1"/>
  <circle cx="32" cy="32" r="3.5" fill="#fff"/>
</g>`;

case "thunder_scarab":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M16 14 L24 24 L18 26 L26 36 M48 14 L40 24 L46 26 L38 36" stroke="${glow}" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
  <ellipse cx="32" cy="34" rx="13" ry="15" fill="url(#body)" stroke="${glow}" stroke-width="1.4"/>
  <path d="M33 21 L26 34 L32 34 L29 47 L40 31 L34 31 Z" fill="${glow}" stroke="${c3}" stroke-width="0.9"/>
  <circle cx="27" cy="23" r="2" fill="${accent}"/><circle cx="37" cy="23" r="2" fill="${accent}"/>
</g>`;

case "thunder_wing":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M30 30 L8 16 L16 28 L10 34 L22 36 L16 44 L30 38 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M34 30 L56 16 L48 28 L54 34 L42 36 L48 44 L34 38 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M32 14 L37 32 L32 50 L27 32 Z" fill="url(#core)" stroke="#fff" stroke-width="1.3"/>
  <circle cx="32" cy="26" r="2.6" fill="${accent}"/>
</g>`;

case "thunder_drum":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <circle cx="32" cy="32" r="17" fill="url(#body)" stroke="${accent}" stroke-width="2.2"/>
  <circle cx="32" cy="32" r="12" fill="url(#wing)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M34 19 L25 33 L32 33 L28 45 L40 30 L33 30 Z" fill="${accent}" stroke="#fff" stroke-width="0.9"/>
  <path d="M32 6 L34 12 L30 12 Z M32 58 L34 52 L30 52 Z M6 32 L12 30 L12 34 Z M58 32 L52 30 L52 34 Z" fill="${glow}"/>
</g>`;

case "scorpion":
return `
<g>
  <circle cx="32" cy="34" r="24" fill="url(#aura)"/>
  <path d="M26 28 C14 24 10 14 18 12 C21 15 20 20 25 22" fill="url(#body)" stroke="${glow}" stroke-width="1.3"/>
  <path d="M38 28 C50 24 54 14 46 12 C43 15 44 20 39 22" fill="url(#body)" stroke="${glow}" stroke-width="1.3"/>
  <ellipse cx="32" cy="34" rx="9" ry="12" fill="url(#body)" stroke="${accent}" stroke-width="1.3"/>
  <path d="M24 31 Q32 34 40 31 M24 37 Q32 40 40 37" stroke="${c3}" stroke-width="1.3" fill="none"/>
  <path d="M32 46 C32 54 44 55 46 46 C48 39 42 36 42 30" stroke="url(#wing)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <circle cx="42" cy="27" r="3" fill="${glow}"/>
  <circle cx="29" cy="26" r="1.6" fill="${glow}"/><circle cx="35" cy="26" r="1.6" fill="${glow}"/>
</g>`;

case "poison_grub":
return `
<g>
  <circle cx="32" cy="34" r="24" fill="url(#aura)"/>
  <circle cx="20" cy="20" r="4" fill="${accent}" opacity="0.55"/>
  <circle cx="46" cy="18" r="5" fill="${c2}" opacity="0.5"/>
  <circle cx="48" cy="38" r="3.5" fill="${glow}" opacity="0.6"/>
  <path d="M16 42 C18 28 28 22 36 28 C44 34 46 46 34 49 C24 51 15 48 16 42 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.4"/>
  <path d="M23 30 Q26 39 22 47 M32 27 Q35 37 32 48 M40 33 Q40 41 38 47" stroke="${c3}" stroke-width="1.5" fill="none"/>
  <circle cx="22" cy="37" r="2.2" fill="${glow}"/><circle cx="28" cy="34" r="1.8" fill="${glow}"/>
</g>`;

case "bubble_jelly":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M14 32 C14 16 50 16 50 32 C50 37 42 39 32 39 C22 39 14 37 14 32 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.4"/>
  <path d="M20 26 Q24 20 32 20" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>
  <path d="M21 38 Q18 46 22 54 M28 39 Q27 48 30 56 M36 39 Q37 48 34 56 M43 38 Q46 46 42 54" stroke="${accent}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <circle cx="26" cy="29" r="1.8" fill="#fff"/><circle cx="38" cy="29" r="1.8" fill="#fff"/>
</g>`;

case "water_dart":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M52 14 L26 26 L12 24 L22 34 L18 48 L32 38 L42 46 L38 32 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.3"/>
  <path d="M48 18 L24 40" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
  <circle cx="40" cy="26" r="2.5" fill="${glow}"/>
</g>`;

case "water_dragon":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M12 42 Q22 34 32 42 T52 42" stroke="${accent}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M10 49 Q21 43 32 49 T54 49" stroke="${glow}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.75"/>
  <path d="M20 38 C16 24 26 12 38 16 C48 20 46 34 34 34 C26 34 24 26 30 23" stroke="url(#body)" stroke-width="7.5" fill="none" stroke-linecap="round"/>
  <path d="M36 12 L46 10 L42 18 L48 20 L39 22 Z" fill="url(#core)" stroke="#fff" stroke-width="1"/>
  <circle cx="40" cy="16" r="1.6" fill="#ffd700"/>
</g>`;

case "sword_insect":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M32 30 C18 22 10 26 12 34 C16 39 26 37 32 34 Z" fill="url(#wing)" stroke="${accent}" stroke-width="1.1"/>
  <path d="M32 30 C46 22 54 26 52 34 C48 39 38 37 32 34 Z" fill="url(#wing)" stroke="${accent}" stroke-width="1.1"/>
  <path d="M32 7 L37 18 L35 42 L32 46 L29 42 L27 18 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.3"/>
  <line x1="32" y1="10" x2="32" y2="43" stroke="#fff" stroke-width="1.3" opacity="0.85"/>
  <path d="M22 42 L42 42 L39 46 L25 46 Z" fill="${accent}" stroke="${c3}" stroke-width="1"/>
  <rect x="30" y="46" width="4" height="8" rx="1.5" fill="${c3}"/>
  <circle cx="32" cy="55" r="2.6" fill="${accent}"/>
</g>`;

case "bone_lance":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M32 7 L40 42 L32 54 L24 42 Z" fill="url(#body)" stroke="${c3}" stroke-width="1.3"/>
  <path d="M27 20 L37 25 M25 29 L39 34 M24 38 L40 42" stroke="${c3}" stroke-width="1.8" fill="none"/>
  <circle cx="26" cy="48" r="4.5" fill="url(#body)" stroke="${c3}" stroke-width="1.1"/>
  <circle cx="38" cy="48" r="4.5" fill="url(#body)" stroke="${c3}" stroke-width="1.1"/>
  <line x1="32" y1="9" x2="32" y2="48" stroke="#fff" stroke-width="1.2" opacity="0.7"/>
</g>`;

case "skull_chalice":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M18 28 C18 14 46 14 46 28 C46 37 40 41 38 45 L26 45 C24 41 18 37 18 28 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.4"/>
  <ellipse cx="26" cy="29" rx="3.8" ry="4.5" fill="${c3}"/><ellipse cx="38" cy="29" rx="3.8" ry="4.5" fill="${c3}"/>
  <circle cx="26" cy="29" r="1.6" fill="${glow}"/><circle cx="38" cy="29" r="1.6" fill="${glow}"/>
  <path d="M30 36 L32 33 L34 36 Z" fill="${c3}"/>
  <path d="M26 45 L26 51 L38 51 L38 45 M29 45 L29 51 M32 45 L32 51 M35 45 L35 51" stroke="${c3}" stroke-width="1.3" fill="${c1}"/>
  <path d="M20 18 Q32 10 44 18" stroke="${accent}" stroke-width="2" fill="none"/>
</g>`;

case "blood_drop":
return `
<g>
  <circle cx="32" cy="34" r="24" fill="url(#aura)"/>
  <path d="M32 10 C32 10 48 29 48 39 C48 48 41 54 32 54 C23 54 16 48 16 39 C16 29 32 10 32 10 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.5"/>
  <path d="M24 38 C24 32 28 24 31 19" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.72"/>
  <circle cx="32" cy="39" r="5" fill="url(#core)" opacity="0.9"/>
</g>`;

case "ghost_blossom":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M32 10 C39 18 39 26 32 32 C25 26 25 18 32 10 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1"/>
  <path d="M54 32 C46 39 38 39 32 32 C38 25 46 25 54 32 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1"/>
  <path d="M32 54 C25 46 25 38 32 32 C39 38 39 46 32 54 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1"/>
  <path d="M10 32 C18 25 26 25 32 32 C26 39 18 39 10 32 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1"/>
  <circle cx="32" cy="32" r="12" fill="url(#body)" stroke="${glow}" stroke-width="1.4"/>
  <path d="M26 29 L29 31 L26 32 Z M38 29 L35 31 L38 32 Z" fill="${glow}"/>
  <path d="M27 37 Q32 41 37 37" stroke="${c3}" stroke-width="1.6" fill="none"/>
</g>`;

case "shadow_mantis":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M26 28 L10 18 L14 34 L24 34 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M38 28 L54 18 L50 34 L40 34 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.2"/>
  <path d="M32 14 L40 30 L35 52 L32 56 L29 52 L24 30 Z" fill="url(#wing)" stroke="${accent}" stroke-width="1.2"/>
  <circle cx="29" cy="23" r="2" fill="${glow}"/><circle cx="35" cy="23" r="2" fill="${glow}"/>
  <path d="M28 16 L22 9 M36 16 L42 9" stroke="${glow}" stroke-width="1.2" stroke-linecap="round"/>
</g>`;

case "wolf_spirit":
return `
<g>
  <circle cx="32" cy="33" r="24" fill="url(#aura)"/>
  <path d="M18 14 L26 22 L32 19 L38 22 L46 14 L48 32 L42 46 L32 53 L22 46 L16 32 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.4"/>
  <path d="M21 20 L25 26 M43 20 L39 26" stroke="${c3}" stroke-width="1.4"/>
  <polygon points="23,31 29,33 25,35" fill="${glow}"/>
  <polygon points="41,31 35,33 39,35" fill="${glow}"/>
  <path d="M27 42 L32 45 L37 42 M29 45 L30 49 M35 45 L34 49" stroke="${c3}" stroke-width="1.4" fill="none"/>
  <path d="M26 25 L32 22 L38 25" stroke="${accent}" stroke-width="1.4" fill="none"/>
</g>`;

case "koi_fish":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M16 44 C10 30 22 14 38 16 C48 18 52 28 46 38 C42 44 34 44 28 38 C24 34 26 26 32 26" stroke="url(#body)" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M16 44 L8 48 L12 54 L20 48 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1"/>
  <path d="M36 14 Q42 8 46 16" stroke="${accent}" stroke-width="2" fill="none"/>
  <circle cx="39" cy="20" r="2.2" fill="#1a1a1a"/><circle cx="39.5" cy="19.5" r="0.8" fill="#fff"/>
  <circle cx="24" cy="28" r="2.5" fill="${glow}" opacity="0.85"/>
</g>`;

case "cauldron_gu":
return `
<g>
  <circle cx="32" cy="34" r="24" fill="url(#aura)"/>
  <path d="M22 44 L19 53 M42 44 L45 53 M32 46 L32 54" stroke="${c3}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M16 26 C10 26 10 35 16 35 M48 26 C54 26 54 35 48 35" stroke="${accent}" stroke-width="2.4" fill="none"/>
  <ellipse cx="32" cy="35" rx="16" ry="12" fill="url(#body)" stroke="${glow}" stroke-width="1.4"/>
  <ellipse cx="32" cy="24" rx="13" ry="5" fill="${c3}" stroke="${accent}" stroke-width="1.5"/>
  <path d="M25 22 Q28 10 32 15 Q36 8 39 22 Z" fill="url(#core)"/>
  <path d="M22 36 Q32 41 42 36" stroke="${accent}" stroke-width="1.4" fill="none"/>
</g>`;

case "opera_mask":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M16 20 C16 12 48 12 48 20 L46 38 C45 48 32 54 32 54 C32 54 19 48 18 38 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.5"/>
  <path d="M32 14 L32 53 C32 53 45 48 46 38 L48 20 C48 16 41 14 32 14 Z" fill="url(#wing)" opacity="0.85"/>
  <path d="M21 27 Q25 24 29 28 Q25 31 21 27 Z" fill="${c3}"/><circle cx="25" cy="27.5" r="1.4" fill="${glow}"/>
  <path d="M43 27 Q39 24 35 28 Q39 31 43 27 Z" fill="${c3}"/><circle cx="39" cy="27.5" r="1.4" fill="${accent}"/>
  <path d="M24 41 Q32 46 40 41" stroke="${c3}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M22 18 Q32 23 42 18" stroke="${accent}" stroke-width="1.4" fill="none"/>
</g>`;

case "astrolabe":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <circle cx="32" cy="32" r="20" fill="none" stroke="url(#body)" stroke-width="2.4"/>
  <ellipse cx="32" cy="32" rx="20" ry="8" transform="rotate(35 32 32)" fill="none" stroke="${accent}" stroke-width="1.4"/>
  <ellipse cx="32" cy="32" rx="20" ry="8" transform="rotate(-35 32 32)" fill="none" stroke="${glow}" stroke-width="1.4"/>
  <polygon points="32,16 35,28 47,32 35,36 32,48 29,36 17,32 29,28" fill="url(#core)" stroke="#fff" stroke-width="0.9"/>
  <circle cx="32" cy="32" r="3.5" fill="#fff"/>
</g>`;

case "crystal_spider":
return `
<g>
  <circle cx="32" cy="32" r="25" fill="url(#aura)"/>
  <g stroke="${accent}" stroke-width="1.6" fill="none" stroke-linecap="round">
    <path d="M24 28 L12 18 L9 26"/><path d="M24 33 L10 33 L9 41"/><path d="M25 38 L14 48 L16 54"/>
    <path d="M40 28 L52 18 L55 26"/><path d="M40 33 L54 33 L55 41"/><path d="M39 38 L50 48 L48 54"/>
  </g>
  <polygon points="32,15 43,27 39,45 25,45 21,27" fill="url(#body)" stroke="#fff" stroke-width="1.4"/>
  <polygon points="32,20 38,29 35,40 29,40 26,29" fill="url(#core)"/>
  <circle cx="29" cy="24" r="1.6" fill="#fff"/><circle cx="35" cy="24" r="1.6" fill="#fff"/>
</g>`;

case "taiji_embryo":
return `
<g>
  <circle cx="32" cy="32" r="25" fill="url(#aura)"/>
  <path d="M32 8 C46 14 52 28 46 44 C41 53 23 53 18 44 C12 28 18 14 32 8 Z" fill="url(#wing)" stroke="${accent}" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="13" fill="${c1}" stroke="${accent}" stroke-width="1.4"/>
  <path d="M32 19 A13 13 0 0 1 32 45 A6.5 6.5 0 0 1 32 32 A6.5 6.5 0 0 0 32 19 Z" fill="${c3}"/>
  <circle cx="32" cy="25.5" r="2.3" fill="${c3}"/><circle cx="32" cy="38.5" r="2.3" fill="${c1}"/>
</g>`;

case "crystal_heart":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M22 28 C10 18 6 26 12 36 C16 40 22 36 24 34 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1.1"/>
  <path d="M42 28 C54 18 58 26 52 36 C48 40 42 36 40 34 Z" fill="url(#wing)" stroke="${glow}" stroke-width="1.1"/>
  <path d="M32 50 C20 40 16 30 20 22 C23 17 30 18 32 24 C34 18 41 17 44 22 C48 30 44 40 32 50 Z" fill="url(#body)" stroke="#fff" stroke-width="1.4"/>
  <path d="M24 25 Q26 22 29 24" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</g>`;

case "hourglass_gu":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <rect x="18" y="10" width="28" height="4.5" rx="2" fill="${accent}" stroke="${c3}" stroke-width="1"/>
  <rect x="18" y="49.5" width="28" height="4.5" rx="2" fill="${accent}" stroke="${c3}" stroke-width="1"/>
  <path d="M21 15 L43 15 L34 32 L43 49 L21 49 L30 32 Z" fill="url(#body)" stroke="${glow}" stroke-width="1.3"/>
  <path d="M25 18 L39 18 L32 30 Z" fill="url(#core)" opacity="0.85"/>
  <path d="M24 47 L40 47 L32 38 Z" fill="${accent}" opacity="0.9"/>
  <line x1="32" y1="31" x2="32" y2="41" stroke="#fff" stroke-width="1.4" stroke-dasharray="2 2"/>
</g>`;

case "mountain_titan":
return `
<g>
  <circle cx="32" cy="34" r="24" fill="url(#aura)"/>
  <polygon points="10,48 24,18 36,48" fill="url(#wing)" stroke="${c3}" stroke-width="1.2"/>
  <polygon points="28,48 42,22 54,48" fill="url(#wing)" stroke="${c3}" stroke-width="1.2"/>
  <polygon points="18,50 32,12 46,50" fill="url(#body)" stroke="${glow}" stroke-width="1.5"/>
  <polygon points="32,12 38,26 32,23 26,26" fill="${glow}" opacity="0.8"/>
  <path d="M14 50 L50 50" stroke="${accent}" stroke-width="2.5" stroke-linecap="round"/>
</g>`;

case "eye_orb":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <path d="M8 32 Q32 10 56 32 Q32 54 8 32 Z" fill="url(#body)" stroke="${accent}" stroke-width="1.6"/>
  <circle cx="32" cy="32" r="10.5" fill="url(#wing)" stroke="#fff" stroke-width="1.2"/>
  <circle cx="32" cy="32" r="4.8" fill="${c3}"/>
  <circle cx="29" cy="29" r="2.2" fill="#fff"/>
</g>`;

case "vortex_pearl":
return `
<g>
  <circle cx="32" cy="32" r="24" fill="url(#aura)"/>
  <circle cx="32" cy="32" r="18" fill="none" stroke="url(#body)" stroke-width="2.6" stroke-dasharray="14 6"/>
  <circle cx="32" cy="32" r="13" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="9 5"/>
  <circle cx="32" cy="32" r="8.5" fill="url(#core)" stroke="#fff" stroke-width="1.3"/>
  <circle cx="29.5" cy="29.5" r="2.4" fill="#fff" opacity="0.85"/>
</g>`;

case "fate_spider":
return `
<g>
  <circle cx="32" cy="32" r="26" fill="url(#aura)"/>
  <g stroke="#fff" stroke-width="1.5" opacity="0.85">
    <line x1="32" y1="6" x2="32" y2="58"/><line x1="6" y1="32" x2="58" y2="32"/>
    <line x1="13" y1="13" x2="51" y2="51"/><line x1="51" y1="13" x2="13" y2="51"/>
  </g>
  <polygon points="32,12 46,24 41,44 23,44 18,24" fill="url(#body)" stroke="#fff" stroke-width="1.6"/>
  <circle cx="32" cy="30" r="7" fill="url(#core)" stroke="${accent}" stroke-width="1.4"/>
  <path d="M22 38 L32 32 L44 36" stroke="${c3}" stroke-width="1.5" fill="none"/>
</g>`;

default:
return `
<g>
  <circle cx="32" cy="32" r="23" fill="url(#aura)"/>
  <ellipse cx="32" cy="33" rx="13" ry="16" fill="url(#body)" stroke="${glow}" stroke-width="1.4"/>
  <circle cx="28" cy="24" r="2" fill="${glow}"/><circle cx="36" cy="24" r="2" fill="${glow}"/>
</g>`;
}
}

function _buildDetailOverlay(detail,glow,accent) {
if (detail==="stars") {
return `<g fill="${glow}" opacity="0.9">
  <path d="M14 14 L15.4 17.6 L19 19 L15.4 20.4 L14 24 L12.6 20.4 L9 19 L12.6 17.6 Z"/>
  <path d="M51 42 L52 44.5 L54.5 45.5 L52 46.5 L51 49 L50 46.5 L47.5 45.5 L50 44.5 Z"/>
</g>`;
}
if (detail==="crown") {
return `<path d="M24 13 L27 7 L32 11 L37 7 L40 13 Z" fill="#ffd700" stroke="#fff" stroke-width="0.8"/>`;
}
if (detail==="flames") {
return `<g fill="${glow}" opacity="0.8"><circle cx="15" cy="18" r="1.8"/><circle cx="49" cy="16" r="2"/><circle cx="51" cy="44" r="1.5"/></g>`;
}
if (detail==="frost") {
return `<g stroke="#fff" stroke-width="1.1" opacity="0.85"><path d="M13 13 L17 17 M17 13 L13 17"/><path d="M47 47 L51 51 M51 47 L47 51"/></g>`;
}
if (detail==="lightning") {
return `<path d="M48 11 L43 19 L47 19 L44 26" stroke="${glow}" stroke-width="1.5" fill="none"/>`;
}
if (detail==="blood") {
return `<g fill="#ff3b30" opacity="0.85"><circle cx="14" cy="46" r="2.2"/><circle cx="50" cy="18" r="1.8"/></g>`;
}
if (detail==="poison") {
return `<g fill="#7ef7c4" opacity="0.8"><circle cx="14" cy="22" r="2.1"/><circle cx="50" cy="44" r="1.8"/><circle cx="48" cy="20" r="1.4"/></g>`;
}
if (detail==="chains") {
return `<path d="M14 48 Q32 56 50 48" stroke="${accent}" stroke-width="2" stroke-dasharray="4 2" fill="none"/>`;
}
return "";
}

function _buildRankFrame(rank) {
const r=Number(rank)||1;
if (r>=9) {
return `
<circle cx="32" cy="32" r="30" fill="none" stroke="#ffd700" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.92"/>
<circle cx="32" cy="32" r="26.5" fill="none" stroke="#fff7c2" stroke-width="0.9" opacity="0.72"/>
<g fill="#ffd700">
  <polygon points="32,0.5 34,5 30,5"/><polygon points="32,63.5 34,59 30,59"/>
  <polygon points="0.5,32 5,34 5,30"/><polygon points="63.5,32 59,34 59,30"/>
</g>`;
}
if (r>=8) {
return `
<circle cx="32" cy="32" r="29.5" fill="none" stroke="#99d6ff" stroke-width="1.3" stroke-dasharray="6 3" opacity="0.88"/>
<circle cx="32" cy="32" r="26.5" fill="none" stroke="#ffd700" stroke-width="0.8" opacity="0.6"/>`;
}
if (r>=6) {
const ringCol=r===7?"#ff6b6b" :"#4cd964";
return `<circle cx="32" cy="32" r="29.5" fill="none" stroke="${ringCol}" stroke-width="1.2" stroke-dasharray="7 4" opacity="0.82"/>`;
}
return "";
}

Object.assign(global.VanCoGuArtData,{_buildShapeMarkup,_buildDetailOverlay,_buildRankFrame});
})(window);
