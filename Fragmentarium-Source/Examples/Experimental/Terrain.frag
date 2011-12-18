#info Terrain
#define providesColor
#include "DE-Raytracer.frag"
//#include "Ashima-Noise.frag"
#include "Classic-Noise.frag"
#group Terrain

// Number of differnt noise scales
uniform int Iterations;  slider[0,9,100]
// Slope
uniform float Slope; slider[-1,-0.7,0]

uniform float FreqMul; slider[1,2,10]
uniform float Offset; slider[0,0.4,1]
uniform float AmpMul; slider[0,0.3,1]

uniform float WaterLevel; slider[0.0,0.6,1]
uniform float S; slider[0,1,3]
float height(vec3 pos) {
	float A = 1.0;
	float B = 1.0;
	float r = 0.0;
	for (int j = 0; j < Iterations; j++) {
		r+= B*cnoise(A*(pos.xy)+Offset);
		A*=FreqMul;
		B*=AmpMul;
	}
	if (r>WaterLevel) r = WaterLevel;
	return r;
}

vec3 color(vec3 pos, vec3 normal) {
	float dr = height(pos);
	if (dr==WaterLevel) return vec3(0.0,0.0,1.0);
	dr = 1.0-clamp(dr, 0.0, 1.0);
	if (dr>0.5) return  vec3(dr-0.5,1.0,dr-0.5);
	if (dr<0.5) return mix(vec3(0.0,0.0,1.0),vec3(0.0,1.0,0.0),dr*2.0);
	
}

float DE(vec3 pos) {
	float dr = height(pos);
	return (pos.z-Slope*dr);
}

#preset Default
FOV = 0.4
Eye = 33.7331,-8.49179,2.31636
Target = 39.0618,-14.7221,-2.22206
Up = 0.376281,-0.313292,0.871889
AntiAlias = 1 NotLocked
Detail = -3.53094
DetailAO = -0.00707
FudgeFactor = 0.6747
MaxRaySteps = 176
BoundingSphere = 83.019
Dither = 0.41228
AO = 0,0,0,0.93827
Specular = 3.5443
SpecularExp = 14.545
SpotLight = 1,1,0.796078,0.64706
SpotLightDir = -0.71874,-0.25
CamLight = 1,0.960784,0.921569,1.3077
CamLightMin = 0.18102
Glow = 1,1,1,0
Fog = 0.2963
HardShadow = 0.63077 NotLocked
Reflection = 0 NotLocked
BaseColor = 1,1,1
OrbitStrength = 0.81818
X = 0.5,0.6,0.6,1
Y = 1,0.6,0,0.48092
Z = 0.8,0.78,1,0.26718
R = 0.666667,0.666667,0.498039,0.58462
BackgroundColor = 0.917647,0.843137,0.564706
GradientBackground = 0
CycleColors = false
Cycles = 1.29269
EnableFloor = false NotLocked
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
NormalBackStep = 1
GlowMax = 10
ShadowSoft = 2.258
Iterations = 8
S = 1
Slope = -0.63717
FreqMul = 2.45458
Offset = 0.8122
AmpMul = 0.30189
WaterLevel = 0.48864
#endpreset