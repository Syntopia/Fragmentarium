// A script for providing cosinus-convoluted long-lat maps
uniform sampler2D texture;  file[Ditch-River_2k.hdr]

#define IterationsBetweenRedraws 10

#define providesFiltering
#define linearGamma
//#define SubframeMax 0
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

vec2 equilateralFromDirection(vec3 pos) {
	// pos.x [0,1] spans the 360 degrees wrapping around
	// pos.y [0,1] spans the 180 degrees from up (=1.0) to down = (0.0).
	vec2 v =  cartesianToSpherical(pos).zy;
	v.x /= 2.0*PI;
	v.y /=PI;
       if (v.x<0.0) v.x =1.0+v.x;
	return v;
}

vec2 position =  (viewCoord+vec2(1.0))/2.0;

// Can be used to place a 'cursor' on the image
uniform vec2 Cursor; slider[(0,0),(0.23,0.81),(1,1)]
// Size of cursor (cosinus to angle)
uniform float CursorCos; slider[0,0,1]

// This is power of the dot product (1 for diffuse, higher for specular)
uniform float Power; slider[0,1,500]
// Check this to see image without filtering
uniform bool PreviewImage; checkbox[false]
// Use this to set the exposure
uniform float PreviewExposure; slider[0,5,12]

uniform bool Stratify; checkbox[true]

vec2 cx=
vec2(
	floor(mod(backbufferCounter*1.0,10.)),
	 floor(mod(backbufferCounter*0.1,10.))
	)/10.0;

vec3 getSample(vec3  dir) {
	// create orthogonal vector (fails for z,y = 0)
	vec3 o1 = normalize( vec3(0., -dir.z, dir.y));
	vec3 o2 = normalize(cross(dir, o1));
	
	// Convert to spherical coords aligned to dir;
	vec2 r = rand(viewCoord*(float(backbufferCounter)+1.0));
	if (Stratify) {r*=0.1; r+= cx;}
	r.x=r.x*2.*PI;
	r.y=1.0-r.y;

	float oneminus = sqrt(1.0-r.y*r.y);
	vec3 sdir = cos(r.x)*oneminus*o1+
	sin(r.x)*oneminus*o2+
	r.y*dir;
	return sdir;
}



vec3 getSampleBiased(vec3  dir, float power) {
	
	// create orthogonal vector (fails for z,y = 0)
	vec3 o1 = normalize( vec3(0., -dir.z, dir.y));
	vec3 o2 = normalize(cross(dir, o1));
	
	// Convert to spherical coords aligned to dir;
	vec2 r = rand(viewCoord*(float(backbufferCounter)+1.0));
	if (Stratify) {r*=0.1; r+= cx;}
	r.x=r.x*2.*PI;
	r.y = 1.0-r.y;

	// This should be cosine^n weighted.
	// See, e.g. http://people.cs.kuleuven.be/~philip.dutre/GI/TotalCompendium.pdf
	// Item 36
	r.y=pow(r.y,1.0/(power+1.0));

	float oneminus = sqrt(1.0-r.y*r.y);
	vec3 sdir = cos(r.x)*oneminus*o1+
	sin(r.x)*oneminus*o2+
	r.y*dir;
	
	return sdir;
}

uniform bool Bias; checkbox[false]

uniform vec2 Rotate; slider[(-1,-1),(0,0),(1,1)]

vec4 color(vec2 pos) {
	position.y = 1.0-position.y;

	if (PreviewImage) {
		vec3 vo = texture2D( texture, position).xyz;
		return vec4(vo*pow(10.0,PreviewExposure-5.0),1.0);
	}
	
	// The direction of the current pixel
	vec3 currentDir = directionFromEquilateral(position);
		
	// Check the cursor overlay
	vec3 cursorDir = directionFromEquilateral(Cursor);
	float b = max(0.0,dot(cursorDir,currentDir));
	if (b>1.0-CursorCos) return vec4(vec3(1.0,0.0,0.0),1.0);
	
	// Get a random sample
	vec3 sampleDir;	
	if (Bias) {
		sampleDir = getSampleBiased(currentDir,Power);
	} else {
		sampleDir = getSample(currentDir);
	}

	float c = max(0.0,dot(currentDir,sampleDir));
       if (c == 0.0) return vec4(0.0,0.0,0.0,0.0);
	
	vec2 p = equilateralFromDirection(sampleDir);
	p+=Rotate;
	vec3 v2 = texture2D( texture,p).xyz;	
	float w = pow(c,Power);
	if (Bias) {
		w = 1.0;
		return vec4(v2,1.0);
	} else {
		return vec4(v2*w,1.0*w);
	}
}