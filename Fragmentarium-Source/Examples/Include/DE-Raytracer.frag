#info Default Raytracer (by Syntopia)
#camera 3D

#group C

#vertex

mat3  rotationMatrix3(vec3 v, float angle)
{
	float c = cos(radians(angle));
	float s = sin(radians(angle));
	
	return mat3(c + (1.0 - c) * v.x * v.x, (1.0 - c) * v.x * v.y - s * v.z, (1.0 - c) * v.x * v.z + s * v.y,
		(1.0 - c) * v.x * v.y + s * v.z, c + (1.0 - c) * v.y * v.y, (1.0 - c) * v.y * v.z - s * v.x,
		(1.0 - c) * v.x * v.z - s * v.y, (1.0 - c) * v.y * v.z + s * v.x, c + (1.0 - c) * v.z * v.z
		);
}


// Use this to adjust clipping planes
uniform float FOV; slider[0,1,1.2];
uniform vec3 Eye; slider[(-50,-50,-50),(0,0,-10),(50,50,50)];
uniform vec3 Target; slider[(-50,-50,-50),(0,0,0),(50,50,50)];
uniform vec3 CameraRot; slider[(-180,-180,-180),(0,0,0),(180,180,180)];

varying vec3 dirDx;
varying vec3 dirDy;
varying vec3 from;
varying vec3 to;
uniform vec2 pixelSize;
varying vec2 coord;
varying float zoom;
varying vec3 dir;
void main(void)
{
	gl_Position =  gl_Vertex;
	coord = (gl_ProjectionMatrix*gl_Vertex).xy;
	vec2 ps = pixelSize*mat2(gl_ProjectionMatrix);
	zoom = length(ps);
	from = Eye;
 	vec3 Dir = normalize(Target-Eye);
	vec3 Up =normalize(cross(Dir, vec3(0.0,1.0,0.0)));
	vec3 Right = normalize( cross(Dir,Up));
	 mat3 r =rotationMatrix3(Dir, CameraRot.z)* rotationMatrix3(Up, CameraRot.y)* rotationMatrix3(Right, CameraRot.x);

	dir = (coord.x*Right + coord.y*Up )*FOV+Dir;
dir= dir*r;
	dirDy = ps.y*Up*FOV;
	dirDx = ps.x*Right*FOV;
};
#endvertex

#group Raytracer

// Camera position and target.
varying vec3 from,dir,dirDx,dirDy;
varying vec2 coord;
varying float zoom;

// Anti-alias [1=1 samples / pixel, 2 = 4 samples, ...]
uniform int AntiAlias;slider[1,1,5];
// Smoothens the image (when AA is enabled)
uniform float AntiAliasBlur;slider[0.0,1,5];

// Distance to object at which raymarching stops.
uniform float Detail;slider[-7,-2.3,0];

uniform float DetailNormal;slider[-7,-2.8,0];
uniform float BackStepNormal;slider[0,1,2];

// The power of the clarity function
uniform float ClarityPower;slider[0,1,5];

// The maximum distance rays are traced
uniform float MaxDist;slider[0,600,2000];

// Use this to adjust clipping planes
//uniform float Clipping;slider[-50,0,50];

// Lower this if the system is missing details
uniform float FudgeFactor;slider[0,1,1];

float minDist = pow(10.0,Detail);
float normalE = pow(10.0,DetailNormal);

// Maximum number of  raymarching steps.
uniform int MaxRaySteps;  slider[0,56,6000]

// Use this to boost Ambient Occlusion and Glow
uniform float  MaxRayStepsDiv;  slider[0,1.8,10]

// If your experience AO banding try adjusting this term
uniform float BandingSmooth;slider[0,0,4];

#group Light

// AO based on the number of raymarching steps
uniform float AO; slider[0,0.7,1]
// Ambient Occlusion color
uniform vec3 AOColor; color[0.0,0.0,0.0];

// The intensity of the directional ligt
uniform float SpotLight; slider[0,0.4,1.0];
// The specular intensity of the directional light
uniform float Specular; slider[0,4.0,10.0];
// The specular exponent
uniform float SpecularExp; slider[0,16.0,100.0];
// Color of the directional light
uniform vec3 SpotLightColor; color[1.0,1.0,1.0];
// Direction to the spot light (spherical coordinates)
uniform vec2 SpotLightDir;  slider[(-1,-1),(0.1,0.1),(1,1)]
// Light coming from the camera position (diffuse lightning)
uniform float CamLight; slider[0,1,1];
// Color of the diffuse lightning
uniform vec3 CamLightColor; color[1.0,1.0,1.0];

// Glow based on the number of raymarching steps
uniform float Glow; slider[0,0.2,1]
// Glow color
uniform vec3 GlowColor; color[1.0,1.0,1.0];
// Background color
uniform vec3 BackgroundColor; color[0.6,0.6,0.45]
// A 'looney tunes' gradient background
uniform float GradientBackground; slider[0.0,0.3,5.0]

vec4 orbitTrap = vec4(10000.0);
float fractionalCount = 0.0;

#group Coloring

// This is the pure color of object (in white light)
uniform vec3 BaseColor; color[1.0,1.0,1.0];
// Determines the mix between pure light coloring and pure orbit trap coloring
uniform float OrbitStrength; slider[0,0.8,1]
// Closest distance to YZ-plane during orbit
uniform float XStrength; slider[-1,0.7,1]
// Closest distance to YZ-plane during orbit
uniform vec3 X; color[0.5,0.6,0.6];
// Closest distance to XZ-plane during orbit
uniform float YStrength; slider[-1,0.4,1]
// Closest distance to XZ-plane during orbit
uniform vec3 Y; color[1.0,0.6,0.0];
// Closest distance to XY-plane during orbit
uniform float ZStrength; slider[-1,0.5,1]
// Closest distance to XY-plane during orbit
uniform vec3 Z; color[0.8,0.78,1.0];
// Closest distance to origin during orbit
uniform float RStrength; slider[-1,0.12,1]
// Closest distance to  origin during orbit
uniform vec3 R; color[0.4,0.7,1.0];

float DE(vec3 pos) ; // Must be implemented in other file

vec3 lighting(float normalDistance, vec3 color, vec3 pos, vec3 dir, int steps) {
	vec3 e = vec3(0.0,normalDistance,0.0);
	vec3 spotDir =-normalize(dirDx)*tan(SpotLightDir.x*0.5*3.14)+
	normalize(dirDy)*tan(SpotLightDir.y*0.5*3.14) + dir;
	spotDir = normalize(spotDir);
	
	vec3 n;
	if (steps < 1) {
		n = -dir; // for clipping normals
	} else {
		n = vec3(DE(pos-e.yxx)-DE(pos+e.yxx),
			DE(pos-e.xyx)-DE(pos+e.xyx),
			DE(pos-e.xxy)-DE(pos+e.xxy));
		//    if (dot(n, dir)<0)return vec3(1.0,0.0,0.0);
	}
	n =  normalize(n);
	
	// Calculate perfectly reflected light:
	// NB: there is a reflect command in GLSL
	vec3 r = spotDir - 2.0 * dot(n, spotDir) * n;
	float s = max(0.0,dot(dir,-r));
	
	float diffuse = max(0.0,dot(n,spotDir))*SpotLight;
	float ambient = max(0.0,dot(n, dir))*CamLight;
	float specular = pow(s,SpecularExp)*Specular;
	
	return (SpotLightColor*diffuse+CamLightColor*ambient
		+ specular*SpotLightColor)*color;
	
}

vec3 colorBase = vec3(0.0,0.0,0.0);

vec3 getColor(float ao) {
	orbitTrap.w = sqrt(orbitTrap.w);
	vec3 orbitColor =X*XStrength*orbitTrap.x +
	Y*YStrength*orbitTrap.y +
	Z*ZStrength*orbitTrap.z +
	R*RStrength*orbitTrap.w;
	//orbitColor /= (orbitTrap.x + orbitTrap.y + orbitTrap.z + orbitTrap.w);
	vec3 color = mix(BaseColor, 3.0*orbitColor,  OrbitStrength);
	color = mix(AOColor, color,ao);
	return color;
}




vec3 trace(vec3 from, vec3 dir) {
	
	orbitTrap = vec4(10000.0);
	vec3 direction = normalize(dir);
	//from -= direction*Clipping;
	
	float dist = 0.0;
	float totalDist = 0.0;
	
	int steps;
	colorBase = vec3(0.0,0.0,0.0);
	
	// We will adjust the minimum distance based on the current zoom
	float eps = minDist*( length(zoom)/0.01 );
	float epsModified = 0.0;
	for (steps=0; steps<MaxRaySteps; steps++) {
		orbitTrap = vec4(10000.0);
		dist = DE(from + totalDist * direction)*FudgeFactor;
		dist = clamp(dist, 0.0, MaxDist);
		totalDist += dist;
		epsModified = pow(totalDist,ClarityPower)*eps;
		if (dist < epsModified ||  totalDist >MaxDist) break;
	}
	
	// Backtrack to improve the gradient based normal estimatation:
	// otherwise,
	//totalDist-=(minDist-dist); // TODO: is this necessary?
	
	vec3 color;
	float smoothenedSteps = float(steps)+BandingSmooth*dist/epsModified;
	float stepFactor = clamp((MaxRayStepsDiv*smoothenedSteps)/float(MaxRaySteps),0.0,1.0);
	if ( dist < epsModified) {
		// We hit something, or reached MaxRaySteps
		vec3 hit = from + (totalDist-BackStepNormal*epsModified*0.5) * direction;
		float ao = 1.0- AO*stepFactor ;
		color = getColor(ao);
		color = lighting(normalE*epsModified/eps, color,  hit,  direction, steps);
}  else if (steps==MaxRaySteps) {
		// Close to something, but too many steps
		color = vec3(0.0,0.0,0.0);
	} else {
		color = BackgroundColor;
		if (GradientBackground>0.0) {
			//float t = dot(direction, vec3(1.0,0.0,0.0));
			float t = length(coord);
			
			color = mix(color, vec3(0.0,0.0,0.0), t*GradientBackground);
		}
		color += Glow*GlowColor*stepFactor;
	}
	
	//color = clamp(color, 0.0, 1.0);
	
	return color;
}

void init(); // forward declare

void main() {
	init();
	
	vec3 color = vec3(0,0,0);
	for (int x = 1; x<=AntiAlias; x++) {
		float  dx =  AntiAliasBlur*(float(x)-1.0)/float(AntiAlias);
		for (int y = 1; y<=AntiAlias; y++) {
			float dy = AntiAliasBlur*(float(y)-1.0)/float(AntiAlias);
			color += trace(from,dir+dirDx*dx+dirDy*dy);
		}
	}
	
	color = clamp(color/float(AntiAlias*AntiAlias), 0.0, 1.0);
	gl_FragColor = vec4(color, 1.0);
}
