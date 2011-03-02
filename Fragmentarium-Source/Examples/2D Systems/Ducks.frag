#include "2D.frag"
#info Ducks (Samuel Monnier)
#group Ducks

// 'Ducks' fractal by Samuel Monnier
// (Implementation by Syntopia)
// See http://www.algorithmic-worlds.net/blog/blog.php?Post=20110227

// Number of iterations
uniform int  Iterations; slider[10,200,1000]
uniform int  PreIterations; slider[0,1,100]

uniform float R; slider[0,0,1]
uniform float G; slider[0,0.4,1]
uniform float B; slider[0,0.7,1]
uniform float C; slider[0,1,2]
uniform vec2 v; slider[(-1,-1),(0,0),(1,1)]
void init() {}

vec2 zlog(vec2 a) {
	float b =  atan(a.y,a.x);
	if (b>0.0) b-=2.0*3.1415;
	return vec2(log(length(a)),b);
}


uniform bool Julia; checkbox[false]
uniform float JuliaX; slider[-0.4,0,1.2]
uniform float JuliaY; slider[3.0,5.0,8.0]

vec2 c2 = vec2(JuliaX,JuliaY);

vec3 getColor2D(vec2 c) {
	vec2 z = Julia ?  c : v;
	
	float mean = 0.0;
	
	for (int i = 0; i < Iterations; i++) {
		z = zlog(vec2(z.x,abs(z.y)))+ (Julia ? c2 : c);
		if (i>PreIterations) mean+=length(z);
	}
	mean/=float(Iterations-PreIterations);
	
	// The color scheme here is based on one
	// from Inigo Quilez's Shader Toy:
	float co =   1.0 - log2(.5*log2(mean/C));
	return vec3( .5+.5*cos(6.2831*co+R),.5+.5*cos(6.2831*co + G),.5+.5*cos(6.2831*co +B) );
	
}

/*
Center = -0.0976,5.4036
Zoom = 1.095
AntiAlias = 1
AntiAliasScale = 1
Iterations = 40
R = 0.3375
G = 0.4
B = 0.35404
C = 0
v = 0.94904,0



Center = 0.0108,5.099
Zoom = 27.643
AntiAlias = 3
AntiAliasScale =1
Iterations = 54
R = 0.54374
G = 0.4125
B = 0.37267
v = 0.94904,0
C = 0.7875


Center = -0.0124,5.0958
Zoom = 43.4729
AntiAlias = 3
AntiAliasScale = 1
Iterations = 54
R = 0.6625
G = 0.4125
B = 0.37267
v = 0.19746,0
C = 0.7875
PreIterations = 12

Center = -1.5922,0.0692
Zoom = 0.095
AntiAliasScale = 1
AntiAlias = 3
Iterations = 76
PreIterations = 12
R = 0.6625
G = 0.4125
B = 0.37267
C = 0.7875
v = 0.19746,0
Julia = true
JuliaX = 0.32348
JuliaY = 4.3


Center = -1.5922,0.0692
Zoom = 0.166
AntiAliasScale = 1
AntiAlias = 3
Iterations = 91
PreIterations = 12
R = 0.6625
G = 0.4125
B = 0.52174
C = 0.7875
v = 0.19746,0
Julia = true
JuliaX = 0.23528
JuliaY = 5.5384


#preset duck1
Center = -1.075,-0.0833163
Zoom = 0.454
AntiAliasScale = 0.9901
AntiAlias = 4
Iterations = 54
PreIterations = 9
R = 0.44375
G = 0.55
B = 0.62112
C = 0.775
v = 0.19746,0
Julia = true
JuliaY = 5.05716
JuliaX = -0.11766


Center = 0.974,4.4458
Zoom = 0.263
AntiAliasScale = 0.9901
AntiAlias = 1
Iterations = 113
PreIterations = 7
R = 0.44375
G = 0.55
B = 0.62112
C = 1.075
v = -0.03184,0
Julia = true
JuliaX = 0.497
JuliaY = 5.92855


Center = 168.711,43.4073
Zoom = 0.0404007
AntiAliasScale = 0.9901
AntiAlias = 3
Iterations = 180
PreIterations = 10
R = 0.975
G = 0.53125
B = 0.62112
C = 1.0125
v = 0.50318,0
Julia = true
JuliaX = 0.45882
JuliaY = 5.85715
*/

