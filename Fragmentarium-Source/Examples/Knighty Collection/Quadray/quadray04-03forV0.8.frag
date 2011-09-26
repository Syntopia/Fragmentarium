// A variation on Aexion's Quadray formula
//Script by Knighty.
#version 120
#info Quadray sets Distance Estimator
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Quadray

// Number of fractal iterations.
uniform int Iterations;  slider[0,11,100]

// Bailout radius
uniform float Bailout; slider[2,3.5,64]

//Offset int the 4th dimension
uniform float Offset; slider[-2,0,1]

//sign. Actually a factor of the c value
uniform float Sign; slider[-2,0,2]


const mat3x4 mc=mat3x4(vec4(.5,-.5,-.5,.5),
						     vec4(.5,-.5,.5,-.5),
						     vec4(.5,.5,-.5,-.5));
float DE(vec3 pos) {
	vec4 cp=abs(mc*pos)+vec4(Offset);
	vec4  z=cp;
	float r=length(z);
	cp*=Sign;
	float dr=1.;
	for(int i=0; i<Iterations && r<Bailout;i++){
		dr=2.*r*dr+1.;
		vec4 tmp0=z*z;
		vec2 tmp1=2.*abs(z.wx*z.zy);
		z=abs(tmp0-tmp0.yxwz+tmp1.xxyy+cp);
		r=length(z);
		orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,r*r)));
	}
	return r*log(r)/dr;
}
#preset default
FOV = 1.01865
Eye = -1.90825,2.30864,-1.52399
Target = 9.32626,-10.7536,6.14975
Up = 0.598489,0.650652,0.231343
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.86132
DetailNormal = -2.28844
FudgeFactor = 0.51402
MaxRaySteps = 365
MaxRayStepsDiv = 1.75
BoundingSphere = 3.012
Dither = 0
AO = 0,0,0,1
Specular = 1.3333
SpecularExp = 23.958
SpotLight = 1,1,1,0.41304
SpotLightDir = -0.1619,0.80952
CamLight = 1,1,1,1.20428
Glow = 1,1,1,0
Fog = 0
BaseColor = 0.690196,0.690196,0.690196
OrbitStrength = 0.35644
X = 0.898039,0.843137,0.211765,0.55906
Y = 0.0862745,0.666667,0.184314,0.71654
Z = 0.239216,0.670588,1,0.65354
R = 1,0.498039,0.160784,0.2381
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 3.81524
Iterations = 11
Bailout = 3.5
Offset = -0.25001
Sign = -0.79724
#endpreset