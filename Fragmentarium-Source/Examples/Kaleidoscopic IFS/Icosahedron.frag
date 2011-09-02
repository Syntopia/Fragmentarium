#info Icosahedron Distance Estimator (Syntopia 2010)
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Icosahedron
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/
//
// Notice, that this polyhedron uses homogeneous coordinates to combine
// translations, scaling, and fractal rotations into one 4x4 matrix.
uniform float Scale; slider[0.00,2.0,4.00]

uniform float Phi; slider[-5,1.618,5]

vec3 n1 = normalize(vec3(-Phi,Phi-1.0,1.0));
vec3 n2 = normalize(vec3(1.0,-Phi,Phi+1.0));
vec3 n3 = normalize(vec3(0.0,0.0,-1.0));

uniform vec3 Offset; slider[(0,0,0),(0.850650808,0.525731112,0),(1,1,1)]

uniform float Angle1; slider[-180,0,180]
uniform vec3 Rot1; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
uniform float Angle2; slider[-180,0,180]
uniform vec3 Rot2; slider[(-1,-1,-1),(1,1,1),(1,1,1)]

mat4 M;

void init() {
	mat4 fracRotation2 = rotationMatrix(normalize(Rot2), Angle2);
	mat4 fracRotation1 = rotationMatrix(normalize(Rot1), Angle1);
       M = fracRotation2 * translate(Offset) * scale4(Scale) * translate(-Offset) * fracRotation1;
}


// Number of fractal iterations.
uniform int Iterations;  slider[0,13,100]
uniform int ColorIterations;  slider[0,3,100]

float DE(vec3 z)
{
	float t;
	
	// Prefolds.
	z = abs(z);
	t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	t =dot(z,n3); if (t>0.0) { z-=2.0*t*n3; }
	t =dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	
	// Iterate to compute the distance estimator.
	int n = 0;
	while (n < Iterations) {
		// Fold
		z = abs(z);
		t =dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		
		// Rotate, scale, rotate (we need to cast to a 4-component vector).
		z = (M*vec4(z,1.0)).xyz;
		n++;
		if (n < ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z,dot(z,z))));
	}
	
	return (length(z) ) * pow(Scale,  float(-n));
}

#preset Default
FOV = 0.360217
Eye = 1.24677,-0.453256,2.80462
Target = -0.2796,0.0838392,-0.806416
Up = 0.799555,-0.503967,-0.326694
AntiAlias = 1
Detail = -2.66371
DetailAO = -1.00002
FudgeFactor = 0.54217
MaxRaySteps = 56
BoundingSphere = 2
Dither = 0.58772
AO = 0,0,0,0.77869
Specular = 1.1392
SpecularExp = 16
SpotLight = 1,1,1,0.2745
SpotLightDir = -0.39048,0.1
CamLight = 1,1,1,0.88462
CamLightMin = 0.29412
Glow = 1,1,1,0.27397
Fog = 0
HardShadow = 0.33846
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.83117
X = 0.5,0.6,0.6,0.02912
Y = 1,0.6,0,0.32038
Z = 0.8,0.78,1,0.79528
R = 0,0.333333,0.498039,0.39216
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 6.95699
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 2
Phi = 1.618
Offset = 0.850651,0.525731,0
Angle1 = 0
Rot1 = 1,1,1
Angle2 = 0
Rot2 = 1,1,1
Iterations = 13
ColorIterations = 4
#endpreset

#preset Variation 1
FOV = 0.360217
Eye = 1.24677,-0.453256,2.80462
Target = -0.2796,0.0838392,-0.806416
Up = 0.799555,-0.503967,-0.326694
AntiAlias = 1
Detail = -2.66371
DetailAO = -1.00002
FudgeFactor = 0.54217
MaxRaySteps = 56
BoundingSphere = 2
Dither = 0.58772
AO = 0,0,0,0.77869
Specular = 1.1392
SpecularExp = 16
SpotLight = 1,1,1,0.2745
SpotLightDir = -0.39048,0.1
CamLight = 1,1,1,0.88462
CamLightMin = 0.29412
Glow = 1,1,1,0.27397
Fog = 0
HardShadow = 0.33846
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.83117
X = 0.5,0.6,0.6,0.02912
Y = 1,0.6,0,0.32038
Z = 0.8,0.78,1,0.79528
R = 0,0.333333,0.498039,0.39216
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 6.95699
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 1.93332
Phi = 2.1654
Offset = 0.850651,0.525731,0.62281
Angle1 = -15.0048
Rot1 = -0.18644,1,1
Angle2 = 37.5012
Rot2 = 0.18644,1,1
Iterations = 13
ColorIterations = 4
#endpreset
