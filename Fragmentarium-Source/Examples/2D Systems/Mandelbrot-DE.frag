#include "2D.frag"
#info Mandelbrot with Distance Estimation
#group Mandelbrot

// Number of iterations
uniform int  Iterations; slider[10,200,5000]

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
uniform float BR; slider[0.1,1.1,200.3]
uniform float Dist; slider[-20,0,0]
uniform float EXP; slider[0,0,10]
uniform float Dist2; slider[-20,0,0]

uniform float Zoom;
vec3 color(vec2 c) {
	if (ShowMap && Julia) {
		vec2 w = (aaCoord-mapCenter);
		w.y/=(pixelSize.y/pixelSize.x);
		if (length(w)<mapRadius) return getMapColor2D(c);
		if (length(w)<mapRadius+0.01) return vec3(0.0,0.0,0.0);
	}
	
	vec2 z = Julia ?  c : vec2(0.0,0.0);
	float dr = 1.0;
	int i = 0;
	vec2 dz = vec2(1,0);
	for (i = 0; i < Iterations; i++) {
		dz = complexMul(z,dz)*2.0 + (Julia ? vec2(0.0) : vec2(1.0,0.0));
		//	dr = length(z)*dr*2.0;
		z = complexMul(z,z) + (Julia ? c2 : c);
		
		if (dot(z,z)> BR*BR*BR*BR) break;
	}
	if ( i == Iterations) return vec3(0.0);
	
	float r = length(z);
	dr = length(dz);
	
	
	float de =(Zoom/100.0)* r*log2(r)/dr;
	if (mod(de*2000,1.0) > 0.9) return vec3(1.0,0.0,0.0);
	if (de<BR/1000000.0) return vec3(0.0,0.0,0.0);
	//if (mod(de*2000,1.0) > 0.5) return vec3(0.9);
	
	return vec3(1.0);
}


#preset Default
Center = -0.0644841,-0.00353997
Zoom = 1
AntiAliasScale = 1
AntiAlias = 2
Iterations = 181
R = 0
G = 0.4
B = 0.7
Julia = true
JuliaX = -0.77896
JuliaY = 0.12536
ShowMap = false
MapZoom = 0.45925
BR = 4.06396
Dist = -18.7756
EXP = 1.6667
Dist2 = -9.7826
#endpreset




