#define DO_ROTATIONS
#info mdifs by knighty (jan 2012)
#ifdef DO_ROTATIONS
#define providesInit
#endif
#include "Soft-Raytracer.frag"
#include "MathUtils.frag"
#group mdifs



// Number of fractal iterations.
uniform int Iterations;  slider[0,9,100]

// Bailout radius
uniform float Bailout; slider[0,100,100]

// Size of auxiliary object
uniform float auxSize; slider[0,0.45,1]

// iteration number of auxiliary object
uniform int auxIter; slider[0,5,20]

// Z offset
uniform float zOffset; slider[-1,0,1]

#ifdef DO_ROTATIONS
uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[-180,0,180]

mat3 rot;

void init() {
	 rot = rotationMatrix3(normalize(RotVector), RotAngle);
}
#endif

#define obj menger3
float sphere(vec3 center) {
	return length(center)-auxSize;
}
float cube(vec3 p) {
	p=abs(p)-0.5*auxSize;
	if(any(greaterThan(p,vec3(0.)))) return length(max(p,0.));
	return max(p.x,max(p.y,p.z));
}
float rcube(vec3 p) {
	p=abs(p)-0.5*auxSize;
	if(any(greaterThan(p,vec3(0.)))) return length(max(p,0.))-0.1*auxSize;
	return max(p.x,max(p.y,p.z))-0.1*auxSize;
}
float menger1(vec3 p){
	p*=1./auxSize;
	float r2=dot(p,p), dd=1.;
	for(int i=0; i<auxIter && r2<Bailout;i++){
		p=abs(p);
		if(p.y>p.x) p.xy=p.yx;
		if(p.y>p.z) p.zy=p.yz;
		if(p.y<1./3.) p.y=abs(p.y-1./3.)+1./3.;
		p-=1.;p*=3.;p+=1.;
		dd*=1./3.;
		r2=dot(p,p);
	}
	p=abs(p)-1.;
	if(any(greaterThan(p,vec3(0.)))) r2=length(max(p,0.));
	else r2=max(p.x,max(p.y,p.z));
	return r2*dd*auxSize;
}
float menger2(vec3 p){
	p*=1./auxSize;
	float r2=dot(p,p), dd=1.;
	for(int i=0; i<auxIter && r2<Bailout;i++){
		p=abs(p);
		if(p.y>p.x) p.xy=p.yx;
		if(p.y>p.z) p.zy=p.yz;
		p.y=abs(p.y-1./2.)+1./2.;
		p-=1.;p*=4.;p+=1.;
		dd*=1./4.;
		r2=dot(p,p);
	}
	p=abs(p)-1.;
	if(any(greaterThan(p,vec3(0.)))) r2=length(max(p,0.));
	else r2=max(p.x,max(p.y,p.z));
	return r2*dd*auxSize;
}
float menger3(vec3 p){
	p*=1./auxSize;
	float r2=dot(p,p), dd=1.;
	for(int i=0; i<auxIter && r2<Bailout;i++){
		p=abs(p);
		if(p.y>p.x) p.xy=p.yx;
		if(p.y>p.z) p.zy=p.yz;
		p.y=abs(p.y-1./5.)+1./5.;
		p.y=abs(p.y-3./5.)+3./5.;
		p-=1.;p*=5.;p+=1.;
		dd*=1./5.;
		r2=dot(p,p);
	}
	p=abs(p)-1.;
	if(any(greaterThan(p,vec3(0.)))) r2=length(max(p,0.));
	else r2=max(p.x,max(p.y,p.z));
	return r2*dd*auxSize;
}

float iter(vec3 p){
	float r2=dot(p,p),dd=1.,d=obj(p);
	int i=0,imin=0;
	for(;i<Iterations && r2<Bailout;i++){
		if(p.y>p.x) p.xy=p.yx;
		if(p.y<0.5) p.y=abs(p.y-0.5)+0.5;
		p.xy-=1.;p*=2.;p.xy+=1.;p.z-=zOffset;
#ifdef DO_ROTATIONS
		p*=rot;
#endif
		dd*=0.5;
		r2=dot(p,p);
		float ad=d; d=min(d,dd*obj(p));
		if(d!=ad) imin=i+1;
	}
	orbitTrap=vec4(float(imin));
	return d;
}

float DE(vec3 pos) {
	return iter(pos);
}

#preset default
FOV = 0.62536
Eye = 1.65409,1.40962,1.19573
Target = -3.41163,-3.81569,-3.86028
Up = -0.544927,-0.247025,0.80127
AntiAlias = 1
Detail = -3 Locked
DetailAO = -2 Locked
FudgeFactor = 1 Locked
MaxRaySteps = 100 Locked
BoundingSphere = 1.5
Dither = 0.5
NormalBackStep = 1
AO = 0,0,0,0.90123
Specular = 4.4304
SpecularExp = 16
SpotLight = 0.435294,0.737255,1,0.36538
SpotLightDir = -0.6923,-0.75384
CamLight = 1,0.941176,0.898039,0.71698
CamLightMin = 1
Glow = 0.482353,0.741176,0.835294,0.54054
GlowMax = 51
Fog = 0
HardShadow = 0
ShadowSoft = 12.9032
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.27273
X = 0.411765,0.6,0.560784,0.16504
Y = 0.666667,0.666667,0.498039,-0.30098
Z = 1,0.258824,0.207843,0.35922
R = 0.0823529,0.278431,1,-0.09804
BackgroundColor = 0.607843,0.866667,0.560784
GradientBackground = 0.3261
CycleColors = true
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 9
Bailout = 100
auxSize = 0.53774
auxIter = 5
zOffset = 0
RotVector = 1,1,1
RotAngle = 0
#endpreset

#preset reflex
FOV = 0.62536
Eye = 1.8491,1.27791,0.651293
Target = -4.17007,-3.6572,-3.58459
Up = -0.401042,-0.263819,0.877248
AntiAlias = 1
Detail = -3 Locked
DetailAO = -2 Locked
FudgeFactor = 1 Locked
MaxRaySteps = 100 Locked
BoundingSphere = 2 Locked
Dither = 0.5
NormalBackStep = 1
AO = 0,0,0,0.7561
Specular = 4.4304
SpecularExp = 16
SpotLight = 0.435294,0.737255,1,1
SpotLightDir = -0.6923,-0.75384
CamLight = 1,0.941176,0.898039,0.90566
CamLightMin = 0
Glow = 0.482353,0.741176,0.835294,0.54054
GlowMax = 51
Fog = 0.33028
HardShadow = 0
ShadowSoft = 12.9032
Reflection = 0.50633
BaseColor = 1,1,1
OrbitStrength = 0.27273
X = 0.411765,0.6,0.560784,0.12622
Y = 0.666667,0.666667,0.498039,-0.37864
Z = 1,0.258824,0.207843,0.24272
R = 0.0823529,0.278431,1,-0.29412
BackgroundColor = 0,0,0 Locked
GradientBackground = 0 Locked
CycleColors = true
Cycles = 5.56788
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 7
Bailout = 100
auxSize = 0.45283
auxIter = 2
zOffset = -0.47572
RotVector = 0,0,1 Locked
RotAngle = 0 Locked
#endpreset

#preset
FOV = 0.38096
Eye = 1.63957,0.326783,-0.292567
Target = -6.96191,0.459571,1.83471
Up = 0.232137,-0.00116302,0.9387
AntiAlias = 1 NotLocked
Detail = -3 Locked
DetailAO = -2 Locked
FudgeFactor = 1 Locked
MaxRaySteps = 100 Locked
BoundingSphere = 2 Locked
Dither = 0.39655
NormalBackStep = 1 NotLocked
AO = 0,0,0,0.7561
Specular = 7.5
SpecularExp = 16
CamLight = 1,0.941176,0.898039,0.90566
CamLightMin = 0
Glow = 1,1,1,0.54054
GlowMax = 51
Fog = 0.33028
HardShadow = 0.53846 NotLocked
ShadowSoft = 12.9032
Reflection = 0.50633 NotLocked
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.411765,0.6,0.560784,0.12622
Y = 0.666667,0.666667,0.498039,-0.37864
Z = 1,0.258824,0.207843,0.24272
R = 0.0823529,0.278431,1,1
BackgroundColor = 0.996078,0.996078,0.996078 Locked
GradientBackground = 0 Locked
CycleColors = true
Cycles = 4.42543
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 7
Bailout = 100
auxSize = 0.45283
auxIter = 3
zOffset = -0.375
RotVector = 0,0,1 Locked
RotAngle = 0 Locked
SpotLight = 0.435294,0.737255,1,1
SpotLightPos = 9.6296,-4.4444,2.963
SpotLightSize = 0.1
FocalPlane = 0.50001
Aperture = 0.00209
AntiAliasScale = 1
#endpreset