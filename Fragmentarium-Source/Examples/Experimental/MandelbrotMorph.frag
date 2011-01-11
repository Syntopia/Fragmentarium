#include "2D.frag"
#info Mandelbrot
#group Mandelbrot

// This is simple demonstration of the 'time' variable.
// Set the Screen Update mode to 'Continuous' for this one!

// Number of iterations
uniform int  Iterations; slider[10,200,1000]

uniform float R; slider[0,0,1]
uniform float G; slider[0,0.4,1]
uniform float B; slider[0,0.7,1]
uniform float time;

vec2 complexMul(vec2 a, vec2 b) {
	vec2 c =  vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
       float f = 0.1*time;
         c = vec2(c.x*cos(f)+c.y*sin(f), c.x*sin(f)+c.y*cos(f));
	return c;
}

vec3 getColor2D(vec2 c) {
       float a = 0.1*time;
       c = vec2(c.x*cos(a)+c.y*sin(a), -c.x*sin(a)+c.y*cos(a));
	vec2 z = vec2(0,0);
	int i = 0;
	for (i = 0; i < Iterations; i++) {
		z = complexMul(z,z) + c;
		if (dot(z,z)> 100.0) break;
	}
	if (i < Iterations) {	
             // The color scheme here is based on one
		// from Inigo Quilez's Shader Toy:
		float co =  float( i) + 1.0 - log2(.5*log2(dot(z,z)));
		co = sqrt(co/256.0);
		return vec3( .5+.5*cos(6.2831*co+R+time),
		.5+.5*cos(6.2831*co+time + G),
		.5+.5*cos(6.2831*co+time +B) );
	}  else {
		return vec3(0.0);
	}
	
}

