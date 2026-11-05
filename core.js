/* Pure data and Markdown generation. Works in a browser and in Node for checks. */
(function (root, factory) {
  const catalog = typeof module === 'object' && module.exports ? require('./fonts.js') : root.GoogleFontsCatalog;
  const templates = typeof module === 'object' && module.exports ? require('./template-presets.js') : root.TemplatePresets;
  const websites = typeof module === 'object' && module.exports ? require('./website-presets.js') : root.WebsitePresets;
  const api = factory(catalog,templates,websites);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StyleCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog,templates,websites) {
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
  const fontCatalog = catalog || {updated:'',source:'',families:[]};
  const fontMetadata = new Map(fontCatalog.families.map(row=>[row[0],row]));
  const validFontName = name => typeof name==='string' && name.length<=160 && /^[\p{L}\p{N} .&'()-]+$/u.test(name) && name.trim().length>0;
  function registerFont(name) {
    if(!validFontName(name))return false;
    if(Object.hasOwn(fonts,name))return true;
    const category=fontMetadata.get(name)?.[1] || 'Sans Serif';
    const fallback=category==='Serif'?'Georgia, serif':category==='Monospace'?'ui-monospace, monospace':'Arial, sans-serif';
    fonts[name]=JSON.stringify(name)+', '+fallback;return true;
  }
  fontCatalog.families.forEach(([name])=>registerFont(name));
  function weightsFor(name) {return fontMetadata.get(name)?.[2] || (['Georgia','System sans'].includes(name)?[100,200,300,400,500,600,700,800,900]:[400]);}
  function nearestWeight(name,weight) {return String(weightsFor(name).reduce((a,b)=>Math.abs(b-Number(weight))<Math.abs(a-Number(weight))?b:a));}
  function fontUrl(name,weights=[400]) {
    if(['Georgia','System sans'].includes(name))return '';
    const supported=[...new Set(weights.map(w=>Number(nearestWeight(name,w))))].sort((a,b)=>a-b);
    return 'https://fonts.googleapis.com/css2?family='+encodeURIComponent(name).replace(/%20/g,'+')+':wght@'+supported.join(';')+'&display=swap';
  }
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
    headingFont: 'Inter Tight', bodyFont: 'Inter', h1: 60, scale: 1.25, headingWeight: '500', headingLine: 1.15, tracking: -0.025, bodySize: 16, bodyWeight: '400', bodyLine: 1.6, measure: 65,
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
  Object.assign(presets, {
    shadcn: {...warm,preset:'shadcn',name:'Neutral UI',intent:'A practical component system with neutral surfaces and sharp, predictable interactions.',headingFont:'Geist',bodyFont:'Geist',h1:48,scale:1.2,headingWeight:'600',tracking:-0.025,headingLine:1.15,background:'#ffffff',surface:'#fafafa',text:'#171717',muted:'#656565',primary:'#171717',onPrimary:'#fafafa',border:'#e5e5e5',buttonShape:'rounded',buttonArrow:false,buttonSize:'compact',buttonHover:'tone',buttonWeight:'500',radius:8,cardPadding:24,spacing:4,sectionSpace:64,sectionBg:'#171717',sectionText:'#fafafa',focusColor:'#525252',personality:'Understated, composed, practical. Neutral surfaces and clearly defined component states.',doRules:'Use semantic foreground/background pairs consistently.\nKeep controls compact and alignment precise.\nUse subtle borders and clearly visible focus rings.\nLet content structure the page before adding decoration.'},
    apple: {...warm,preset:'apple',name:'Clarity',intent:'Calm, spacious product experiences with a strong hierarchy and a single clear next action.',headingFont:'System sans',bodyFont:'System sans',h1:64,scale:1.25,headingWeight:'600',headingLine:1.1,tracking:-0.035,background:'#f5f5f7',surface:'#ffffff',text:'#1d1d1f',muted:'#626266',primary:'#0067cf',onPrimary:'#ffffff',border:'#d2d2d7',buttonShape:'pill',buttonArrow:false,buttonHover:'tone',radius:20,cardStyle:'flat',cardPadding:32,sectionSpace:96,sectionBg:'#1d1d1f',sectionText:'#f5f5f7',focusColor:'#0067cf',personality:'Clear, calm, refined. Product detail and useful hierarchy carry the experience.',doRules:'Put the primary task and product content first.\nUse generous whitespace with a deliberate hierarchy.\nUse a system font stack and restrained blue actions.\nKeep motion brief, purposeful, and optional.'},
    google: {...warm,preset:'google',name:'Material Notes',intent:'A friendly, accessible interface with clear semantic roles and comfortable, tactile components.',headingFont:'Roboto',bodyFont:'Roboto',h1:57,scale:1.25,headingWeight:'400',headingLine:1.15,tracking:0,background:'#fdf8ff',surface:'#f1edf7',text:'#1d1b20',muted:'#625c69',primary:'#6750a4',onPrimary:'#ffffff',border:'#cac4d0',buttonShape:'pill',buttonArrow:false,buttonWeight:'500',buttonHover:'tone',radius:24,cardPadding:24,spacing:4,sectionSpace:64,sectionBg:'#eaddff',sectionText:'#21005d',focusColor:'#6750a4',personality:'Friendly, legible, tactile. Soft surfaces with clear semantic roles.',doRules:'Distinguish display, headline, title, body, and label roles.\nUse rounded containers with comfortable touch targets.\nKeep primary actions visually distinct from secondary surfaces.\nUse color to communicate purpose rather than decoration.'},
    webflow: {...warm,preset:'webflow',name:'Canvas Studio',intent:'An expressive studio interface built on bold typography, disciplined grids, and electric blue actions.',headingFont:'Inter Tight',bodyFont:'Inter',h1:76,scale:1.333,headingWeight:'600',headingLine:1.05,tracking:-0.04,background:'#f6f6f6',surface:'#ffffff',text:'#171717',muted:'#5a5a5a',primary:'#1460e8',onPrimary:'#ffffff',border:'#d5d5d5',buttonShape:'square',buttonArrow:true,buttonWeight:'600',radius:0,cardStyle:'flat',cardPadding:24,sectionSpace:88,spacing:8,sectionBg:'#1460e8',sectionText:'#ffffff',focusColor:'#1460e8',personality:'Bold, deliberate, creative. Strong grids and confident scale contrast.',doRules:'Use typography to create visual energy.\nAnchor expressive sections to a consistent grid.\nUse a vivid blue accent for useful actions.\nUse sharp edges, intentional image crops, and generous section spacing.'},
    atlassian: {...warm,preset:'atlassian',name:'Teamwork',intent:'A dependable workspace that makes tasks, progress, and next actions easy to understand.',headingFont:'Public Sans',bodyFont:'Public Sans',h1:44,scale:1.2,headingWeight:'600',headingLine:1.2,tracking:-0.02,background:'#f7f8f9',surface:'#ffffff',text:'#172b4d',muted:'#44546f',primary:'#0c66e4',onPrimary:'#ffffff',border:'#c5cbd4',buttonShape:'rounded',buttonArrow:false,buttonSize:'compact',buttonWeight:'600',buttonHover:'tone',radius:8,cardPadding:20,spacing:4,sectionSpace:56,sectionBg:'#e9f2ff',sectionText:'#09326c',focusColor:'#0c66e4',personality:'Dependable, approachable, efficient. A clear workspace for people doing real work.',doRules:'Assign colors by semantic role and interaction state.\nKeep labels direct and task focused.\nUse compact spacing where information density helps.\nKeep navigation, progress, feedback, and next actions easy to identify.'},
    shopify: {...warm,preset:'shopify',name:'Merchant Desk',intent:'A pragmatic commerce workspace with calm surfaces, readable data, and reliable actions.',headingFont:'Inter',bodyFont:'Inter',h1:44,scale:1.2,headingWeight:'600',headingLine:1.2,tracking:-0.025,background:'#f1f1f1',surface:'#ffffff',text:'#303030',muted:'#616161',primary:'#303030',onPrimary:'#ffffff',border:'#d4d4d4',buttonShape:'rounded',buttonSize:'compact',buttonArrow:false,buttonWeight:'600',buttonHover:'tone',radius:12,cardStyle:'shadow',cardPadding:20,spacing:4,sectionSpace:56,sectionBg:'#e3f1df',sectionText:'#204523',focusColor:'#237b38',personality:'Pragmatic, calm, trustworthy. Commerce tasks without unnecessary visual noise.',doRules:'Put operational clarity and meaningful status ahead of decoration.\nUse restrained surfaces and compact, consistent components.\nUse green for positive outcomes, with text or icons reinforcing meaning.\nMake forms, totals, product information, and next actions easy to scan.'},
    wordpress: {...warm,preset:'wordpress',name:'Open Publisher',intent:'A clear publishing interface that balances editorial typography with direct, familiar controls.',headingFont:'Source Serif 4',bodyFont:'Open Sans',h1:56,scale:1.25,headingWeight:'600',headingLine:1.15,tracking:-0.02,background:'#f0f0f1',surface:'#ffffff',text:'#1d2327',muted:'#50575e',primary:'#2271b1',onPrimary:'#ffffff',border:'#c3c4c7',buttonShape:'square',buttonArrow:false,buttonWeight:'600',buttonHover:'tone',radius:4,cardStyle:'border',cardPadding:24,spacing:4,sectionSpace:64,sectionBg:'#1d2327',sectionText:'#ffffff',focusColor:'#2271b1',personality:'Open, familiar, editorial. Content comes first; controls remain direct and useful.',doRules:'Use serif display type with a readable sans serif interface.\nKeep editor controls visually simple and clearly labeled.\nUse blue consistently for interactive actions.\nUse practical spacing and flexible content blocks.'},
    figma: {...warm,preset:'figma',name:'Playground',intent:'An energetic, collaborative design canvas with expressive type and a useful component foundation.',headingFont:'Space Grotesk',bodyFont:'Figtree',h1:68,scale:1.25,headingWeight:'600',headingLine:1.1,tracking:-0.04,background:'#fff8ee',surface:'#ffffff',text:'#242122',muted:'#625b59',primary:'#6840bc',onPrimary:'#ffffff',border:'#d7cbbf',buttonShape:'rounded',buttonArrow:true,buttonWeight:'600',buttonHover:'lift',radius:16,cardStyle:'border',cardPadding:24,spacing:8,sectionSpace:80,sectionBg:'#f7d78c',sectionText:'#382c17',focusColor:'#6840bc',personality:'Expressive, playful, collaborative. Confident shapes and a useful grid.',doRules:'Balance expressive typography with readable product content.\nUse warm surfaces with one purposeful interactive accent.\nUse shape and composition to express personality.\nKeep editing tools and essential navigation predictable.'},
    claude: {...warm,preset:'claude',name:'Thoughtful',intent:'A warm reading and writing environment with comfortable typography and restrained terracotta accents.',headingFont:'Lora',bodyFont:'DM Sans',h1:56,scale:1.25,headingWeight:'400',headingLine:1.2,tracking:-0.025,background:'#faf9f5',surface:'#ffffff',text:'#30302e',muted:'#68665f',primary:'#a7472b',onPrimary:'#ffffff',border:'#dedbd2',buttonShape:'rounded',buttonArrow:false,buttonWeight:'500',buttonHover:'tone',radius:12,cardPadding:28,measure:62,sectionSpace:80,sectionBg:'#eae5db',sectionText:'#30302e',focusColor:'#a7472b',personality:'Warm, reflective, literate. Comfortable reading and a quiet visual presence.',doRules:'Pair expressive serif headings with a readable sans serif body.\nUse warm paper tones and restrained terracotta actions.\nFavor prose, clear grouping, and generous reading space.\nKeep supporting controls subtle and feedback humane.'},
    linear: {...warm,preset:'linear',name:'Focus',intent:'A focused dark workspace with fine borders, compact controls, and clear information hierarchy.',headingFont:'Inter',bodyFont:'Inter',h1:52,scale:1.25,headingWeight:'500',headingLine:1.1,tracking:-0.035,background:'#151619',surface:'#1d1e23',text:'#f1f2f4',muted:'#aaaeb8',primary:'#a8afff',onPrimary:'#181a30',border:'#363842',buttonShape:'rounded',buttonArrow:false,buttonSize:'compact',buttonWeight:'500',buttonHover:'tone',radius:8,cardPadding:20,spacing:4,sectionSpace:64,sectionBg:'#22242e',sectionText:'#f1f2f4',focusColor:'#a8afff',personality:'Focused, precise, fast. A quiet dark canvas with a clear hierarchy.',doRules:'Use tonal elevation rather than decorative effects.\nKeep controls compact and frequently used actions close.\nUse fine borders and highly readable text.\nReserve the accent for active states and meaningful actions.'},
    notion: {...warm,preset:'notion',name:'Paper Blocks',intent:'A flexible, content-led workspace that feels direct, familiar, and easy to organize.',headingFont:'System sans',bodyFont:'System sans',h1:48,scale:1.25,headingWeight:'700',headingLine:1.15,tracking:-0.03,background:'#ffffff',surface:'#f7f7f5',text:'#37352f',muted:'#67665f',primary:'#37352f',onPrimary:'#ffffff',border:'#e3e2df',buttonShape:'rounded',buttonArrow:false,buttonSize:'compact',buttonWeight:'500',buttonHover:'tone',radius:4,cardStyle:'flat',cardPadding:20,spacing:4,sectionSpace:64,sectionBg:'#f1f1ef',sectionText:'#37352f',focusColor:'#326fa4',personality:'Direct, flexible, familiar. A clean sheet for useful content.',doRules:'Build content from clear, flexible blocks.\nUse simple type hierarchy and subtle separators.\nKeep surfaces quiet and controls direct.\nLet writing, structure, and meaningful content carry the page.'},
    stripe: {...warm,preset:'stripe',name:'Clear Commerce',intent:'A polished financial product interface with crisp typography, trusted color, and precise information design.',headingFont:'Plus Jakarta Sans',bodyFont:'Inter',h1:64,scale:1.25,headingWeight:'600',headingLine:1.1,tracking:-0.035,background:'#f6f9fc',surface:'#ffffff',text:'#0a2540',muted:'#425466',primary:'#5545d9',onPrimary:'#ffffff',border:'#d6e1eb',buttonShape:'rounded',buttonArrow:true,buttonWeight:'600',buttonHover:'lift',radius:12,cardStyle:'shadow',cardPadding:28,spacing:8,sectionSpace:88,sectionBg:'#0a2540',sectionText:'#ffffff',focusColor:'#5545d9',personality:'Precise, confident, considered. Financial information made clear and approachable.',doRules:'Use strong information hierarchy and clear numeric formatting.\nUse a structured grid with confident type scale.\nUse navy for trust and one purposeful accent for actions.\nKeep technical and financial details readable and easy to verify.'}
  });
  const presetInfo = {
    warm:['Warm editorial','Original','Warm neutrals, restrained type, and considered spacing.'],swiss:['Swiss precision','Original','A direct typographic grid with square components.'],night:['After hours','Original','Calm dark surfaces with warm highlights.'],
    shadcn:['shadcn · Neutral','shadcn/ui','Neutral semantic tokens and practical components.'],apple:['Apple · Clarity','Apple','System type, generous space, and clear product hierarchy.'],google:['Google · Material','Google Material Design','Rounded components, tonal surfaces, and clear color roles.'],webflow:['Webflow · Canvas','Webflow','Bold type, electric blue, and a deliberate studio grid.'],atlassian:['Atlassian · Teamwork','Atlassian','Task clarity, compact rhythm, and dependable blue actions.'],shopify:['Shopify · Merchant','Shopify Polaris','Calm commerce surfaces and practical, compact controls.'],wordpress:['WordPress · Publisher','WordPress','Editorial serif headings with familiar publishing controls.'],figma:['Figma · Playground','Figma','Expressive typography and a warm, collaborative canvas.'],claude:['Claude · Thoughtful','Claude','Warm paper, serif headings, and restrained terracotta.'],linear:['Linear · Focus','Linear','A precise dark workspace with fine borders.'],notion:['Notion · Paper','Notion','Content-led blocks and quiet, flexible surfaces.'],stripe:['Stripe · Commerce','Stripe','Crisp financial hierarchy and considered color.']
  };
  [...(templates||[]),...(websites||[])].forEach(item=>{presets[item.key]={...warm,...item.values,preset:item.key};presetInfo[item.key]=[item.label,item.source,item.description,item.group,item.url];});
  const mobileLimits=[44,36,30,26,22,20];
  function scaleSizes(s,legacy=false) {return Array.from({length:6},(_,i)=>Math.max(legacy?Math.max(s.bodySize+2,18):8,Math.round(s.h1/s.scale**i)));}
  function fillNewDefaults(s) {
    const scaled=scaleSizes(s,true);
    for(let i=1;i<=6;i++){
      if(!Number.isFinite(s['h'+i]))s['h'+i]=scaled[i-1];
      if(!Number.isFinite(s['h'+i+'Mobile']))s['h'+i+'Mobile']=Math.min(s['h'+i],Math.max(s.bodySize+2,mobileLimits[i-1]));
    }
    if(!Number.isFinite(s.buttonRadius))s.buttonRadius={pill:999,rounded:8,square:0,custom:8}[s.buttonShape]??8;
    s.buttonShape=s.buttonRadius===0?'square':s.buttonRadius===8?'rounded':s.buttonRadius===999?'pill':'custom';
    if(!Number.isFinite(s.buttonTextSize))s.buttonTextSize=Math.round(s.bodySize*.875*2)/2;
    if(!Number.isFinite(s.cardTitleSize))s.cardTitleSize=26;
    if(!Number.isFinite(s.cardTextSize))s.cardTextSize=Math.round(s.bodySize*.875*2)/2;
    if(!Number.isFinite(s.smallTextSize))s.smallTextSize=Math.max(12,Math.round(s.bodySize*.75*2)/2);
    return s;
  }
  Object.values(presets).forEach(preset=>{fillNewDefaults(preset);preset.headingWeight=nearestWeight(preset.headingFont,preset.headingWeight);preset.bodyWeight=nearestWeight(preset.bodyFont,preset.bodyWeight);preset.buttonWeight=nearestWeight(preset.bodyFont,preset.buttonWeight);});
  const numeric = {h1:[8,200],scale:[1.15,1.333],headingLine:[1,1.6],tracking:[-.06,.04],bodySize:[8,40],smallTextSize:[8,40],buttonTextSize:[8,40],cardTitleSize:[8,96],cardTextSize:[8,40],buttonRadius:[0,999],bodyLine:[1.3,2],measure:[45,80],radius:[0,128],cardPadding:[16,40],spacing:[4,8],sectionSpace:[40,120],contentWidth:[960,1440],gradientAngle:[0,360],grayscale:[0,100],overlayOpacity:[0,90],duration:[0,300]};
  for(let i=1;i<=6;i++){numeric['h'+i]=[8,200];numeric['h'+i+'Mobile']=[8,160];}
  const enums = {preset:Object.keys(presets),headingFont:Object.keys(fonts),bodyFont:Object.keys(fonts),headingWeight:['400','500','600','700','800'],buttonShape:['pill','rounded','square'],buttonSize:['compact','regular','large'],buttonWeight:['400','500','600','700'],buttonHover:['lift','tone','none'],cardStyle:['border','shadow','flat'],backgroundStyle:['solid','gradient','image'],imagePosition:['center','top','bottom','left','right'],imageRatio:['4 / 3','16 / 9','1 / 1','3 / 4'],imageDirection:['natural','editorial','graphic','documentary'],overlayStyle:['none','solid','gradient']};
  enums.buttonShape.push('custom');
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
      if (key==='headingFont'||key==='bodyFont') {if(registerFont(value))s[key]=value;}
      else if (['headingWeight','bodyWeight','buttonWeight'].includes(key)) {if(/^\d{1,4}$/.test(String(value))&&Number(value)>=1&&Number(value)<=1000)s[key]=String(value);}
      else if (enums[key]) { if(enums[key].includes(String(value))) s[key] = String(value); }
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
    s.headingWeight=nearestWeight(s.headingFont,s.headingWeight);
    s.bodyWeight=nearestWeight(s.bodyFont,s.bodyWeight);
    s.buttonWeight=nearestWeight(s.bodyFont,s.buttonWeight);
    // Older projects stored only H1/scale and a shape name. Derive the missing
    // explicit values from those choices instead of silently using warm defaults.
    const newKeys=['h2','h3','h4','h5','h6',...Array.from({length:6},(_,i)=>'h'+(i+1)+'Mobile'),'buttonRadius','buttonTextSize','cardTitleSize','cardTextSize','smallTextSize'];
    newKeys.forEach(key=>{if(input[key]===undefined)delete s[key];});fillNewDefaults(s);
    return s;
  }
  function contrast(a,b) {
    function lum(hex) {const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
    const la=lum(a),lb=lum(b);return (Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);
  }
  // Bright brand fills can be suitable for buttons with dark labels while
  // remaining unsuitable for body links on a light canvas.
  function linkColor(s) {return contrast(s.primary,s.background)>=4.5?s.primary:s.text;}
  function typeSizes(s) {const scaled=scaleSizes(s,true);return Array.from({length:6},(_,i)=>Number.isFinite(s['h'+(i+1)])?s['h'+(i+1)]:scaled[i]);}
  function mobileSizes(s) {return typeSizes(s).map((v,i)=>Number.isFinite(s['h'+(i+1)+'Mobile'])?s['h'+(i+1)+'Mobile']:Math.min(v,Math.max(s.bodySize+2,mobileLimits[i])));}
  function buttonValues(s) {return {height:{compact:40,regular:48,large:56}[s.buttonSize],padding:{compact:16,regular:22,large:28}[s.buttonSize],radius:Number.isFinite(s.buttonRadius)?s.buttonRadius:{pill:999,rounded:8,square:0,custom:8}[s.buttonShape]};}
  const filename = s => (s.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'untitled')+'-style-guide';
  const mdInline = value => String(value).replace(/[\r\n]+/g,' ').replace(/\|/g,'\\|').replace(/`/g,"'").trim();
  const ruleLines = value => value.split('\n').map(x=>x.trim()).filter(Boolean).map(x=>'- '+x.replace(/^[-*]\s*/,'')).join('\n');
  function cssTokens(s) {
    const sizes=typeSizes(s),mobile=mobileSizes(s),b=buttonValues(s);
    const list=[...palette.map(([k])=>[`color-${k.replace(/[A-Z]/g,x=>'-'+x.toLowerCase())}`,s[k]]),['color-link',linkColor(s)],
      ['font-heading',fonts[s.headingFont]],['font-body',fonts[s.bodyFont]],
      ...sizes.map((v,i)=>[`text-h${i+1}`,`${v}px`]),...mobile.map((v,i)=>[`text-h${i+1}-mobile`,`${v}px`]),
      ['text-body',`${s.bodySize}px`],['body-weight',s.bodyWeight||'400'],['heading-weight',s.headingWeight],['heading-line-height',s.headingLine],['heading-tracking',s.tracking+'em'],['body-line-height',s.bodyLine],['reading-width',s.measure+'ch'],
      ['text-small',s.smallTextSize+'px'],['text-button',s.buttonTextSize+'px'],['text-card-title',s.cardTitleSize+'px'],['text-card-body',s.cardTextSize+'px'],
      ['button-height',b.height+'px'],['button-padding-x',b.padding+'px'],['button-radius',b.radius+'px'],['button-weight',s.buttonWeight],['card-radius',s.radius+'px'],['card-padding',s.cardPadding+'px'],['card-shadow',s.cardStyle==='shadow'?'0 8px 28px rgb(0 0 0 / 0.08)':'none'],
      ['space-unit',s.spacing+'px'],...Array.from({length:6},(_,i)=>[`space-${i+1}`,s.spacing*[1,2,3,4,6,8][i]+'px']),
      ['section-space',s.sectionSpace+'px'],['content-width',s.contentWidth+'px'],['section-background',s.sectionBg],['section-background-end',s.sectionEnd],['section-text',s.sectionText],['gradient-angle',s.gradientAngle+'deg'],['overlay-color',s.overlayColor],['overlay-opacity',s.overlayOpacity/100],['image-grayscale',s.grayscale+'%'],['image-position',s.imagePosition],['image-ratio',s.imageRatio],['focus-color',s.focusColor],['motion-duration',s.duration+'ms']];
    return ':root {\n'+list.map(([k,v])=>'  --'+k+': '+v+';').join('\n')+'\n}';
  }
  function markdown(s) {
    const sizes=typeSizes(s),mobile=mobileSizes(s),b=buttonValues(s);
    const n=mdInline(s.name),image=s.imageData?`Uploaded asset: ${mdInline(s.imageName || 'background image')}. Attach this image separately; it is not embedded in this Markdown.`:s.imageUrl?`Image URL: ${mdInline(s.imageUrl)}`:'No image selected. The preview uses a CSS composition as an image-treatment sample; it is not a photography reference.';
    const imageWords={natural:'Natural light, quiet compositions, believable textures; avoid artificial gloss.',editorial:'Editorial photography, deliberate crops, a clear focal point, and consistent art direction.',graphic:'Graphic objects and strong silhouettes; purposeful geometry with clean compositions.',documentary:'Candid, authentic documentary photography with believable settings and natural human detail.'};
    const checks=[['Text / background',s.text,s.background],['Muted / background',s.muted,s.background],['Button label / primary',s.onPrimary,s.primary],['Text / surface',s.text,s.surface],['Link / background',linkColor(s),s.background],['Focus / background',s.focusColor,s.background]];
    const warnings=checks.filter(([,a,c],i)=>contrast(a,c)<(i===5?3:4.5));
    const checkRows=checks.map(([label,a,c],i)=>{const ratio=contrast(a,c),limit=i===5?3:4.5;return `| ${label} | ${ratio.toFixed(2)}:1 | ${ratio>=limit?'Pass':'Needs adjustment'} (${limit}:1) |`;}).join('\n');
    return `# ${n} — UI style guide

> Treat this guide as the visual and interaction contract for the next design. Use the exact values below. Where a decision is not specified, follow the stated intent and existing tokens; ask before inventing a new visual direction.

## 1. Intent and personality

${s.intent.trim()}

${s.personality.trim()}

Starting direction: ${presetInfo[s.preset]?.[0] || 'Custom'}. ${presetInfo[s.preset]?.[1]!=='Original'?'An independent interpretation inspired by '+presetInfo[s.preset]?.[1]+'; the values below are this project’s chosen specification, not official brand tokens.':'An original Studio direction, customized by this project.'}
${presetInfo[s.preset]?.[4]?'\nReference: ['+mdInline(presetInfo[s.preset][1])+']('+presetInfo[s.preset][4]+'). The chosen values remain editable.':''}

### Do

${ruleLines(s.doRules) || '- Keep decisions consistent with this guide.'}

### Avoid

${ruleLines(s.avoidRules) || '- Avoid decoration that has no purpose.'}

## 2. Color system

| Semantic role | Hex | Usage |
| --- | --- | --- |
${palette.map(([key,label])=>`| ${label} | ${s[key]} | ${{background:'Default page canvas',surface:'Cards and elevated content',text:'Headings and essential copy',muted:'Supporting text; never reduce opacity further',primary:'Primary action fills and meaningful emphasis',onPrimary:'Text and icons on primary fill',border:'Subtle decorative dividers and surface edges'}[key]} |`).join('\n')}

- Use semantic roles consistently. Do not introduce arbitrary hex values.
- Border is a decorative token. Essential input outlines and state indicators need at least 3:1 contrast against adjacent colors; use an adjusted text/focus token where necessary.
- Link color alone is insufficient; keep links underlined in body copy.
- Body link color: ${linkColor(s)}. Use primary when it reaches 4.5:1 on the page background; otherwise use the text token. This keeps bright action fills separate from readable body links without introducing another palette color.

### Contrast audit

| Pairing | Contrast | Result / required minimum |
| --- | --- | --- |
${checkRows}

${warnings.length?'**Before shipping:** Adjust the failing pairings above. These are user-selected values, not automatic accessibility approval.':'All listed solid-color text pairings meet the stated thresholds.'} Image overlays, hover states, secondary buttons, and focus on other surfaces require separate checks in the final UI.

## 3. Typography

- Heading family: ${fonts[s.headingFont]}.
- Body and controls: ${fonts[s.bodyFont]}.
- Heading weight: ${s.headingWeight}. Heading line-height: ${s.headingLine}. Tracking: ${s.tracking}em.
- Body size: ${s.bodySize}px; weight: ${s.bodyWeight||'400'}; line-height: ${s.bodyLine}; tracking: normal.
- Heading sizes are independently set for H1–H6 on desktop and mobile. Scale ${s.scale} is an optional generation shortcut; changing one size must not resize the other levels.
- Comfortable reading measure: ${s.measure}ch. Body links are underlined. Strong text uses the nearest supported weight to 600 (${nearestWeight(s.bodyFont,600)}).
- Small text: ${s.smallTextSize}px. Button labels: ${s.buttonTextSize}px. Card titles: ${s.cardTitleSize}px. Card body text: ${s.cardTextSize}px. Keep important instructions comfortably readable.
- Load the chosen families through Google Fonts or a licensed local source. Use the declared fallback stacks when fonts are unavailable. Do not substitute a new visual style silently.
${[...new Set([s.headingFont,s.bodyFont])].map(name=>[name,fontUrl(name,[s.headingWeight,s.bodyWeight||400,s.buttonWeight,600])]).filter(([,url])=>url).map(([name,url])=>'- Google Fonts stylesheet: ['+mdInline(name)+']('+url+')').join('\n')}

| Level | Desktop size | Mobile size (≤600px content width) | Weight | Line height | Letter spacing |
| --- | --- | --- | --- | --- | --- |
${sizes.map((v,i)=>`| H${i+1} | ${v}px | ${mobile[i]}px | ${s.headingWeight} | ${s.headingLine} | ${s.tracking}em |`).join('\n')}

These sizes are exact user choices, not a requirement to use every heading level. Use one H1, then semantic heading order. Card titles use their separate ${s.cardTitleSize}px token; specimen section labels are part of the guide layout. On mobile, use the mobile values exactly and allow natural wrapping. Review very small sizes for readability.

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
- Font: body family, ${s.buttonTextSize}px, weight ${s.buttonWeight}, line-height 1.3.
- Primary: fill ${s.primary}, label ${s.onPrimary}, transparent 1px border.
- Secondary: transparent fill, text ${s.text}, 1px ${s.border} border. Its text communicates the action; strengthen the border if needed to identify the control.
- Text action: transparent, color ${linkColor(s)} (the readable link token); no decorative container. Preserve an accessible hit area and a clear label.
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
- Card title: ${s.cardTitleSize}px in heading family. Card text: ${s.cardTextSize}px with body line-height. Let content determine card height.
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
  return {fonts,fontCatalog,fontMetadata,validFontName,registerFont,weightsFor,nearestWeight,fontUrl,palette,presets,presetInfo,numeric,enums,clone,isColor,safeUrl,sanitize,contrast,linkColor,scaleSizes,typeSizes,mobileSizes,buttonValues,filename,cssTokens,markdown};
});
