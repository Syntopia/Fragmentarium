#info Knot system (DarkBeam formula)

// Based on DarkBeam formula from this thread:
// http://www.fractalforums.com/new-theories-and-research/not-fractal-but-funny-trefoil-knot-routine

#define providesColor
#include "Soft-Raytracer.frag"
#define PI 3.1415927

#group Knot
uniform float R1; slider[0.0,1.6,2.3]
uniform float R2; slider[0.0,0.1,2.3]
uniform float R3; slider[0.0,1.6,2.3]
uniform float R5; slider[0.0,1.6,2.3]
uniform float a; slider[0,1,5]
uniform float b; slider[0,1,5]
uniform float polyfoldOrder; slider[0,2,15]
void rotate(inout vec2 v, float angle) {
	v = vec2(cos(angle)*v.x+sin(angle)*v.y,
		-sin(angle)*v.x+cos(angle)*v.y);
}

vec3 color(vec3 p, vec3 n) {
	vec3 pos = p;
	float mobius = ((a+b)/polyfoldOrder) * atan(p.y,p.x);
	p.x = length(p.xy)-R1;
	rotate(p.xz,mobius);
	float m = polyfoldOrder/ (2.*PI);
	float angle = floor(.5+m*(PI/2.-atan(p.x,p.z)))/m;
	rotate(p.yz,R5);
	rotate(p.xz,angle);
	p.x =p.x -  R3;
	float ang = abs(4.0*(PI/2.-atan(p.x,p.z))/3.1415);
	if (mod(ang,0.4)<0.02) return vec3(0.0,0.0,0.0);
	return vec3(2.0);
}


float maxDim(vec2 a) { return max(a.x,a.y); }

float DE(vec3 p) {
	float mobius = ((a+b)/polyfoldOrder) * atan(p.y,p.x);
	p.x = length(p.xy)-R1;
	rotate(p.xz,mobius);
	
	float m = polyfoldOrder/ (2.*PI);
	float angle = floor(.5+m*(PI/2.-atan(p.x,p.z)))/m;
	rotate(p.yz,R5);
	rotate(p.xz,angle);
	p.x =p.x -  R3;
	return length(p.xz)-R2;
}

#preset Default
Gamma = 2.0354
ExponentialExposure = false
Exposure = 1.5465
Brightness = 1
Contrast = 1
Saturation = 1
FOV = 0.4
Eye = -2.62155,-5.82884,-4.13881
Target = 0.779495,1.61191,1.61168
Up = -0.116269,0.640082,-0.759458
AntiAlias = 1
Detail = -2.84746
DetailAO = -0.20391
FudgeFactor = 0.75
MaxRaySteps = 83
BoundingSphere = 12
Dither = 0.5
NormalBackStep = 1
AO = 0,0,0,0.89535
Specular = 1.5476
SpecularExp = 25
SpotLight = 0.431373,0.537255,1,1
SpotLightPos = 5,-2.2034,0
SpotLightSize = 0.34327
CamLight = 1,1,1,1
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 0.47143 NotLocked
ShadowSoft = 0.8956
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.5701
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
ShadowBackstep = 2
FocalPlane = 4.84535
Aperture = 0.04381
AntiAliasScale = 2.1053
R1 = 2.01036
R2 = 0.28964
R3 = 0.86889
R5 = 0
a = 0
b = 2
polyfoldOrder = 3
#endpreset

