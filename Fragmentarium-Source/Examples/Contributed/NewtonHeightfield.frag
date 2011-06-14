#info Newton (z^3-1) 2.5D
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Newton

// Made by Knighty, see this thread:
// http://www.fractalforums.com/3d-fractal-generation/fragmentarium-an-ide-for-exploring-3d-fractals-and-other-systems-on-the-gpu/msg32270/#msg32270

// Number of fractal iterations.
uniform int Iterations;  slider[0,9,100]
// Slope
uniform float Slope; slider[-10,-2,10]

float k;
void init() {
	k=1./sqrt(1.+Slope*Slope);
}

float DE(vec3 pos) {
	vec2 z=pos.xy;
	float r2=dot(z,z);
	vec2 dz=vec2(1.,0.);
	int i=0;
	float delta2=0.0;
	do{
		vec2 az=z;
		float ir2=1./r2;
		vec2 tmp=vec2(1.,0.)+vec2(-z.x*(z.x*z.x-3.*z.y*z.y),z.y*(z.y*z.y-3*z.x*z.x))*ir2*ir2*ir2;
		dz=2./3.*vec2(dz.x*tmp.x-dz.y*tmp.y,dz.x*tmp.y+dz.y*tmp.x);
		z=1./3*vec2(2.*z.x+(z.x*z.x-z.y*z.y)*ir2*ir2,2.*z.y*(1.-z.x*ir2*ir2));
		r2=dot(z,z);
		orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,0.,r2)));
		delta2=dot(z-az,z-az);
		i++;
	}while(i<Iterations && delta2>0.01);
	float d=min(length(z-vec2(1.,0.)),min(length(z-vec2(-0.5,0.5*sqrt(3.))),length(z-vec2(-0.5,-0.5*sqrt(3.)))));
	float dd=length(dz);
	dd=0.5*d*log(d)/dd;
	return max(length(pos)-2.0,(pos.z-Slope*dd)*k);
}

#preset Default
FOV = 0.4
Eye = 0.0511043,1.078,1.04822
Target = 0.469086,-4.38068,-7.40283
Up = -0.0793242,-0.826634,0.557121
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.37391
MaxStep = -0.3
DetailNormal = -2.8
DetailAO = -0.7
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 1.8
BoundingSphere = 7.8769
Dither = 0.51724
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = -0.92772,-0.92772
CamLight = 1,1,1,1
CamLightMin = 0.76471
Glow = 1,1,1,0
Fog = 0.4567
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,0.25712
Y = 1,0.6,0,0.80952
Z = 0.8,0.78,1,0.06666
R = 0.4,0.7,1,0.76924
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 1.88871
Iterations = 22
Slope = 1.7432
#endpreset