#info Mandelbulb Distance Estimator
#define providesInit
#include "DE-Raytracer-Slicer.frag"
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



float DE2(vec3 pos,int type) {
orbitTrap = min(orbitTrap, vec4(normalize(pos),1.0));
return 1.5*length(pos)-1.0;
}

// Compute the distance from `pos` to the Mandelbox.
float DE(vec3 pos,int type) {
	vec3 z=pos;
	float r;
	float dr=1.0;
	int i=0;
	r=length(z);
	while(r<Bailout && (i<Iterations)) {
		if (AlternateVersion) {
			powN2(z,r,dr);
		} else {
			powN1(z,r,dr);
		}
		z+=pos;
if (type==1) dr+=1.0;
		r=length(z);
		z*=rot;
		if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,r*r)));
		i++;
	}
//	if ((type==1) && r<Bailout) return 0.0;
	return 0.5*log(r)*r/dr;
	/*
	Use this code for some nice intersections (Power=2)
	float a =  max(0.5*log(r)*r/dr, abs(pos.y));
	float b = 1000;
	if (pos.y>0)  b = 0.5*log(r)*r/dr;
	return min(min(a, b),
		max(0.5*log(r)*r/dr, abs(pos.z)));
	*/
}

#preset Default
FOV = 0.62536
Eye = -0.788003,0.788839,1.62469
Target = 2.75784,-2.47769,-5.81072
Up = 0.917561,0.0998113,0.384863
AntiAlias = 1 NotLocked
Detail = -2.91151
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 164
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.90123
Specular = 4.4304
SpecularExp = 16
SpotLight = 0.435294,0.737255,1,1
SpotLightDir = 0.65626,0.5
CamLight = 1,0.941176,0.898039,0.8077
CamLightMin = 1
Glow = 1,1,1,0.46575
Fog = 0
HardShadow = 0.35385 NotLocked
Reflection = 0 NotLocked
BaseColor = 1,1,1
OrbitStrength = 0.14286
X = 0.411765,0.6,0.560784,0.41748
Y = 0.666667,0.666667,0.498039,-0.16504
Z = 1,0.258824,0.207843,1
R = 0.0823529,0.278431,1,0.82352
BackgroundColor = 0.607843,0.866667,0.560784
GradientBackground = 0.3261
CycleColors = true
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 12
ColorIterations = 2
Power = 8
Bailout = 6.279
AlternateVersion = true
RotVector = 1,1,1
RotAngle = 0
#endpreset
