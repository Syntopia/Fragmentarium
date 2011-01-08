#info 4D Quaternion Julia Distance Estimator
#include "DE-Raytracer.frag"
#group 4D Quaternion Julia

// The DE implementation here is based on the implementation by Subblue:
//  http://www.subblue.com/blog/2009/9/20/quaternion_julia
// which in turn is based on a CG shader by Keenan Crane.
// My implementation here is very compressed, so take a look at Subblue's above for a much clearer implementation.

// Number of fractal iterations.
uniform int Iterations;  slider[0,13,100]
// Breakout distance
uniform float Threshold; slider[0,10,100]
// Quaterion Constant (first three components)
uniform vec3 C123; slider[(-1,-1,-1),(0.18,0.88,0.24),(1,1,1)]
// Quaterion Constant (last component)
uniform float C4; slider[-1,0.16,1]

vec4 c = vec4(C123,C4); // We don't support 4-component sliders yet...

// The inline expanded quaterion multiplications make this DE
// look much worse than it actually is.
float DE(vec3 pos) {
	vec4 p = vec4(pos, 0.0);
	vec4 dp = vec4(1.0, 0.0,0.0,0.0);	
	for (int i = 0; i < Iterations; i++) {
		dp = 2.0* vec4(p.x*dp.x-dot(p.yzw, dp.yzw), p.x*dp.yzw+dp.x*p.yzw+cross(p.yzw, dp.yzw));
		p = vec4(p.x*p.x-dot(p.yzw, p.yzw), vec3(2.0*p.x*p.yzw)) + c;	
		if (dot(p, p) > Threshold) break;
	}
	float r = length(p);
	return  0.5 * r * log(r) / length(dp);
}

