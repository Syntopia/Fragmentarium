#donotrun
#include "3D.frag"

#group Raytracer


// Distance to object at which raymarching stops.
uniform float Detail;slider[-7,-2.3,0];

// Lower this if the system is missing details
uniform float FudgeFactor;slider[0,1,1];

float minDist = pow(10.0,Detail);

// Maximum number of  raymarching steps.
uniform int MaxRaySteps;  slider[0,56,2000]


#group Light




#group Coloring

// Background color
uniform vec3 BackgroundColor; color[0.6,0.6,0.45]

float DE(vec3 pos) ; // Must be implemented in other file

#ifdef providesNormal
vec3 normal(vec3 pos, float normalDistance);

#else
vec3 normal(vec3 pos, float normalDistance) {
	normalDistance = max(normalDistance*0.5, 1.0e-7);
	vec3 e = vec3(0.0,normalDistance,0.0);
	vec3 n = vec3(DE(pos+e.yxx)-DE(pos-e.yxx),
		DE(pos+e.xyx)-DE(pos-e.xyx),
		DE(pos+e.xxy)-DE(pos-e.xxy));
	n = normalize(n);
	return n;
}
#endif

#group Floor


#define PI  3.14159265358979323846264

vec2 spherical(vec3 dir) {
	return vec2( acos(dir.z)/PI, atan(dir.y,dir.x)/(2.0*PI) );
}

vec3 fromPhiTheta(vec2 p) {
	return vec3(
		cos(p.x)*sin(p.y),
		sin(p.x)*sin(p.y),
		cos(p.y));
}


float rand(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}


#ifdef  providesColor
vec3 baseColor(vec3 point, vec3 normal);
#endif

bool trace(vec3 from, vec3 dir, inout vec3 hit, inout vec3 hitNormal) {
	vec3 direction = normalize(dir);
	float eps = minDist;
	float dist = 1000.0;
	
	float totalDist = 0.0;
	for (int steps=0; steps<MaxRaySteps && dist > eps; steps++) {
		hit = from + totalDist * direction;
		dist = DE(hit) * FudgeFactor;
		totalDist += dist;
	}
	if (dist < eps) {
		hit =  from + (totalDist-eps) * direction;
		hitNormal = normal(hit, eps);
		return true;
	}
	return false;
}


uniform float SunExtent; slider[0,0.01,0.05]
uniform float reflectivity; slider[0,0.2,1.0]

float traceShadow(vec3 from, vec3 dir) {
	vec3 direction = normalize(dir);
	from += direction* minDist *5.0;
	
	float eps = minDist;
	float dist = 1000.0;
	
	float totalDist = 0.0;
	for (int steps=0; steps<MaxRaySteps/5 && dist > eps; steps++) {
		dist = DE(from + totalDist * direction) ;
		totalDist += dist;
	}
	return (dist < eps) ? 0.0 : 1.0;
}

vec3 ortho(vec3 d) {
	if (abs(d.x)>0.1 || abs(d.y)>0.1) {
		return vec3(d.y,-d.x,0.0);
	} else  {
		return vec3(0.0,d.z,-d.y);
	} 
}


vec2 cx=
vec2(
	floor(mod(subframe*1.0,10.)),
	 floor(mod(subframe*0.1,10.))
	)/10.0;


uniform bool Stratify; checkbox[true]


vec3 getSampleBiased(vec3  dir, float power) {
	dir = normalize(dir);
	// create orthogonal vector (fails for z,y = 0)
//	vec3 o1 = normalize( vec3(0., -dir.z, dir.y));
	vec3 o1 = normalize(ortho(dir));
	vec3 o2 = normalize(cross(dir, o1));
	
	// Convert to spherical coords aligned to dir;
	vec2 r = rand2(viewCoord*(float(subframe)+1.0));
	if (Stratify) {r*=0.1; r+= cx;}
	r.x=r.x*2.*PI;
	
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



vec3 getSample(vec3 dir, float extent) {
	// Create orthogonal vector (fails for z,y = 0)
	dir = normalize(dir);
	vec3 o1 = normalize(ortho(dir));
	vec3 o2 = normalize(cross(dir, o1));
	
	// Convert to spherical coords aligned to dir
	vec2 r =  rand2(viewCoord*(float(subframe)+1.0));
	r.x=r.x*2.*PI;
	r.y=1.0-r.y*extent;
	
	float oneminus = sqrt(1.0-r.y*r.y);
	return cos(r.x)*oneminus*o1+sin(r.x)*oneminus*o2+r.y*dir;
}


vec3 getBRDFRay( in vec3 normal, in vec3 rd)
{
	//randomly direct the ray in a hemisphere or cone based on reflectivity
	vec2 r = rand2(viewCoord*(float(subframe)+1.0));
	
	if( r.x > reflectivity ) {
		return getSampleBiased( normal, 1.0 );
		//return getSample( normal, 1.0 );
	}
	else {//return a cone direction for a reflected ray
		vec3 p=reflect(rd,normal);
		return getSample( p, 0.002 );
	}
}

uniform vec3 sunDirection; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
uniform vec3 sunColor; slider[(0,0,0),(1,0.3,0.3),(1,1,1)]
uniform vec3 skyColor; slider[(0,0,0),(0.3,0.3,1.0),(1,1,1)]
uniform bool Bias; checkbox[true]

vec3 applyLighting( in vec3 pos, in vec3 normal )
{
	if (Bias) {
		//  sun
		vec3  dir = getSample( sunDirection, SunExtent );
		vec3 color = max(0.0, dot(dir, normal)) * sunColor *traceShadow(pos,dir);
		
		//  sky
		dir = getSampleBiased( normalize(vec3(1.,0.0,0.1)), 1. );
		color +=  skyColor*traceShadow(pos,dir)/(2.0);
		
		return color;
	} else {
		//  sun
		vec3  dir = getSample( sunDirection, SunExtent );
		vec3 color = max(0.0, dot(dir, normal)) * sunColor *traceShadow(pos,dir);
		
		//  sky
		dir = getSample( normalize(vec3(1.,0.0,0.1)), 1. );
		color += max(0.0, dot(dir, normal))* skyColor*traceShadow(pos,dir);
		
		return color;
	}
	
}
uniform float SunStrength; slider[0,100,2000]
vec3 getBackground(vec3 dir) {
	dir = normalize(dir);
	vec3 c =vec3(0.0);
	if (dir.x>.0) c+=  skyColor;
	if (dot(normalize(sunDirection), dir) >1-SunExtent )
	c+= sunColor*SunStrength;
	return c;
}
uniform bool NextEvent; checkbox[true]
uniform int RayDepth; slider[0,2,5] Locked
uniform bool DebugNormals; checkbox[true]
vec3 color(vec3 from, vec3 dir)
{
	vec3 hit = vec3(0.0);
	vec3 hitNormal = vec3(0.0);
	
	vec3 color = vec3(0.0); // Accumulated color
	vec3 fcol = vec3(1.0);
	for( int i=0; i <RayDepth && dot(fcol,fcol)>0.1; i++ )
	{
		if (trace(from,dir,hit,hitNormal)) {
			// We hit something
			from = hit;
			
			if (DebugNormals) return abs(hitNormal);
			#ifdef providesColor
			fcol*= baseColor(hit, hitNormal);
			#else
			fcol*= vec3(1.0);
			#endif
			if (NextEvent) {			
				color += fcol * applyLighting( hit, hitNormal );
			}

			dir = getBRDFRay( hitNormal, dir );// prepare ray for indirect light gathering (bounce)
			from += dir*minDist*3.0;
		}else{
			// We hit nothing
			if (NextEvent) {
				if (i==0) return getBackground( dir );
				break;
			}
		
			color+=fcol*getBackground( dir );
			break;
		}
	}
	return color;
}


