#info Menger Distance Estimator.
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group The Baird Delta
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

// Number of iterations.
uniform int Iterations;  slider[0,10,100]
uniform int ColorIterations;  slider[0,2,100]

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

uniform float YOff; slider[0,0.333333,1]

float DE(vec3 z)
{
	float r;
	int n = 0;
	while (n < Iterations && dot(z,z)<10000.0) {
		// Fold
		z.xy = abs(z.xy);
		if(z.y>z.x) z.xy=z.yx;
		z.y=YOff-abs(z.y-YOff);
		z.x+=1./3.;if(z.z>z.x) z.xz=z.zx; z.x-=1./3.;
		z.x-=1./3.;if(z.z>z.x) z.xz=z.zx; z.x+=1./3.;
		//z = rot *z;
		z=Scale* (z-Offset)+Offset;
		z = rot *z;
		
		r = dot(z, z);
		if (n<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z,r)));
		
		n++;
	}
	return abs(length(z)-length(Offset)) * pow(Scale, float(-n));
	//return abs(z.x-Offset.x) * pow(Scale, float(-n));
}

#preset Default
FOV = 0.4
Eye = -0.344477,3.68448,0.828369
Target = 1.08336,-6.33643,-0.208287
Up = 0.0219566,-0.0997776,0.99475
AntiAlias = 1
Detail = -2.84956
DetailAO = -1.14751
FudgeFactor = 0.57943
MaxRaySteps = 477
BoundingSphere = 2.7711
Dither = 0.41304
AO = 0,0,0,0.7
Specular = 3.9167
SpecularExp = 16
SpotLight = 1,1,1,0.27173
SpotLightDir = 0.71876,-0.1875
CamLight = 1,0.533333,0.298039,1.44086
CamLightMin = 0.25234
Glow = 1,1,1,0
Fog = 0.38888
HardShadow = 0.29231
Reflection = 0
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
FloorNormal = 0,0,1
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 12
ColorIterations = 2
Scale = 2.37624
RotVector = 0.25,0.43333,0.5
RotAngle = 0
Offset = 2,0.54944,-0.06592
YOff = 0.333333
#endpreset

#preset p2
FOV = 0.4
Eye = 0.833223,0.664228,0.757298
Target = -6.21362,-5.56146,-1.1968
Up = -0.165515,-0.121632,0.978678
AntiAlias = 1
Detail = -2.47786
DetailAO = -1.43451
FudgeFactor = 1
MaxRaySteps = 56
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
CamLightMin = 0
Glow = 1,1,1,0
Fog = 0
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
ColorIterations = 2
Scale = 2.1408
RotVector = 0,0.8,0
RotAngle = 107.028
Offset = 1,0.45452,0.03032
YOff = 0.333333
#endpreset