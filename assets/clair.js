/* Clair: loader per public site. Contains no administration key. */
(()=>{
 'use strict';
 const loader=document.currentScript,site=loader?.dataset.site;
 if(!site||window.__clairLoader)return;window.__clairLoader=true;
 // Existing owner opt-out links remain effective, without reading Umami data.
 try{const q=new URLSearchParams(location.search);if(q.has('pasmoi'))localStorage.setItem('clair.disabled','1');if(q.has('moi')){localStorage.removeItem('clair.disabled');localStorage.removeItem('umami.disabled');}}catch{}
 const script=document.createElement('script');script.src='https://stellar-palmier-858ecb.netlify.app/tracker.js';script.dataset.site=site;script.defer=true;
 const pending=[];
 const track=name=>{if(window.clair)window.clair.track(name);else if(pending.length<20)pending.push(name);};
 script.onload=()=>{for(const name of pending)window.clair?.track(name);pending.length=0;};
 script.onerror=()=>{pending.length=0;};
 document.head.appendChild(script);
 document.addEventListener('click',event=>{
  const el=event.target.closest?.('a,button,input[type=submit]');if(!el||el.hasAttribute('data-clair-event'))return;
  if(el.hasAttribute('data-checkout')){track('clic_acheter');return;}
  if(el.dataset.link==='trial'||el.hasAttribute('download')){track('clic_telecharger');return;}
  const href=el.getAttribute('href')||'';
  if(/^mailto:/i.test(href)){track('clic_contact');return;}
  if(/^https:\/\/(?:play\.google\.com|apps\.apple\.com)\//i.test(href)){track('clic_installer');return;}
  if(/\.(?:exe|msi|apk|dmg|zip)(?:[?#]|$)/i.test(href))track('clic_telecharger');
 });
 document.addEventListener('submit',event=>{
  const form=event.target;if(!(form instanceof HTMLFormElement))return;
  if(form.hasAttribute('data-clair-event'))return;
  // Submission is an intent; only a backend acknowledgement proves delivery.
  if(form.hasAttribute('data-netlify'))track('envoi_formulaire');
 });
})();
