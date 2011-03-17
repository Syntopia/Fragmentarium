#include "2D.frag"
#info Mandelbrot
#group Mandelbrot

// Number of iterations
uniform int  Iterations; slider[10,200,1000]

uniform float R; slider[0,0,1]
uniform float G; slider[0,0.4,1]
uniform float B; slider[0,0.7,1]

uniform bool Julia; checkbox[false]
uniform float JuliaX; slider[-2,-0.6,2]
uniform float JuliaY; slider[-2,1.3,2]

vec2 c2 = vec2(JuliaX,JuliaY);

void init() {}

vec2 complexMul(vec2 a, vec2 b) {
	return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}

vec2 mapCenter = vec2(0.5,0.5);
float mapRadius =0.4;
uniform bool ShowMap; checkbox[true]
uniform float MapZoom; slider[0.01,2.1,6]

vec3 getMapColor2D(vec2 c) {	
	vec2 p =  (aaCoord-mapCenter)/(mapRadius);
	p*=MapZoom; p.x/=pixelSize.x/pixelSize.y;
	if (abs(p.x)<2.0*pixelSize.y*MapZoom) return vec3(0.0,0.0,0.0);
	if (abs(p.y)<2.0*pixelSize.x*MapZoom) return vec3(0.0,0.0,0.0);
	p +=vec2(JuliaX, JuliaY) ;

	
	vec2 z =  vec2(0.0,0.0);
	
	int i = 0;
	for (i = 0; i < Iterations; i++) {
		z = complexMul(z,z) +p;
		if (dot(z,z)> 200.0) break;
	}
	if (i < Iterations) {
		float co =  float( i) + 1.0 - log2(.5*log2(dot(z,z)));
		co = sqrt(co/256.0);
		return vec3( .5+.5*cos(6.2831*co),.5+.5*cos(6.2831*co),.5+.5*cos(6.2831*co) );
	}  else {
		return vec3(0.0);
	}
	
}

vec3 getColor2D(vec2 c) {
	if (ShowMap && Julia) {
		vec2 w = (aaCoord-mapCenter);
		w.y/=(pixelSize.y/pixelSize.x);
		if (length(w)<mapRadius) return getMapColor2D(c);
		if (length(w)<mapRadius+0.01) return vec3(0.0,0.0,0.0);
	}
	
	vec2 z = Julia ?  c : vec2(0.0,0.0);
	
	int i = 0;
	for (i = 0; i < Iterations; i++) {
		z = complexMul(z,z) + (Julia ? c2 : c);
		
		if (dot(z,z)> 100.0) break;
	}
	if (i < Iterations) {
		// The color scheme here is based on one
		// from Inigo Quilez's Shader Toy:
		float co =  float( i) + 1.0 - log2(.5*log2(dot(z,z)));
		co = sqrt(co/256.0);
		return vec3( .5+.5*cos(6.2831*co+R),
			.5+.5*cos(6.2831*co + G),
			.5+.5*cos(6.2831*co +B) );
	}  else {
		return vec3(0.0);
	}
}

#preset Mandel1
Center = -0.285288,-0.0120426
Zoom = 0.854514
AntiAliasScale = 1
AntiAlias = 3
Iterations = 328
R = 0
G = 0.4
B = 0.7
Julia = false
JuliaX = -0.6
JuliaY = 1.3
#endpreset

#preset Mandel2
Center = -0.335155,0.124422
Zoom = 630.163
AntiAliasScale = 1
AntiAlias = 3
Iterations = 623
R = 0.25624
G = 0.66875
B = 1
Julia = false
JuliaX = -0.6
JuliaY = 1.3
#endpreset

#preset Julia1
Center = -0.00932198,0
Zoom = 1.26502
AntiAliasScale = 1
AntiAlias = 2
Iterations = 69
R = 0.76875
G = 0.4
B = 0.7
Julia = true
JuliaX = -1.26472
JuliaY = -0.05884
#endpreset

#preset nice Julia
Center = 0.16416,0.0265285
Zoom = 0.854514
AntiAliasScale = 1
AntiAlias = 3
Iterations = 328
R = 0
G = 0.4
B = 0.7
Julia = true
JuliaX = -0.20588
JuliaY = 0.79412
ShowMap = true
MapZoom = 1.74267
#endpreset


