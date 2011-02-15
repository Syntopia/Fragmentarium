#info 4D Quaternion Mandelbrot Distance Estimator
#include "DE-Raytracer.frag"
#group 4D Quaternion Mandelbrot

// This is Mandelbrot variation 
// of the usual 4D Quaternion Julia

// The straight forward implementation 
// yields a boring, symmetriical object,
// but after adding a reflection we
// get some more Mandelbrot like.

// Number of fractal iterations.
uniform int Iterations;  slider[0,16,100]
// Breakout distance
uniform float Threshold; slider[0,10,100]

void init() {};

float DE(vec3 pos) {
	vec4 p = vec4(pos, 0.0);
	vec4 dp = vec4(1.0, 0.0,0.0,0.0);
	for (int i = 0; i < Iterations; i++) {
		dp = 2.0* vec4(p.x*dp.x-dot(p.yzw, dp.yzw), p.x*dp.yzw+dp.x*p.yzw+cross(p.yzw, dp.yzw));
		p = vec4(p.x*p.x-dot(p.yzw, p.yzw), vec3(2.0*p.x*p.yzw)) +  vec4(pos, 0.0);
		p.yz = -p.zy;
		float p2 = dot(p,p);
		if (i<3) orbitTrap = min(orbitTrap, abs(vec4(p.xyz,p2)));
		if (p2 > Threshold) break;
	}
	float r = length(p);
	return  0.5 * r * log(r) / length(dp);
}

