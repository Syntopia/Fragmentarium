#pragma optionNV(fastmath off)
#pragma optionNV(fastprecision off)
#include "2D-HP.frag"
#include "EmulatedDouble.frag"
#info Mandelbrot
#group Mandelbrot

// Number of iterations
uniform int  Iterations; slider[10,200,1000]

uniform float R; slider[0,0,1]
uniform float G; slider[0,0.4,1]
uniform float B; slider[0,0.7,1]

uniform bool EmulatedDoubles; checkbox[false]
uniform float JuliaX; slider[-2,-0.6,2]
uniform float JuliaY; slider[-2,1.3,2]

vec2 c2 = vec2(JuliaX,JuliaY);

vec2 cMul(vec2 a, vec2 b) {
	return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}

vec2 cSqr(vec2 a) {
	return vec2( a.x*a.x -  a.y*a.y,2.0*a.x*a.y);
}


vec2 mapCenter = vec2(0.5,0.5);
float mapRadius =0.4;
uniform bool ShowMap; checkbox[true]
uniform float MapZoom; slider[0.01,2.1,6]
uniform vec2 Center;
uniform float Zoom;

//#extension GL_ARB_gpu_shader_fp64 : enable

vec3 color(vec2 rawC) {
	float dotZZ = 0.0;
	
	int j = Iterations;
	if (EmulatedDoubles) {
		vec4 c = dcAdd(dcMul(dcSet(rawC),vec2(1.0/Zoom,0.)),dcSet(Center));
		vec4 dZ = dcSet(vec2(0.0,0.0));
		vec4 add = c;
		for (int i = 0; i <= Iterations; i++) {
			if (cmp(dcSqrLength(dZ), set(1000.0))>0.) { break; }
			//if (dZ.x*dZ.x+dZ.w*dZ.w >1000.) { break; } // faster, but not exact
			dZ = dcAdd(dcSqr(dZ),add);
			j = i;
		}
		dotZZ = dZ.x*dZ.x+dZ.z*dZ.z; // extract high part
	} else {
             vec2 c = rawC/Zoom + Center;
		vec2 z = vec2(0.0);
		for (int i = 0; i <= Iterations; i++) {
			if (dot(z,z)>1000.0) { break; } 
			z = cSqr(z) + c;
			j = i;
		}
		dotZZ =dot(z,z);
	}
	
	if (j < Iterations) {
		// The color scheme here is based on one
		// from the Mandelbrot in Inigo Quilez's Shader Toy:
		float co = float( j) + 1.0 - log2(.5*log2(dotZZ));
		co = sqrt(max(0.,co)/256.0);
		return vec3( .5+.5*cos(6.2831*co+R),.5+.5*cos(6.2831*co + G),.5+.5*cos(6.2831*co +B) );
	}  else {
		// Inside
		return vec3(0.05,0.01,0.02);
	}
}

