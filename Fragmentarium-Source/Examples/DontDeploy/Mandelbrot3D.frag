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

/*

	return vec3(
	a.x*b.x -a.y*b.y ,
     a.x*b.y+a.y*b.x,
    a.x*b.z+a.z*b.a);

		     1 i j 
		  1 1 i j
		  i    i -1 x 
		  j   j x y 
*/
// Tricomplex multiplication: http://en.wikipedia.org/wiki/Tricomplex_number
vec3 mul(vec3  a, vec3 b) {
	vec3 c = vec3(
	a.x*b.x -a.y*b.y              ,
     a.x*b.y+a.y*b.x                ,
    a.x*b.z+a.z*b.x                   );
  c.z -=      + a.y*b.z + a.z*b.y  ;
 c.y +=a.z*b.z ;
return c;
}

float DE(vec3 pos) {
	vec3 p = pos;
	vec3 dp = vec3(1.0,0.0,0.0);
	for (int i = 0; i < Iterations; i++) {
		dp = 2.0* mul(p,dp)+ (JuliaMode ? vec3(0.0) : vec3(1.0,0.0,0.0));
		p = mul(p,p) + (JuliaMode ? c : pos);
		float p2 = dot(p,p);
		orbitTrap = min(orbitTrap, abs(vec4(p.xyz,p2)));
		if (p2 > Threshold) break;
	}
	float r = length(p);
	return  0.5 * r * log(r) / length(dp);
}

