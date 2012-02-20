// Described in http://www.fractalforums.com/general-discussion-b77/solids-many-many-solids/

#info fold and cut regular polychora (stereographic projection) Distance Estimator (knighty 2012)
#define providesInit
//#define providesColor
#include "DE-Raytracer.frag"
#include "MathUtils.frag"

#group polychora

//24-cell's specific symmetry group :).

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

//If you want to dive inside the hypersphere. You will need to set the position of the camera at 0,0,0
uniform bool useCameraAsRotVector; checkbox[false]

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[0.00,0,180]

#define PI 3.14159
vec4 nd,p;
float cVR,sVR,cSR,sSR,cRA,sRA;
void init() {
	nd=vec4(-0.5,-0.5,-0.5,0.5);

	vec4 pabc,pbdc,pcda,pdba;
	pabc=vec4(0.,0.,0.,1.);
	pbdc=1./sqrt(2.)*vec4(1.,0.,0.,1.);
	pcda=1./sqrt(2.)*vec4(0.,1.,0.,1.);
	pdba=1./sqrt(2.)*vec4(0.,0.,1.,1.);
	
	p=normalize(U*pabc+V*pbdc+W*pcda+T*pdba);

	cVR=cos(VRadius);sVR=sin(VRadius);
	cSR=cos(SRadius);sSR=sin(SRadius);
	cRA=cos(RotAngle*PI/180.);sRA=sin(RotAngle*PI/180.);
}
uniform vec3 Eye; //slider[(-50,-50,-50),(0,0,-10),(50,50,50)] NotLockable
uniform vec3 Target; //slider[(-50,-50,-50),(0,0,0),(50,50,50)] NotLockable
vec4 Rotate(vec4 p){
	//this is a rotation on the plane defined by RotVector and w axis
	//We do not need more because the remaining 3 rotation are in our 3D space
	//That would be redundant.
	//This rotation is equivalent to translation inside the hypersphere when the camera is at 0,0,0
	vec4 p1=p;
	vec3 rv;
	if (useCameraAsRotVector) rv=normalize(Eye-Target); else rv=normalize(RotVector);
	float vp=dot(rv,p.xyz);
	p1.xyz+=rv*(vp*(cRA-1.)-p.w*sRA);
	p1.w+=vp*sRA+p.w*(cRA-1.);
	return p1;
}

vec4 fold(vec4 pos) {
	for(int i=0;i<3;i++){
		pos.xyz=abs(pos.xyz);
		float t=-2.*min(0.,dot(pos,nd)); pos+=t*nd;
	}
	return pos;
}

float DDV(float ca, float sa, float r){
	//magic formula to convert from spherical distance to planar distance.
	//involves transforming from 3-plane to 3-sphere, getting the distance
	//on the sphere (which is an angle -read: sa==sin(a) and ca==cos(a))
	//then going back to the 3-plane.
	//return r-(2.*r*ca-(1.-r*r)*sa)/((1.-r*r)*ca+2.*r*sa+1.+r*r);
	return (2.*r*cVR-(1.-r*r)*sVR)/((1.-r*r)*cVR+2.*r*sVR+1.+r*r)-(2.*r*ca-(1.-r*r)*sa)/((1.-r*r)*ca+2.*r*sa+1.+r*r);
}
float DDS(float ca, float sa, float r){
	return (2.*r*cSR-(1.-r*r)*sSR)/((1.-r*r)*cSR+2.*r*sSR+1.+r*r)-(2.*r*ca-(1.-r*r)*sa)/((1.-r*r)*ca+2.*r*sa+1.+r*r);
}

float dist2Vertex(vec4 z, float r){
	float ca=dot(z,p), sa=0.5*length(p-z)*length(p+z);//sqrt(1.-ca*ca);//
	return DDV(ca,sa,r);//-VRadius;
}

float dist2Segment(vec4 z, vec4 n, float r){
	//pmin is the orthogonal projection of z onto the plane defined by p and n
	//then pmin is projected onto the unit sphere
	float zn=dot(z,n),zp=dot(z,p),np=dot(n,p);
	float alpha=zp-zn*np, beta=zn-zp*np;
	vec4 pmin=normalize(alpha*p+min(0.,beta)*n);
	//ca and sa are the cosine and sine of the angle between z and pmin. This is the spherical distance.
	float ca=dot(z,pmin), sa=0.5*length(pmin-z)*length(pmin+z);//sqrt(1.-ca*ca);//
	return DDS(ca,sa,r);//-SRadius;
}
//it is possible to compute the distance to a face just as for segments: pmin will be the orthogonal projection
// of z onto the 3-plane defined by p and two n's (na and nb, na and nc, na and and, nb and nd... and so on).
//that involves solving a system of 3 linear equations.
//it's not implemented here because it is better with transparency

float dist2Segments(vec4 z, float r){
	float da=dist2Segment(z, vec4(1.,0.,0.,0.), r);
	float db=dist2Segment(z, vec4(0.,1.,0.,0.), r);
	float dc=dist2Segment(z, vec4(0.,0.,1.,0.), r);
	float dd=dist2Segment(z, nd, r);
	
	return min(min(da,db),min(dc,dd));
}

float DE(vec3 pos) {
	float r=length(pos);
	vec4 z4=vec4(2.*pos,1.-r*r)*1./(1.+r*r);//Inverse stereographic projection of pos: z4 lies onto the unit 3-sphere centered at 0.
	z4=Rotate(z4);//z4.xyw=rot*z4.xyw;
	z4=fold(z4);//fold it
	orbitTrap=z4;
	return min(dist2Vertex(z4,r),dist2Segments(z4, r));
}

#preset 24-cell
FOV = 0.62536
Eye = -7.0626,-1.98099,-0.0229112
Target = 1.4115,0.5933,0.278442
Up = 0.205239,-0.747781,0.616513
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
U = 0
V = 1
W = 0
T = 0
VRadius = 0.09048
SRadius = 0.02476
useCameraAsRotVector = false
RotVector = 0,0,1
RotAngle = 45
#endpreset

#preset 24-cell?
U = 1
V = 0
W = 0
T = 0
VRadius = 0.09048
SRadius = 0.02476
useCameraAsRotVector = false
RotVector = 0,0,1
RotAngle = 45
#endpreset
