#info Shader test
#include "Sky-Pathtracer.frag"
#include "QuilezLib.frag"
uniform float S; slider[0.1,1.1,2.3]
uniform vec3 V; slider[(0,0,0),(1,1,1),(10,10,10)]
float DE(vec3 pos) {
	pos = pos.zxy;
	vec3 p = pos;
	p.yz= mod(p.yz,S)-vec2(S/2.0);
	float d  = udRoundBox(p,V/10.0,0.1);
	return min(min(length(pos)-1.0, d), pos.x);
}



#preset Noname
FOV = 0.393552
Eye = -6.25504,-1.12798,4.19403
Target = 1.18359,-0.580161,-2.46681
Up = 0.716076,0.0574899,0.695651
EquiRectangular = false
FocalPlane = 6.6
Aperture = 0
Gamma = 2.03295
ToneMapping = 3
Exposure = 3
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 1
Detail = -2.40625
FudgeFactor = 1
MaxRaySteps = 90
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
CycleColors = false
Cycles = 1.1
turbidity = 2
sunSize = 0.7165
SunPos = 0.13939,0.60303
Stratify = false
RayDepth = 3
Albedo = 0.56456
BiasedSampling = true
S = 1.1
V = 1,1,1
Reflectivity = 0
DebugLast = false
#endpreset
