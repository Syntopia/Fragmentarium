#info Icosahedron Distance Estimator (Syntopia 2010)
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Icosahedron
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

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
		orbitTrap = min(orbitTrap, abs(vec4(z,dot(z,z))));
	}
	
	return (length(z) ) * pow(Scale,  float(-n));
}

#preset Default
FOV = 0.360217
Eye = 1.09202,-2.63786,-1.21447
Target = -0.300748,0.726483,0.334473
Up = -0.234934,0.324571,-0.916221
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.32115
DetailNormal = -2.01922
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 2.125
BoundingSphere = 2
Dither = 0.56521
AO = 0,0,0,0.77869
Specular = 0.8333
SpecularExp = 16
SpotLight = 1,1,1,0.32609
SpotLightDir = -0.39048,0.1
Glow = 1,1,1,0.06947
Fog = 0.33558
BaseColor = 1,1,1
OrbitStrength = 0.66337
X = 0.5,0.6,0.6,0.9685
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.79528
R = 0.4,0.7,1,0.14286
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CamLight = 1,1,1,1.26882
Scale = 2
Phi = 1.618
Offset = 0.850651,0.525731,0
Angle1 = 0
Rot1 = 1,1,1
Angle2 = 0
Rot2 = 1,1,1
Iterations = 13
#endpreset

#preset
FOV = 0.360217
Eye = 0.93574,-1.73464,1.15432
Target = -1.19656,1.79679,-1.78149
Up = -0.715769,-0.589278,-0.188964
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.43488
MaxStep = -1.42
DetailNormal = -2.39022
DetailAO = -1.4
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 2.125
BoundingSphere = 2
Dither = 0.56521
AO = 0,0,0,0.91
Specular = 0
SpecularExp = 16
SpotLight = 0.862745,1,0.870588,0.91429
SpotLightDir = -0.52,0.1
CamLight = 1,1,1,1.12676
CamLightMin = 0.29412
Glow = 1,1,1,0.09783
Fog = 0.10738
HardShadow = 0
BaseColor = 1,1,1
OrbitStrength = 0.5443
X = 0.411765,0.6,0.556863,1
Y = 0.592157,0.666667,0.592157,1
Z = 0.937255,0.905882,1,1
R = 0.666667,0.666667,0.498039,1
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 6.95699
Scale = 1.93332
Phi = 2.1654
Offset = 0.850651,0.525731,0.62281
Angle1 = -15.0048
Rot1 = -0.18644,1,1
Angle2 = 37.5012
Rot2 = 0.18644,1,1
Iterations = 13
#endpreset
