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
// Quaterion Constant (first three components)
uniform vec3 C123; slider[(-1,-1,-1),(0.18,0.88,0.24),(1,1,1)]
// Quaterion Constant (last component)
uniform float C4; slider[-1,0.16,1]

vec4 c = vec4(C123,C4); // We don't support 4-component sliders yet...

void init() {}

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
	return  0.5 * r * log(r) / length(dp);
}

#preset Default
FOV = 0.4
Eye = -0.821733,-1.82625,2.23376
Target = 2.11612,4.20274,-5.18381
Up = -0.89963,-0.087855,-0.427722
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.45252
DetailNormal = -2.8
FudgeFactor = 1
MaxRaySteps = 104
MaxRayStepsDiv = 1.8
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.7
Specular = 1.5
SpecularExp = 16
SpotLight = 1,1,1,0.38043
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
Glow = 1,1,1,0.16667
Fog = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
Iterations = 16
Threshold = 10
C123 = 0.18,0.88,0.24
C4 = 0.16
#endpreset

#preset Round
FOV = 0.4
Eye = -2.41154,0.515282,1.70343
Target = 5.67754,-1.39664,-3.85636
Up = -0.372534,0.56491,-0.736271
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.45252
DetailNormal = -2.8
FudgeFactor = 1
MaxRaySteps = 104
MaxRayStepsDiv = 1.8
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.7
Specular = 1.5
SpecularExp = 16
SpotLight = 1,1,1,0.38043
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
Glow = 1,1,1,0.16667
Fog = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
Iterations = 15
Threshold = 12.963
C123 = 0.07246,0.0145,0.0145
C4 = 0.52
#endpreset

