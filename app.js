(function () {
  'use strict';
  const C = window.StyleCore;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const STORAGE_KEY = 'styleguide-studio-v1';
  let state = C.clone(C.presets.warm), saveTimer, toastTimer, bootNotice = '', imageError = false, imageToken = 0;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved) state = C.sanitize(JSON.parse(saved));
  } catch { bootNotice = 'Your saved project could not be loaded. A fresh guide is ready.'; }
  function icon(id) {return `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;}
  function toast(message) {clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4200);}
  function colorControl(key, label) {
    const row=document.createElement('div');row.className='color-control';
    const swatch=document.createElement('label');swatch.className='color-swatch';swatch.title='Choose '+label.toLowerCase();
    const picker=document.createElement('input');picker.type='color';picker.dataset.key=key;picker.setAttribute('aria-label',label+' color');swatch.append(picker);
    const name=document.createElement('label');name.textContent=label;name.htmlFor='hex-'+key;
    const hex=document.createElement('input');hex.className='hex-input';hex.id='hex-'+key;hex.dataset.key=key;hex.type='text';hex.maxLength=7;hex.spellcheck=false;hex.setAttribute('aria-label',label+' hex value');hex.pattern='#[0-9a-fA-F]{6}';
    row.append(swatch,name,hex);return row;
  }
  C.palette.forEach(([key,label])=>$('#palette-controls').append(colorControl(key,label)));
  [['sectionBg','Base color'],['sectionEnd','Gradient end'],['sectionText','Section text']].forEach(([key,label])=>{const row=colorControl(key,label);if(key==='sectionEnd')row.dataset.show='gradient';$('#section-colors').append(row);});
  $('#overlay-color').append(colorControl('overlayColor','Overlay color'));
  $$('.font-select').forEach(select=>Object.keys(C.fonts).forEach(name=>{const option=new Option(name,name);option.style.fontFamily=C.fonts[name];select.append(option);}));
  const controlLabels={headingFont:'Heading font',bodyFont:'Body font',h1:'H1 size',scale:'Type scale',headingWeight:'Heading weight',headingLine:'Heading line height',tracking:'Heading letter spacing',bodySize:'Body size in pixels',bodyLine:'Body line height',measure:'Reading width',radius:'Card corner radius',cardPadding:'Card padding',sectionSpace:'Section space',gradientAngle:'Gradient direction',grayscale:'Grayscale',overlayOpacity:'Overlay opacity'};
  $$('[data-key]').forEach(el=>{if(controlLabels[el.dataset.key])el.setAttribute('aria-label',controlLabels[el.dataset.key]);});
  function syncControls() {
    $$('[data-key]').forEach(el=>{const value=state[el.dataset.key];if(el.type==='checkbox')el.checked=value;else el.value=value;el.removeAttribute('aria-invalid');});
    $('#preset').value=state.preset;
  }
  function persist() {
    clearTimeout(saveTimer);
    $('#save-status').innerHTML='<span></span>Saving…';
    saveTimer=setTimeout(()=>{
      try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$('#save-status').innerHTML='<span></span>Saved on this device';}
      catch {$('#save-status').textContent='Not saved · export a backup';toast('This device could not save your changes. Use Save project to keep a backup.');}
    },350);
  }
  function update(stateChanged=true) {render();if(stateChanged)persist();}
  function setColorUI(key) {
    $$(`[data-key="${key}"]`).forEach(el=>{el.value=state[key];el.removeAttribute('aria-invalid');if(el.type==='color'&&el.parentElement.classList.contains('color-swatch'))el.parentElement.style.background=state[key];});
  }
  function applyControl(el) {
    const key=el.dataset.key;
    let value=el.type==='checkbox'?el.checked:el.value;
    if(C.numeric[key]) {value=Number(value);if(el.value===''||!Number.isFinite(value))return;const[min,max]=C.numeric[key];value=Math.min(max,Math.max(min,value));}
    if(C.isColor(state[key])) {
      if(!C.isColor(value)){el.setAttribute('aria-invalid','true');return;}
      value=value.toLowerCase();
    }
    if(key==='imageUrl'){
      if(value&&!C.safeUrl(value)){el.setAttribute('aria-invalid','true');toast('Use a complete http or https image URL.');return;}
      value=C.safeUrl(value);state.imageData='';state.imageName='';imageError=false;
    }
    if(typeof value==='string'&&el.maxLength>0)value=value.slice(0,el.maxLength);
    state[key]=value;el.removeAttribute('aria-invalid');if(C.isColor(value))setColorUI(key);update();
  }
  $$('[data-key]').forEach(el=>{
    const type=el.type;
    el.addEventListener(el.dataset.key==='imageUrl'?'change':'input',()=>applyControl(el));
    if(type==='number')el.addEventListener('change',()=>{el.value=state[el.dataset.key];});
    if(el.classList.contains('hex-input'))el.addEventListener('blur',()=>{if(!C.isColor(el.value)){el.value=state[el.dataset.key];el.removeAttribute('aria-invalid');toast('Use a six-digit hex color, such as #2d2c2c.');}});
  });
  function setupTabs(selector,attribute,callback) {
    const tabs=$$(selector);
    function activate(tab,focus=false){tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;$('#'+t.getAttribute('aria-controls')).hidden=!selected;});if(focus)tab.focus();if(callback)callback(tab.dataset[attribute]);}
    tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',event=>{let next=i;if(event.key==='ArrowRight')next=(i+1)%tabs.length;else if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();activate(tabs[next],true);});});
  }
  function scrollPreview(panel) {
    if($('#preview-view').hidden)return;
    const target=$({basics:'.preview-topline',type:'.type-section',ui:'#components',media:'#background-specimen',rules:'.preview-topline'}[panel]);
    const area=$('#canvas-area');area.scrollTop+=target.getBoundingClientRect().top-area.getBoundingClientRect().top-22;
  }
  setupTabs('.settings-tabs [role=tab]','panel',panel=>{$('.settings-scroll').scrollTop=0;scrollPreview(panel);});
  setupTabs('.view-tabs [role=tab]','view',view=>{$('.viewport-controls').hidden=view==='markdown';if(view==='preview')scrollPreview($('.settings-tabs [aria-selected=true]').dataset.panel);else $('#canvas-area').scrollTop=0;});
  function render() {
    const page=$('#preview-page'),sizes=C.typeSizes(state),mobile=C.mobileSizes(state),b=C.buttonValues(state);
    const vars={};C.palette.forEach(([key])=>vars[key==='background'?'--p-bg':'--p-'+key.replace(/[A-Z]/g,x=>'-'+x.toLowerCase())]=state[key]);
    Object.assign(vars,{'--p-heading-font':C.fonts[state.headingFont],'--p-body-font':C.fonts[state.bodyFont],'--heading-weight':state.headingWeight,'--heading-line':state.headingLine,'--tracking':state.tracking+'em','--body-size':state.bodySize+'px','--body-line':state.bodyLine,'--measure':state.measure+'ch','--button-height':b.height+'px','--button-padding':b.padding+'px','--button-radius':b.radius+'px','--button-weight':state.buttonWeight,'--card-radius':state.radius+'px','--card-padding':state.cardPadding+'px','--card-border':state.cardStyle==='border'?'1px solid var(--p-border)':'0 solid transparent','--card-shadow':state.cardStyle==='shadow'?'0 8px 28px rgb(0 0 0 / 0.08)':'none','--section-space':state.sectionSpace+'px','--content-width':state.contentWidth+'px','--section-bg':state.sectionBg,'--section-text':state.sectionText,'--image-position':state.imagePosition,'--grayscale':state.grayscale+'%','--image-ratio':state.imageRatio,'--focus-color':state.focusColor,'--duration':state.duration+'ms'});
    sizes.forEach((v,i)=>vars['--h'+(i+1)]=v+'px');mobile.forEach((v,i)=>vars['--mobile-h'+(i+1)]=v+'px');
    Object.entries(vars).forEach(([key,value])=>page.style.setProperty(key,value));
    page.dataset.arrow=state.buttonArrow;page.dataset.hover=state.buttonHover;
    $('#preview-name').textContent=state.name;$('#footer-name').textContent=state.name;
    for(const [key] of C.palette)setColorUI(key);
    for(const key of ['sectionBg','sectionEnd','sectionText','overlayColor'])setColorUI(key);
    const units={h1:'px',tracking:'em',measure:'ch',radius:'px',cardPadding:'px',sectionSpace:'px',gradientAngle:'°',grayscale:'%',overlayOpacity:'%'};
    $$('[data-output]').forEach(output=>output.textContent=state[output.dataset.output]+units[output.dataset.output]);
    $$('[data-show]').forEach(el=>el.hidden=el.dataset.show!==state.backgroundStyle);
    $('#image-name').textContent=state.imageName?'Selected: '+state.imageName+' · Attach the asset with your guide.':state.imageUrl?'Remote image · Requires an internet connection.':'Use an image you own. Maximum 3 MB.';
    const contrasts=[['#text-contrast',state.text,state.background],['#button-contrast',state.onPrimary,state.primary],['#muted-contrast',state.muted,state.background]];
    contrasts.forEach(([id,a,c])=>{const ratio=C.contrast(a,c),pass=ratio>=4.5;$(id).textContent=ratio.toFixed(2)+':1 '+(pass?'✓':'!');$(id).classList.toggle('fail',!pass);$(id).setAttribute('aria-label',ratio.toFixed(2)+' to 1, '+(pass?'passes':'fails')+' WCAG AA normal text');});
    $('#palette-swatches').replaceChildren(...C.palette.map(([key,label,short])=>{const el=document.createElement('div');el.className='palette-swatch';const chip=document.createElement('div');chip.className='chip';chip.style.setProperty('--chip',state[key]);chip.setAttribute('aria-label',label+' '+state[key]);const name=document.createElement('strong');name.textContent=short;const hex=document.createElement('code');hex.textContent=state[key].toUpperCase();el.append(chip,name,hex);return el;}));
    $('#type-meta').replaceChildren(...['Headings / '+state.headingFont+' '+state.headingWeight,'Body / '+state.bodyFont+' 400'].map(t=>{const el=document.createElement('span');el.textContent=t;return el;}));
    const words=['A clear point of view.','Make room for ideas.','Good things, considered.','Every detail matters.','Simple. Useful. Human.','A little more intention.'];
    $('#type-specimens').replaceChildren(...sizes.map((size,i)=>{const row=document.createElement('div');row.className='type-specimen';const label=document.createElement('span');label.className='type-name';label.textContent='H'+(i+1);const heading=document.createElement('h'+(i+1));heading.textContent=words[i];const detail=document.createElement('span');detail.className='type-size';detail.textContent=size+' / '+state.headingWeight;row.append(label,heading,detail);return row;}));
    const steps=[1,2,3,4,6,8].map(x=>x*state.spacing);
    $('#spacing-bars').replaceChildren(...steps.map((size,i)=>{const div=document.createElement('div');div.className='spacing-item';const block=document.createElement('div');block.className='spacing-block';block.style.setProperty('--size',size+'px');block.style.setProperty('--opacity',.2+i*.15);const label=document.createElement('span');label.textContent=size;div.append(block,label);return div;}));
    $('#spacing-caption').textContent=state.spacing+'px rhythm · '+state.sectionSpace+'px section space · '+state.contentWidth+'px content width';
    renderBackground();
    const md=C.markdown(state);$('#markdown-code').textContent=md;$('#markdown-filename').textContent=C.filename(state)+'.md';$('#markdown-count').textContent=md.split('\n').length+' lines';
    $('#guide-summary').textContent=new Set([state.headingFont,state.bodyFont]).size+' fonts · 7 colors · 1 clear direction';
  }
  let previousImage='';
  function renderBackground() {
    const img=state.imageData||state.imageUrl;
    const cssUrl=img?'url("'+img.replace(/"/g,'%22').replace(/\n/g,'')+'")':'none';
    $('#background-specimen').style.background=state.backgroundStyle==='gradient'?`linear-gradient(${state.gradientAngle}deg,${state.sectionBg},${state.sectionEnd})`:state.sectionBg;
    $('#background-image').style.backgroundImage=state.backgroundStyle==='image'?cssUrl:'none';
    const art=$('#card-art');art.style.backgroundImage=img?cssUrl:'';art.classList.toggle('has-image',!!img);
    art.setAttribute('aria-label',img?'Selected image with current crop and grayscale treatment':'Abstract architectural composition, image treatment sample');
    const hex=state.overlayColor,alpha=(state.overlayOpacity/100).toFixed(2),r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16),rgba=`rgba(${r},${g},${b},${alpha})`;
    $('#background-overlay').style.background=state.overlayStyle==='none'?'transparent':state.overlayStyle==='solid'?rgba:`linear-gradient(to top,${rgba},transparent)`;
    if(img&&img!==previousImage){previousImage=img;const token=++imageToken;const probe=new Image();probe.onload=()=>{if(token!==imageToken)return;imageError=false;};probe.onerror=()=>{if(token!==imageToken)return;imageError=true;toast('The image could not load. Check the URL or upload a local file.');$('#image-name').textContent='Image unavailable. Check the URL or choose a local file.';};probe.src=img;}
    if(!img){previousImage='';imageToken++;}
    if(imageError&&img)$('#image-name').textContent='Image unavailable. Check the URL or choose a local file.';
  }
  function download(data,filename,type) {
    const blob=new Blob([data],{type});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportMarkdown(){download(C.markdown(state),C.filename(state)+'.md','text/plain;charset=utf-8');toast('Your Markdown guide is ready. Attach it to your next design brief.');}
  ['#export-top','#export-markdown'].forEach(id=>$(id).addEventListener('click',exportMarkdown));
  $('#save-project').addEventListener('click',()=>{download(JSON.stringify(state,null,2),C.filename(state)+'.json','application/json');toast('Project saved. Import it any time to keep editing.');});
  $('#copy-guide').addEventListener('click',async()=>{
    const md=C.markdown(state);
    try {if(!navigator.clipboard)throw new Error();await navigator.clipboard.writeText(md);}
    catch {const ta=document.createElement('textarea');ta.value=md;ta.setAttribute('aria-hidden','true');ta.style.cssText='position:fixed;opacity:0;inset:0;pointer-events:none';document.body.append(ta);ta.select();const copied=document.execCommand('copy');ta.remove();$('#copy-guide').focus();if(!copied){toast('Clipboard is unavailable here. Download the .md file instead.');return;}}
    toast('Guide copied. Paste it before your next design brief.');const button=$('#copy-guide');button.innerHTML=icon('check')+'Copied';setTimeout(()=>button.innerHTML=icon('copy')+'Copy guide',2000);
  });
  $('#preset').addEventListener('change',()=>{state=C.clone(C.presets[$('#preset').value]);imageError=false;syncControls();update();toast('Preset applied. Your guide is ready to customize.');});
  $('#import-project').addEventListener('click',()=>$('#project-file').click());
  $('#project-file').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    if(file.size>6500000){toast('Choose a project file smaller than 6 MB.');event.target.value='';return;}
    try{const parsed=JSON.parse(await file.text());state=C.sanitize(parsed);imageError=false;syncControls();update();toast('Project imported. All your settings are ready.');}catch(error){toast(error instanceof SyntaxError?'This is not valid JSON. Choose a saved Styleguide Studio project.':error.message);}
    event.target.value='';
  });
  $('#image-file').addEventListener('change',event=>{
    const file=event.target.files[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)){toast('Choose a JPG, PNG, WebP, or AVIF image.');event.target.value='';return;}
    if(file.size>3*1024*1024){toast('Choose an image smaller than 3 MB.');event.target.value='';return;}
    const reader=new FileReader();reader.onload=()=>{state.imageData=String(reader.result);state.imageName=file.name;state.imageUrl='';state.backgroundStyle='image';imageError=false;syncControls();update();toast('Image added. Adjust its crop and overlay in Media.');};reader.onerror=()=>toast('This image could not be read. Try another file.');reader.readAsDataURL(file);event.target.value='';
  });
  $('#remove-image').addEventListener('click',()=>{state.imageData='';state.imageUrl='';state.imageName='';imageError=false;syncControls();update();toast('Image removed.');});
  function setViewport(mobile){$('#preview-page').classList.toggle('is-mobile',mobile);$('#mobile').classList.toggle('selected',mobile);$('#desktop').classList.toggle('selected',!mobile);$('#mobile').setAttribute('aria-pressed',mobile);$('#desktop').setAttribute('aria-pressed',!mobile);}
  $('#mobile').addEventListener('click',()=>setViewport(true));$('#desktop').addEventListener('click',()=>setViewport(false));
  $('#how-to').addEventListener('click',()=>$('#help-dialog').showModal());$('#reset').addEventListener('click',()=>$('#reset-dialog').showModal());
  $$('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $('#confirm-reset').addEventListener('click',()=>{state=C.clone(C.presets[state.preset]);imageError=false;syncControls();update();$('#reset-dialog').close();toast('Preset restored.');});
  $$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}}));
  $$('.demo-action').forEach(button=>button.addEventListener('click',()=>toast('Preview component · Your current button style is included in the guide.')));
  $('#sample-form').addEventListener('submit',event=>{event.preventDefault();$('#sample-message').textContent='Looks good. This is a local form preview.';});
  $('#specimen-link').addEventListener('click',event=>{event.preventDefault();$('#components').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
  window.addEventListener('beforeunload',()=>{if(saveTimer){clearTimeout(saveTimer);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{/* Export project remains available. */}}});
  syncControls();update(false);if(bootNotice)toast(bootNotice);
})();
