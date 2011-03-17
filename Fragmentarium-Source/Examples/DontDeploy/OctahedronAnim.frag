#info Octahedron Distance Estimator (Syntopia 2010)
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Octahedron
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

uniform float Scale; slider[0.00,2,4.00]

uniform vec3 Offset; slider[(0,0,0),(1,0,0),(1,1,1)]
uniform float time;
uniform float Angle1; slider[-180,0,180]
uniform vec3 Rot1; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
uniform float Angle2; slider[-180,0,180]
uniform vec3 Rot2; slider[(-1,-1,-1),(1,1,1),(1,1,1)]


mat3 fracRotation2;
mat3 fracRotation1;

void init() {
	fracRotation2 = rotationMatrix3(normalize(Rot2), Angle2+time*36.0);
	fracRotation1 = rotationMatrix3(normalize(Rot1), Angle1);
}

// Number of fractal iterations.
uniform int Iterations;  slider[0,13,100]

// The fractal distance estimation calculation
float DE(vec3 z)
{
	float r;
	
	// Iterate to compute the distance estimator.
	int n = 0;
	while (n < Iterations) {
		z *= fracRotation1;
		
		if (z.x+z.y<0.0) z.xy = -z.yx;
		if (z.x+z.z<0.0) z.xz = -z.zx;
		if (z.x-z.y<0.0) z.xy = z.yx;
		if (z.x-z.z<0.0) z.xz = z.zx;
		
		z = z*Scale - Offset*(Scale-1.0);
		z *= fracRotation2;
		
		r = dot(z, z);
             orbitTrap = min(orbitTrap, abs(vec4(z,r)));
		
		n++;
	}
	
	return (length(z) ) * pow(Scale, -float(n));
}


/*
AntiAlias = 3
AntiAliasBlur = 1
Detail = -2.709
DetailNormal = -2.555
BackStepNormal = 0
ClarityPower = 1
MaxDist = 6
Clipping = 0
FudgeFactor = 0.981
MaxRaySteps = 154
MaxRayStepsDiv = 1.8
BandingSmooth = 0
AO = 0.796
AOColor = 0,0,0
SpotLight = 0.41
Specular = 0.67
SpecularExp = 16
SpotLightColor = 1,1,1
SpotLightDir = -0.486,0.1
CamLight = 0.772
CamLightColor = 1,1,1
Glow = 0.2
GlowColor = 1,1,1
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
BaseColor = 1,1,1
OrbitStrength = 1
XStrength = 1
X = 0.498039,0.6,0.6
YStrength = 1
Y = 1,0.6,0
ZStrength = 1
Z = 0.8,0.776471,1
RStrength = 0.1
R = 0.992157,1,0.843137
Scale = 1.72
Offset = 0.676,0.257,0.029
Angle1 = -119.16
Rot1 = 0.4,0.186,0.258
Angle2 = -180
Rot2 = -0.472,1,-0.628
Iterations = 16
*/
