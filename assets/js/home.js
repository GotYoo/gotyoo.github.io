(function(){
  'use strict';
  var doc=document,root=doc.documentElement,body=doc.body;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse=window.matchMedia('(pointer: coarse)').matches;

  body.classList.add('is-loading');
  window.addEventListener('load',function(){
    window.setTimeout(function(){
      var boot=doc.querySelector('.boot');
      if(boot)boot.classList.add('is-hidden');
      body.classList.remove('is-loading');
      var title=doc.querySelector('.hero__title');
      if(title)title.classList.add('is-visible');
      if(boot)window.setTimeout(function(){boot.remove();},700);
    },420);
  });

  var header=doc.querySelector('[data-header]');
  var progress=doc.querySelector('.scroll-progress i');
  var parallax=Array.prototype.slice.call(doc.querySelectorAll('[data-parallax]'));
  var ticking=false;
  function updateScroll(){
    var y=window.scrollY||0;
    if(header)header.classList.toggle('is-scrolled',y>40);
    var max=doc.documentElement.scrollHeight-window.innerHeight;
    if(progress)progress.style.transform='scaleX('+(max?Math.min(1,y/max):0)+')';
    if(!reduce)parallax.forEach(function(el){
      var speed=parseFloat(el.dataset.speed||0.1);
      el.style.transform='translate3d(0,'+(y*speed)+'px,0) scale(1.06)';
    });
    ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){requestAnimationFrame(updateScroll);ticking=true;}},{passive:true});
  updateScroll();

  var reveals=Array.prototype.slice.call(doc.querySelectorAll('[data-reveal]'));
  if('IntersectionObserver' in window&&!reduce){
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
    },{threshold:.13,rootMargin:'0px 0px -6%'});
    reveals.forEach(function(el){observer.observe(el);});
  }else{reveals.forEach(function(el){el.classList.add('is-visible');});}

  var clock=doc.querySelector('[data-clock]');
  function tickClock(){if(clock)clock.textContent=new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Shanghai'}).format(new Date())+' CST';}
  tickClock();window.setInterval(tickClock,30000);
  var year=doc.querySelector('[data-year]');if(year)year.textContent=new Date().getFullYear();

  if(!coarse&&!reduce){
    var dot=doc.querySelector('.cursor--dot'),ring=doc.querySelector('.cursor--ring');
    var mx=-100,my=-100,rx=-100,ry=-100;
    window.addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;dot&&dot.classList.add('is-visible');ring&&ring.classList.add('is-visible');},{passive:true});
    function cursorLoop(){
      rx+=(mx-rx)*.15;ry+=(my-ry)*.15;
      if(dot)dot.style.translate=(mx-2.5)+'px '+(my-2.5)+'px';
      if(ring)ring.style.translate=(rx-21)+'px '+(ry-21)+'px';
      requestAnimationFrame(cursorLoop);
    }cursorLoop();
    doc.querySelectorAll('a,[data-tilt]').forEach(function(el){
      el.addEventListener('mouseenter',function(){ring&&ring.classList.add('is-active');});
      el.addEventListener('mouseleave',function(){ring&&ring.classList.remove('is-active');});
    });

    doc.querySelectorAll('.magnetic').forEach(function(el){
      el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.12)+'px,'+((e.clientY-r.top-r.height/2)*.16)+'px)';});
      el.addEventListener('pointerleave',function(){el.style.transform='';});
    });

    doc.querySelectorAll('[data-tilt]').forEach(function(el){
      el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(1000px) rotateX('+(-y*4)+'deg) rotateY('+(x*5)+'deg) translateY(-3px)';});
      el.addEventListener('pointerleave',function(){el.style.transform='';});
    });
  }

  var canvas=doc.getElementById('ambient-canvas');
  if(canvas&&!reduce){
    var ctx=canvas.getContext('2d',{alpha:true});
    var particles=[],cw=0,ch=0,dpr=Math.min(window.devicePixelRatio||1,1.5),pointer={x:-9999,y:-9999};
    function resize(){
      cw=canvas.clientWidth;ch=canvas.clientHeight;canvas.width=Math.floor(cw*dpr);canvas.height=Math.floor(ch*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
      var count=Math.min(coarse?34:72,Math.floor(cw/18));particles=[];
      for(var i=0;i<count;i++)particles.push({x:Math.random()*cw,y:Math.random()*ch,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.1,r:Math.random()*1.2+.35,a:Math.random()*.45+.12});
    }
    canvas.parentElement.addEventListener('pointermove',function(e){pointer.x=e.clientX;pointer.y=e.clientY;},{passive:true});
    canvas.parentElement.addEventListener('pointerleave',function(){pointer.x=-9999;pointer.y=-9999;});
    function draw(){
      ctx.clearRect(0,0,cw,ch);
      for(var i=0;i<particles.length;i++){
        var p=particles[i],dx=p.x-pointer.x,dy=p.y-pointer.y,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<150){var force=(150-dist)/150;p.vx+=(dx/dist||0)*force*.015;p.vy+=(dy/dist||0)*force*.015;}
        p.vx*=.992;p.vy*=.992;p.x+=p.vx;p.y+=p.vy;
        if(p.x<-10)p.x=cw+10;if(p.x>cw+10)p.x=-10;if(p.y<-10)p.y=ch+10;if(p.y>ch+10)p.y=-10;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(213,226,218,'+p.a+')';ctx.fill();
        for(var j=i+1;j<particles.length;j++){
          var q=particles[j],lx=p.x-q.x,ly=p.y-q.y,ld=lx*lx+ly*ly;
          if(ld<6800){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='rgba(164,194,187,'+(0.06*(1-ld/6800))+')';ctx.stroke();}
        }
      }
      requestAnimationFrame(draw);
    }
    window.addEventListener('resize',resize,{passive:true});resize();draw();
  }
})();
