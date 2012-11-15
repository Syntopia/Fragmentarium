#include "3D.frag"
uniform sampler2D texture; file[Ditch-River_2k.hdr]
uniform sampler2D texture2; file[Ditch-River_Env.hdr]

// An example of working with 3D without a distance estimator

// Free HDRI's: http://www.hdrlabs.com/sibl/archive.html

float sphereLine(vec3 pos, vec3 dir, vec3 center, float radius, out vec3 normal) {
	vec3 sd=center-pos;
	float b = dot(dir,sd);
	float temp = b*b+radius*radius-dot(sd,sd);
	if (temp>0.0) {
		temp = b - sqrt(temp); // intersection distance
		normal = normalize((pos+temp*dir)-center);
		return temp;
	}
	normal = vec3(0.0);
	return -1.;
}

#define PI  3.14159265358979323846264

vec3 equirectangularMap(vec3 dir, sampler2D sampler) {
	dir = normalize(dir);
	vec2 longlat = vec2(atan(dir.y,dir.x),acos(dir.z));
 	return texture2D(sampler,longlat/vec2(2.0*PI,PI) ).xyz;
	
}

uniform float Specular; slider[0,1,1]
uniform float Diffuse;slider[0,1,1]

vec3 color(vec3 pos, vec3 dir) {
	
	vec3 normal = vec3(1.0,1.0,1.0);
	float intersect = 10000.0;
	vec3 finalNormal = vec3(0.0);
	for (int j = 0; j < 6; j++) {
		float z = (float(j)-6.0)/2.0;
		float i = sphereLine(pos,normalize(dir),vec3(1.0,0.0+float(j),z),0.5, normal);
		if (i<intersect && i>0.) {
			intersect =i;
			finalNormal = normal;
		}
	}
	
	if (intersect<10000.) {
		vec3 reflected = -2.0*dot(dir,finalNormal)*finalNormal+dir;
		vec3 col = Specular*equirectangularMap(reflected, texture);
		vec3 col2 = Diffuse*equirectangularMap(finalNormal, texture2);
		return col+col2;
	}
	vec3 col =equirectangularMap(dir,texture);
	return col;
}



#preset Default
FOV = 0.4
Eye = 8.42062,8.55686,-1.41974
Target = 0.781867,2.10355,-1.35523
Up = 0.0291443,-0.024509,0.999275
EquiRectangular = false
FocalPlane = 1
Aperture = 0
Gamma = 2.2222
ToneMapping = 3
Exposure = 1
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 2
texture = Ditch-River_2k.hdr
texture2 = Ditch-River_Env.hdr
Specular = 1,0
Diffuse = 1,0,1
#endpreset
