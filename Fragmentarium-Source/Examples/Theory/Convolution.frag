#version 150

// A script for providing cosinus-convoluted long-lat maps
uniform sampler2D texture;  file[f:\HDR\Mt-Washington-Cave-Room_Ref.hdr]
//uniform sampler2D texture; file[f:\hdr\Alexs_Apt_Env.hdr]


//uniform sampler2D texture; file[f:\house.jpg]


vec2 ImageSize = vec2(3200,1600);
#define providesFiltering
#include "Progressive2D.frag"
#define PI  3.14159265358979323846264

// returns (r,theta [0..pi],phi [-pi,pi])
vec3 cartesianToSpherical(vec3 p) {
	float r = length(p);
	float theta = acos(p.z/r);
	float phi = atan(p.y,p.x);
	return vec3(r,theta,phi);
}

vec3 sphericalToCartesian(vec3 s) {
	return s.x*vec3(sin(s.y)*cos(s.z), sin(s.z)*sin(s.y), cos(s.y));
}

vec3 directionFromEquilateral(vec2 pos) {
	// pos.x [0,1] spans the 360 degrees wrapping around
	// pos.y [0,1] spans the 180 degrees from up (=1.0) to down = (0.0).
	return sphericalToCartesian(vec3(1.0, pos.y*PI, pos.x*2.0*PI));
}

vec2 position =  (viewCoord+vec2(1.0))/2.0;
uniform vec2 Cursor; slider[(0,0),(1,1),(1,1)]
uniform float CursorCos; slider[0,1,1]
uniform float FilterSize; slider[0,0.1,1.0]
uniform float Power; slider[0,1,120]
uniform bool PreviewImage; checkbox[false]
uniform float PreviewPower; slider[0,5,12]

vec4 color(vec2 pos) {
position.y = 1.0-position.y;
if (PreviewImage) {
	vec3 vo = texelFetch( texture,  ivec2(position*(ImageSize-vec2(1.0))),0 ).xyz;
	return vec4(vo*pow(10,PreviewPower-5.0),1.0);
}	

	if (length(position-Cursor)<0.01)  {
		return vec4(1.0,0.0,0.0,0.0);
	}
	vec3 dir1x = directionFromEquilateral(Cursor);
	vec3 dir3x = directionFromEquilateral(position);
	float b = max(0.0,dot(dir1x,dir3x));
	if (b>1.0-CursorCos) return vec4(1.0,1.0,1.0,1.0);
	
	// Biased sampling
      /*
	vec2 r = FilterSize*uniformDisc(viewCoord*(float(backbufferCounter)));	
	vec2 p = position + r;
	p.x = mod(p.x,1.0);
	if (p.y>1.0) p.y =1.0;
	if (p.y<0.0) p.y=0.0;
      */

	vec2 p = rand(viewCoord*(float(backbufferCounter)));
	vec4 v2 = texelFetch( texture,  ivec2(p*(ImageSize-vec2(1.0))),0 );
	
	// Gaussian
	vec2 r = position-p;
	float f = dot(r,r)/(FilterSize*FilterSize);
	float w = exp(-f)-exp(-1.0);
	
	vec3 dir1 = directionFromEquilateral(position);
	vec3 dir2 = directionFromEquilateral(p);
	dir1 = normalize(dir1);
	dir2 = normalize(dir2);
	float c = max(0.0,dot(dir1,dir2));
	//if (FilterSize == 0) w = 1.0;
	w = pow(c,Power);
	
	return vec4(pow(v2.xyz,vec3(Gamma))*w,w);
}