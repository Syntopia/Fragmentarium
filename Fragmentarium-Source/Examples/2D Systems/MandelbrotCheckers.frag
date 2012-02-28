#include "2D.frag"
#info Mandelbrot
#group Mandelbrot

// Number of iterations
uniform int  Iterations; slider[1,200,1000]

uniform float R; slider[0,0,1]
uniform float G; slider[0,0.4,1]
uniform float B; slider[0,0.7,1]

uniform bool Julia; checkbox[false]
uniform float JuliaX; slider[-2,-0.6,2]
uniform float JuliaY; slider[-2,1.3,2]

vec2 c2 = vec2(JuliaX,JuliaY);

vec2 complexMul(vec2 a, vec2 b) {
	return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}

uniform float Breakout; slider[0.1,1.1,10]
float breakout = pow(10.0,Breakout);
uniform float PatternScale; slider[0,1,200]

vec3 getColor(vec2 w) {

w= fract(w*PatternScale);
float a = ((w.x<0.5 && w.y<0.5) || (w.x>0.5 && w.y>0.5)) ? 1.0 : 0.0;
//a = 0.0;
w=fract(w*2.0);
if (length(w-vec2(0.5,0.5))<0.5) a = (1.0-a);
 return vec3 (a
	);

/*
float r = fract(length(w*PatternScale));
float a = 0.0;
if (length(w-vec2(0.5,0.5))<0.5) a = (1.0-a);
 return vec3 (a
	);
*/
}

uniform bool Accumulate; checkbox[true]

vec3 color(vec2 c) {
	
	vec2 z = Julia ?  c : vec2(0.0,0.0);
	
	int i = 0;
	vec3 sum = vec3(0.0);
	vec3 last = vec3(0.0);
	for (i = 0; i < Iterations; i++) {
		z = complexMul(z,z) + (Julia ? c2 : c);
		if (dot(z,z)> breakout) break;
		last =  getColor(z);
		sum += last;
	}
	sum=sum/float(i);
	if (!Accumulate) sum = last;

	if (i < Iterations) {
		// The color scheme here is based on one
		// from Inigo Quilez's Shader Toy:
		float co =  float( i) + 1.0 - log2(.5*log2(dot(z,z)));
		co = sqrt(co/256.0);
		return sum*vec3( .5+.5*cos(6.2831*co+R),
			.5+.5*cos(6.2831*co + G),
			.5+.5*cos(6.2831*co +B) );
	}  else {
		return vec3(sum);
	}
}



