(function(){
  'use strict';
  var doc=document,root=doc.documentElement,body=doc.body;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse=window.matchMedia('(pointer: coarse)').matches;

  function ready(){
    var boot=doc.querySelector('.boot');
    if(boot)boot.classList.add('is-hidden');
    body.classList.remove('is-loading');
    var title=doc.querySelector('[data-title]');
    if(title)title.classList.add('is-visible');
    if(boot)window.setTimeout(function(){boot.remove();},750);
  }
  window.addEventListener('load',function(){window.setTimeout(ready,380);});
  window.setTimeout(ready,2600);

  var page=body.dataset.page;
  var active=doc.querySelector('[data-nav="'+page+'"]');
  if(active)active.classList.add('is-active');

  var header=doc.querySelector('[data-header]');
  var progress=doc.querySelector('.scroll-progress i');
  var scrollValue=doc.querySelector('[data-scroll-value]');
  var parallax=[].slice.call(doc.querySelectorAll('[data-parallax]'));
  var ticking=false;
  function updateScroll(){
    var y=window.scrollY||0,max=root.scrollHeight-window.innerHeight;
    if(header)header.classList.toggle('is-scrolled',y>30);
    if(progress)progress.style.transform='scaleX('+(max?Math.min(1,y/max):0)+')';
    if(scrollValue)scrollValue.textContent=String(Math.min(999,Math.round(y))).padStart(3,'0');
    if(!reduce)parallax.forEach(function(el){var speed=parseFloat(el.dataset.speed||.05);el.style.transform='translate3d(0,'+(y*speed)+'px,0) scale(1.06)';});
    ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){requestAnimationFrame(updateScroll);ticking=true;}},{passive:true});updateScroll();

  var reveals=[].slice.call(doc.querySelectorAll('[data-reveal]'));
  if('IntersectionObserver' in window&&!reduce){
    var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});},{threshold:.12,rootMargin:'0px 0px -5%'});
    reveals.forEach(function(el){observer.observe(el);});
  }else reveals.forEach(function(el){el.classList.add('is-visible');});

  var clock=doc.querySelector('[data-clock]');
  function tick(){if(clock)clock.textContent=new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Shanghai'}).format(new Date())+' CST';}
  tick();window.setInterval(tick,30000);
  doc.querySelectorAll('[data-year]').forEach(function(el){el.textContent=new Date().getFullYear();});

  var command=doc.querySelector('[data-command]'),openButton=doc.querySelector('[data-command-open]');
  function openCommand(){if(!command)return;command.hidden=false;body.classList.add('command-open');var first=command.querySelector('a');if(first)window.setTimeout(function(){first.focus();},40);}
  function closeCommand(){if(!command)return;command.hidden=true;body.classList.remove('command-open');if(openButton)openButton.focus();}
  if(openButton)openButton.addEventListener('click',openCommand);
  doc.querySelectorAll('[data-command-close]').forEach(function(el){el.addEventListener('click',closeCommand);});
  doc.addEventListener('keydown',function(e){if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();command&&!command.hidden?closeCommand():openCommand();}if(e.key==='Escape'&&command&&!command.hidden)closeCommand();});

  doc.querySelectorAll('.spotlight').forEach(function(el){el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px');},{passive:true});});

  if(!coarse&&!reduce){
    var dot=doc.querySelector('.cursor--dot'),ring=doc.querySelector('.cursor--ring');
    var mx=-100,my=-100,rx=-100,ry=-100;
    window.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;if(dot)dot.classList.add('is-visible');if(ring)ring.classList.add('is-visible');},{passive:true});
    (function cursorLoop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;if(dot)dot.style.translate=(mx-2.5)+'px '+(my-2.5)+'px';if(ring)ring.style.translate=(rx-ring.offsetWidth/2)+'px '+(ry-ring.offsetHeight/2)+'px';requestAnimationFrame(cursorLoop);}());
    doc.querySelectorAll('a,button,[data-tilt]').forEach(function(el){el.addEventListener('mouseenter',function(){if(ring)ring.classList.add('is-active');});el.addEventListener('mouseleave',function(){if(ring)ring.classList.remove('is-active');});});
    doc.querySelectorAll('.magnetic').forEach(function(el){el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.11)+'px,'+((e.clientY-r.top-r.height/2)*.14)+'px)';});el.addEventListener('pointerleave',function(){el.style.transform='';});});
    doc.querySelectorAll('[data-tilt]').forEach(function(el){el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(1200px) rotateX('+(-y*2.5)+'deg) rotateY('+(x*3.5)+'deg) translateY(-4px)';});el.addEventListener('pointerleave',function(){el.style.transform='';});});
  }

  var canvas=doc.getElementById('ambient-canvas');
  if(canvas&&!reduce){
    var ctx=canvas.getContext('2d',{alpha:true}),particles=[],cw=0,ch=0,dpr=Math.min(window.devicePixelRatio||1,1.5),pointer={x:-9999,y:-9999};
    function resize(){cw=canvas.clientWidth;ch=canvas.clientHeight;canvas.width=Math.floor(cw*dpr);canvas.height=Math.floor(ch*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);particles=[];var count=Math.min(coarse?30:68,Math.floor(cw/20));for(var i=0;i<count;i++)particles.push({x:Math.random()*cw,y:Math.random()*ch,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,r:Math.random()*1.1+.25,a:Math.random()*.4+.1});}
    canvas.parentElement.addEventListener('pointermove',function(e){pointer.x=e.clientX;pointer.y=e.clientY;},{passive:true});canvas.parentElement.addEventListener('pointerleave',function(){pointer.x=-9999;pointer.y=-9999;});
    function draw(){ctx.clearRect(0,0,cw,ch);for(var i=0;i<particles.length;i++){var p=particles[i],dx=p.x-pointer.x,dy=p.y-pointer.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<145){var f=(145-dist)/145;p.vx+=(dx/dist||0)*f*.014;p.vy+=(dy/dist||0)*f*.014;}p.vx*=.993;p.vy*=.993;p.x+=p.vx;p.y+=p.vy;if(p.x<-8)p.x=cw+8;if(p.x>cw+8)p.x=-8;if(p.y<-8)p.y=ch+8;if(p.y>ch+8)p.y=-8;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(158,242,226,'+p.a+')';ctx.fill();for(var j=i+1;j<particles.length;j++){var q=particles[j],lx=p.x-q.x,ly=p.y-q.y,ld=lx*lx+ly*ly;if(ld<7000){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='rgba(130,218,205,'+(.055*(1-ld/7000))+')';ctx.stroke();}}}requestAnimationFrame(draw);}
    window.addEventListener('resize',resize,{passive:true});resize();draw();
  }

  var preview=doc.querySelector('[data-hover-preview]');
  if(preview&&!coarse&&!reduce){
    var previewTitle=preview.querySelector('span'),previewMeta=preview.querySelector('p'),px=-400,py=-400,tx=-400,ty=-400;
    doc.querySelectorAll('[data-preview]').forEach(function(el){
      el.addEventListener('pointerenter',function(){preview.dataset.kind=el.dataset.preview;previewTitle.textContent=el.dataset.previewTitle||'';previewMeta.textContent=el.dataset.previewMeta||'';preview.classList.add('is-visible');});
      el.addEventListener('pointermove',function(e){tx=Math.min(window.innerWidth-300,e.clientX+24);ty=Math.min(window.innerHeight-230,e.clientY+24);},{passive:true});
      el.addEventListener('pointerleave',function(){preview.classList.remove('is-visible');});
    });
    (function previewLoop(){px+=(tx-px)*.18;py+=(ty-py)*.18;preview.style.transform='translate3d('+px+'px,'+py+'px,0) scale('+(preview.classList.contains('is-visible')?1:.92)+')';requestAnimationFrame(previewLoop);}());
  }

  var printResume=doc.querySelector('[data-print-resume]');
  if(printResume)printResume.addEventListener('click',function(){window.print();});

  var article=doc.querySelector('[data-article-content]');
  if(article){
    var headings=[].slice.call(article.querySelectorAll('h2,h3')),toc=doc.querySelector('[data-article-toc]');
    headings.forEach(function(h,index){if(!h.id)h.id='section-'+(index+1);if(toc){var link=doc.createElement('a');link.href='#'+h.id;link.textContent=h.textContent;link.dataset.target=h.id;toc.appendChild(link);}});
    if('IntersectionObserver' in window&&toc){var tocObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){toc.querySelectorAll('a').forEach(function(a){a.classList.toggle('is-active',a.dataset.target===entry.target.id);});}});},{rootMargin:'-18% 0px -70%'});headings.forEach(function(h){tocObserver.observe(h);});}
    article.querySelectorAll('pre').forEach(function(pre){var button=doc.createElement('button');button.type='button';button.className='code-copy';button.textContent='COPY';button.addEventListener('click',function(){var code=pre.querySelector('code');navigator.clipboard&&navigator.clipboard.writeText(code?code.innerText:pre.innerText).then(function(){button.textContent='COPIED';window.setTimeout(function(){button.textContent='COPY';},1200);});});pre.appendChild(button);});
    var words=article.innerText.replace(/\s+/g,'').length,reading=doc.querySelector('[data-reading-time]');if(reading)reading.textContent=Math.max(1,Math.ceil(words/450))+' MIN READ';
    var meter=doc.querySelector('[data-reading-meter]');window.addEventListener('scroll',function(){if(!meter)return;var r=article.getBoundingClientRect(),total=article.offsetHeight-window.innerHeight,passed=Math.min(total,Math.max(0,-r.top+100));meter.style.setProperty('--read',(total?passed/total*100:0)+'%');},{passive:true});
    var copyUrl=doc.querySelector('[data-copy-url]');if(copyUrl)copyUrl.addEventListener('click',function(){navigator.clipboard&&navigator.clipboard.writeText(location.href).then(function(){copyUrl.textContent='已复制';window.setTimeout(function(){copyUrl.textContent='复制文章链接';},1200);});});
  }

  var curtain=doc.querySelector('.route-curtain');
  if(curtain&&!reduce){
    body.classList.add('route-arrived');window.setTimeout(function(){body.classList.remove('route-arrived');},650);
    doc.addEventListener('click',function(e){var link=e.target.closest('a');if(!link||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||link.target==='_blank'||link.hasAttribute('download'))return;var url=new URL(link.href,location.href);if(url.origin!==location.origin||url.pathname===location.pathname&&url.hash)return;e.preventDefault();curtain.classList.add('is-active');window.setTimeout(function(){location.href=url.href;},470);});
    window.addEventListener('pageshow',function(){curtain.classList.remove('is-active');});
  }
}());
