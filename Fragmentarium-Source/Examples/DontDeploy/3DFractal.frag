#include "DE-Raytracer.frag"
#group Hypercomplex Thing

// Number of fractal iterations.
uniform int Iterations;  slider[0,16,100]
// Breakout distance
uniform float Threshold; slider[0,10,100]
// Mandel or Julia
uniform bool JuliaMode; checkbox[false]

//Julia constant
uniform vec3 C123; slider[(-1,-1,-1),(0.18,0.88,0.24),(1,1,1)]

vec3 c = vec3(C123);

// Tricomplex multiplication: http://en.wikipedia.org/wiki/Tricomplex_number
vec3 mul(vec3  a, vec3 b) {
	return vec3(
	a.x*b.x+ a.y*b.z  + a.z*b.y,
     a.x*b.y+a.y*b.x+a.z*b.z,
     a.x*b.z+a.z*b.x+a.y*b.y);
}

float DE(vec3 pos) {
	vec3 p = pos;
	vec3 dp = vec3(1.0,0.0,0.0);
	for (int i = 0; i < Iterations; i++) {
		dp = 2.0* mul(p,dp);
		p = mul(p,p) + (JuliaMode ? c : pos);
		float p2 = dot(p,p);
		orbitTrap = min(orbitTrap, abs(vec4(p.xyz,p2)));
		if (p2 > Threshold) break;
	}
	float r = length(p);
	return  0.5 * r * log(r) / length(dp);
}

