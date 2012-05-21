// Described in http://www.fractalforums.com/general-discussion-b77/solids-many-many-solids/
#info fold and cut regular polychora (stereographic projection) Distance Estimator (knighty 2012)
#define providesInit
//#define providesColor
#include "Soft-Raytracer.frag"
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

//If you want to dive inside the hypersphere. You will need to set the position of the camera at 0,0,0
uniform bool useCameraAsRotVector; checkbox[false]

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[0.00,0,180]

mat3 rot;
vec4 nc,nd,p;
float cVR,sVR,cSR,sSR,cRA,sRA;
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

	cVR=cos(VRadius);sVR=sin(VRadius);
	cSR=cos(SRadius);sSR=sin(SRadius);
	cRA=cos(RotAngle*PI/180.);sRA=sin(RotAngle*PI/180.);

	rot = rotationMatrix3(normalize(RotVector), RotAngle);//in reality we need a 4D rotation
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

/*
vec3 color(vec4 pos) {

	for(int i=0;i<Type*(Type-2);i++){
		pos.xy=abs(pos.xy);
		float t=-2.*min(0.,dot(pos,nc)); pos+=t*nc;
		t=-2.*min(0.,dot(pos,nd)); pos+=t*nd;
	}
	return pos;
}*/

vec4 fold(vec4 pos) {
	for(int i=0;i<Type*(Type-2);i++){
		pos.xy=abs(pos.xy);
		float t=-2.*min(0.,dot(pos,nc)); pos+=t*nc;
		t=-2.*min(0.,dot(pos,nd)); pos+=t*nd;
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
	float dc=dist2Segment(z, nc, r);
	float dd=dist2Segment(z, nd, r);
	
	return min(min(da,db),min(dc,dd));
}

float DE(vec3 pos) {
	float r=length(pos);
	vec4 z4=vec4(2.*pos,1.-r*r)*1./(1.+r*r);//Inverse stereographic projection of pos: z4 lies onto the unit 3-sphere centered at 0.
	z4=Rotate(z4);//z4.xyw=rot*z4.xyw;
	z4=fold(z4);//fold it
	orbitTrap=z4;
	return min(pos.z+1.6,min(dist2Vertex(z4,r),dist2Segments(z4, r)));
} 

#preset hypercube
Type = 4
U = 0
V = 1
W = 0
T = 0
useCameraAsRotVector = false
RotVector = 0,1,1
RotAngle = 45
#endpreset

#preset 4-simplex
Type = 3
U = 0
V = 1
W = 0
T = 0
useCameraAsRotVector = false
RotVector = 1,0,0
RotAngle = 60
#endpreset

//the edges appear straight. This is as if we were inside the 3-sphere.
//Please change RotAngle parameter to move forward.
//In reality we should see more (things that are behind past the antipode) because the hypersphere is closed
//but the method used doesn't allow it :-/
#preset travel
FOV = 1.2683
Eye = 0,0,0
Target = 0.0380552,1.52411,-0.331646
Up = 0.861256,-0.0619952,-0.504376
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
Fog = 0.45872
HardShadow = 0
ShadowSoft = 8.254
Reflection = 0
BaseColor = 0.721569,0.721569,0.721569
OrbitStrength = 0 Locked
X = 0.411765,0.6,0.560784,0.41748
Y = 0.666667,0.666667,0.498039,-0.16504
Z = 1,0.258824,0.207843,1
R = 0.0823529,0.278431,1,0.15686
BackgroundColor = 0.501961,0.737255,0.956863
GradientBackground = 0
CycleColors = true
Cycles = 14.3775
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Type = 5
U = 0
V = 1
W = 0
T = 0
VRadius = 0.01905
SRadius = 0.00571
RotVector = 1,0,0
RotAngle = 97.2414
useCameraAsRotVector = true
#endpreset

#preset 16-cell?
Type = 4
U = 0
V = 0
W = 0
T = 1
useCameraAsRotVector = false
RotVector = 1,0,0
RotAngle = 26.8974
#endpreset

#preset 24-cell? 
Type = 4
U = 0
V = 0
W = 1
T = 0
useCameraAsRotVector = false
RotVector = 1,0,0
RotAngle = 26.8974
#endpreset

#preset 120-Cell?
Type = 5
U = 0
V = 1
W = 0
T = 0
useCameraAsRotVector = false
RotVector = 1,0,0
RotAngle = 93.1032
#endpreset

#preset 600-cell?
Type = 5
U = 0
V = 0
W = 0
T = 1
useCameraAsRotVector = false
RotVector = 1,0,0
RotAngle = 68.2758
#endpreset
