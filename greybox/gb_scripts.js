var GB_CURRENT=null;
GB_hide=function(){
GB_CURRENT.hide();
};
GreyBox=new AJS.Class({init:function(_1){
this.use_fx=AJS.fx;
this.type="page";
this.overlay_click_close=false;
this.salt=0;
this.root_dir=GB_ROOT_DIR;
this.callback_fns=[];
this.reload_on_close=false;
this.src_loader=this.root_dir+"loader_frame.html";
var _2=window.location.hostname.indexOf("www");
var _3=this.src_loader.indexOf("www");
if(_2!=-1&&_3==-1){
this.src_loader=this.src_loader.replace("://","://www.");
}
if(_2==-1&&_3!=-1){
this.src_loader=this.src_loader.replace("://www.","://");
}
this.show_loading=true;
AJS.update(this,_1);
},addCallback:function(fn){
if(fn){
this.callback_fns.push(fn);
}
},show:function(_5){
GB_CURRENT=this;
this.url=_5;
var _6=[AJS.$bytc("object"),AJS.$bytc("select")];
AJS.map(AJS.flattenList(_6),function(_7){
_7.style.visibility="hidden";
});
this.createElements();
return false;
},hide:function(){
var me=this;
AJS.callLater(function(){
var _9=me.callback_fns;
if(_9!=[]){
AJS.map(_9,function(fn){
fn();
});
}
me.onHide();
if(me.use_fx){
var _b=me.overlay;
AJS.fx.fadeOut(me.overlay,{onComplete:function(){
AJS.removeElement(_b);
_b=null;
},duration:300});
AJS.removeElement(me.g_window);
}else{
AJS.removeElement(me.g_window,me.overlay);
}
me.removeFrame();
AJS.REV(window,"scroll",_GB_setOverlayDimension);
AJS.REV(window,"resize",_GB_update);
var _c=[AJS.$bytc("object"),AJS.$bytc("select")];
AJS.map(AJS.flattenList(_c),function(_d){
_d.style.visibility="visible";
});
GB_CURRENT=null;
if(me.reload_on_close){
window.location.reload();
}
},10);
},update:function(){
this.setOverlayDimension();
this.setFrameSize();
this.setWindowPosition();
},createElements:function(){
this.initOverlay();
this.g_window=AJS.DIV({"id":"GB_window"});
AJS.hideElement(this.g_window);
AJS.getBody().insertBefore(this.g_window,this.overlay.nextSibling);
this.initFrame();
this.initHook();
this.update();
var me=this;
if(this.use_fx){
AJS.fx.fadeIn(this.overlay,{duration:300,to:0.7,onComplete:function(){
me.onShow();
AJS.showElement(me.g_window);
me.startLoading();
}});
}else{
AJS.setOpacity(this.overlay,0.7);
AJS.showElement(this.g_window);
this.onShow();
this.startLoading();
}
AJS.AEV(window,"scroll",_GB_setOverlayDimension);
AJS.AEV(window,"resize",_GB_update);
},removeFrame:function(){
try{
AJS.removeElement(this.iframe);
}
catch(e){
}
this.iframe=null;
},startLoading:function(){
this.iframe.src=this.src_loader+"?s="+this.salt++;
AJS.showElement(this.iframe);
},setOverlayDimension:function(){
var _f=AJS.getWindowSize();
if(AJS.isMozilla()||AJS.isOpera()){
AJS.setWidth(this.overlay,"100%");
}else{
AJS.setWidth(this.overlay,_f.w);
}
var _10=Math.max(AJS.getScrollTop()+_f.h,AJS.getScrollTop()+this.height);
if(_10<AJS.getScrollTop()){
AJS.setHeight(this.overlay,_10);
}else{
AJS.setHeight(this.overlay,AJS.getScrollTop()+_f.h);
}
},initOverlay:function(){
this.overlay=AJS.DIV({"id":"GB_overlay"});
if(this.overlay_click_close){
AJS.AEV(this.overlay,"click",GB_hide);
}
AJS.setOpacity(this.overlay,0);
AJS.getBody().insertBefore(this.overlay,AJS.getBody().firstChild);
},initFrame:function(){
if(!this.iframe){
var d={"name":"GB_frame","class":"GB_frame","frameBorder":0};
this.iframe=AJS.IFRAME(d);
this.middle_cnt=AJS.DIV({"class":"content"},this.iframe);
this.top_cnt=AJS.DIV();
this.bottom_cnt=AJS.DIV();
AJS.ACN(this.g_window,this.top_cnt,this.middle_cnt,this.bottom_cnt);
}
},onHide:function(){
},onShow:function(){
},setFrameSize:function(){
},setWindowPosition:function(){
},initHook:function(){
}});
_GB_update=function(){
if(GB_CURRENT){
GB_CURRENT.update();
}
};
_GB_setOverlayDimension=function(){
if(GB_CURRENT){
GB_CURRENT.setOverlayDimension();
}
};
AJS.preloadImages(GB_ROOT_DIR+"indicator.gif");
script_loaded=true;
var GB_SETS={};
function decoGreyboxLinks(){
var as=AJS.$bytc("a");
AJS.map(as,function(a){
if(a.getAttribute("href")&&a.getAttribute("rel")){
var rel=a.getAttribute("rel");
if(rel.indexOf("gb_")==0){
var _15=rel.match(/\w+/)[0];
var _16=rel.match(/\[(.*)\]/)[1];
var _17=0;
var _18={"caption":a.title||"","url":a.href};
if(_15=="gb_pageset"||_15=="gb_imageset"){
if(!GB_SETS[_16]){
GB_SETS[_16]=[];
}
GB_SETS[_16].push(_18);
_17=GB_SETS[_16].length;
}
if(_15=="gb_pageset"){
a.onclick=function(){
GB_showFullScreenSet(GB_SETS[_16],_17);
return false;
};
}
if(_15=="gb_imageset"){
a.onclick=function(){
GB_showImageSet(GB_SETS[_16],_17);
return false;
};
}
if(_15=="gb_image"){
a.onclick=function(){
GB_showImage(_18.caption,_18.url);
return false;
};
}
if(_15=="gb_page"){
a.onclick=function(){
var sp=_16.split(/, ?/);
GB_show(_18.caption,_18.url,parseInt(sp[1]),parseInt(sp[0]));
return false;
};
}
if(_15=="gb_page_fs"){
a.onclick=function(){
GB_showFullScreen(_18.caption,_18.url);
return false;
};
}
if(_15=="gb_page_center"){
a.onclick=function(){
var sp=_16.split(/, ?/);
GB_showCenter(_18.caption,_18.url,parseInt(sp[1]),parseInt(sp[0]));
return false;
};
}
}
}
});
}
AJS.AEV(window,"load",decoGreyboxLinks);
GB_showImage=function(_1b,url,_1d){
var _1e={width:300,height:300,type:"image",fullscreen:false,center_win:true,caption:_1b,callback_fn:_1d};
var win=new GB_Gallery(_1e);
return win.show(url);
};
GB_showPage=function(_20,url,_22){
var _23={type:"page",caption:_20,callback_fn:_22,fullscreen:true,center_win:false};
var win=new GB_Gallery(_23);
return win.show(url);
};
GB_Gallery=GreyBox.extend({init:function(_25){
this.parent({});
this.img_close=this.root_dir+"g_close.gif";
AJS.update(this,_25);
this.addCallback(this.callback_fn);
},initHook:function(){
AJS.addClass(this.g_window,"GB_Gallery");
var _26=AJS.DIV({"class":"inner"});
this.header=AJS.DIV({"class":"GB_header"},_26);
AJS.setOpacity(this.header,0);
AJS.getBody().insertBefore(this.header,this.overlay.nextSibling);
var _27=AJS.TD({"id":"GB_caption","class":"caption","width":"40%"},this.caption);
var _28=AJS.TD({"id":"GB_middle","class":"middle","width":"20%"});
var _29=AJS.IMG({"src":this.img_close});
AJS.AEV(_29,"click",GB_hide);
var _2a=AJS.TD({"class":"close","width":"40%"},_29);
var _2b=AJS.TBODY(AJS.TR(_27,_28,_2a));
var _2c=AJS.TABLE({"cellspacing":"0","cellpadding":0,"border":0},_2b);
AJS.ACN(_26,_2c);
if(this.fullscreen){
AJS.AEV(window,"scroll",AJS.$b(this.setWindowPosition,this));
}else{
AJS.AEV(window,"scroll",AJS.$b(this._setHeaderPos,this));
}
},setFrameSize:function(){
var _2d=this.overlay.offsetWidth;
var _2e=AJS.getWindowSize();
if(this.fullscreen){
this.width=_2d-40;
this.height=_2e.h-80;
}
AJS.setWidth(this.iframe,this.width);
AJS.setHeight(this.iframe,this.height);
AJS.setWidth(this.header,_2d);
},_setHeaderPos:function(){
AJS.setTop(this.header,AJS.getScrollTop()+10);
},setWindowPosition:function(){
var _2f=this.overlay.offsetWidth;
var _30=AJS.getWindowSize();
AJS.setLeft(this.g_window,((_2f-50-this.width)/2));
var _31=AJS.getScrollTop()+55;
if(!this.center_win){
AJS.setTop(this.g_window,_31);
}else{
var fl=((_30.h-this.height)/2)+20+AJS.getScrollTop();
if(fl<0){
fl=0;
}
if(_31>fl){
fl=_31;
}
AJS.setTop(this.g_window,fl);
}
this._setHeaderPos();
},onHide:function(){
AJS.removeElement(this.header);
AJS.removeClass(this.g_window,"GB_Gallery");
},onShow:function(){
if(this.use_fx){
AJS.fx.fadeIn(this.header,{to:1});
}else{
AJS.setOpacity(this.header,1);
}
}});
AJS.preloadImages(GB_ROOT_DIR+"g_close.gif");
GB_showFullScreenSet=function(set,_34,_35){
var _36={type:"page",fullscreen:true,center_win:false};
var _37=new GB_Sets(_36,set);
_37.addCallback(_35);
_37.showSet(_34-1);
return false;
};
GB_showImageSet=function(set,_39,_3a){
var _3b={type:"image",fullscreen:false,center_win:true,width:300,height:300};
var _3c=new GB_Sets(_3b,set);
_3c.addCallback(_3a);
_3c.showSet(_39-1);
return false;
};
GB_Sets=GB_Gallery.extend({init:function(_3d,set){
this.parent(_3d);
if(!this.img_next){
this.img_next=this.root_dir+"next.gif";
}
if(!this.img_prev){
this.img_prev=this.root_dir+"prev.gif";
}
this.current_set=set;
},showSet:function(_3f){
this.current_index=_3f;
var _40=this.current_set[this.current_index];
this.show(_40.url);
this._setCaption(_40.caption);
this.btn_prev=AJS.IMG({"class":"left",src:this.img_prev});
this.btn_next=AJS.IMG({"class":"right",src:this.img_next});
AJS.AEV(this.btn_prev,"click",AJS.$b(this.switchPrev,this));
AJS.AEV(this.btn_next,"click",AJS.$b(this.switchNext,this));
GB_STATUS=AJS.SPAN({"class":"GB_navStatus"});
AJS.ACN(AJS.$("GB_middle"),this.btn_prev,GB_STATUS,this.btn_next);
this.updateStatus();
},updateStatus:function(){
AJS.setHTML(GB_STATUS,(this.current_index+1)+" / "+this.current_set.length);
if(this.current_index==0){
AJS.addClass(this.btn_prev,"disabled");
}else{
AJS.removeClass(this.btn_prev,"disabled");
}
if(this.current_index==this.current_set.length-1){
AJS.addClass(this.btn_next,"disabled");
}else{
AJS.removeClass(this.btn_next,"disabled");
}
},_setCaption:function(_41){
AJS.setHTML(AJS.$("GB_caption"),_41);
},updateFrame:function(){
var _42=this.current_set[this.current_index];
this._setCaption(_42.caption);
this.url=_42.url;
this.startLoading();
},switchPrev:function(){
if(this.current_index!=0){
this.current_index--;
this.updateFrame();
this.updateStatus();
}
},switchNext:function(){
if(this.current_index!=this.current_set.length-1){
this.current_index++;
this.updateFrame();
this.updateStatus();
}
}});
AJS.AEV(window,"load",function(){
AJS.preloadImages(GB_ROOT_DIR+"next.gif",GB_ROOT_DIR+"prev.gif");
});
GB_show=function(_43,url,_45,_46,_47){
var _48={caption:_43,height:_45||500,width:_46||500,fullscreen:false,callback_fn:_47};
var win=new GB_Window(_48);
return win.show(url);
};
GB_showCenter=function(_4a,url,_4c,_4d,_4e){
var _4f={caption:_4a,center_win:true,height:_4c||500,width:_4d||500,fullscreen:false,callback_fn:_4e};
var win=new GB_Window(_4f);
return win.show(url);
};
GB_showFullScreen=function(_51,url,_53){
var _54={caption:_51,fullscreen:true,callback_fn:_53};
var win=new GB_Window(_54);
return win.show(url);
};
GB_Window=GreyBox.extend({init:function(_56){
this.parent({});
this.img_header=this.root_dir+"header_bg.gif";
this.img_close=this.root_dir+"w_close.gif";
this.show_close_img=true;
AJS.update(this,_56);
this.addCallback(this.callback_fn);
},initHook:function(){
AJS.addClass(this.g_window,"GB_Window");
this.header=AJS.TABLE({"class":"header"});
this.header.style.backgroundImage="url("+this.img_header+")";
var _57=AJS.TD({"class":"caption"},this.caption);
var _58=AJS.TD({"class":"close"});
if(this.show_close_img){
var _59=AJS.IMG({"src":this.img_close});
var _5a=AJS.SPAN("Close");
var btn=AJS.DIV(_59,_5a);
AJS.AEV([_59,_5a],"mouseover",function(){
AJS.addClass(_5a,"on");
});
AJS.AEV([_59,_5a],"mouseout",function(){
AJS.removeClass(_5a,"on");
});
AJS.AEV([_59,_5a],"mousedown",function(){
AJS.addClass(_5a,"click");
});
AJS.AEV([_59,_5a],"mouseup",function(){
AJS.removeClass(_5a,"click");
});
AJS.AEV([_59,_5a],"click",GB_hide);
AJS.ACN(_58,btn);
}
tbody_header=AJS.TBODY();
AJS.ACN(tbody_header,AJS.TR(_57,_58));
AJS.ACN(this.header,tbody_header);
AJS.ACN(this.top_cnt,this.header);
if(this.fullscreen){
AJS.AEV(window,"scroll",AJS.$b(this.setWindowPosition,this));
}
},setFrameSize:function(){
if(this.fullscreen){
var _5c=AJS.getWindowSize();
overlay_h=_5c.h;
this.width=Math.round(this.overlay.offsetWidth-(this.overlay.offsetWidth/100)*10);
this.height=Math.round(overlay_h-(overlay_h/100)*10);
}
AJS.setWidth(this.header,this.width+6);
AJS.setWidth(this.iframe,this.width);
AJS.setHeight(this.iframe,this.height);
},setWindowPosition:function(){
var _5d=AJS.getWindowSize();
AJS.setLeft(this.g_window,((_5d.w-this.width)/2)-13);
if(!this.center_win){
AJS.setTop(this.g_window,AJS.getScrollTop());
}else{
var fl=((_5d.h-this.height)/2)-20+AJS.getScrollTop();
if(fl<0){
fl=0;
}
AJS.setTop(this.g_window,fl);
}
}});
AJS.preloadImages(GB_ROOT_DIR+"w_close.gif",GB_ROOT_DIR+"header_bg.gif");


script_loaded=true;