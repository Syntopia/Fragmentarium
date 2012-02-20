#info knot thingy by knighty (2012). Based on an idea by DarkBeam from fractalforums (http://www.fractalforums.com/new-theories-and-research/not-fractal-but-funny-trefoil-knot-routine/30/)
#include "Soft-Raytracer.frag"
#group Trefoil

#define PI 3.14159

//Radius of the tubes
uniform float tubeRadius; slider[0,0.1,0.5]

//Radius of the goup of tubes
uniform float groupRadius; slider[0,0.4,0.5]

//Radius of the whole object (because it looks like a torus (-:)
uniform float objectRadius; slider[0,1,1]

//Rotation Numerator X: actually not a rotation. This is frequency in x direction
uniform int    RotNumeratorX; slider[-10,2,10]

//Rotation Numerator Y: actually not a rotation. This is frequency in y direction. (lissajou figure)
uniform int    RotNumeratorY; slider[-10,4,10]

//Rotation Denominator: this is the rotation "speed" in xz plane
uniform int    RotDenominator; slider[1,3,20]

//Rotations number: how many instances to check. related to the period of the knot. Have to find math formula for that. 
uniform int    Rotations; slider[1,1,10]

float Cylinder(vec2 p){
	p.x-=groupRadius;
	return length(p)-tubeRadius;
}

float twist(vec3 p){//seen from above it is a lissajou fugure
	float ra =p.z*float(RotNumeratorX)/float( RotDenominator);
	float raz=p.z*float(RotNumeratorY)/float(RotDenominator);
	return length(p.xy-vec2(groupRadius*cos(ra)+objectRadius,groupRadius*sin(raz)+objectRadius))-tubeRadius;
}

vec3 bend2PI(vec3 p){
	return vec3(length(p.xz),p.y,atan(p.z,p.x));
}

float DE(vec3 p) {
	float r=length(p.xz), ang=atan(p.z,p.x),y=p.y;
	float d=10000.;
	for(int i=0; i<Rotations;i++){
		vec3 p=vec3(r,y,ang+2.*PI*float(i));
		p.x-=objectRadius;
		d=min(d,twist(p));
	}
	return min(d,p.y);
}
#preset default
FOV = 0.62536
Eye = -0.684574,2.97917,-0.56351
Target = 1.28819,-5.52322,0.968231
Up = -0.474302,-0.261493,-0.84063
AntiAlias = 1
Detail = -3
DetailAO = -1.57143
FudgeFactor = 0.66265
MaxRaySteps = 64
BoundingSphere = 4 Locked
Dither = 0 Locked
NormalBackStep = 1
AO = 0,0,0,0.90123
Specular = 4.4304
SpecularExp = 16
SpotLight = 0.435294,0.737255,1,0.5
SpotLightDir = 0.65626,0.5
CamLight = 1,0.941176,0.898039,1.0566
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 0
ShadowSoft = 12.9032
Reflection = 0
BaseColor = 0.701961,0.701961,0.701961
OrbitStrength = 0
X = 0.411765,0.6,0.560784,0.41748
Y = 0.666667,0.666667,0.498039,-0.16504
Z = 1,0.258824,0.207843,1
R = 0.0823529,0.278431,1,0.82352
BackgroundColor = 0.607843,0.866667,0.560784
GradientBackground = 0.3261
CycleColors = true
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
tubeRadius = 0.07534
groupRadius = 0.29851
objectRadius = 0.43077
Rotations = 3
RotDenominator = 3
RotNumeratorX = -2
RotNumeratorY = -4
#endpreset

#preset M2
FOV = 0.62536
Eye = 1.34684,1.59963,1.38682
Target = -3.60405,-4.05735,-3.30529
Up = -0.391317,0.765755,-0.510324
AntiAlias = 1
Detail = -3
DetailAO = -0.14287
FudgeFactor = 0.66265
MaxRaySteps = 132
BoundingSphere = 4 Locked
Dither = 0 Locked
NormalBackStep = 1
AO = 0,0,0,0.61224
Specular = 6.9792
SpecularExp = 51.389
CamLight = 0.0980392,0.713725,1,0.75362
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 0.71951 NotLocked
ShadowSoft = 0.7594
Reflection = 0
BaseColor = 0.701961,0.701961,0.701961
OrbitStrength = 0
X = 0.411765,0.6,0.560784,0.41748
Y = 0.666667,0.666667,0.498039,-0.16504
Z = 1,0.258824,0.207843,1
R = 0.0823529,0.278431,1,0.82352
BackgroundColor = 0,0,0
GradientBackground = 0.3261
CycleColors = true
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
tubeRadius = 0.07534
groupRadius = 0.29851
objectRadius = 0.43077
RotNumeratorX = -2
RotNumeratorY = -4
RotDenominator = 3
Rotations = 3
Gamma = 2.2
ExponentialExposure = false
Exposure = 1.3
Brightness = 1
Contrast = 1.0891
Saturation = 1.4516
Overflow = false
OverflowA = 0.8
OverflowT = 1
SpotLight = 0.811765,1,0.819608,4.1935
SpotLightPos = 5,2.676,-0.7042
SpotLightSize = 1.25189
ShadowBackstep = 2
FocalPlane = 1.4674
Aperture = 0.02
AntiAliasScale = 2
#endpreset