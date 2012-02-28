// An implementation of Quilez's warping (domain distortions):
// http://iquilezles.org/www/articles/warp/warp.htm
// 
// Not as good as his, but still interesting.
// 
#include "2D.frag"

uniform float Mul; slider[0,2,10]
uniform float Decay; slider[0,0.5,2]
uniform int Iterations; slider[0,1,19]

float rand(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise2f( in vec2 p )
{
	vec2 ip = vec2(floor(p));
	vec2 u = fract(p);
	// http://www.iquilezles.org/www/articles/morenoise/morenoise.htm
	u = u*u*(3.0-2.0*u);
	//u = u*u*u*((6.0*u-15.0)*u+10.0);
	
	float res = mix(
		mix(rand(ip),  rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),   rand(ip+vec2(1.0,1.0)),u.x),
		u.y)
	;
	return res*res;
	//return 2.0* (res-0.5);
}


float fbm(vec2 c) {
	float f = 0.0;
	float w = 1.0;
	for (int i = 0; i < Iterations; i++) {
		f+= w*noise2f(c);
		c*=Mul;
		w*=Decay;
	}
	return f;
}

uniform float time;

vec2 cMul(vec2 a, vec2 b) {
	return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}

float pattern(  vec2 p, out vec2 q, out vec2 r )
{
	q.x = fbm( p  +0.00*time);
	q.y = fbm( p + vec2(1.0));
	
	r.x = fbm( p +1.0*q + vec2(1.7,9.2)+0.15*time );
	r.y = fbm( p+ 1.0*q + vec2(8.3,2.8)+0.126*time);
//	r = cMul(q,q);
	return fbm(p +1.0*r + 0.0* time);
}

uniform vec3 color1; color[0.0,1.0,0.0]
uniform vec3 color2; color[1.0,0.0,0.0]
uniform vec3 color3; color[0.0,1.0,0.0]
uniform vec3 color4; color[0.0,0.0,1.0]

vec3 color(vec2 c) {
	vec2 q;
	vec2 r;
	float f = pattern(c*0.01,q,r);
	vec3 col = mix(color1,color2,clamp((f*f)*4.0,0.0,1.0));
	col = color2;
	col = mix(col,color3,clamp(length(q),0.0,1.0));
	col = mix(col,color4,clamp(length(r.x),0.0,1.0));
	return (f*f+0.2)*col;
}

#preset Default
Center = -554.488,65.9944
Zoom = 0.0092811
AntiAliasScale = 1
AntiAlias = 1
Mul = 2
Decay = 0.5
Iterations = 13
color1 = 0.101961,0.619608,0.666667
color2 = 0.666667,0.666667,0.498039
color3 = 0,0,0.164706
color4 = 0.666667,1,1
#endpreset
