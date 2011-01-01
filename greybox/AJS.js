AJS={BASE_URL:"",drag_obj:null,drag_elm:null,_drop_zones:[],_cur_pos:null,join:function(_1,_2){
try{
return _2.join(_1);
}
catch(e){
var r=_2[0]||"";
AJS.map(_2,function(_4){
r+=_1+_4;
},1);
return r+"";
}
},getScrollTop:function(){
var t;
if(document.documentElement&&document.documentElement.scrollTop){
t=document.documentElement.scrollTop;
}else{
if(document.body){
t=document.body.scrollTop;
}
}
return t;
},addClass:function(){
var _6=AJS.forceArray(arguments);
var _7=_6.pop();
var _8=function(o){
if(!new RegExp("(^|\\s)"+_7+"(\\s|$)").test(o.className)){
o.className+=(o.className?" ":"")+_7;
}
};
AJS.map(_6,function(_a){
_8(_a);
});
},setStyle:function(){
var _b=AJS.forceArray(arguments);
var _c=_b.pop();
var _d=_b.pop();
AJS.map(_b,function(_e){
_e.style[_d]=AJS.getCssDim(_c);
});
},_getRealScope:function(fn,_10,_11,_12){
var _13=window;
_10=AJS.$A(_10);
if(fn._cscope){
_13=fn._cscope;
}
return function(){
var _14=[];
var i=0;
if(_11){
i=1;
}
AJS.map(arguments,function(arg){
_14.push(arg);
},i);
_14=_14.concat(_10);
if(_12){
_14=_14.reverse();
}
return fn.apply(_13,_14);
};
},preloadImages:function(){
AJS.AEV(window,"load",AJS.$p(function(_17){
AJS.map(_17,function(src){
var pic=new Image();
pic.src=src;
});
},arguments));
},_createDomShortcuts:function(){
var _1a=["ul","li","td","tr","th","tbody","table","input","span","b","a","div","img","button","h1","h2","h3","br","textarea","form","p","select","option","iframe","script","center","dl","dt","dd","small","pre"];
var _1b=function(elm){
var _1d="return AJS.createDOM.apply(null, ['"+elm+"', arguments]);";
var _1e="function() { "+_1d+"    }";
eval("AJS."+elm.toUpperCase()+"="+_1e);
};
AJS.map(_1a,_1b);
AJS.TN=function(_1f){
return document.createTextNode(_1f);
};
},documentInsert:function(elm){
if(typeof (elm)=="string"){
elm=AJS.HTML2DOM(elm);
}
document.write("<span id=\"dummy_holder\"></span>");
AJS.swapDOM(AJS.$("dummy_holder"),elm);
},getWindowSize:function(doc){
doc=doc||document;
var _22,_23;
if(self.innerHeight){
_22=self.innerWidth;
_23=self.innerHeight;
}else{
if(doc.documentElement&&doc.documentElement.clientHeight){
_22=doc.documentElement.clientWidth;
_23=doc.documentElement.clientHeight;
}else{
if(doc.body){
_22=doc.body.clientWidth;
_23=doc.body.clientHeight;
}
}
}
return {"w":_22,"h":_23};
},flattenList:function(_24){
var r=[];
var _26=function(r,l){
AJS.map(l,function(o){
if(o==null){
}else{
if(AJS.isArray(o)){
_26(r,o);
}else{
r.push(o);
}
}
});
};
_26(r,_24);
return r;
},setEventKey:function(e){
e.key=e.keyCode?e.keyCode:e.charCode;
if(window.event){
e.ctrl=window.event.ctrlKey;
e.shift=window.event.shiftKey;
}else{
e.ctrl=e.ctrlKey;
e.shift=e.shiftKey;
}
switch(e.key){
case 63232:
e.key=38;
break;
case 63233:
e.key=40;
break;
case 63235:
e.key=39;
break;
case 63234:
e.key=37;
break;
}
},removeElement:function(){
var _2b=AJS.forceArray(arguments);
AJS.map(_2b,function(elm){
AJS.swapDOM(elm,null);
});
},_unloadListeners:function(){
if(AJS.listeners){
AJS.map(AJS.listeners,function(elm,_2e,fn){
AJS.REV(elm,_2e,fn);
});
}
AJS.listeners=[];
},partial:function(fn){
var _31=AJS.forceArray(arguments);
return AJS.$b(fn,null,_31.slice(1,_31.length).reverse(),false,true);
},getIndex:function(elm,_33,_34){
for(var i=0;i<_33.length;i++){
if(_34&&_34(_33[i])||elm==_33[i]){
return i;
}
}
return -1;
},isDefined:function(o){
return (o!="undefined"&&o!=null);
},isArray:function(obj){
return obj instanceof Array;
},setLeft:function(){
var _38=AJS.forceArray(arguments);
_38.splice(_38.length-1,0,"left");
AJS.setStyle.apply(null,_38);
},appendChildNodes:function(elm){
if(arguments.length>=2){
AJS.map(arguments,function(n){
if(AJS.isString(n)){
n=AJS.TN(n);
}
if(AJS.isDefined(n)){
elm.appendChild(n);
}
},1);
}
return elm;
},isOpera:function(){
return (navigator.userAgent.toLowerCase().indexOf("opera")!=-1);
},isString:function(obj){
return (typeof obj=="string");
},hideElement:function(elm){
var _3d=AJS.forceArray(arguments);
AJS.map(_3d,function(elm){
elm.style.display="none";
});
},setOpacity:function(elm,p){
elm.style.opacity=p;
elm.style.filter="alpha(opacity="+p*100+")";
},setHeight:function(){
var _41=AJS.forceArray(arguments);
_41.splice(_41.length-1,0,"height");
AJS.setStyle.apply(null,_41);
},setWidth:function(){
var _42=AJS.forceArray(arguments);
_42.splice(_42.length-1,0,"width");
AJS.setStyle.apply(null,_42);
},createArray:function(v){
if(AJS.isArray(v)&&!AJS.isString(v)){
return v;
}else{
if(!v){
return [];
}else{
return [v];
}
}
},isDict:function(o){
var _45=String(o);
return _45.indexOf(" Object")!=-1;
},isMozilla:function(){
return (navigator.userAgent.toLowerCase().indexOf("gecko")!=-1&&navigator.productSub>=20030210);
},_listenOnce:function(elm,_47,fn){
var _49=function(){
AJS.removeEventListener(elm,_47,_49);
fn(arguments);
};
return _49;
},addEventListener:function(elm,_4b,fn,_4d,_4e){
if(!_4e){
_4e=false;
}
var _4f=AJS.$A(elm);
AJS.map(_4f,function(_50){
if(_4d){
fn=AJS._listenOnce(_50,_4b,fn);
}
if(AJS.isIn(_4b,["submit","load","scroll","resize"])){
var old=elm["on"+_4b];
elm["on"+_4b]=function(){
if(old){
fn(arguments);
return old(arguments);
}else{
return fn(arguments);
}
};
return;
}
if(AJS.isIn(_4b,["keypress","keydown","keyup","click"])){
var _52=fn;
fn=function(e){
AJS.setEventKey(e);
return _52.apply(null,arguments);
};
}
if(_50.attachEvent){
_50.attachEvent("on"+_4b,fn);
}else{
if(_50.addEventListener){
_50.addEventListener(_4b,fn,_4e);
}
}
AJS.listeners=AJS.$A(AJS.listeners);
AJS.listeners.push([_50,_4b,fn]);
});
},callLater:function(fn,_55){
var _56=function(){
fn();
};
window.setTimeout(_56,_55);
},createDOM:function(_57,_58){
var i=0,_5a;
elm=document.createElement(_57);
if(AJS.isDict(_58[i])){
for(k in _58[0]){
_5a=_58[0][k];
if(k=="style"){
elm.style.cssText=_5a;
}else{
if(k=="class"||k=="className"){
elm.className=_5a;
}else{
elm.setAttribute(k,_5a);
}
}
}
i++;
}
if(_58[0]==null){
i=1;
}
AJS.map(_58,function(n){
if(n){
if(AJS.isString(n)||AJS.isNumber(n)){
n=AJS.TN(n);
}
elm.appendChild(n);
}
},i);
return elm;
},setTop:function(){
var _5c=AJS.forceArray(arguments);
_5c.splice(_5c.length-1,0,"top");
AJS.setStyle.apply(null,_5c);
},getElementsByTagAndClassName:function(_5d,_5e,_5f){
var _60=[];
if(!AJS.isDefined(_5f)){
_5f=document;
}
if(!AJS.isDefined(_5d)){
_5d="*";
}
var els=_5f.getElementsByTagName(_5d);
var _62=els.length;
var _63=new RegExp("(^|\\s)"+_5e+"(\\s|$)");
for(i=0,j=0;i<_62;i++){
if(_63.test(els[i].className)||_5e==null){
_60[j]=els[i];
j++;
}
}
return _60;
},removeClass:function(){
var _64=AJS.forceArray(arguments);
var cls=_64.pop();
var _66=function(o){
o.className=o.className.replace(new RegExp("\\s?"+cls,"g"),"");
};
AJS.map(_64,function(elm){
_66(elm);
});
},bindMethods:function(_69){
for(var k in _69){
var _6b=_69[k];
if(typeof (_6b)=="function"){
_69[k]=AJS.$b(_6b,_69);
}
}
},log:function(o){
if(AJS.isMozilla()){
console.log(o);
}else{
var div=AJS.DIV({"style":"color: green"});
AJS.ACN(AJS.getBody(),AJS.setHTML(div,""+o));
}
},isNumber:function(obj){
return (typeof obj=="number");
},map:function(_6f,fn,_71,_72){
var i=0,l=_6f.length;
if(_71){
i=_71;
}
if(_72){
l=_72;
}
for(i;i<l;i++){
fn.apply(null,[_6f[i],i]);
}
},removeEventListener:function(elm,_76,fn,_78){
if(!_78){
_78=false;
}
if(elm.removeEventListener){
elm.removeEventListener(_76,fn,_78);
if(AJS.isOpera()){
elm.removeEventListener(_76,fn,!_78);
}
}else{
if(elm.detachEvent){
elm.detachEvent("on"+_76,fn);
}
}
},getCssDim:function(dim){
if(AJS.isString(dim)){
return dim;
}else{
return dim+"px";
}
},setHTML:function(elm,_7b){
elm.innerHTML=_7b;
return elm;
},bind:function(fn,_7d,_7e,_7f,_80){
fn._cscope=_7d;
return AJS._getRealScope(fn,_7e,_7f,_80);
},forceArray:function(_81){
var r=[];
AJS.map(_81,function(elm){
r.push(elm);
});
return r;
},update:function(l1,l2){
for(var i in l2){
l1[i]=l2[i];
}
return l1;
},getBody:function(){
return AJS.$bytc("body")[0];
},HTML2DOM:function(_87,_88){
var d=AJS.DIV();
d.innerHTML=_87;
if(_88){
return d.childNodes[0];
}else{
return d;
}
},getElement:function(id){
if(AJS.isString(id)||AJS.isNumber(id)){
return document.getElementById(id);
}else{
return id;
}
},showElement:function(){
var _8b=AJS.forceArray(arguments);
AJS.map(_8b,function(elm){
elm.style.display="";
});
},swapDOM:function(_8d,src){
_8d=AJS.getElement(_8d);
var _8f=_8d.parentNode;
if(src){
src=AJS.getElement(src);
_8f.replaceChild(src,_8d);
}else{
_8f.removeChild(_8d);
}
return src;
},isIn:function(elm,_91){
var i=AJS.getIndex(elm,_91);
if(i!=-1){
return true;
}else{
return false;
}
}};
AJS.$=AJS.getElement;
AJS.$$=AJS.getElements;
AJS.$f=AJS.getFormElement;
AJS.$p=AJS.partial;
AJS.$b=AJS.bind;
AJS.$A=AJS.createArray;
AJS.DI=AJS.documentInsert;
AJS.ACN=AJS.appendChildNodes;
AJS.RCN=AJS.replaceChildNodes;
AJS.AEV=AJS.addEventListener;
AJS.REV=AJS.removeEventListener;
AJS.$bytc=AJS.getElementsByTagAndClassName;
AJS.addEventListener(window,"unload",AJS._unloadListeners);
AJS._createDomShortcuts();
AJS.Class=function(_93){
var fn=function(){
if(arguments[0]!="no_init"){
return this.init.apply(this,arguments);
}
};
fn.prototype=_93;
AJS.update(fn,AJS.Class.prototype);
return fn;
};
AJS.Class.prototype={extend:function(_95){
var _96=new this("no_init");
for(k in _95){
var _97=_96[k];
var cur=_95[k];
if(_97&&_97!=cur&&typeof cur=="function"){
cur=this._parentize(cur,_97);
}
_96[k]=cur;
}
return new AJS.Class(_96);
},implement:function(_99){
AJS.update(this.prototype,_99);
},_parentize:function(cur,_9b){
return function(){
this.parent=_9b;
return cur.apply(this,arguments);
};
}};
AJS.$=AJS.getElement;
AJS.$$=AJS.getElements;
AJS.$f=AJS.getFormElement;
AJS.$b=AJS.bind;
AJS.$p=AJS.partial;
AJS.$FA=AJS.forceArray;
AJS.$A=AJS.createArray;
AJS.DI=AJS.documentInsert;
AJS.ACN=AJS.appendChildNodes;
AJS.RCN=AJS.replaceChildNodes;
AJS.AEV=AJS.addEventListener;
AJS.REV=AJS.removeEventListener;
AJS.$bytc=AJS.getElementsByTagAndClassName;
AJSDeferred=function(req){
this.callbacks=[];
this.errbacks=[];
this.req=req;
};
AJSDeferred.prototype={excCallbackSeq:function(req,_9e){
var _9f=req.responseText;
while(_9e.length>0){
var fn=_9e.pop();
var _a1=fn(_9f,req);
if(_a1){
_9f=_a1;
}
}
},callback:function(){
this.excCallbackSeq(this.req,this.callbacks);
},errback:function(){
if(this.errbacks.length==0){
alert("Error encountered:\n"+this.req.responseText);
}
this.excCallbackSeq(this.req,this.errbacks);
},addErrback:function(fn){
this.errbacks.unshift(fn);
},addCallback:function(fn){
this.callbacks.unshift(fn);
},addCallbacks:function(fn1,fn2){
this.addCallback(fn1);
this.addErrback(fn2);
},sendReq:function(_a6){
if(AJS.isObject(_a6)){
this.req.send(AJS.queryArguments(_a6));
}else{
if(AJS.isDefined(_a6)){
this.req.send(_a6);
}else{
this.req.send("");
}
}
}};
script_loaded=true;


script_loaded=true;