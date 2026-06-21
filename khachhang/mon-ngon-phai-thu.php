<?php
session_start();
// Lấy thông tin từ session (nếu khách đã đăng nhập)
$isLoggedIn = isset($_SESSION['MaKH']) ? 'true' : 'false';
$maKH = isset($_SESSION['MaKH']) ? $_SESSION['MaKH'] : 0;
$tenUser = isset($_SESSION['TenHienThi']) ? $_SESSION['TenHienThi'] : "";
$servername = "localhost";
$username = "root"; // Tên đăng nhập DB của bạn
$password = ""; // Mật khẩu DB của bạn
$dbname = "jollibee_db"; // ĐIỀN TÊN DATABASE CỦA BẠN VÀO ĐÂY

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}
mysqli_set_charset($conn, "utf8");
?>
<html lang="vi"><head>
        <script type="text/javascript" async="" src="https://analytics.tiktok.com/i18n/pixel/static/main.MWE0ZWQ3ZWQwOQ.js" data-id="CMRLVARC77U705JG557G"></script><script type="text/javascript" async="" src="https://analytics.tiktok.com/i18n/pixel/enable_cookie"></script><script async="" src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=CMRLVARC77U705JG557G&amp;lib=ttq"></script><script type="text/javascript" async="" src="https://analytics.tiktok.com/i18n/pixel/static/identify_5cff1caf.js"></script><script type="text/javascript" async="" src="https://analytics.tiktok.com/i18n/pixel/static/main.MWE0ZWQ3ZWQwOA.js" data-id="CNLBDVBC77U4TBB0R76G"></script><script type="text/javascript" async="" src="https://analytics.tiktok.com/i18n/pixel/static/main.MWE0ZWQ3ZWQwOQ.js" data-id="CMRLVARC77U705JG557G"></script><script type="text/javascript" async="" src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=CNLBDVBC77U4TBB0R76G&amp;lib=ttq"></script><script type="text/javascript" async="" src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=CMRLVARC77U705JG557G&amp;lib=ttq"></script><script type="text/javascript" async="" src="https://connect.facebook.net/en_US/fbevents.js"></script><script type="text/javascript" async="" src="https://www.google-analytics.com/analytics.js"></script><script type="text/javascript" async="" src="https://www.googletagmanager.com/gtag/js?id=AW-16478199752&amp;cx=c&amp;gtm=4e6461"></script><script type="text/javascript" async="" src="https://www.googletagmanager.com/gtag/js?id=G-JCDZDB6J2V&amp;cx=c&amp;gtm=4e6461"></script><script type="text/javascript" async="" src="https://www.googletagmanager.com/gtag/js?id=G-G92EK3GZLQ&amp;cx=c&amp;gtm=4e6461"></script><script type="text/javascript" async="" src="https://www.googletagmanager.com/gtag/js?id=AW-832316445&amp;cx=c&amp;gtm=4e6461"></script><script type="text/javascript" async="" src="https://www.googletagmanager.com/gtag/js?id=G-CQTVGTWHFF&amp;cx=c&amp;gtm=4e6461"></script><script type="text/javascript" async="" src="https://www.google-analytics.com/analytics.js"></script><script type="text/javascript" async="" src="https://www.googletagmanager.com/gtag/js?id=G-7QF2M4198R&amp;cx=c&amp;gtm=4e6461"></script><script async="" src="https://www.googletagmanager.com/gtm.js?id=GTM-N5SVNLD"></script><script async="" src="https://www.googletagmanager.com/gtm.js?id=GTM-K37KLDW4"></script><script async="" src="https://connect.facebook.net/en_US/fbevents.js"></script><script>
    var BASE_URL = 'https\u003A\u002F\u002Fjollibee.com.vn\u002F';
    var require = {
        'baseUrl': 'https\u003A\u002F\u002Fjollibee.com.vn\u002Fstatic\u002Fversion1775488343\u002Ffrontend\u002FJollibee\u002Fdefault\u002Fvi_VN'
    };</script>        <meta charset="utf-8"><script type="text/javascript">(window.NREUM||(NREUM={})).init={privacy:{cookies_enabled:true},ajax:{deny_list:["bam.nr-data.net"]},feature_flags:["soft_nav"],distributed_tracing:{enabled:true}};(window.NREUM||(NREUM={})).loader_config={agentID:"1431902154",accountID:"7505251",trustKey:"7505251",xpid:"UwMHVFRWCRABV1hUAwIFV1UG",licenseKey:"NRJS-495c32bbd15c5696a46",applicationID:"1396432117",browserID:"1431902154"};;/*! For license information please see nr-loader-spa-1.312.1.min.js.LICENSE.txt */
(()=>{var e,t,r={384:(e,t,r)=>{"use strict";r.d(t,{NT:()=>a,Zm:()=>c,bQ:()=>u,dV:()=>d,pV:()=>l});var n=r(6154),i=r(1863),s=r(944),o=r(1910);const a={beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net"};function c(){return n.gm.NREUM||(n.gm.NREUM={}),void 0===n.gm.newrelic&&(n.gm.newrelic=n.gm.NREUM),n.gm.NREUM}function d(){let e=c();return e.o||(e.o={ST:n.gm.setTimeout,SI:n.gm.setImmediate||n.gm.setInterval,CT:n.gm.clearTimeout,XHR:n.gm.XMLHttpRequest,REQ:n.gm.Request,EV:n.gm.Event,PR:n.gm.Promise,MO:n.gm.MutationObserver,FETCH:n.gm.fetch,WS:n.gm.WebSocket},(0,o.i)(...Object.values(e.o))),e}function u(e,t){let r=c();r.initializedAgents??={},t.initializedAt={ms:(0,i.t)(),date:new Date},r.initializedAgents[e]=t,2===Object.keys(r.initializedAgents).length&&(0,s.R)(69)}function l(){return function(){let e=c();const t=e.info||{};e.info={beacon:a.beacon,errorBeacon:a.errorBeacon,...t}}(),function(){let e=c();const t=e.init||{};e.init={...t}}(),d(),function(){let e=c();const t=e.loader_config||{};e.loader_config={...t}}(),c()}},782:(e,t,r)=>{"use strict";r.d(t,{T:()=>n});const n=r(860).K7.pageViewTiming},860:(e,t,r)=>{"use strict";r.d(t,{$J:()=>u,K7:()=>c,P3:()=>d,XX:()=>i,Yy:()=>a,df:()=>s,qY:()=>n,v4:()=>o});const n="events",i="jserrors",s="browser/blobs",o="rum",a="browser/logs",c={ajax:"ajax",genericEvents:"generic_events",jserrors:i,logging:"logging",metrics:"metrics",pageAction:"page_action",pageViewEvent:"page_view_event",pageViewTiming:"page_view_timing",sessionReplay:"session_replay",sessionTrace:"session_trace",softNav:"soft_navigations"},d={[c.pageViewEvent]:1,[c.pageViewTiming]:2,[c.metrics]:3,[c.jserrors]:4,[c.softNav]:5,[c.ajax]:6,[c.sessionTrace]:7,[c.sessionReplay]:8,[c.logging]:9,[c.genericEvents]:10},u={[c.pageViewEvent]:o,[c.pageViewTiming]:n,[c.ajax]:n,[c.softNav]:n,[c.metrics]:i,[c.jserrors]:i,[c.sessionTrace]:s,[c.sessionReplay]:s,[c.logging]:a,[c.genericEvents]:"ins"}},944:(e,t,r)=>{"use strict";r.d(t,{R:()=>i});var n=r(3241);function i(e,t){"function"==typeof console.debug&&(console.debug("New Relic Warning: https://github.com/newrelic/newrelic-browser-agent/blob/main/docs/warning-codes.md#".concat(e),t),(0,n.W)({drained:null,type:"data",name:"warn",feature:"warn",data:{code:e,secondary:t}}))}},993:(e,t,r)=>{"use strict";r.d(t,{A$:()=>s,ET:()=>o,TZ:()=>a,p_:()=>i});var n=r(860);const i={ERROR:"ERROR",WARN:"WARN",INFO:"INFO",DEBUG:"DEBUG",TRACE:"TRACE"},s={OFF:0,ERROR:1,WARN:2,INFO:3,DEBUG:4,TRACE:5},o="log",a=n.K7.logging},1541:(e,t,r)=>{"use strict";r.d(t,{$5:()=>d,B5:()=>c,Ux:()=>o,YA:()=>a,fQ:()=>i});var n=r(5871);const i={MFE:"MFE",BA:"BA"};function s(e,t){if(!e||!t?.init.api.allow_registered_children)return[];const r=t.runtime.registeredEntities;return r?.filter(t=>t.metadata.timings?.asset?.endsWith(e)).map(e=>e.metadata.target)||[]}function o(e,t){if(!u(t))return{};const r=t.agentRef.runtime.appMetadata.agents[0].entityGuid;return e?e.attributes:{"entity.guid":r,appId:t.agentRef.info.applicationID}}function a(e,t){return c(e,t)?{"child.id":e.id,"child.type":e.type,...o(void 0,t)}:{}}function c(e,t){return!!e&&!!u(t)&&t.agentRef.init.api.duplicate_registered_data}function d(e){if(!e?.init.api.allow_registered_children)return[void 0];const t=[];try{var r=(0,n.AZ)((0,n.QL)());let i=r.length-1;for(;r[i];)t.push(...s(r[i--],e))}catch(e){}return t.length||t.push(void 0),t}function u(e){return 2===e?.harvestEndpointVersion}},1687:(e,t,r)=>{"use strict";r.d(t,{Ak:()=>a,Ze:()=>d,x3:()=>c});var n=r(3241),i=r(3606),s=r(860),o=r(2646);function a(e,t){if(!e)return;const r={staged:!1,priority:s.P3[t]||0};e.runtime.drainRegistry.get(t)||e.runtime.drainRegistry.set(t,r)}function c(e,t){if(!e)return;const r=e.runtime.drainRegistry;r&&(r.get(t)&&r.delete(t),l(e,t,!1),r.size&&u(e))}function d(e,t="feature",r=!1){if(e){if(!e.runtime.drainRegistry.get(t)||r)return l(e,t);e.runtime.drainRegistry.get(t).staged=!0,u(e)}}function u(e){if(!e)return;const t=Array.from(e.runtime.drainRegistry);t.every(([e,t])=>t.staged)&&(t.sort((e,t)=>e[1].priority-t[1].priority),t.forEach(([t])=>{e.runtime.drainRegistry.delete(t),l(e,t)}))}function l(e,t,r=!0){if(!e)return;const s=e.ee,a=i.i.handlers;if(s&&!s.aborted&&s.backlog&&a){if((0,n.W)({type:"lifecycle",name:"drain",feature:t}),r){const e=s.backlog[t],r=a[t];if(r){for(let t=0;e&&t<e.length;++t)f(e[t],r);Object.entries(r).forEach(([e,t])=>{Object.values(t||{}).forEach(t=>{t[0]?.on&&t[0].context()instanceof o.y&&!t[0].listeners(e).includes(t[1])&&t[0].on(e,t[1])})})}}s.isolatedBacklog||delete a[t],s.backlog[t]=null,s.emit("drain-"+t,[])}}function f(e,t){var r=e[1];Object.values(t[r]||{}).forEach(t=>{var r=e[0];if(t[0]===r){var n=t[1],i=e[3],s=e[2];n.apply(i,s)}})}},1738:(e,t,r)=>{"use strict";r.d(t,{U:()=>f,Y:()=>l});var n=r(3241),i=r(9908),s=r(1863),o=r(944),a=r(3969),c=r(8362),d=r(860),u=r(4261);function l(e,t,r,s){const l=s||r;!l||l[e]&&l[e]!==c.d.prototype[e]||(l[e]=function(){(0,i.p)(a.xV,["API/"+e+"/called"],void 0,d.K7.metrics,r.ee),(0,n.W)({drained:!!r.runtime?.activatedFeatures,type:"data",name:"api",feature:u.Pl+e,data:{}});try{return t.apply(this,arguments)}catch(e){(0,o.R)(23,e)}})}function f(e,t,r,n,o){const a=e.info;null===r?delete a.jsAttributes[t]:a.jsAttributes[t]=r,(o||null===r)&&(0,i.p)(u.Pl+n,[(0,s.t)(),t,r],void 0,"session",e.ee)}},1741:(e,t,r)=>{"use strict";r.d(t,{W:()=>s});var n=r(944),i=r(4261);class s{#e(e,...t){if(this[e]!==s.prototype[e])return this[e](...t);(0,n.R)(35,e)}addPageAction(e,t){return this.#e(i.hG,e,t)}register(e){return this.#e(i.eY,e)}recordCustomEvent(e,t){return this.#e(i.fF,e,t)}setPageViewName(e,t){return this.#e(i.Fw,e,t)}setCustomAttribute(e,t,r){return this.#e(i.cD,e,t,r)}noticeError(e,t){return this.#e(i.o5,e,t)}setUserId(e,t=!1){return this.#e(i.Dl,e,t)}setApplicationVersion(e){return this.#e(i.nb,e)}setErrorHandler(e){return this.#e(i.bt,e)}addRelease(e,t){return this.#e(i.k6,e,t)}log(e,t){return this.#e(i.$9,e,t)}start(){return this.#e(i.d3)}finished(e){return this.#e(i.BL,e)}recordReplay(){return this.#e(i.CH)}pauseReplay(){return this.#e(i.Tb)}addToTrace(e){return this.#e(i.U2,e)}setCurrentRouteName(e){return this.#e(i.PA,e)}interaction(e){return this.#e(i.dT,e)}wrapLogger(e,t,r){return this.#e(i.Wb,e,t,r)}measure(e,t){return this.#e(i.V1,e,t)}consent(e){return this.#e(i.Pv,e)}}},1863:(e,t,r)=>{"use strict";function n(){return Math.floor(performance.now())}r.d(t,{t:()=>n})},1910:(e,t,r)=>{"use strict";r.d(t,{i:()=>s});var n=r(944);const i=new Map;function s(...e){return e.every(e=>{if(i.has(e))return i.get(e);const t="function"==typeof e?e.toString():"",r=t.includes("[native code]"),s=t.includes("nrWrapper");return r||s||(0,n.R)(64,e?.name||t),i.set(e,r),r})}},2555:(e,t,r)=>{"use strict";r.d(t,{D:()=>a,f:()=>o});var n=r(384),i=r(8122);const s={beacon:n.NT.beacon,errorBeacon:n.NT.errorBeacon,licenseKey:void 0,applicationID:void 0,sa:void 0,queueTime:void 0,applicationTime:void 0,ttGuid:void 0,user:void 0,account:void 0,product:void 0,extra:void 0,jsAttributes:{},userAttributes:void 0,atts:void 0,transactionName:void 0,tNamePlain:void 0};function o(e){try{return!!e.licenseKey&&!!e.errorBeacon&&!!e.applicationID}catch(e){return!1}}const a=e=>(0,i.a)(e,s)},2614:(e,t,r)=>{"use strict";r.d(t,{BB:()=>o,H3:()=>n,g:()=>d,iL:()=>c,tS:()=>a,uh:()=>i,wk:()=>s});const n="NRBA",i="SESSION",s=144e5,o=18e5,a={STARTED:"session-started",PAUSE:"session-pause",RESET:"session-reset",RESUME:"session-resume",UPDATE:"session-update"},c={SAME_TAB:"same-tab",CROSS_TAB:"cross-tab"},d={OFF:0,FULL:1,ERROR:2}},2646:(e,t,r)=>{"use strict";r.d(t,{y:()=>n});class n{constructor(e){this.contextId=e}}},2843:(e,t,r)=>{"use strict";r.d(t,{G:()=>s,u:()=>i});var n=r(3878);function i(e,t=!1,r,i){(0,n.DD)("visibilitychange",function(){if(t)return void("hidden"===document.visibilityState&&e());e(document.visibilityState)},r,i)}function s(e,t,r){(0,n.sp)("pagehide",e,t,r)}},3241:(e,t,r)=>{"use strict";r.d(t,{W:()=>s});var n=r(6154);const i="newrelic";function s(e={}){try{n.gm.dispatchEvent(new CustomEvent(i,{detail:e}))}catch(e){}}},3304:(e,t,r)=>{"use strict";r.d(t,{A:()=>s});var n=r(7836);const i=()=>{const e=new WeakSet;return(t,r)=>{if("object"==typeof r&&null!==r){if(e.has(r))return;e.add(r)}return r}};function s(e){try{return JSON.stringify(e,i())??""}catch(e){try{n.ee.emit("internal-error",[e])}catch(e){}return""}}},3333:(e,t,r)=>{"use strict";r.d(t,{$v:()=>u,TZ:()=>n,Xh:()=>c,Zp:()=>i,kd:()=>d,mq:()=>a,nf:()=>o,qN:()=>s});const n=r(860).K7.genericEvents,i=["auxclick","click","copy","keydown","paste","scrollend"],s=["focus","blur"],o=4,a=1e3,c=2e3,d=["PageAction","UserAction","BrowserPerformance"],u={RESOURCES:"experimental.resources",REGISTER:"register"}},3434:(e,t,r)=>{"use strict";r.d(t,{Jt:()=>o,YM:()=>u});var n=r(7836),i=r(5607),s=r(1541);const o="nr@original:".concat(i.W),a=50;var c=Object.prototype.hasOwnProperty,d=!1;function u(e,t,r){return e||(e=n.ee),i.inPlace=function(e,t,r,n,s,o){r||(r="");const a="-"===r.charAt(0);for(let c=0;c<t.length;c++){const d=t[c],u=e[d];f(u)||(e[d]=i(u,a?d+r:r,n,d,s,o))}},i.flag=o,i;function i(t,n,i,d,h,p){return f(t)?t:(n||(n=""),nrWrapper[o]=t,function(e,t,r){if(Object.defineProperty&&Object.keys)try{return Object.keys(e).forEach(function(r){Object.defineProperty(t,r,{get:function(){return e[r]},set:function(t){return e[r]=t,t}})}),t}catch(e){l([e],r)}for(var n in e)c.call(e,n)&&(t[n]=e[n])}(t,nrWrapper,e),nrWrapper);function nrWrapper(){var o,c,f,g;let m,v;try{c=this,o=[...arguments],v=p?(0,s.$5)(r):[void 0],f="function"==typeof i?i(o,c):i||{}}catch(t){l([t,"",[o,c,d],f],e)}u(n+"start",[o,c,d,v],f,h);const y=performance.now();let b;try{return g=t.apply(c,o),b=performance.now(),g}catch(e){throw b=performance.now(),u(n+"err",[o,c,e,v],f,h),m=e,m}finally{const e=b-y,t={start:y,end:b,duration:e,isLongTask:e>=a,methodName:d,thrownError:m};t.isLongTask&&u("long-task",[t,c,v],f,h),u(n+"end",[o,c,g,v],f,h)}}}function u(r,n,i,s){if(!d||t){var o=d;d=!0;try{e.emit(r,n,i,t,s)}catch(t){l([t,r,n,i],e)}d=o}}}function l(e,t){t||(t=n.ee);try{t.emit("internal-error",e)}catch(e){}}function f(e){return!(e&&"function"==typeof e&&e.apply&&!e[o])}},3606:(e,t,r)=>{"use strict";r.d(t,{i:()=>s});var n=r(9908);s.on=o;var i=s.handlers={};function s(e,t,r,s){o(s||n.d,i,e,t,r)}function o(e,t,r,i,s){s||(s="feature"),e||(e=n.d);var o=t[s]=t[s]||{};(o[r]=o[r]||[]).push([e,i])}},3738:(e,t,r)=>{"use strict";r.d(t,{He:()=>i,Kp:()=>a,Lc:()=>d,Rz:()=>u,TZ:()=>n,bD:()=>s,d3:()=>o,jx:()=>l,sl:()=>f,uP:()=>c});const n=r(860).K7.sessionTrace,i="bstResource",s="resource",o="-start",a="-end",c="fn"+o,d="fn"+a,u="pushState",l=1e3,f=3e4},3785:(e,t,r)=>{"use strict";r.d(t,{R:()=>c,b:()=>d});var n=r(9908),i=r(1863),s=r(860),o=r(3969),a=r(993);function c(e,t,r={},c=a.p_.INFO,d=!0,u,l=(0,i.t)()){(0,n.p)(o.xV,["API/logging/".concat(c.toLowerCase(),"/called")],void 0,s.K7.metrics,e),(0,n.p)(a.ET,[l,t,r,c,d,u],void 0,s.K7.logging,e)}function d(e){return"string"==typeof e&&Object.values(a.p_).some(t=>t===e.toUpperCase().trim())}},3878:(e,t,r)=>{"use strict";function n(e,t){return{capture:e,passive:!1,signal:t}}function i(e,t,r=!1,i){window.addEventListener(e,t,n(r,i))}function s(e,t,r=!1,i){document.addEventListener(e,t,n(r,i))}r.d(t,{DD:()=>s,jT:()=>n,sp:()=>i})},3962:(e,t,r)=>{"use strict";r.d(t,{AM:()=>o,O2:()=>l,OV:()=>s,Qu:()=>f,TZ:()=>c,ih:()=>h,pP:()=>a,t1:()=>u,tC:()=>i,wD:()=>d});var n=r(860);const i=["click","keydown","submit"],s="popstate",o="api",a="initialPageLoad",c=n.K7.softNav,d=5e3,u=500,l={INITIAL_PAGE_LOAD:"",ROUTE_CHANGE:1,UNSPECIFIED:2},f={INTERACTION:1,AJAX:2,CUSTOM_END:3,CUSTOM_TRACER:4},h={IP:"in progress",PF:"pending finish",FIN:"finished",CAN:"cancelled"}},3969:(e,t,r)=>{"use strict";r.d(t,{TZ:()=>n,XG:()=>a,rs:()=>i,xV:()=>o,z_:()=>s});const n=r(860).K7.metrics,i="sm",s="cm",o="storeSupportabilityMetrics",a="storeEventMetrics"},4234:(e,t,r)=>{"use strict";r.d(t,{W:()=>i});var n=r(1687);class i{constructor(e,t){this.agentRef=e,this.ee=e?.ee,this.featureName=t,this.blocked=!1}deregisterDrain(){(0,n.x3)(this.agentRef,this.featureName)}}},4261:(e,t,r)=>{"use strict";r.d(t,{$9:()=>u,BL:()=>c,CH:()=>p,Dl:()=>R,Fw:()=>w,PA:()=>v,Pl:()=>n,Pv:()=>x,Tb:()=>f,U2:()=>o,V1:()=>A,Wb:()=>T,bt:()=>b,cD:()=>y,d3:()=>E,dT:()=>d,eY:()=>g,fF:()=>h,hG:()=>s,hw:()=>i,k6:()=>a,nb:()=>m,o5:()=>l});const n="api-",i=n+"ixn-",s="addPageAction",o="addToTrace",a="addRelease",c="finished",d="interaction",u="log",l="noticeError",f="pauseReplay",h="recordCustomEvent",p="recordReplay",g="register",m="setApplicationVersion",v="setCurrentRouteName",y="setCustomAttribute",b="setErrorHandler",w="setPageViewName",R="setUserId",E="start",T="wrapLogger",A="measure",x="consent"},5205:(e,t,r)=>{"use strict";r.d(t,{j:()=>x});var n=r(384),i=r(1741);var s=r(2555),o=r(3333);const a=e=>{if(!e||"string"!=typeof e)return!1;try{document.createDocumentFragment().querySelector(e)}catch{return!1}return!0};var c=r(2614),d=r(944),u=r(8122);const l="[data-nr-mask]",f=e=>(0,u.a)(e,(()=>{const e={feature_flags:[],experimental:{allow_registered_children:!1,resources:!1},mask_selector:"*",block_selector:"[data-nr-block]",mask_input_options:{color:!1,date:!1,"datetime-local":!1,email:!1,month:!1,number:!1,range:!1,search:!1,tel:!1,text:!1,time:!1,url:!1,week:!1,textarea:!1,select:!1,password:!0}};return{ajax:{deny_list:void 0,block_internal:!0,enabled:!0,autoStart:!0},api:{get allow_registered_children(){return e.feature_flags.includes(o.$v.REGISTER)||e.experimental.allow_registered_children},set allow_registered_children(t){e.experimental.allow_registered_children=t},duplicate_registered_data:!1},browser_consent_mode:{enabled:!1},distributed_tracing:{enabled:void 0,exclude_newrelic_header:void 0,cors_use_newrelic_header:void 0,cors_use_tracecontext_headers:void 0,allowed_origins:void 0},get feature_flags(){return e.feature_flags},set feature_flags(t){e.feature_flags=t},generic_events:{enabled:!0,autoStart:!0},harvest:{interval:30},jserrors:{enabled:!0,autoStart:!0},logging:{enabled:!0,autoStart:!0},metrics:{enabled:!0,autoStart:!0},obfuscate:void 0,page_action:{enabled:!0},page_view_event:{enabled:!0,autoStart:!0},page_view_timing:{enabled:!0,autoStart:!0},performance:{capture_marks:!1,capture_measures:!1,capture_detail:!0,resources:{get enabled(){return e.feature_flags.includes(o.$v.RESOURCES)||e.experimental.resources},set enabled(t){e.experimental.resources=t},asset_types:[],first_party_domains:[],ignore_newrelic:!0}},privacy:{cookies_enabled:!0},proxy:{assets:void 0,beacon:void 0},session:{expiresMs:c.wk,inactiveMs:c.BB},session_replay:{autoStart:!0,enabled:!1,preload:!1,sampling_rate:10,error_sampling_rate:100,collect_fonts:!1,inline_images:!1,fix_stylesheets:!0,mask_all_inputs:!0,get mask_text_selector(){return e.mask_selector},set mask_text_selector(t){a(t)?e.mask_selector="".concat(t,",").concat(l):""===t||null===t?e.mask_selector=l:(0,d.R)(5,t)},get block_class(){return"nr-block"},get ignore_class(){return"nr-ignore"},get mask_text_class(){return"nr-mask"},get block_selector(){return e.block_selector},set block_selector(t){a(t)?e.block_selector+=",".concat(t):""!==t&&(0,d.R)(6,t)},get mask_input_options(){return e.mask_input_options},set mask_input_options(t){t&&"object"==typeof t?e.mask_input_options={...t,password:!0}:(0,d.R)(7,t)}},session_trace:{enabled:!0,autoStart:!0},soft_navigations:{enabled:!0,autoStart:!0},ssl:void 0,user_actions:{enabled:!0,elementAttributes:["id","className","tagName","type"]}}})());var h=r(6154),p=r(9324);let g=0;const m={buildEnv:p.F3,distMethod:p.Xs,version:p.xv,originTime:h.WN},v={consented:!1},y={activatedFeatures:void 0,appMetadata:{},configured:!1,get consented(){return this.session?.state?.consent||v.consented},set consented(e){v.consented=e},customTransaction:void 0,denyList:[],disabled:!1,drainRegistry:new Map,harvester:void 0,isolatedBacklog:!1,isRecording:!1,loaderType:void 0,maxBytes:3e4,obfuscator:void 0,onerror:void 0,ptid:void 0,releaseIds:{},session:void 0,timeKeeper:void 0,registeredEntities:[],jsAttributesMetadata:{bytes:0},get harvestCount(){return++g}},b=e=>{const t=(0,u.a)(e,y),r=Object.keys(m).reduce((e,t)=>(e[t]={value:m[t],writable:!1,configurable:!0,enumerable:!0},e),{});return Object.defineProperties(t,r)},w=e=>{const t=e.startsWith("http");e+="/",r.p=t?e:"https://"+e};var R=r(7836),E=r(3241);const T={accountID:void 0,trustKey:void 0,agentID:void 0,licenseKey:void 0,applicationID:void 0,xpid:void 0},A=e=>(0,u.a)(e,T);function x(e,t={},r,o){let{init:a,info:c,loader_config:d,runtime:u={},exposed:l=!0}=t;if(!c){const e=(0,n.pV)();a=e.init,c=e.info,d=e.loader_config}e.init=f(a||{}),e.loader_config=A(d||{}),c.jsAttributes??={},h.bv&&(c.jsAttributes.isWorker=!0),e.info=(0,s.D)(c);const p=e.init;e.runtime??=b(u),p.proxy.assets&&w(p.proxy.assets),e.runtime.configured||(Object.defineProperty(e,"beacons",{get:()=>[e.info.beacon,e.info.errorBeacon,e.init.proxy.assets,e.init.proxy.beacon].filter(Boolean)}),Object.defineProperty(e.runtime,"denyList",{get:()=>[...e.init.ajax.deny_list||[],...e.init.ajax.block_internal?e.beacons:[]]}),e.runtime.ptid=e.agentIdentifier,function(e){const t=(0,n.pV)();Object.getOwnPropertyNames(i.W.prototype).forEach(r=>{const n=i.W.prototype[r];if("function"!=typeof n||"constructor"===n)return;let s=t[r];e[r]&&!1!==e.exposed&&"micro-agent"!==e.runtime?.loaderType&&(t[r]=(...t)=>{const n=e[r](...t);return s?s(...t):n})})}(e),e.runtime.loaderType=r,e.ee=R.ee.get(e.agentIdentifier),e.exposed=l,(0,E.W)({drained:!!e.runtime.activatedFeatures,type:"lifecycle",name:"initialize",feature:void 0,data:e.config}),e.runtime.configured=!0)}},5270:(e,t,r)=>{"use strict";r.d(t,{Aw:()=>o,SR:()=>s,rF:()=>a});var n=r(384),i=r(7767);function s(e){return!!(0,n.dV)().o.MO&&(0,i.V)(e)&&!0===e?.session_trace.enabled}function o(e){return!0===e?.session_replay.preload&&s(e)}function a(e,t){try{if("string"==typeof t?.type){if("password"===t.type.toLowerCase())return"*".repeat(e?.length||0);if(void 0!==t?.dataset?.nrUnmask||t?.classList?.contains("nr-unmask"))return e}}catch(e){}return"string"==typeof e?e.replace(/[\S]/g,"*"):"*".repeat(e?.length||0)}},5289:(e,t,r)=>{"use strict";r.d(t,{GG:()=>o,Qr:()=>c,sB:()=>a});var n=r(3878),i=r(6389);function s(){return"undefined"==typeof document||"complete"===document.readyState}function o(e,t){if(s())return e();const r=(0,i.J)(e),o=setInterval(()=>{s()&&(clearInterval(o),r())},500);(0,n.sp)("load",r,t)}function a(e){if(s())return e();(0,n.DD)("DOMContentLoaded",e)}function c(e){if(s())return e();(0,n.sp)("popstate",e)}},5607:(e,t,r)=>{"use strict";r.d(t,{W:()=>n});const n=(0,r(9566).bz)()},5871:(e,t,r)=>{"use strict";r.d(t,{AZ:()=>u,QL:()=>l,Qr:()=>f});var n=r(6154),i=r(1863),s=r(9119),o=r(7866);let a;try{a=u(l())[0]}catch(e){a=u(e)[0]}const c=new Set;let d=[];if(n.gm.PerformanceObserver?.supportedEntryTypes.includes("resource")){new PerformanceObserver(e=>{e.getEntries().forEach(e=>{if((e=>"script"===e.initiatorType||["link","fetch"].includes(e.initiatorType)&&e.name.endsWith(".js"))(e)){c.size>250&&c.delete(c.values().next().value),c.add(e);const t=[];d.forEach(({test:r,addedAt:n},s)=>{(r(e)||(0,i.t)()-n>1e4)&&t.push(s)}),d=d.filter((e,r)=>!t.includes(r))}})}).observe({type:"resource",buffered:!0})}function u(e){if(!e||"string"!=typeof e)return[];const t=new Set,r=e.split("\n");for(const e of r){const r=e.match(o.cn)||e.match(o.hB)||e.match(o.fL);if(r&&r[2])t.add((0,s.L)(r[2]));else{const r=e.match(/\(([^)]+\.js):\d+:\d+\)/)||e.match(/^\s+at\s+([^\s(]+\.js):\d+:\d+/);r&&r[1]&&t.add((0,s.L)(r[1]))}}return[...t]}function l(){let e;try{const t=Error.stackTraceLimit;Error.stackTraceLimit=50,e=(new Error).stack,Error.stackTraceLimit=t}catch(t){e=(new Error).stack}return e}function f(){const e={registeredAt:(0,i.t)(),reportedAt:void 0,fetchStart:0,fetchEnd:0,asset:void 0,type:"unknown"},t=l();if(!t)return e;const r=n.gm.performance?.getEntriesByType("navigation")?.[0]?.name||"";try{const o=u(t),f=(o.length>1?o.filter(e=>!a.endsWith(e)&&!e.endsWith(a)):o)[0];if(!f)return e;if(r.includes(f))return e.asset=(0,s.L)(r),e.type="inline",e;const h=performance.getEntriesByType("resource").find(p)||[...c].find(p);function p(e){const t=(0,s.L)(e.name);return t.endsWith(f)||f.endsWith(t)}function g(t){e.fetchStart=Math.floor(t.startTime),e.fetchEnd=Math.floor(t.responseEnd),e.asset=t.name,e.type=t.initiatorType}h?g(h):function(e){if(!e||!n.gm.document)return!1;try{const t=n.gm.document.querySelectorAll('link[rel="preload"][as="script"]');for(const r of t)if((0,s.L)(r.href)===e)return!0}catch(e){}return!1}(f)&&(e.asset=f,e.type="preload",d.push({addedAt:(0,i.t)(),test:e=>!!p(e)&&(g(e),!0)}))}catch(m){}return e}},6154:(e,t,r)=>{"use strict";r.d(t,{OF:()=>d,RI:()=>i,WN:()=>f,bv:()=>s,gm:()=>o,lR:()=>l,m:()=>c,mw:()=>a,sb:()=>u,zk:()=>h});var n=r(1863);const i="undefined"!=typeof window&&!!window.document,s="undefined"!=typeof WorkerGlobalScope&&("undefined"!=typeof self&&self instanceof WorkerGlobalScope&&self.navigator instanceof WorkerNavigator||"undefined"!=typeof globalThis&&globalThis instanceof WorkerGlobalScope&&globalThis.navigator instanceof WorkerNavigator),o=i?window:"undefined"!=typeof WorkerGlobalScope&&("undefined"!=typeof self&&self instanceof WorkerGlobalScope&&self||"undefined"!=typeof globalThis&&globalThis instanceof WorkerGlobalScope&&globalThis),a=Boolean("hidden"===o?.document?.visibilityState),c=""+o?.location,d=/iPad|iPhone|iPod/.test(o.navigator?.userAgent),u=d&&"undefined"==typeof SharedWorker,l=(()=>{const e=o.navigator?.userAgent?.match(/Firefox[/\s](\d+\.\d+)/);return Array.isArray(e)&&e.length>=2?+e[1]:0})(),f=Date.now()-(0,n.t)(),h=()=>{const e=o?.performance?.getEntriesByType?.("navigation")?.[0];if(e&&e.responseStart>0&&e.responseStart<o.performance.now())return e}},6344:(e,t,r)=>{"use strict";r.d(t,{BB:()=>u,Qb:()=>l,TZ:()=>i,Ug:()=>o,Vh:()=>s,_s:()=>a,bc:()=>d,yP:()=>c});var n=r(2614);const i=r(860).K7.sessionReplay,s="errorDuringReplay",o=.12,a={DomContentLoaded:0,Load:1,FullSnapshot:2,IncrementalSnapshot:3,Meta:4,Custom:5},c={[n.g.ERROR]:15e3,[n.g.FULL]:3e5,[n.g.OFF]:0},d={RESET:{message:"Session was reset",sm:"Reset"},IMPORT:{message:"Recorder failed to import",sm:"Import"},TOO_MANY:{message:"429: Too Many Requests",sm:"Too-Many"},TOO_BIG:{message:"Payload was too large",sm:"Too-Big"},CROSS_TAB:{message:"Session Entity was set to OFF on another tab",sm:"Cross-Tab"},ENTITLEMENTS:{message:"Session Replay is not allowed and will not be started",sm:"Entitlement"}},u=5e3,l={API:"api",RESUME:"resume",SWITCH_TO_FULL:"switchToFull",INITIALIZE:"initialize",PRELOAD:"preload"}},6389:(e,t,r)=>{"use strict";function n(e,t=500,r={}){const n=r?.leading||!1;let i;return(...r)=>{n&&void 0===i&&(e.apply(this,r),i=setTimeout(()=>{i=clearTimeout(i)},t)),n||(clearTimeout(i),i=setTimeout(()=>{e.apply(this,r)},t))}}function i(e){let t=!1;return(...r)=>{t||(t=!0,e.apply(this,r))}}r.d(t,{J:()=>i,s:()=>n})},6630:(e,t,r)=>{"use strict";r.d(t,{T:()=>n});const n=r(860).K7.pageViewEvent},6774:(e,t,r)=>{"use strict";r.d(t,{T:()=>n});const n=r(860).K7.jserrors},7295:(e,t,r)=>{"use strict";r.d(t,{Xv:()=>o,gX:()=>i,iW:()=>s});var n=[];function i(e){if(!e||s(e))return!1;if(0===n.length)return!0;if("*"===n[0].hostname)return!1;for(var t=0;t<n.length;t++){var r=n[t];if(r.hostname.test(e.hostname)&&r.pathname.test(e.pathname))return!1}return!0}function s(e){return void 0===e.hostname}function o(e){if(n=[],e&&e.length)for(var t=0;t<e.length;t++){let r=e[t];if(!r)continue;if("*"===r)return void(n=[{hostname:"*"}]);0===r.indexOf("http://")?r=r.substring(7):0===r.indexOf("https://")&&(r=r.substring(8));const i=r.indexOf("/");let s,o;i>0?(s=r.substring(0,i),o=r.substring(i)):(s=r,o="*");let[c]=s.split(":");n.push({hostname:a(c),pathname:a(o,!0)})}}function a(e,t=!1){const r=e.replace(/[.+?^${}()|[\]\\]/g,e=>"\\"+e).replace(/\*/g,".*?");return new RegExp((t?"^":"")+r+"$")}},7485:(e,t,r)=>{"use strict";r.d(t,{D:()=>i});var n=r(6154);function i(e){if(0===(e||"").indexOf("data:"))return{protocol:"data"};try{const t=new URL(e,location.href),r={port:t.port,hostname:t.hostname,pathname:t.pathname,search:t.search,protocol:t.protocol.slice(0,t.protocol.indexOf(":")),sameOrigin:t.protocol===n.gm?.location?.protocol&&t.host===n.gm?.location?.host};return r.port&&""!==r.port||("http:"===t.protocol&&(r.port="80"),"https:"===t.protocol&&(r.port="443")),r.pathname&&""!==r.pathname?r.pathname.startsWith("/")||(r.pathname="/".concat(r.pathname)):r.pathname="/",r}catch(e){return{}}}},7699:(e,t,r)=>{"use strict";r.d(t,{It:()=>s,KC:()=>a,No:()=>i,qh:()=>o});var n=r(860);const i=16e3,s=1e6,o="SESSION_ERROR",a={[n.K7.logging]:!0,[n.K7.genericEvents]:!0,[n.K7.jserrors]:!0,[n.K7.ajax]:!0}},7767:(e,t,r)=>{"use strict";r.d(t,{V:()=>i});var n=r(6154);const i=e=>n.RI&&!0===e?.privacy.cookies_enabled},7836:(e,t,r)=>{"use strict";r.d(t,{P:()=>a,ee:()=>c});var n=r(384),i=r(8990),s=r(2646),o=r(5607);const a="nr@context:".concat(o.W),c=function e(t,r){var n={},o={},u={},l=!1;try{l=16===r.length&&d.initializedAgents?.[r]?.runtime.isolatedBacklog}catch(e){}var f={on:p,addEventListener:p,removeEventListener:function(e,t){var r=n[e];if(!r)return;for(var i=0;i<r.length;i++)r[i]===t&&r.splice(i,1)},emit:function(e,r,n,i,s){!1!==s&&(s=!0);if(c.aborted&&!i)return;t&&s&&t.emit(e,r,n);var a=h(n);g(e).forEach(e=>{e.apply(a,r)});var d=v()[o[e]];d&&d.push([f,e,r,a]);return a},get:m,listeners:g,context:h,buffer:function(e,t){const r=v();if(t=t||"feature",f.aborted)return;Object.entries(e||{}).forEach(([e,n])=>{o[n]=t,t in r||(r[t]=[])})},abort:function(){f._aborted=!0,Object.keys(f.backlog).forEach(e=>{delete f.backlog[e]})},isBuffering:function(e){return!!v()[o[e]]},debugId:r,backlog:l?{}:t&&"object"==typeof t.backlog?t.backlog:{},isolatedBacklog:l};return Object.defineProperty(f,"aborted",{get:()=>{let e=f._aborted||!1;return e||(t&&(e=t.aborted),e)}}),f;function h(e){return e&&e instanceof s.y?e:e?(0,i.I)(e,a,()=>new s.y(a)):new s.y(a)}function p(e,t){n[e]=g(e).concat(t)}function g(e){return n[e]||[]}function m(t){return u[t]=u[t]||e(f,t)}function v(){return f.backlog}}(void 0,"globalEE"),d=(0,n.Zm)();d.ee||(d.ee=c)},7866:(e,t,r)=>{"use strict";r.d(t,{Nc:()=>s,cn:()=>a,fL:()=>i,h3:()=>n,hB:()=>o});const n=/function (.+?)\s*\(/,i=/^\s*at .+ \(eval at \S+ \((?:(?:file|http|https):[^)]+)?\)(?:, [^:]*:\d+:\d+)?\)$/i,s=/^\s*at Function code \(Function code:\d+:\d+\)\s*/i,o=/^\s*at (?:((?:\[object object\])?(?:[^(]*\([^)]*\))*[^()]*(?: \[as \S+\])?) )?\(?((?:file|http|https|chrome-extension):.*?)?:(\d+)(?::(\d+))?\)?\s*$/i,a=/^\s*(?:([^@]*)(?:\(.*?\))?@)?((?:file|http|https|chrome|safari-extension).*?):(\d+)(?::(\d+))?\s*$/i},8122:(e,t,r)=>{"use strict";r.d(t,{a:()=>i});var n=r(944);function i(e,t){try{if(!e||"object"!=typeof e)return(0,n.R)(3);if(!t||"object"!=typeof t)return(0,n.R)(4);const r=Object.create(Object.getPrototypeOf(t),Object.getOwnPropertyDescriptors(t)),s=0===Object.keys(r).length?e:r;for(let o in s)if(void 0!==e[o])try{if(null===e[o]){r[o]=null;continue}Array.isArray(e[o])&&Array.isArray(t[o])?r[o]=Array.from(new Set([...e[o],...t[o]])):e[o]instanceof Map||e[o]instanceof Set||e[o]instanceof Date||e[o]instanceof RegExp?r[o]=e[o]:"object"==typeof e[o]&&"object"==typeof t[o]?r[o]=i(e[o],t[o]):r[o]=e[o]}catch(e){r[o]||(0,n.R)(1,e)}return r}catch(e){(0,n.R)(2,e)}}},8139:(e,t,r)=>{"use strict";r.d(t,{u:()=>f});var n=r(7836),i=r(3434),s=r(8990),o=r(6154);const a={},c=o.gm.XMLHttpRequest,d="addEventListener",u="removeEventListener",l="nr@wrapped:".concat(n.P);function f(e){var t=function(e){return(e||n.ee).get("events")}(e);if(a[t.debugId]++)return t;a[t.debugId]=1;var r=(0,i.YM)(t,!0);function f(e){r.inPlace(e,[d,u],"-",p)}function p(e,t){return e[1]}return"getPrototypeOf"in Object&&(o.RI&&h(document,f),c&&h(c.prototype,f),h(o.gm,f)),t.on(d+"-start",function(e,t){var n=e[1];if(null!==n&&("function"==typeof n||"object"==typeof n)&&"newrelic"!==e[0]){var i=(0,s.I)(n,l,function(){var e={object:function(){if("function"!=typeof n.handleEvent)return;return n.handleEvent.apply(n,arguments)},function:n}[typeof n];return e?r(e,"fn-",null,e.name||"anonymous"):n});this.wrapped=e[1]=i}}),t.on(u+"-start",function(e){e[1]=this.wrapped||e[1]}),t}function h(e,t,...r){let n=e;for(;"object"==typeof n&&!Object.prototype.hasOwnProperty.call(n,d);)n=Object.getPrototypeOf(n);n&&t(n,...r)}},8362:(e,t,r)=>{"use strict";r.d(t,{d:()=>s});var n=r(9566),i=r(1741);class s extends i.W{agentIdentifier=(0,n.LA)(16)}},8374:(e,t,r)=>{r.nc=(()=>{try{return document?.currentScript?.nonce}catch(e){}return""})()},8990:(e,t,r)=>{"use strict";r.d(t,{I:()=>i});var n=Object.prototype.hasOwnProperty;function i(e,t,r){if(n.call(e,t))return e[t];var i=r();if(Object.defineProperty&&Object.keys)try{return Object.defineProperty(e,t,{value:i,writable:!0,enumerable:!1}),i}catch(e){}return e[t]=i,i}},9119:(e,t,r)=>{"use strict";r.d(t,{L:()=>s});var n=/([^?#]*)[^#]*(#[^?]*|$).*/,i=/([^?#]*)().*/;function s(e,t){return e?e.replace(t?n:i,"$1$2"):e}},9300:(e,t,r)=>{"use strict";r.d(t,{T:()=>n});const n=r(860).K7.ajax},9324:(e,t,r)=>{"use strict";r.d(t,{AJ:()=>o,F3:()=>i,Xs:()=>s,Yq:()=>a,xv:()=>n});const n="1.312.1",i="PROD",s="CDN",o="@newrelic/rrweb",a="1.1.0"},9566:(e,t,r)=>{"use strict";r.d(t,{LA:()=>a,ZF:()=>c,bz:()=>o,el:()=>d});var n=r(6154);const i="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";function s(e,t){return e?15&e[t]:16*Math.random()|0}function o(){const e=n.gm?.crypto||n.gm?.msCrypto;let t,r=0;return e&&e.getRandomValues&&(t=e.getRandomValues(new Uint8Array(30))),i.split("").map(e=>"x"===e?s(t,r++).toString(16):"y"===e?(3&s()|8).toString(16):e).join("")}function a(e){const t=n.gm?.crypto||n.gm?.msCrypto;let r,i=0;t&&t.getRandomValues&&(r=t.getRandomValues(new Uint8Array(e)));const o=[];for(var a=0;a<e;a++)o.push(s(r,i++).toString(16));return o.join("")}function c(){return a(16)}function d(){return a(32)}},9908:(e,t,r)=>{"use strict";r.d(t,{d:()=>n,p:()=>i});var n=r(7836).ee.get("handle");function i(e,t,r,i,s){s?(s.buffer([e],i),s.emit(e,t,r)):(n.buffer([e],i),n.emit(e,t,r))}}},n={};function i(e){var t=n[e];if(void 0!==t)return t.exports;var s=n[e]={exports:{}};return r[e](s,s.exports,i),s.exports}i.m=r,i.d=(e,t)=>{for(var r in t)i.o(t,r)&&!i.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},i.f={},i.e=e=>Promise.all(Object.keys(i.f).reduce((t,r)=>(i.f[r](e,t),t),[])),i.u=e=>({212:"nr-spa-compressor",249:"nr-spa-recorder",478:"nr-spa"}[e]+"-1.312.1.min.js"),i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),e={},t="NRBA-1.312.1.PROD:",i.l=(r,n,s,o)=>{if(e[r])e[r].push(n);else{var a,c;if(void 0!==s)for(var d=document.getElementsByTagName("script"),u=0;u<d.length;u++){var l=d[u];if(l.getAttribute("src")==r||l.getAttribute("data-webpack")==t+s){a=l;break}}if(!a){c=!0;var f={478:"sha512-dZhtzLTOyIsYHGHWAipD4+6jjzEIycTqL1F9NwinUiYL8cf0kIXf7WUbskVMB7p/nhDF+zJ9Bfd6LU9PMn0Yhw==",249:"sha512-SJV3E/3SdEyaahYm8FHEFwhJvDQy/nRJJV/o+18MgXENJWR/8tfvIKfc4LE1xV9RniczXT7eQLcZi2G99UlugA==",212:"sha512-dRFaJY5mEo/nxzPqxS/sHnvU66fpkTff91nWUFOafyPR61R+r2GZiy81lT47BWA4MouemCj4tvhHmn8Ofh/UOg=="};(a=document.createElement("script")).charset="utf-8",i.nc&&a.setAttribute("nonce",i.nc),a.setAttribute("data-webpack",t+s),a.src=r,0!==a.src.indexOf(window.location.origin+"/")&&(a.crossOrigin="anonymous"),f[o]&&(a.integrity=f[o])}e[r]=[n];var h=(t,n)=>{a.onerror=a.onload=null,clearTimeout(p);var i=e[r];if(delete e[r],a.parentNode&&a.parentNode.removeChild(a),i&&i.forEach(e=>e(n)),t)return t(n)},p=setTimeout(h.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=h.bind(null,a.onerror),a.onload=h.bind(null,a.onload),c&&document.head.appendChild(a)}},i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.p="https://js-agent.newrelic.com/",(()=>{var e={38:0,788:0};i.f.j=(t,r)=>{var n=i.o(e,t)?e[t]:void 0;if(0!==n)if(n)r.push(n[2]);else{var s=new Promise((r,i)=>n=e[t]=[r,i]);r.push(n[2]=s);var o=i.p+i.u(t),a=new Error;i.l(o,r=>{if(i.o(e,t)&&(0!==(n=e[t])&&(e[t]=void 0),n)){var s=r&&("load"===r.type?"missing":r.type),o=r&&r.target&&r.target.src;a.message="Loading chunk "+t+" failed: ("+s+": "+o+")",a.name="ChunkLoadError",a.type=s,a.request=o,n[1](a)}},"chunk-"+t,t)}};var t=(t,r)=>{var n,s,[o,a,c]=r,d=0;if(o.some(t=>0!==e[t])){for(n in a)i.o(a,n)&&(i.m[n]=a[n]);if(c)c(i)}for(t&&t(r);d<o.length;d++)s=o[d],i.o(e,s)&&e[s]&&e[s][0](),e[s]=0},r=self["webpackChunk:NRBA-1.312.1.PROD"]=self["webpackChunk:NRBA-1.312.1.PROD"]||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))})(),(()=>{"use strict";i(8374);var e=i(8362),t=i(860);const r=Object.values(t.K7);var n=i(5205);var s=i(9908),o=i(1863),a=i(4261),c=i(1738);var d=i(1687),u=i(4234),l=i(5289),f=i(6154),h=i(944),p=i(5270),g=i(7767),m=i(6389),v=i(7699);class y extends u.W{constructor(e,t){super(e,t),this.abortHandler=void 0,this.featAggregate=void 0,this.loadedSuccessfully=void 0,this.onAggregateImported=new Promise(e=>{this.loadedSuccessfully=e}),this.deferred=Promise.resolve(),!1===e.init[this.featureName].autoStart?this.deferred=new Promise((t,r)=>{this.ee.on("manual-start-all",(0,m.J)(()=>{(0,d.Ak)(e,this.featureName),t()}))}):(0,d.Ak)(e,t)}importAggregator(e,t,r={}){if(this.featAggregate)return;const n=async()=>{let n;await this.deferred;try{if((0,g.V)(e.init)){const{setupAgentSession:t}=await i.e(478).then(i.bind(i,8766));n=t(e)}}catch(e){(0,h.R)(20,e),this.ee.emit("internal-error",[e]),(0,s.p)(v.qh,[e],void 0,this.featureName,this.ee)}try{if(!this.#t(this.featureName,n,e.init))return(0,d.Ze)(this.agentRef,this.featureName),void this.loadedSuccessfully(!1);const{Aggregate:i}=await t();this.featAggregate=new i(e,r),e.runtime.harvester.initializedAggregates.push(this.featAggregate),this.loadedSuccessfully(!0)}catch(e){(0,h.R)(34,e),this.abortHandler?.(),(0,d.Ze)(this.agentRef,this.featureName,!0),this.loadedSuccessfully(!1),this.ee&&this.ee.abort()}};f.RI?(0,l.GG)(()=>n(),!0):n()}#t(e,r,n){if(this.blocked)return!1;switch(e){case t.K7.sessionReplay:return(0,p.SR)(n)&&!!r;case t.K7.sessionTrace:return!!r;default:return!0}}}var b=i(6630),w=i(2614),R=i(3241);class E extends y{static featureName=b.T;constructor(e){var t;super(e,b.T),this.setupInspectionEvents(),t=e,(0,c.Y)(a.Fw,function(e,r){"string"==typeof e&&("/"!==e.charAt(0)&&(e="/"+e),t.runtime.customTransaction=(r||"http://custom.transaction")+e,(0,s.p)(a.Pl+a.Fw,[(0,o.t)()],void 0,void 0,t.ee))},t),this.importAggregator(e,()=>i.e(478).then(i.bind(i,5839)))}setupInspectionEvents(){const e=(e,t)=>{e&&(0,R.W)({timeStamp:e.timeStamp,loaded:"complete"===e.target.readyState,type:"window",name:t,data:e.target.location+""})};(0,l.sB)(t=>{e(t,"DOMContentLoaded")}),(0,l.GG)(t=>{e(t,"load")}),(0,l.Qr)(t=>{e(t,"navigate")}),this.ee.on(w.tS.UPDATE,(e,t)=>{(0,R.W)({type:"lifecycle",name:"session",data:t})})}}var T=i(384);class A extends e.d{constructor(e){var t;(super(),f.gm)?(this.features={},(0,T.bQ)(this.agentIdentifier,this),this.desiredFeatures=new Set(e.features||[]),this.desiredFeatures.add(E),(0,n.j)(this,e,e.loaderType||"agent"),t=this,(0,c.Y)(a.cD,function(e,r,n=!1){if("string"==typeof e){if(["string","number","boolean"].includes(typeof r)||null===r)return(0,c.U)(t,e,r,a.cD,n);(0,h.R)(40,typeof r)}else(0,h.R)(39,typeof e)},t),function(e){(0,c.Y)(a.Dl,function(t,r=!1){if("string"!=typeof t&&null!==t)return void(0,h.R)(41,typeof t);const n=e.info.jsAttributes["enduser.id"];r&&null!=n&&n!==t?(0,s.p)(a.Pl+"setUserIdAndResetSession",[t],void 0,"session",e.ee):(0,c.U)(e,"enduser.id",t,a.Dl,!0)},e)}(this),function(e){(0,c.Y)(a.nb,function(t){if("string"==typeof t||null===t)return(0,c.U)(e,"application.version",t,a.nb,!1);(0,h.R)(42,typeof t)},e)}(this),function(e){(0,c.Y)(a.d3,function(){e.ee.emit("manual-start-all")},e)}(this),function(e){(0,c.Y)(a.Pv,function(t=!0){if("boolean"==typeof t){if((0,s.p)(a.Pl+a.Pv,[t],void 0,"session",e.ee),e.runtime.consented=t,t){const t=e.features.page_view_event;t.onAggregateImported.then(e=>{const r=t.featAggregate;e&&!r.sentRum&&r.sendRum()})}}else(0,h.R)(65,typeof t)},e)}(this),this.run()):(0,h.R)(21)}get config(){return{info:this.info,init:this.init,loader_config:this.loader_config,runtime:this.runtime}}get api(){return this}run(){try{const e=function(e){const t={};return r.forEach(r=>{t[r]=!!e[r]?.enabled}),t}(this.init),n=[...this.desiredFeatures];n.sort((e,r)=>t.P3[e.featureName]-t.P3[r.featureName]),n.forEach(r=>{if(!e[r.featureName]&&r.featureName!==t.K7.pageViewEvent)return;const n=function(e){switch(e){case t.K7.ajax:return[t.K7.jserrors];case t.K7.sessionTrace:return[t.K7.ajax,t.K7.pageViewEvent];case t.K7.sessionReplay:return[t.K7.sessionTrace];case t.K7.pageViewTiming:return[t.K7.pageViewEvent];default:return[]}}(r.featureName).filter(e=>!(e in this.features));n.length>0&&(0,h.R)(36,{targetFeature:r.featureName,missingDependencies:n}),this.features[r.featureName]=new r(this)})}catch(e){(0,h.R)(22,e);for(const e in this.features)this.features[e].abortHandler?.();const t=(0,T.Zm)();delete t.initializedAgents[this.agentIdentifier]?.features,delete this.sharedAggregator;return t.ee.get(this.agentIdentifier).abort(),!1}}}var x=i(2843),S=i(782);class _ extends y{static featureName=S.T;constructor(e){super(e,S.T),f.RI&&((0,x.u)(()=>(0,s.p)("docHidden",[(0,o.t)()],void 0,S.T,this.ee),!0),(0,x.G)(()=>(0,s.p)("winPagehide",[(0,o.t)()],void 0,S.T,this.ee)),this.importAggregator(e,()=>i.e(478).then(i.bind(i,9917))))}}var O=i(3969);class P extends y{static featureName=O.TZ;constructor(e){super(e,O.TZ),f.RI&&document.addEventListener("securitypolicyviolation",e=>{(0,s.p)(O.xV,["Generic/CSPViolation/Detected"],void 0,this.featureName,this.ee)}),this.importAggregator(e,()=>i.e(478).then(i.bind(i,6555)))}}var k=i(6774),N=i(3878),D=i(3304);class j{constructor(e,t,r,n,i){this.name="UncaughtError",this.message="string"==typeof e?e:(0,D.A)(e),this.sourceURL=t,this.line=r,this.column=n,this.__newrelic=i}}function C(e){return M(e)?e:new j(void 0!==e?.message?e.message:e,e?.filename||e?.sourceURL,e?.lineno||e?.line,e?.colno||e?.col,e?.__newrelic,e?.cause)}function L(e){const t="Unhandled Promise Rejection: ";if(!e?.reason)return;if(M(e.reason)){try{e.reason.message.startsWith(t)||(e.reason.message=t+e.reason.message)}catch(e){}return C(e.reason)}const r=C(e.reason);return(r.message||"").startsWith(t)||(r.message=t+r.message),r}function I(e){if(e.error instanceof SyntaxError&&!/:\d+$/.test(e.error.stack?.trim())){const t=new j(e.message,e.filename,e.lineno,e.colno,e.error.__newrelic,e.cause);return t.name=SyntaxError.name,t}return M(e.error)?e.error:C(e)}function M(e){return e instanceof Error&&!!e.stack}function B(e,r,n,i,a=(0,o.t)()){"string"==typeof e&&(e=new Error(e)),(0,s.p)("err",[e,a,!1,r,n.runtime.isRecording,void 0,i],void 0,t.K7.jserrors,n.ee),(0,s.p)("uaErr",[],void 0,t.K7.genericEvents,n.ee)}var H=i(1541),W=i(993),K=i(3785);function F(e,{customAttributes:t={},level:r=W.p_.INFO}={},n,i,s=(0,o.t)()){(0,K.R)(n.ee,e,t,r,!1,i,s)}function U(e,r,n,i,c=(0,o.t)()){(0,s.p)(a.Pl+a.hG,[c,e,r,i],void 0,t.K7.genericEvents,n.ee)}function V(e,r,n,i,c=(0,o.t)()){const{start:d,end:u,customAttributes:l}=r||{},f={customAttributes:l||{}};if("object"!=typeof f.customAttributes||"string"!=typeof e||0===e.length)return void(0,h.R)(57);const p=(e,t)=>null==e?t:"number"==typeof e?e:e instanceof PerformanceMark?e.startTime:Number.NaN;if(f.start=p(d,0),f.end=p(u,c),Number.isNaN(f.start)||Number.isNaN(f.end))(0,h.R)(57);else{if(f.duration=f.end-f.start,!(f.duration<0))return(0,s.p)(a.Pl+a.V1,[f,e,i],void 0,t.K7.genericEvents,n.ee),f;(0,h.R)(58)}}function G(e,r={},n,i,c=(0,o.t)()){(0,s.p)(a.Pl+a.fF,[c,e,r,i],void 0,t.K7.genericEvents,n.ee)}var z=i(5871),Y=i(9566);const Z=["name","id","type"];function q(e){(0,c.Y)(a.eY,function(t){return X(e,t)},e)}function X(e,r,n){(0,h.R)(54,"newrelic.register"),r||={},r.instance=(0,Y.LA)(8),r.type=H.fQ.MFE,r.licenseKey||=e.info.licenseKey,r.blocked=!1,("object"!=typeof r.tags||null===r.tags||Array.isArray(r.tags))&&(r.tags={}),r.parent=n||{get id(){return e.runtime.appMetadata.agents[0].entityGuid},type:H.fQ.BA};const i=(0,z.Qr)(),a={};Object.defineProperty(r,"attributes",{get:()=>({...a,"source.id":r.id,"source.name":r.name,"source.type":r.type,"parent.type":r.parent?.type||H.fQ.BA,"parent.id":r.parent?.id})}),Object.entries(r.tags).forEach(([e,t])=>{Z.includes(e)||(a["source.".concat(e)]=t)}),r.isolated??=!0;let c=()=>{};const d=e.runtime.registeredEntities;if(!r.isolated){const e=d.find(({metadata:{target:{id:e}}})=>e===r.id&&!r.isolated);if(e)return e}const u=e=>{r.blocked=!0,c=e};function l(e){return"string"==typeof e&&!!e.trim()&&e.trim().length<501}e.init.api.allow_registered_children||u((0,m.J)(()=>(0,h.R)(55))),l(r.id)&&l(r.name)||u((0,m.J)(()=>(0,h.R)(48,r)));const f={addPageAction:(t,n={})=>y(U,[t,{...a,...n},e],r),deregister:()=>{g(),u((0,m.J)(()=>(0,h.R)(68)))},log:(t,n={})=>y(F,[t,{...n,customAttributes:{...a,...n.customAttributes||{}}},e],r),measure:(t,n={})=>y(V,[t,{...n,customAttributes:{...a,...n.customAttributes||{}}},e],r),noticeError:(t,n={})=>y(B,[t,{...a,...n},e],r),register:(t={})=>y(X,[e,t],f.metadata.target),recordCustomEvent:(t,n={})=>y(G,[t,{...a,...n},e],r),setApplicationVersion:e=>v("application.version",e),setCustomAttribute:(e,t)=>v(e,t),setUserId:e=>v("enduser.id",e),metadata:{get customAttributes(){return a},target:r,timings:i}},p=()=>(r.blocked&&c(),r.blocked);function g(){i.reportedAt||(i.reportedAt=(0,o.t)(),f.recordCustomEvent("MicroFrontEndTiming",{assetUrl:i.asset,assetType:i.type,timeToLoad:i.registeredAt-i.fetchStart,timeToBeRequested:i.fetchStart,timeToFetch:i.fetchEnd-i.fetchStart,timeToRegister:i.registeredAt-i.fetchEnd,timeAlive:i.reportedAt-i.registeredAt}))}p()||(d.push(f),(0,x.G)(g));const v=(e,t)=>{p()||(a[e]=t)},y=(r,n,i)=>{if(p()&&r!==X)return;const a=(0,o.t)();(0,s.p)(O.xV,["API/register/".concat(r.name,"/called")],void 0,t.K7.metrics,e.ee);try{return r(...n,i,a)}catch(e){(0,h.R)(50,e)}};return f}class Q extends y{static featureName=k.T;constructor(e){var t;super(e,k.T),t=e,(0,c.Y)(a.o5,(e,r)=>B(e,r,t),t),function(e){(0,c.Y)(a.bt,function(t){e.runtime.onerror=t},e)}(e),function(e){let t=0;(0,c.Y)(a.k6,function(e,r){++t>10||(this.runtime.releaseIds[e.slice(-200)]=(""+r).slice(-200))},e)}(e),q(e);try{this.removeOnAbort=new AbortController}catch(e){}this.ee.on("internal-error",(t,r)=>{this.abortHandler&&(0,s.p)("ierr",[C(t),(0,o.t)(),!0,{},e.runtime.isRecording,r],void 0,this.featureName,this.ee)}),f.gm.addEventListener("unhandledrejection",t=>{this.abortHandler&&(0,s.p)("err",[L(t),(0,o.t)(),!1,{unhandledPromiseRejection:1},e.runtime.isRecording],void 0,this.featureName,this.ee)},(0,N.jT)(!1,this.removeOnAbort?.signal)),f.gm.addEventListener("error",t=>{this.abortHandler&&(0,s.p)("err",[I(t),(0,o.t)(),!1,{},e.runtime.isRecording],void 0,this.featureName,this.ee)},(0,N.jT)(!1,this.removeOnAbort?.signal)),this.abortHandler=this.#r,this.importAggregator(e,()=>i.e(478).then(i.bind(i,2176)))}#r(){this.removeOnAbort?.abort(),this.abortHandler=void 0}}var J=i(8990);let ee=1;function te(e){const t=typeof e;return!e||"object"!==t&&"function"!==t?-1:e===f.gm?0:(0,J.I)(e,"nr@id",function(){return ee++})}function re(e){if("string"==typeof e&&e.length)return e.length;if("object"==typeof e){if("undefined"!=typeof ArrayBuffer&&e instanceof ArrayBuffer&&e.byteLength)return e.byteLength;if("undefined"!=typeof Blob&&e instanceof Blob&&e.size)return e.size;if(!("undefined"!=typeof FormData&&e instanceof FormData))try{return(0,D.A)(e).length}catch(e){return}}}var ne=i(8139),ie=i(7836),se=i(3434);const oe={},ae=["open","send"];function ce(e,t){var r=e||ie.ee;const n=function(e){return(e||ie.ee).get("xhr")}(r);if(void 0===f.gm.XMLHttpRequest)return n;if(oe[n.debugId]++)return n;oe[n.debugId]=1,(0,ne.u)(r);var i=(0,se.YM)(n),s=f.gm.XMLHttpRequest,o=f.gm.MutationObserver,a=f.gm.Promise,c=f.gm.setInterval,d="readystatechange",u=["onload","onerror","onabort","onloadstart","onloadend","onprogress","ontimeout"],l=[],p=f.gm.XMLHttpRequest=function(e){const r=new s(e),o=n.context(r);o.targets=(0,H.$5)(t);try{n.emit("new-xhr",[r],o),r.addEventListener(d,(a=o,function(){var e=this;e.readyState>3&&!a.resolved&&(a.resolved=!0,n.emit("xhr-resolved",[],e)),i.inPlace(e,u,"fn-",w)}),(0,N.jT)(!1))}catch(e){(0,h.R)(15,e);try{n.emit("internal-error",[e])}catch(e){}}var a;return r};function g(e,t){i.inPlace(t,["onreadystatechange"],"fn-",w)}if(function(e,t){for(var r in e)t[r]=e[r]}(s,p),p.prototype=s.prototype,i.inPlace(p.prototype,ae,"-xhr-",w),n.on("send-xhr-start",function(e,t){g(e,t),function(e){l.push(e),o&&(m?m.then(b):c?c(b):(v=-v,y.data=v))}(t)}),n.on("open-xhr-start",g),o){var m=a&&a.resolve();if(!c&&!a){var v=1,y=document.createTextNode(v);new o(b).observe(y,{characterData:!0})}}else r.on("fn-end",function(e){e[0]&&e[0].type===d||b()});function b(){for(var e=0;e<l.length;e++)g(0,l[e]);l.length&&(l=[])}function w(e,t){return t}return n}var de="fetch-",ue=de+"body-",le=["arrayBuffer","blob","json","text","formData"],fe=f.gm.Request,he=f.gm.Response,pe="prototype";const ge={};function me(e,t){const r=function(e){return(e||ie.ee).get("fetch")}(e);if(!(fe&&he&&f.gm.fetch))return r;if(ge[r.debugId]++)return r;function n(e,n,i){var s=e[n];"function"==typeof s&&(e[n]=function(){var e=[...arguments];const n={},o=(0,H.$5)(t);var a;r.emit(i+"before-start",[e],n),n[ie.P]&&n[ie.P].dt&&(a=n[ie.P].dt);var c=s.apply(this,e);return r.emit(i+"start",[e,a],c),c.then(function(e){return r.emit(i+"end",[null,e,o],c),e},function(e){throw r.emit(i+"end",[e,void 0,o],c),e})})}return ge[r.debugId]=1,le.forEach(e=>{n(fe[pe],e,ue),n(he[pe],e,ue)}),n(f.gm,"fetch",de),r.on(de+"end",function(e,t,n){var i=this;if(i.targets=n||[void 0],t){var s=t.headers.get("content-length");null!==s&&(i.rxSize=s),r.emit(de+"done",[null,t],i)}else r.emit(de+"done",[e],i)}),r}var ve=i(7485);class ye{constructor(e){this.agentRef=e}generateTracePayload(e){const t=this.agentRef.loader_config;if(!this.shouldGenerateTrace(e)||!t)return null;var r=(t.accountID||"").toString()||null,n=(t.agentID||"").toString()||null,i=(t.trustKey||"").toString()||null;if(!r||!n)return null;var s=(0,Y.ZF)(),o=(0,Y.el)(),a=Date.now(),c={spanId:s,traceId:o,timestamp:a};return(e.sameOrigin||this.isAllowedOrigin(e)&&this.useTraceContextHeadersForCors())&&(c.traceContextParentHeader=this.generateTraceContextParentHeader(s,o),c.traceContextStateHeader=this.generateTraceContextStateHeader(s,a,r,n,i)),(e.sameOrigin&&!this.excludeNewrelicHeader()||!e.sameOrigin&&this.isAllowedOrigin(e)&&this.useNewrelicHeaderForCors())&&(c.newrelicHeader=this.generateTraceHeader(s,o,a,r,n,i)),c}generateTraceContextParentHeader(e,t){return"00-"+t+"-"+e+"-01"}generateTraceContextStateHeader(e,t,r,n,i){return i+"@nr=0-1-"+r+"-"+n+"-"+e+"----"+t}generateTraceHeader(e,t,r,n,i,s){if(!("function"==typeof f.gm?.btoa))return null;var o={v:[0,1],d:{ty:"Browser",ac:n,ap:i,id:e,tr:t,ti:r}};return s&&n!==s&&(o.d.tk=s),btoa((0,D.A)(o))}shouldGenerateTrace(e){return this.agentRef.init?.distributed_tracing?.enabled&&this.isAllowedOrigin(e)}isAllowedOrigin(e){var t=!1;const r=this.agentRef.init?.distributed_tracing;if(e.sameOrigin)t=!0;else if(r?.allowed_origins instanceof Array)for(var n=0;n<r.allowed_origins.length;n++){var i=(0,ve.D)(r.allowed_origins[n]);if(e.hostname===i.hostname&&e.protocol===i.protocol&&e.port===i.port){t=!0;break}}return t}excludeNewrelicHeader(){var e=this.agentRef.init?.distributed_tracing;return!!e&&!!e.exclude_newrelic_header}useNewrelicHeaderForCors(){var e=this.agentRef.init?.distributed_tracing;return!!e&&!1!==e.cors_use_newrelic_header}useTraceContextHeadersForCors(){var e=this.agentRef.init?.distributed_tracing;return!!e&&!!e.cors_use_tracecontext_headers}}var be=i(9300),we=i(7295);function Re(e){return"string"==typeof e?e:e instanceof(0,T.dV)().o.REQ?e.url:f.gm?.URL&&e instanceof URL?e.href:void 0}var Ee=["load","error","abort","timeout"],Te=Ee.length,Ae=(0,T.dV)().o.REQ,xe=(0,T.dV)().o.XHR;const Se="X-NewRelic-App-Data";class _e extends y{static featureName=be.T;constructor(e){super(e,be.T),this.dt=new ye(e),this.handler=(e,t,r,n)=>(0,s.p)(e,t,r,n,this.ee);try{const e={xmlhttprequest:"xhr",fetch:"fetch",beacon:"beacon"};f.gm?.performance?.getEntriesByType("resource").forEach(r=>{if(r.initiatorType in e&&0!==r.responseStatus){const n={status:r.responseStatus},i={rxSize:r.transferSize,duration:Math.floor(r.duration),cbTime:0};Oe(n,r.name),this.handler("xhr",[n,i,r.startTime,r.responseEnd,e[r.initiatorType]],void 0,t.K7.ajax)}})}catch(e){}me(this.ee,e),ce(this.ee,e),function(e,r,n,i){function a(e){var t=this;t.totalCbs=0,t.called=0,t.cbTime=0,t.end=T,t.ended=!1,t.xhrGuids={},t.lastSize=null,t.loadCaptureCalled=!1,t.params=this.params||{},t.metrics=this.metrics||{},t.latestLongtaskEnd=0,e.addEventListener("load",function(r){x(t,e)},(0,N.jT)(!1)),f.lR||e.addEventListener("progress",function(e){t.lastSize=e.loaded},(0,N.jT)(!1))}function c(e){this.params={method:e[0]},Oe(this,e[1]),this.metrics={}}function d(t,r){e.loader_config.xpid&&this.sameOrigin&&r.setRequestHeader("X-NewRelic-ID",e.loader_config.xpid);var n=i.generateTracePayload(this.parsedOrigin);if(n){var s=!1;n.newrelicHeader&&(r.setRequestHeader("newrelic",n.newrelicHeader),s=!0),n.traceContextParentHeader&&(r.setRequestHeader("traceparent",n.traceContextParentHeader),n.traceContextStateHeader&&r.setRequestHeader("tracestate",n.traceContextStateHeader),s=!0),s&&(this.dt=n)}}function u(e,t){var n=this.metrics,i=e[0],s=this;if(n&&i){var a=re(i);a&&(n.txSize=a)}this.startTime=(0,o.t)(),this.body=i,this.listener=function(e){try{"abort"!==e.type||s.loadCaptureCalled||(s.params.aborted=!0),("load"!==e.type||s.called===s.totalCbs&&(s.onloadCalled||"function"!=typeof t.onload)&&"function"==typeof s.end)&&s.end(t)}catch(e){try{r.emit("internal-error",[e])}catch(e){}}};for(var c=0;c<Te;c++)t.addEventListener(Ee[c],this.listener,(0,N.jT)(!1))}function l(e,t,r){this.cbTime+=e,t?this.onloadCalled=!0:this.called+=1,this.called!==this.totalCbs||!this.onloadCalled&&"function"==typeof r.onload||"function"!=typeof this.end||this.end(r)}function h(e,t){var r=""+te(e)+!!t;this.xhrGuids&&!this.xhrGuids[r]&&(this.xhrGuids[r]=!0,this.totalCbs+=1)}function p(e,t){var r=""+te(e)+!!t;this.xhrGuids&&this.xhrGuids[r]&&(delete this.xhrGuids[r],this.totalCbs-=1)}function g(){this.endTime=(0,o.t)()}function m(e,t){t instanceof xe&&"load"===e[0]&&r.emit("xhr-load-added",[e[1],e[2]],t)}function v(e,t){t instanceof xe&&"load"===e[0]&&r.emit("xhr-load-removed",[e[1],e[2]],t)}function y(e,t,r){t instanceof xe&&("onload"===r&&(this.onload=!0),("load"===(e[0]&&e[0].type)||this.onload)&&(this.xhrCbStart=(0,o.t)()))}function b(e,t){this.xhrCbStart&&r.emit("xhr-cb-time",[(0,o.t)()-this.xhrCbStart,this.onload,t],t)}function w(e){var t,r=e[1]||{};if("string"==typeof e[0]?0===(t=e[0]).length&&f.RI&&(t=""+f.gm.location.href):e[0]&&e[0].url?t=e[0].url:f.gm?.URL&&e[0]&&e[0]instanceof URL?t=e[0].href:"function"==typeof e[0].toString&&(t=e[0].toString()),"string"==typeof t&&0!==t.length){t&&(this.parsedOrigin=(0,ve.D)(t),this.sameOrigin=this.parsedOrigin.sameOrigin);var n=i.generateTracePayload(this.parsedOrigin);if(n&&(n.newrelicHeader||n.traceContextParentHeader))if(e[0]&&e[0].headers)a(e[0].headers,n)&&(this.dt=n);else{var s={};for(var o in r)s[o]=r[o];s.headers=new Headers(r.headers||{}),a(s.headers,n)&&(this.dt=n),e.length>1?e[1]=s:e.push(s)}}function a(e,t){var r=!1;return t.newrelicHeader&&(e.set("newrelic",t.newrelicHeader),r=!0),t.traceContextParentHeader&&(e.set("traceparent",t.traceContextParentHeader),t.traceContextStateHeader&&e.set("tracestate",t.traceContextStateHeader),r=!0),r}}function R(e,t){this.params={},this.metrics={},this.startTime=(0,o.t)(),this.dt=t;let[r,n={}]=e;Oe(this,Re(r));const i=(""+(r&&r instanceof Ae&&r.method||n.method||"GET")).toUpperCase();this.params.method=i,this.body=n.body,this.txSize=re(n.body)||0}function E(e,t){if(this.endTime=(0,o.t)(),this.params||(this.params={}),(0,we.iW)(this.params))return;let r;this.params.status=t?t.status:0,"string"==typeof this.rxSize&&this.rxSize.length>0&&(r=+this.rxSize);const n={txSize:this.txSize,rxSize:r,duration:(0,o.t)()-this.startTime},i=[this.params,n,this.startTime,this.endTime,"fetch"];this.targets.forEach(e=>A(i,this,e))}function T(e){const t=this.params,r=this.metrics;if(this.ended)return;this.ended=!0;for(let t=0;t<Te;t++)e.removeEventListener(Ee[t],this.listener,!1);if(t.aborted)return;if((0,we.iW)(t))return;r.duration=(0,o.t)()-this.startTime,this.loadCaptureCalled||4!==e.readyState?null==t.status&&(t.status=0):x(this,e),r.cbTime=this.cbTime;const n=[t,r,this.startTime,this.endTime,"xhr"];this.targets.forEach(e=>A(n,this,e))}function A(e,r,i){n("xhr",[...e,i],r,t.K7.ajax)}function x(e,n){e.params.status=n.status;var i=function(e,t){var r=e.responseType;return"json"===r&&null!==t?t:"arraybuffer"===r||"blob"===r||"json"===r?re(e.response):"text"===r||""===r||void 0===r?re(e.responseText):void 0}(n,e.lastSize);if(i&&(e.metrics.rxSize=i),e.sameOrigin&&n.getAllResponseHeaders().indexOf(Se)>=0){var o=n.getResponseHeader(Se);o&&((0,s.p)(O.rs,["Ajax/CrossApplicationTracing/Header/Seen"],void 0,t.K7.metrics,r),e.params.cat=o.split(", ").pop())}e.loadCaptureCalled=!0}r.on("new-xhr",a),r.on("open-xhr-start",c),r.on("open-xhr-end",d),r.on("send-xhr-start",u),r.on("xhr-cb-time",l),r.on("xhr-load-added",h),r.on("xhr-load-removed",p),r.on("xhr-resolved",g),r.on("addEventListener-end",m),r.on("removeEventListener-end",v),r.on("fn-end",b),r.on("fetch-before-start",w),r.on("fetch-start",R),r.on("fn-start",y),r.on("fetch-done",E)}(e,this.ee,this.handler,this.dt),this.importAggregator(e,()=>i.e(478).then(i.bind(i,3845)))}}function Oe(e,t){var r=(0,ve.D)(t),n=e.params||e;n.hostname=r.hostname,n.port=r.port,n.protocol=r.protocol,n.host=r.hostname+":"+r.port,n.pathname=r.pathname,e.parsedOrigin=r,e.sameOrigin=r.sameOrigin}const Pe={},ke=["pushState","replaceState"];function Ne(e){const t=function(e){return(e||ie.ee).get("history")}(e);return!f.RI||Pe[t.debugId]++||(Pe[t.debugId]=1,(0,se.YM)(t).inPlace(window.history,ke,"-")),t}var De=i(3738);function je(e){(0,c.Y)(a.BL,function(r=Date.now()){const n=r-f.WN;n<0&&(0,h.R)(62,r),(0,s.p)(O.XG,[a.BL,{time:n}],void 0,t.K7.metrics,e.ee),e.addToTrace({name:a.BL,start:r,origin:"nr"}),(0,s.p)(a.Pl+a.hG,[n,a.BL],void 0,t.K7.genericEvents,e.ee)},e)}const{He:Ce,bD:Le,d3:Ie,Kp:Me,TZ:Be,Lc:He,uP:We,Rz:Ke}=De;class Fe extends y{static featureName=Be;constructor(e){var r;super(e,Be),r=e,(0,c.Y)(a.U2,function(e){if(!(e&&"object"==typeof e&&e.name&&e.start))return;const n={n:e.name,s:e.start-f.WN,e:(e.end||e.start)-f.WN,o:e.origin||"",t:"api"};n.s<0||n.e<0||n.e<n.s?(0,h.R)(61,{start:n.s,end:n.e}):(0,s.p)("bstApi",[n],void 0,t.K7.sessionTrace,r.ee)},r),je(e);if(!(0,g.V)(e.init))return void this.deregisterDrain();const n=this.ee;let d;Ne(n),this.eventsEE=(0,ne.u)(n),this.eventsEE.on(We,function(e,t){this.bstStart=(0,o.t)()}),this.eventsEE.on(He,function(e,r){(0,s.p)("bst",[e[0],r,this.bstStart,(0,o.t)()],void 0,t.K7.sessionTrace,n)}),n.on(Ke+Ie,function(e){this.time=(0,o.t)(),this.startPath=location.pathname+location.hash}),n.on(Ke+Me,function(e){(0,s.p)("bstHist",[location.pathname+location.hash,this.startPath,this.time],void 0,t.K7.sessionTrace,n)});try{d=new PerformanceObserver(e=>{const r=e.getEntries();(0,s.p)(Ce,[r],void 0,t.K7.sessionTrace,n)}),d.observe({type:Le,buffered:!0})}catch(e){}this.importAggregator(e,()=>i.e(478).then(i.bind(i,6974)),{resourceObserver:d})}}var Ue=i(6344);class Ve extends y{static featureName=Ue.TZ;#n;recorder;constructor(e){var r;let n;super(e,Ue.TZ),r=e,(0,c.Y)(a.CH,function(){(0,s.p)(a.CH,[],void 0,t.K7.sessionReplay,r.ee)},r),function(e){(0,c.Y)(a.Tb,function(){(0,s.p)(a.Tb,[],void 0,t.K7.sessionReplay,e.ee)},e)}(e);try{n=JSON.parse(localStorage.getItem("".concat(w.H3,"_").concat(w.uh)))}catch(e){}(0,p.SR)(e.init)&&this.ee.on(a.CH,()=>this.#i()),this.#s(n)&&this.importRecorder().then(e=>{e.startRecording(Ue.Qb.PRELOAD,n?.sessionReplayMode)}),this.importAggregator(this.agentRef,()=>i.e(478).then(i.bind(i,6167)),this),this.ee.on("err",e=>{this.blocked||this.agentRef.runtime.isRecording&&(this.errorNoticed=!0,(0,s.p)(Ue.Vh,[e],void 0,this.featureName,this.ee))})}#s(e){return e&&(e.sessionReplayMode===w.g.FULL||e.sessionReplayMode===w.g.ERROR)||(0,p.Aw)(this.agentRef.init)}importRecorder(){return this.recorder?Promise.resolve(this.recorder):(this.#n??=Promise.all([i.e(478),i.e(249)]).then(i.bind(i,4866)).then(({Recorder:e})=>(this.recorder=new e(this),this.recorder)).catch(e=>{throw this.ee.emit("internal-error",[e]),this.blocked=!0,e}),this.#n)}#i(){this.blocked||(this.featAggregate?this.featAggregate.mode!==w.g.FULL&&this.featAggregate.initializeRecording(w.g.FULL,!0,Ue.Qb.API):this.importRecorder().then(()=>{this.recorder.startRecording(Ue.Qb.API,w.g.FULL)}))}}var Ge=i(3962);class ze extends y{static featureName=Ge.TZ;constructor(e){if(super(e,Ge.TZ),function(e){const r=e.ee.get("tracer");function n(){}(0,c.Y)(a.dT,function(e){return(new n).get("object"==typeof e?e:{})},e);const i=n.prototype={createTracer:function(n,i){var a={},c=this,d="function"==typeof i;return(0,s.p)(O.xV,["API/createTracer/called"],void 0,t.K7.metrics,e.ee),function(){if(r.emit((d?"":"no-")+"fn-start",[(0,o.t)(),c,d],a),d)try{return i.apply(this,arguments)}catch(e){const t="string"==typeof e?new Error(e):e;throw r.emit("fn-err",[arguments,this,t],a),t}finally{r.emit("fn-end",[(0,o.t)()],a)}}}};["actionText","setName","setAttribute","save","ignore","onEnd","getContext","end","get"].forEach(r=>{c.Y.apply(this,[r,function(){return(0,s.p)(a.hw+r,[performance.now(),...arguments],this,t.K7.softNav,e.ee),this},e,i])}),(0,c.Y)(a.PA,function(){(0,s.p)(a.hw+"routeName",[performance.now(),...arguments],void 0,t.K7.softNav,e.ee)},e)}(e),!f.RI||!(0,T.dV)().o.MO)return;const r=Ne(this.ee);try{this.removeOnAbort=new AbortController}catch(e){}Ge.tC.forEach(e=>{(0,N.sp)(e,e=>{l(e)},!0,this.removeOnAbort?.signal)});const n=()=>(0,s.p)("newURL",[(0,o.t)(),""+window.location],void 0,this.featureName,this.ee);r.on("pushState-end",n),r.on("replaceState-end",n),(0,N.sp)(Ge.OV,e=>{l(e),(0,s.p)("newURL",[e.timeStamp,""+window.location],void 0,this.featureName,this.ee)},!0,this.removeOnAbort?.signal);let d=!1;const u=new((0,T.dV)().o.MO)((e,t)=>{d||(d=!0,requestAnimationFrame(()=>{(0,s.p)("newDom",[(0,o.t)()],void 0,this.featureName,this.ee),d=!1}))}),l=(0,m.s)(e=>{"loading"!==document.readyState&&((0,s.p)("newUIEvent",[e],void 0,this.featureName,this.ee),u.observe(document.body,{attributes:!0,childList:!0,subtree:!0,characterData:!0}))},100,{leading:!0});this.abortHandler=function(){this.removeOnAbort?.abort(),u.disconnect(),this.abortHandler=void 0},this.importAggregator(e,()=>i.e(478).then(i.bind(i,4393)),{domObserver:u})}}var Ye=i(3333),Ze=i(9119);const qe={},Xe=new Set;function $e(e){return"string"==typeof e?{type:"string",size:(new TextEncoder).encode(e).length}:e instanceof ArrayBuffer?{type:"ArrayBuffer",size:e.byteLength}:e instanceof Blob?{type:"Blob",size:e.size}:e instanceof DataView?{type:"DataView",size:e.byteLength}:ArrayBuffer.isView(e)?{type:"TypedArray",size:e.byteLength}:{type:"unknown",size:0}}class Qe{constructor(e,t){this.timestamp=(0,o.t)(),this.currentUrl=(0,Ze.L)(window.location.href),this.socketId=(0,Y.LA)(8),this.requestedUrl=(0,Ze.L)(e),this.requestedProtocols=Array.isArray(t)?t.join(","):t||"",this.openedAt=void 0,this.protocol=void 0,this.extensions=void 0,this.binaryType=void 0,this.messageOrigin=void 0,this.messageCount=0,this.messageBytes=0,this.messageBytesMin=0,this.messageBytesMax=0,this.messageTypes=void 0,this.sendCount=0,this.sendBytes=0,this.sendBytesMin=0,this.sendBytesMax=0,this.sendTypes=void 0,this.closedAt=void 0,this.closeCode=void 0,this.closeReason="unknown",this.closeWasClean=void 0,this.connectedDuration=0,this.hasErrors=void 0}}class Je extends y{static featureName=Ye.TZ;constructor(e){super(e,Ye.TZ);const r=e.init.feature_flags.includes("websockets"),n=[e.init.page_action.enabled,e.init.performance.capture_marks,e.init.performance.capture_measures,e.init.performance.resources.enabled,e.init.user_actions.enabled,r];var d;let u,l;if(d=e,(0,c.Y)(a.hG,(e,t)=>U(e,t,d),d),function(e){(0,c.Y)(a.fF,(t,r)=>G(t,r,e),e)}(e),je(e),q(e),function(e){(0,c.Y)(a.V1,(t,r)=>V(t,r,e),e)}(e),r&&(l=function(e){if(!(0,T.dV)().o.WS)return e;const t=e.get("websockets");if(qe[t.debugId]++)return t;qe[t.debugId]=1,(0,x.G)(()=>{const e=(0,o.t)();Xe.forEach(r=>{r.nrData.closedAt=e,r.nrData.closeCode=1001,r.nrData.closeReason="Page navigating away",r.nrData.closeWasClean=!1,r.nrData.openedAt&&(r.nrData.connectedDuration=e-r.nrData.openedAt),t.emit("ws",[r.nrData],r)})});class r extends WebSocket{static name="WebSocket";static toString(){return"function WebSocket() { [native code] }"}toString(){return"[object WebSocket]"}get[Symbol.toStringTag](){return r.name}#o(e){(e.__newrelic??={}).socketId=this.nrData.socketId,this.nrData.hasErrors??=!0}constructor(...e){super(...e),this.nrData=new Qe(e[0],e[1]),this.addEventListener("open",()=>{this.nrData.openedAt=(0,o.t)(),["protocol","extensions","binaryType"].forEach(e=>{this.nrData[e]=this[e]}),Xe.add(this)}),this.addEventListener("message",e=>{const{type:t,size:r}=$e(e.data);this.nrData.messageOrigin??=(0,Ze.L)(e.origin),this.nrData.messageCount++,this.nrData.messageBytes+=r,this.nrData.messageBytesMin=Math.min(this.nrData.messageBytesMin||1/0,r),this.nrData.messageBytesMax=Math.max(this.nrData.messageBytesMax,r),(this.nrData.messageTypes??"").includes(t)||(this.nrData.messageTypes=this.nrData.messageTypes?"".concat(this.nrData.messageTypes,",").concat(t):t)}),this.addEventListener("close",e=>{this.nrData.closedAt=(0,o.t)(),this.nrData.closeCode=e.code,e.reason&&(this.nrData.closeReason=e.reason),this.nrData.closeWasClean=e.wasClean,this.nrData.connectedDuration=this.nrData.closedAt-this.nrData.openedAt,Xe.delete(this),t.emit("ws",[this.nrData],this)})}addEventListener(e,t,...r){const n=this,i="function"==typeof t?function(...e){try{return t.apply(this,e)}catch(e){throw n.#o(e),e}}:t?.handleEvent?{handleEvent:function(...e){try{return t.handleEvent.apply(t,e)}catch(e){throw n.#o(e),e}}}:t;return super.addEventListener(e,i,...r)}send(e){if(this.readyState===WebSocket.OPEN){const{type:t,size:r}=$e(e);this.nrData.sendCount++,this.nrData.sendBytes+=r,this.nrData.sendBytesMin=Math.min(this.nrData.sendBytesMin||1/0,r),this.nrData.sendBytesMax=Math.max(this.nrData.sendBytesMax,r),(this.nrData.sendTypes??"").includes(t)||(this.nrData.sendTypes=this.nrData.sendTypes?"".concat(this.nrData.sendTypes,",").concat(t):t)}try{return super.send(e)}catch(e){throw this.#o(e),e}}close(...e){try{super.close(...e)}catch(e){throw this.#o(e),e}}}return f.gm.WebSocket=r,t}(this.ee)),f.RI){if(me(this.ee,e),ce(this.ee,e),u=Ne(this.ee),e.init.user_actions.enabled){function h(t){const r=(0,ve.D)(t);return e.beacons.includes(r.hostname+":"+r.port)}function p(){u.emit("navChange")}Ye.Zp.forEach(e=>(0,N.sp)(e,e=>(0,s.p)("ua",[e],void 0,this.featureName,this.ee),!0)),Ye.qN.forEach(e=>{const t=(0,m.s)(e=>{(0,s.p)("ua",[e],void 0,this.featureName,this.ee)},500,{leading:!0});(0,N.sp)(e,t)}),f.gm.addEventListener("error",()=>{(0,s.p)("uaErr",[],void 0,t.K7.genericEvents,this.ee)},(0,N.jT)(!1,this.removeOnAbort?.signal)),this.ee.on("open-xhr-start",(e,r)=>{h(e[1])||r.addEventListener("readystatechange",()=>{2===r.readyState&&(0,s.p)("uaXhr",[],void 0,t.K7.genericEvents,this.ee)})}),this.ee.on("fetch-start",e=>{e.length>=1&&!h(Re(e[0]))&&(0,s.p)("uaXhr",[],void 0,t.K7.genericEvents,this.ee)}),u.on("pushState-end",p),u.on("replaceState-end",p),window.addEventListener("hashchange",p,(0,N.jT)(!0,this.removeOnAbort?.signal)),window.addEventListener("popstate",p,(0,N.jT)(!0,this.removeOnAbort?.signal))}if(e.init.performance.resources.enabled&&f.gm.PerformanceObserver?.supportedEntryTypes.includes("resource")){new PerformanceObserver(e=>{e.getEntries().forEach(e=>{(0,s.p)("browserPerformance.resource",[e],void 0,this.featureName,this.ee)})}).observe({type:"resource",buffered:!0})}}r&&l.on("ws",e=>{(0,s.p)("ws-complete",[e],void 0,this.featureName,this.ee)});try{this.removeOnAbort=new AbortController}catch(g){}this.abortHandler=()=>{this.removeOnAbort?.abort(),this.abortHandler=void 0},n.some(e=>e)?this.importAggregator(e,()=>i.e(478).then(i.bind(i,8019))):this.deregisterDrain()}}var et=i(2646);const tt=new Map;function rt(e,t,r,n,i=!0,s){if("object"!=typeof t||!t||"string"!=typeof r||!r||"function"!=typeof t[r])return(0,h.R)(29);const o=function(e){return(e||ie.ee).get("logger")}(e),a=(0,se.YM)(o,void 0,s),c=new et.y(ie.P);c.level=n.level,c.customAttributes=n.customAttributes,c.autoCaptured=i;const d=t[r]?.[se.Jt]||t[r];return tt.set(d,c),a.inPlace(t,[r],"wrap-logger-",()=>tt.get(d),void 0,!0),o}var nt=i(1910);class it extends y{static featureName=W.TZ;constructor(e){var t;super(e,W.TZ),t=e,(0,c.Y)(a.$9,(e,r)=>F(e,r,t),t),function(e){(0,c.Y)(a.Wb,(t,r,{customAttributes:n={},level:i=W.p_.INFO}={})=>{rt(e.ee,t,r,{customAttributes:n,level:i},!1,e)},e)}(e),q(e);const r=this.ee;["log","error","warn","info","debug","trace"].forEach(t=>{(0,nt.i)(f.gm.console[t]),rt(r,f.gm.console,t,{level:"log"===t?"info":t},void 0,e)}),this.ee.on("wrap-logger-end",function([e],t,n,i=[]){const{level:s,customAttributes:o,autoCaptured:a}=this;i.forEach(t=>{(0,K.R)(r,e,o,s,a,t)})}),this.importAggregator(e,()=>i.e(478).then(i.bind(i,5288)))}}new A({features:[_e,E,_,Fe,Ve,P,Q,Je,it,ze],loaderType:"spa"})})()})();</script>
<meta name="title" content="Món mới món ngon">
<meta name="robots" content="INDEX,FOLLOW">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<meta name="format-detection" content="telephone=no">
<title>Món mới món ngon</title>
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/calendar.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/css/styles-m.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Levinci_EnvironmentRibbon/css/ribbons.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magefan_Blog/css/blog-m.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magefan_Blog/css/blog-custom.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Mageplaza_Core/css/owl.carousel.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Mageplaza_Core/css/owl.theme.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Mageplaza_BannerSlider/css/animate.min.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Plumrocket_CookieConsent/css/cookie-consent.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Levinci_News/css/slick.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Levinci_News/css/slick-theme.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Mageplaza_SocialLogin/css/style.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Mageplaza_Core/css/grid-mageplaza.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Mageplaza_Core/css/font-awesome.min.css">
<link rel="stylesheet" type="text/css" media="all" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Mageplaza_Core/css/magnific-popup.css">
<link rel="stylesheet" type="text/css" media="screen and (min-width: 1200px)" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/css/styles-l.css">
<link rel="stylesheet" type="text/css" media="print" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/css/print.css">
<script type="text/javascript" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/requirejs/require.js"></script>
<script type="text/javascript" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/requirejs/mixins.js"></script>
<script type="text/javascript" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/requirejs-config.js"></script>
<script type="text/javascript" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/js/check-minicart.js"></script>
<link rel="preload" as="font" crossorigin="anonymous" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/fonts/opensans/light/opensans-300.woff2">
<link rel="preload" as="font" crossorigin="anonymous" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/fonts/opensans/regular/opensans-400.woff2">
<link rel="preload" as="font" crossorigin="anonymous" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/fonts/opensans/semibold/opensans-600.woff2">
<link rel="preload" as="font" crossorigin="anonymous" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/fonts/opensans/bold/opensans-700.woff2">
<link rel="preload" as="font" crossorigin="anonymous" href="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/fonts/Luma-Icons.woff2">
<link rel="icon" type="image/x-icon" href="https://jollibee.com.vn/media/favicon/default/favicon.png">
<link rel="shortcut icon" type="image/x-icon" href="https://jollibee.com.vn/media/favicon/default/favicon.png">
<meta name="p:domain_verify" content="lTqUTnOb2F4kAADmpqp0KOYkPt2X4Tal">
<meta name="facebook-domain-verification" content="o04l2wdjt3x0var1u4y6x93ez712v6">
<!-- Facebook Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '250652843433500');
    fbq('track', 'PageView');
    </script>
    <noscript>
    <img height="1" width="1" style="display:none" 
        src="https://www.facebook.com/tr?id=250652843433500&ev=PageView&noscript=1"/>
    </noscript>
<!-- End Facebook Pixel Code -->

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async="" src="https://www.googletagmanager.com/gtag/js?id=UA-191456349-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-191456349-1'); 
</script>
<!-- End Global site tag (gtag.js) - Google Analytics -->
<style>
    body.checkout-index-index #checkoutSteps #customer-info .social-login {
        margin-top: 0;
    }
</style>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K37KLDW4');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N5SVNLD');</script>
<!-- End Google Tag Manager -->

<!-- AKA Tracking -->
<script src="//cdnt.netcoresmartech.com/smartechclient.js"></script>      <script>        smartech('create', 'ADGMOT35CHFLVDHBJNIG50K9693IV1A9OMC235B2PJIGE16LEVPG' );        smartech('register', 'f89ba3962da09ab0304b19f668d9a276');        smartech('identify', '');  
const currentURL = window.location.href;
const urlParts = currentURL.split('/');
let lastPart = urlParts[urlParts.length - 1];
lastPart = lastPart.replace('.html', '');

const allowedPaths = [
  'ga-gion-vui-ve',
  'mon-moi-mon-ngon',
  'mi-y-sot-bo-bam',
  'ga-sot-cay',
  'burger-com',
  'phan-an-phu',
  'mon-trang-mieng',
  '#shipping',
  '#payment'
];

if ((lastPart === '' || !allowedPaths.includes(lastPart)) && urlParts[urlParts.length - 2] !== 'success') {
  smartech('dispatch', 1, {});
}

  </script><script async="" id="smartech_v4" src="https://osjs.netcoresmartech.com/v1/js-versioning?clientkey=ADGMOT35CHFLVDHBJNIG50K9693IV1A9OMC235B2PJIGE16LEVPG&amp;siteid=f89ba3962da09ab0304b19f668d9a276&amp;rc=s&amp;tk1=20241129111433&amp;tk2=20240916035043"></script>      
<!-- End AKA Tracking -->
 <script type="text/javascript">

                (function(){var g=function(e,h,f,g){

                    this.get=function(a){for(var a=a+"=",c=document.cookie.split(";"),b=0,e=c.length;b<e;b++){for(var d=c[b];" "==d.charAt(0);)d=d.substring(1,d.length);if(0==d.indexOf(a))return d.substring(a.length,d.length)}return null};

                    this.set=function(a,c){var b="",b=new Date;b.setTime(b.getTime()+6048E5);b="; expires="+b.toGMTString();document.cookie=a+"="+c+b+"; path=/; "};

                    this.check=function(){var a=this.get(f);if(a)a=a.split(":");else if(100!=e)"v"==h&&(e=Math.random()>=e/100?0:100),a=[h,e,0],this.set(f,a.join(":"));else return!0;var c=a[1];if(100==c)return!0;switch(a[0]){case "v":return!1;case "r":return c=a[2]%Math.floor(100/c),a[2]++,this.set(f,a.join(":")),!c}return!0};

                    this.go=function(){if(this.check()){var a=document.createElement("script");a.type="text/javascript";a.src=g;document.body&&document.body.appendChild(a)}};

                    this.start=function(){var t=this;"complete"!==document.readyState?window.addEventListener?window.addEventListener("load",function(){t.go()},!1):window.attachEvent&&window.attachEvent("onload",function(){t.go()}):t.go()};};

                    try{(new g(100,"r","QSI_S_ZN_pfwCQFpMY5SjNDP","https://znpfwcqfpmy5sjndp-jfccx.siteintercept.qualtrics.com/SIE/?Q_ZID=ZN_pfwCQFpMY5SjNDP")).start()}catch(i){}})();

            </script>
        

<script>
    var prCookieService = {
        defaultAttributes: {path: '/'},
        converter: {
            write: function (value) {
                return encodeURIComponent(value);
            },

            read: function (value) {
                return decodeURIComponent(value)
            }
        },
        decode: function(string)
        {
            return string.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
        },
        set: function (key, value, attributes)
        {
            if (typeof document === 'undefined') {
                return;
            }

            attributes = Object.assign(this.defaultAttributes, attributes);

            if (typeof attributes.expires === 'number') {
                attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
            }

            attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

            try {
                var result = JSON.stringify(value);
                if (/^[\{\[]/.test(result)) {
                    value = result;
                }
            } catch (e) {}

            value = this.converter.write(value);

            key = this.converter.write(String(key))
                .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
                .replace(/[\(\)]/g, escape);

            var stringifiedAttributes = '';
            for (var attributeName in attributes) {
                if (!attributes[attributeName]) {
                    continue;
                }
                stringifiedAttributes += '; ' + attributeName;
                if (attributes[attributeName] === true) {
                    continue;
                }

                // Considers RFC 6265 section 5.2:
                // ...
                // 3.  If the remaining unparsed-attributes contains a %x3B (";")
                //     character:
                // Consume the characters of the unparsed-attributes up to,
                // not including, the first %x3B (";") character.
                // ...
                stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
            }

            return (document.cookie = key + '=' + value + stringifiedAttributes);
        },

        remove: function (key, attributes) {
            this.set(key, '', {...attributes, ...{
                    expires: -1
                }});
        },

        get: function (key, json = false)
        {
            if (typeof document === 'undefined') {
                return;
            }

            var jar = {};
            var cookies = document.cookie ? document.cookie.split('; ') : [];
            var i = 0;
            for (; i < cookies.length; i++) {
                var parts = cookies[i].split('=');
                var cookie = parts.slice(1).join('=');
                if (!json && cookie.charAt(0) === '"') {
                    cookie = cookie.slice(1, -1);
                }

                try {
                    var name = this.converter.write(parts[0]);
                    cookie = this.converter.read(cookie);

                    if (json) {
                        try {
                            cookie = JSON.parse(cookie);
                        } catch (e) {}
                    }

                    jar[name] = cookie;

                    if (key === name) {
                        break;
                    }
                } catch (e) {}
            }

            return key ? jar[key] : jar;
        }
    }
</script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery/jquery.mobile.custom" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/jquery.mobile.custom.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/common" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/common.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/dataPost" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/dataPost.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/bootstrap" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/bootstrap.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Translation/js/mage-translation-dictionary" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Translation/js/mage-translation-dictionary.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/translate-inline" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/translate-inline.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Theme/js/theme" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Theme/js/theme.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/cookies" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/cookies.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="domReady" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/requirejs/domReady.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/template" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/template.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/modal/confirm" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/modal/confirm.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/widget" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/widget.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/apply/main" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/apply/main.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bootstrap" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bootstrap.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="text" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/requirejs/text.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/translate" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/translate.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/smart-keyboard-handler" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/smart-keyboard-handler.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/mage" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/mage.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/ie-class-fixer" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/ie-class-fixer.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery/jquery.cookie" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/jquery.cookie.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="underscore" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/underscore.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/modal/modal" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/modal/modal.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="knockoutjs/knockout" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/knockoutjs/knockout.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="knockoutjs/knockout-es5" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/knockoutjs/knockout-es5.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/key-codes" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/key-codes.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/core" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/core.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery/patches/jquery" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/patches/jquery.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery/jquery-migrate" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/jquery-migrate.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/dialog" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/dialog.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery/patches/jquery-ui" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/patches/jquery-ui.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/apply/scripts" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/apply/scripts.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/template/engine" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/template/engine.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/bootstrap" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/bootstrap.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/extender/observable_array" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/extender/observable_array.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/extender/bound-nodes" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/extender/bound-nodes.js"></script>
<meta property="og:url" content="https://jollibee.com.vn/">
<meta property="og:type" content="website">
<meta property="og:title" content="Jollibee Việt Nam">
<meta property="og:description" content="Tận hưởng những khoảnh khắc trọn vẹn cùng Jollibee.">
<meta property="og:image" content="https://jollibee.com.vn/media/jollibee/default/logo.png">
<meta property="og:site_name" content="Jollibee Vietnam">
<style>
    #social-login-popup .social-login-title {
        background-color: #6e716e    }

    #social-login-popup .social-login #bnt-social-login-authentication,
    #social-login-popup .forgot .primary button,
    #social-login-popup .create .primary button,
    #social-login-popup .fake-email .primary button {
        background-color: #6e716e;
        border: #6e716e    }

    .block.social-login-authentication-channel.account-social-login .block-content {
        text-align: center;
    }

    
                    #bnt-social-login-fake-email {
                    background-color: grey !important;
                    border: grey !important;
                    }

                    #request-popup .social-login-title {
                    background-color: grey !important;
                    }
                
    /* Compatible ETheme_YOURstore*/
    div#centerColumn .column.main .block.social-login-authentication-channel.account-social-login {
        max-width: 900px !important;
        margin: 0 auto !important;
    }

    div#centerColumn .column.main .block.social-login-authentication-channel.account-social-login .block-content {
        text-align: center;
    }

    @media (max-width: 1024px) {
        div#centerColumn .column.main .block.social-login-authentication-channel.account-social-login .block-content {
            padding: 0 15px;
        }
    }
</style>



    <script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/button" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/button.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/draggable" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/draggable.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/position" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/position.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/resizable" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/resizable.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="knockoutjs/knockout-repeat" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/knockoutjs/knockout-repeat.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="knockoutjs/knockout-fast-foreach" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/knockoutjs/knockout-fast-foreach.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/utils/wrapper" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/utils/wrapper.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/core/events" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/core/events.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/mouse" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/mouse.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Amasty_InvisibleCaptcha/js/model/am-recaptcha" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Amasty_InvisibleCaptcha/js/model/am-recaptcha.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/template/observable_source" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/template/observable_source.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/template/renderer" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/template/renderer.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/logger/console-logger" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/logger/console-logger.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/resizable" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/resizable.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/i18n" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/i18n.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/scope" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/scope.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/range" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/range.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/mage-init" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/mage-init.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/keyboard" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/keyboard.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/optgroup" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/optgroup.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/after-render" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/after-render.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/autoselect" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/autoselect.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/datepicker" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/datepicker.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/outer_click" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/outer_click.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/fadeVisible" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/fadeVisible.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/collapsible" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/collapsible.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/staticChecked" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/staticChecked.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/simple-checked" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/simple-checked.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/bind-html" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/bind-html.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/tooltip" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/tooltip.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/bindings/color-picker" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/bindings/color-picker.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/core/class" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/core/class.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/core/storage/local" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/core/storage/local.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/view/utils/async" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/view/utils/async.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/registry/registry" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/registry/registry.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/utils/main" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/utils/main.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery.sticky" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/js/jquery.sticky.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="spectrum" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/spectrum/spectrum.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="tinycolor" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/spectrum/tinycolor.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/knockout/template/loader" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/knockout/template/loader.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/logger/logger" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/logger/logger.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/logger/entry-factory" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/logger/entry-factory.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/logger/console-output-handler" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/logger/console-output-handler.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/logger/formatter" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/logger/formatter.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/logger/message-pool" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/logger/message-pool.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/logger/levels-pool" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/logger/levels-pool.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/logger/logger-utils" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/logger/logger-utils.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="moment" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/moment.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/utils/template" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/utils/template.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/view/utils/dom-observer" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/view/utils/dom-observer.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/view/utils/bindings" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/view/utils/bindings.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/utils/objects" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/utils/objects.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/utils/strings" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/utils/strings.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/utils/arrays" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/utils/arrays.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/utils/compare" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/utils/compare.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/utils/misc" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/utils/misc.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="FormData" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/FormData.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/logger/entry" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/logger/entry.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/calendar" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/calendar.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Plumrocket_CookieConsent/js/model/body-scripts" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Plumrocket_CookieConsent/js/model/body-scripts.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/datepicker" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/datepicker.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/timepicker" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/timepicker.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/validation/validation" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/validation/validation.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Customer/js/customer-data" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Customer/js/customer-data.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Persistent/js/view/customer-data-mixin" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Persistent/js/view/customer-data-mixin.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/slider" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/slider.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/validation" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/validation.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/loader" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/loader.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_PageCache/js/page-cache" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_PageCache/js/page-cache.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Wishlist/js/add-to-wishlist" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Wishlist/js/add-to-wishlist.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Cookie/js/require-cookie" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Cookie/js/require-cookie.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/tabs" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/tabs.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/menu" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/menu.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Customer/js/section-config" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Customer/js/section-config.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/url" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/url.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/storage" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/storage.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery/jquery-storageapi" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Cookie/js/jquery.storageapi.extended.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/core/app" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/core/app.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="socialPopupForm" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Mageplaza_SocialLogin/js/popup.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/product/list/toolbar" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/product/list/toolbar.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/product/list/anchor-scroll-item" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/product/list/anchor-scroll-item.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Levinci_Catalog/js/popup-product-view" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Levinci_Catalog/js/popup-product-view.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/dropdown" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/dropdown.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Theme/js/cookie-status" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Theme/js/cookie-status.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery/validate" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/jquery.validate.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/block-loader" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/block-loader.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Customer/js/invalidation-processor" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Customer/js/invalidation-processor.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Checkout/js/show-minicart" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Checkout/js/show-minicart.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Amasty_FacebookPixel/js/amfb-init" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Amasty_FacebookPixel/js/amfb-init.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Plumrocket_CookieConsent/js/youtube" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Plumrocket_CookieConsent/js/youtube.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/modal/alert" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/modal/alert.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/collapsible" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/collapsible.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/menu" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/menu.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery/jquery.storageapi.min" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/jquery.storageapi.min.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Mageplaza_Core/js/jquery.magnific-popup.min" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Mageplaza_Core/js/jquery.magnific-popup.min.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/product/view/product-ids-resolver" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/product/view/product-ids-resolver.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/catalog-add-to-cart" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/catalog-add-to-cart.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_ConfigurableProduct/js/catalog-add-to-cart-mixin" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_ConfigurableProduct/js/catalog-add-to-cart-mixin.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery/jquery.metadata" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/jquery.metadata.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/core/element/element" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/core/element/element.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Amasty_FacebookPixel/js/action/amfb-actions" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Amasty_FacebookPixel/js/action/amfb-actions.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Amasty_FacebookPixel/js/model/amfb-model" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Amasty_FacebookPixel/js/model/amfb-model.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/product/view/product-ids" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/product/view/product-ids.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_ConfigurableProduct/js/product/view/product-info-resolver" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_ConfigurableProduct/js/product/view/product-info-resolver.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="matchMedia" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/matchMedia.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/core/renderer/types" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/core/renderer/types.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/core/renderer/layout" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/core/renderer/layout.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/product/view/product-info" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/product/view/product-info.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/core/element/links" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/core/element/links.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Customer/js/view/authentication-popup" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Customer/js/view/authentication-popup.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Captcha/js/view/checkout/loginCaptcha" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Captcha/js/view/checkout/loginCaptcha.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Mageplaza_SocialLogin/js/view/social-buttons" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Mageplaza_SocialLogin/js/view/social-buttons.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magenest_StorePickup/js/delivery-switcher" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magenest_StorePickup/js/delivery-switcher.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Checkout/js/view/minicart" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Checkout/js/view/minicart.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/core/collection" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/core/collection.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/form/form" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/form/form.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Customer/js/action/login" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Customer/js/action/login.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Customer/js/model/authentication-popup" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Customer/js/model/authentication-popup.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Tax/js/view/checkout/minicart/subtotal/totals" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Tax/js/view/checkout/minicart/subtotal/totals.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Msrp/js/view/checkout/minicart/subtotal/totals" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Msrp/js/view/checkout/minicart/subtotal/totals.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/view/image" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/view/image.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Captcha/js/view/checkout/defaultCaptcha" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Captcha/js/view/checkout/defaultCaptcha.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Captcha/js/model/captchaList" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Captcha/js/model/captchaList.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Amasty_InvisibleCaptcha/js/view/am-recaptcha" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Amasty_InvisibleCaptcha/js/view/am-recaptcha.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="socialProvider" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Mageplaza_SocialLogin/js/provider.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="https://maps.googleapis.com/maps/api/js?key=REMOVED_GOOGLE_API_KEY&amp;v=3.exp&amp;libraries=places&amp;language=vi" src="https://maps.googleapis.com/maps/api/js?key=REMOVED_GOOGLE_API_KEY&amp;v=3.exp&amp;libraries=places&amp;language=vi"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Plumrocket_CookieConsent/js/view/notice" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Plumrocket_CookieConsent/js/view/notice.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Plumrocket_CookieConsent/js/view/settings" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Plumrocket_CookieConsent/js/view/settings.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/lib/spinner" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/lib/spinner.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/requirejs/resolver" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/requirejs/resolver.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/model/messageList" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/model/messageList.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Levinci_ProductAreaPrice/js/section/product-area-price" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Levinci_ProductAreaPrice/js/section/product-area-price.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Levinci_Customer/js/view/notification" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Levinci_Customer/js/view/notification.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/storage-manager" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/storage-manager.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Captcha/js/model/captcha" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Captcha/js/model/captcha.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Amasty_InvisibleCaptcha/js/view/am-recaptcha-abstract" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Amasty_InvisibleCaptcha/js/view/am-recaptcha-abstract.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Customer/js/invalidation-rules/website-rule" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Customer/js/invalidation-rules/website-rule.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/view/messages" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/view/messages.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_ReCaptchaFrontendUi/js/ui-messages-mixin" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_ReCaptchaFrontendUi/js/ui-messages-mixin.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Levinci_ProductAreaPrice/js/model/area-price-processor" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Levinci_ProductAreaPrice/js/model/area-price-processor.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/product/storage/storage-service" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/product/storage/storage-service.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Captcha/js/action/refresh" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Captcha/js/action/refresh.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Amasty_InvisibleCaptcha/js/action/am-recaptcha-loader" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Amasty_InvisibleCaptcha/js/action/am-recaptcha-loader.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Checkout/js/sidebar" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Checkout/js/sidebar.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Levinci_AjaxCart/js/sidebar-mixins" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Levinci_AjaxCart/js/sidebar-mixins.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/form/adapter" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/form/adapter.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Theme/js/view/messages" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Theme/js/view/messages.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Amasty_Promo/js/view/messages" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Amasty_Promo/js/view/messages.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/effect-blind" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/effect-blind.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_ReCaptchaFrontendUi/js/registry" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_ReCaptchaFrontendUi/js/registry.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/price-utils" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/price-utils.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/product/storage/ids-storage" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/product/storage/ids-storage.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/product/storage/data-storage" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/product/storage/data-storage.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/product/storage/ids-storage-compare" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/product/storage/ids-storage-compare.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="mage/decorate" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/mage/decorate.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/effect-fade" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/effect-fade.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/form/adapter/buttons" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/form/adapter/buttons.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Security/js/escaper" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Security/js/escaper.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery-ui-modules/effect" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/jquery/ui-modules/effect.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Catalog/js/product/query-builder" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Catalog/js/product/query-builder.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="Magento_Ui/js/model/messages" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Ui/js/model/messages.js"></script><script type="text/javascript" async="" src="https://googleads.g.doubleclick.net/pagead/viewthroughconversion/832316445/?random=1775648070944&amp;cv=11&amp;fst=1775648070944&amp;bg=ffffff&amp;guid=ON&amp;async=1&amp;en=gtag.config&amp;gtm=45be6461v881430724z8892787717za20gzb892787717zd892787717xec&amp;gcd=13l3l3l3l1l1&amp;dma=0&amp;tag_exp=0~115616985~115938465~115938468~116991816~117884344~118131809&amp;u_w=1920&amp;u_h=1080&amp;url=https%3A%2F%2Fjollibee.com.vn%2Fga-gion-vui-ve.html&amp;ref=https%3A%2F%2Fjollibee.com.vn%2F&amp;frm=0&amp;tiba=G%C3%A0%20gi%C3%B2n%20vui%20v%E1%BA%BB&amp;hn=www.googleadservices.com&amp;npa=0&amp;pscdl=noapi&amp;auid=585682649.1775462177&amp;uaa=x86&amp;uab=64&amp;uafvl=Chromium%3B146.0.7680.178%7CNot-A.Brand%3B24.0.0.0%7CGoogle%2520Chrome%3B146.0.7680.178&amp;uamb=0&amp;uam=&amp;uap=Windows&amp;uapv=10.0.0&amp;uaw=0&amp;data=event%3Dgtag.config&amp;gap.plf=1&amp;rfmt=3&amp;fmt=4"></script><script type="text/javascript" async="" src="https://googleads.g.doubleclick.net/pagead/viewthroughconversion/16478199752/?random=1775648071023&amp;cv=11&amp;fst=1775648071023&amp;bg=ffffff&amp;guid=ON&amp;async=1&amp;en=gtag.config&amp;gtm=45be6461v9180455172z8892787717za20gzb892787717zd892787717xec&amp;gcd=13l3l3l3l1l1&amp;dma=0&amp;tag_exp=0~115938465~115938469~116991817&amp;u_w=1920&amp;u_h=1080&amp;url=https%3A%2F%2Fjollibee.com.vn%2Fga-gion-vui-ve.html&amp;ref=https%3A%2F%2Fjollibee.com.vn%2F&amp;frm=0&amp;tiba=G%C3%A0%20gi%C3%B2n%20vui%20v%E1%BA%BB&amp;hn=www.googleadservices.com&amp;npa=0&amp;pscdl=noapi&amp;auid=585682649.1775462177&amp;uaa=x86&amp;uab=64&amp;uafvl=Chromium%3B146.0.7680.178%7CNot-A.Brand%3B24.0.0.0%7CGoogle%2520Chrome%3B146.0.7680.178&amp;uamb=0&amp;uam=&amp;uap=Windows&amp;uapv=10.0.0&amp;uaw=0&amp;data=event%3Dgtag.config&amp;rfmt=3&amp;fmt=4"></script><script type="text/javascript" charset="UTF-8" src="https://maps.googleapis.com/maps-api-v3/api/js/64/7d/intl/vi_ALL/common.js"></script><script type="text/javascript" charset="UTF-8" src="https://maps.googleapis.com/maps-api-v3/api/js/64/7d/intl/vi_ALL/util.js"></script><script type="text/javascript" charset="UTF-8" src="https://maps.googleapis.com/maps-api-v3/api/js/64/7d/intl/vi_ALL/geocoder.js"></script><style id="mn-pickup-style">.mn-pickup-mode .mn-store-phone{display:none!important}</style><script charset="utf-8" src="https://siteintercept.qualtrics.com/dxjsmodule/37.f07adfd0005923b508c9.chunk.js?Q_CLIENTVERSION=2.45.0&amp;Q_CLIENTTYPE=web&amp;Q_BRANDID=jollibee.com.vn"></script><script charset="utf-8" src="https://siteintercept.qualtrics.com/dxjsmodule/12.45e656039b3fa23613e1.chunk.js?Q_CLIENTVERSION=2.45.0&amp;Q_CLIENTTYPE=web&amp;Q_BRANDID=jollibee.com.vn"></script><script charset="utf-8" src="https://siteintercept.qualtrics.com/dxjsmodule/7.ef73897faa00f34d8366.chunk.js?Q_CLIENTVERSION=2.45.0&amp;Q_CLIENTTYPE=web&amp;Q_BRANDID=jfccx"></script><script charset="utf-8" src="https://siteintercept.qualtrics.com/dxjsmodule/1.1838854a301771fadd51.chunk.js?Q_CLIENTVERSION=2.45.0&amp;Q_CLIENTTYPE=web&amp;Q_BRANDID=jfccx"></script><script type="text/javascript" async="" src="https://googleads.g.doubleclick.net/pagead/viewthroughconversion/16478199752/?random=1775648078778&amp;cv=11&amp;fst=1775648078778&amp;bg=ffffff&amp;guid=ON&amp;async=1&amp;en=form_start&amp;gtm=45be6461v9180455172za20gzb892787717zd892787717xec&amp;gcd=13l3l3l3l1l1&amp;dma=0&amp;tag_exp=0~115938465~115938469~116991817&amp;u_w=1920&amp;u_h=1080&amp;url=https%3A%2F%2Fjollibee.com.vn%2Fga-gion-vui-ve.html&amp;ref=https%3A%2F%2Fjollibee.com.vn%2F&amp;frm=0&amp;tiba=G%C3%A0%20gi%C3%B2n%20vui%20v%E1%BA%BB&amp;ae=a&amp;hn=www.googleadservices.com&amp;npa=0&amp;pscdl=noapi&amp;auid=585682649.1775462177&amp;uaa=x86&amp;uab=64&amp;uafvl=Chromium%3B146.0.7680.178%7CNot-A.Brand%3B24.0.0.0%7CGoogle%2520Chrome%3B146.0.7680.178&amp;uamb=0&amp;uam=&amp;uap=Windows&amp;uapv=10.0.0&amp;uaw=0&amp;data=event%3Dform_start&amp;rfmt=3&amp;fmt=4"></script><script type="text/javascript" async="" src="https://googleads.g.doubleclick.net/pagead/viewthroughconversion/16478199752/?random=1775648078791&amp;cv=11&amp;fst=1775648078791&amp;bg=ffffff&amp;guid=ON&amp;async=1&amp;en=form_start&amp;gtm=45be6461v9180455172za20gzb892787717zd892787717xec&amp;gcd=13l3l3l3l1l1&amp;dma=0&amp;tag_exp=0~115938465~115938469~116991817&amp;u_w=1920&amp;u_h=1080&amp;url=https%3A%2F%2Fjollibee.com.vn%2Fga-gion-vui-ve.html&amp;ref=https%3A%2F%2Fjollibee.com.vn%2F&amp;frm=0&amp;tiba=G%C3%A0%20gi%C3%B2n%20vui%20v%E1%BA%BB&amp;ae=a&amp;hn=www.googleadservices.com&amp;npa=0&amp;pscdl=noapi&amp;auid=585682649.1775462177&amp;uaa=x86&amp;uab=64&amp;uafvl=Chromium%3B146.0.7680.178%7CNot-A.Brand%3B24.0.0.0%7CGoogle%2520Chrome%3B146.0.7680.178&amp;uamb=0&amp;uam=&amp;uap=Windows&amp;uapv=10.0.0&amp;uaw=0&amp;data=event%3Dform_start&amp;rfmt=3&amp;fmt=4"></script><script type="text/javascript" async="" src="https://googleads.g.doubleclick.net/pagead/viewthroughconversion/16478199752/?random=1775648078797&amp;cv=11&amp;fst=1775648078797&amp;bg=ffffff&amp;guid=ON&amp;async=1&amp;en=form_start&amp;gtm=45be6461v9180455172za20gzb892787717zd892787717xec&amp;gcd=13l3l3l3l1l1&amp;dma=0&amp;tag_exp=0~115938465~115938469~116991817&amp;u_w=1920&amp;u_h=1080&amp;url=https%3A%2F%2Fjollibee.com.vn%2Fga-gion-vui-ve.html&amp;ref=https%3A%2F%2Fjollibee.com.vn%2F&amp;frm=0&amp;tiba=G%C3%A0%20gi%C3%B2n%20vui%20v%E1%BA%BB&amp;ae=a&amp;hn=www.googleadservices.com&amp;npa=0&amp;pscdl=noapi&amp;auid=585682649.1775462177&amp;uaa=x86&amp;uab=64&amp;uafvl=Chromium%3B146.0.7680.178%7CNot-A.Brand%3B24.0.0.0%7CGoogle%2520Chrome%3B146.0.7680.178&amp;uamb=0&amp;uam=&amp;uap=Windows&amp;uapv=10.0.0&amp;uaw=0&amp;data=event%3Dform_start&amp;rfmt=3&amp;fmt=4"></script><script type="text/javascript" async="" src="https://googleads.g.doubleclick.net/pagead/viewthroughconversion/16478199752/?random=1775648078802&amp;cv=11&amp;fst=1775648078802&amp;bg=ffffff&amp;guid=ON&amp;async=1&amp;en=form_start&amp;gtm=45be6461v9180455172za20gzb892787717zd892787717xec&amp;gcd=13l3l3l3l1l1&amp;dma=0&amp;tag_exp=0~115938465~115938469~116991817&amp;u_w=1920&amp;u_h=1080&amp;url=https%3A%2F%2Fjollibee.com.vn%2Fga-gion-vui-ve.html&amp;ref=https%3A%2F%2Fjollibee.com.vn%2F&amp;frm=0&amp;tiba=G%C3%A0%20gi%C3%B2n%20vui%20v%E1%BA%BB&amp;ae=a&amp;hn=www.googleadservices.com&amp;npa=0&amp;pscdl=noapi&amp;auid=585682649.1775462177&amp;uaa=x86&amp;uab=64&amp;uafvl=Chromium%3B146.0.7680.178%7CNot-A.Brand%3B24.0.0.0%7CGoogle%2520Chrome%3B146.0.7680.178&amp;uamb=0&amp;uam=&amp;uap=Windows&amp;uapv=10.0.0&amp;uaw=0&amp;data=event%3Dform_start&amp;rfmt=3&amp;fmt=4"></script></head>
    <body data-container="body" class="pl-thm-jollibee pl-thm-jollibee-default page-products categorypath-ga-gion-vui-ve category-ga-gion-vui-ve catalog-category-view page-layout-1column" style="--headerHeight: 118px;" aria-busy="false">
        

<script>
var prCookieConsentApi = {
    CUSTOMER_CONSENT: 'pr-cookie-consent',
    SYSTEM_COOKIES: [
        'PHPSESSID',
        this.CUSTOMER_CONSENT,
        'user_allowed_save_cookie',
    ],
    config: {},
    whitelist: {},
    isConfigured: false,
    /**
     * Contains callbacks that run after all configuration come
     *
     * @type {function[]}
     */
    configuredCallbacks: [],
    initCookieBlocking: function () {
        var cookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
            || Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');
        if (cookieDesc && cookieDesc.configurable) {
            var api = this;
            Object.defineProperty(document, 'cookie', {
                get: function () {
                    return cookieDesc.get.call(document);
                },
                set: function (cookie) {
                    let cookieName = cookie.substring(0, cookie.indexOf('=')).trim();
                    document.dispatchEvent(new CustomEvent('pr-cookie-consent-api:cookie-blocking:validation', {
                        detail: {cookieName: cookieName, isAllowed: api.isAllowed(cookieName), cookie: cookie}
                    }));

                    if (! api.isAllowed(cookieName)) {
                        api.logger.warn('CookieConsent: blocked cookie "' + cookieName + '"');
                        return;
                    }
                    cookieDesc.set.call(document, cookie);
                }
            });
        }
    },
    getCookieValue: function (name) {
        var values = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return values ? decodeURIComponent(values.pop()) : '';
    },
    configure: function (configJson) {
        this.logger.init();
        this.userScript.init();
        try {
            this.config = JSON.parse(configJson);
            if (this.config.canManageCookie === null) {
                console.error('CookieConsent: restriction config is invalid');
            }
            this.isConfigured = true;

            this.configuredCallbacks.forEach(function (callback) {
                callback();
            }.bind(this));

            this.clearRejectedCookie();
        } catch (e) {
            console.error('CookieConsent: error has happened during parse JSON');
            return false;
        }

        document.dispatchEvent(new Event('pr-cookie-consent-api:configured'));
    },
    /**
     * @param {function} callback
     * @returns {prCookieConsentApi}
     */
    addConfiguredCallback: function (callback) {
        this.configuredCallbacks.push(callback);
        return this;
    },
        isAllowedCategory: function (categoryKey) {
        if (! this.config.canManageCookie) {
            return true;
        }
        if (this.isEssentialCategory(categoryKey)) {
            return true;
        }
        if (this.isOptIn()) {
            if (this.isAllCategoriesAllowed()) {
                return true;
            }
            return this.consent.get().includes(categoryKey);
        }
        return this.config.canUseCookieBeforeOptIn;
    },
    getDomain: function (cookieName) {
        return this.config.cookies[cookieName] ? this.config.cookies[cookieName].domain : null;
    },
        isAllowed: function (cookieName) {
        if (this.isSystemCookie(cookieName)) {
            return true;
        }
        if (! this.config.canManageCookie) {
            return true;
        }
        if (this.whitelist[cookieName]) {
            return true;
        }
        cookieName = this.getTrueCookieName(cookieName);
        if (! this.isOptIn()) {
            if (this.config.canUseCookieBeforeOptIn) {
                return true;
            }
            if (this.isKnownCookie(cookieName)) {
                return this.isInEssentialCategory(cookieName);
            }
            return false;
        }
        if (! this.isKnownCookie(cookieName)) {
            return ! this.config.canBlockUnknownCookie;
        }
        return this.isInAllowedCategory(cookieName);
    },
    isAllCategoriesAllowed: function () {
        if (null === this.cache.get('allowAllCategories')) {
            var customerConsent = this.consent.get();
            if (customerConsent && customerConsent.includes('all') ) {
                this.cache.set('allowAllCategories', true);
            } else {
                var allowedWebsites = this.websiteRestriction.getAllowed();
                this.cache.set('allowAllCategories', allowedWebsites[this.config.mage.website] === 1);
            }
        }
        return this.cache.get('allowAllCategories');
    },
    isEssentialCategory: function (categoryKey) {
        return this.config.essentialCategoryKeys.includes(categoryKey);
    },
    isInEssentialCategory: function (cookieName) {
        return this.isEssentialCategory(this.getCookieCategory(cookieName));
    },
    isInAllowedCategory: function (cookieName) {
        return this.isAllowedCategory(this.getCookieCategory(cookieName));
    },
    getCookieCategory: function (cookieName) {
        return this.config.cookieToCategoryMapping[cookieName];
    },
    isOptIn: function () {
        var allowedWithDefaultCookie = this.websiteRestriction.getAllowed()[this.config.mage.website] === 1;
        return Boolean(this.consent.get()) || allowedWithDefaultCookie;
    },
    isSystemCookie: function (cookieName) {
        return this.SYSTEM_COOKIES.includes(cookieName);
    },
    isKnownCookie: function (cookieName) {
        return this.config.cookieToCategoryMapping.hasOwnProperty(cookieName);
    },
    getTrueCookieName: function (cookieName) {
        var keys = Object.keys(this.config.dynamicNamesPatterns), key;
        for (var i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            if (new RegExp(this.config.dynamicNamesPatterns[key]).test(cookieName)) {
                return key;
            }
        }
        return cookieName;
    },
    clearRejectedCookie: function () {
        let cookies = prCookieService.get();
        Object.keys(cookies).forEach(function(cookieName) {
            if (this.isAllowed(cookieName)) {
                return;
            }

            var encodedCookieName = cookieName = encodeURIComponent(String(cookieName))
                .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
                .replace(/[\(\)]/g, escape);

            this.whitelist[encodedCookieName] = true;
            if (this.getDomain(cookieName)) {
                prCookieService.remove(cookieName, {domain: this.getDomain(cookieName)});
            } else {
                prCookieService.remove(cookieName);
                if (this.config.cookie.parentDomain) {
                    prCookieService.remove(cookieName, {domain: this.config.cookie.parentDomain});
                }
            }
            this.logger.warn('CookieConsent: remove cookie "' + cookieName + '"');
            if (typeof prCookieService.get(cookieName) !== 'undefined') {
                this.logger.error('CookieConsent: fail to remove cookie "' + cookieName + '"');
            }
            this.whitelist[encodedCookieName] = false;
        }.bind(this));
    }
};

prCookieConsentApi.userScript = {
    /**
     * List of callbacks and categories they depend on.
     */
    pendingScripts: [],
    /**
     * Run script after model is configured or after user provided consent.
     */
    init: function () {
        prCookieConsentApi.addConfiguredCallback(this.executePendingScripts.bind(this));
        prCookieConsentApi.consent.addCallback(this.executePendingScripts.bind(this));
    },
    /**
     * Run or delay script.
     *
     * @param {function} callback
     * @param {string}   categoryKey
     */
    execute: function (callback, categoryKey) {
        if (prCookieConsentApi.isConfigured && prCookieConsentApi.isAllowedCategory(categoryKey)) {
            callback();
            return;
        }

        this.pendingScripts.push({callback: callback, categoryKey: categoryKey, executed: false});
    },
    /**
     * Run pending scripts.
     */
    executePendingScripts: function () {
        this.pendingScripts.forEach(function (script) {
            if (false === script.executed && prCookieConsentApi.isAllowedCategory(script.categoryKey)) {
                script.callback();
                script.executed = true;
            }
        }.bind(this));
    },
};

prCookieConsentApi.websiteRestriction = {
    getAllowed: function () {
        var allowedWebsites = prCookieConsentApi.getCookieValue(prCookieConsentApi.config.mage.cookieName);
        return allowedWebsites ? JSON.parse(allowedWebsites) : {};
    },
    allowCurrent: function () {
        return this.set(prCookieConsentApi.config.mage.website, true);
    },
    disallowCurrent: function () {
        return this.set(prCookieConsentApi.config.mage.website, false);
    },
    /**
     * @param {number} website
     * @param {boolean} flag
     * @return {CookieRestriction.websiteRestriction}
     */
    set: function (website, flag) {
        var allowedWebsites = this.getAllowed();

        if (flag) {
            allowedWebsites[website] = 1;
        } else {
            delete allowedWebsites[website];
        }

        prCookieService.set(prCookieConsentApi.config.mage.cookieName, allowedWebsites, {
            path: prCookieConsentApi.config.cookie.path,
            expires: prCookieConsentApi.config.mage.lifetime ? Math.ceil(prCookieConsentApi.config.mage.lifetime / 86400) : 0
        });

        return this;
    }
};

prCookieConsentApi.cache = {
    cacheData: {allowAllCategories: null},
    get: function (key) {
        return this.cacheData[key];
    },
    set: function (key, value) {
        this.cacheData[key] = value;
    },
    reset: function () {
        this.cacheData = {allowAllCategories: null};
    }
};

prCookieConsentApi.logger = {
    level: 0, /* disabled */
        init: function () {
        if (window.location.hash === '#pr-enable-cookie-log') {
            this.level = 1; /* only warnings and errors */
        }
        if (window.location.hash === '#pr-enable-cookie-log-all') {
            this.level = 2; /* all logs */
        }
    },
    log: function () {
        this.level > 1 && console.log.apply(console, arguments);
    },
    warn: function () {
        this.level > 0 && console.warn.apply(console, arguments);
    },
    error: function () {
        this.level > 0 && console.error.apply(console, arguments);
    }
};

prCookieConsentApi.consent = {
    /**
     * Contains callbacks that run after user consent.
     *
     * @type {function[]}
     */
    callbacks: [],
    allowAllCategories: function () {
        prCookieConsentApi.cache.reset();
        prCookieConsentApi.consent.set(['all']);
        return this;
    },
    declineAll: function () {
        prCookieConsentApi.cache.reset();
        prCookieConsentApi.consent.set([]);
        return this;
    },
    set: function (allowedCategories) {
        prCookieService.set(prCookieConsentApi.CUSTOMER_CONSENT, JSON.stringify(allowedCategories), {
            expires: prCookieConsentApi.config.consent.expiry,
            path: prCookieConsentApi.config.cookie.path,
            domain: prCookieConsentApi.config.cookie.domain
        });

        if (allowedCategories.includes('all')) {
            prCookieConsentApi.websiteRestriction.allowCurrent();
        } else {
            prCookieConsentApi.websiteRestriction.disallowCurrent();
        }
        prCookieConsentApi.cache.reset();

        var isAccepting = allowedCategories.length;

        this.callbacks.forEach(function (callback) {
            callback(allowedCategories)
        });

        fetch(prCookieConsentApi.config.consent.logUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({acceptedKeys: allowedCategories})
        })
            .then(this.pageReloadAfterAction.bind(this, isAccepting));
    },
    /**
     * Reload page by configuration and action
     *
     * @param isAccepting
     */
    pageReloadAfterAction: function (isAccepting) {
        if (isAccepting && prCookieConsentApi.config.consent.reloadAfterAccept) {
            window.location.reload();
        }

        if (! isAccepting && prCookieConsentApi.config.consent.reloadAfterDecline) {
            window.location.reload();
        }
    },
    get: function () {
        var consent = prCookieConsentApi.getCookieValue(prCookieConsentApi.CUSTOMER_CONSENT);
        return consent ? JSON.parse(consent) : false;
    },
    addCallback: function (callback) {
        this.callbacks.push(callback);
        return this;
    },
};

prCookieConsentApi.configure('\u007B\u0022canManageCookie\u0022\u003Atrue,\u0022canUseCookieBeforeOptIn\u0022\u003Atrue,\u0022canBlockUnknownCookie\u0022\u003Afalse,\u0022consent\u0022\u003A\u007B\u0022isLoggedIn\u0022\u003Afalse,\u0022logUrl\u0022\u003A\u0022https\u003A\u005C\u002F\u005C\u002Fjollibee.com.vn\u005C\u002Fpr\u002Dcookie\u002Dconsent\u005C\u002Fconsent_guest\u005C\u002Fupdate\u005C\u002F\u0022,\u0022reloadAfterAccept\u0022\u003Atrue,\u0022reloadAfterDecline\u0022\u003Atrue,\u0022expiry\u0022\u003A365\u007D,\u0022cookie\u0022\u003A\u007B\u0022path\u0022\u003A\u0022\u005C\u002F\u0022,\u0022domain\u0022\u003A\u0022jollibee.com.vn\u0022,\u0022parentDomain\u0022\u003A\u0022.com.vn\u0022\u007D,\u0022cookies\u0022\u003A\u007B\u0022pr\u002Dcookie\u002Dnotice\u002Dstatus\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022user_allowed_save_cookie\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022guest\u002Dview\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022login_redirect\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022mage\u002Dmessages\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022section_data_ids\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022store\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022amz_auth_err\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022amz_auth_logout\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022mage\u002Dcache\u002Dsessid\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022mage\u002Dcache\u002Dstorage\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022stf\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022recently_viewed_product\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022recently_viewed_product_previous\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022mage\u002Dtranslation\u002Dstorage\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022mage\u002Dtranslation\u002Dfile\u002Dversion\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022product_data_storage\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022recently_compared_product\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022recently_compared_product_previous\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022mage\u002Dcache\u002Dstorage\u002Dsection\u002Dinvalidation\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022_ga\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022_ga_\u002A\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022_gid\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022_gat\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022_dc_gtm_\u002A\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022mg_dnt\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022pr\u002Dcookie\u002Dconsent\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022pr\u002Dcookie\u002Dconsent\u002Did\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022form_key\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022X\u002DMagento\u002DVary\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022private_content_version\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022persistent_shopping_cart\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022add_to_cart\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022mage\u002Dbanners\u002Dcache\u002Dstorage\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D,\u0022remove_from_cart\u0022\u003A\u007B\u0022domain\u0022\u003A\u0022\u0022\u007D\u007D,\u0022mage\u0022\u003A\u007B\u0022website\u0022\u003A1,\u0022cookieName\u0022\u003A\u0022user_allowed_save_cookie\u0022,\u0022lifetime\u0022\u003A31536000\u007D,\u0022cookieToCategoryMapping\u0022\u003A\u007B\u0022pr\u002Dcookie\u002Dnotice\u002Dstatus\u0022\u003A\u0022necessary\u0022,\u0022user_allowed_save_cookie\u0022\u003A\u0022necessary\u0022,\u0022guest\u002Dview\u0022\u003A\u0022necessary\u0022,\u0022login_redirect\u0022\u003A\u0022necessary\u0022,\u0022mage\u002Dmessages\u0022\u003A\u0022necessary\u0022,\u0022section_data_ids\u0022\u003A\u0022necessary\u0022,\u0022store\u0022\u003A\u0022necessary\u0022,\u0022amz_auth_err\u0022\u003A\u0022necessary\u0022,\u0022amz_auth_logout\u0022\u003A\u0022necessary\u0022,\u0022mage\u002Dcache\u002Dsessid\u0022\u003A\u0022necessary\u0022,\u0022mage\u002Dcache\u002Dstorage\u0022\u003A\u0022necessary\u0022,\u0022stf\u0022\u003A\u0022necessary\u0022,\u0022recently_viewed_product\u0022\u003A\u0022necessary\u0022,\u0022recently_viewed_product_previous\u0022\u003A\u0022necessary\u0022,\u0022mage\u002Dtranslation\u002Dstorage\u0022\u003A\u0022necessary\u0022,\u0022mage\u002Dtranslation\u002Dfile\u002Dversion\u0022\u003A\u0022necessary\u0022,\u0022product_data_storage\u0022\u003A\u0022necessary\u0022,\u0022recently_compared_product\u0022\u003A\u0022necessary\u0022,\u0022recently_compared_product_previous\u0022\u003A\u0022necessary\u0022,\u0022mage\u002Dcache\u002Dstorage\u002Dsection\u002Dinvalidation\u0022\u003A\u0022necessary\u0022,\u0022_ga\u0022\u003A\u0022statistics\u0022,\u0022_ga_\u002A\u0022\u003A\u0022statistics\u0022,\u0022_gid\u0022\u003A\u0022statistics\u0022,\u0022_gat\u0022\u003A\u0022statistics\u0022,\u0022_dc_gtm_\u002A\u0022\u003A\u0022statistics\u0022,\u0022mg_dnt\u0022\u003A\u0022necessary\u0022,\u0022pr\u002Dcookie\u002Dconsent\u0022\u003A\u0022necessary\u0022,\u0022pr\u002Dcookie\u002Dconsent\u002Did\u0022\u003A\u0022necessary\u0022,\u0022form_key\u0022\u003A\u0022necessary\u0022,\u0022X\u002DMagento\u002DVary\u0022\u003A\u0022necessary\u0022,\u0022private_content_version\u0022\u003A\u0022necessary\u0022,\u0022persistent_shopping_cart\u0022\u003A\u0022necessary\u0022,\u0022add_to_cart\u0022\u003A\u0022statistics\u0022,\u0022mage\u002Dbanners\u002Dcache\u002Dstorage\u0022\u003A\u0022necessary\u0022,\u0022remove_from_cart\u0022\u003A\u0022statistics\u0022\u007D,\u0022essentialCategoryKeys\u0022\u003A\u005B\u0022necessary\u0022\u005D,\u0022dynamicNamesPatterns\u0022\u003A\u007B\u0022_dc_gtm_\u002A\u0022\u003A\u0022_dc_gtm_.\u002A\u0022,\u0022_ga_\u002A\u0022\u003A\u0022_ga_.\u002A\u0022\u007D\u007D');
prCookieConsentApi.initCookieBlocking();

if (typeof define === 'function') {
    define('prCookieService', function () {return prCookieService});
    define('prCookieConsentApi', function () {return prCookieConsentApi;});
}
</script>





    
            
        <script>
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
                t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
        </script>

                    <script>fbq('init', 462739624943585);</script>
                <!-- Facebook Pixel Code -->
        <noscript>
            <img height="1" width="1" style="display:none" alt="Facebook Pixel"
                 src="https://www.facebook.com/tr?id=462739624943585&ev=PageView&noscript=1"
            />
        </noscript>
        <!-- End Facebook Pixel Code -->
                            <script> fbq('track', 'PageView'); </script>
            

<div id="cookie-status" style="display: none;">
    The store will not work correctly in the case when cookies are disabled.</div>
<script type="text/javascript">document.querySelector("#cookie-status").style.display = "none";</script>



    <noscript>
        <div class="message global noscript">
            <div class="content">
                <p>
                    <strong>JavaScript seems to be disabled in your browser.</strong>
                    <span>
                        For the best experience on our site, be sure to turn on Javascript in your browser.                    </span>
                </p>
            </div>
        </div>
    </noscript>
<script>true</script><script>    require.config({
        map: {
            '*': {
                wysiwygAdapter: 'mage/adminhtml/wysiwyg/tiny_mce/tinymce4Adapter'
            }
        }
    });</script>
    <script>
        require([
            'Amasty_InvisibleCaptcha/js/model/am-recaptcha',
    ], function (amRecaptchaModel) {
            amRecaptchaModel.setConfig({
                "formsToProtect": "form\u005Baction\u002A\u003D\u0022special_order\u002Faction\u002Fsubmit\u0022\u005D,form\u005Baction\u002A\u003D\u0022contact\u002Findex\u002Fpost\u0022\u005D,form\u005Baction\u002A\u003D\u0022customer\u002Faccount\u002Fresetpasswordpost\u0022\u005D,form\u005Baction\u002A\u003D\u0022checkout_payment_captcha\u0022\u005D",
                "isEnabledOnPayments": "1",
                "checkoutRecaptchaValidateUrl": "https://jollibee.com.vn/amcapthca/checkout/validate/",
                "invisibleCaptchaCustomForm": "-1",
                "recaptchaConfig": {
                    "lang": "hl\u003Den",
                    "theme": "light",
                    "badge": "bottomright",
                    "sitekey": "6LcrsXUrAAAAADk7fL4Xq-wjr6E_gtH6osNtw8ui",
                    "size": "invisible"
                }
            })
    });
    </script>
    <script>
        // Fix to prevent 'no reCaptcha Token' error while slow site loading.
        // Submit button should catch am-captcha.js initialization8 first
        (function () {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', onReadyState);
            } else {
                onReadyState();
            }

            function onReadyState () {
                let formsToProtect = "form\u005Baction\u002A\u003D\u0022special_order\u002Faction\u002Fsubmit\u0022\u005D,form\u005Baction\u002A\u003D\u0022contact\u002Findex\u002Fpost\u0022\u005D,form\u005Baction\u002A\u003D\u0022customer\u002Faccount\u002Fresetpasswordpost\u0022\u005D,form\u005Baction\u002A\u003D\u0022checkout_payment_captcha\u0022\u005D";
                let forms = formsToProtect.split(',');
                let formsOnPage = [];

                forms.forEach(form => {
                    let existingForm = document.querySelectorAll(form);

                    if (existingForm.length) {
                        formsOnPage.push(existingForm);
                    }
                })

                formsOnPage.forEach(form => {
                    let submit = form[0].querySelector('[type="submit"]');
                    if (submit) {
                        let isAlreadyDisabled = submit.getAttribute('disabled');

                        if (!isAlreadyDisabled) {
                            submit.setAttribute('disabled', true);
                            submit.setAttribute('am-captcha-protect', true);
                        }
                    }
                })
            }
        })();
    </script>


<div data-bind="scope: 'pr-cookie-notice'" class="pr-cookie-notice-wrapper">
    <!-- ko template: getTemplate() -->


<!-- /ko -->
</div>



<div data-bind="scope: 'pr-cookie-settings-bar'" class="pr-cookie-settings-bar-wrapper">
    <!-- ko template: getTemplate() -->


<!-- /ko -->
</div>


<script>
    window.websitePriceFormat = {"pattern":"%s \u20ab","precision":"0","requiredPrecision":"0","decimalSymbol":".","groupSymbol":",","groupLength":3,"integerRequired":true,"showMinus":"before_value","symbol":"\u20ab","minusSign":"- "};
</script>

<div class="page-wrapper"><header class="page-header"><div class="panel wrapper"><div class="panel header"><a class="action skip contentarea" href="#contentarea">
    <span>
        Skip to Content    </span>
</a>
        <div class="switcher language switcher-language" data-ui-id="language-switcher" id="switcher-language">
        <strong class="label switcher-label"><span>Language</span></strong>
        <div class="actions options switcher-options">
            <div class="switcher-current" id="switcher-language-trigger">
                <strong class="view-default">
                    <span>VN</span>
                </strong>
            </div>
            <div class="switcher-list">
                                                            <div class="view-en switcher-option">
                            <a href="https://jollibee.com.vn/stores/store/redirect/___store/en/___from_store/default/uenc/aHR0cHM6Ly9qb2xsaWJlZS5jb20udm4vZ2EtZ2lvbi12dWktdmUuaHRtbD9fX19zdG9yZT1lbg%2C%2C/">
                                EN                            </a>
                        </div>
                                                                                    </div>
        </div>
    </div>
<ul class="header links">
    <?php if(isset($_SESSION['MaKH'])): ?>
        <li><a href="#" style="color: #e31837; font-weight: bold; text-transform: uppercase;">👋 Chào, <?php echo $_SESSION['TenHienThi']; ?></a></li>
        <li><a href="../logout.php">Đăng xuất</a></li>
    <?php else: ?>
        <li><a href="register.php">Đăng ký</a></li>
        <li class="authorization-link" data-label="or">
            <a href="../login.php">Đăng nhập</a>
        </li>
    <?php endif; ?>
</ul></div></div><div class="header content"><div class="column column-left"><div class="toggle-header">
    <span data-action="toggle-nav" class="action nav-toggle"><span>Toggle Nav</span></span>
</div>
<div class="logo-header">
    <a class="logo" href="https://jollibee.com.vn/" title="Logo Jollibee" aria-label="store logo">
        <img src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/images/logo.png" title="Logo Jollibee" alt="Logo Jollibee" width="100" height="100">
    </a>
</div>
<script>
    require(['jquery'], function($) {
        $(document).mouseup(function(e) 
        {
            var container = $(".nav-sections-top-items");
            var button = $(".action.nav-toggle");
            // if the target of the click isn't the container nor a descendant of the container
            if (!container.is(e.target) && container.has(e.target).length === 0) 
            {
                if($("html").hasClass("nav-open")) {
                    $("html").removeClass("nav-before-open nav-open");
                }
            }
        });
    });
</script></div><div class="column column-mid">    <div class="sections nav-sections-top">
                <div class="section-items nav-sections-top-items" role="tablist">
                                            <div class="section-item-title nav-sections-top-item-title active" data-role="collapsible" role="tab" data-collapsible="true" aria-controls="store.menu.top" aria-selected="false" aria-expanded="true" tabindex="0">
                    <a class="nav-sections-top-item-switch" data-toggle="switch" href="#store.menu.top">
                        Menu                    </a>
                </div>
                <div class="section-item-content nav-sections-top-item-content" id="store.menu.top" data-role="content" role="tabpanel" aria-hidden="false">
                            <div class="switcher language switcher-language" data-ui-id="language-switcher" id="switcher-language-nav">
        <strong class="label switcher-label"><span>Language</span></strong>
        <div class="actions options switcher-options">
            <div class="switcher-current" id="switcher-language-trigger-nav">
                <strong class="view-default">
                    <span>VN</span>
                </strong>
            </div>
            <div class="switcher-list">
                                                            <div class="view-en switcher-option">
                            <a href="https://jollibee.com.vn/stores/store/redirect/___store/en/___from_store/default/uenc/aHR0cHM6Ly9qb2xsaWJlZS5jb20udm4vZ2EtZ2lvbi12dWktdmUuaHRtbD9fX19zdG9yZT1lbg%2C%2C/">
                                EN                            </a>
                        </div>
                                                                                    </div>
        </div>
    </div>
<ul id="menu" class="nav-menu ui-menu ui-widget ui-widget-content ui-corner-all" role="menu" tabindex="0" aria-activedescendant="ui-id-10">
    <li class="level0 level-top ui-menu-item home"><a href="index.php">Trang Chủ</a></li>
    <li class="level0 level-top ui-menu-item about"><a href="#">Về Jollibee</a></li>
    
    <li class="level0 level-top parent active ui-menu-item" data-item-nav="item-menu" role="presentation">
        <a href="mon-ngon-phai-thu.php" aria-haspopup="true" id="ui-id-2" class="ui-corner-all" tabindex="-1" role="menuitem">
            <span class="ui-menu-icon ui-icon ui-icon-carat-1-e"></span>Thực đơn
        </a> 
        <ul class="menu-list ui-menu ui-widget ui-widget-content ui-corner-all" role="menu" aria-expanded="false" style="display: none; top: 118px; left: 1214.41px;" aria-hidden="true">
            
            <li class="level0 nav-1 category-item active level-top ui-menu-item" role="presentation">
                <a href="mon-ngon-phai-thu.php" class="level-top ui-corner-all" id="ui-id-3" tabindex="-1" role="menuitem">
                    <img src="https://jollibee.com.vn//media/catalog/category/web-12_1_1.png" class="thumbnail" width="100px"><span>Món Ngon Phải Thử</span>
                </a>
            </li>
            
            <li class="level0 nav-2 category-item level-top ui-menu-item" role="presentation">
                <a href="ga-gion-vui-ve.php" class="level-top ui-corner-all" id="ui-id-4" tabindex="-1" role="menuitem">
                    <img src="https://jollibee.com.vn//media/catalog/category/web-05_1.png" class="thumbnail" width="100px"><span>Gà Giòn Vui Vẻ</span>
                </a>
            </li>
            
            <li class="level0 nav-3 category-item level-top ui-menu-item" role="presentation">
                <a href="my-y-jolly.php" class="level-top ui-corner-all" id="ui-id-5" tabindex="-1" role="menuitem">
                    <img src="https://jollibee.com.vn//media/catalog/category/web-06.png" class="thumbnail" width="100px"><span>Mì Ý Jolly</span>
                </a>
            </li>
            <li class="level0 nav-4 category-item level-top ui-menu-item" role="presentation">
                <a href="ga-sot-cay.php" class="level-top ui-corner-all" id="ui-id-6" tabindex="-1" role="menuitem">
                    <img src="https://jollibee.com.vn//media/catalog/category/web-07.png" class="thumbnail" width="100px"><span>Gà Sốt Cay</span>
                </a>
            </li>
            <li class="level0 nav-5 category-item level-top ui-menu-item" role="presentation">
                <a href="burger-com.php" class="level-top ui-corner-all" id="ui-id-7" tabindex="-1" role="menuitem">
                    <img src="https://jollibee.com.vn//media/catalog/category/cat_burger_1.png" class="thumbnail" width="100px"><span>Burger/Cơm</span>
                </a>
            </li>
            <li class="level0 nav-6 category-item level-top ui-menu-item" role="presentation">
                <a href="phan-an-phu.php" class="level-top ui-corner-all" id="ui-id-8" tabindex="-1" role="menuitem">
                    <img src="https://jollibee.com.vn//media/catalog/category/phananphu.png" class="thumbnail" width="100px"><span>Phần Ăn Phụ</span>
                </a>
            </li>
            <li class="level0 nav-7 category-item level-top ui-menu-item" role="presentation">
                <a href="mon-trang-mieng.php" class="level-top ui-corner-all" id="ui-id-9" tabindex="-1" role="menuitem">
                    <img src="https://jollibee.com.vn//media/catalog/category/trangmieng.png" class="thumbnail" width="100px"><span>Món Tráng Miệng</span>
                </a>
            </li>
            <li class="level0 nav-8 category-item last level-top ui-menu-item" role="presentation">
                <a href="thuc-uong.php" class="level-top ui-corner-all" id="ui-id-10" tabindex="-1" role="menuitem">
                    <img src="https://jollibee.com.vn//media/catalog/category/thucuong.png" class="thumbnail" width="100px"><span>Thức Uống</span>
                </a>
            </li> 
        </ul>
    </li>
    
    <li class="level0 level-top ui-menu-item item-promotion"><a href="#">Khuyến mãi</a></li>
    <li class="level0 level-top ui-menu-item service"><a href="#">Dịch Vụ</a></li>
    <li class="level0 level-top ui-menu-item news"><a href="#">Tin Tức</a></li>
    <li class="level0 level-top ui-menu-item store"><a href="#">Cửa hàng</a></li>
    <li class="level0 level-top ui-menu-item contact"><a href="#">Liên Hệ</a></li>
</ul>><script type="text/javascript">
    // <![CDATA[
    require([
        'jquery',
        'jquery.sticky',
        'domReady!'
    ], function ($) {

        ////////
        const slider = document.querySelector('#menu');
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        slider.addEventListener('mousemove', (e) => {
            if(!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 3; //scroll-fast
            slider.scrollLeft = scrollLeft - walk;
        });
    });
    // ]]>
</script>


</li>
<li class="level0 level-top ui-menu-item item-promotion"><a href="/khuyen-mai">Khuyến mãi</a></li>
<li class="level0 level-top ui-menu-item service"><a href="/dich-vu">Dịch Vụ</a></li>
<li class="level0 level-top ui-menu-item news"><a href="/tin-tuc">Tin Tức</a></li>
<li class="level0 level-top ui-menu-item store"><a href="/cua-hang">Cửa hàng</a></li>
<li class="level0 level-top ui-menu-item contact"><a href="/lien-he">Liên Hệ</a></li>
<li class="level0 level-top ui-menu-item career"><a href="https://jollibee.talent.vn/">Tuyển dụng</a></li>
</ul><ul class="header links"><li class="authorization-link" data-label="or">
    <a href="#social-login-popup" class="social-login-btn" data-effect="mfp-move-from-top">
        Đăng nhập    </a>
</li>
<li><a href="https://jollibee.com.vn/customer/account/create/" id="idWgG54NWI">Đăng ký</a></li></ul><div class="download-app">
<p style="text-align: center; font-family: 'MergeBlack', sans-serif; font-weight: 400;"><span style="color: #ffffff; display: block;">TẢI ỨNG DỤNG</span> <br><a href="https://apps.apple.com/vn/app/jollibee-vietnam/id1554984107"> <img src="https://jollibee.com.vn/media/jollibee/logo_appstore.png" alt="" width="120" height="36"> </a> <a href="https://play.google.com/store/apps/details?id=com.jollibee.loyalty"> <img src="https://jollibee.com.vn/media/jollibee/logo_playstore.png" alt="" width="120" height="36"> </a></p>
</div>                </div>
                    </div>
    </div>
</div><div class="column column-right">

<div class="header-notification-wrapper" data-bind="scope:'notification_component'">
    <!-- ko template: getTemplate() --><!-- ko if: notificationList().length > 0  --><!-- /ko -->
<!-- /ko -->
</div>



<script>
    require([
        'jquery'
    ], function ($) {
        let bellBtn = $('.notification-bell');
        let notificationWrapper = $('.notification-data-wrapper');

        bellBtn.on('click', function () {
            notificationWrapper.toggleClass('disappear');
        });
    });
</script>
<div class="notification-popup-wrapper" style="display: none">
    <button title="Close (Esc)" type="button" class="mfp-close js-otp-popup-close notification-close-popup">
        <span>×</span>
    </button>
    <div class="title"></div>
    <div class="content">
        <div class="text"></div>
        <div class="actions-toolbar">
            <div class="primary">
                <input type="hidden" name="hideit" id="hideit" value="">
                <button id="notification-close-btn" type="button" title="Xác nhận" class="action submit primary">
                    <span>Xác nhận</span>
                </button>
            </div>
        </div>
    </div>
</div>
</div></div></header>
<script src="https://jollibee.com.vn/media/location/province_20260408112445.js"></script>
<script src="https://jollibee.com.vn/media/location/district_20260408112445.js"></script>
    <div id="sticky-wrapper" class="sticky-wrapper" style="height: 114px;"><div class="sections nav-sections" style="width: 1359px;">
                <div class="section-items nav-sections-items" role="tablist">
                                            <div class="section-item-title nav-sections-item-title active" data-role="collapsible" role="tab" data-collapsible="true" aria-controls="store.menu" aria-selected="false" aria-expanded="true" tabindex="0">
                    <a class="nav-sections-item-switch" data-toggle="switch" href="#store.menu">
                        Menu                    </a>
                </div>
                <div class="section-item-content nav-sections-item-content" id="store.menu" data-role="content" role="tabpanel" aria-hidden="false">
                    
<nav class="navigation" data-action="navigation">
    <ul id="ui-id-11" class="ui-menu ui-widget ui-widget-content ui-corner-all" role="menu" tabindex="0" aria-activedescendant="ui-id-19">
        <li class="level0 nav-1 category-item first level-top ui-menu-item" role="presentation"><a href="https://jollibee.com.vn/mon-moi-mon-ngon.html" class="level-top ui-corner-all" id="ui-id-12" tabindex="-1" role="menuitem"><img src="https://jollibee.com.vn//media/catalog/category/web-12_1_1.png" class="thumbnail" width="100px"><span>Món Ngon Phải Thử</span></a></li><li class="level0 nav-2 category-item active level-top ui-menu-item" role="presentation"><a href="https://jollibee.com.vn/ga-gion-vui-ve.html" class="level-top ui-corner-all" id="ui-id-13" tabindex="-1" role="menuitem"><img src="https://jollibee.com.vn//media/catalog/category/web-05_1.png" class="thumbnail" width="100px"><span>Gà Giòn Vui Vẻ</span></a></li><li class="level0 nav-3 category-item level-top ui-menu-item" role="presentation"><a href="https://jollibee.com.vn/mi-y-sot-bo-bam.html" class="level-top ui-corner-all" id="ui-id-14" tabindex="-1" role="menuitem"><img src="https://jollibee.com.vn//media/catalog/category/web-06.png" class="thumbnail" width="100px"><span>Mì Ý Jolly</span></a></li><li class="level0 nav-4 category-item level-top ui-menu-item" role="presentation"><a href="https://jollibee.com.vn/ga-sot-cay.html" class="level-top ui-corner-all" id="ui-id-15" tabindex="-1" role="menuitem"><img src="https://jollibee.com.vn//media/catalog/category/web-07.png" class="thumbnail" width="100px"><span>Gà Sốt Cay</span></a></li><li class="level0 nav-5 category-item level-top ui-menu-item" role="presentation"><a href="https://jollibee.com.vn/burger-com.html" class="level-top ui-corner-all" id="ui-id-16" tabindex="-1" role="menuitem"><img src="https://jollibee.com.vn//media/catalog/category/cat_burger_1.png" class="thumbnail" width="100px"><span>Burger/Cơm</span></a></li><li class="level0 nav-6 category-item level-top ui-menu-item" role="presentation"><a href="https://jollibee.com.vn/phan-an-phu.html" class="level-top ui-corner-all" id="ui-id-17" tabindex="-1" role="menuitem"><img src="https://jollibee.com.vn//media/catalog/category/phananphu.png" class="thumbnail" width="100px"><span>Phần Ăn Phụ</span></a></li><li class="level0 nav-7 category-item level-top ui-menu-item" role="presentation"><a href="https://jollibee.com.vn/mon-trang-mieng.html" class="level-top ui-corner-all" id="ui-id-18" tabindex="-1" role="menuitem"><img src="https://jollibee.com.vn//media/catalog/category/trangmieng.png" class="thumbnail" width="100px"><span>Món Tráng Miệng</span></a></li><li class="level0 nav-8 category-item last level-top ui-menu-item" role="presentation"><a href="https://jollibee.com.vn/thuc-uong.html" class="level-top ui-corner-all" id="ui-id-19" tabindex="-1" role="menuitem"><img src="https://jollibee.com.vn//media/catalog/category/thucuong.png" class="thumbnail" width="100px"><span>Thức Uống</span></a></li>            </ul>
</nav>
                </div>
                    </div>
    </div></div>
<main id="maincontent" class="page-main" style="padding-top: 33px;"><a id="contentarea" tabindex="-1"></a>
<div class="page messages"><div data-placeholder="messages"></div>
<div data-bind="scope: 'messages'">
    <!-- ko if: cookieMessages && cookieMessages.length > 0 --><!-- /ko -->

    <!-- ko if: messages().messages && messages().messages.length > 0 --><!-- /ko -->
</div>

</div><div class="columns"><div class="column main"><input name="form_key" type="hidden" value="ImwYKAOSVVPg94iw"><div id="authenticationPopup" data-bind="scope:'authenticationPopup', style: {display: 'none'}" style="display: none;">
        <script>window.authenticationPopup = {"autocomplete":"off","customerRegisterUrl":"https:\/\/jollibee.com.vn\/customer\/account\/create\/","customerForgotPasswordUrl":"https:\/\/jollibee.com.vn\/customer\/account\/forgotpassword\/","baseUrl":"https:\/\/jollibee.com.vn\/"}</script>    <!-- ko template: getTemplate() -->


<!-- /ko -->
    
</div>




    <div id="social-login-popup" class="white-popup mfp-with-anim mfp-hide">
        <div class="social-login block-container fake-email" style="display: none">
    <div class="social-login-title">
        <h2 class="forgot-pass-title">The information below is required for social login</h2>
    </div>
    <div class="block col-mp mp-12">
        <div class="block-content">
            <form class="form-fake-email" id="social-form-fake-email" novalidate="novalidate" data-gtm-form-interact-id="2">
                <fieldset class="fieldset" data-hasrequired="* Phần bắt buộc">
                    <div class="field note">Please complete your information below to creat an account.</div>
                    <div class="field field-name-social col-mp mp-6 required" style="padding: 0 10px 0px 0px;">
                            <label class="label" for="request-firstname" style="font-weight: 600"><span>Tên</span></label>
                            <div class="control">
                                <input type="text" id="request-firstname" name="firstname" title="Tên" class="input-text required-entry" data-validate="{required:true}" aria-required="true">
                            </div>
                    </div>
                    <div class="field field-name-social required col-mp mp-6" style="padding: 0">
                            <label class="label" for="request-lastname" style="font-weight: 600"><span>Họ</span></label>
                            <div class="control">
                                <input type="text" id="request-lastname" name="lastname" title="Họ" class="input-text required-entry" data-validate="{required:true}" aria-required="true">
                            </div>
                    </div>
                    <div class="field field-email-social required">
                        <label for="request-email" class="label"><span>E-mail</span></label>
                        <div class="control">
                            <input type="email" name="realEmail" alt="email" id="request-email" class="input-text" data-validate="{required:true, 'validate-email':true}" aria-required="true" data-gtm-form-interact-field-id="4">
                        </div>
                    </div>
                    <div class="field field-password-social required">
                        <label for="request-password-social" class="label"><span>Mật khẩu</span></label>
                        <div class="control">
                            <input type="password" name="password" id="request-password-social" title="Mật khẩu" class="input-text" data-validate="{required:true, 'validate-password':true}" autocomplete="off" aria-required="true" data-gtm-form-interact-field-id="5">
                        </div>
                    </div>
                    <div class="field field-confirmation-social required">
                        <label for="request-password-confirmation" class="label"><span>Xác nhận mật khẩu</span></label>
                        <div class="control">
                            <input type="password" name="password_confirmation" title="Xác nhận mật khẩu" id="request-password-confirmation" class="input-text" data-validate="{required:true, equalTo:'#request-password-social'}" autocomplete="off" aria-required="true">
                        </div>
                    </div>
                </fieldset>
                <div class="actions-toolbar">
                    <div class="primary">
                        <button type="button" id="bnt-social-login-fake-email" class="action send primary">
                            <span>Gửi</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
        <div class="social-login block-container authentication ">
    <div class="social-login-customer-authentication" id="social-login-authentication">
        <div class="toggle-header">
    <span data-action="toggle-nav" class="action nav-toggle"><span>Toggle Nav</span></span>
</div>
<div class="logo-header">
    <a class="logo" href="https://jollibee.com.vn/" title="Logo Jollibee" aria-label="store logo">
        <img src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/images/logo.png" title="Logo Jollibee" alt="Logo Jollibee" width="100" height="100">
    </a>
</div>
<script>
    require(['jquery'], function($) {
        $(document).mouseup(function(e) 
        {
            var container = $(".nav-sections-top-items");
            var button = $(".action.nav-toggle");
            // if the target of the click isn't the container nor a descendant of the container
            if (!container.is(e.target) && container.has(e.target).length === 0) 
            {
                if($("html").hasClass("nav-open")) {
                    $("html").removeClass("nav-before-open nav-open");
                }
            }
        });
    });
</script>        <div class="block-title">
            <span id="block-customer-login-heading" role="heading" class="login-uppercase" aria-level="2">Vui Lòng Đăng nhập</span>
        </div>
        <div class="block-content" aria-labelledby="block-customer-login-heading">
            <form class="form-customer-login" id="social-form-login" novalidate="novalidate" data-gtm-form-interact-id="3">
                <input name="form_key" type="hidden" value="ImwYKAOSVVPg94iw">                <div class="form-outler form-outler-top">
                    <fieldset class="fieldset login mp-8" data-hasrequired="* Phần bắt buộc">
                                                <div class="field email required">
                            <div class="control">
                                                                    <input name="username" id="social_login_email" type="text" class="input-text" value="" autocomplete="off" title="Số điện thoại" data-validate="{required:true}" placeholder="Email / Số điện thoại" aria-required="true" data-gtm-form-interact-field-id="6">
                                                            </div>
                        </div>
                        <div class="field password required">
                            <div class="control">
                                <input name="password" id="social_login_pass" type="password" class="input-text" autocomplete="off" title="Mật khẩu" data-validate="{required:true, 'validate-password':true}" placeholder="Mật khẩu" aria-required="true" data-gtm-form-interact-field-id="7">
                            </div>
                        </div>
                        <!-- BLOCK social-login-captcha --><!-- /BLOCK social-login-captcha -->                        <div class="forgot-pass">
                                                        <a class="remind" href="/customer/account/createpassword/"><span>Quên mật khẩu?</span></a>
                        </div>
                    </fieldset>
                </div>
                <div class="form-outler form-outler-bottom">
                    <div class="actions-toolbar mp-8">
                        <div class="form-outler-middle">
                        </div>
                        <div class="primary">
                            <button type="button" class="btn-popup action login primary login-uppercase" id="bnt-social-login-authentication">
                                <span>Đăng nhập</span>
                            </button>
                        </div>
                        
                        <div class="primary register-popup">
                            <span>Bạn chưa có tài khoản?</span><a class="action create" href="/customer/account/create"><span>Đăng ký ngay</span></a>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

        <div class="social-login block-container create" style="display: none">
    <div class="social-login-title">
        <h2 class="create-account-title">Tạo tài khoản mới</h2>
    </div>
    <div class="block col-mp mp-12">
        <div class="block-content">
                                    <form class="form-customer-create" id="social-form-create" novalidate="novalidate" data-gtm-form-interact-id="0">
                <fieldset class="fieldset create info">
                    <input type="hidden" name="success_url" value="">
                    <input type="hidden" name="error_url" value="">
                    
                                <div class="field field-name-lastname required">
                    <div class="control">
                        <input type="text" id="lastname" name="lastname" value="" title="Họ" class="input-text required-entry" data-validate="{required:true}" placeholder="Họ *" aria-required="true">
                    </div>
                </div>
                                <div class="field field-name-firstname required">
                    <div class="control">
                        <input type="text" id="firstname" name="firstname" value="" title="Tên" class="input-text required-entry" data-validate="{required:true}" placeholder="Tên *" aria-required="true">
                    </div>
                </div>
                
                                    <div class="field required">
                        <label for="email_address" class="label"><span>E-mail</span></label>
                        <div class="control">
                            <input type="email" name="email" id="email_address_create" value="" title="E-mail" class="input-text" data-validate="{required:true, 'validate-email':true}" aria-required="true" data-gtm-form-interact-field-id="0">
                        </div>
                    </div>
                                            <div class="field choice newsletter">
                            <input type="checkbox" class="checkbox" name="is_subscribed" title="Nhận chương trình khuyến mãi qua email" value="1" id="is_subscribed">
                            <label for="is_subscribed" class="label"><span>Nhận chương trình khuyến mãi qua email</span></label>
                        </div>
                                                                                                            <div class="field date field-dob">
                            <label class="label" for="dob"><span>Ngày sinh</span></label>
                            <div class="control customer-dob">
                                <input type="text" name="mp_sociallogin_dob" id="mp_sociallogin_dob" value="" class="_has-datepicker" data-validate="{" validate-date":{"dateformat":"m\="" d\="" y"}}"="" autocomplete="on"><button type="button" class="ui-datepicker-trigger v-middle"><span>Select Date</span></button>
                                <script type="text/javascript">
                                    require(["jquery", "mage/calendar"], function($){
                                        $("#mp_sociallogin_dob").calendar({
                                            showsTime: false,
                                            dateFormat: "M/d/Y",
                                            buttonImage: "https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/Magento_Theme/calendar.png",
                                            yearRange: "-120y:c+nn",
                                            buttonText: "Select Date",
                                            maxDate: "-1d",
                                            changeMonth: true,
                                            changeYear: true,
                                            showOn: "both"
                                        })
                                    });
                                </script>
                            </div>
                        </div>
                                                                                                                            <div class="field gender required">
    <div class="control">
        <select id="gender" name="gender" title="Giới tính" class="validate-select" data-validate="{required:true}" aria-required="true">
                                    <option value="" disabled="" selected="">Chọn giới tính *</option>
                                                                                <option value="1">Nam</option>
                                            <option value="2">Nữ</option>
                                            <option value="3">Khác</option>
                    </select>
    </div>
</div>
                                    </fieldset>
                                <fieldset class="fieldset create account" data-hasrequired="* Phần bắt buộc">
                    <div class="field password required">
                        <label for="password" class="label"><span>Mật khẩu</span></label>
                        <div class="control">
                            <input type="password" name="password" id="password-social" title="Mật khẩu" class="input-text" data-validate="{required:true, 'validate-password':true}" autocomplete="off" aria-required="true" data-gtm-form-interact-field-id="1">
                        </div>
                    </div>
                    <div class="field confirmation required">
                        <label for="password-confirmation" class="label"><span>Xác nhận mật khẩu</span></label>
                        <div class="control">
                            <input type="password" name="password_confirmation" title="Xác nhận mật khẩu" id="password-confirmation-social" class="input-text" data-validate="{required:true, equalTo:'#password-social'}" autocomplete="off" aria-required="true">
                        </div>
                    </div>
                    <!-- BLOCK social-create-captcha --><!-- /BLOCK social-create-captcha -->                </fieldset>
                <div class="actions-toolbar">
                    <div class="primary">
                        <button type="button" id="button-create-social" class="action create primary" title="Đăng ký">
                            <span>Đăng ký</span></button>
                        <div class="secondary">
                            <a class="action back" href="#"><span>Trở lại</span></a>
                        </div>
                    </div>
                </div>
            </form>
            <script>
                require([
                    'jquery',
                    'mage/mage'
                ], function ($) {
                    var dataForm = $('#social-form-create'),
                        ignore = 'input[id$="full"]';

                    dataForm.mage('validation', {
                                                errorPlacement: function (error, element) {
                            if (element.prop('id').search('full') !== -1) {
                                var dobElement = $(element).parents('.customer-dob'),
                                    errorClass = error.prop('class');
                                error.insertAfter(element.parent());
                                dobElement.find('.validate-custom').addClass(errorClass)
                                    .after('<div class="' + errorClass + '"></div>');
                            } else {
                                error.insertAfter(element);
                            }
                        },
                        ignore: ':hidden:not(' + ignore + ')'
                                            });
                });
            </script>
                    </div>
    </div>
</div>
                    </div>
    <div style="clear: both"></div>




<div class="widget block block-static-block">
    <a href="tel:19001533">
<img class="sticky-delivery" src="https://jollibee.com.vn/media/Jollibee-Delivery.png" alt="">
</a>

</div>
<div data-bind="scope: 'deliverySwitcher'">
    <!-- ko template: getTemplate() --><!-- ko if: ready() && !isCheckoutPage -->
<!-- ko if: customerAddress() && restaurant() --><!-- /ko -->
<!-- ko ifnot: customerAddress() && restaurant() -->
 <div class="mn-delivery-wrap" data-role="delivery-switcher">
    <div class="mn-tabs">
        <button type="button" class="mn-tab mn-active" data-bind="css: { 'mn-active': mode() === 'homeshipping_homeshipping' }, click: function() { setMode('homeshipping_homeshipping') }, attr: { 'data-mode': 'homeshipping_homeshipping' }" data-mode="homeshipping_homeshipping">
            <span data-bind="i18n: 'DELIVERY'">GIAO HÀNG TẬN NƠI</span>
        </button>
        <button type="button" class="mn-tab" data-bind="css: { 'mn-active': mode() === 'storepickup_storepickup' }, click: function() { setMode('storepickup_storepickup') }, attr: { 'data-mode': 'storepickup_storepickup' }" data-mode="storepickup_storepickup">
            <span data-bind="i18n: 'PICK UP IN STORE'">ĐẶT ĐẾN LẤY</span>
        </button>
    </div>
    <form class="mn-form" id="mn-form-main" data-bind="submit: submitMainForm">
        <input type="hidden" id="is-product-click" value="">
        <input type="text" id="mn-google-address" class="mn-input" data-bind="googlePlace: true, attr: { placeholder: mode() === 'storepickup_storepickup' ? i18n('Enter the address/store for pickup') : i18n('Enter delivery address') }" placeholder="Nhập địa chỉ giao hàng">
        <button type="button" class="mn-clear" data-bind="click: function(){ clearAddressField('#mn-google-address') }, attr: { 'aria-label': i18n('Clear') }" aria-label="Clear"><svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Menu / Close_SM"> <path id="Vector" d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg></button>
        <button type="submit" class="mn-search" data-bind="attr: { 'aria-label': i18n('Search') }" aria-label="Tìm kiếm"><span class="mn-icon"></span></button>
    </form>
</div>
<!-- /ko -->
<!-- /ko -->
<div id="mn-confirm-modal" style="display:none">
    <div class="mn-confirm-body">
        <div id="mn-confirm-text" class="mn-confirm-message" data-bind="i18n: 'Changing your address may cause some products to be unavailable in your new location. Do you want to continue?'">Thay đổi địa chỉ có thể khiến một số sản phẩm không còn khả dụng tại vị trí mới của bạn. Bạn có muốn tiếp tục không?</div>
        <div class="mn-confirm-actions">
            <button type="button" class="action primary mn-confirm-yes" id="mn-confirm-yes-text" data-bind="i18n: 'Agree'">Đồng ý</button>
            <button type="button" class="action secondary mn-confirm-no" id="mn-confirm-no-text" data-bind="i18n: 'Refuse'">Từ chối</button>
        </div>
    </div>
</div>
<div id="mn-address-modal" style="display:none;max-width:960px">
    <div class="notification-add-to-cart">
        <div class="title" data-bind="i18n: 'NOTIFICATION'">THÔNG BÁO</div>
        <p data-bind="i18n: 'Please enter your shipping address or select a store to continue shopping.'">Vui lòng nhập địa chỉ giao hàng hoặc chọn cửa hàng để tiếp tục mua sắm.</p>
    </div>

    <div class="mn-tabs mn-tabs-modal">
        <button type="button" class="mn-tab mn-active" data-bind="css: { 'mn-active': mode() === 'homeshipping_homeshipping' }, click: function() { setMode('homeshipping_homeshipping') }, attr: { 'data-mode': 'homeshipping_homeshipping' }" data-mode="homeshipping_homeshipping">
            <span data-bind="i18n: 'DELIVERY'">GIAO HÀNG TẬN NƠI</span>
        </button>
        <button type="button" class="mn-tab" data-bind="css: { 'mn-active': mode() === 'storepickup_storepickup' }, click: function() { setMode('storepickup_storepickup') }, attr: { 'data-mode': 'storepickup_storepickup' }" data-mode="storepickup_storepickup">
            <span data-bind="i18n: 'PICK UP IN STORE'">ĐẶT ĐẾN LẤY</span>
        </button>
    </div>
    <form class="mn-form" id="mn-form-modal" data-bind="submit: submitModalForm">
        <input type="text" id="mn-google-address-modal" class="mn-input" data-bind="googlePlace: true, attr: { placeholder: i18n('Enter address') }" placeholder="Nhập địa chỉ giao hàng">
        <button type="button" class="mn-clear" data-bind="click: function(){ clearAddressField('#mn-google-address-modal') }, attr: { 'aria-label': i18n('Clear') }" aria-label="Clear"><svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Menu / Close_SM"> <path id="Vector" d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg></button>
        <button type="submit" class="mn-search" data-bind="attr: { 'aria-label': i18n('Search') }" aria-label="Tìm kiếm"><span class="mn-icon"></span></button>
    </form>
    <h3 class="mn-stores-head">
        <span class="mn-stores-title" data-bind="i18n: 'Select a Jollibee Store'">Chọn cửa hàng Jollibee</span>
        <p class="access-location-wrapper">
            <button type="button" class="mn-detect-location" data-bind="click: function() { detectLocation() }, attr: { 'aria-label': i18n('Search') }" aria-label="Tìm kiếm"><span class="mn-icon-detect-location" data-bind="i18n: 'Access my location'">Truy cập vị trí của tôi</span></button>
        </p>
    </h3>
    <div id="mn-store-list" data-bind="html: storeListHtml"></div>
</div>
<!-- /ko -->
</div>


<script>
    require.config({
        map: {
            "*": {
                "googleMapPlaceLibrary": "https://maps.googleapis.com/maps/api/js?key=REMOVED_GOOGLE_API_KEY&v=3.exp&libraries=places&language=vi"
            }
        }
    });
</script>
    <div id="full-address-popup">
        <form action="" class="form" novalidate="novalidate">
            <div class="field input field-street_1">
                <label for="popup_street_1" style="display: none">Số nhà/Căn/Lô/khu/Cụm</label>
                <input type="text" id="popup_street_1" name="popup_street_1" data-validate="{&quot;required&quot;:true}" placeholder="Số nhà/Căn/Lô/khu/Cụm *">
            </div>
            <div class="field input field-route">
                <label for="popup_route" style="display: none">Đường/Ngõ/Khu/Hẻm/Tổ</label>
                <input type="text" id="popup_route" name="popup_route" data-validate="{&quot;required&quot;:true}" placeholder="Đường/Ngõ/Khu/Hẻm/Tổ *">
            </div>
            <div class="field input field-neighborhood">
                <label for="popup_neighborhood" style="display: none">Phường/Xã</label>
                <input type="text" id="popup_neighborhood" name="popup_neighborhood" data-validate="{&quot;required&quot;:true}" placeholder="Phường/Xã *">
            </div>
            <div class="field input field-city">
                <label for="popup_city" style="display: none">Quận/Huyện</label>
                <input type="text" id="popup_city" name="popup_city" data-validate="{&quot;required&quot;:true}" placeholder="Quận/Huyện *">
            </div>
            <div class="field input field-region">
                <label for="popup_region" style="display: none">Tỉnh/Tp</label>
                <input type="text" id="popup_region" name="popup_region" data-validate="{&quot;required&quot;:true}" placeholder="Tỉnh/Tp *">
            </div>
                            <input type="hidden" id="full_address" name="full_address" placeholder="Full Address *">
                <input type="hidden" id="store_id" name="store_id" placeholder="Store ID *">
                <input type="hidden" id="shipping_method" name="shipping_method" placeholder="Shipping method *">
                <input type="hidden" id="store_distance" name="store_distance" placeholder="Store distance *">
                        <div class="actions">
                <p class="message"></p>
                <button type="button" class="action primary submit">Xác nhận</button>
            </div>
        </form>
    </div>
                <div class="toolbar toolbar-products">
                        <div class="modes">
                            <strong class="modes-label" id="modes-label">View as</strong>
                                                <strong title="Grid" class="modes-mode active mode-grid" data-value="grid">
                        <span>Grid</span>
                    </strong>
                                                                <a class="modes-mode mode-list" title="List" href="#" data-role="mode-switcher" data-value="list" id="mode-list" aria-labelledby="modes-label mode-list">
                        <span>List</span>
                    </a>
                                        </div>
        
        <p class="toolbar-amount" id="toolbar-amount">
            <span class="toolbar-number">9</span> Items    </p>

        
    
        
        
    
    

        <div class="field limiter">
    <label class="label" for="limiter">
        <span>Hiển thị</span>
    </label>
    <div class="control">
        <select id="limiter" data-role="limiter" class="limiter-options">
                            <option value="12">
                    12                </option>
                            <option value="24" selected="selected">
                    24                </option>
                            <option value="36">
                    36                </option>
                    </select>
    </div>
    <span class="limiter-text">per page</span>
</div>

                    <div class="toolbar-sorter sorter">
    <label class="sorter-label" for="sorter">Sort By</label>
    <select id="sorter" data-role="sorter" class="sorter-options">
                    <option value="position" selected="selected">
                Position            </option>
                    <option value="name">
                Sản Phẩm            </option>
                    <option value="price">
                Giá            </option>
            </select>
            <a title="Set Descending Direction" href="#" class="action sorter-action sort-asc" data-role="direction-switcher" data-value="desc">
            <span>Set Descending Direction</span>
        </a>
    </div>
            </div>
    
        <div class="products wrapper grid products-grid">
        <ol class="products list items product-items" data-mage-init='{"Magento_Catalog/js/product/list/anchor-scroll-item":{}}'>
                        
            <div class="products wrapper grid products-grid">
        <ol class="products list items product-items" data-mage-init='{"Magento_Catalog/js/product/list/anchor-scroll-item":{}}'>
        
        <?php
        // Lấy các món thuộc danh mục 'MonNgon' và đang được bán (TrangThai = 1)
$sql = "SELECT * FROM monan WHERE MaLoai = 'MonNgon' AND TrangThai = 1 ORDER BY MaMon DESC";
        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) > 0) {
            // Vòng lặp: Cứ mỗi dòng trong Database sẽ vẽ ra 1 món ăn
            while($row = mysqli_fetch_assoc($result)) {
                $maMon = $row['MaMon'];
                $tenMon = $row['TenMon'];
                $giaMua = $row['Gia']; // Tên cột Giá trong bảng monan
                $hinhAnh = $row['HinhAnh']; // Tên file ảnh (VD: ga-sot-cay-1.jpg)
                
                // Nếu cột HinhAnh trong DB chỉ lưu tên file, ta tự ghép thêm thư mục chứa ảnh.
                // Sửa lại 'images/' thành thư mục chứa ảnh thực tế của bạn
                $urlHinhAnh = "images/" . $hinhAnh; 
        ?>
        
        <li class="item product product-item">
            <div class="product-item-info" data-id="<?php echo $maMon; ?>" style="cursor: pointer;">
                
                <span class="product-image-container" style="width: 268px;">
                    <span class="product-image-wrapper" style="padding-bottom: 100%;">
                        <img class="product-image-photo" src="<?php echo $urlHinhAnh; ?>" alt="<?php echo $tenMon; ?>"/>
                    </span>
                </span>

                <div class="product details product-item-details">
                    <strong class="product name product-item-name">
                        <span class="product-item-name-text" tabindex="0"><?php echo $tenMon; ?></span>
                    </strong>
                    
                    <div class="product description product-item-description"><?php echo $tenMon; ?></div>
                    
                    <div class="price-box price-final_price">
                        <span class="price-container">
                            <span class="price-wrapper" data-price-type="finalPrice">
                                <span class="price"><?php echo number_format($giaMua, 0, ',', '.'); ?> ₫</span>
                            </span>
                        </span>
                    </div>
                </div>
                
                <div class="product-item-inner">
                    <div class="product actions product-item-actions">
                        <div class="actions-primary">
                            <button type="button" class="action tocart primary add-to-cart-btn" style="display: none;">
                                <span>Đặt hàng</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </li>
        <?php 
            } // Kết thúc vòng lặp while
        } else {
            echo "<p style='padding: 20px; color: red;'>Danh mục này hiện chưa có món ăn nào trong Database.</p>";
        }
        ?>

    </ol>
</div>
                
                                </ol>
    </div>
            <div class="toolbar toolbar-products">
                        <div class="modes">
                            <strong class="modes-label" id="modes-label">View as</strong>
                                                <strong title="Grid" class="modes-mode active mode-grid" data-value="grid">
                        <span>Grid</span>
                    </strong>
                                                                <a class="modes-mode mode-list" title="List" href="#" data-role="mode-switcher" data-value="list" id="mode-list" aria-labelledby="modes-label mode-list">
                        <span>List</span>
                    </a>
                                        </div>
        
        <p class="toolbar-amount" id="toolbar-amount">
            <span class="toolbar-number">9</span> Items    </p>

        
    
        
        
    
    

        <div class="field limiter">
    <label class="label" for="limiter">
        <span>Hiển thị</span>
    </label>
    <div class="control">
        <select id="limiter" data-role="limiter" class="limiter-options">
                            <option value="12">
                    12                </option>
                            <option value="24" selected="selected">
                    24                </option>
                            <option value="36">
                    36                </option>
                    </select>
    </div>
    <span class="limiter-text">per page</span>
</div>

                    <div class="toolbar-sorter sorter">
    <label class="sorter-label" for="sorter">Sort By</label>
    <select id="sorter" data-role="sorter" class="sorter-options">
                    <option value="position" selected="selected">
                Position            </option>
                    <option value="name">
                Sản Phẩm            </option>
                    <option value="price">
                Giá            </option>
            </select>
            <a title="Set Descending Direction" href="#" class="action sorter-action sort-asc" data-role="direction-switcher" data-value="desc">
            <span>Set Descending Direction</span>
        </a>
    </div>
            </div>
            
                <script>
            require(['jquery'], function ($) {
                "use strict";

                function setHeight() {
                    var itemProductHeight = [];
                    $('.products-grid .product-items .item').each(function () {
                        itemProductHeight.push($(this).find('.product-item-name').innerHeight());
                    });
                    var itemMax = Math.max.apply(Math, itemProductHeight);
                    if (itemMax) {
                        $('.products-grid .product-items .item .product-item-name').css('height', itemMax + 'px');
                    }

                    var productsList = $('ol.products.list.items.product-items');

                    if($( window ).width() > 768) {
                        var heightList = productsList.innerHeight();

                        productsList.css({'height': (heightList-2) + 'px', "overflow-y": "hidden"});
                    } else {
                        productsList.css({'height': "auto", "overflow-y": "unset"});
                    }
                }
                setHeight();

                $( window ).resize(function() {
                    $('.products-grid .product-items .item .product-item-name').css('height', 'auto');
                    setHeight();
                });

            });
        </script>
    
<script>
    function addToCartClicked(id, sku, name, price, type, image_link, subcategory, url) {
        try {
            if (typeof smartech !== 'undefined') {
                smartech('dispatch', 'Add to Cart', {
                    'id': id,
                    'sku': sku,
                    'name': name,
                    'price': parseInt(price),
                    'price_number': parseInt(price),
                    'type': type,
                    'image_link': image_link,
                    'quantity': 1,
                    'subcategory': subcategory,
                    'url': url,
                    'drink_addon': "",
                    'food_addon':  ""
                });
            }
        } catch (e) {
            // ignore smartech error, still continue action
            console.warn('smartech tracking skipped', e);
        }
    }
</script>
<script>
    require(['jquery', 'mage/cookies'], function ($) {
        window.addEventListener('load', function () {
            const buttons = document.querySelectorAll('.add-to-cart-btn');
            buttons.forEach(function (btn) {
                btn.disabled = false;
            });

            if (!$.mage.cookies.get('csp') || !$.mage.cookies.get('csd')) {
                $('.js-location-popup').trigger('click');
            }
        });

        /* Process Add to cart */
        function addSimple($item) {
            var $form = $item.find('form[data-role="tocart-form"]');
            if (!$form.length) return;

            var $btn = $form.find('.action.tocart.primary.add-to-cart-btn.js-hidden-submit-simple');
            if ($btn.length) {
                $btn.prop('disabled', false);
                $btn.trigger('click');
                return;
            }
            $form.trigger('submit');
        }

        function openPopup($item) {
            var $el = $item.find('.js-quickview-trigger');
            if ($el.length) {
                $el.trigger('click');
            }
        }

        $(document).on('click', '.product-item .js-quick-action', function(e) {
            var $csp = $.mage.cookies.get('csp'),
                $csd = $.mage.cookies.get('csd'),
                $customerAddressElement = $('.mn-customer-address'),
                $item = $(this).closest('.product-item'),
                type = $item.data('type'),
                customerAddressText = '',
                $elementExists = $customerAddressElement.length > 0;

            if ($elementExists) {
                customerAddressText = $customerAddressElement.text().trim();
            };

            var readyAddtoCart = !!($csp && $csd && $elementExists && customerAddressText);
            e.preventDefault();
            e.stopPropagation();
            if (type === 'simple') {
                if (readyAddtoCart) {
                    addSimple($item);
                } else {
                    var pickForm = $('#mn-form-main'),
                        pickInput = $('#mn-google-address');
                    $('#is-product-click').val('1');
                    pickInput.val(' ');
                    pickForm.submit();
                    $('#mn-form-modal').trigger('reset');
                    pickInput.trigger('reset');
                }
            } else {
                openPopup($item);
            }
            return false;
        });
    });
</script>

<script type="text/javascript">
    require([
        'jquery',
        'jquery.sticky',
        'domReady!'
    ], function ($) {
        // set active menu on category page
        $('[data-item-nav="item-menu"]').addClass('active');

        //sticky menu category page
        var sectionNavigationSticky = function() {
            if ($(window).width() > 1200) {
                $('.nav-sections').sticky({
                    topSpacing: 0,
                    responsiveWidth: false,
                    zIndex: 144
                });
            } else {
                $('.nav-sections').unstick();
            }
        };

        //execute sticky
        sectionNavigationSticky();
        $( window ).resize(function() {
            sectionNavigationSticky();
        });

        var minicartSticky = function() {
            if ($('#sticky-wrapper').hasClass('is-sticky')) {
                $('body').addClass('nav-sticky').get(0).style.setProperty("--headerHeight", $('.nav-sections').outerHeight() + 'px');
            } else {
                $('body').removeClass('nav-sticky').get(0).style.setProperty("--headerHeight", $('.page-header').outerHeight() + 'px');
            }
        };

        //height header
        minicartSticky();
        $(window).scroll(function(){
            minicartSticky();
        });

        // Menu Opened on PLP
        var menuDropdown = $('.nav-sections-top .nav-sections-top-item-content .nav-menu li.level0.active > .menu-list');
        var menuDropdownSpacing = menuDropdown.outerHeight() - $('.sticky-wrapper').outerHeight();
        if (menuDropdown.length > 0 && menuDropdownSpacing > 0) {
            $('main.page-main').css('padding-top', menuDropdownSpacing + 'px');
        }
    });
</script>

<script>
            smartech('dispatch', 'Category View', {
            'id': "3",
            'title': "Món ngon phải thử",
            'url': "https://jollibee.com.vn/mon-ngon-phai-thu.php",
            'img_url': "/media/catalog/category/Combo_ba_n_cha_y.jpg"
        });
    </script>


<script>
    window.minimumOrderMessage = '';
    window.minimumOrderAmount = '60000';
    window.pointConvertRatio = 1000;
    window.pointEnable = 0</script>



<script id="message-cart-template" type="text/x-magento-template">
    <div class="container-message">
        <div class="product-name">
            <strong><%- data.productName %></strong>
            <span class="message"><%- data.message %></span>
        </div>
        <div class="cart-image">
            <img src=" <%- data.productImage %>" alt="<%- data.productName %>">
        </div>
    </div>
</script>

<script>
    require(
        [
            'jquery',
            'Magento_Ui/js/modal/modal',
            'mage/translate',
            'Magento_Customer/js/customer-data',
            'domReady!'
        ],
        function ($, modal, $t, customerData) {
            $('#iframe-product-options').css('height', $(window).height() - 250);

            const modaloption = {
                type: 'popup',
                modalClass: 'modal-popup modal-product-options',
                responsive: false,
                innerScroll: true,
                clickableOverlay: true,
                title: '',
                buttons: []
            };

            modal(modaloption, $('#container-iframe'));

            $('#container-iframe').on('modalclosed', function() {
                $('#iframe-product-options').remove();
            });

            modal({
                type: 'popup',
                modalClass: 'modal-popup modal-product-options message-cart',
                responsive: false,
                innerScroll: true,
                clickableOverlay: false,
                title: '',
                buttons: [{
                    text: $t('Continue'),
                    class: 'button action primary continue',
                    click: function () {
                        this.closeModal();
                    }
                },
                {
                    text: $t('Proceed to Checkout'),
                    class: 'button action goto link',
                    click: function () {
                        if (customerData.get('cart')().subtotalAmount >= parseFloat(window.minimumOrderAmount)) {
                            window.location = '/checkout';
                        }
                    }
                }]

            }, $('#container-cart-message'));

            $('#container-cart-message').on('modalclosed', function() {
                $('.container-message').remove();
            });
        }
    );
</script>
<div class="widget block block-static-block">
    <div id="ZN_pfwCQFpMY5SjNDP"><!--DO NOT REMOVE-CONTENTS PLACED HERE--></div></div>
</div></div>
<div data-block="minicart" class="minicart-wrapper" style="position: fixed;">
    <div data-trigger="minicart-content-trigger" class="minicart-content-trigger">
        <a class="action showcart" href="cart.php" data-bind="scope: 'minicart_content'">
            <span class="text">My Cart</span>
            <span class="counter qty empty" data-bind="css: { empty: !!getCartParam('summary_count') == false &amp;&amp; !isLoading() }, blockLoader: isLoading">
            <span class="counter-number">
                <!-- ko if: getCartParam('summary_count') == null --><!-- /ko -->
                <!-- ko text: getCartParam('summary_count') -->0<!-- /ko -->
            </span>
            <span class="counter-label">
            <!-- ko if: getCartParam('summary_count') --><!-- /ko -->
            </span>
        </span>
        </a>
        <span data-bind="scope: 'minicart_content'">
            <!-- ko if: getCartParam('subtotal') == null --><!-- /ko -->
            <!-- ko if: getCartParam('subtotal') != null -->
            <span class="subtotal" data-bind="html: getCartParam('subtotal')"><span class="price">0 ₫</span></span>
            <!-- /ko -->
        </span>
    </div>
            
        <script>
        window.checkout = {"shoppingCartUrl":"https:\/\/jollibee.com.vn\/checkout\/cart\/","checkoutUrl":"https:\/\/jollibee.com.vn\/checkout\/","updateItemQtyUrl":"https:\/\/jollibee.com.vn\/checkout\/sidebar\/updateItemQty\/","removeItemUrl":"https:\/\/jollibee.com.vn\/checkout\/sidebar\/removeItem\/","imageTemplate":"Magento_Catalog\/product\/image_with_borders","baseUrl":"https:\/\/jollibee.com.vn\/","minicartMaxItemsVisible":5,"websiteId":"1","maxItemsToDisplay":10,"storeId":"1","storeGroupId":"1","customerLoginUrl":"https:\/\/jollibee.com.vn\/customer\/account\/login\/referer\/aHR0cHM6Ly9qb2xsaWJlZS5jb20udm4vZ2EtZ2lvbi12dWktdmUuaHRtbA%2C%2C\/","isRedirectRequired":false,"autocomplete":"off","captcha":{"user_login":{"isCaseSensitive":false,"imageHeight":50,"imageSrc":"","refreshUrl":"https:\/\/jollibee.com.vn\/captcha\/refresh\/","isRequired":false,"timestamp":1775647705}}};
    </script>
    
</div>
<div id="configure-container" style="display: none"></div>

</main><footer class="page-footer"><div class="footer content"><div class="footer-text-container">
<div class="row">
<div class="col col-5 address">
<div class="footer-logo"><img src="https://jollibee.com.vn/media/logo-footer.png" alt=""></div>
<div class="info_address">
<p>CÔNG TY TNHH JOLLIBEE VIỆT NAM</p>
<p>Địa chỉ: Tầng 26, Tòa nhà CII Tower, số 152 Điện Biên Phủ, Phường Thạnh Mỹ Tây, Thành phố Hồ Chí Minh, Việt Nam</p>
<p>Điện thoại: (028) 39309168</p>
<p>Tổng đài: <a href="tel:19001533">1900-1533</a></p>
<p>Mã số thuế: 0303883266</p>
<p>Ngày cấp: 15/07/2008 – Nơi cấp: Cục Thuế Hồ Chí Minh</p>
<p>&nbsp;</p>
</div>
</div>
<div class="col col-3"><a title="GIAO HÀNG TẬN NƠI MIỄN PHÍ" href="tel:19001533"> <img class="img-responsive" src="https://jollibee.com.vn/media/wysiwyg/delivery-lg_1.png" alt=""> </a>
<ul class="list-page">
<ul class="list-page">
<li><a href="/lien-he">Liên hệ</a></li>
<li><a href="/chinh-sach-va-quy-dinh-chung">Chính sách và quy định chung</a></li>
<li><a href="/chinh-sach-thanh-toan-khi-dat-hang">Chính sách thanh toán khi đặt hàng</a></li>
<li><a href="/chinh-sach-hoat-dong">Chính sách hoạt động</a></li>
<li><a href="/chinh-sach-bao-mat">Chính sách bảo mật thông tin</a></li>
<li><a href="/chinh-sach-cookie">Chính sách cookie</a></li>
<li><a href="/thong-tin-van-chuyen-va-giao-nhan">Thông tin vận chuyển và giao nhận</a></li>
<li><a href="/thong-tin-dang-ky-giao-dich-chung">Thông tin đăng ký giao dịch chung</a></li>
<li><a href="/huong-dan-dat-phan-an">Hướng dẫn đặt phần ăn</a></li>
</ul>
</ul>
</div>
<div class="col col-3">
<p class="text-uppercase title">HÃY KẾT NỐI VỚI CHÚNG TÔI</p>
<div class="block-social no-padding display-flex"><a class="btn-icon text-white" href="https://www.facebook.com/JollibeeVietnam"><img src="https://jollibee.com.vn/media/wysiwyg/icon-fb.png" alt="Facebook" width="34"><span class="text">Facebook </span></a></div>
<style>
.nav-sections-top .block-social .text-white .text { display:none }
</style> <a href="https://online.gov.vn/Home/WebDetails/92800" target="_blank" rel="noopener"><img src="https://jollibee.com.vn/media/wysiwyg/bocongthuong.png" alt=""></a> <hr>
<div class="footer-download-app">
<p style="font-family: 'MergeBlack', sans-serif; font-weight: bold; text-align: left; font-size: 2.1rem; text-transform: uppercase; margin-bottom: 20px;"><span style="color: #ffffff;">TẢI ỨNG DỤNG ĐẶT HÀNG VỚI NHIỀU ƯU ĐÃI HƠN</span></p>
<a href="https://play.google.com/store/apps/details?id=com.jollibee.loyalty"> <img src="https://jollibee.com.vn/media/jollibee/logo_playstore.png" alt="" width="140" height="42"></a><a href="https://apps.apple.com/vn/app/jollibee-vietnam/id1554984107"> <img src="https://jollibee.com.vn/media/jollibee/logo_appstore.png" alt="" width="140" height="42"></a></div>
<p>&nbsp;</p>
<p>
<button class="action primary pr-open-cookie-settings" title="Cài Đặt Cookies">
    Cài Đặt Cookies</button>
</p>
</div>
</div>
</div></div></footer>
    

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K37KLDW4"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N5SVNLD"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->



<script id="pr_cookie_consent_on_load_activate">
    requirejs(['prCookieBodyScripts', 'domReady!'], function (bodyScripts) {
        'use strict';
        var scripts = document.querySelectorAll('script[type^="pr_cookie_category"]');
        [].forEach.call(scripts, function (notActiveScript) {
            bodyScripts.activatePrCookieCategoryScript(notActiveScript);
        });
    });
</script>

    <div id="am-recaptcha-container" data-bind="scope:'amRecaptcha'"></div>

    

    
    <!-- TikTok Pixel Code -->
    <script>

        (function (window, document) {
            var propagationStop = 0;

            function onDocumentReady() {
                (function (events) {
                    function loadCode() {
                        events.forEach(function (e) {
                            window.removeEventListener(e, loadCode);
                        });

                        // bof code

                                                // bof initialization code
                        !function (w, d, t) {
                            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off",
                                "once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push(
                                [e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(
                                ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++
                            )ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){
                                var i="https://analytics.tiktok.com/i18n/pixel/events.js";
                                ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o
                                    ||{},ttq._o[e]=n||{};
                                n=document.createElement("script");n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;
                                e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                        }(window, document, 'ttq');
                        // eof initialization code
                        
                        function jsonToUrlEncoded(element, key, list) {
                            var list = list || [];

                            if (typeof(element) === 'object' && !Array.isArray(element)) {
                                for (var idx in element) {
                                    if (element.hasOwnProperty(idx)) {
                                        jsonToUrlEncoded(element[idx], key?key+'['+idx+']':idx, list);
                                    }
                                }
                            } else if (typeof(element) === 'object' && Array.isArray(element)) {
                                for (var i = 0; i < element.length; i += 1) {
                                    jsonToUrlEncoded(element[i], key?key+'['+i+']':i, list);
                                }
                            } else {
                                list.push(key + '=' + encodeURIComponent(element));
                            }

                            return list.join('&');
                        }

                        function getTimestamp() {
                            var timestamp = 0;

                            if (!Date.now) {
                                timestamp = new Date().getTime();
                            } else {
                                timestamp = Date.now();
                            }

                            return timestamp;
                        }
                        var apptrianData = {"matching_data":[]};
                        var dataId = 1775647705;
                        function getUserData() {
                            var data = {
                                "apptrian_tiktokpixelapi_matching_section": {
                                    "matching_data": apptrianData,
                                    "data_id": dataId
                                }
                            };
                            run(data);
                        }

                        getUserData();

                        function run(response) {
                            var userData = {};
                            var apptrianTikTokPixelApiUrl="https://jollibee.com.vn/ga-gion-vui-ve.html";                            var apptrianTikTokPixelApiCategoryId=3;                                                        
                            function isEmpty(obj) {
                                for(var prop in obj) {
                                    if(obj.hasOwnProperty(prop)) {
                                        return false;
                                    }
                                }

                                return true;
                            }

                            if (propagationStop === 0) {
                                propagationStop = 1;

                                var section;
                                var sectionData;

                                if (response !== 'undefined' && response.hasOwnProperty('apptrian_tiktokpixelapi_matching_section')) {
                                    section = response.apptrian_tiktokpixelapi_matching_section;

                                    if (section !== 'undefined' && section.hasOwnProperty('matching_data')) {
                                        sectionData = section.matching_data;

                                        if (!isEmpty(sectionData)) {
                                            userData = sectionData;
                                        }
                                    }
                                }

                                                                                                if (isConsentGranted()) {
                                    ttq.load('CMRLVARC77U705JG557G');
                                }
                                
                                if (!isEmpty(userData)) {
                                    if (isConsentGranted()) {ttq.identify(userData);}
                                }
                                
                                function stringToHash(string) {
                                    var hash = 0;
                                    var stringLength = string.length;
                                    var i;
                                    var char;

                                    if (stringLength === 0) {
                                        return hash;
                                    }

                                    for (i = 0; i < stringLength; i += 1) {
                                        char = string.charCodeAt(i);
                                        hash = ((hash << 5) - hash) + char;
                                        hash = hash & hash;
                                    }

                                    return String(hash);
                                }

                                function generateEventId(eName) {
                                    var uCookie = document.cookie;
                                    var uHash = stringToHash(uCookie);
                                    var url = window.location.href;
                                    var urlHash = stringToHash(url);
                                    var timestamp = String(getTimestamp());

                                    return eName + uHash + urlHash + timestamp;
                                }

                                function fireEventsApiEvent(eName, eData, eId) {
                                    var data = {},
                                        body = document.querySelector('body');
                                    const isProductViewPage = body.classList.contains('catalog-product-view');

                                    data.eventName = eName;
                                    data.eventData = eData;
                                    data.eventId = eId;
                                    // Start override
                                    data.url = isProductViewPage ? document.referrer : window.location.href;
                                    // End override
                                    data.userData = userData;

                                    var query = jsonToUrlEncoded(data);
                                    var apiUrl = 'https://jollibee.com.vn/apptrian_tiktokpixelapi/index/index?' + query + '&_=' + getTimestamp();

                                    var request = new XMLHttpRequest();
                                    request.open('GET', apiUrl, true);
                                    request.setRequestHeader('Accept', 'application/json');
                                    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                                    request.onreadystatechange = function () {
                                        if (this.readyState === 4) {
                                            if (this.status >= 200 && this.status < 400) {
                                                // Success
                                                var result = this.responseText;
                                            } else {
                                                // Error
                                            }
                                        }
                                    };

                                    request.send();
                                    request = null;
                                }

                                // Ready PageView data. (It is fired below for each event conditionally.)
                                var pageViewEventName = "PageView";
                                var pageViewEventId = generateEventId(pageViewEventName);
                                var pageViewEventIdObj = {};
                                pageViewEventIdObj.event_id = pageViewEventId;

                                var pageViewData = {};

                                
                                
                                                                
                                
                                                                
                                var categoryEventName = "PageView";
                                var categoryEventData = {"content_category":"G\u00e0 Gi\u00f2n Vui V\u1ebb"};
                                var categoryEventId = generateEventId(categoryEventName);
                                var categoryEventIdObj = {};
                                categoryEventIdObj.event_id = categoryEventId;

                                                                                                if (isConsentGranted()) {ttq.page();}
                                                                
                                                                if (isConsentGranted()) {fireEventsApiEvent(categoryEventName, categoryEventData, categoryEventId);}
                                
                                                                                            } // end of propagationStop
                        } // end of run

                        function getCookieDataFromString(str) {
                            var data = {};

                            try {
                                data = JSON.parse(str);
                            } catch (e) {
                                if (str.indexOf('=') > -1) {
                                    var arr = str.split('=');
                                    var key = '';
                                    var value = '';
                                    var k = 1;

                                    for (let i = 0; i < arr.length; i+=2) {
                                        key   = '';
                                        value = '';

                                        if (arr[i] !== undefined) {
                                            key = arr[i].trim();
                                        }

                                        if (arr[k] !== undefined) {
                                            value = arr[k].trim();
                                        }

                                        if (key) {
                                            data[key] = value;
                                        }

                                        k+=2;
                                    }
                                } else {
                                    data = str;
                                }
                            }

                            return data;
                        }

                        function getCookie(name) {
                            // Split cookie string and get all individual name=value pairs in an array
                            var cookieArr = document.cookie.split(";");

                            // Loop through the array elements
                            for(var i = 0; i < cookieArr.length; i++) {
                                var cookiePair = cookieArr[i].split("=");

                                // Removing whitespace at the beginning of the cookie name
                                // and compare it with the given string
                                if(name == cookiePair[0].trim()) {
                                    // Decode the cookie value and return
                                    return decodeURIComponent(cookiePair[1]);
                                }
                            }

                            // Return null if not found
                            return null;
                        }

                        function isConsentGranted() {
                            var isCookieConsentEnabled = 0;

                            // If cookie consent feature is disabled just allow everything.
                            if (!isCookieConsentEnabled) {
                                return 1;
                            }

                            var cookieName = 'user_allowed_save_cookie';
                            var cookie     = getCookie(cookieName);
                            var result     = 0;

                            if (!cookie) {
                                return result;
                            }

                            var cookieData  = getCookieDataFromString(cookie);
                            var cookieKey   = '';
                            var cookieValue = '';

                            if (cookieKey && cookieValue) {
                                if (typeof cookieData === 'object' && cookieData[cookieKey] !== undefined) {
                                    var value = cookieData[cookieKey];

                                    if (value == cookieValue) {
                                        result = 1;
                                    }
                                }
                            } else if (!cookieKey && cookieValue) {
                                if (cookie == cookieValue) {
                                    result = 1;
                                }
                            } else if (cookieKey && !cookieValue) {
                                if (typeof cookieData === 'object' && cookieKey in cookieData) {
                                    result = 1;
                                }
                            } else {
                                if (cookie) {
                                    result = 1;
                                }
                            }

                            return result;
                        }

                        var consentFlag = 0;

                        function checkConsent() {
                            if (isConsentGranted()) {
                                if (consentFlag == 0) {
                                    ttq.enableCookie();
                                    consentFlag = 1;
                                }
                            }
                        }

                        // Check consent on document ready
                        checkConsent();

                        var elConsentButton = document.querySelector('#btn-cookie-allow');

                        if (elConsentButton !== null) {
                            // Add consent grant call to the consent button's click handler
                            elConsentButton.addEventListener('click', function() {
                                setTimeout(function() {
                                    checkConsent();
                                }, 1000);
                            });
                        }

                        // eof code

                    } // eof loadCode

                    events.forEach(function (e) {
                        window.addEventListener(e, loadCode, {once: true, passive: true});
                    });
                }(['touchstart', 'mouseover', 'wheel', 'scroll', 'keydown', 'apptriantiktokstart'])); // eof loadCode IIFE

                
            } // end of onDocumentReady

            // In case the document is already rendered
            if (document.readyState!='loading') {
                onDocumentReady();
                // Modern browsers
            } else if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', onDocumentReady);
                // Old browsers
            } else {
                document.attachEvent('onreadystatechange', function() {
                    if (document.readyState=='complete') {
                        onDocumentReady();
                    }
                });
            }

        }(window, document)); // eof IIFE
    </script>

    <!-- End TikTok Pixel Code -->

<small class="copyright">
    <span>© 2020 Jollibee Viet Nam</span>
</small>
</div>
<script type="text/javascript" id="" charset="">!function(b,e,f,g,a,c,d){b.fbq||(a=b.fbq=function(){a.callMethod?a.callMethod.apply(a,arguments):a.queue.push(arguments)},b._fbq||(b._fbq=a),a.push=a,a.loaded=!0,a.version="2.0",a.queue=[],c=e.createElement(f),c.async=!0,c.src=g,d=e.getElementsByTagName(f)[0],d.parentNode.insertBefore(c,d))}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init","462739624943585");fbq("track","PageView");</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=462739624943585&amp;ev=PageView&amp;noscript=1"></noscript>

<script type="text/javascript" id="" charset="">!function(b,e,f,g,a,c,d){b.fbq||(a=b.fbq=function(){a.callMethod?a.callMethod.apply(a,arguments):a.queue.push(arguments)},b._fbq||(b._fbq=a),a.push=a,a.loaded=!0,a.version="2.0",a.queue=[],c=e.createElement(f),c.async=!0,c.src=g,d=e.getElementsByTagName(f)[0],d.parentNode.insertBefore(c,d))}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init","250652843433500");fbq("track","PageView");</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=250652843433500&amp;ev=PageView&amp;noscript=1"></noscript>
<script type="text/javascript" id="" charset="">!function(d,g,e){d.TiktokAnalyticsObject=e;var a=d[e]=d[e]||[];a.methods="page track identify instances debug on off once ready alias group enableCookie disableCookie".split(" ");a.setAndDefer=function(b,c){b[c]=function(){b.push([c].concat(Array.prototype.slice.call(arguments,0)))}};for(d=0;d<a.methods.length;d++)a.setAndDefer(a,a.methods[d]);a.instance=function(b){b=a._i[b]||[];for(var c=0;c<a.methods.length;c++)a.setAndDefer(b,a.methods[c]);return b};a.load=function(b,c){var f="https://analytics.tiktok.com/i18n/pixel/events.js";
a._i=a._i||{};a._i[b]=[];a._i[b]._u=f;a._t=a._t||{};a._t[b]=+new Date;a._o=a._o||{};a._o[b]=c||{};c=document.createElement("script");c.type="text/javascript";c.async=!0;c.src=f+"?sdkid\x3d"+b+"\x26lib\x3d"+e;b=document.getElementsByTagName("script")[0];b.parentNode.insertBefore(c,b)};a.load("CMRLVARC77U705JG557G");a.page()}(window,document,"ttq");</script>
<script type="text/javascript" id="" charset="">!function(b,e,f,g,a,c,d){b.fbq||(a=b.fbq=function(){a.callMethod?a.callMethod.apply(a,arguments):a.queue.push(arguments)},b._fbq||(b._fbq=a),a.push=a,a.loaded=!0,a.version="2.0",a.queue=[],c=e.createElement(f),c.async=!0,c.src=g,d=e.getElementsByTagName(f)[0],d.parentNode.insertBefore(c,d))}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init","416953770850142");fbq("track","PageView");</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=416953770850142&amp;ev=PageView&amp;noscript=1"></noscript>
<script type="text/javascript" id="" charset="">!function(d,g,e){d.TiktokAnalyticsObject=e;var a=d[e]=d[e]||[];a.methods="page track identify instances debug on off once ready alias group enableCookie disableCookie".split(" ");a.setAndDefer=function(b,c){b[c]=function(){b.push([c].concat(Array.prototype.slice.call(arguments,0)))}};for(d=0;d<a.methods.length;d++)a.setAndDefer(a,a.methods[d]);a.instance=function(b){b=a._i[b]||[];for(var c=0;c<a.methods.length;c++)a.setAndDefer(b,a.methods[c]);return b};a.load=function(b,c){var f="https://analytics.tiktok.com/i18n/pixel/events.js";
a._i=a._i||{};a._i[b]=[];a._i[b]._u=f;a._t=a._t||{};a._t[b]=+new Date;a._o=a._o||{};a._o[b]=c||{};c=document.createElement("script");c.type="text/javascript";c.async=!0;c.src=f+"?sdkid\x3d"+b+"\x26lib\x3d"+e;b=document.getElementsByTagName("script")[0];b.parentNode.insertBefore(c,b)};a.load("CNLBDVBC77U4TBB0R76G");a.page()}(window,document,"ttq");</script>
<div class="plastic-tool-popup" style="display: none">
    <div class="popup--inner">
        <img alt="" src="https://jollibee.com.vn/static/version1775488343/frontend/Jollibee/default/vi_VN/images/plastic-tool-icon.png">
        <p class="popup-text">
            Để góp phần bảo vệ môi trường, bạn hãy chỉ lấy dụng cụ muỗng nĩa nhựa khi cần thiết thôi nhé!        </p>
        <button class="popup-action action primary js-hide-plastic-tool-popup">Đồng ý</button>
    </div>
</div>
<div class="plastic-tool-overlay" style="display: none"></div>
<script>
    require([
        'jquery'
    ], function ($) {
        $('.js-hide-plastic-tool-popup').click(function (e) {
            e.preventDefault();
            $('.plastic-tool-popup').hide();
            $('.plastic-tool-overlay').hide();
        });
    });
</script>
    <script type="text/javascript">window.NREUM||(NREUM={});NREUM.info={"beacon":"bam.nr-data.net","licenseKey":"NRJS-495c32bbd15c5696a46","applicationID":"1396432117","transactionName":"MQQDNUEECBEAAEQIWwhOIAJHDAkMThNRBlE5AgACWwA=","queueTime":0,"applicationTime":69,"atts":"HUMAQwkeGx8=","errorBeacon":"bam.nr-data.net","agent":""}</script><script defer="" src="https://static.cloudflareinsights.com/beacon.min.js/v8c78df7c7c0f484497ecbca7046644da1771523124516" integrity="sha512-8DS7rgIrAmghBFwoOTujcf6D9rXvH8xm8JQ1Ja01h9QX8EzXldiszufYa4IFfKdLUKTTrnSFXLDkUEOTrZQ8Qg==" data-cf-beacon="{&quot;version&quot;:&quot;2024.11.0&quot;,&quot;token&quot;:&quot;e1824f48925549988f18394ee6dbcc2d&quot;,&quot;server_timing&quot;:{&quot;name&quot;:{&quot;cfCacheStatus&quot;:true,&quot;cfEdge&quot;:true,&quot;cfExtPri&quot;:true,&quot;cfL4&quot;:true,&quot;cfOrigin&quot;:true,&quot;cfSpeedBrain&quot;:true},&quot;location_startswith&quot;:null}}" crossorigin="anonymous"></script>


<div id="ui-datepicker-div" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"><div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all"><a class="ui-datepicker-prev ui-corner-all" data-handler="prev" data-event="click" title="Prev"><span class="ui-icon ui-icon-circle-triangle-w">Prev</span></a><a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="Next"><span class="ui-icon ui-icon-circle-triangle-e">Next</span></a><div class="ui-datepicker-title"><select class="ui-datepicker-month" data-handler="selectMonth" data-event="change"><option value="0">Jan</option><option value="1">Feb</option><option value="2">Mar</option><option value="3" selected="selected">Apr</option></select><select class="ui-datepicker-year" data-handler="selectYear" data-event="change"><option value="1906">1906</option><option value="1907">1907</option><option value="1908">1908</option><option value="1909">1909</option><option value="1910">1910</option><option value="1911">1911</option><option value="1912">1912</option><option value="1913">1913</option><option value="1914">1914</option><option value="1915">1915</option><option value="1916">1916</option><option value="1917">1917</option><option value="1918">1918</option><option value="1919">1919</option><option value="1920">1920</option><option value="1921">1921</option><option value="1922">1922</option><option value="1923">1923</option><option value="1924">1924</option><option value="1925">1925</option><option value="1926">1926</option><option value="1927">1927</option><option value="1928">1928</option><option value="1929">1929</option><option value="1930">1930</option><option value="1931">1931</option><option value="1932">1932</option><option value="1933">1933</option><option value="1934">1934</option><option value="1935">1935</option><option value="1936">1936</option><option value="1937">1937</option><option value="1938">1938</option><option value="1939">1939</option><option value="1940">1940</option><option value="1941">1941</option><option value="1942">1942</option><option value="1943">1943</option><option value="1944">1944</option><option value="1945">1945</option><option value="1946">1946</option><option value="1947">1947</option><option value="1948">1948</option><option value="1949">1949</option><option value="1950">1950</option><option value="1951">1951</option><option value="1952">1952</option><option value="1953">1953</option><option value="1954">1954</option><option value="1955">1955</option><option value="1956">1956</option><option value="1957">1957</option><option value="1958">1958</option><option value="1959">1959</option><option value="1960">1960</option><option value="1961">1961</option><option value="1962">1962</option><option value="1963">1963</option><option value="1964">1964</option><option value="1965">1965</option><option value="1966">1966</option><option value="1967">1967</option><option value="1968">1968</option><option value="1969">1969</option><option value="1970">1970</option><option value="1971">1971</option><option value="1972">1972</option><option value="1973">1973</option><option value="1974">1974</option><option value="1975">1975</option><option value="1976">1976</option><option value="1977">1977</option><option value="1978">1978</option><option value="1979">1979</option><option value="1980">1980</option><option value="1981">1981</option><option value="1982">1982</option><option value="1983">1983</option><option value="1984">1984</option><option value="1985">1985</option><option value="1986">1986</option><option value="1987">1987</option><option value="1988">1988</option><option value="1989">1989</option><option value="1990">1990</option><option value="1991">1991</option><option value="1992">1992</option><option value="1993">1993</option><option value="1994">1994</option><option value="1995">1995</option><option value="1996">1996</option><option value="1997">1997</option><option value="1998">1998</option><option value="1999">1999</option><option value="2000">2000</option><option value="2001">2001</option><option value="2002">2002</option><option value="2003">2003</option><option value="2004">2004</option><option value="2005">2005</option><option value="2006">2006</option><option value="2007">2007</option><option value="2008">2008</option><option value="2009">2009</option><option value="2010">2010</option><option value="2011">2011</option><option value="2012">2012</option><option value="2013">2013</option><option value="2014">2014</option><option value="2015">2015</option><option value="2016">2016</option><option value="2017">2017</option><option value="2018">2018</option><option value="2019">2019</option><option value="2020">2020</option><option value="2021">2021</option><option value="2022">2022</option><option value="2023">2023</option><option value="2024">2024</option><option value="2025">2025</option><option value="2026" selected="selected">2026</option></select></div></div><table class="ui-datepicker-calendar"><thead><tr><th class="ui-datepicker-week-end"><span title="Sunday">Su</span></th><th><span title="Monday">Mo</span></th><th><span title="Tuesday">Tu</span></th><th><span title="Wednesday">We</span></th><th><span title="Thursday">Th</span></th><th><span title="Friday">Fr</span></th><th class="ui-datepicker-week-end"><span title="Saturday">Sa</span></th></tr></thead><tbody><tr><td class=" ui-datepicker-week-end ui-datepicker-other-month ui-datepicker-unselectable ui-state-disabled">&nbsp;</td><td class=" ui-datepicker-other-month ui-datepicker-unselectable ui-state-disabled">&nbsp;</td><td class=" ui-datepicker-other-month ui-datepicker-unselectable ui-state-disabled">&nbsp;</td><td class=" " data-handler="selectDay" data-event="click" data-month="3" data-year="2026"><a class="ui-state-default" href="#">1</a></td><td class=" " data-handler="selectDay" data-event="click" data-month="3" data-year="2026"><a class="ui-state-default" href="#">2</a></td><td class=" " data-handler="selectDay" data-event="click" data-month="3" data-year="2026"><a class="ui-state-default" href="#">3</a></td><td class=" ui-datepicker-week-end " data-handler="selectDay" data-event="click" data-month="3" data-year="2026"><a class="ui-state-default" href="#">4</a></td></tr><tr><td class=" ui-datepicker-week-end " data-handler="selectDay" data-event="click" data-month="3" data-year="2026"><a class="ui-state-default" href="#">5</a></td><td class=" " data-handler="selectDay" data-event="click" data-month="3" data-year="2026"><a class="ui-state-default" href="#">6</a></td><td class=" ui-datepicker-days-cell-over  ui-datepicker-current-day" data-handler="selectDay" data-event="click" data-month="3" data-year="2026"><a class="ui-state-default ui-state-active ui-state-hover" href="#">7</a></td><td class=" ui-datepicker-unselectable ui-state-disabled  ui-datepicker-today"><span class="ui-state-default">8</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">9</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">10</span></td><td class=" ui-datepicker-week-end ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">11</span></td></tr><tr><td class=" ui-datepicker-week-end ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">12</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">13</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">14</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">15</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">16</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">17</span></td><td class=" ui-datepicker-week-end ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">18</span></td></tr><tr><td class=" ui-datepicker-week-end ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">19</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">20</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">21</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">22</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">23</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">24</span></td><td class=" ui-datepicker-week-end ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">25</span></td></tr><tr><td class=" ui-datepicker-week-end ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">26</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">27</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">28</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">29</span></td><td class=" ui-datepicker-unselectable ui-state-disabled "><span class="ui-state-default">30</span></td><td class=" ui-datepicker-other-month ui-datepicker-unselectable ui-state-disabled">&nbsp;</td><td class=" ui-datepicker-week-end ui-datepicker-other-month ui-datepicker-unselectable ui-state-disabled">&nbsp;</td></tr></tbody></table></div>
<style>
    /* CSS CHO GIỎ HÀNG SIDEBAR */
    #my-cart-sidebar { position: fixed; top: 0; right: -400px; width: 380px; height: 100vh; background: #ffc425; z-index: 10000; transition: 0.4s ease; display: flex; flex-direction: column; box-shadow: -5px 0 15px rgba(0,0,0,0.3); font-family: 'Open Sans', sans-serif; }
    #my-cart-sidebar.open { right: 0; }
    .cart-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2ae16; }
    .cart-header h3 { margin: 0; color: #e31837; font-weight: 900; font-size: 20px; }
    .btn-close-cart { font-size: 30px; cursor: pointer; border: none; background: none; color: #333; }
    #cart-items-list { flex: 1; overflow-y: auto; padding: 15px; }
    .cart-item { background: #fff; margin-bottom: 10px; padding: 12px; border-radius: 8px; display: flex; gap: 10px; position: relative; }
    .cart-item b { font-size: 14px; display: block; color: #333; margin-bottom: 5px; }
    .cart-item .price-info { color: #e31837; font-weight: bold; }
    .qty-box { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
    .qty-btn { background: #e31837; color: #fff; border: none; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; }
    .btn-xoa { color: #999; font-size: 11px; text-decoration: underline; margin-left: auto; cursor: pointer; border:none; background:none; }
    .cart-footer { background: #fff; padding: 20px; border-top: 1px solid #ddd; }
    .total-line { display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-bottom: 15px; }
    
    .input-diachi { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 15px; font-size: 14px; box-sizing: border-box; }
    .input-diachi:focus { outline: none; border-color: #e31837; box-shadow: 0 0 5px rgba(227,24,55,0.3); }
    .btn-checkout { background: #e31837; color: white; border: none; width: 100%; padding: 15px; border-radius: 30px; font-weight: bold; cursor: pointer; font-size: 16px; }
    #cart-bg-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: none; }
</style>


<div id="cart-bg-overlay" onclick="toggleMyCart()"></div>
<div id="my-cart-sidebar">
    <div class="cart-header">
        <h3>ĐƠN HÀNG CỦA BẠN</h3>
        <button class="btn-close-cart" onclick="toggleMyCart()">&times;</button>
    </div>
    
    <div id="cart-items-list"></div>

    <div class="cart-footer">
        <div class="total-line">
            <span>TỔNG CỘNG</span>
            <span id="txt-tong-tien" style="color: #e31837;">0 ₫</span>
        </div>
        
        <input type="text" id="diachi_nhanhang" class="input-diachi" placeholder="📍 Nhập địa chỉ nhận hàng của bạn..." required>

        <button class="btn-checkout" onclick="thanhToanDonHang()">THANH TOÁN</button>
    </div>
</div>


<script>
    var userDaDangNhap = <?php echo isset($_SESSION['MaKH']) ? 'true' : 'false'; ?>;
    var maKH_hien_tai = <?php echo isset($_SESSION['MaKH']) ? $_SESSION['MaKH'] : 0; ?>;
    // Dùng chung localStorage để đi qua trang nào cũng còn nguyên giỏ hàng
    var gioHang = JSON.parse(localStorage.getItem('gioHangData')) || [];

    // =====================================================================
    // 1. NGĂN CHẶN SỰ KIỆN CLICK ẨN CỦA JOLLIBEE VÀ RENDER GIỎ HÀNG
    // =====================================================================
    document.addEventListener("DOMContentLoaded", function() {
        let products = document.querySelectorAll('.product-item-info');
        products.forEach(function(item) {
            item.classList.remove('js-quick-action');
            // Cắt đứt sự kiện click ngầm (mở popup của Jollibee) bằng cách thay thế Node
            let clone = item.cloneNode(true);
            let trigger = clone.querySelector('.js-quickview-trigger');
            if (trigger) trigger.remove();
            item.parentNode.replaceChild(clone, item);
        });
        
        renderCartUI();
    });

    window.toggleMyCart = function() {
        const sidebar = document.getElementById('my-cart-sidebar');
        const overlay = document.getElementById('cart-bg-overlay');
        if (sidebar) {
            sidebar.classList.toggle('open');
            if (overlay) overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
        }
    }

    window.renderCartUI = function() {
        const listContainer = document.getElementById('cart-items-list');
        const txtTongTien = document.getElementById('txt-tong-tien');
        const badgeCount = document.querySelector('.minicart-wrapper .counter-number'); 
        
        if(!listContainer) return;
        listContainer.innerHTML = '';
        let tongTien = 0, tongSL = 0;

        if(gioHang.length === 0) {
            listContainer.innerHTML = '<div style="text-align:center; margin-top:50px; color:#555;">Giỏ hàng trống</div>';
        }

        gioHang.forEach((item, index) => {
            let thanhTien = item.GiaMua * item.SoLuongMua;
            tongTien += thanhTien;
            tongSL += item.SoLuongMua;

            listContainer.innerHTML += `
                <div class="cart-item">
                    <img src="${item.Hinh}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;" onerror="this.src='https://jollibee.com.vn/media/favicon/default/favicon.png'">
                    <div style="flex:1">
                        <b>${item.TenMon}</b>
                        <span class="price-info">${thanhTien.toLocaleString()} ₫</span>
                        <div class="qty-box">
                            <button type="button" class="qty-btn" onclick="window.updateQty(${index}, -1)">-</button>
                            <span>${item.SoLuongMua}</span>
                            <button type="button" class="qty-btn" onclick="window.updateQty(${index}, 1)">+</button>
                            <button type="button" class="btn-xoa" onclick="window.deleteItem(${index})">XOÁ</button>
                        </div>
                    </div>
                </div>`;
        });

        if(txtTongTien) txtTongTien.innerText = tongTien.toLocaleString() + " ₫";
        if(badgeCount) {
            badgeCount.innerText = tongSL;
            if(tongSL > 0) badgeCount.parentElement.classList.remove('empty');
            else badgeCount.parentElement.classList.add('empty');
        }
    }

    window.updateQty = function(index, delta) {
        gioHang[index].SoLuongMua += delta;
        if(gioHang[index].SoLuongMua < 1) gioHang.splice(index, 1);
        localStorage.setItem('gioHangData', JSON.stringify(gioHang));
        renderCartUI();
    }

    window.deleteItem = function(index) {
        gioHang.splice(index, 1);
        localStorage.setItem('gioHangData', JSON.stringify(gioHang));
        renderCartUI();
    }

    // =====================================================================
    // 2. BẮT SỰ KIỆN CLICK VÀO MÓN ĂN VÀ ICON GIỎ HÀNG
    // =====================================================================
    document.addEventListener('click', function(e) {
        // Bấm vào icon Giỏ hàng Mini
        if (e.target.closest('.minicart-wrapper')) {
            e.preventDefault(); 
            if (!userDaDangNhap) {
                alert("Vui lòng đăng nhập để sử dụng giỏ hàng!");
                window.location.href = "../login.php";
                return;
            }
            toggleMyCart();
            return;
        }

        // Bấm vào món ăn
        let productItemInfo = e.target.closest('.product-item-info');
        if (productItemInfo) {
            e.preventDefault(); 
            e.stopPropagation();

            if (!userDaDangNhap) {
                alert("Bạn cần đăng nhập để đặt món!");
                window.location.href = "../login.php"; 
                return;
            }
            
            try {
                let maMon = productItemInfo.getAttribute('data-id') || Date.now();

                let tenEl = productItemInfo.querySelector('.product-item-name-text');
                let tenMon = tenEl ? tenEl.innerText.trim() : "Món Jollibee";

                let giaEl = productItemInfo.querySelector('.price-wrapper[data-price-type="minPrice"] .price') 
                         || productItemInfo.querySelector('.price-wrapper[data-price-type="finalPrice"] .price') 
                         || productItemInfo.querySelector('.price');
                let giaText = giaEl ? giaEl.innerText : "0";
                let giaMua = parseFloat(giaText.replace(/[^0-9]/g, ''));

                let imgEl = productItemInfo.querySelector('.product-image-photo');
                let hinhAnh = imgEl ? imgEl.src : "https://jollibee.com.vn/media/favicon/default/favicon.png";

                maMon = parseInt(maMon);
                let monDaCo = gioHang.find(item => item.MaMon === maMon);
                if (monDaCo) {
                    monDaCo.SoLuongMua += 1;
                } else {
                    gioHang.push({ MaMon: maMon, TenMon: tenMon, GiaMua: giaMua, SoLuongMua: 1, Hinh: hinhAnh });
                }

                localStorage.setItem('gioHangData', JSON.stringify(gioHang));
                renderCartUI();
                
                const sidebar = document.getElementById('my-cart-sidebar');
                if (sidebar && !sidebar.classList.contains('open')) toggleMyCart();

            } catch (error) {
                console.error('Lỗi khi thêm món:', error);
            }
        }
    }); 

    // =====================================================================
    // 3. XỬ LÝ THANH TOÁN (Giữ nguyên giỏ hàng mở để khách thấy trống)
    // =====================================================================
    window.thanhToanDonHang = function() {
        if(gioHang.length === 0) {
            alert("Vui lòng chọn món ăn!");
            return;
        }

        let inputDiaChi = document.getElementById("diachi_nhanhang");
        let diachi = inputDiaChi ? inputDiaChi.value.trim() : "";

        if (diachi === "") {
            alert("⚠️ LỖI: Vui lòng nhập địa chỉ nhận hàng trước khi thanh toán!");
            if(inputDiaChi) {
                inputDiaChi.focus();
                inputDiaChi.style.border = "2px solid red"; 
            }
            return; 
        }
        if(inputDiaChi) inputDiaChi.style.border = "1px solid #ccc"; 

        let tongTien = gioHang.reduce((sum, item) => sum + (item.GiaMua * item.SoLuongMua), 0);

        let orderData = {
            MaKH: maKH_hien_tai, 
            TongTien: tongTien,
            DiaChiGiao: diachi, 
            ChiTiet: gioHang
        };

        let btn = document.querySelector('.btn-checkout');
        if(btn) { btn.innerText = "ĐANG XỬ LÝ..."; btn.disabled = true; }

        fetch('xu_ly_dat_hang.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })
        .then(response => response.text())
        .then(msg => {
            // Hiện thông báo từ server ra cho khách xem
            alert(msg);
            
            // Ép tất cả về chữ thường để so sánh cho chuẩn
            let lowerMsg = msg.toLowerCase();
            
            // Nếu không có lỗi thì xóa sạch món ăn
            if(!lowerMsg.includes("lỗi") && !lowerMsg.includes("thất bại") && !lowerMsg.includes("error")) {
                gioHang = []; 
                localStorage.removeItem('gioHangData');
                if(inputDiaChi) inputDiaChi.value = ""; 
                
                // Vẽ lại giao diện (lúc này sẽ tự động hiện "Giỏ hàng trống" và tổng tiền về 0)
                renderCartUI();
                
                // ĐÃ XÓA LỆNH toggleMyCart() ĐỂ GIỎ HÀNG KHÔNG BỊ ĐÓNG 
            }
        })
        .catch(err => {
            console.error("Lỗi:", err);
            alert("Đã xảy ra lỗi khi kết nối server!");
        })
        .finally(() => {
            if(btn) { btn.innerText = "THANH TOÁN"; btn.disabled = false; }
        });
    }

    // =====================================================================
    // 4. BẮT CÓC Ô TÌM KIẾM ĐỊA CHỈ VÀ BIẾN THÀNH Ô TÌM MÓN ĂN
    // =====================================================================
    let checkSearchInput = setInterval(function() {
        let searchInput = document.getElementById('mn-google-address');
        let searchForm = document.getElementById('mn-form-main');
        let textTabs = document.querySelectorAll('.mn-tabs .mn-tab span');
        
        if (searchInput && searchForm && textTabs.length > 0) {
            clearInterval(checkSearchInput); 

            textTabs[0].innerText = "TÌM KIẾM MÓN ";
            
            if(textTabs[1] && textTabs[1].parentElement) {
                 textTabs[1].parentElement.style.display = 'none';
            }

            let newSearchInput = searchInput.cloneNode(true);
            newSearchInput.placeholder = "🔍 Bạn muốn tìm Món nào? (VD: Gà giòn, Bò bằm...)";
            newSearchInput.style.border = "2px solid #e31837";
            newSearchInput.style.borderRadius = "8px";
            searchInput.parentNode.replaceChild(newSearchInput, searchInput);

            searchForm.onsubmit = function(e) {
                e.preventDefault();
                return false;
            };

            newSearchInput.addEventListener('input', function() {
                let keyword = this.value.toLowerCase().trim();
                let productItems = document.querySelectorAll('ol.products.list.items.product-items li.item.product');

                productItems.forEach(item => {
                    let nameElement = item.querySelector('.product-item-name-text');
                    if (nameElement) {
                        let foodName = nameElement.innerText.toLowerCase();
                        if (foodName.includes(keyword)) {
                            item.style.display = ''; 
                        } else {
                            item.style.display = 'none'; 
                        }
                    }
                });
            });

            let clearBtn = document.querySelector('.mn-clear');
            if (clearBtn) {
                let newClearBtn = clearBtn.cloneNode(true);
                clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);
                
                newClearBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    newSearchInput.value = '';
                    newSearchInput.dispatchEvent(new Event('input')); 
                });
            }
        }
    }, 500); 
</script>



<script>
    document.addEventListener("DOMContentLoaded", function() {
        const searchInput = document.getElementById('custom-search-input');
        const clearBtn = document.getElementById('custom-search-clear');
        // Tìm tất cả các thẻ chứa món ăn
        const productItems = document.querySelectorAll('ol.products.list.items.product-items li.item.product');

        if(searchInput) {
            searchInput.addEventListener('input', function() {
                let keyword = this.value.toLowerCase().trim();

                productItems.forEach(item => {
                    // Tìm thẻ chứa tên món ăn
                    let nameElement = item.querySelector('.product-item-name-text');
                    if (nameElement) {
                        let foodName = nameElement.innerText.toLowerCase();
                        // Nếu tên món có chứa từ khóa gõ vào -> Hiện, ngược lại -> Ẩn
                        if (foodName.includes(keyword)) {
                            item.style.display = ''; 
                        } else {
                            item.style.display = 'none'; 
                        }
                    }
                });
            });
        }

        // Chức năng của nút Xóa
        if(clearBtn) {
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if(searchInput) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input')); // Kích hoạt lại để hiện toàn bộ món
                }
            });
        }
    });
</script>

</body></html>