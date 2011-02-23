#info Menger Distance Estimator.
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Menger
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

// Number of iterations.
uniform int Iterations;  slider[0,13,100]

// Scale parameter. A perfect Menger is 3.0
uniform float Scale; slider[0.00,3.0,4.00]

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

// Scale parameter. A perfect Menger is 3.0
uniform float RotAngle; slider[0.00,0,180]

// Scaling center
uniform vec3 Offset; slider[(0,0,0),(1,1,1),(1,1,1)]

mat3 rot;

void init() {
	 rot = rotationMatrix3(normalize(RotVector), RotAngle);
}

float DE(vec3 z)
{
	int n = 0;
	while (n < Iterations) {
		z = abs(z);
		if (z.x<z.y){ z.xy = z.yx;}
		if (z.x< z.z){ z.xz = z.zx;}
		if (z.y<z.z){ z.yz = z.zy;}
             z = Scale*z-Offset*(Scale-1.0);
		if( z.z<-0.5*Offset.z*(Scale-1.0))  z.z+=Offset.z*(Scale-1.0);
		z = rot *z;
		if (n<2) orbitTrap = min(orbitTrap, (vec4(abs(z),dot(z,z))));		
		n++;
	}
	
	return (length(z) ) * pow(Scale, float(-n));
}

/*
AntiAlias = 2
AntiAliasBlur = 1
Detail = -2.961
DetailNormal = -3.297
BackStepNormal = 0.466
ClarityPower = 0
MaxDist = 6
Clipping = 0
FudgeFactor = 1
MaxRaySteps = 112
MaxRayStepsDiv = 2.88
BandingSmooth = 0.26
AO = 0.7
AOColor = 0,0,0
SpotLight = 1
Specular = 1.62
SpecularExp = 18.8
SpotLightColor = 1,1,1
SpotLightDir = 0.1,0.1
CamLight = 1
CamLightColor = 1,0.933333,0.666667
Glow = 0.2
GlowColor = 1,1,1
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
BaseColor = 1,1,1
OrbitStrength = 1
XStrength = -0.008
X = 0.6,0.0117647,0.0117647
YStrength = 0
Y = 1,0.6,0
ZStrength = -0.166
Z = 1,1,1
RStrength = 0.228
R = 1,1,1
Iterations = 14
Scale = 3
RotVector = 0,0,1
RotAngle = 99
Offset = 0.949,1,1
*/

