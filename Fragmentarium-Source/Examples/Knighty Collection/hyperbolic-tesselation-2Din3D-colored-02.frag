#version 130
#info 2D hyperbolic tessellation. Coxeter group p-q-r. Poincaré ball model. Distance Estimator (knighty 2012)
#info 1/p+1/q+1/r must be less than 1. Otherwise results are undefined.
#define providesInit
#define providesColor
#include "DE-Raytracer-v0.9.1.frag"
#include "MathUtils.frag"

#group Hyperbolic-tesselation
// Iteration number.
uniform int Iterations;  slider[0,10,20]

// Pi/p: angle beween reflexion planes a and b .
uniform int pParam;  slider[2,2,20]

// Pi/q: angle beween reflexion planes b and c .
uniform int qParam;  slider[2,3,20]

// Pi/r: angle beween reflexion planes c and a .
uniform int rParam;  slider[2,7,20]

// U 'barycentric' coordinate for the 'principal' node
uniform float U; slider[0,1,1]

// V
uniform float V; slider[0,0,1]

// W
uniform float W; slider[0,0,1]

//vertex radius 
uniform float VRadius; slider[0,0.05,1.]

//segments radius 
uniform float SRadius; slider[0,0.01,1.]

//If you want to have thickness of vetices and segments not affected by the stereographic projection
uniform bool useUniformRadius; checkbox[false]

uniform vec2 RotVector; slider[(0,0),(0,1),(1,1)]

uniform float RotAngle; slider[-1,0,1]

//cutting sphere radius
uniform float CSphRad; slider[0,0.75,1]

#group HTess-Color
uniform vec3 segAColor; color[0.0,0.0,0.0]
uniform vec3 segBColor; color[0.0,0.0,0.0]
uniform vec3 segCColor; color[0.0,0.0,0.0]
uniform vec3 verticesColor; color[0.0,0.0,0.0]

#define PI 3.14159
vec4 nb,nc,p;
float tVR,tSR,cRA,sRA;
float hdot(vec4 a, vec4 b){//dot product for Minkowski space.
	return dot(a.xyz,b.xyz)-a.w*b.w;
}
vec4 hnormalizew(vec4 v){//normalization of (timelike) vectors in Minkowski space.
	float l=1./sqrt(v.w*v.w-dot(v.xyz,v.xyz));
	return v*l;
}
float hlength(vec4 v){
	return sqrt(abs(hdot(v,v)));
}
void init() {
	float cospip=cos(PI/pParam), sinpip=sin(PI/pParam);
	float cospiq=cos(PI/qParam), sinpiq=sin(PI/qParam);
	float cospir=cos(PI/rParam), sinpir=sin(PI/rParam);
	float ncsincos=(cospiq+cospip*cospir)/sinpip;

	//na is simply vec4(1.,0.,0.,0.).
	nb=vec4(-cospip,sinpip,0.,0.);
	nc=vec4(-cospir,-ncsincos,0.,-sqrt((ncsincos+sinpir)*(ncsincos-sinpir)));

	vec4 pA,pB,pC;
	pA=vec4(-nb.y*nc.w,nb.x*nc.w,0.,nb.x*nc.y-nb.y*nc.x);
	pB=vec4(0.,-nc.w,0.,-nc.y);
	pC=vec4(0.,0.,0.,nb.y);
	
	p=hnormalizew(U*pA+V*pB+W*pC);

	tVR=sinh(0.5*VRadius)/cosh(0.5*VRadius);
	tSR=sinh(0.5*SRadius)/cosh(0.5*SRadius);
	cRA=cosh(RotAngle);sRA=-sinh(RotAngle);
}
uniform vec3 Eye; //slider[(-50,-50,-50),(0,0,-10),(50,50,50)] NotLockable
uniform vec3 Target; //slider[(-50,-50,-50),(0,0,0),(50,50,50)] NotLockable
vec4 Rotate(vec4 p){
	//this is a (hyperbolic) rotation (that is, a boost) on the plane defined by RotVector and w axis
	//We do not need more because the remaining 3 rotation are in our 3D space
	//That would be redundant.
	//This rotation is equivalent to a translation inside the hyperbolic space when the camera is at 0,0,0
	vec4 p1=p;
	vec3 rv;
	rv=normalize(vec3(RotVector,0.));
	float vp=dot(rv,p.xyz);
	p1.xyz+=rv*(vp*(cRA-1.)+p.w*sRA);
	p1.w+=vp*sRA+p.w*(cRA-1.);
	return p1;
}

vec4 fold(vec4 pos) {//beside using minkowski dot product, its exactly the same as for euclidean space
	vec4 ap=pos+1.;
	for(int i=0;i<Iterations && any(notEqual(pos,ap));i++){
		ap=pos;
		pos.x=abs(pos.x);
		float t=-2.*min(0.,hdot(pos,nb)); pos+=t*nb;
		t=-2.*min(0.,hdot(pos,nc)); pos+=t*nc;
	}
	return pos;
}

float DD(float tha, float r){//converts hyperbolic distance to distance in projection flat space. tha is the hyperbolic tangent of half  the hyperbolic distance which is an "angle".
	return tha*(1-r*r)/(1+r*tha);
}

float dist2Vertex(vec4 z, float r){
	float tha=hlength(p-z)/hlength(p+z);
	if(useUniformRadius) return DD(tha,r)-VRadius;
	else return DD((tha-tVR)/(1-tha*tVR),r);
}

float dist2Segment(vec4 z, vec4 n, float r){
	//pmin is the orthogonal projection of z onto the plane defined by p and n
	//then pmin is projected onto the unit sphere
	float zn=hdot(z,n),zp=hdot(z,p),np=hdot(n,p);
	float det=-1./(1.+np*np);
	float alpha=det*(zp-zn*np), beta=det*(-np*zp-zn);
	vec4 pmin=hnormalizew(alpha*p+min(0.,beta)*n);
	float tha=hlength(pmin-z)/hlength(pmin+z);
	if(useUniformRadius) return DD(tha,r)-SRadius;
	else return DD((tha-tSR)/(1-tha*tSR),r);
}
//it is possible to compute the distance to a face just as for segments: pmin will be the orthogonal projection
// of z onto the 3-plane defined by p and two n's (na and nb, na and nc, na and and, nb and nd... and so on).
//that involves solving a system of 3 linear equations.
//it's not implemented here because it is better with transparency

float dist2Segments(vec4 z, float r){
	float da=dist2Segment(z, vec4(1.,0.,0.,0.), r);
	float db=dist2Segment(z, nb, r);
	float dc=dist2Segment(z, nc, r);
	
	return min(min(da,db),dc);
}
float BVolume(vec3 pos){
	pos.z=abs(pos.z)+1.;
	return length(pos)-sqrt(2.);
}
float DE(vec3 pos) {
	//return BVolume(pos);
	float r=length(pos);
	vec4 z4=vec4(2.*pos,1.+r*r)*1./(1.-r*r);//Inverse stereographic projection of pos: z4 lies onto the unit 3-parabolid of revolution around w axis centered at 0.
	z4=Rotate(z4);
	z4=fold(z4);
	orbitTrap=z4;
	return max(BVolume(pos),min(dist2Vertex(z4,r),dist2Segments(z4, r)));
}

vec3 color(vec3 pos, vec3 normal){
	float r=length(pos);
	vec4 z4=vec4(2.*pos,1.+r*r)*1./(1.-r*r);
	z4=Rotate(z4);
	z4=fold(z4);
	float da=dist2Segment(z4, vec4(1.,0.,0.,0.), r);
	float db=dist2Segment(z4, nb, r);
	float dc=dist2Segment(z4, nc, r);
	float dv=dist2Vertex(z4,r);
	float d=min(min(da,db),min(dc,dv));
	vec3 color=segAColor;
	if(d==db) color=segBColor;
	if(d==dc) color=segCColor;
	if(d==dv) color=verticesColor;
	return color;
}
#preset Default
FOV = 0.4
Eye = 1.72902,-1.45438,-1.77639
Target = -4.14952,3.34238,4.73774
Up = -0.509773,0.405595,-0.758699
AntiAlias = 1
Detail = -3
DetailAO = -1.21429
FudgeFactor = 1
MaxRaySteps = 40
BoundingSphere = 12
Dither = 0.5
NormalBackStep = 1
AO = 0,0,0,0.67347
Specular = 1.0417
SpecularExp = 48.611
SpotLight = 1,1,1,0.48529
SpotLightDir = 0.30864,0.55556
CamLight = 1,1,1,0.9855
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.46753
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 14
pParam = 5
qParam = 4
rParam = 2
U = 1
V = 0
W = 0
VRadius = 0.30337
SRadius = 0.17978
useUniformRadius = false
RotVector = 1,1,0
RotAngle = 0
CSphRad = 0.75
segAColor = 0.0901961,0.254902,0.796078
segBColor = 0.109804,0.686275,0.290196
segCColor = 0.827451,0.133333,0.133333
verticesColor = 0.709804,0.615686,0.0745098
#endpreset