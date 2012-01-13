#info Shader test
#include "Soft-Raytracer.frag"
#include "QuilezLib.frag"
uniform float S; slider[0.1,1.1,2.3]
uniform vec3 V; slider[(0,0,0),(1,1,1),(10,10,10)]
float DE(vec3 pos) {
vec3 p = pos;
p.yz= mod(p.yz,S)-vec2(S/2.0);
float d  = udRoundBox(p,V/10.0,0.1);
 return min(min(length(pos-SpotLightPos)-1.0, d), pos.x);
}

#preset Default
FOV = 0.4
Eye = 3.6247,-9.11009,-8.46203
Target = -0.846756,-4.04732,-1.08812
Up = 1,0,0
Gamma = 2.03295
Exposure = 1.5999
AntiAlias = 1
Detail = -2.40625
DetailAO = -0.08645
FudgeFactor = 1
MaxRaySteps = 56
BoundingSphere = 12
Dither = 0.5
NormalBackStep = 1
AO = 0,0,0,1
Specular = 0.2532
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightPos = 10,0,0
SpotLightSize = 0.1
CamLight = 1,1,1,1.23076
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 0.67692 NotLocked
ShadowSoft = 2.5806
Reflection = 0 NotLocked
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
ShadowBackstep = 2
FocalPlane = 6.6
Aperture = 0.09157
AntiAliasScale = 1
S = 1.11167
V = 10,0.0763,0
#endpreset