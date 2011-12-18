#info Noise thing
#define providesInit
#define providesColor
#define providesNormalOffset
#include "Classic-Noise.frag"
#include "DE-Raytracer3.frag"
#group Menger



// Scale parameter. A perfect Menger is 3.0
uniform float Scale; slider[0.00,1.0,4.00]
uniform float Scale2; slider[0.00,1.0,4.00]

void init() {
}

uniform float time;
uniform float Amplitude; slider[0.01,0.1,2.3]
uniform float Amplitude2; slider[0.01,0.1,2.3]
float DE(vec3 z)
{

 float l = abs(length(z)-2.0 );
float tt = time*0.4;
if (l<2.5*Amplitude) {
z+=Amplitude*vec3(cnoise( vec4(z*Scale,tt) ))
+Amplitude2*vec3(cnoise( vec4(z*Scale2,tt) ));
} else return l;
	return abs(length(z)-2.0 ) ;
}

vec3 color(vec3 z) {
float tt = time*0.151;
	return vec3(cnoise(vec4(1.0*z,tt*1.2)),
cnoise(vec4(1.0*z,tt)),cnoise(vec4(1.0*z,tt*1.4)));
}

vec3 normalOffset(vec3 z) {
	return 0; //0.0084*vec3(cnoise(0.5*z)+cnoise(0.1*z));
}

#preset Default
FOV = 0.4
Eye = -2.26624,-4.04408,-2.56897
Target = 2.00969,3.58626,2.27813
Up = -0.630956,0.635898,-0.444429
AntiAlias = 1
Detail = -2.29201
DetailAO = -1.99997
FudgeFactor = 0.45783
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
Fog = 0.4161
HardShadow = 0.33846
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.2987
X = 0.5,0.6,0.6,0.2126
Y = 1,0.6,0,0.30708
Z = 0.8,0.78,1,0.35434
R = 0.666667,0.666667,0.498039,0.03174
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 6.95699
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
ShadowSoft = 0.001
ShadowSoft2 = 0.001
Scale = 3
Scale2 = 1
Amplitude = 0.1
Amplitude2 = 0.1
#endpreset
