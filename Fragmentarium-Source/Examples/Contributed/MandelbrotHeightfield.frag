#info Mandelbrot set 2.5D
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Mandelbrot

// Made by Knighty, see this thread:
// http://www.fractalforums.com/3d-fractal-generation/fragmentarium-an-ide-for-exploring-3d-fractals-and-other-systems-on-the-gpu/msg32270/#msg32270

// Number of fractal iterations.
uniform int Iterations;  slider[0,9,100]
// Bailout radius
uniform float Bailout; slider[0,128,1024]
// Slope
uniform float Slope; slider[-10,-2,10]

float k;
void init() {
	k=1./sqrt(1.+Slope*Slope);
}

float DE(vec3 pos) {
	vec2 z=pos.xy;
	vec2 z0=z;
	float r2=dot(z,z);
	vec2 dz=vec2(1.,0.);
	int i=0;
	for(i=0;i<Iterations && r2<Bailout;i++){
		dz=2.*vec2(dz.x*z.x-dz.y*z.y+1.,dz.x*z.y+dz.y*z.x);
		z=vec2(z.x*z.x-z.y*z.y,z.x*z.y*2.)+z0;
		r2=dot(z,z);
		orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,0.,r2)));
	}
	float r=sqrt(r2);
	float dr=length(dz);
	dr=0.4*r*log(r)/dr;
	//	if(r2<4.) dr=0.;
	return (pos.z-Slope*dr)*k;
}

#preset default
FOV = 0.4
Eye = -0.787305,0.11544,2.49081
Target = -0.0626793,0.151149,-7.63958
Up = -0.534903,-0.838818,-0.0412184
AntiAlias = 1
AntiAliasBlur = 1
Detail = -5.05218
MaxStep = 2
DetailNormal = -2.64635
DetailAO = -0.5
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 1.8
BoundingSphere = 10
Dither = 0.5
AO = 0,0,0,0.7
Specular = 3.9796
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = -0.73496,0.1
CamLight = 1,1,1,1.12676
CamLightMin = 0
Glow = 1,1,1,0
Fog = 0.3937
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.67089
X = 0.5,0.6,0.6,1
Y = 1,0.6,0,-0.33334
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.3077
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 1.35415
CycleColors = true
Cycles = 1.29269
Iterations = 21
Bailout = 1024
Slope = -1.0092
#endpreset