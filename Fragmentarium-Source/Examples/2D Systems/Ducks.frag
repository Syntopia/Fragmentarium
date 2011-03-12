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
uniform bool Julia; checkbox[false]
uniform float JuliaX; slider[-0.4,0,1.2]
uniform float JuliaY; slider[3.0,5.0,8.0]

void init() {}

vec2 zlog(vec2 a) {
	float b =  atan(a.y,a.x);
	if (b>0.0) b-=2.0*3.1415;
	return vec2(log(length(a)),b);
}

vec2 c2 = vec2(JuliaX,JuliaY);

vec3 getColor2D(vec2 c) {
	vec2 z = Julia ?  c : vec2(1.0,0.0);
	
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

#preset Principal Ducks Structure
Center = -0.103356,4.76826
Zoom = 0.502601
AntiAliasScale = 1
AntiAlias = 3
Iterations = 69
PreIterations = 0
R = 0.50625
G = 0.3375
B = 0.32919
C = 0.2
Julia = false
JuliaX = 0
JuliaY = 5
#endpreset

#preset Bone Structure
Center = 0.0108,5.099
Zoom = 27.643
AntiAliasScale = 1
AntiAlias = 3
Iterations = 54
PreIterations = 1
R = 0.54374
G = 0.4125
B = 0.37267
C = 0.7875
Julia = false
JuliaX = 0
JuliaY = 5
#endpreset

#preset Pattern 1
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
Julia = true
JuliaX = 0.23528
JuliaY = 5.5384
#endpreset

#preset Bifurations
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
Julia = true
JuliaY = 5.05716
JuliaX = -0.11766
#endpreset


#preset Cell
Center = -408.698,10
Zoom = -0.000493858
AntiAliasScale = 0.9901
AntiAlias = 2
Iterations = 165
PreIterations = 4
R = 0.61875
G = 0.6125
B = 0.47205
C = 1
Julia = true
JuliaX = 0.36469
JuliaY = 5.89285
#endpreset

#preset Spooky
Center = -0.05144,-1.0548
Zoom = 92.248
AntiAliasScale = 0.9901
AntiAlias = 2
Iterations = 261
PreIterations = 6
R = 0.69375
G = 0.6125
B = 0.5031
C = 0.9625
Julia = true
JuliaX = 0.38824
JuliaY = 5.89285
#endpreset
