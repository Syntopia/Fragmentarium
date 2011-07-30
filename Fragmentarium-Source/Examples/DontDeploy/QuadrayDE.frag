#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group QuadrayDE


uniform int Iterations; slider[0,5,122]
uniform float Scale; slider[0,2,21.3]
uniform float Max; slider[0,2,21.3]

float DE(vec3 p)
{
	vec4 ct = abs(vec4(p.x+p.y+p.z,-p.x-p.y+p.z,-p.x+p.y-p.z,p.x-p.y-p.z))-Scale;
	vec4 w = ct;
	float dr = 1.0;
	float r;
	float  r2 = length(ct);	
	for (int iter=0;iter<Iterations;iter++) {
		vec4 ww = w*w;
		w = ww - ww.yxwz + 2.0*w.wwxx*w.zzyy + ct;
		r = length(w);
		dr = dr * (r/r2) *2.0 + 1.0;
		r2 = r;
		if (iter<4) orbitTrap = min(orbitTrap, abs(vec4(w.x,w.y,w.z,r)));
		if (r > 8.0) break;
	}
	return r*log(r)/dr;
}


#preset Default
FOV = 0.62536
Eye = -1.05608,1.18608,-0.902661
Target = 4.17641,-3.93279,4.09201
Up = -0.414744,0.38192,0.825909
AntiAlias = 1
AntiAliasBlur = 1
Detail = -4.87046
DetailNormal = -6.06095
DetailAO = 0
FudgeFactor = 0.36471
MaxRaySteps = 1000
MaxRayStepsDiv = 1
BoundingSphere = 2
Dither = 0
AO = 0,0,0,0.9918
Specular = 1.3333
SpecularExp = 23.958
SpotLight = 1,1,1,0.73563
SpotLightDir = -0.86666,-0.65714
CamLight = 1,1,1,0.70968
CamLightMin = 0.46729
Glow = 1,1,1,0.03509
Fog = 0.10738
HardShadow = 0
BaseColor = 1,1,1
OrbitStrength = 0.63291
X = 0.411765,0.6,0.560784,0.43308
Y = 0.666667,0.666667,0.498039,-0.79048
Z = 0.666667,0.333333,1,0.40158
R = 0.4,0.7,1,1
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 10.5344
Iterations = 21
Scale = 1.12102
Max = 2
#endpreset
