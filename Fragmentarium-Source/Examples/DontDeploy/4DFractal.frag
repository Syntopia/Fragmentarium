#include "DE-Raytracer.frag"
#group Hypercomplex Thing

// Number of fractal iterations.
uniform int Iterations;  slider[0,16,100]
// Breakout distance
uniform float Threshold; slider[0,10,10000]
// Mandel or Julia
uniform bool JuliaMode; checkbox[false]

//Julia constant
uniform vec4 Julia; slider[(-1,-1,-1,-1),(0,0,0,0),(1,1,1,1)]
uniform float C4; slider[-1,0,1]

/*
     + (a[0]*b[0]) + (a[1]*b[1]) + (a[2]*b[2]) - (a[3]*b[3]) ,
      + (a[0]*b[1]) + (a[1]*b[0]) - (a[2]*b[3]) + (a[3]*b[2]) ,
      + (a[0]*b[2]) + (a[1]*b[3]) + (a[2]*b[0]) - (a[3]*b[1]) ,
      + (a[0]*b[3]) + (a[1]*b[2]) - (a[2]*b[1]) + (a[3]*b[0])

*/

vec4 mul2(vec4  a, vec4 b) {
	return vec4(
	a.x*b.x + a.y*b.y  + a.z*b.z-a.w*b.w,
     a.x*b.y + a.y*b.x-a.z*b.w+a.w*b.z,
    a.x*b.z+a.y*b.w+a.z*b.x-a.w*b.y,
   a.x*b.w+ a.y*b.z - a.z*b.y+a.w*b.x);
}
/*
a1a2 - b1b2 - c1c2 - d1d2
+ (a1b2 + b1a2 + c1d2 - d1c2)i
+ (a1c2 - b1d2 + c1a2 + d1b2)j
+ (a1d2 + b1c2 - c1b2 + d1a2)k.

*/


vec4 mul(vec4 a, vec4 b) {
return vec4(
a.x*b.x- a.y*b.y - a.z*b.z - a.w*b.w,
a.x*b.y+a.y*b.x  +a.z*b.w  - a.w*b.z  , 
a.x*b.z-a.y*b.w  +a.z*b.x  + a.w*b.y  , 
a.x*b.w+a.y*b.z  -a.z*b.y  + a.w*b.x  );
}

float DE(vec3 pos) {
vec4 pos4 = vec4(pos,C4);
//pos4 = pos4.zxwy;
//Julia = vec4(pos.z,0,0,pos.y);
	vec4 p = pos4;
	vec4 dp = vec4(1.0, 0.0,0.0,0.0);
	for (int i = 0; i < Iterations; i++) {
		dp = 2.0* mul(dp,p) + vec4(1.0,0.0,0.0,0.0);
		p = mul(p,p) +  (JuliaMode ? Julia : pos4);;
		float p2 = dot(p,p);
		orbitTrap = min(orbitTrap, abs(vec4(p.xyz,p2)));
		if (p2 > Threshold) break;
	}
	float r = length(p);
	return  0.5 * r * log(r) / length(dp);
}

