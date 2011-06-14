#info Menger Distance Estimator.
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Menger
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

// Scale parameter. A perfect Menger is 3.0
uniform float Scale; slider[0.00,3.0,4.00]

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[0.00,0,180]

// Scaling center
uniform vec3 Offset; slider[(0,0,0),(1,1,1),(1,1,1)]

mat3 rot;

void init() {
	 rot = rotationMatrix3(normalize(RotVector), RotAngle);
}

// Number of fractal iterations.
uniform int Iterations;  slider[0,8,100]
uniform int ColorIterations;  slider[0,8,100]

float DE(vec3 z)
{
	int n = 0;
	while (n < Iterations) {
		for (int i = 0; i <=n; i++)	z = rot *z;
		z = abs(z);
	if (z.x<z.y){ z.xy = z.yx;}
		if (z.x< z.z){ z.xz = z.zx;}
		if (z.y<z.z){ z.yz = z.zy;}
          z = Scale*z-Offset*(Scale-1.0);
	   	if( z.z<-0.5*Offset.z*(Scale-1.0))  z.z+=Offset.z*(Scale-1.0);
	if (n<ColorIterations) orbitTrap = min(orbitTrap, (vec4(abs(z),dot(z,z))));		
	
		n++;
	}
	
	return abs(length(z)-0.0 ) * pow(Scale, float(-n));
}

#preset Default
FOV = 0.4
Eye = -3.72729,-0.0860174,-1.93389
Target = 5.14721,0.118786,2.6706
Up = -0.05334,0.997893,-0.0369503
AntiAlias = 1
AntiAliasBlur = 1
Detail = -1.53286
DetailNormal = -2.42305
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 1.8
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.7
Specular = 0.1666
SpecularExp = 16
SpotLight = 1,1,1,0.03261
SpotLightDir = 0.37142,0.1
CamLight = 1,1,1,1.13978
Glow = 1,1,1,0.07895
Fog = 0.4161
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.2126
Y = 1,0.6,0,0.30708
Z = 0.8,0.78,1,0.35434
R = 0.666667,0.666667,0.498039,0.03174
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
Scale = 3
RotVector = 1,1,1
RotAngle = 0
Offset = 1,1,1
#endpreset

#preset
FOV = 0.4
Eye = -3.70965,0.970649,0.321011
Target = 5.0221,-1.11629,-0.35233
Up = -0.199437,-0.932042,0.3025
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.43488
MaxStep = 0.38
DetailNormal = -2.42305
DetailAO = -0.42
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 1.8
BoundingSphere = 76.364
Dither = 0.5
AO = 0,0,0,1
Specular = 0
SpecularExp = 16
SpotLight = 1,1,1,0.25713
SpotLightDir = 0.66266,0.1
CamLight = 1,1,1,0.78874
CamLightMin = 0.31765
Glow = 1,1,1,0.2826
Fog = 0.3307
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.64557
X = 0.5,0.6,0.6,0.75238
Y = 1,0.6,0,0.48572
Z = 0.8,0.78,1,0.5
R = 0.545098,0,0,0.78846
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 6.36097
Size = 0.5
plnormal = -0.0297,-0.0099,-0.0693
Iterations = 3
Scale = 2.36668
Bailout = 260.104
Offset = 0.78947,1,0.29825
Angle1 = -3.7548
Rot1 = 1,1,1
Angle2 = 60.0012
Rot2 = -0.8305,-0.20338,1
#endpreset

#preset
FOV = 0.4
Eye = 0.18678,-2.50326,0.726368
Target = -1.17942,6.78003,-2.73109
Up = -0.925902,-0.243542,-0.288044
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.37391
MaxStep = -0.3
DetailNormal = -2.73168
DetailAO = -0.63
FudgeFactor = 1
MaxRaySteps = 156
MaxRayStepsDiv = 1.8
BoundingSphere = 18.181
Dither = 0.5
AO = 0,0,0,0.81
Specular = 0
SpecularExp = 16
SpotLight = 1,1,1,0.22857
SpotLightDir = -0.03614,0.1
CamLight = 1,1,1,1.32394
CamLightMin = 0.15294
Glow = 1,1,1,0.02174
Fog = 0.15748
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.20253
X = 0.5,0.6,0.6,0.2
Y = 1,0.6,0,0.2762
Z = 0.8,0.78,1,-0.08572
R = 0.666667,0.666667,0.498039,0.21154
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 4.27409
Iterations = 13
Scale = 3.1
RotVector = 1,0.40816,0.18367
RotAngle = 2.1366
Offset = 1,0.95614,1
#endpreset

