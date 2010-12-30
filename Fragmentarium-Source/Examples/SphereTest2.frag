#info Sphere test
#include "include/DE-Raytracer.frag"
#group Sphere Test
uniform float Scale; slider[0,1.3,15]


float DE(vec3 z)
{
	float d= 1000.0;
	for (int i = 0; i < 7;i++) {
		z = abs(z);
		d= min(d,length(z-vec3(1.0,1.0,1.0))*pow(1.1,float(i)));
		// z += vec3(0.2,0.2,0.0);
		z*= Scale;
	}
	return d;
}

/*
AntiAlias = 2
AntiAliasScale = 1.27
LogMinDist = -2.303
LogNormalDist = -3.276
MaxDist = 4.26
MoveBack = -1.2
Limiter = 1
MaxRaySteps = 71
MaxRayStepsDiv = 1.981
AO = 1
AOColor = 0,0,0
SpotLight = 1
Specular = 2.392
SpecularExp = 12.9
SpotLightColor = 0.317647,0,1
SpotLightDir = 1,2,1
CamLight = 0.921
CamLightColor = 1,1,1
Glow = 1
GlowColor = 1,0,0
BackgroundColor = 0.0627451,0.835294,0.243137
Scale = 0.735
*/



