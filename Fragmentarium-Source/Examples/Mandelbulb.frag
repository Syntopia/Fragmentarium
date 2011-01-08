#info Mandelbulb Distance Estimator (Enforcer's version).
#include "DE-Raytracer.frag"
#group Mandelbulb

// DE - taken from the implementation by Enforcer:
// http://www.fractalforums.com/mandelbulb-implementation/realtime-renderingoptimisations/

// Number of fractal iterations.
uniform int Iterations;  slider[0,13,100]

// Mandelbulb exponent (8 is standard)
uniform float Power; slider[0,8,16]

void powN1(inout float3 z, float zr0, inout float dr) {
	float zo0 = asin( z.z/zr0 );
	float zi0 = atan( z.y,z.x );
	float zr = pow( zr0, Power-1.0 );
	float zo = zo0 * Power;
	float zi = zi0 * Power;
	dr = zr*dr*Power + 1.0;
	zr *= zr0;
	z  = zr*vec3( cos(zo)*cos(zi), cos(zo)*sin(zi), sin(zo) );
}



// Compute the distance from `pos` to the Mandelbox.
float DE(vec3 pos) {
	vec3 z=pos;
	float r;
	float dr=1.0;
	int i=Iterations;
	r=length(z);
	while(r<4.0 && i--) {
		powN1(z,r,dr);
		z+=pos;
		r=length(z);
		mDist = min(mDist, r*r);
	}
	
	return 0.5*log(r)*r/dr;
}

