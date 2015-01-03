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
vec4 orbitTrap = vec4(10000.0);

#group Light




#group Coloring


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

#group Coloring

// This is the pure color of object (in white light)
uniform vec3 BaseColor; color[1.0,1.0,1.0];
// Determines the mix between pure light coloring and pure orbit trap coloring
uniform float OrbitStrength; slider[0,0,1]

// Closest distance to YZ-plane during orbit
uniform vec4 X; color[-1,0.7,1,0.5,0.6,0.6];

// Closest distance to XZ-plane during orbit
uniform vec4 Y; color[-1,0.4,1,1.0,0.6,0.0];

// Closest distance to XY-plane during orbit
uniform vec4 Z; color[-1,0.5,1,0.8,0.78,1.0];

// Closest distance to  origin during orbit
uniform vec4 R; color[-1,0.12,1,0.4,0.7,1.0];



uniform bool CycleColors; checkbox[false]
uniform float Cycles; slider[0.1,1.1,32.3]

#group Raytracer

uniform sampler2D EnvironmentMap; file[Ditch-River_env.hdr]
uniform float RotateMap; slider[0.00,0,6.28]

// Can be used to remove banding
uniform float Dither;slider[0,0.5,1];

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
		
		//		if (steps == 0)
		dist*=(Dither*rand(dir.xy))+(1.0-Dither);
		totalDist += dist;
	}
	if (dist < eps) {
		hit =  from + (totalDist-eps) * direction;
		hitNormal = normal(hit, eps);
		return true;
	}
	return false;
}

uniform float reflectivity; slider[0,0.2,1.0]
uniform bool debugLast; checkbox[false]
uniform bool Stratify; checkbox[false]
uniform bool WhiteBackground; checkbox[false]
uniform int RayDepth; slider[0,2,5] Locked
uniform float Albedo; slider[0,1,1]


vec3 ortho(vec3 d) {
	if (abs(d.x)>0.00001 || abs(d.y)>0.00001) {
		return vec3(d.y,-d.x,0.0);
	} else  {
		return vec3(0.0,d.z,-d.y);
	}
}

vec2 cx=
vec2(
	floor(mod(float(subframe)*1.0,10.)),
	floor(mod(float(subframe)*0.1,10.))
	)/10.0;



vec3 getSampleBiased(vec3  dir, float power) {
	dir = normalize(dir);
	// create orthogonal vector
	vec3 o1 = normalize(ortho(dir));
	vec3 o2 = normalize(cross(dir, o1));
	
	// Convert to spherical coords aligned to dir;
	vec2 r = rand2(viewCoord*(float(subframe)+1.0));
	if (Stratify) {r*=0.1; r+= cx;}
	r.x=r.x*2.*PI;
	
	// This is  cosine^n weighted.
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
	
	if (Stratify) {r*=0.1; r+= cx;}
	r.x=r.x*2.*PI;
	//	r.y=1.0-r.y*extent;
	
	float oneminus = sqrt(1.0-r.y*r.y);
	return cos(r.x)*oneminus*o1+sin(r.x)*oneminus*o2+r.y*dir;
}


vec3 equirectangularMap(sampler2D sampler, vec3 dir) {
	// Convert (normalized) dir to spherical coordinates.
	dir = normalize(dir);
	vec2 longlat = vec2(atan(dir.y,dir.x)+RotateMap,acos(dir.z));
	// Normalize, and lookup in equirectangular map.
	return texture2D(sampler,longlat/vec2(2.0*PI,PI)).xyz;
}

vec3 getBackground(vec3 dir) {
	return WhiteBackground ? vec3(1.0) : equirectangularMap(EnvironmentMap,dir);
}


vec3 cycle(vec3 c, float s) {
	return vec3(0.5)+0.5*vec3(cos(s*Cycles+c.x),cos(s*Cycles+c.y),cos(s*Cycles+c.z));
}

vec3 getColor() {
	orbitTrap.w = sqrt(orbitTrap.w);
	
	vec3 orbitColor;
	if (CycleColors) {
		orbitColor = cycle(X.xyz,orbitTrap.x)*X.w*orbitTrap.x +
		cycle(Y.xyz,orbitTrap.y)*Y.w*orbitTrap.y +
		cycle(Z.xyz,orbitTrap.z)*Z.w*orbitTrap.z +
		cycle(R.xyz,orbitTrap.w)*R.w*orbitTrap.w;
	} else {
		orbitColor = X.xyz*X.w*orbitTrap.x +
		Y.xyz*Y.w*orbitTrap.y +
		Z.xyz*Z.w*orbitTrap.z +
		R.xyz*R.w*orbitTrap.w;
	}
	
	vec3 color = mix(BaseColor, 3.0*orbitColor,  OrbitStrength);
	return color;
}

float rand() {
	return rand(viewCoord*(float(subframe)+1.0));
}

uniform bool BiasedSampling; checkbox[true]

vec3 color(vec3 from, vec3 dir)
{
	vec3 hit = vec3(0.0);
	vec3 hitNormal = vec3(0.0);
	
	vec3 color = vec3(1.0);
	
	for( int i=0; i <RayDepth; i++ )
	{
		if (trace(from,dir,hit,hitNormal)) {
			// We hit something
			
			if (rand() > reflectivity ) {
				#ifdef providesColor
				color *= baseColor(hit, hitNormal);
				#else
				color *= getColor();
				#endif
				
				color *= (1.0-reflectivity);
				if  (!BiasedSampling) {
					// Unbiased sampling:
					// PDF = 1/(2*PI), BRDF = Albedo/PI
					dir =getSample( hitNormal,1.0);
					// modulate color with: BRDF*CosAngle/PDF
					color *= 2.0*Albedo*max(0.0,dot(dir,hitNormal));
				}
				else  {
					// Biased sampling (cosine weighted):
					// PDF = CosAngle / PI, BRDF = Albedo/PI
					dir =getSampleBiased( hitNormal, 1.0 );
					
					// modulate color	 with: BRDF*CosAngle/PDF
					color *= Albedo;
				}
			}
			else {
				color *=reflectivity;
				dir=reflect(dir,hitNormal);
				color *= max(0.0, dot(dir, hitNormal));
			}
			
			// Choose new starting point for ray
			from =  hit + dir*minDist*3.0;
		} else {
			if (debugLast && i!=RayDepth-1) {
				return vec3(0.0);
			}
			return color * getBackground( dir );
		}
	}
	return vec3(0.0);
}


