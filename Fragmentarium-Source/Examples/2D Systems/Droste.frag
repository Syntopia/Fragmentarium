#include "2D.frag"
#include "complex.frag"

// A Escher/Droste transformation.
//
// This implementation uses GLSL code by ArKano22: 
// http://www.gamedev.net/topic/590070-glsl-droste/

float  line(float x, float modulo, float width) {
	float s = abs(mod(x-modulo/2.,modulo)-modulo/2.) ;
	return (smoothstep(width*modulo,width*modulo*2.,clamp(s,0.0*width*modulo, width*modulo*2.)));
}

uniform float r1; slider[0,0.5,2]
uniform float r2; slider[0,1,2]
uniform vec2 C; slider[(0,0),(1,1),(1,1)]
uniform vec2 W; slider[(0,0),(0.02,0.02),(1,1)]

vec3 grid(vec2 c) {
	vec3 col =  vec3( 1.0-line(c.x,C.x,W.x)) + vec3(1.0-line(c.y,C.y,W.y));
	
	if (length(c)< r2 && length(c)>r1) col += vec3(0.5);
	if (length(c)< r1 ) col += vec3(0.,0.5,0.);
	
	if (abs(c.x)< r2 && abs(c.y)<r2)  col += vec3(0.5,0.,0.);
	col = clamp(col,0.,1.);
	return col;
}

#define PI 3.14159265

float nearestPower(in float a, in float base){
	return pow(base,  ceil(  log(abs(a))/log(base)  )-1.0 );
}

float map(float value, float istart, float istop, float ostart, float ostop) {
	return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

uniform sampler2D texture; file[texture2.jpg]

uniform float time;
uniform float Mix; slider[0,1,1]
uniform bool Variant; checkbox[true]
uniform vec2 Offset; slider[(-4,-4),(1,1),(4,4)]
uniform float Branches; slider[0,1,8]
vec3 color(vec2 z) {
	// Jos Leys transformations:
	float scale = r1/r2;
	/*
	float alpha = atan(log(r2/r1)/(2.*PI));
	float f = cos(alpha);
	vec2 beta = f*cExp(vec2(0.,alpha));
	z =r1* cExp(Offset+cDiv(cLog(z),beta));
	*/
	
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
Center = -219.024,16.2439
Zoom = 0.000261913
Angle = 0
r1 = 0.38776
r2 = 0.89286
C = 0.18713,0.16959
W = 0.02,0.02
texture = C:/Users/Mikael/Desktop/v3.jpg NotLocked
Mix = 0.37037
Variant = true
AntiAliasScale = 1
AntiAlias = 1
Offset = 0.31168,7.648
#endpreset

