#info Menger Distance Estimator.
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group The Baird Delta

// Made by Knighty, see this thread:
// http://www.fractalforums.com/3d-fractal-generation/3d-koch-snowflake-convert-to-escape-time/15/

// Number of iterations.
uniform int Iterations;  slider[0,10,100]

// Scale parameter. A perfect Menger is 3.0
uniform float Scale; slider[0.00,3,4.00]

uniform vec3 RotVector; slider[(0,0,0),(1,0,0),(1,1,1)]

// Scale parameter. A perfect Menger is 3.0
uniform float RotAngle; slider[0.00,60,360]

// Scaling center
uniform vec3 Offset; slider[(-2,-2,-2),(1,0,0),(2,2,2)]

mat3 rot;

void init() {
	rot = rotationMatrix3(normalize(RotVector), RotAngle);
}

float DE(vec3 z)
{
	float r;
	int n = 0;
	while (n < Iterations && dot(z,z)<10000.0) {
		// Fold
		z.xy = abs(z.xy);
		if(z.y>z.x) z.xy=z.yx;
		z.y=1./3.-abs(z.y-1./3.);
		z.x+=1./3.;if(z.z>z.x) z.xz=z.zx; z.x-=1./3.;
		z.x-=1./3.;if(z.z>z.x) z.xz=z.zx; z.x+=1./3.;
		//z = rot *z;
		z=Scale* (z-Offset)+Offset;
		z = rot *z;
		
		r = dot(z, z);
		orbitTrap = min(orbitTrap, abs(vec4(z,r)));
		
		n++;
	}
	return abs(length(z)-length(Offset)) * pow(Scale, float(-n));
	//return abs(z.x-Offset.x) * pow(Scale, float(-n));
}

#preset Default
FOV = 0.4
Eye = -0.701232,3.4787,1.8253
Target = 1.00961,-5.90074,-1.72874
Up = 0.0509482,-0.344924,0.934813
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.40149
DetailNormal = -2.15383
DetailAO = -1.14751
FudgeFactor = 0.57943
MaxRaySteps = 477
MaxRayStepsDiv = 2.375
BoundingSphere = 2.7711
Dither = 0.41304
AO = 0,0,0,0.7
Specular = 3.9167
SpecularExp = 16
SpotLight = 1,1,1,0.27173
SpotLightDir = 0.1,0.1
CamLight = 1,0.533333,0.298039,1.44086
CamLightMin = 0.25234
Glow = 1,1,1,0
Fog = 0.49664
HardShadow = 0
BaseColor = 1,1,1
OrbitStrength = 0.61385
X = 0.5,0.6,0.6,0.48032
Y = 1,0.6,0,1
Z = 0.8,0.78,1,0.13386
R = 0.4,0.7,1,0.09524
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 18.1816
Iterations = 12
Scale = 2.30984
RotVector = 0.25,0.43333,0.5
RotAngle = 0
Offset = 1.8788,0.57572,-0.0606
#endpreset