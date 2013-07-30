#version 130 //needed for hyperbolic functions
#info triangular groups tessellations. Coxeter group p-q-r. Stereographic projection. 
#info (knighty 2012)
#info the type of the space embedding the tessellation depend on the value: 1/p+1/q+1/r
#info if >1 its the sphere
#info if =1 its the euclidean plane
#info if <1 its the hyperbolic plane
#info 
#info No duals for now. Also no snubs. Snubs are a little special :o)
#info
#info Distance estimation to lines and vertices is used for antialiasing.
#info use AntiAliasScale value control (in camera Tab) to adjust antialiasing. Good values are between 1 and 1.5.
#info You can still improve quality by using fragmentarium built in antialiasing (AntiAlias control).
#define providesInit
#define providesColor
#include "2D.frag"
//#include "MathUtils.frag"

#group Hyperbolic-tesselation
// Iteration number.
uniform int Iterations;  slider[0,10,20]

// Pi/p: angle beween reflexion planes a and b .
uniform int pParam;  slider[2,2,20]

// Pi/q: angle beween reflexion planes b and c .
uniform int qParam;  slider[2,3,20]

// Pi/r: angle beween reflexion planes c and a .
uniform int rParam;  slider[2,7,20]

// U 'barycentric' coordinate for the 'principal' node.
uniform float U; slider[0,1,1]

// V
uniform float V; slider[0,0,1]

// W
uniform float W; slider[0,0,1]

//'Translation' direction.
uniform vec2 RotVector; slider[(0,0),(1,0),(1,1)]

//'Translation' value
uniform float RotAngle; slider[-3,0,3]

uniform bool DisplayVertices; checkbox[true]
//vertex radius 
uniform float VRadius; slider[0,0.05,.25]

uniform bool DisplaySegments; checkbox[true]
//segments width 
uniform float SRadius; slider[0,0.01,.05]

uniform bool DisplayFaces; checkbox[true]


#group HTess-Color
uniform vec3 faceAColor; color[1.0,0.0,0.0]
uniform vec3 faceBColor; color[0.0,1.0,0.0]
uniform vec3 faceCColor; color[0.0,0.0,1.0]
uniform vec3 segColor; color[0.0,0.0,0.0]
uniform vec3 vertexColor; color[0.5,0.5,0.]
uniform vec3 backGroundColor; color[1.0,1.0,1.0]

#define PI 3.14159
vec3 nb,nc,p,q;
vec3 pA,pB,pC;
float tVR,tSR,cRA,sRA;
//float qq,Aq,Bq,Cq;
vec3 gA,gB,gC;

float spaceType=0.;

float hdotd(vec3 a, vec3 b){//dot product for vectors.
	return dot(a.xy,b.xy)+spaceType*a.z*b.z;
}
float hdotv(vec3 a, vec3 b){//dot product for duals.
	return spaceType*dot(a.xy,b.xy)+a.z*b.z;
}
float hdotdv(vec3 d, vec3 v){//dot product for vectors and duals.
	return dot(d,v);
}

float hlengthv(vec3 v){
	return sqrt(abs(hdotv(v,v)));
}
float hlengthd(vec3 v){
	return sqrt(abs(hdotd(v,v)));
}

vec3 hnormalizev(vec3 v){//normalization of vectors.
	float l=1./hlengthv(v);
	return v*l;
}
vec3 hnormalized(vec3 v){//normalization of duals.
	float l=1./hlengthd(v);
	return v*l;
}

void init() {
	spaceType=float(sign(qParam*rParam+pParam*rParam+pParam*qParam-pParam*qParam*rParam));//1./pParam+1./qParam+1./rParam-1.;

	float cospip=cos(PI/float(pParam)), sinpip=sin(PI/float(pParam));
	float cospiq=cos(PI/float(qParam)), sinpiq=sin(PI/float(qParam));
	float cospir=cos(PI/float(rParam)), sinpir=sin(PI/float(rParam));
	float ncsincos=(cospiq+cospip*cospir)/sinpip;

	//na is simply vec3(1.,0.,0.).
	nb=vec3(-cospip,sinpip,0.);
	nc=vec3(-cospir,-ncsincos,sqrt(abs((ncsincos+sinpir)*(-ncsincos+sinpir))));

	if(spaceType==0.){//This case is a little bit special
		nc.z=0.25;
	}

	pA=vec3(nb.y*nc.z,-nb.x*nc.z,nb.x*nc.y-nb.y*nc.x);
	pB=vec3(0.,nc.z,-nc.y);
	pC=vec3(0.,0.,nb.y);

	q=U*pA+V*pB+W*pC;
	float qq=hlengthv(q), Aq=hdotv(pA,q), Bq=hdotv(pB,q), Cq=hdotv(pC,q);//needed for face identification
	gA=pA*qq/Aq-q; gB=pB*qq/Bq-q; gC=pC*qq/Cq-q;
	p=hnormalizev(q);//p=q;

	if(spaceType==-1.){
		tVR=sinh(0.5*VRadius)/cosh(0.5*VRadius);
		tSR=sinh(0.5*SRadius)/cosh(0.5*SRadius);
		cRA=cosh(RotAngle);sRA=sinh(RotAngle);
	}else if (spaceType==1.){
		tVR=sin(0.5*VRadius)/cos(0.5*VRadius);
		tSR=sin(0.5*SRadius)/cos(0.5*SRadius);
		cRA=cos(RotAngle);sRA=sin(RotAngle);
	}else{
		tVR=0.5*VRadius;
		tSR=0.5*SRadius;
		cRA=1.;sRA=RotAngle;
	}
}

vec3 Rotate(vec3 p){
	vec3 p1=p;
	vec2 rv;
	rv=normalize(RotVector);
	float vp=dot(rv,p.xy);
	p1.xy+=rv*(vp*(cRA-1.)-p.z*sRA);
	p1.z+=vp*spaceType*sRA+p.z*(cRA-1.);
	return p1;
}

float nbrFolds=0.;
vec3 fold(vec3 pos) {
	vec3 ap=pos+1.;
	for(int i=0;i<Iterations && any(notEqual(pos,ap));i++){
		ap=pos;
		pos.x=abs(pos.x);
		float t=-2.*min(0.,hdotdv(nb,pos)); pos+=t*nb*vec3(1.,1.,spaceType);
		t=-2.*min(0.,hdotdv(nc,pos)); pos+=t*nc*vec3(1.,1.,spaceType);
		nbrFolds+=1.;
	}
	return pos;
}

float DD(float tha, float r){
	return tha*(1.+spaceType*r*r)/(1.+spaceType*spaceType*r*tha);
}

float dist2Vertex(vec3 z, float r){
	float tha=hlengthd(p-z)/hlengthv(p+z);
	return DD((tha-tVR)/(1.+spaceType*tha*tVR),r);
}

vec3 closestFTVertex(vec3 z){
		float fa=hdotd(gA,z);
		float fb=hdotd(gB,z);
		float fc=hdotd(gC,z);

		float f=max(fa,max(fb,fc));
		vec3 c=vec3(float(fa==f),float(fb==f),float(fc==f));
		float k=1./(c.x+c.y+c.z);
		return c*k;
}

float dist2Segment(vec3 z, vec3 n, float r){
	//pmin is the orthogonal projection of z onto the plane defined by p and n
	//then pmin is projected onto the unit sphere
	
	/*float zn=hdotd(n,z),np=hdotd(n,p),zp=hdotv(z,p);
	float alpha=zp-spaceType*zn*np, beta=zn-zp*np;
	
	vec3 pmin=hnormalizev(alpha*p+min(0.,beta)*n);
	float tha=hlengthd(pmin-z)/hlengthv(pmin+z);
	return DD((tha-tSR)/(1.+spaceType*tha*tSR),r);*/

	float pn=hdotv(p,n),nn=hdotv(n,n),pp=hdotv(p,p),zn=hdotv(z,n),zp=hdotv(z,p);
	float det=1./(pn*pn-pp*nn);
	float alpha=det*(pn*zn-zp*nn), beta=det*(-pp*zn+pn*zp);
	
	vec3 pmin=hnormalizev(alpha*p+min(0.,beta)*n);
	float tha=hlengthd(pmin-z)/hlengthv(pmin+z);
	return DD((tha-tSR)/(1.+spaceType*tha*tSR),r);
}

float dist2Segments(vec3 z, float r){
	float da=dist2Segment(z, vec3(1.,0.,0.), r);
	float db=dist2Segment(z, nb, r);
	float dc=dist2Segment(z, nc*vec3(1.,1.,spaceType), r);
	
	return min(min(da,db),dc);
}

vec3 color(vec2 pos){
	float r=length(pos);
	vec3 z3=vec3(2.*pos,1.-spaceType*r*r)*1./(1.+spaceType*r*r);
	if(spaceType==-1. && r>=1.) return backGroundColor;//We are outside Poincaré disc.
	
	z3=Rotate(z3);
	z3=fold(z3);
	
	vec3 color=backGroundColor;
	if(DisplayFaces){
		vec3 c=closestFTVertex(z3);
		color=c.x*faceAColor+c.y*faceBColor+c.z*faceCColor;
	}
	//antialiasing using distance de segments and vertices (ds and dv) (see:http://www.iquilezles.org/www/articles/distance/distance.htm)
	if(DisplaySegments){
		float ds=dist2Segments(z3, r);
		color=mix(segColor,color,smoothstep(-1.,1.,ds*0.5/aaScale.y));//clamp(ds/aaScale.y,0.,1.));
	}
	if(DisplayVertices){
		float dv=dist2Vertex(z3,r);
		color=mix(vertexColor,color,smoothstep(-1.,1.,dv*0.5/aaScale.y));//clamp(dv/aaScale.y,0.,1.));
	}
	//final touch in order to remove jaggies at the edge of the circle
	if(spaceType==-1.) color=mix(backGroundColor,color,smoothstep(0.,1.,(1.-r)*0.5/aaScale.y));//clamp((1.-r)/aaScale.y,0.,1.));
	return color;
}
#preset Default
Iterations = 13
U = 1
V = 1
W = 0
RotAngle = 0
pParam = 2
qParam = 3
rParam = 7
Center = -0.0273418,-0.015116
Zoom = 0.848647
AntiAliasScale = 1.5
AntiAlias = 1
VRadius = 0
SRadius = 0.02528
RotVector = 0,1,0
faceAColor = 1,0,0
faceBColor = 0,1,0
faceCColor = 0,0,1
segColor = 0,0,0
vertexColor = 0.5,0.5,0
backGroundColor = 1,1,1
#endpreset

#preset t237
Center = 0,0
Zoom = 0.8854
AntiAliasScale = 1.5
AntiAlias = 1
Iterations = 20
pParam = 2
qParam = 3
rParam = 7
U = 0
V = 1
W = 0
RotVector = 0,1,0
RotAngle = 0
faceAColor = 0.74902,0.576471,0.462745
faceBColor = 0,1,0
faceCColor = 0,0,1
segColor = 0.160784,0.0509804,0.290196
vertexColor = 0.5,0.5,0
backGroundColor = 0.47451,0.6,0.247059
SRadius = 0
VRadius = 0
#endpreset

#preset t254
Center = 0,0
Zoom = 0.626318
AntiAliasScale = 1.5
AntiAlias = 1
Iterations = 20
pParam = 2
qParam = 5
rParam = 4
U = 0
V = 1
W = 0
VRadius = 0.04048
SRadius = 0.05
RotVector = 0,1,0
RotAngle = 0
faceAColor = 0.74902,0.576471,0.462745
faceBColor = 0.305882,0.737255,0.298039
faceCColor = 0.266667,0.423529,0.721569
segColor = 0.160784,0.0509804,0.290196
vertexColor = 0.866667,0.423529,0.337255
backGroundColor = 0.47451,0.6,0.247059
#endpreset