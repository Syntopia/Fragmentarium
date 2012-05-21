#version 130
#info 3D hyperbolic tessellation. Coxeter group 5-3-n. Poincaré ball model. Distance Estimator (knighty 2012)
#define providesInit
#define providesColor
#include "DE-Raytracer.frag"
#include "MathUtils.frag"

#group Hyperbolic-tesselation
// Iteration number.
uniform int Iterations;  slider[0,10,20]

// Symmetry group type.
uniform int Type;  slider[4,5,5]

// U 'barycentric' coordinate for the 'principal' node
uniform float U; slider[0,1,1]

// V
uniform float V; slider[0,0,1]

// W
uniform float W; slider[0,0,1]

// T
uniform float T; slider[0,0,1]

//vertex radius 
uniform float VRadius; slider[0,0.05,0.5]

//segments radius 
uniform float SRadius; slider[0,0.01,0.1]

//If you want to have thickness of vetices and segments not affected by the stereographic projection
uniform bool useUniformRadius; checkbox[false]

//If you want to dive inside the hyperbolic space. You will need to set the position of the camera at 0,0,0
uniform bool useCameraAsRotVector; checkbox[false]

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[-1,0,1]

//cutting sphere radius
uniform float CSphRad; slider[0,0.75,1]

#group HTess-Color
uniform vec3 segAColor; color[0.0,0.0,0.0]
uniform vec3 segBColor; color[0.0,0.0,0.0]
uniform vec3 segCColor; color[0.0,0.0,0.0]
uniform vec3 segDColor; color[0.0,0.0,0.0]
uniform vec3 verticesColor; color[0.0,0.0,0.0]

#define PI 3.14159
vec4 nc,nd,p;
float cVR,sVR,cSR,sSR,cRA,sRA;
float hdot(vec4 a, vec4 b){//dot product for Minkowski space.
	return dot(a.xyz,b.xyz)-a.w*b.w;
}
vec4 hnormalizew(vec4 v){//normalization of (timelike) vectors in Minkowski space.
	float l=1./sqrt(v.w*v.w-dot(v.xyz,v.xyz));
	return v*l;
}
void init() {
	float cospin=cos(PI/float(Type)), sinpin=sin(PI/float(Type)), cotgpin=cospin/sinpin;
	float scospin=sqrt(cos(PI/5.)*cos(PI/5.)+0.25*cotgpin*cotgpin-3./4.);

	//na and nb are simply vec4(1.,0.,0.,0.) and vec4(0.,1.,0.,0.) respectively
	nc=vec4(0.,-cospin,sinpin,0.);
	nd=vec4(-cos(PI/5.),-0.5,-0.5*cotgpin,-scospin);

	vec4 pabc,pbdc,pcda,pdba;
	pabc=vec4(0.,0.,0.,sinpin);
	pbdc=vec4(sinpin*scospin,0.,0.,sinpin*cos(PI/5.));
	pcda=vec4(0.,sinpin*scospin,cospin*scospin,0.5/sinpin);
	pdba=vec4(0.,0.,scospin,0.5*cotgpin);
	
	p=hnormalizew(U*pabc+V*pbdc+W*pcda+T*pdba);

	cVR=cosh(VRadius);sVR=sinh(VRadius);
	cSR=cosh(SRadius);sSR=sinh(SRadius);
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
	if (useCameraAsRotVector) rv=normalize(Eye-Target); else rv=normalize(RotVector);
	float vp=dot(rv,p.xyz);
	p1.xyz+=rv*(vp*(cRA-1.)+p.w*sRA);
	p1.w+=vp*sRA+p.w*(cRA-1.);
	return p1;
}

vec4 fold(vec4 pos) {//beside using minkowski dot product, its exactly the same as for euclidean space
	for(int i=0;i<Iterations;i++){
		pos.xy=abs(pos.xy);
		float t=-2.*min(0.,hdot(pos,nc)); pos+=t*nc;
		t=-2.*min(0.,hdot(pos,nd)); pos+=t*nd;
	}
	return pos;
}

float DD(float ca, float sa, float r){//converts hyperbolic distance to distance in projection flat space. ca and sa are the hyperbolic cosine and sine of the hyperbolic distance which is an "angle".
	return (2.*r*ca+(1.+r*r)*sa)/((1.+r*r)*ca+2.*r*sa+1.-r*r)-r;
}

float dist2Vertex(vec4 z, float r){
	float ca=-hdot(z,p), sa=0.5*sqrt(-hdot(p-z,p-z)*hdot(p+z,p+z));
	
	if(useUniformRadius) return DD(ca,sa,r)-VRadius;
	else return DD(ca*cVR-sa*sVR,sa*cVR-ca*sVR,r);
}

float dist2Segment(vec4 z, vec4 n, float r){
	//pmin is the orthogonal projection of z onto the plane defined by p and n
	//then pmin is projected onto the unit sphere
	float zn=hdot(z,n),zp=hdot(z,p),np=hdot(n,p);
	float det=-1./(1.+np*np);
	float alpha=det*(zp-zn*np), beta=det*(-np*zp-zn);
	vec4 pmin=hnormalizew(alpha*p+min(0.,beta)*n);
	//ca and sa are the hyperbolic cosine and sine of the "angle" between z and pmin. This is the distance in hyperbolic space.
	float ca=-hdot(z,pmin), sa=0.5*sqrt(-hdot(pmin-z,pmin-z)*hdot(pmin+z,pmin+z));
	if(useUniformRadius) return DD(ca,sa,r)-SRadius;
	else return DD(ca*cSR-sa*sSR,sa*cSR-ca*sSR,r);//we subtract the width of the sgment before conversion
}
//it is possible to compute the distance to a face just as for segments: pmin will be the orthogonal projection
// of z onto the 3-plane defined by p and two n's (na and nb, na and nc, na and and, nb and nd... and so on).
//that involves solving a system of 3 linear equations.
//it's not implemented here because it is better with transparency

float dist2Segments(vec4 z, float r){
	float da=dist2Segment(z, vec4(1.,0.,0.,0.), r);
	float db=dist2Segment(z, vec4(0.,1.,0.,0.), r);
	float dc=dist2Segment(z, nc, r);
	float dd=dist2Segment(z, nd, r);
	
	return min(min(da,db),min(dc,dd));
}

float DE(vec3 pos) {
	float r=length(pos);
	vec4 z4=vec4(2.*pos,1.+r*r)*1./(1.-r*r);//Inverse stereographic projection of pos: z4 lies onto the unit 3-parabolid of revolution around w axis centered at 0.
	z4=Rotate(z4);
	z4=fold(z4);
	orbitTrap=z4;
	return max(r-CSphRad,min(dist2Vertex(z4,r),dist2Segments(z4, r)));
}

vec3  baseColor(vec3 pos, vec3 normal){
	float r=length(pos);
	vec4 z4=vec4(2.*pos,1.+r*r)*1./(1.-r*r);
	z4=Rotate(z4);
	z4=fold(z4);
	float da=dist2Segment(z4, vec4(1.,0.,0.,0.), r);
	float db=dist2Segment(z4, vec4(0.,1.,0.,0.), r);
	float dc=dist2Segment(z4, nc, r);
	float dd=dist2Segment(z4, nd, r);
	float dv=dist2Vertex(z4,r);
	float d=min(min(min(da,db),min(dc,dd)),dv);
	vec3 color=segAColor;
	if(d==db) color=segBColor;
	if(d==dc) color=segCColor;
	if(d==dd) color=segDColor;
	if(d==dv) color=verticesColor;
	return color;
}
#preset Default
FOV = 0.4
Eye = 0,0,0
Target = -0.897865,-0.096,0.429677
Up = -0.0905487,0.993704,0.0659802
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
U = 0
V = 1
W = 1
T = 1
VRadius = 0.07143
SRadius = 0.04
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
Type = 5
#endpreset
//[5,3,4] family
#preset order-4 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = -0.806525,0.0114524,0.591088
Up = -0.0124848,0.999715,0.0203336
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 0
V = 1
W = 0
T = 0
VRadius = 0.19101
SRadius = 0.07528
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.21518
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Rectified order-4 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = -0.663988,0.00343569,0.747735
Up = -0.0166638,0.999537,0.025462
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 1
V = 0
W = 0
T = 0
VRadius = 0.19101
SRadius = 0.07528
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.51898
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Rectified order-5 cubic
FOV = 0.4
Eye = 0,0,0
Target = -0.895419,0.00370235,0.445208
Up = -0.0180483,0.999365,0.0307197
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 0
V = 0
W = 1
T = 0
VRadius = 0.07865
SRadius = 0.03258
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.51898
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset order-5 cubic
FOV = 0.4
Eye = 0,0,0
Target = -0.835335,0.289426,0.467383
Up = 0.239301,0.965916,-0.0986937
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 0
V = 0
W = 0
T = 1
VRadius = 0.17416
SRadius = 0.0618
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.51898
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Truncated order-4 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = -0.702319,0.19619,0.684293
Up = 0.186939,0.981535,-0.0405366
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 1
V = 1
W = 0
T = 0
VRadius = 0.08989
SRadius = 0.04944
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.26582
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Bitruncated order-5 cubic
FOV = 0.4
Eye = 0,0,0
Target = -0.466189,0.14203,0.87321
Up = 0.1745,0.984244,-0.0285215
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 1
V = 0
W = 1
T = 0
VRadius = 0.08989
SRadius = 0.04944
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.26582
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Truncated order-5 cubic
FOV = 0.4
Eye = 0,0,0
Target = -0.574221,0.237481,0.783501
Up = 0.211126,0.972608,-0.0972627
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 0
V = 0
W = 1
T = 1
VRadius = 0.08989
SRadius = 0.04944
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.26582
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Cantellated order-4 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = -0.236757,0.214072,0.947691
Up = 0.231356,0.964837,-0.124758
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 0
V = 1
W = 1
T = 0
VRadius = 0.07304
SRadius = 0.03371
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.26582
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Cantellated order-5 cubic
FOV = 0.4
Eye = 0,0,0
Target = -0.838374,0.0232864,0.544598
Up = 0.0589984,0.992181,0.109982
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 1
V = 0
W = 0
T = 1
VRadius = 0.07304
SRadius = 0.03371
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.18988
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Runcinated order-5 cubic
FOV = 0.4
Eye = 0,0,0
Target = -0.799933,-0.0796116,0.594785
Up = -0.0187935,0.986423,0.163142
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 0
V = 1
W = 0
T = 1
VRadius = 0.07304
SRadius = 0.03371
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.74684
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Cantitruncated order-4 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = -0.799933,-0.0796116,0.594785
Up = -0.0187935,0.986423,0.163142
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 1
V = 1
W = 1
T = 0
VRadius = 0.07304
SRadius = 0.03371
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.74684
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Cantitruncated order-5 cubic
FOV = 0.4
Eye = 0,0,0
Target = -0.888172,0.00657076,0.459464
Up = 0.0340781,0.991611,0.124687
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 1
V = 0
W = 1
T = 1
VRadius = 0.07304
SRadius = 0.03371
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.74684
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Runcitruncated order-4 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = -0.216263,0.516992,0.82822
Up = 0.566296,0.770513,-0.292607
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 1
V = 1
W = 0
T = 1
VRadius = 0.07304
SRadius = 0.03371
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = -0.0886
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Runcitruncated order-5 cubic
FOV = 0.4
Eye = 0,0,0
Target = -0.00972283,0.12088,0.992619
Up = 0.505198,0.860472,-0.0660517
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 0
V = 1
W = 1
T = 1
VRadius = 0.07304
SRadius = 0.03371
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.41772
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Omnitruncated order-5 cubic
FOV = 0.4
Eye = 0,0,0
Target = -0.00972283,0.12088,0.992619
Up = 0.505198,0.860472,-0.0660517
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 4
U = 1
V = 1
W = 1
T = 1
VRadius = 0.07304
SRadius = 0.03371
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.41772
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset
//[5,3,5] family
#preset Order-5 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = -0.664915,0.320132,-0.674836
Up = 0.142615,0.952994,0.267328
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 5
U = 0
V = 1
W = 0
T = 0
VRadius = 0.21
SRadius = 0.1
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.2
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset rectified order-5 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = 0.18327,0.234662,-0.954644
Up = -0.0756818,0.97796,0.194591
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 5
U = 1
V = 0
W = 0
T = 0
VRadius = 0.21
SRadius = 0.1
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset truncated order-5 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = 0.18327,0.234662,-0.954644
Up = -0.0756818,0.97796,0.194591
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 5
U = 1
V = 1
W = 0
T = 0
VRadius = 0.21
SRadius = 0.1
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset cantellated order-5 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = 0.183608,0.230604,-0.955568
Up = -0.0749061,0.97881,0.190578
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 5
U = 0
V = 1
W = 1
T = 0
VRadius = 0.13
SRadius = 0.054
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset Runcinated order-5 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = 0.143386,0.226902,-0.963305
Up = -0.0745178,0.979229,0.18857
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 5
U = 0
V = 1
W = 0
T = 1
VRadius = 0.13
SRadius = 0.054
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset bitruncated order-5 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = 0.0158388,0.279885,-0.959903
Up = -0.0834895,0.964931,0.248872
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 5
U = 1
V = 0
W = 1
T = 0
VRadius = 0.13
SRadius = 0.054
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset cantitruncated order-5 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = 0.0158388,0.279885,-0.959903
Up = -0.0834895,0.964931,0.248872
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 5
U = 1
V = 1
W = 1
T = 0
VRadius = 0.13
SRadius = 0.054
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.5
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset runcitruncated order-5 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = 0.173432,0.346006,-0.922063
Up = -0.0740868,0.948029,0.309437
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 5
U = 1
V = 1
W = 0
T = 1
VRadius = 0.1
SRadius = 0.052
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.3
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset

#preset omnitruncated order-5 dodecahedral
FOV = 0.4
Eye = 0,0,0
Target = 0.034818,0.50053,-0.865019
Up = -0.109123,0.876746,0.46841
AntiAlias = 1
Detail = -3.53094
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 100
BoundingSphere = 4
Dither = 0.50877
NormalBackStep = 1
AO = 0,0,0,1
Specular = 3.25
SpecularExp = 44.643
SpotLight = 1,1,1,0.42308
SpotLightDir = 0.1,-0.9077
CamLight = 1,1,1,2
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.864
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 0.694118,0.694118,0.694118
OrbitStrength = 0.25974
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
Iterations = 13
Type = 5
U = 1
V = 1
W = 1
T = 1
VRadius = 0.09
SRadius = 0.052
useUniformRadius = false
useCameraAsRotVector = true
RotVector = 0,0,1
RotAngle = 0.4
CSphRad = 0.999
segAColor = 0.815686,0.129412,0.129412
segBColor = 0.152941,0.741176,0.0862745
segCColor = 0.145098,0.372549,0.866667
segDColor = 0.847059,0.109804,0.74902
verticesColor = 0.792157,0.607843,0.145098
#endpreset