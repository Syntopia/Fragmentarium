#info 4D Quaternion Julia Distance Estimator
#include "DE-Raytracer.frag"
#group 4D Quaternion Julia

// The DE implementation here is based on the implementation by Subblue:
//  http://www.subblue.com/blog/2009/9/20/quaternion_julia
// which in turn is based on a CG shader by Keenan Crane.
// My implementation here is very compressed, so take a look at Subblue's above for a much clearer implementation.

// Number of fractal iterations.
uniform int Iterations;  slider[0,16,100]
// Breakout distance
uniform float Threshold; slider[0,10,100]
// Quaterion Constant
uniform vec4 C; slider[(-1,-1,-1,-1),(0.18,0.88,0.24,0.16),(1,1,1,1)]

// Mul = 2 is standard stereographic projection
uniform float Mul; slider[0,2,3]
vec4 stereographic3Sphere(vec3 p) {
	float n = dot(p,p)+1.;
	return vec4(Mul*p,n-2.)/n;
}

// The inline expanded quaterion multiplications make this DE
// look much worse than it actually i

uniform vec3 Offset; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
float DE(vec3 pos) {
float rr = length(pos);
vec4 p = stereographic3Sphere(pos);
p.xyz += Offset;
//vec4 p=vec4(2.*pos,-1.+rr*rr)*1./(1.+rr*rr);//Inverse stereographic projection of pos: z4 lies onto the unit 3-sphere centered at 0.
	
	vec4 dp = vec4(1.0, 0.0,0.0,0.0);
	for (int i = 0; i < Iterations; i++) {
		dp = 2.0* vec4(p.x*dp.x-dot(p.yzw, dp.yzw), p.x*dp.yzw+dp.x*p.yzw+cross(p.yzw, dp.yzw));
		p = vec4(p.x*p.x-dot(p.yzw, p.yzw), vec3(2.0*p.x*p.yzw)) + C;
		float p2 = dot(p,p);
		orbitTrap = min(orbitTrap, abs(vec4(p.xyz,p2)));
		if (p2 > Threshold) break;
	}
	float r = length(p);
	return  0.5 * r * log(r) / length(dp);
}

#preset Default
FOV = 0.4
Eye = -0.15121,-0.897225,0.385303
Target = -5.15691,3.34215,-7.16259
Up = -0.574708,-0.814765,-0.0764826
EquiRectangular = false
FocalPlane = 1
Aperture = 0
Gamma = 2.17595
ToneMapping = 3
Exposure = 0.3261
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 2
Detail = -3.01273
DetailAO = -0.5
FudgeFactor = 1
MaxRaySteps = 104
Dither = 0.5
NormalBackStep = 1
AO = 0.529412,0.352941,0,0.7
CamLight = 1,1,1,1
CamLightMin = 0
Glow = 1,1,1,0.16667
GlowMax = 20
Fog = 0
SpecularMax = 10
DebugSun = false
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 1,0.666667,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 16
Threshold = 10
C = 0.18,0.36364,0.12122,0.60606
Mul = 2.10237
Offset = 1,1,1
Specular = 1.5
SpecularExp = 16
SpotLight = 1,1,1,0.38043
SpotLightDir = 0.1,0.1
HardShadow = 0
ShadowSoft = 2
Reflection = 0
#endpreset

#preset Round
FOV = 0.4
Eye = -2.41154,0.515282,1.70343
Target = 5.67754,-1.39664,-3.85636
Up = -0.352715,0.598185,-0.71888
AntiAlias = 1
Detail = -2.52252
DetailAO = -0.5
FudgeFactor = 1
MaxRaySteps = 104
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.7
Specular = 1.5
SpecularExp = 16
SpotLight = 1,1,1,0.38043
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
CamLightMin = 0
Glow = 1,1,1,0.16667
Fog = 0
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.666667,0,0.498039
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 15
Threshold = 12.963
C = 0.07246,0.0145,0.0145,0.52
#endpreset

