#donotrun
#include "3D.frag"
#include "Sunsky.frag"
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

#define PI  3.14159265358979323846264

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

uniform float Reflectivity; slider[0,0.2,1.0]
uniform bool DebugLast; checkbox[false]
uniform bool Stratify; checkbox[false]
uniform int RayDepth; slider[0,2,5] Locked
uniform float Albedo; slider[0,1,1]

vec3 ortho(vec3 v) {
	//  See : http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
	return abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)  : vec3(0.0, -v.z, v.y);
}

vec2 cx=
vec2(
	floor(mod(float(subframe)*1.0,10.)),
	floor(mod(float(subframe)*0.1,10.))
	)/10.0;

vec2 seed = viewCoord*(float(subframe)+1.0);

vec2 rand2n() {
	seed+=vec2(-1,1);
	return rand2(seed);
};


vec3 getSampleBiased(vec3  dir, float power) {
	dir = normalize(dir);
	// create orthogonal vector
	vec3 o1 = normalize(ortho(dir));
	vec3 o2 = normalize(cross(dir, o1));
	
	// Convert to spherical coords aligned to dir;
	vec2 r = rand2n();
 
	if (Stratify) { r*=0.1; r+= cx;  cx = mod(cx + vec2(0.1,0.9),1.0);}
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

vec3 getConeSample(vec3 dir, float extent) {
	// Create orthogonal vector (fails for z,y = 0)
	dir = normalize(dir);
	vec3 o1 = normalize(ortho(dir));
	vec3 o2 = normalize(cross(dir, o1));
	
	// Convert to spherical coords aligned to dir
	vec2 r =  rand2n();
	
	if (Stratify) {r*=0.1; r+= cx;}
	r.x=r.x*2.*PI;
	r.y=1.0-r.y*extent;
	
	float oneminus = sqrt(1.0-r.y*r.y);
	return cos(r.x)*oneminus*o1+sin(r.x)*oneminus*o2+r.y*dir;
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
uniform bool DirectLight; checkbox[true]

vec3 color(vec3 from, vec3 dir)
{
	vec3 hit = vec3(0.0);
	vec3 hitNormal = vec3(0.0);
	
	vec3 color = vec3(1.0);
	vec3 direct = vec3(0.0);
	for( int i=0; i <RayDepth; i++ )
	{
		if (trace(from,dir,hit,hitNormal)) {
			// We hit something
			if (rand() > Reflectivity ) {
				#ifdef providesColor
				color *= baseColor(hit, hitNormal);
				#else
				color *= getColor();
				#endif
				
				//color *= (1.0-Reflectivity);
				if  (!BiasedSampling) {
					// Unbiased sampling:
					// PDF = 1/(2*PI), BRDF = Albedo/PI
					dir =getConeSample( hitNormal,1.0);
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
				
				// Direct
				if (DirectLight) {
					vec3 a;
					vec3 b;
					vec3 sunSampleDir = getConeSample(sunDirection, 1.0-sunAngularDiameterCos);
					float sunLight = dot(hitNormal, sunSampleDir);
					if (sunLight>0.0 && !trace(hit+ hitNormal*3.0*minDist,sunSampleDir,a,b)) {
						direct += color*sun(sunSampleDir)*sunLight *1E-5;
					}
				}
				
			}
			else {
				//color *=Reflectivity;
				dir=reflect(dir,hitNormal);
				color *= max(0.0, dot(dir, hitNormal));
			}
			
			// Choose new starting point for ray
			from =  hit + hitNormal*minDist*8.0;
		} else {
			if (DebugLast && i!=RayDepth-1) {
				return vec3(0.0);
			}
			if (!DirectLight) return color * sunsky(dir);
			return direct + color * (i>0 ? sky(dir) : sunsky(dir));
		}
	}
	return direct;
}


