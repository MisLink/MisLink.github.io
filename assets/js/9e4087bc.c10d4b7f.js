"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[711],{9331:(e,r,t)=>{t.r(r),t.d(r,{default:()=>m});t(6540);var a=t(8774),s=t(1312),i=t(1213),n=t(6266),c=t(4559),l=t(1107),h=t(4848);function o(e){let{year:r,posts:t}=e;const s=(0,n.i)({day:"numeric",month:"long",timeZone:"UTC"});return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(l.A,{as:"h3",id:r,children:r}),(0,h.jsx)("ul",{children:t.map((e=>{return(0,h.jsx)("li",{children:(0,h.jsxs)(a.A,{to:e.metadata.permalink,children:[(r=e.metadata.date,s.format(new Date(r)))," - ",e.metadata.title]})},e.metadata.date);var r}))})]})}function d(e){let{years:r}=e;return(0,h.jsx)("section",{className:"margin-vert--lg",children:(0,h.jsx)("div",{className:"container",children:(0,h.jsx)("div",{className:"row",children:r.map(((e,r)=>(0,h.jsx)("div",{className:"col col--4 margin-vert--lg",children:(0,h.jsx)(o,{...e})},r)))})})})}function m(e){let{archive:r}=e;const t=(0,s.T)({id:"theme.blog.archive.title",message:"Archive",description:"The page & hero title of the blog archive page"}),a=(0,s.T)({id:"theme.blog.archive.description",message:"Archive",description:"The page & hero description of the blog archive page"}),n=function(e){const r=e.reduce(((e,r)=>{const t=r.metadata.date.split("-")[0],a=e.get(t)??[];return e.set(t,[r,...a])}),new Map);return Array.from(r,(e=>{let[r,t]=e;return{year:r,posts:t}}))}(r.blogPosts);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i.be,{title:t,description:a}),(0,h.jsxs)(c.A,{children:[(0,h.jsx)("header",{className:"hero hero--primary",children:(0,h.jsxs)("div",{className:"container",children:[(0,h.jsx)(l.A,{as:"h1",className:"hero__title",children:t}),(0,h.jsx)("p",{className:"hero__subtitle",children:a})]})}),(0,h.jsx)("main",{children:n.length>0&&(0,h.jsx)(d,{years:n})})]})]})}}}]);