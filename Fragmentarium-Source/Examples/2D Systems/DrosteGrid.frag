#include "2D.frag"
#include "Complex.frag"

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
uniform vec2 Size; slider[(0,0),(1,1),(1,1)]
uniform vec2 Width; slider[(0,0),(0.02,0.02),(1,1)]

vec3 grid(vec2 c) {
	vec3 col =  vec3( 1.0-line(c.x,Size.x,Width.x)) + vec3(1.0-line(c.y,Size.y,Width.y));
	
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

uniform float time;
uniform bool Variant; checkbox[true]
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
	return  grid(z);
}

#preset Default
Center = -219.024,-23.8407
Zoom = 9.40118e-05
AntiAliasScale = 1
AntiAlias = 1
r1 = 0.38776
r2 = 0.89286
Variant = true
Branches = 1
Size = 1,1
Width = 0.02,0.02
#endpreset

