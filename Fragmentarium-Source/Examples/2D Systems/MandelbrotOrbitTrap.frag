#include "2D.frag"
#info Mandelbrot
#group Mandelbrot

// Number of iterations
uniform int  Iterations; slider[10,600,1000]

uniform float R; slider[0,0,1]
uniform float G; slider[0,0.4,1]
uniform float B; slider[0,0.7,1]
uniform float Divider; slider[0,35,50]
uniform float Power; slider[0,0.6,6]
uniform float Radius; slider[0,1.332,5]

uniform bool Julia; checkbox[false]
uniform float JuliaX; slider[-2,-0.6,2]
uniform float JuliaY; slider[-2,1.3,2]
vec2 c2 = vec2(JuliaX,JuliaY);

vec2 complexMul(vec2 a, vec2 b) {
	return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}

vec3 getColor2D(vec2 c) {
	vec2 z = Julia ?  c : vec2(0.0,0.0);
	int i = 0;
	float dist = 10000.0;
	for (i = 0; i < Iterations; i++) {
		z = complexMul(z,z) + (Julia ? c2 : c);
		if (dot(z,z)> 100.0) break;
		dist = min(dist, abs(length(z)-Radius));
		//	dist = min(dist, length(z.y));
	}
	
	if (i < Iterations) {
		// The color scheme here is based on one
		// from Inigo Quilez's Shader Toy:
		float co = float( i) + 1.0 - log2(.5*log2(dot(z,z)));
		co = sqrt(co/256.0);
		float  co2 = dist * Divider;
		//co += co2;
		float fac = clamp(1.0/pow(co2,Power),0.0,1.0);
		return fac*vec3( .5+.5*cos(6.2831*co+R),
			.5+.5*cos(6.2831*co+G),
			.5+.5*cos(6.2831*co+B) );
	}  else {
		return vec3(0.0);
	}
	
}

