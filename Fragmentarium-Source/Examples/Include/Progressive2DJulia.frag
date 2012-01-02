#donotrun
#include "Progressive2D.frag"

// Number of iterations
uniform int  Iterations; slider[1,200,1000]

// Skip this number of iterations before starting coloring
uniform int  PreIterations; slider[0,1,100]

uniform float R; slider[0,0,1]
uniform float G; slider[0,0.4,1]
uniform float B; slider[0,0.7,1]
uniform float C; slider[0,1,2]
uniform bool Julia; checkbox[true]
uniform float JuliaX; slider[-15,0.23528,8]
uniform float JuliaY; slider[-15,5.53840,8]

void init() {}

vec2 formula(vec2 p, vec2 c);

vec2 c2 = vec2(JuliaX,JuliaY);

vec2 mapCenter = vec2(0.5,0.5);
float mapRadius =0.4;
uniform bool ShowMap; checkbox[true]
uniform float MapZoom; slider[0.01,2.1,6]
uniform float EscapeSize; slider[0,5,11]
float escape = pow(10.0,EscapeSize);
vec3 getMapColor2D(vec2 c) {
	vec2 p =  (aaCoord-mapCenter)/(mapRadius);
	p*=MapZoom; p.x/=pixelSize.x/pixelSize.y;
	if (abs(p.x)<4.0*pixelSize.y*MapZoom) return vec3(0.0,0.0,0.0);
	if (abs(p.y)<4.0*pixelSize.x*MapZoom) return vec3(0.0,0.0,0.0);
	p +=vec2(JuliaX, JuliaY) ;
	float mean = 0.0;
	vec2 z =  p;
	int Iter = 200; // 'const int' crashes on my ATI card?
	int i = 0;
	for (i = 0; i < Iter; i++) {
		z = formula(z, p);
		mean+=length(z);
		if (dot(z,z)> escape) break;
	}
	mean/=float(i);
	float co =   1.0 - log2(.5*log2(mean/0.5));
	return vec3( .5+.5*cos(6.2831*co+0.5),.5+.5*cos(6.2831*co + 0.5),.5+.5*cos(6.2831*co +0.5) );
	
}

uniform int ColoringType; slider[0,0,2]
uniform float ColorFactor; slider[0,0.5,1]

vec3 getColor2D(vec2 c) {
	if (ShowMap && Julia) {
		vec2 w = (aaCoord-mapCenter);
		w.y/=(pixelSize.y/pixelSize.x);
		if (length(w)<mapRadius) return getMapColor2D(c);
		if (length(w)<mapRadius+0.01) return vec3(0.0,0.0,0.0);
	}
	
	vec2 z = c;
	int i = 0;
	float ci = 0.0;
	if (ColoringType == 0) {
		float mean = 0.0;
		for (i = 0; i < Iterations; i++) {
			z = formula(z,(Julia ? c2 : c));
			if (i>PreIterations) mean+=length(z);
			if (dot(z,z)> escape) break;
		}
		mean/=float(i-PreIterations);
		ci =  1.0 - log2(.5*log2(mean/C));
	} else if (ColoringType == 1) {
		float m = 0.0;
		for (i = 0; i < Iterations; i++) {
			z = formula(z,(Julia ? c2 : c));
			if (i>PreIterations) m = mix(m,length(z),ColorFactor);
			if (dot(z,z)> escape) break;
		}
		ci =  1.0 - log2(.5*log2(m/C));
	} else if (ColoringType == 2) {
		for (i = 0; i < Iterations; i++) {
			z = formula(z,(Julia ? c2 : c));
			if (dot(z,z)> escape) break;
		}
		ci =  float( i) + 1.0 - log2(.5*log2(dot(z,z)));	
	}
	return vec3( .5+.5*cos(6.*ci+R),.5+.5*cos(6.*ci + G),.5+.5*cos(6.*ci +B) );
}
