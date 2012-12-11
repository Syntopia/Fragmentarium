#info Mandelbulb without Distance Estimator

#define providesInside

#define providesColor

#include "Brute-Raytracer.frag"
#group Mandelbulb
//#define IterationsBetweenRedraws 5

// Number of fractal iterations.
uniform int Iterations;  slider[0,9,100]

// Mandelbulb exponent (8 is standard)
uniform float Power; slider[-10,8,10]

// Bailout radius
uniform float Bailout; slider[0,5,30]

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[0.00,0,180]

uniform bool Julia; checkbox[false]
uniform vec3 JuliaC; slider[(-2,-2,-2),(0,0,0),(2,2,2)]

vec3 color(vec3 p) {
	return abs(vec3(p));
}

void powN2(inout vec3 z, float zr0) {
	float zo0 = asin( z.z/zr0 );
	float zi0 = atan( z.y,z.x );
	float zr = pow( zr0, Power-1.0 );
	float zo = zo0 * Power;
	float zi = zi0 * Power;
	zr *= zr0;
	z  = zr*vec3( cos(zo)*cos(zi), cos(zo)*sin(zi), sin(zo) );
}


bool inside(vec3 pos) {
	vec3 z=pos;
	float r;
	int i=0;
	r=length(z);
	while(r<Bailout && (i<Iterations)) {
		powN2(z,r);
		z+=(Julia ? JuliaC : pos);
		r=length(z);
		i++;
	}
	return (r<Bailout);
	
}

#preset Default
FOV = 0.62536
Eye = 0.137861,0.380908,-1.90454
Target = -1.05894,-1.3684,6.69989
Up = -0.970103,0.225702,-0.0892076
EquiRectangular = false
Gamma = 2.5
ToneMapping = 3
Exposure = 1.34694
Brightness = 1
Contrast = 0.9901
Saturation = 1
Near = 0.7368
Far = 2.45904
NormalScale = 0.58825
AOScale = 1.0194
Glow = 0.34167
AOStrength = 0.86047
Samples = 100
Stratify = true
DebugInside = false
SampleNeighbors = true
Specular = 0
SpecularExp = 5.455
SpotLight = 1,0.678431,0.494118,0.78431
SpotLightDir = 1,0.78126
CamLight = 1,1,1,0.38462
CamLightMin = 0
Fog = 0
ShowDepth = false
DebugNormals = false
BaseColor = 1,1,1
OrbitStrength = 0
X = 1,1,1,1
Y = 0.345098,0.666667,0,0.02912
Z = 1,0.666667,0,1
R = 0.0784314,1,0.941176,-0.0194
BackgroundColor = 0.607843,0.866667,0.560784
GradientBackground = 0.86955
CycleColors = false
Cycles = 1.1
Iterations = 9
Power = 8
Bailout = 5
RotVector = 1,1,1
RotAngle = 0
Julia = false
JuliaC = 0,0,0
#endpreset
