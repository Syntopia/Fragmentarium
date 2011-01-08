#include "2D.frag"
#info Penrose-like Tilings (based on formula by tomkh)
#group Penrose Tilings

// Iterations. Increase when zooming in.
uniform int Iterations; slider[0,10,15]
uniform float Scale; slider[0,1,15]

uniform bool BooleanTest; checkbox[false]


uniform sampler2D texture; file[texture2.jpg]
uniform sampler2D texture3; file[texture.jpg]


// An implementation of the system 
// decribed by 'tomkh' in this thread;
// http://www.fractalforums.com/new-theories-and-research/procedural-aperiodic-fractals/

// A lot of constants here
float pi =3.141592653589 ; 
float sc = 2.0/(sqrt(5.0)-1.0);  // inflation scale
float d1 = tan(54.0*pi/180.0);
float d2 = tan(18.0*pi/180.0);
float a1 = .5/cos(36.0*pi/180.0);
float a2 = (1.0+a1)*.5;
float a3 = tan(36.0*pi/180.0)*a2;
float cos1 = cos(144.0*pi/180.0)*sc;
float  sin1 = sin(144.0*pi/180.0)*sc;
float cos2 = cos(108.0*pi/180.0)*sc;
float sin2 = sin(108.0*pi/180.0)*sc;
mat2	m1 = mat2(-sc,0.0, 0,sc);
vec2	p1 = vec2(-a2,-a3 );
mat2	m2= mat2(cos1,-sin1,sin1,cos1);
mat2	m3= mat2(cos1,sin1,-sin1,cos1);
mat2	m4= mat2(-cos2,sin2,sin2,cos2);
mat2	m5= mat2(cos2,sin2,-sin2,cos2);


vec3 getColor2D(vec2 z) {
       vec2 d = z*Scale;
	int triangleType = 0;
	for(int k=0; k<Iterations; k++) {
		if (triangleType == 0) {
			if (1.0 - d1*z.y - z.x > 0.0) {
				z *= m1; z.x += sc;
		} else if (1.0 - d2*z.y - z.x > 0.0) {
				z += p1; z *= m2; triangleType = 1;
			} else {
				z.x-=(1.0+a1); z*= m3;
			}
		} else {
			if (BooleanTest && d1*z.y - z.x > 0.0) {
				z*=m4; triangleType = 0;
			} else {
				z.x -= a1; z*= m5;
			}
		}
	}
	return (triangleType == 0)  ? texture2D(texture,d).xyz :  
 		texture2D(texture3,d).xyz  ;
//vec3(1.0,0.0,0.0);
}

