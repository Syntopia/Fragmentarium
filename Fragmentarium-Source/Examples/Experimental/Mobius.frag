#define providesColor
#include "Soft-Raytracer.frag"


#include "Complex.frag"
#group
uniform vec2 CA; slider[(-1,-1),(0,0),(1,1)]
uniform vec2 CB; slider[(-1,-1),(0,0),(1,1)]
uniform vec2 CC; slider[(-1,-1),(0,0),(1,1)]
uniform vec2 CD; slider[(-1,-1),(0,0),(1,1)]
// 'Ducks' fractal by Samuel Monnier
// (Implementation by Syntopia)
// See http://www.algorithmic-worlds.net/blog/blog.php?Post=20110227
vec2 formula(vec2 z) {
	z = cSqr(z);
	z = cDiv((cMul(CA,z)+CB),(cMul(z,CC)+CD));
	return z;
	
}

// Number of iterations
uniform int  Iterations; slider[1,200,1000]

// Skip this number of iterations before starting coloring
uniform int  PreIterations; slider[0,1,100]
uniform float EscapeSize; slider[0,5,11]
float escape = pow(10.0,EscapeSize);

uniform float ColR; slider[0,0,1]
uniform float ColG; slider[0,0.4,1]
uniform float ColB; slider[0,0.7,1]
uniform float ColC; slider[0,1,2]

vec3 c2d(vec2 c) {
	vec2 z = c;
	int i = 0;
	float ci = 0.0;
	float mean = 0.0;
	for (i = 0; i < Iterations; i++) {
		z = formula(z);
		if (i>PreIterations) mean+=length(z);
		if (dot(z,z)> escape) break;
	}
	mean/=float(i-PreIterations);
	ci =  1.0 - log2(.5*log2(mean/ColC));
	return vec3( .5+.5*cos(6.*ci+ColR),.5+.5*cos(6.*ci + ColG),.5+.5*cos(6.*ci +ColB) );
}



// multiply by 2.0 to get z=-1 plane projection.
vec2 stereographicSphereToPlane(vec3 p) {
	float n = dot(p,p)+1.0;
	return 2.0*vec2(p.x/(1.0-p.z),p.y/(1.0-p.z));
}

// for z = 0 projection.
vec3 stereographicPlaneToSphere(vec2 p) {
	float n = dot(p,p)+1.0;
	return vec3(2.0*p.xy,n-2.0)/n;
}

vec3 c2dx(vec2 p) {
	if (mod(length(p.x),1.0)<0.02) return vec3(0.0);
	if (mod(length(p),1.0)<0.02) return vec3(0.0);
	return vec3(p,1.0);
}


bool floor = false;

vec3 color(vec3 z,vec3 n) {
	floor = false;
	DE(z);
	
	if (floor) {
		return c2d(z.xy);
	}
	return c2d( stereographicSphereToPlane(z));
}

float  DE(vec3 p) {
	
	float d = (length(p-vec3(0.0,0.0,0.0))-1.0); // A sphere
	float f =  abs(p.z+1.0) ;
	if (f< d) {
		floor = true;
		d = f;
	}
	return d;
}

#preset Default
FOV = 0.4
Eye = 1.96296,-1.99965,1.75255
Target = -5.21595,3.12123,-2.96336
Up = -0.207831,0.488877,0.847234
AntiAlias = 1
Detail = -3.03541
DetailAO = -0.5
FudgeFactor = 1
MaxRaySteps = 110
BoundingSphere = 12
Dither = 0.5
NormalBackStep = 1
AO = 0,0,0,0.7
Specular = 0.2532
SpecularExp = 16
CamLight = 1,1,1,1
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 0.30769 NotLocked
ShadowSoft = 2
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
CA = 1,0
CB = -0.59634,0.4312
CC = 0.37038,0
CD = 1,0
Iterations = 200
PreIterations = 1
ColR = 0
ColG = 0.4
ColB = 0.7
ColC = 0.25
EscapeSize = 5
Gamma = 2.2
ExponentialExposure = false
Exposure = 1.3
Brightness = 1
Contrast = 1
Saturation = 1
SpotLight = 1,1,1,1.1111
SpotLightPos = 10,10,10
SpotLightSize = 0.1
ShadowBackstep = 2
FocalPlane = 1
Aperture = 0
AntiAliasScale = 2
#endpreset
