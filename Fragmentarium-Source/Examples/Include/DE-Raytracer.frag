#info Default Raytracer (by Syntopia)
#camera 3D
#group Raytracer

// Camera position and target.
varying vec3 from,to;
varying vec3 fromDx,toDx;
varying vec3 fromDy,toDy;

// Anti-alias [1=1 samples / pixel, 2 = 4 samples, ...]
uniform int AntiAlias;slider[1,1,5];
// Smoothens the image (when AA is enabled)
uniform float AntiAliasScale;slider[0.0,1,5];

// Distance to object at which raymarching stops.
uniform float LogMinDist;slider[-7,-3.0,0];

// Distance at which normal is evaluated
uniform float LogNormalDist;slider[-7,-4.0,0];

uniform float ClarityPower;slider[0,1,5];

// The maximum distance rays are traced
uniform float MaxDist;slider[0,6,20];

// Use this to adjust clipping planes
uniform float MoveBack;slider[-10,0,10];

// Lower this if the system is missing details
uniform float Limiter;slider[0,1,1];

float minDist = pow(10.0,LogMinDist);
float normalE = pow(10.0,LogNormalDist);


// Maximum number of  raymarching steps.
uniform int MaxRaySteps;  slider[0,56,300]

// Use this to boost Ambient Occlusion and Glow
uniform float  MaxRayStepsDiv;  slider[1,1.8,10]

#group Light

// AO based on the number of raymarching steps
uniform float AO; slider[0,0.7,1]
// Ambient Occlusion color
uniform vec3 AOColor; color[0.0,0.0,0.0];

// The intensity of the directional ligt
uniform float SpotLight; slider[0,1.0,1.0];
// The specular intensity of the directional light
uniform float Specular; slider[0,0.3,4.0];
// The specular exponent
uniform float SpecularExp; slider[0,30.0,100.0];
// Color of the directional light
uniform vec3 SpotLightColor; color[0.67,0.67,0.67];
// Direction to the spot light
uniform vec3 SpotLightDir;  slider[(-10,-10,-10),(1,1,1),(10,10,10)]
// Light coming from the camera position (diffuse lightning)
uniform float CamLight; slider[0,1,1];
// Color of the diffuse lightning
uniform vec3 CamLightColor; color[1.0,1.0,1.0];

// Glow based on the number of raymarching steps
uniform float Glow; slider[0,0.0,1]
// Glow color
uniform vec3 GlowColor; color[0.3,1.0,0.4];
// Background color
uniform vec3 BackgroundColor; color[0.6,0.6,0.5]
// A 'looney tunes' gradient background
uniform bool GradientBackground; checkbox[true]

vec4 orbitTrap = vec4(10000.0);

#group Orbit Trap

// Determines the mix between pure light coloring and pure orbit trap coloring
uniform float OrbitStrength; slider[0,0.7,1]
// Closest distance to YZ-plane during orbit
uniform float XStrength; slider[-1,0.3,1]
// Closest distance to YZ-plane during orbit
uniform vec3 X; color[0.5,0.6,0.6];
// Closest distance to XZ-plane during orbit
uniform float YStrength; slider[-1,0.3,1]
// Closest distance to XZ-plane during orbit
uniform vec3 Y; color[1.0,0.9,0.7];
// Closest distance to XY-plane during orbit
uniform float ZStrength; slider[-1,0.3,1]
// Closest distance to XY-plane during orbit
uniform vec3 Z; color[0.8,0.78,1.0];
// Closest distance to origin during orbit
uniform float RStrength; slider[-1,0.2,1]
// Closest distance to  origin during orbit
uniform vec3 R; color[1.0,1.0,1.0];

float DE(vec3 pos) ; // Must be implemented in other file

vec3 coloring(vec3 pos, vec3 dir, int steps) {
	vec3 e = vec3(0,normalE,0);
	vec3 spotDir =normalize( SpotLightDir);
	vec3 n;
	if (steps < 1) {
		n = dir; // for clipping normals
	} else {
		n = vec3(DE(pos-e.yxx)-DE(pos+e.yxx),
			DE(pos-e.xyx)-DE(pos+e.xyx),
			DE(pos-e.xxy)-DE(pos+e.xxy));
	}
	n =  normalize(n);
	
	// Calculate perfectly reflected light:
	// NB: there is a reflect command in GLSL
	vec3 r = spotDir - 2.0 * dot(n, spotDir) * n;
	float s = max(0.0,dot(dir,-r));
	
	float diffuse = max(0.0,dot(n,spotDir))*SpotLight;
	float ambient = max(0.0,dot(n, dir))*CamLight;
	float specular = pow(s,SpecularExp)*Specular;
	
	return SpotLightColor*diffuse+CamLightColor*ambient
	+ specular*SpotLightColor;
	
}
vec3 colorBase = vec3(0.0,0.0,0.0);

vec3 trace(vec3 from, vec3 to) {
 
	orbitTrap = vec4(10000.0);
	vec3 direction = normalize(to-from);
	from -= direction*MoveBack;
	
	float dist = 0.0;
	float totalDist = 0.0;
	
	int steps;
	colorBase = vec3(0.0,0.0,0.0);

	// We will adjust the minimum distance based on the current zoom
	float eps = minDist*( length(fromDx+fromDy)/0.01 );
	for (steps=0; steps<MaxRaySteps; steps++) {
		orbitTrap = vec4(10000.0);
	
		dist = DE(from + totalDist * direction)*Limiter;
		dist = clamp(dist, 0.0, MaxDist);
		if (dist <pow(totalDist,ClarityPower)*eps ||  totalDist >MaxDist) break;
		totalDist += dist;
	}
	
	// Backtrack to improve the gradient based normal estimatation:
	// otherwise,
	totalDist-=1.0*(minDist-dist); // TODO: is this necessary?
	
	vec3 color = BackgroundColor;
	 if (GradientBackground) {
		float t = dot(direction, vec3(1.0,0.0,0.0));
 		color = mix(color, SpotLightColor, t);
	}
	
	float stepFactor = clamp(MaxRayStepsDiv*float(steps)/float(MaxRaySteps),0.0,1.0);
	if ( totalDist < MaxDist) {
		vec3 hit = from + totalDist * direction;
		color = coloring(hit,  direction, steps);
		float ao = 1.0- AO*stepFactor ;
		if (totalDist< MaxDist) {

			colorBase =X*XStrength*orbitTrap.x +
				Y*YStrength*orbitTrap.y +
				Z*ZStrength*orbitTrap.z +
				R*RStrength*sqrt(orbitTrap.w);
			colorBase /= (orbitTrap.x + orbitTrap.y + orbitTrap.z + sqrt(orbitTrap.w));
			
			color = mix(color, colorBase*3.0,  OrbitStrength);
		}
		color = mix(AOColor, color,ao);
		
	}
	
	
	color += Glow*GlowColor*stepFactor;
       color = clamp(color, 0.0, 1.0);

	return color;
}

void main() {
	vec3 color = vec3(0,0,0);
	for (int x = 1; x<=AntiAlias; x++) {
		float  dx =  AntiAliasScale*(float(x)-1.0)/float(AntiAlias);
		
		for (int y = 1; y<=AntiAlias; y++) {
			float dy = AntiAliasScale*(float(y)-1.0)/float(AntiAlias);
			color += trace(from+fromDx*dx+fromDy*dy,to+toDx*dx+toDy*dy);
		}
	}
	gl_FragColor = vec4(color, 1.0)/float(AntiAlias*AntiAlias);
}
