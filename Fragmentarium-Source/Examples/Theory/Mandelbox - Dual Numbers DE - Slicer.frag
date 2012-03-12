#version 120
#info Mandelbox Distance Estimator.
#include "De-Raytracer-Slicer.frag"
#include "MathUtils.frag"
#group Mandelbox

// Scale parameter. A perfect Menger is 3.0
uniform float Scale; slider[-5.00,2.0,4.00]

// Scaling center
uniform vec3 Offset; slider[(0,0,0),(1,1,1),(5,5,5)]
uniform vec3 Scale2; slider[(0,0,0),(1,1,1),(25,25,25)]

uniform float fixedRadius2; slider[0.0,1.0,2.3]
uniform float minRadius2; slider[0.0,0.25,2.3]
void sphereFold(inout vec3 z, inout mat3 dz) {
	float r2 = dot(z,z);
	if (r2< minRadius2) {
		float temp = (fixedRadius2/minRadius2);
		z*= temp; dz*=temp;
	} else if (r2<fixedRadius2) {
		float temp =(fixedRadius2/r2);
		z*=temp; dz*=temp;
	}
}



uniform float foldingLimit; slider[0.0,1.0,5.0]
void boxFold(inout vec3 z, inout mat3 dz) {
	vec3 a = (1.0-2.0*step(vec3(foldingLimit),abs(z)));
	dz[0]*=a; dz[1]*=a; dz[2]*=a;
	z = clamp(z, -foldingLimit, foldingLimit) * 2.0 - z;
}
uniform int Iterations; slider[0,10,50]
uniform int ColorIterations; slider[0,2,22]
uniform float F; slider[0.1,1.1,2.3]
float DE(vec3 z, int a)
{
	mat3 dz = mat3(1.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,1.0);
	
	vec3 c = z;
	mat3 dc = dz;
	for (int n = 0; n < Iterations; n++) {
		boxFold(z,dz);
		sphereFold(z,dz);
		z*=(Scale*Scale2);
		dz=mat3(dz[0]*Scale*Scale2,dz[1]*Scale*Scale2,dz[2]*Scale*Scale2);
		z += c*Offset;
		dz += dc*mat3(Offset,Offset,Offset); // ?

		if (length(z)>1000.0) break;
		if (n<ColorIterations) orbitTrap = min(orbitTrap, (vec4(abs(z),dot(z,z))));
	}
	//float r = sqrt(dot(z,z));//*0.5/r;
	//vec3 grad = vec3(dot(z,dz[0]),dot(z,dz[1]),dot(z,dz[2]));
	return dot(z,z)/length(z*dz);
}

#preset Default
FOV = 0.4
Eye = 8.82334,-4.71515,7.86685
Target = 1.81835,-0.745648,1.93614
Up = 0.672465,0.0889031,-0.734771
AntiAlias = 1
Detail = -2.29201
DetailNormal = -2.8
DetailAO = -0.57141
FudgeFactor = 0.68675
MaxRaySteps = 56
BoundingSphere = 37.736
Dither = 0.5
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = -0.25926,0.1
CamLight = 1,1,1,1.30434
CamLightMin = 0
Glow = 1,1,1,0
Fog = 0
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 1,1,1
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
XLevel = -0.0926
PlaneZoom = 7.5294
GraphZoom = 4.2683
ZLevel = 0
Delta = -1.9444
Scale = 2.89471
Offset = 1,1,1
Scale2 = 1,1,1
fixedRadius2 = 1
minRadius2 = 0.25
foldingLimit = 1
Iterations = 10
ColorIterations = 2
F = 1.1
RAD = 0.00015
#endpreset
