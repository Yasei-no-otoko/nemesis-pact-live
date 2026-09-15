/* Record only this game's own pixels and visible UI; no screen-sharing API. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PactGameCapture=factory();})(globalThis,function(){'use strict';
 class GameCapture{
  constructor(stage){this.stage=stage;this.doc=stage.ownerDocument;this.host=this.doc.defaultView;this.canvas=this.doc.createElement('canvas');this.overlay=this.doc.createElement('canvas');this.g=this.canvas.getContext('2d',{alpha:false});this.ui=this.overlay.getContext('2d');this.lastUI=-Infinity;this.closed=false;}
  start(){
   if(!this.g||!this.ui||!this.canvas.captureStream)throw Error('Game recording unavailable');
   const r=this.stage.getBoundingClientRect(),scale=Math.min(1,1920/r.width,1080/r.height);
   this.canvas.width=this.overlay.width=Math.max(2,Math.floor(r.width*scale/2)*2);this.canvas.height=this.overlay.height=Math.max(2,Math.floor(r.height*scale/2)*2);
   this.draw();this.stream=this.canvas.captureStream(60);return this;
  }
  draw(){
   if(this.closed)return;const r=this.stage.getBoundingClientRect();if(!r.width||!r.height)return;
   const g=this.g,scale=Math.min(this.canvas.width/r.width,this.canvas.height/r.height),x=(this.canvas.width-r.width*scale)/2,y=(this.canvas.height-r.height*scale)/2;
   g.setTransform(1,0,0,1,0,0);g.fillStyle='#050910';g.fillRect(0,0,this.canvas.width,this.canvas.height);g.setTransform(scale,0,0,scale,x-r.left*scale,y-r.top*scale);
   // Called synchronously after the game render, before WebGL discards its buffer.
   for(const canvas of this.stage.querySelectorAll('.gpu-canvas,#canvas')){const b=canvas.getBoundingClientRect();if(b.width&&b.height)g.drawImage(canvas,b.left,b.top,b.width,b.height);}
   const now=this.host.performance.now();if(now-this.lastUI>=100){this.ui.setTransform(1,0,0,1,0,0);this.ui.clearRect(0,0,this.overlay.width,this.overlay.height);this.ui.setTransform(scale,0,0,scale,x-r.left*scale,y-r.top*scale);this.paint(this.stage,r);this.lastUI=now;}
   g.setTransform(1,0,0,1,0,0);g.drawImage(this.overlay,0,0);
  }
  paint(el,clip){
   if(el.nodeType!==1||['SCRIPT','STYLE','OPTION'].includes(el.tagName)||el.matches('.gpu-canvas,#canvas,[data-recording-private]'))return;
   const s=this.host.getComputedStyle(el),r=el.getBoundingClientRect();if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return;
   // The HUD uses zero-height containers with absolutely positioned children.
   if(!r.width||!r.height){for(const child of el.children)this.paint(child,clip);return;}
   if(r.right<clip.left||r.left>clip.right||r.bottom<clip.top||r.top>clip.bottom)return;
   const g=this.ui;g.save();g.globalAlpha*=Number(s.opacity);const sx=el.offsetWidth?r.width/el.offsetWidth:1,sy=el.offsetHeight?r.height/el.offsetHeight:1;
   const radius=Math.min(parseFloat(s.borderRadius)||0,r.width/2,r.height/2);g.beginPath();g.roundRect(r.left,r.top,r.width,r.height,radius);
   if(el!==this.stage&&s.backgroundColor!=='rgba(0, 0, 0, 0)'){g.fillStyle=s.backgroundColor;g.fill();}
   const colors=s.backgroundImage?.match(/rgba?\([^)]*\)/g);if(colors?.length){const gradient=g.createLinearGradient(r.left,r.top,r.right,r.bottom);colors.forEach((color,i)=>gradient.addColorStop(i/Math.max(1,colors.length-1),color));g.fillStyle=gradient;g.fill();}
   const border=parseFloat(s.borderTopWidth);if(border){g.strokeStyle=s.borderTopColor;g.lineWidth=border*sx;g.stroke();}
   if(/hidden|auto|scroll|clip/.test(s.overflow+s.overflowY)){g.beginPath();g.rect(r.left,r.top,r.width,r.height);g.clip();clip={left:Math.max(clip.left,r.left),top:Math.max(clip.top,r.top),right:Math.min(clip.right,r.right),bottom:Math.min(clip.bottom,r.bottom)};}
   if(el.tagName==='CANVAS'){g.drawImage(el,r.left,r.top,r.width,r.height);}
   else if(['INPUT','TEXTAREA','SELECT'].includes(el.tagName)){
    if(el.type!=='password'&&!['range','checkbox','radio','hidden'].includes(el.type)){
     const text=el.tagName==='SELECT'?el.selectedOptions[0]?.textContent:el.value||el.placeholder||'';this.font(s,sy);g.fillStyle=s.color;g.textBaseline='top';g.save();g.beginPath();g.rect(r.left,r.top,r.width,r.height);g.clip();const left=r.left+(parseFloat(s.paddingLeft)||4)*sx,top=r.top+(parseFloat(s.paddingTop)||4)*sy,width=r.width-(parseFloat(s.paddingLeft)||4)*sx-(parseFloat(s.paddingRight)||4)*sx;let line='',y=top;for(const char of String(text)){if(char==='\n'||g.measureText(line+char).width>width){g.fillText(line,left,y);y+=(parseFloat(s.lineHeight)||parseFloat(s.fontSize)*1.3)*sy;line=char==='\n'?'':char;}else line+=char;}g.fillText(line,left,y);g.restore();
    }else if(['checkbox','radio'].includes(el.type)){g.fillStyle=el.checked?'#78e8d0':'#182b35';g.fillRect(r.left,r.top,r.width,r.height);if(el.checked){g.fillStyle='#07121d';g.font='bold '+r.height+'px sans-serif';g.textBaseline='top';g.fillText('✓',r.left,r.top);}}
   }else for(const node of el.childNodes){if(node.nodeType===1)this.paint(node,clip);else if(node.nodeType===3)this.text(node,s,sy,clip);}
   g.restore();
  }
  font(s,scale){this.ui.font=`${s.fontStyle} ${s.fontWeight} ${parseFloat(s.fontSize)*scale}px ${s.fontFamily}`;}
  text(node,s,scale,clip){
   const g=this.ui,range=this.doc.createRange();this.font(s,scale);g.fillStyle=s.color;g.textBaseline='alphabetic';
   const metrics=g.measureText('Mg'),ascent=metrics.fontBoundingBoxAscent||parseFloat(s.fontSize)*scale*.8,descent=metrics.fontBoundingBoxDescent||parseFloat(s.fontSize)*scale*.2;
   let offset=0;for(const char of node.nodeValue){range.setStart(node,offset);offset+=char.length;range.setEnd(node,offset);const r=range.getBoundingClientRect();if(!r.width||!r.height||r.bottom<clip.top||r.top>clip.bottom||r.right<clip.left||r.left>clip.right||!char.trim())continue;const text=s.textTransform==='uppercase'?char.toUpperCase():s.textTransform==='lowercase'?char.toLowerCase():char;g.fillText(text,r.left,r.top+(r.height-ascent-descent)/2+ascent);}
  }
  release(){this.closed=true;this.canvas.width=this.overlay.width=1;this.canvas.height=this.overlay.height=1;}
 }
 return GameCapture;
});
