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
uniform float Threshold; slider[0,10,1000]
// Quaterion Constant (first three components)
uniform vec3 C123; slider[(-1,-1,-1),(0.18,0.88,0.24),(1,1,1)]
// Quaterion Constant (last component)
uniform float C4; slider[-1,0.16,1]

vec4 c = vec4(C123,C4); // We don't support 4-component sliders yet...

void init() {}
uniform float XX; slider[0.1,1.1,20.3]
// The inline expanded quaterion multiplications make this DE
// look much worse than it actually is.
float DE(vec3 pos) {


	vec4 p = vec4(pos, 0.0);
	vec4 dp = vec4(1.0, 0.0,0.0,0.0);
	for (int i = 0; i < Iterations; i++) {
		dp = 2.0* vec4(p.x*dp.x-dot(p.yzw, dp.yzw), p.x*dp.yzw+dp.x*p.yzw+cross(p.yzw, dp.yzw));
		p = vec4(p.x*p.x-dot(p.yzw, p.yzw), vec3(2.0*p.x*p.yzw)) + c;
		float p2 = dot(p,p);
		orbitTrap = min(orbitTrap, abs(vec4(p.xyz,p2)));
		if (p2 > Threshold) break;
	}
	float r = length(p);

	float a=  0.5 * r * log(r) / length(dp);
float b = (fract(length(pos*XX))-0.5);
if (b<0) b=0;
return min(10000.0,b);
}

#preset Default
FOV = 0.353322
Eye = 4.13347,-0.121162,-0.622232
Target = -3.93717,0.886555,-0.982875
Up = 0.0677939,0.197469,-0.965354
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.67885
DetailNormal = -0.26922
DetailAO = -0.80325
FudgeFactor = 1
MaxRaySteps = 87
MaxRayStepsDiv = 3.25
BoundingSphere = 2.5301
Dither = 1
AO = 0,0,0,0.95082
Specular = 4.8333
SpecularExp = 8.333
SpotLight = 1,1,1,0.29348
SpotLightDir = -0.90476,0.37142
CamLight = 1,1,1,1
CamLightMin = 1
Glow = 0.666667,0.333333,0,0.61404
Fog = 0.22818
HardShadow = 0
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,0.59056
Y = 1,0.6,0,0.13386
Z = 0,1,0.0666667,0.70078
R = 0.4,0.7,1,-0.14286
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.57145
CycleColors = true
Cycles = 1.58603
Iterations = 3
C123 = 0.37682,0,-0.02898
C4 = -0.76
XX = 0.74135
Threshold = 1000
#endpreset

