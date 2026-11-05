/* Pure data and Markdown generation. Works in a browser and in Node for checks. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StyleCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const fonts = {
    'Inter Tight': '"Inter Tight", Arial, sans-serif',
    'Inter': '"Inter", Arial, sans-serif',
    'DM Sans': '"DM Sans", Arial, sans-serif',
    'Manrope': '"Manrope", Arial, sans-serif',
    'Space Grotesk': '"Space Grotesk", Arial, sans-serif',
    'Lora': '"Lora", Georgia, serif',
    'Georgia': 'Georgia, "Times New Roman", serif',
    'System sans': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };
  const palette = [
    ['background', 'Background', 'Page'], ['surface', 'Surface', 'Surface'],
    ['text', 'Text', 'Text'], ['muted', 'Muted text', 'Muted'],
    ['primary', 'Primary', 'Primary'], ['onPrimary', 'On primary', 'On primary'],
    ['border', 'Border', 'Border']
  ];
  const warm = {
    schemaVersion: 1, preset: 'warm', name: 'Studio North',
    intent: 'Warm, restrained interfaces for thoughtful digital products.',
    background: '#f7f7f2', surface: '#ffffff', text: '#2d2c2c', muted: '#5d5c5b', primary: '#2d2c2c', onPrimary: '#ffffff', border: '#dedbd2',
    headingFont: 'Inter Tight', bodyFont: 'Inter', h1: 60, scale: 1.25, headingWeight: '500', headingLine: 1.15, tracking: -0.025, bodySize: 16, bodyLine: 1.6, measure: 65,
    buttonShape: 'pill', buttonSize: 'regular', buttonWeight: '500', buttonArrow: true, buttonHover: 'lift',
    radius: 8, cardStyle: 'border', cardPadding: 24, spacing: 8, sectionSpace: 72, contentWidth: 1120,
    backgroundStyle: 'solid', sectionBg: '#2d2c2c', sectionEnd: '#5d5c5b', sectionText: '#f7f7f2', gradientAngle: 135,
    imageUrl: '', imageData: '', imageName: '', imagePosition: 'center', grayscale: 0, imageRatio: '4 / 3', imageDirection: 'natural',
    overlayStyle: 'none', overlayColor: '#191818', overlayOpacity: 40,
    personality: 'Quiet confidence. Warm, editorial, useful. Every detail should have a reason to exist.',
    doRules: 'Use a clear typographic hierarchy and generous negative space.\nKeep layouts aligned to one consistent grid.\nUse real content and purposeful imagery.\nGive each section a structure suited to its content.',
    avoidRules: 'Decorative gradients, glow effects, and glass panels without a functional reason.\nRepeating identical rounded cards for every section.\nOversized generic hero copy and vague marketing claims.\nEmoji as interface icons, excessive badges, and ornamental floating shapes.\nIntroducing new colors, typefaces, or radii without approval.',
    duration: 200, focusColor: '#a65037'
  };
  const presets = {
    warm,
    swiss: {...warm, preset: 'swiss', name: 'Index Office', intent: 'Clear, precise interfaces with an unmistakable typographic point of view.',
      background: '#ffffff', surface: '#f3f3f1', text: '#181818', muted: '#626262', primary: '#bd3025', onPrimary: '#ffffff', border: '#d9d9d4',
      headingFont: 'Space Grotesk', bodyFont: 'DM Sans', h1: 64, scale: 1.333, headingWeight: '600', headingLine: 1.1, tracking: -0.04, buttonShape: 'square', buttonArrow: false, buttonWeight: '600', buttonHover: 'tone', radius: 0, cardPadding: 24, sectionSpace: 80, spacing: 4,
      sectionBg: '#bd3025', sectionEnd: '#181818', sectionText: '#ffffff', focusColor: '#2151b9',
      personality: 'Precise, direct, typographic. An editorial grid with a practical, straightforward voice.',
      doRules: 'Let typography and alignment create the visual identity.\nUse strong scale contrast and clear numbered sequences.\nUse the accent color sparingly for actions and meaningful emphasis.\nPrefer square corners and fine rules.'},
    night: {...warm, preset: 'night', name: 'After Hours', intent: 'A calm dark interface with warm highlights and clear, readable contrast.',
      background: '#191a18', surface: '#242621', text: '#f0eee5', muted: '#b0b2a5', primary: '#d4e3a0', onPrimary: '#202319', border: '#42463b',
      headingFont: 'Manrope', bodyFont: 'Inter', h1: 56, scale: 1.2, headingWeight: '500', headingLine: 1.2, tracking: -0.03, buttonShape: 'rounded', radius: 12, cardStyle: 'border', buttonHover: 'tone',
      sectionBg: '#30352b', sectionEnd: '#191a18', sectionText: '#f0eee5', backgroundStyle: 'gradient', gradientAngle: 135, focusColor: '#e5b978',
      personality: 'Calm, tactile, focused. Dark surfaces with warm, considered highlights.',
      doRules: 'Use surface elevation through subtle tonal differences.\nKeep body copy comfortably readable on dark backgrounds.\nReserve the warm highlight for primary actions.\nUse gentle borders to define edges without visual clutter.'}
  };
  const numeric = {h1:[36,88],scale:[1.15,1.333],headingLine:[1,1.6],tracking:[-.06,.04],bodySize:[14,22],bodyLine:[1.3,2],measure:[45,80],radius:[0,32],cardPadding:[16,40],spacing:[4,8],sectionSpace:[40,120],contentWidth:[960,1440],gradientAngle:[0,360],grayscale:[0,100],overlayOpacity:[0,90],duration:[0,300]};
  const enums = {preset:Object.keys(presets),headingFont:Object.keys(fonts),bodyFont:Object.keys(fonts),headingWeight:['400','500','600','700','800'],buttonShape:['pill','rounded','square'],buttonSize:['compact','regular','large'],buttonWeight:['400','500','600','700'],buttonHover:['lift','tone','none'],cardStyle:['border','shadow','flat'],backgroundStyle:['solid','gradient','image'],imagePosition:['center','top','bottom','left','right'],imageRatio:['4 / 3','16 / 9','1 / 1','3 / 4'],imageDirection:['natural','editorial','graphic','documentary'],overlayStyle:['none','solid','gradient']};
  const clone = value => JSON.parse(JSON.stringify(value));
  const isColor = value => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
  function safeUrl(value) {
    if (!value) return '';
    try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; }
  }
  function sanitize(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Choose a valid Styleguide Studio JSON project.');
    if (input.schemaVersion !== 1) throw new Error('This project version is not supported. Export a version 1 project from Styleguide Studio.');
    const s = clone(warm);
    for (const key of Object.keys(s)) {
      const value = input[key];
      if (value === undefined) continue;
      if (enums[key]) { if(enums[key].includes(String(value))) s[key] = String(value); }
      else if (numeric[key]) { if(typeof value === 'number' && Number.isFinite(value)) s[key] = Math.min(numeric[key][1],Math.max(numeric[key][0],value)); }
      else if (isColor(s[key])) { if (isColor(value)) s[key] = value.toLowerCase(); }
      else if (key === 'buttonArrow') s[key] = value === true;
      else if (key === 'imageUrl') s[key] = typeof value === 'string' ? safeUrl(value) : '';
      else if (key === 'imageData') { if(typeof value === 'string' && value.length <= 4500000 && /^data:image\/(png|jpeg|webp|avif);base64,[A-Za-z0-9+/=]+$/.test(value)) s[key] = value; }
      else if (typeof s[key] === 'string' && typeof value === 'string') s[key] = value.slice(0,key === 'name' ? 60 : key === 'imageName' ? 200 : 2000);
    }
    if(!s.name.trim()) s.name = 'Untitled project';
    // Keep imported values in the exact set supported by the editor controls.
    if(![1.15,1.2,1.25,1.333].includes(s.scale)) s.scale = 1.25;
    if(![4,8].includes(s.spacing)) s.spacing = 8;
    if(![0,150,200,300].includes(s.duration)) s.duration = 200;
    return s;
  }
  function contrast(a,b) {
    function lum(hex) {const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
    const la=lum(a),lb=lum(b);return (Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);
  }
  function typeSizes(s) {return Array.from({length:6},(_,i)=>Math.max(s.bodySize+2,18,Math.round(s.h1/s.scale**i)));}
  function mobileSizes(s) {const limits=[44,36,30,26,22,20];return typeSizes(s).map((v,i)=>Math.min(v,Math.max(s.bodySize+2,limits[i])));}
  function buttonValues(s) {return {height:{compact:40,regular:48,large:56}[s.buttonSize],padding:{compact:16,regular:22,large:28}[s.buttonSize],radius:{pill:999,rounded:8,square:0}[s.buttonShape]};}
  const filename = s => (s.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'untitled')+'-style-guide';
  const mdInline = value => String(value).replace(/[\r\n]+/g,' ').replace(/\|/g,'\\|').replace(/`/g,"'").trim();
  const ruleLines = value => value.split('\n').map(x=>x.trim()).filter(Boolean).map(x=>'- '+x.replace(/^[-*]\s*/,'')).join('\n');
  function cssTokens(s) {
    const sizes=typeSizes(s),mobile=mobileSizes(s),b=buttonValues(s);
    const list=[...palette.map(([k])=>[`color-${k.replace(/[A-Z]/g,x=>'-'+x.toLowerCase())}`,s[k]]),
      ['font-heading',fonts[s.headingFont]],['font-body',fonts[s.bodyFont]],
      ...sizes.map((v,i)=>[`text-h${i+1}`,`${v}px`]),...mobile.map((v,i)=>[`text-h${i+1}-mobile`,`${v}px`]),
      ['text-body',`${s.bodySize}px`],['heading-weight',s.headingWeight],['heading-line-height',s.headingLine],['heading-tracking',s.tracking+'em'],['body-line-height',s.bodyLine],['reading-width',s.measure+'ch'],
      ['button-height',b.height+'px'],['button-padding-x',b.padding+'px'],['button-radius',b.radius+'px'],['button-weight',s.buttonWeight],['card-radius',s.radius+'px'],['card-padding',s.cardPadding+'px'],['card-shadow',s.cardStyle==='shadow'?'0 8px 28px rgb(0 0 0 / 0.08)':'none'],
      ['space-unit',s.spacing+'px'],...Array.from({length:6},(_,i)=>[`space-${i+1}`,s.spacing*[1,2,3,4,6,8][i]+'px']),
      ['section-space',s.sectionSpace+'px'],['content-width',s.contentWidth+'px'],['section-background',s.sectionBg],['section-background-end',s.sectionEnd],['section-text',s.sectionText],['gradient-angle',s.gradientAngle+'deg'],['overlay-color',s.overlayColor],['overlay-opacity',s.overlayOpacity/100],['image-grayscale',s.grayscale+'%'],['image-position',s.imagePosition],['image-ratio',s.imageRatio],['focus-color',s.focusColor],['motion-duration',s.duration+'ms']];
    return ':root {\n'+list.map(([k,v])=>'  --'+k+': '+v+';').join('\n')+'\n}';
  }
  function markdown(s) {
    const sizes=typeSizes(s),mobile=mobileSizes(s),b=buttonValues(s);
    const n=mdInline(s.name),image=s.imageData?`Uploaded asset: ${mdInline(s.imageName || 'background image')}. Attach this image separately; it is not embedded in this Markdown.`:s.imageUrl?`Image URL: ${mdInline(s.imageUrl)}`:'No image selected. The preview uses a CSS composition as an image-treatment sample; it is not a photography reference.';
    const imageWords={natural:'Natural light, quiet compositions, believable textures; avoid artificial gloss.',editorial:'Editorial photography, deliberate crops, a clear focal point, and consistent art direction.',graphic:'Graphic objects and strong silhouettes; purposeful geometry with clean compositions.',documentary:'Candid, authentic documentary photography with believable settings and natural human detail.'};
    const checks=[['Text / background',s.text,s.background],['Muted / background',s.muted,s.background],['Button label / primary',s.onPrimary,s.primary],['Text / surface',s.text,s.surface],['Primary link / background',s.primary,s.background],['Focus / background',s.focusColor,s.background]];
    const warnings=checks.filter(([,a,c],i)=>contrast(a,c)<(i===5?3:4.5));
    const checkRows=checks.map(([label,a,c],i)=>{const ratio=contrast(a,c),limit=i===5?3:4.5;return `| ${label} | ${ratio.toFixed(2)}:1 | ${ratio>=limit?'Pass':'Needs adjustment'} (${limit}:1) |`;}).join('\n');
    return `# ${n} — UI style guide

> Treat this guide as the visual and interaction contract for the next design. Use the exact values below. Where a decision is not specified, follow the stated intent and existing tokens; ask before inventing a new visual direction.

## 1. Intent and personality

${s.intent.trim()}

${s.personality.trim()}

### Do

${ruleLines(s.doRules) || '- Keep decisions consistent with this guide.'}

### Avoid

${ruleLines(s.avoidRules) || '- Avoid decoration that has no purpose.'}

## 2. Color system

| Semantic role | Hex | Usage |
| --- | --- | --- |
${palette.map(([key,label])=>`| ${label} | ${s[key]} | ${{background:'Default page canvas',surface:'Cards and elevated content',text:'Headings and essential copy',muted:'Supporting text; never reduce opacity further',primary:'Primary actions, meaningful emphasis, links',onPrimary:'Text and icons on primary fill',border:'Subtle decorative dividers and surface edges'}[key]} |`).join('\n')}

- Use semantic roles consistently. Do not introduce arbitrary hex values.
- Border is a decorative token. Essential input outlines and state indicators need at least 3:1 contrast against adjacent colors; use an adjusted text/focus token where necessary.
- Link color alone is insufficient; keep links underlined in body copy.

### Contrast audit

| Pairing | Contrast | Result / required minimum |
| --- | --- | --- |
${checkRows}

${warnings.length?'**Before shipping:** Adjust the failing pairings above. These are user-selected values, not automatic accessibility approval.':'All listed solid-color text pairings meet the stated thresholds.'} Image overlays, hover states, secondary buttons, and focus on other surfaces require separate checks in the final UI.

## 3. Typography

- Heading family: ${fonts[s.headingFont]}.
- Body and controls: ${fonts[s.bodyFont]}.
- Heading weight: ${s.headingWeight}. Heading line-height: ${s.headingLine}. Tracking: ${s.tracking}em.
- Body size: ${s.bodySize}px; weight: 400; line-height: ${s.bodyLine}; tracking: normal.
- Heading scale: ${s.scale}. Rounded to whole pixels with a ${Math.max(18,s.bodySize+2)}px minimum.
- Comfortable reading measure: ${s.measure}ch. Body links are underlined. Strong text uses weight 600.
- Small text: ${Math.max(12,s.bodySize*.75)}px minimum; keep important instructions at body size.
- Load the chosen families through Google Fonts or a licensed local source. Use the declared fallback stacks when fonts are unavailable. Do not substitute a new visual style silently.

| Level | Desktop size | Mobile size (≤600px content width) | Weight | Line height | Letter spacing |
| --- | --- | --- | --- | --- | --- |
${sizes.map((v,i)=>`| H${i+1} | ${v}px | ${mobile[i]}px | ${s.headingWeight} | ${s.headingLine} | ${s.tracking}em |`).join('\n')}

These sizes are hierarchy tokens, not a requirement to use every level. Use one H1, then semantic heading order. Component titles may use 26px and specimen labels 23px; do not confuse a display size with document structure. On mobile, allow natural wrapping; avoid forced line breaks in product content.

## 4. Layout and spacing

- Content max-width: ${s.contentWidth}px, centered.
- Grid rhythm: ${s.spacing}px. Space scale: ${[1,2,3,4,6,8].map(v=>v*s.spacing+'px').join(', ')}.
- Default section block padding: ${s.sectionSpace}px. Compact specimens use about 70% of this value.
- Page inline gutter: about 5.7% of the content width; maintain at least 20px on small screens.
- At content width ≤600px: collapse cards/forms to one column, cap the heading sizes as above, and use 40px section padding where appropriate.
- Align to a deliberate grid. Choose section structures based on content, rather than repeating one card pattern everywhere.

## 5. Buttons and interaction states

- Shape: ${s.buttonShape}; radius: ${b.radius}px.
- Minimum visual height: ${b.height}px; inline padding: ${b.padding}px; block padding: 10px. Maintain at least a 44×44px interaction target; expand the hit area for compact controls.
- Font: body family, ${s.bodySize*.875}px, weight ${s.buttonWeight}, line-height 1.3.
- Primary: fill ${s.primary}, label ${s.onPrimary}, transparent 1px border.
- Secondary: transparent fill, text ${s.text}, 1px ${s.border} border. Its text communicates the action; strengthen the border if needed to identify the control.
- Text action: transparent, color ${s.primary}; no decorative container. Preserve an accessible hit area and a clear label.
- Trailing arrow: ${s.buttonArrow?'enabled; a small 25px circular detail in 14% currentColor with a decorative 15px arrow. Keep a clear accessible text label.':'disabled; use clear text labels without a trailing circle.'}
- Hover: ${{lift:'translateY(-2px); retain the fill and label colors.',tone:'brightness(0.87); verify the resulting label contrast.',none:'no motion or color transformation; keep a clear focus and pressed state.'}[s.buttonHover]}
- Pressed: return to translateY(0); do not remove the label.
- Disabled: opacity 0.38; native disabled attribute; no hover transformation. Never make essential information available only through a disabled control.
- Focus-visible: 3px solid ${s.focusColor}, offset 4px; never remove keyboard focus outlines.
- Motion: ${s.duration}ms, ease. Respect prefers-reduced-motion: remove transforms, animation, and nonessential transitions.

## 6. Cards, forms, and surfaces

- Surface: ${s.surface}; text: ${s.text}; supporting text: ${s.muted}.
- Card radius: ${s.radius}px. Padding: ${s.cardPadding}px. Treatment: ${s.cardStyle}.
- Border: ${s.cardStyle==='border'?`1px solid ${s.border}`:'none'}. Shadow: ${s.cardStyle==='shadow'?'0 8px 28px rgb(0 0 0 / 0.08)':'none'}.
- Image ratio: ${s.imageRatio.replace(' / ',':')}; object-fit: cover; focal point: ${s.imagePosition}; grayscale: ${s.grayscale}%; clip image to card edges.
- Card title example: 26px in heading family. Card text: ${s.bodySize*.875}px with body line-height. Let content determine card height.
- Forms: persistent visible labels, clear helper/error text, correct input types, and descriptive submit labels. Use the body font. The specimen uses minimal underline inputs, transparent fill, 10px vertical padding, and a 1px border token.
- Verify essential input boundaries reach 3:1 contrast or strengthen them using the text/focus palette. Preserve native validation and announce success/errors to assistive technology.

## 7. Backgrounds, imagery, and overlays

- Section background mode: **${s.backgroundStyle}**.
- Base color: ${s.sectionBg}. Second gradient color: ${s.sectionEnd}. Gradient angle: ${s.gradientAngle}deg.
- Section text: ${s.sectionText}. Example outlined CTA inherits the section text color for both label and border.
- ${s.backgroundStyle==='gradient'?`Background CSS: linear-gradient(${s.gradientAngle}deg, ${s.sectionBg}, ${s.sectionEnd}).`:s.backgroundStyle==='image'?'Render the selected image as a covering layer over the base color. Apply the grayscale filter only to the image layer.':'Render a solid base color.'}
- ${image}
- Image direction: ${imageWords[s.imageDirection]}
- Background sizing: cover. Position: ${s.imagePosition}. Image filter: grayscale(${s.grayscale}%).
- Overlay: ${s.overlayStyle}; color ${s.overlayColor}; opacity ${s.overlayOpacity}%${s.overlayStyle==='gradient'?'; fade from transparent at top to the selected opacity at bottom (to top gradient).':'.'}
- Layer order: base → image/gradient → overlay → content. Keep the text layer unfiltered and fully opaque.
- Apply the configured image treatment to content-card images too. The overlay applies only to the background section.
- Never assume image contrast passes. Check text at its actual placement across viewport sizes; adjust the chosen text/overlay/background values or move the text onto a solid surface.
- Use meaningful alt text for informative images and empty alt text for decoration. Avoid stretching images or inventing irrelevant stock imagery.

## 8. Tokens to implement

\`\`\`css
${cssTokens(s)}
\`\`\`

Use the mobile heading tokens at ≤600px content width via a container query or an equivalent viewport breakpoint for full-width layouts. Use rem equivalents if the base is 16px; preserve browser text zoom. Component behavior and image/overlay modes are specified above, not solely by the token block.

## 9. Implementation brief for the AI

1. Read this entire guide before designing. Follow the exact tokens, font pairing, component treatment, and creative rules.
2. Use semantic HTML, CSS, and vanilla JavaScript unless the project brief requests another stack. Keep content and interaction behavior meaningful.
3. Start with the page's actual purpose and content. Establish hierarchy, alignment, and useful whitespace before adding visual decoration.
4. Include responsive layouts, keyboard navigation, visible focus, labeled forms, and reduced-motion support. Verify color contrast; do not ship failed pairings from this guide.
5. Use supplied assets and authentic copy. Do not add ornamental patterns, badges, gradients, or repeated card grids that conflict with the direction.
6. If the brief requires something this guide does not define, use the closest existing token. Explain any necessary deviations rather than silently introducing a competing visual language.

---
Generated with Styleguide Studio · Project schema v1. This is a visual specification, not a finished accessibility certification.
`;
  }
  return {fonts,palette,presets,numeric,enums,clone,isColor,safeUrl,sanitize,contrast,typeSizes,mobileSizes,buttonValues,filename,cssTokens,markdown};
});
