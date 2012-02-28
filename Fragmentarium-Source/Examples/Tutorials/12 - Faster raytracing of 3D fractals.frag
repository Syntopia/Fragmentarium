// There are different ways to speedup
// raytracing.
//
// 1) Using the 'Preview' sliders to render at lower resolution.
// 2) Locking parameters, you do not want to change dynamically, by clicking the padlock next to them, and recompiling
// 3) Using another raytracer:
//
// In this example the 'Fast-Raytracer' is used,
// it is faster then the default one, but does
// not offer as much flexibility.
// 
// Subblue's raytracer is another faster option.
#include "Fast-Raytracer.frag"
#include "Subblue-Raytracer.frag"

// Here one of the simplest fractals,
// a distance estimated Menger cube.
#group Menger
uniform int Iterations;  slider[0,8,100]
uniform int ColorIterations;  slider[0,8,100]
uniform float Scale; slider[0.00,3.0,4.00]
uniform vec3 Offset; slider[(0,0,0),(1,1,1),(1,1,1)]

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
		if (n<ColorIterations) orbitTrap = min(orbitTrap, (vec4(abs(z),dot(z,z))));		
		n++;
	}
	
	return abs(length(z)-0.0 ) * pow(Scale, float(-n));
}

#preset Default
FOV = 0.4
Eye = -3.55741,0.119991,-2.22946
Target = 4.91261,-0.165702,3.07876
Up = 0.0398762,0.999198,-0.00374516
AntiAlias = 1
Detail = -2.35396
DetailAO = -1.00002
FudgeFactor = 1
MaxRaySteps = 56
BoundingSphere = 3.774
Dither = 0.5
NormalBackStep = 1
AO = 0,0,0,0.7
Specular = 0.1666
SpecularExp = 16
SpotLight = 1,1,1,0.19608
SpotLightDir = 0.37142,0.1
CamLight = 1,1,1,1.13978
CamLightMin = 0.29412
Glow = 1,1,1,0.07895
GlowMax = 20
Fog = 0.4161
HardShadow = 0.33846
ShadowSoft = 2
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.64935
X = 0.5,0.6,0.6,0.2126
Y = 1,0.6,0,0.30708
Z = 0.8,0.78,1,1
R = 0.666667,0.666667,0.498039,0.03174
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 6.95699
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 8
ColorIterations = 5
Scale = 3
Offset = 1,1,1
#endpreset
