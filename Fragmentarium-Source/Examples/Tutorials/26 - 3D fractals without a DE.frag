#info Mandelbulb without Distance Estimator
#define providesInit
#include "Brute-Raytracer.frag"
#include "MathUtils.frag"
#group Mandelbulb


// Number of fractal iterations.
uniform int Iterations;  slider[0,9,100]

// Number of color iterations.
uniform int ColorIterations;  slider[0,9,100]

// Mandelbulb exponent (8 is standard)
uniform float Power; slider[0,8,16]

// Bailout radius
uniform float Bailout; slider[0,5,30]

// Alternate is slightly different, but looks more like a Mandelbrot for Power=2
uniform bool AlternateVersion; checkbox[false]

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[0.00,0,180]

mat3 rot;

void init() {
	rot = rotationMatrix3(normalize(RotVector), RotAngle);
}

// This is my power function, based on the standard spherical coordinates as defined here:
// http://en.wikipedia.org/wiki/Spherical_coordinate_system
//
// It seems to be similar to the one Quilez uses:
// http://www.iquilezles.org/www/articles/mandelbulb/mandelbulb.htm
//
// Notice the north and south poles are different here.
void powN1(inout vec3 z, float r, inout float dr) {
	// extract polar coordinates
	float theta = acos(z.z/r);
	float phi = atan(z.y,z.x);
	dr =  pow( r, Power-1.0)*Power*dr + 1.0;
	
	// scale and rotate the point
	float zr = pow( r,Power);
	theta = theta*Power;
	phi = phi*Power;
	
	// convert back to cartesian coordinates
	z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
}

// This is a power function taken from the implementation by Enforcer:
// http://www.fractalforums.com/mandelbulb-implementation/realtime-renderingoptimisations/
//
// I cannot follow its derivation from spherical coordinates,
// but it does give a nice mandelbrot like object for Power=2
void powN2(inout vec3 z, float zr0, inout float dr) {
	float zo0 = asin( z.z/zr0 );
	float zi0 = atan( z.y,z.x );
	float zr = pow( zr0, Power-1.0 );
	float zo = zo0 * Power;
	float zi = zi0 * Power;
	dr = zr*dr*Power + 1.0;
	zr *= zr0;
	z  = zr*vec3( cos(zo)*cos(zi), cos(zo)*sin(zi), sin(zo) );
}



uniform bool Julia; checkbox[false]
uniform vec3 JuliaC; slider[(-2,-2,-2),(0,0,0),(2,2,2)]


void powN2(inout vec3 z, float zr0) {
	float zo0 = asin( z.z/zr0 );
	float zi0 = atan( z.y,z.x );
	float zr = pow( zr0, Power-1.0 );
	float zo = zo0 * Power;
	float zi = zi0 * Power;
	zr *= zr0;
	z  = zr*vec3( cos(zo)*cos(zi), cos(zo)*sin(zi), sin(zo) );
}


// Compute the distance from `pos` to the Mandelbox.
float DE(vec3 pos) {
//return (dot(pos,pos)>1.0 ? 1.0 : -1.0);
	vec3 z=pos;
	float r;
	int i=0;
	r=length(z);
	while(r<Bailout && (i<Iterations)) {
			powN2(z,r);
		z+=(Julia ? JuliaC : pos);
		r=length(z);
		z*=rot;
		if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,r*r)));
		i++;
	}
	if (r<Bailout) return -1.0;
	return 1.0;

}

#preset Default
FOV = 0.62536
Eye = 0.633014,-0.13205,-1.83663
Target = -3.07766,0.866233,6.14854
Up = -0.87195,0.22693,-0.433562
EquiRectangular = false
Gamma = 2.5
ToneMapping = 3
Exposure = 1.34694
Brightness = 1
Contrast = 0.9901
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 0
CamLight = 1,1,1,0.38462
CamLightMin = 0
Fog = 0
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
NormalScale = 0.00024
AOScale = 0.00631
Glow = 0.34167
AOStrength = 0.86047
Specular = 0
SpecularExp = 5.455
SpotLight = 1,0.678431,0.494118,0.78431
SpotLightDir = 1,0.78126
Iterations = 9
ColorIterations = 9
Power = 8
Bailout = 5
AlternateVersion = false
RotVector = 1,1,1
RotAngle = 0
Julia = false
JuliaC = 0,0,0
ShowDepth = false
Samples = 100
Near = 0.7368
Far = 2.45904
#endpreset
