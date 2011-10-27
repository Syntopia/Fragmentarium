#info Mandelbox Distance Estimator.
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Mandelbox

// Scale parameter. A perfect Menger is 3.0
uniform float Scale; slider[-5.00,2.0,4.00]

// Scaling center
uniform vec3 Offset; slider[(0,0,0),(1,1,1),(5,5,5)]

uniform float fixedRadius2; slider[0.1,1.0,2.3]
uniform float minRadius2; slider[0.1,0.25,2.3]
void sphereFold(inout vec3 z, inout float dz) {
	float r2 = dot(z,z);
/*	if (r2< minRadius2) {
		float temp = (fixedRadius2/minRadius2);

		z*= temp;
		dz*=temp;
	} else*/
    if (r2<fixedRadius2) {
		float temp =(fixedRadius2/r2);
		z*=temp;
		dz*=temp;
	}
}

uniform float foldingLimit; slider[0.0,1.0,5.0]
void boxFold(inout vec3 z, inout float dz) {
   if (z.x>foldingLimit) { z.x = 2.0*foldingLimit-z.x; } 
else if (z.x<-foldingLimit)  { z.x = - 2.0*foldingLimit-z.x; }
   if (z.y>foldingLimit) { z.y =  2.0*foldingLimit-z.y; } 
else if (z.y<-foldingLimit)  { z.y = - 2.0*foldingLimit-z.y; }
   if (z.z>foldingLimit) { z.z =  2.0*foldingLimit-z.z; } 
else if (z.z<-foldingLimit)  { z.z = - 2.0*foldingLimit-z.z; }
	//z = clamp(z, -foldingLimit, foldingLimit) * 2.0 - z;
}

uniform int Iterations; slider[0,10,50]
uniform int ColorIterations; slider[0,2,22]
uniform float F; slider[0.1,1.1,2.3]
float DE(vec3 z)
{
	vec3 c = z;
	float dr = 1.0;
	for (int n = 0; n < Iterations; n++) {
		boxFold(z,dr);
		sphereFold(z,dr);
 		z*=Scale;
 		dr*=Scale;
		z += c*Offset;
		if (n<ColorIterations) orbitTrap = min(orbitTrap, (vec4(abs(z),dot(z,z))));
	}
	float r = length(z);
	return (r-F)/abs(dr);
}

#preset Default
FOV = 0.56284
Eye = 12.835,1.5765,-1.31842
Target = 3.46295,-0.75723,0.346807
Up = 0.26907,-0.488131,0.830258
AntiAlias = 1 NotLocked
Detail = -2.35396
DetailAO = -0.14287
FudgeFactor = 1
MaxRaySteps = 105
BoundingSphere = 15.093
Dither = 0.5
NormalBackStep = 1 NotLocked
AO = 0,0,0,1
Specular = 0
SpecularExp = 16
SpotLight = 1,1,1,0.67647
SpotLightDir = -0.20988,0.1
CamLight = 1,1,1,1.65218
CamLightMin = 0.4697
Glow = 1,1,1,0.4
Fog = 0
HardShadow = 0 NotLocked
ShadowSoft = 5.5696
Reflection = 0 NotLocked
BaseColor = 1,1,1
OrbitStrength = 0.15584
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.02912
Z = 0.8,0.78,1,-0.04854
R = 0.4,0.7,1,-0.29412
BackgroundColor = 0.596078,0.6,0.513725
GradientBackground = 0.3
CycleColors = false
Cycles = 7.03846
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 2
RotVector = 1,1,1
RotAngle = 0
Offset = 1,1,1
fixedRadius2 = 1
minRadius2 = 0.25
foldingValue = 2
foldingLimit = 1
#endpreset
