#info Default Raytracer (by Syntopia)
#camera 3D
#group Raytracer

// Camera position and target.
varying vec3 from,to;
varying vec3 fromDx,toDx;
varying vec3 fromDy,toDy;

// Anti-alias [1=1 samples / pixel, 2 = 4 samples, ...]
uniform int AntiAlias;slider[1,1,5];
uniform float AntiAliasScale;slider[0.0,1,5];

// Distance to object at which raymarching stops.
uniform float LogMinDist;slider[-7,-2.6,0];

// Distance at which normal is evaluated
uniform float LogNormalDist;slider[-7,-4.0,0];

uniform float MaxDist;slider[0,6,20];

uniform float MoveBack;slider[-10,0,10];
uniform float Limiter;slider[0,1,1];

float minDist = pow(10.0,LogMinDist);
float normalE = pow(10.0,LogNormalDist);


// Maximum number of  raymarching steps.
uniform int MaxRaySteps;  slider[0,28,200]

// Use this to boost Ambient Occlusion and Glow
uniform float  MaxRayStepsDiv;  slider[1,1,10]

#group Light

// AO based on the number of raymarching steps
uniform float AO; slider[0,1,1]
// Ambient Occlusion color
uniform vec3 AOColor; color[0.0,0.0,0.0];

// The object color
uniform float SpotLight; slider[0,1.0,1.0];
uniform float Specular; slider[0,1.0,4.0];
uniform float SpecularExp; slider[0,5.0,100.0];
uniform vec3 SpotLightColor; color[0.3,0.4,1];
uniform vec3 SpotLightDir;  slider[(-10,-10,-10),(1,1,1),(10,10,10)]

uniform float CamLight; slider[0,1,1];
uniform vec3 CamLightColor; color[1.0,1.0,1.0];

// Glow based on the number of raymarching steps
uniform float Glow; slider[0,0.0,1]
// Glow color
uniform vec3 GlowColor; color[0.3,1.0,0.4];

uniform vec3 BackgroundColor; color[0.0,0.0,0.0]

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

vec3 trace(vec3 from, vec3 to) {
	
	vec3 direction = normalize(to-from);
       from -= direction*MoveBack;
	
	float dist = 0.0;
	float totalDist = 0.0;
	
	int steps;
	for (steps=0; steps<MaxRaySteps; steps++) {
		dist = DE(from + totalDist * direction)*Limiter;
             if (dist>MaxDist*Limiter) dist = MaxDist*Limiter;
		if (dist < minDist ||  totalDist >MaxDist) break;           
		totalDist += dist;
	}
	
	// Backtrack to improve the gradient based normal estimatation:
	// otherwise,
	totalDist-=2.0*(minDist-dist);
	
	vec3 color = BackgroundColor;
	
	float stepFactor =clamp(MaxRayStepsDiv*float(steps)/float(MaxRaySteps),0.0,1.0);
	if (dist < MaxDist) {
		vec3 hit = from + totalDist * direction;
		color = coloring(hit,  direction, steps);
		float ao = 1.0- AO*stepFactor ;
		color = mix(AOColor, color,ao);
	}
	
	color += Glow*GlowColor*stepFactor;
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
