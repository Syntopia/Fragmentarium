#donotrun

#info Default Raytracer (by Syntopia)
#camera 3D

#vertex

#group Camera

// Field-of-view
uniform float FOV; slider[0,0.4,2.0];
uniform vec3 Eye; slider[(-50,-50,-50),(0,0,-10),(50,50,50)];
uniform vec3 Target; slider[(-50,-50,-50),(0,0,0),(50,50,50)];
uniform vec3 Up; slider[(0,0,0),(0,1,0),(0,0,0)];

varying vec3 dirDx;
varying vec3 dirDy;
varying vec3 from;
uniform vec2 pixelSize;
varying vec2 coord;
varying float zoom;
varying vec3 dir;
void main(void)
{
	gl_Position =  gl_Vertex;
	coord = (gl_ProjectionMatrix*gl_Vertex).xy;
	coord.x*= pixelSize.y/pixelSize.x;
	// we will only use gl_ProjectionMatrix to scale and translate, so the following should be OK.
	vec2 ps =vec2(pixelSize.x*gl_ProjectionMatrix[0][0], pixelSize.y*gl_ProjectionMatrix[1][1]);
	zoom = length(ps);
	from = Eye;
	vec3 Dir = normalize(Target-Eye);
	vec3 up = Up-dot(Dir,Up)*Dir;
	up = normalize(up);
	vec3 Right = normalize( cross(Dir,up));
	dir = (coord.x*Right + coord.y*up )*FOV+Dir;
	dirDy = ps.y*up*FOV;
	dirDx = ps.x*Right*FOV;
}
#endvertex

#group Raytracer

// Camera position and target.
varying vec3 from,dir,dirDx,dirDy;
varying vec2 coord;
varying float zoom;

// HINT: for better results use Tile Renders and resize the image yourself
uniform int AntiAlias;slider[1,1,5];
// Smoothens the image (when AA is enabled)
uniform float AntiAliasBlur;slider[0.0,1,2];
// Distance to object at which raymarching stops.
uniform float Detail;slider[-7,-2.3,0];
// The resolution for normals (used for lighting)
uniform float MaxStep;slider[-7,-0.3,2];
// The resolution for normals (used for lighting)
uniform float DetailNormal;slider[-7,-2.8,0];
// The step size when sampling AO (set to 0 for old AO)
uniform float DetailAO;slider[-7,-0.5,0];
//uniform float BackStepNormal;slider[0,1,2];
const float BackStepNormal = 0.0;

// The power of the clarity function
// uniform float ClarityPower;slider[0,1,5];
const float ClarityPower = 0.0;


// Lower this if the system is missing details
uniform float FudgeFactor;slider[0,1,1];

float minDist = pow(10.0,Detail);
float MaxDist = pow(10.0,MaxStep);
float normalE = pow(10.0,DetailNormal);
float aoEps = pow(10.0,DetailAO);

// Maximum number of  raymarching steps.
uniform int MaxRaySteps;  slider[0,56,13000]

// Use this to boost Ambient Occlusion and Glow
uniform float  MaxRayStepsDiv;  slider[0,1.8,10]

// If your experience AO banding try adjusting this term
// uniform float BandingSmooth;slider[0,0,4];
const float BandingSmooth = 0.0;

// Used to speed up and improve calculation
uniform float BoundingSphere;slider[0,2,100];

// Can be used to remove banding
uniform float Dither;slider[0,0.5,1];

#group Light

// AO based on the number of raymarching steps
uniform vec4 AO; color[0,0.7,1,0.0,0.0,0.0];

// The specular intensity of the directional light
uniform float Specular; slider[0,4.0,10.0];
// The specular exponent
uniform float SpecularExp; slider[0,16.0,100.0];
// Color and strength of the directional light
uniform vec4 SpotLight; color[0.0,0.4,1.0,1.0,1.0,1.0];
// Direction to the spot light (spherical coordinates)
uniform vec2 SpotLightDir;  slider[(-1,-1),(0.1,0.1),(1,1)]
// Light coming from the camera position (diffuse lightning)
uniform vec4 CamLight; color[0,1,2,1.0,1.0,1.0];
// Controls the minimum ambient light, regardless of directionality
uniform float CamLightMin; slider[0.0,0.0,1.0]
// Glow based on the number of raymarching steps
uniform vec4 Glow; color[0,0.0,1,1.0,1.0,1.0];
// Adds fog based on distance
uniform float Fog; slider[0,0.0,2]
// Hard shadows shape is controlled by SpotLightDir
uniform float HardShadow; slider[0,0.0,1]

vec4 orbitTrap = vec4(10000.0);
float fractionalCount = 0.0;

#group Coloring

// This is the pure color of object (in white light)
uniform vec3 BaseColor; color[1.0,1.0,1.0];
// Determines the mix between pure light coloring and pure orbit trap coloring
uniform float OrbitStrength; slider[0,0.8,1]

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

vec3 normal(vec3 pos, float normalDistance, int steps) {
	vec3 e = vec3(0.0,normalDistance,0.0);
	vec3 n;
	n = vec3(DE(pos-e.yxx)-DE(pos+e.yxx),
		DE(pos-e.xyx)-DE(pos+e.xyx),
		DE(pos-e.xxy)-DE(pos+e.xxy));
	//    if (dot(n, dir)<0)return vec3(1.0,0.0,0.0);
	n =  normalize(n);
	return n;
}

vec3 lighting(vec3 n, vec3 color, vec3 pos, vec3 dir, float eps) {
	vec3 spotDir =-normalize(dirDx)*tan(SpotLightDir.x*0.5*3.14)+
	normalize(dirDy)*tan(SpotLightDir.y*0.5*3.14) + dir;
	spotDir = normalize(spotDir);
	
	
	// Calculate perfectly reflected light:
	// NB: there is a reflect command in GLSL
	vec3 r = spotDir - 2.0 * dot(n, spotDir) * n;
	float s = max(0.0,dot(dir,-r));
	
	float diffuse = max(0.0,dot(n,spotDir))*SpotLight.w;
	float ambient = max(CamLightMin,dot(n, dir))*CamLight.w;
	float specular = pow(s,SpecularExp)*Specular;
	
	if (HardShadow>0.0) {
		// check path from pos to spotDir
		vec3 sdir = -spotDir;
		float totalDist = 2.0*eps;
		int maxSteps = 20;
		int steps;
		for (steps=0; steps<maxSteps; steps++) {
			vec3 p = pos + totalDist * sdir;
			float dist = DE(p);
			//dist = clamp(dist, 0.0, MaxDist);
			if (dist<eps && steps==0) eps = dist;
			totalDist += dist;
			if (dist < eps ||  totalDist >MaxDist) break;
		}
		if (steps==maxSteps) totalDist = MaxDist;
		if (totalDist>MaxDist) totalDist = MaxDist;
		float f = 1.0-(totalDist/MaxDist);
		//ambient = mix(ambient,0.0,HardShadow*f);
		specular = mix(specular,0.0,HardShadow*f);
		diffuse = mix(diffuse,0.0,HardShadow*f);
	}
	return (SpotLight.xyz*diffuse+CamLight.xyz*ambient
		+ specular*SpotLight.xyz)*color;
	
}

vec3 colorBase = vec3(0.0,0.0,0.0);

float rand(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 cycle(vec3 c, float s) {
	return vec3(0.5)+0.5*vec3(cos(s*Cycles+c.x),cos(s*Cycles+c.y),cos(s*Cycles+c.z));
}

// Ambient occlusion approximation.
// Sample proximity at a few points in the direction of the normal.
float ambientOcclusion(vec3 p, vec3 n) {
	float ao = 0.0;
	float de = DE(p);
	float wSum = 0.0;
	float w = 1.0;
	for (float i =1.0; i <6.0; i++) {
		// D is the distance estimate difference.
		// If we move 'n' units in the normal direction,
		// we would expect the DE difference to be 'n' larger -
		// unless there is some obstructing geometry in place
		float D = (DE(p- n*i*i*aoEps) -de)/(i*i*aoEps);
		w *= 0.6;
		ao += w*clamp(1.0-D,0.0,1.0);
		wSum += w;
	}
	return clamp(AO.w*ao/wSum, 0.0, 1.0);
}



vec3 getColor(float ao) {
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
	color = mix(color, AO.xyz ,ao);
	return color;
}




vec3 trace(vec3 from, vec3 dir) {
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
	float eps = minDist;//*( length(zoom)/0.01 );
	float epsModified = 0.0;
	if (sq<0.0) {
		// outside bounding sphere - and will never hit
		dist = MaxDist;
		totalDist = MaxDist;
		steps = 2;
	}  else {
		totalDist += d; // advance ray to bounding sphere intersection
		
		for (steps=0; steps<MaxRaySteps; steps++) {
			orbitTrap = vec4(10000.0);
			vec3 p = from + totalDist * direction;
			dist = clamp( DE(p), 0.0, MaxDist)*FudgeFactor;
			if (steps == 0) dist*=(Dither*rand(direction.xy))+(1.0-Dither);
			totalDist += dist;
			epsModified = pow(totalDist,ClarityPower)*eps;
			if (dist < epsModified) break;
		}
	}
	
	vec3 color;
	float smoothenedSteps = float(steps)+BandingSmooth*dist/epsModified;
	float stepFactor = clamp((MaxRayStepsDiv*smoothenedSteps)/float(MaxRaySteps),0.0,1.0);
	
	vec3 backColor = BackgroundColor;
	if (GradientBackground>0.0) {
		//float t = dot(direction, vec3(1.0,0.0,0.0));
		float t = length(coord);
		backColor = mix(backColor, vec3(0.0,0.0,0.0), t*GradientBackground);
		if (sq>0.0) backColor += Glow.xyz*Glow.w*pow(stepFactor,4.0);
	}
	
	if (  steps==MaxRaySteps) orbitTrap = vec4(0.0);
	
	if ( dist < epsModified ||  steps==MaxRaySteps) {
		// We hit something, or reached MaxRaySteps
		vec3 hit = from + (totalDist-BackStepNormal*epsModified*0.5) * direction;
		float ao = AO.w*stepFactor ;
		vec3 n = normal(hit, normalE*epsModified/eps, steps);
		if (DetailAO<0.0) ao = ambientOcclusion(hit, n);
		color = getColor(ao);
		color = lighting(n, color,  hit,  direction,eps);
		// OpenGL  GL_EXP2 like fog
		float f = totalDist;
		color = mix(color, backColor, 1.0-exp(-pow(Fog,4.0)*f*f));
		color += Glow.xyz*Glow.w*pow(stepFactor,4.0);
	}
	else if (steps==MaxRaySteps) {
		// Close to something, but too many steps
		color = backColor;
	} else {
		color = backColor;
	}
	
	//color = clamp(color, 0.0, 1.0);
	
	return color;
}

void init(); // forward declare


void main() {
	init();
	
	vec3 color = vec3(0.0,0.0,0.0);
	for (int x = 0; x<AntiAlias; x++) {
		float  dx =  AntiAliasBlur*float(x)/float(AntiAlias);
		for (int y = 0; y<AntiAlias; y++) {
			float dy = AntiAliasBlur*float(y)/float(AntiAlias);
			vec3 nDir = dir+dirDx*dx+dirDy*dy;
			color += trace(from,nDir);
		}
	}
	
	color = clamp(color/float(AntiAlias*AntiAlias), 0.0, 1.0);
	gl_FragColor = vec4(color, 1.0);
}
