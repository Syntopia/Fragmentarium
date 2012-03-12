#donotrun

#info Default Raytracer (by Syntopia)
#camera 3D

#vertex

#group Camera

// Field-of-view
uniform float FOV; slider[0,0.4,2.0] NotLockable
uniform vec3 Eye; slider[(-50,-50,-50),(0,0,-10),(50,50,50)] NotLockable
uniform vec3 Target; slider[(-50,-50,-50),(0,0,0),(50,50,50)] NotLockable
uniform vec3 Up; slider[(0,0,0),(0,1,0),(0,0,0)] NotLockable

varying vec3 dirDx;
varying vec3 dirDy;
varying vec3 from;
uniform vec2 pixelSize;
varying vec2 coord;
varying float zoom;
varying vec3 dir;
varying vec3 MulX;
varying vec3 MulY;
varying vec3 Off;

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
	MulX = Right*FOV;
	MulY = up*FOV;
	Off = Dir;
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
//uniform float AntiAliasBlur;slider[0.0,1,2];
// Distance to object at which raymarching stops.
uniform float Detail;slider[-7,-2.3,0];
// The maximum length we will follow a ray
//uniform float MaxDist;slider[-2,2,3];
// The resolution for normals (used for lighting)
uniform float DetailNormal;slider[-7,-2.8,0];
// The step size when sampling AO (set to 0 for old AO)
uniform float DetailAO;slider[-7,-0.5,0];

// The power of the clarity function
//uniform float ClarityPower;slider[0,1,5];
const float ClarityPower = 1.0;

// Lower this if the system is missing details
uniform float FudgeFactor;slider[0,1,1];

float minDist = pow(10.0,Detail);
float aoEps = pow(10.0,DetailAO);
const float MaxDistance = 100.0;

// Maximum number of  raymarching steps.
uniform int MaxRaySteps;  slider[0,56,2000]

// Use this to boost Ambient Occlusion and Glow
//uniform float  MaxRayStepsDiv;  slider[0,1.8,10]

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

uniform float Reflection; slider[0,0,1]

vec4 orbitTrap = vec4(10000.0);


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

float DE(vec3 pos, int type) ; // Must be implemented in other file

uniform bool CycleColors; checkbox[false]
uniform float Cycles; slider[0.1,1.1,32.3]

vec3 normal(inout vec3 pos,  float normalDistance) {
	normalDistance = max(normalDistance*0.5, 1.0e-7);
	vec3 e = vec3(0.0,normalDistance,0.0);
	vec3 n = vec3(DE(pos+e.yxx,0)-DE(pos-e.yxx,0),
		DE(pos+e.xyx,0)-DE(pos-e.xyx,0),
		DE(pos+e.xxy,0)-DE(pos-e.xxy,0));
	n =  normalize(n);
	return n;
}

#group Floor
uniform vec3 FloorNormal; slider[(-1,-1,-1),(0,0,0),(1,1,1)]
uniform float FloorHeight; slider[-5,0,5]
uniform vec3 FloorColor; color[1,1,1]

vec3 lighting( vec3 n,  vec3 color, inout vec3 pos,inout  vec3 dir,inout  float eps) {
	vec3 spotDir =-normalize(dirDx)*tan(SpotLightDir.x*0.5*3.14)+
	normalize(dirDy)*tan(SpotLightDir.y*0.5*3.14) + dir;
	spotDir = normalize(spotDir);
	
	// Calculate perfectly reflected light
	vec3 r = spotDir - 2.0 * dot(n, spotDir) * n;
	float s = max(0.0,dot(dir,-r));
	
	float diffuse = max(0.0,dot(-n,spotDir))*SpotLight.w;
	float ambient = max(CamLightMin,dot(-n, dir))*CamLight.w;
	float specular = (SpecularExp<=0.0) ? 0.0 : pow(s,SpecularExp)*Specular;
	
	
	return (SpotLight.xyz*diffuse+CamLight.xyz*ambient+ specular*SpotLight.xyz)*color;
}

vec3 colorBase = vec3(0.0,0.0,0.0);

// Ambient occlusion approximation.
// Sample proximity at a few points in the direction of the normal.
float ambientOcclusion(vec3 p, vec3 n) {
	float ao = 0.0;
	float de = DE(p,0);
	float wSum = 0.0;
	float w = 1.0;
	float d = 1.0;
	for (float i =1.0; i <6.0; i++) {
		// D is the distance estimate difference.
		// If we move 'n' units in the normal direction,
		// we would expect the DE difference to be 'n' larger -
		// unless there is some obstructing geometry in place
		float D = (DE(p+ d*n*i*i*aoEps,0) -de)/(d*i*i*aoEps);
		w *= 0.6;
		ao += w*clamp(1.0-D,0.0,1.0);
		wSum += w;
	}
	return clamp(AO.w*ao/wSum, 0.0, 1.0);
}

vec3 getColor() {
	orbitTrap.w = sqrt(orbitTrap.w);
	
	
	return mix(BaseColor, X.xyz*X.w*orbitTrap.x +
		Y.xyz*Y.w*orbitTrap.y +
		Z.xyz*Z.w*orbitTrap.z +
		R.xyz*R.w*orbitTrap.w,  OrbitStrength);
}

//uniform bool Preview; checkbox[true]
bool Preview = true;
bool Cut = false;
uniform float XLevel; slider[-5,0,5]
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
			dist = DE(p,0);
			if (Cut) dist = max(dist, p.x-XLevel);
			dist *= FudgeFactor;
			totalDist += dist;
			epsModified = totalDist*eps;
			if (dist < epsModified || totalDist > MaxDistance) break;
		}
	}
	vec3 hitColor;
	float stepFactor = clamp((float(steps))/float(MaxRaySteps),0.0,1.0);
	vec3 backColor = BackgroundColor;
	
	if (  steps==MaxRaySteps) orbitTrap = vec4(0.0);
	
	if ( dist < epsModified) {
		// We hit something, or reached MaxRaySteps
		hit = from + totalDist * direction;
		float ao = AO.w*stepFactor ;
		hitNormal= normal(hit, epsModified); // /*normalE*epsModified/eps*/
		ao = ambientOcclusion(hit, hitNormal);
		//hitColor = getColor();
		hitColor = BaseColor;//*(1.0-ao);
		hitColor = lighting( hitNormal,mix(hitColor, AO.xyz ,ao),  hit,  direction,eps);
		
		//	hitColor = lighting( mix(hitColor, AO.xyz ,ao), hitColor,  hit,  direction,eps);
	} else {
		hitColor = backColor;
	}
	
	return hitColor;
}

#ifdef providesInit
void init(); // forward declare
#else
void init() {}
#endif
varying vec3 MulX;
varying vec3 MulY;
varying vec3 Off;
uniform float PlaneZoom; slider[0.0,1.0,10.0]
uniform float GraphZoom; slider[0.0,1.0,10.0]
uniform float ZLevel; slider[-10,0,10]
uniform float Delta; slider[-10,-1,0]
uniform float RAD; slider[0,0.091,0.001]

void main() {
	init();
	vec3 hitNormal;
	vec3 hit;
	
	vec3 d = vec3(0.0);
	
	if (coord.x<0.0)
	d = (coord.x*2.0+1.)*MulX ;
	else {
		Cut = true;
		d =  (coord.x*2.0-1.)*MulX;
	}
	
	if (coord.y<0.0)
	d += (coord.y*2.0+1.0)*MulY +Off;
	else
	d +=  (coord.y*2.0-1.0)*MulY+Off;
	
	
	
	if (coord.y<0.0 && coord.x < 0.0) {
		vec3 p = vec3(XLevel,(coord.x*2.0+1.0)*PlaneZoom,(coord.y*2.0+1.0)*PlaneZoom);
		if (abs(p.z-ZLevel)<0.01) { gl_FragColor = vec4(1.0,0.0,0.0,1.0); return; }
		float dist = DE(p,0);
		if (dist < minDist) {
			gl_FragColor = vec4(getColor(),1.0);

		} else {
			gl_FragColor =vec4( 0.8,0.8,0.8,1.0);
		}
	} else if (coord.y<0.0 && coord.x > 0.0) {
gl_FragColor = vec4(0.0);
int steps =3;
 for (int a = 0; a < steps; a++) {
 for (int b = 0;b < steps; b++) {
vec2 o = vec2(float(a)*RAD*10.0,float(b)*RAD*10.0);
		vec3 p = vec3(XLevel,((coord.x+o.x)*2.0-1.0)*PlaneZoom,ZLevel);
		float dist = DE(p,0);
		float del = pow(10.0,Delta);
		float distX = DE(p+vec3(0.0,del,0.0),0);
		float distX2 = DE(p-vec3(0.0,del,0.0),0);
		float grad = (distX-distX2)/(2.0*del);
		float dist2 = DE(p,1);
		float yy = ((coord.y+o.y)*2.0+1.0)*GraphZoom;
		if (abs(yy-dist) < 0.01*GraphZoom) {
			gl_FragColor += vec4(0.0,0.0,1.0,1.0); // DE-plot
		} else if (abs(yy-grad) < 0.01*GraphZoom) {
			gl_FragColor += vec4(1.,0.0,0.,1.0); // Derivative of DE
//return;
		}  else if (abs(yy-dist2) < 0.01*GraphZoom) {
			gl_FragColor += vec4(0.0,1.0,1.0,1.0); // Alt DE
		}  else if (abs(yy) < 0.01*GraphZoom) {
			gl_FragColor += vec4(0.0,0.0,0.0,1.0); // y = 0
		}  else if (abs(mod(yy,1.0)) < 0.01*GraphZoom) {
			gl_FragColor += vec4(0.0,0.0,0.0,1.0); // y units
		} else if (abs(mod(p.y,1.0)) < 0.01*GraphZoom) {
			gl_FragColor += vec4(0.0,0.0,0.0,1.0); // x units
		} else {
			gl_FragColor +=vec4( 1.,1.,1.,1.0);
		}
}
}
gl_FragColor /= float(steps*steps);
	}
	else
	gl_FragColor = vec4(clamp( trace(from,d,hit,hitNormal),0.0,1.0), 1.0);
}
