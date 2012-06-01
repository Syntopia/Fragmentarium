#donotrun
#info Soft Raytracer - Change render mode to Continuous!
#include "3D.frag"

#group Raytracer

// Distance to object at which raymarching stops.
uniform float Detail;slider[-7,-2.3,0];
// The step size when sampling AO (set to 0 for old AO)
uniform float DetailAO;slider[-7,-0.5,0];

const float ClarityPower = 1.0;

// Lower this if the system is missing details
uniform float FudgeFactor;slider[0,1,1];

float minDist = pow(10.0,Detail);
float aoEps = pow(10.0,DetailAO);
float MaxDistance = 100.0;

// Maximum number of  raymarching steps.
uniform int MaxRaySteps;  slider[0,56,2000]

// Use this to boost Ambient Occlusion and Glow
//uniform float  MaxRayStepsDiv;  slider[0,1.8,10]

// Used to speed up and improve calculation
uniform float BoundingSphere;slider[0,12,100];

// Can be used to remove banding
uniform float Dither;slider[0,0.5,1];

// Used to prevent normals from being evaluated inside objects.
uniform float NormalBackStep; slider[0,1,10] Locked

#group Light

// AO based on the number of raymarching steps
uniform vec4 AO; color[0,0.7,1,0.0,0.0,0.0];

// The specular intensity of the directional light
uniform float Specular; slider[0,4.0,10.0];
// The specular exponent
uniform float SpecularExp; slider[0,16.0,100.0];
// Color and strength of the directional light
uniform vec4 SpotLight; color[0.0,0.4,10.0,1.0,1.0,1.0];
// Direction to the spot light (spherical coordinates)
uniform vec3 SpotLightPos;  slider[(-10,-10,-10),(5,0,0),(10,10,10)]
uniform float SpotLightSize; slider[0.0,0.1,2.3]
// Light coming from the camera position (diffuse lightning)
uniform vec4 CamLight; color[0,1,2,1.0,1.0,1.0];
// Controls the minimum ambient light, regardless of directionality
uniform float CamLightMin; slider[0.0,0.0,1.0]
// Glow based on distance from fractal
uniform vec4 Glow; color[0,0.0,1,1.0,1.0,1.0];
//uniform vec4 InnerGlow; color[0,0.0,1,1.0,1.0,1.0];
uniform int GlowMax; slider[0,20,1000]
// Adds fog based on distance
uniform float Fog; slider[0,0.0,2]
// Shadowstrength
uniform float Shadow; slider[0,0,1] Locked
uniform vec2 Sun; slider[(-3.1415,-1.57),(0,0),(3.1415,1.57)]
uniform float SunSize; slider[0,0.01,0.4]


uniform float Reflection; slider[0,0,1] Locked

vec4 orbitTrap = vec4(10000.0);
float fractionalCount = 0.0;

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

// Background color
uniform vec3 BackgroundColor; color[0.6,0.6,0.45]
// Vignette background
uniform float GradientBackground; slider[0.0,0.3,5.0]

float DE(vec3 pos) ; // Must be implemented in other file

uniform bool CycleColors; checkbox[false]
uniform float Cycles; slider[0.1,1.1,32.3]

#ifdef providesNormal
vec3 normal(vec3 pos, float normalDistance);

#else
vec3 normal(vec3 pos, float normalDistance) {
	normalDistance = max(normalDistance*0.5, 1.0e-7);
	vec3 e = vec3(0.0,normalDistance,0.0);
	vec3 n = vec3(DE(pos+e.yxx)-DE(pos-e.yxx),
		DE(pos+e.xyx)-DE(pos-e.xyx),
		DE(pos+e.xxy)-DE(pos-e.xxy));
	n =  normalize(n);
	return n;
}
#endif

#group Floor

uniform bool EnableFloor; checkbox[false] Locked
uniform vec3 FloorNormal; slider[(-1,-1,-1),(0,0,0),(1,1,1)]
uniform float FloorHeight; slider[-5,0,5]
uniform vec3 FloorColor; color[1,1,1]

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

vec3 rand3(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return
	vec3(fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453),
		fract(cos(dot(co.xy ,vec2(4.898,7.23))) * 23421.631),
		fract(sin(dot(co.xy ,vec2(0.23,1.111))) *392820.023));
}


float rand1(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float shadow(vec3 pos, float eps) {
	vec3 sunDir = fromPhiTheta(Sun);
	
	// create orthogonal vector (fails for z,y = 0)
	vec3 o1 = normalize( vec3(0., -sunDir.z, sunDir.y));
	vec3 o2 = normalize(cross(sunDir, o1));
	
	// Convert to spherical coords aliigned to sunDir;
	vec2 r = rand2(viewCoord*(float(backbufferCounter)+1.0));
	r.x=r.x*2.*PI;
	r.y= 1.0-r.y*SunSize;
	float oneminus = sqrt(1.0-r.y*r.y);
	vec3 sdir = cos(r.x)*oneminus*o1+sin(r.x)*oneminus*o2+r.y*sunDir;
	
	float totalDist = 3.*eps;
	for (int steps=0; steps<MaxRaySteps && totalDist<MaxDistance; steps++) {
		vec3 p = pos + totalDist * sdir;
		float dist = DE(p);
		if (dist < eps)  return 0.0;
		totalDist += dist;
	}
	return 1.0;
}

float getAO(vec3 from, vec3 normal) {
	float totalDist = 0.0; //ShadowBackstep*minDist;
	vec3 direction = rand3(123.3*viewCoord.xy*(1.0+float(backbufferCounter)))-vec3(0.5);
	float maxDist =  pow(10.0,DetailAO/10.0);
	if (dot(direction, normal)<0.0) direction*=-1.0;
	direction = normalize(direction);
	
	float dist = 0.0;
	for (int steps=0; steps<MaxRaySteps; steps++) {
		vec3 p = from + totalDist * direction;
		dist = DE(p);
		totalDist += dist;
		if (dist < minDist) {
			return 1.0-totalDist/maxDist;
		}
		if (totalDist >maxDist) {			
			return 0.0;			
		}
	}
	return 1.0;
}

vec3 lighting(vec3 n, vec3 color, vec3 pos, vec3 dir, float eps, out float shadowStrength) {
	shadowStrength = 0.0;
	vec3 spotPos = SpotLightPos;
	vec3 spotDir =normalize(spotPos-pos);
	// Calculate perfectly reflected light
	
	//if (dot(dir,n)>0.0) n = -n;
	
	vec3 r = spotDir - 2.0 * dot(n, spotDir) * n;
	
	float s = max(0.0,dot(dir,r));
	
	//s= 1.0-abs(dot(dir,n));
	float diffuse = max(0.0,dot(n,spotDir))*SpotLight.w;
	float ambient = max(CamLightMin,dot(-n, dir))*CamLight.w;
	float specular = (SpecularExp<=0.0) ? 0.0 : pow(s,SpecularExp)*Specular*10.0;
	
	if (Shadow>0.0) {
		// check path from pos to spotDir
		shadowStrength = 1.0-shadow(pos+n*eps,eps);
		ambient = mix(ambient,0.0,Shadow*shadowStrength);
		diffuse = mix(diffuse,vec3(0.0),Shadow*shadowStrength);
		specular = mix(specular,vec3(0.0),Shadow*shadowStrength);
	}
	
	return (SpotLight.xyz*diffuse+CamLight.xyz*ambient)*color+specular*SpotLight.xyz;
	//return (SpotLight.xyz*diffuse+CamLight.xyz*ambient+ specular*SpotLight.xyz)*color;
}

vec3 colorBase = vec3(0.0,0.0,0.0);

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
	color = max(color,0.0);
	return color;
}



#ifdef  providesColor
vec3 baseColor(vec3 point, vec3 normal);
#endif



vec3 trace(vec3 from, vec3 dir, inout vec3 hit, inout vec3 hitNormal) {
	hit = vec3(0.0);
	orbitTrap = vec4(10000.0);
	vec3 direction = normalize(dir);
	
	float dist = 0.0;
	float totalDist = 0.0;
	
	int steps;
	colorBase = vec3(0.0,0.0,0.0);
	
	// Check for bounding sphere
	float dotFF = dot(from,from);
	float d = 0.0;
	float dotDE = dot(direction,from);
	float sq =  dotDE*dotDE- dotFF + BoundingSphere*BoundingSphere;
	
	if (sq>0.0) {
		d = -dotDE - sqrt(sq);
		if (d<0.0) {
			// "minimum d" solution wrong direction
			d = -dotDE + sqrt(sq);
			if (d<0.0) {
				// both solution wrong direction
				sq = -1.0;
			} else {
				// inside sphere
				d = 0.0;
			}
		}
	}
	
	// We will adjust the minimum distance based on the current zoom
	float eps = minDist; // *zoom;//*( length(zoom)/0.01 );
	float epsModified = 0.0;
	
	if (sq<0.0) {
		// outside bounding sphere - and will never hit
		dist = MaxDistance;
		totalDist = MaxDistance;
		steps = 2;
	}  else {
		totalDist += d; // advance ray to bounding sphere intersection
		for (steps=0; steps<MaxRaySteps; steps++) {
			orbitTrap = vec4(10000.0);
			vec3 p = from + totalDist * direction;
			dist = DE(p);
			//dist = clamp(dist, 0.0, MaxDistance)*FudgeFactor;
			dist *= FudgeFactor;
			if (steps == 0) dist*=(Dither*rand1(direction.xy*float(backbufferCounter+1)))+(1.0-Dither);
			
			
			totalDist += dist;
			epsModified = pow(totalDist,ClarityPower)*eps;
			if (dist < epsModified) break;
			if (totalDist > MaxDistance) break;
		}
	}
	
	vec3 hitColor;
	float stepFactor = clamp((float(steps))/float(GlowMax),0.0,1.0);
	vec3 backColor = BackgroundColor;
	if (GradientBackground>0.0) {
		float t = length(coord);
		backColor = mix(backColor, vec3(0.0,0.0,0.0), t*GradientBackground);
	}
	
	if (  steps==MaxRaySteps) orbitTrap = vec4(0.0);
	
	if ( dist < epsModified) {
		// We hit something, or reached MaxRaySteps
		hit = from + totalDist * direction;
		
		hitNormal= normal(hit-NormalBackStep*epsModified*direction, epsModified); // /*normalE*epsModified/eps*/
		float ao = AO.w*stepFactor ;
		if (DetailAO<0.0) {
			ao = AO.w* getAO(hit-NormalBackStep*epsModified*direction, hitNormal);
		}
		
		#ifdef  providesColor
		hitColor = mix(BaseColor,  baseColor(hit,hitNormal),  OrbitStrength);
		#else
		hitColor = getColor();
		#endif
		
		
		float shadowStrength = 0.0;
		hitColor = lighting(hitNormal, hitColor,  hit-NormalBackStep*epsModified*direction,  direction,epsModified,shadowStrength);
		
		hitColor = mix(hitColor, AO.xyz ,ao);
		// OpenGL  GL_EXP2 like fog
		float f = totalDist;
		hitColor = mix(hitColor, backColor, 1.0-exp(-pow(Fog,4.0)*f*f));
	}
	else {
		hitColor = backColor;
		hitColor +=Glow.xyz*stepFactor* Glow.w;
		
	}
	
	
	return hitColor;
}


vec3 color(vec3 from, vec3 dir) {
	vec3 hit = vec3(0.0);
	vec3 hitNormal = vec3(0.0);
	return  trace(from,dir,hit,hitNormal);
}
