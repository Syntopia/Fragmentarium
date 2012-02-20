// Described in http://www.fractalforums.com/general-discussion-b77/solids-many-many-solids/
#info fold and cut regular polychora (stereographic projection) Distance Estimator (knighty 2012)
#define providesInit
//#define providesColor
#include "DE-Raytracer.frag"
#include "MathUtils.frag"

#group polychora

//there is one missing: 24-cell's specific symmetry group :). Will add it later or do it in another shader
// Symmetry group type.
uniform int Type;  slider[3,5,5]

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

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[0.00,0,180]

#define PI 3.14159
mat3 rot;
vec4 nc,nd,p;
void init() {
	float cospin=cos(PI/float(Type)), isinpin=1./sin(PI/float(Type));
	float scospin=sqrt(2./3.-cospin*cospin), issinpin=1./sqrt(3.-4.*cospin*cospin);

	nc=0.5*vec4(0,-1,sqrt(3.),0.);
	nd=vec4(-cospin,-0.5,-0.5/sqrt(3.),scospin);

	vec4 pabc,pbdc,pcda,pdba;
	pabc=vec4(0.,0.,0.,1.);
	pbdc=0.5*sqrt(3.)*vec4(scospin,0.,0.,cospin);
	pcda=isinpin*vec4(0.,0.5*sqrt(3.)*scospin,0.5*scospin,1./sqrt(3.));
	pdba=issinpin*vec4(0.,0.,2.*scospin,1./sqrt(3.));
	
	p=normalize(U*pabc+V*pbdc+W*pcda+T*pdba);

	rot = rotationMatrix3(normalize(RotVector), RotAngle);//in reality we need a 4D rotation
}

vec4 fold(vec4 pos) {
	for(int i=0;i<Type*(Type-2);i++){
		pos.xy=abs(pos.xy);
		float t=-2.*min(0.,dot(pos,nc)); pos+=t*nc;
		t=-2.*min(0.,dot(pos,nd)); pos+=t*nd;
	}
	return pos;
}

float DD(float ca, float sa, float r){
	//magic formula to convert from spherical distance to planar distance.
	//involves transforming from 3-plane to 3-sphere, getting the distance
	//on the sphere then going back to the 3-plane.
	return r-(2.*r*ca-(1.-r*r)*sa)/((1.-r*r)*ca+2.*r*sa+1.+r*r);
}

float dist2Vertex(vec4 z, float r){
	float ca=dot(z,p), sa=0.5*length(p-z)*length(p+z);//sqrt(1.-ca*ca);//
	return DD(ca,sa,r)-VRadius;
}

float dist2Segment(vec4 z, vec4 n, float r){
	//pmin is the orthogonal projection of z onto the plane defined by p and n
	//then pmin is projected onto the unit sphere
	float zn=dot(z,n),zp=dot(z,p),np=dot(n,p);
	float alpha=zp-zn*np, beta=zn-zp*np;
	vec4 pmin=normalize(alpha*p+min(0.,beta)*n);
	//ca and sa are the cosine and sine of the angle between z and pmin. This is the spherical distance.
	float ca=dot(z,pmin), sa=0.5*length(pmin-z)*length(pmin+z);//sqrt(1.-ca*ca);//
	return DD(ca,sa,r)-SRadius;
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
	vec4 z4=vec4(2.*pos,1.-r*r)*1./(1.+r*r);//Inverse stereographic projection of pos: z4 lies onto the unit 3-sphere centered at 0.
	z4.xyw=rot*z4.xyw;
	z4=fold(z4);//fold it

	return min(dist2Vertex(z4,r),dist2Segments(z4, r));
}

#preset hypercube
FOV = 0.62536
Eye = -5.86672,-5.4972,3.05247
Target = -0.00150877,0.159545,-0.430179
Up = 0.466567,-0.752555,-0.464732
AntiAlias = 1
Detail = -3
DetailAO = -1.57143
FudgeFactor = 1 Locked
MaxRaySteps = 100 Locked
BoundingSphere = 4 Locked
Dither = 0.5 Locked
NormalBackStep = 1
AO = 0,0,0,0.90123
Specular = 4.4304
SpecularExp = 16
SpotLight = 1,1,1,0.75
SpotLightDir = 0.6923,0.78462
CamLight = 1,0.827451,0.768627,0.6415
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 0
ShadowSoft = 8.254
Reflection = 0
BaseColor = 0.721569,0.721569,0.721569
OrbitStrength = 0 Locked
X = 0.411765,0.6,0.560784,0.41748
Y = 0.666667,0.666667,0.498039,-0.16504
Z = 1,0.258824,0.207843,1
R = 0.0823529,0.278431,1,0.82352
BackgroundColor = 0.501961,0.737255,0.956863
GradientBackground = 0.86955
CycleColors = true
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Type = 4
U = 0
V = 1
W = 0
T = 0
VRadius = 0.09048
SRadius = 0.02476
RotVector = 0,1,1
RotAngle = 180
#endpreset

#preset 4-simplex
FOV = 0.62536
Eye = -7.62826,-4.09881,-1.01298
Target = 0.102144,0.147285,-0.152866
Up = 0.464029,-0.758602,-0.457383
AntiAlias = 1
Detail = -3
DetailAO = -1.57143
FudgeFactor = 1 Locked
MaxRaySteps = 100 Locked
BoundingSphere = 4 Locked
Dither = 0.5 Locked
NormalBackStep = 1
AO = 0,0,0,0.90123
Specular = 4.4304
SpecularExp = 16
SpotLight = 1,1,1,0.75
SpotLightDir = 0.6923,0.78462
CamLight = 1,0.827451,0.768627,0.6415
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 0
ShadowSoft = 8.254
Reflection = 0
BaseColor = 0.721569,0.721569,0.721569
OrbitStrength = 0 Locked
X = 0.411765,0.6,0.560784,0.41748
Y = 0.666667,0.666667,0.498039,-0.16504
Z = 1,0.258824,0.207843,1
R = 0.0823529,0.278431,1,0.82352
BackgroundColor = 0.501961,0.737255,0.956863
GradientBackground = 0.86955
CycleColors = true
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Type = 3
U = 0
V = 1
W = 0
T = 0
VRadius = 0.09048
SRadius = 0.02476
RotVector = 0,1,0
RotAngle = 60
#endpreset

//the edges appear straight. This is as if we were inside the 3-sphere but without magnification effect that should appear. Pls change RotAngle parameter
#preset travel
FOV = 1.2683
Eye = 0,0,0
Target = 0.256892,1.45788,0.492905
Up = 0.850617,0.107408,-0.514689
AntiAlias = 1
Detail = -3
DetailAO = -1.57143
FudgeFactor = 1 Locked
MaxRaySteps = 100 Locked
BoundingSphere = 4 Locked
Dither = 0.5 Locked
NormalBackStep = 1
AO = 0,0,0,0.90123
Specular = 4.4304
SpecularExp = 16
SpotLight = 1,1,1,0.75
SpotLightDir = 0.6923,0.78462
CamLight = 1,0.827451,0.768627,0.6415
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 0
ShadowSoft = 8.254
Reflection = 0
BaseColor = 0.721569,0.721569,0.721569
OrbitStrength = 0 Locked
X = 0.411765,0.6,0.560784,0.41748
Y = 0.666667,0.666667,0.498039,-0.16504
Z = 1,0.258824,0.207843,1
R = 0.0823529,0.278431,1,0.82352
BackgroundColor = 0.501961,0.737255,0.956863
GradientBackground = 0.86955
CycleColors = true
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Type = 5
U = 0
V = 1
W = 0.66165
T = 0
VRadius = 0
SRadius = 0.00571
RotVector = 1,0,0
RotAngle = 86.8968
#endpreset