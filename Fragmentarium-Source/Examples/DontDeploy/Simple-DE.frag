#info Default Raytracer (by Syntopia)
#camera 3D

// Camera position and target.
varying vec3 from,to;

// Distance to object at which raymarching stops.
uniform float LogMinDist;slider[-7,-3.7,0];

float minDist = pow(10.0,LogMinDist);
float maxDist = 4.0;

// AO based on the number of raymarching steps
uniform float AmbientOcclusion; slider[0,0.7,1]

// Glow based on the number of raymarching steps
uniform float Glow; slider[0,0.1,1]

// Maximum number of  raymarching steps.
uniform int MaxRaySteps;  slider[0,28,1000]

uniform vec3 backgroundColor; color[0.1,0.1,0.1];

// The object color
uniform vec3 surfaceColor; color[0.3,0.4,0.9];

// Ambient Occlusion color
uniform vec3 aoColor; color[0.0,0.0,0.0];

// Glow color
uniform vec3 glowColor; color[0.0,1.0,0.0];

float DE(vec3 pos) ; // Must be implemented in other file
void init(); // forward declare

void main() {
	init();
	vec3 direction = normalize(to-from);
	
	float totalD = 0.0, D = 3.4e38, extraD = 0.0, lastD;
	float dist = 0.0;
	float totalDist = 0.0;

	int steps;
	for (steps=0; steps<MaxRaySteps; steps++) {
		dist = DE(from + totalDist * direction);
		if (dist < minDist || dist > maxDist) break;
		totalDist += dist;
	}
	
	vec3 color = backgroundColor;
	
	if (dist < maxDist) {
		color = surfaceColor;
		float ao = 1.0- AmbientOcclusion* (float(steps)/float(MaxRaySteps));
		color = mix(aoColor, color,ao);
	}
      
      float glow =  (float(steps)/float(MaxRaySteps));
	color = color + Glow*glowColor*glow;
	
	gl_FragColor = vec4(color, 1);
}
