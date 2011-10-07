#info Mandelbrot set 2.5D
#define providesInit
#define providesColor
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Mandelbrot

// Made by Knighty, see this thread:
// http://www.fractalforums.com/3d-fractal-generation/fragmentarium-an-ide-for-exploring-3d-fractals-and-other-systems-on-the-gpu/msg32270/#msg32270
// Updated by Syntopia to support Julia's and the standard color scheme

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

uniform float CR; slider[0,0,1]
uniform float CG; slider[0,0.4,1]
uniform float CB; slider[0,0.7,1]

uniform bool Julia; checkbox[false]
uniform float JuliaX; slider[-2,-0.6,2]
uniform float JuliaY; slider[-2,1.3,2]

vec2 c2 = vec2(JuliaX,JuliaY);


vec3 color(vec3 pos) {
	
	vec2 z = Julia ?  pos.xy : vec2(0.0,0.0);
	
	vec2 z0=z;
	float r2=dot(z,z);
	vec2 dz=vec2(1.,0.);
	int i=0;
	for(i=0;i<Iterations && r2<Bailout;i++){
		dz=2.*vec2(dz.x*z.x-dz.y*z.y+1.,dz.x*z.y+dz.y*z.x);
		z=vec2(z.x*z.x-z.y*z.y,z.x*z.y*2.)+ (Julia ? c2 : pos.xy);
		r2=dot(z,z);
		orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,0.,r2)));
	}
	if (i < Iterations) {
		// The color scheme here is based on one
		// from Inigo Quilez's Shader Toy:
		float co =  float( i) + 1.0 - log2(.5*log2(dot(z,z)));
		co = sqrt(co/256.0);
		return vec3( .5+.5*cos(6.2831*co+CR),
			.5+.5*cos(6.2831*co + CG),
			.5+.5*cos(6.2831*co +CB) );
	}  else {
		return vec3(1.0);
	}
}

float DE(vec3 pos) {
	
	vec2 z = Julia ?  pos.xy : vec2(0.0,0.0);
	
	vec2 z0=z;
	float r2=dot(z,z);
	vec2 dz=vec2(1.,0.);
	int i=0;
	for(i=0;i<Iterations && r2<Bailout;i++){
		dz=2.*vec2(dz.x*z.x-dz.y*z.y+1.,dz.x*z.y+dz.y*z.x);
		z=vec2(z.x*z.x-z.y*z.y,z.x*z.y*2.)+ (Julia ? c2 : pos.xy);
		r2=dot(z,z);
		orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,0.,r2)));
	}
	float r=sqrt(r2);
	float dr=length(dz);
	dr=0.4*r*log(r)/dr;
	// if (i == Iterations) dr = 0;
	if(r2<4.) dr=0.;
	return (pos.z-Slope*dr)*k;
}

#preset Default
FOV = 0.4
Eye = 0.121759,1.71037,1.46913
Target = -2.23877,-4.30044,-5.32111
Up = -0.366538,-0.629374,0.684553
AntiAlias = 1
Detail = -2.53981
DetailAO = -1.44445
FudgeFactor = 0.85586
MaxRaySteps = 154
BoundingSphere = 10
Dither = 0.17606
NormalBackStep = 1
AO = 0,0,0,0.70642
Specular = 4.6729
SpecularExp = 19.277
SpotLight = 1,1,1,0.4
SpotLightDir = -0.73914,0.1
CamLight = 1,1,1,1.375
CamLightMin = 0
Glow = 1,1,1,0.79208
GlowMax = 24
Fog = 0.33824
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.55
X = 0.5,0.6,0.6,1
Y = 1,0.6,0,0.48092
Z = 0.8,0.78,1,0.26718
R = 0.666667,0.666667,0.498039,0.58462
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 1.35415
CycleColors = false
Cycles = 1.29269
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 23
Bailout = 1024
Slope = -3.0508
#endpreset