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

#preset Default
FOV = 0.4
Eye = -0.927743,0.809242,1.89287
Target = 0.208408,-2.00856,-6.97158
Up = -0.287658,-0.922742,0.256449
AntiAlias = 1
Detail = -2.53981
DetailAO = -0.64288
FudgeFactor = 0.92771
MaxRaySteps = 154
BoundingSphere = 10
Dither = 0
AO = 0,0,0,0.7
Specular = 3.9796
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = -0.73496,0.1
CamLight = 1,1,1,1.12676
CamLightMin = 0
Glow = 1,1,1,0
Fog = 0.3937
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.55
X = 0.5,0.6,0.6,1
Y = 1,0.6,0,-0.33334
Z = 0.8,0.78,1,0.5
R = 0.666667,0.666667,0.498039,0.67058
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 1.35415
CycleColors = true
Cycles = 1.29269
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 21
Bailout = 1024
Slope = -1.0092
#endpreset