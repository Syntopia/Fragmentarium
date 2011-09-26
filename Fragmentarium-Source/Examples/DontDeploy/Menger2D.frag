#include "2D.frag"
#info Menger2D
#group Menger2D

// Number of iterations
uniform int  Iterations; slider[1,10,1000]

uniform float R; slider[0,0,1]
uniform float G; slider[0,0.4,1]
uniform float B; slider[0,0.7,1]


// Scale parameter. A perfect Menger is 3.0
uniform float Scale; slider[0.00,3.0,4.00]
uniform float PW; slider[-10,0,10]
uniform vec2 Offset; slider[(0,0),(1,1),(1,1)]

mat2 rot;

uniform float Angle; slider[-180,0,180]

void init() {
       float angle = radians(Angle);
	 rot = mat2( cos(angle), sin(angle), -sin(angle), cos(angle));
}

uniform float F; slider[0,1.1,2.3]
vec3 getColor2D(vec2 c) {
	int n = 0;
	vec2 orbit = vec2(100000.0);
	while (n < Iterations) {
		c= abs(c);
		if (c.x<c.y){ c.xy = c.yx;}
		c = Scale*c-Offset*(Scale-1.0);
		if( c.y<-0.5*Offset.y*(Scale-1.0))  c.y+=Offset.y*(Scale-1.0);
float angle=radians(Angle/( float(n)/float(Iterations) + 1.0) );	
 rot = mat2( cos(angle), sin(angle), -sin(angle), cos(angle));
	
c*=rot;		
n++;
		float l = length(c);
		if (l<length(orbit)) orbit= c;
		if (l>10000.0) break;
	}

	float d =  (length(c) ) * pow(Scale, float(-n));

	if (length(c)>10000.0) {
		return vec3(0.0);
		float co = d*pow(10.0,PW);
		return vec3( .5+.5*cos(6.2831*co+R),
			.5+.5*cos(6.2831*co + G),
			.5+.5*cos(6.2831*co +B) );
	}  else {
		orbit*=pow(10.0,PW);
float co = orbit.x*pow(10.0,PW);
		return vec3( .5+.5*cos(6.2831*co+R),
			.5+.5*cos(6.2831*co + G),
			.5+.5*cos(6.2831*co +B) );
		return vec3(fract(orbit.x), fract(orbit.y),1.0);
	}

	
}
