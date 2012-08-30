#include "2D.frag"
#include "Complex.frag"

// A Escher/Droste transformation.
//
// This implementation uses GLSL code by ArKano22: 
// http://www.gamedev.net/topic/590070-glsl-droste/
//
// The image is of my youngest daughter, Vigga. 
uniform float r1; slider[0,0.5,2]
uniform float r2; slider[0,1,2]

#define PI 3.14159265

float nearestPower(in float a, in float base){
	return pow(base,  ceil(  log(abs(a))/log(base)  )-1.0 );
}

float map(float value, float istart, float istop, float ostart, float ostop) {
	return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

uniform sampler2D texture; file[texture2.jpg]

uniform float time;
uniform float Branches; slider[0,1,8]
vec3 color(vec2 z) {
	float scale = r1/r2;

	// ArKano22 code below (http://www.gamedev.net/topic/590070-glsl-droste/)
	float branches = 1.0;
	float factor = pow(1.0/scale,Branches);
	z = cPower2(z, cDiv(vec2( log(factor) ,2.0*PI), vec2(0.0,2.0*PI) ) );
	float s = fract(time);
	s = log(s+1.)/log(2.);  // <-- I found this works better for linear animation
	z *= 1.0+s*(scale-1.0);
	float npower = max(nearestPower(z.x,scale),nearestPower(z.y,scale));
	z.x = map(z.x,-npower,npower,-1.0,1.0);
	z.y = map(z.y,-npower,npower,-1.0,1.0);
	return  texture2D(texture,z*0.5+vec2(0.5)).xyz;//+ grid(z);
}

#preset Default
Center = -0.276125,0.175167
Zoom = 0.639375
AntiAliasScale = 1
AntiAlias = 1
r1 = 0.38776
r2 = 0.89286
Branches = 1
texture = vigga.jpg NotLocked
#endpreset

