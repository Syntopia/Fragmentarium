#include "include/2D.frag"
#info Mandelbrot
#group Mandelbrot

// Number of iterations
uniform int  Iterations; slider[10,200,1000]

uniform float R; slider[0,0,1]
uniform float G; slider[0,0.4,1]
uniform float B; slider[0,0.7,1]

vec2 complexMul(vec2 a, vec2 b) {
	return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}

vec3 getColor2D(vec2 c) {
	vec2 z = vec2(0,0);
	int i = 0;
	for (i = 0; i < Iterations; i++) {
		z = complexMul(z,z) + c;
		if (dot(z,z)> 100.0) break;
	}
	if (i < Iterations) {	
             // The color scheme here is based on one
		// from Inigo Quilez's Shader Toy:
		float co = float( i) + 1.0 - log2(.5*log2(dot(z,z)));
		co = sqrt(co/256.0);
		return vec3( .5+.5*cos(6.2831*co+R),
		.5+.5*cos(6.2831*co+G),
		.5+.5*cos(6.2831*co+B) );
	}  else {
		return vec3(0.0);
	}
	
}

