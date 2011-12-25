#info Icosahedral polyhedra Distance Estimator (knighty 2011)
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Icosahedral

//Cut and fold (Houdini?) technique with icosahedral folding
//Well... in 2d, it's proved that any (?) polygon can be obtained with Cut and fold
//Is it the same for polyhedras?

//feel free to play with this code by:
// - adding removing and changing the folding planes
// - use other cuts: 2+ planes, curved surfaces...etc.
// - optimize code :P
// -...etc :)

//Size of the polyhedra
uniform float Size; slider[-2.0,.5,2.00]

//normal of the cutting plane
uniform vec3 plnormal; slider[(-1,-1,-1),(1,0,0),(1,1,1)]

#define Phi (.5*(1.+sqrt(5.)))

vec3 n1 = normalize(vec3(-Phi,Phi-1.0,1.0));
vec3 n2 = normalize(vec3(1.0,-Phi,Phi+1.0));
vec3 n3 = normalize(vec3(0.0,0.0,-1.0));

void init() {
}

float DE(vec3 z)
{
	float t;
	
	// Folds.
	//Dodecahedral
	z = abs(z);
	t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	z = abs(z);
	t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	z = abs(z);
	//t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	//t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	
	//Distance to the plane going through vec3(Size,0.,0.) and which normal is plnormal
	return abs(dot(z-vec3(Size,0.,0.),normalize(plnormal)));
}

#preset Default
FOV = 0.4
Eye = 4.33619,0.977377,-1.02974
Target = -3.61514,-1.02586,0.81858
Up = -0.296733,0.362741,-0.883381
AntiAlias = 1
Detail = -2.60183
DetailAO = -1.00002
FudgeFactor = 0.90361
MaxRaySteps = 66
BoundingSphere = 76.364
Dither = 0.26316
NormalBackStep = 1
AO = 0,0,0,1
Specular = 0
SpecularExp = 16
SpotLight = 1,1,1,0.25713
SpotLightDir = 0.66266,0.1
CamLight = 1,1,1,1.23076
CamLightMin = 0.31765
Glow = 1,1,1,0.2826
GlowMax = 20
Fog = 0.3307
HardShadow = 0.15384
ShadowSoft = 2
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.71428
Y = 1,0.666667,0,0.71428
Z = 0.8,0.78,1,0.2
R = 0.666667,0.333333,0.498039,0.98076
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.17235
CycleColors = false
Cycles = 6.36097
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Size = 0.4918
plnormal = 1,-0.0495,0.70298
#endpreset