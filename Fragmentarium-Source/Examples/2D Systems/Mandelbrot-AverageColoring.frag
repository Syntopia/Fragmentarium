#include "Progressive2D.frag"
#group Mandelbrot

// Number of iterations
uniform int Iterations; slider[10,200,5000]
uniform float R; slider[0,0,1]
uniform float G; slider[0,0.4,1]
uniform float B; slider[0,0.7,1]
uniform bool Julia; checkbox[false]
uniform float JuliaX; slider[-2,-0.6,2]
uniform float JuliaY; slider[-2,1.3,2]
vec2 c2 = vec2(JuliaX,JuliaY);

void init() {}

vec2 complexMul(vec2 a, vec2 b) {	
	return vec2( a.x*b.x - a.y*b.y,a.x*b.y + a.y * b.x);	
}

vec2 mapCenter = vec2(0.5,0.5);
float mapRadius =0.4;
uniform bool ShowMap; checkbox[true]
uniform float MapZoom; slider[0.01,2.1,6]

vec3 getMapColor2D(vec2 c) {
	vec2 p = (aaCoord-mapCenter)/(mapRadius);
	p*=MapZoom; p.x/=pixelSize.x/pixelSize.y;
	if (abs(p.x)<2.0*pixelSize.y*MapZoom) return vec3(0.0,0.0,0.0);
	if (abs(p.y)<2.0*pixelSize.x*MapZoom) return vec3(0.0,0.0,0.0);
	p +=vec2(JuliaX, JuliaY) ;
	vec2 z = vec2(0.0,0.0);
	int i = 0;
	for (i = 0; i < Iterations; i++) {	
		z = complexMul(z,z) +p;	
		if (dot(z,z)> 200.0) break;	
	}
	
	if (i < Iterations) {	
		float co = float( i) + 1.0 - log2(.5*log2(dot(z,z)));	
		co = sqrt(co/256.0);	
		return vec3( .5+.5*cos(6.2831*co),.5+.5*cos(6.2831*co),.5+.5*cos(6.2831*co) );	
	} else {
		return vec3(0.0);	
	}
	
}

// Skip initial iterations in coloring
uniform int Skip; slider[0,1,100]
// Scale color function
uniform float Multiplier; slider[-10,0,10]
uniform float StripeDensity; slider[-10,1,10]
// To test continous coloring
uniform float Test; slider[0,1,1]
uniform float EscapeRadius2; slider[0,1000,100000]

vec3 color(vec2 c) {
	if (ShowMap && Julia) {	
		vec2 w = (aaCoord-mapCenter);	
		w.y/=(pixelSize.y/pixelSize.x);	
		if (length(w)<mapRadius) return getMapColor2D(c);	
		if (length(w)<mapRadius+0.01) return vec3(0.0,0.0,0.0);	
	}
	
	vec2 z = Julia ? c : vec2(0.0,0.0);
	int i = 0;
	float count = 0.0;
	float avg = 0.0; // our average
	float lastAdded = 0.0;
	float z2 = 0.0; // last squared length
	for ( i = 0; i < Iterations; i++) {	
		z = complexMul(z,z) + (Julia ? c2 : c);	
		if (i>=Skip) {		
			count++;	
			lastAdded = 0.5+0.5*sin(StripeDensity*atan(z.y,z.x));		
			avg +=  lastAdded;
		}
		z2 = dot(z,z);
		if (z2> EscapeRadius2 && i>Skip) break;
	}
	float prevAvg = (avg -lastAdded)/(count-1.0);
	avg = avg/count;
	float frac =1.0+(log2(log(EscapeRadius2)/log(z2)));	
	frac*=Test;
	float mix = frac*avg+(1.0-frac)*prevAvg;
	if (i < Iterations) {		
		float co = mix*pow(10.0,Multiplier);
		co = clamp(co,0.0,10000.0);
		return vec3( .5+.5*cos(6.2831*co+R),.5+.5*cos(6.2831*co + G),.5+.5*cos(6.2831*co +B) );		
	} else {		
		return vec3(0.0);		
	}	
}

#preset Default
Center = -0.587525,0.297888
Zoom = 1.79585
AntiAliasScale = 1
AntiAlias = 1
Iterations = 278
R = 0
G = 0.4
B = 0.7
Julia = false
JuliaX = -0.6
JuliaY = 1.3
ShowMap = true
MapZoom = 2.1
Skip = 6
Multiplier = -0.1098
StripeDensity = 1.5384
Test = 1
EscapeRadius2 = 74468
#endpreset

#preset Julia
Center = -0.302544,-0.043626
Zoom = 4.45019
AntiAliasScale = 1
Iterations = 464
R = 0.58824
G = 0.3728
B = 0.27737
Julia = true
JuliaX = -1.26472
JuliaY = -0.05884
ShowMap = false
MapZoom = 1.74267
Skip = 4
Test = 1
EscapeRadius2 = 91489
Multiplier = 0.4424
StripeDensity = 2.5
AntiAlias = 2
#endpreset