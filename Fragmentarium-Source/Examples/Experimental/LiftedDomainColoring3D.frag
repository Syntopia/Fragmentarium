#info Lifted domain coloring
#define providesInit
#define providesColor
#include "Soft-Raytracer.frag"
#include "MathUtils.frag"
#include "Complex.frag"
#group Mandelbrot

// Made by Knighty, see this thread:
// http://www.fractalforums.com/3d-fractal-generation/fragmentarium-an-ide-for-exploring-3d-fractals-and-other-systems-on-the-gpu/msg32270/#msg32270
// Updated by Syntopia to support Julia's and the standard color scheme

// Number of fractal iterations.
uniform int Iterations;  slider[0,9,100]
// Bailout radius
uniform float Bailout; slider[0,128,1024]
// Slope
uniform float Slope; slider[-10,-2,10]

float k;
void init() {
	k=1./sqrt(1.+Slope*Slope);
}

uniform float CR; slider[0,0,1]
uniform float CG; slider[0,0.4,1]
uniform float CB; slider[0,0.7,1]

uniform bool Julia; checkbox[false]
uniform float JuliaX; slider[-2,-0.6,2]
uniform float JuliaY; slider[-2,1.3,2]

vec2 c2 = vec2(JuliaX,JuliaY);


// Hue in radians
vec3 HSVtoRGB(vec3 hsv) {
	/// Implementation based on: http://en.wikipedia.org/wiki/HSV_color_space
	hsv.x = mod(hsv.x,2.*PI);
	int Hi = int(mod(hsv.x / (2.*PI/6.), 6.));
	float f = (hsv.x / (2.*PI/6.)) -float( Hi);
	float p = hsv.z*(1.-hsv.y);
	float q = hsv.z*(1.-f*hsv.y);
	float t = hsv.z*(1.-(1.-f)*hsv.y);
	if (Hi == 0) { return vec3(hsv.z,t,p); }
	if (Hi == 1) { return vec3(q,hsv.z,p); }
	if (Hi == 2) { return vec3(p,hsv.z,t); }
	if (Hi == 3) { return vec3(p,q,hsv.z); }
	if (Hi == 4) { return vec3(t,p,hsv.z); }
	if (Hi == 5) { return vec3(hsv.z,p,q); }
	return vec3(0.);
}

vec2 cMul2(in vec2 a, in vec2 b) {
	return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}

float sqr(float a) { return a; }

vec2 formula(vec2 z) {
	vec2 real = vec2(1.,0.); vec2 imag = vec2(0.,1.);
	vec2 z2 =  cMul(cSqr(z+real),  z-real);
	vec2 z3 =  cMul(z+imag, cSqr(z-imag));
	z = cDiv(z2,z3);
	return z;
}

vec2 toPhiTheta(vec2 z) {
	float r = length(z);
	float phi = 2.*atan(1./r);
	float theta = atan(z.y,z.x);
	return vec2(phi,theta);
}
uniform float delta; slider[0.0,0.001,1.0]

// Convert to
uniform float GridWidth; slider[-10,-1,10]
vec3 baseColor(vec3 pos, vec3 n) {
	vec2 z = pos.xy;
	// Restrict
	//if (abs(z).x>3.0) return vec3(0.);
	//if (abs(z).y>3.0) return vec3(0.);
	
	z = formula(z);
	// Inverse map complex plane to 2-sphere
	// using spherical coordinates:
	float r = length(z);
	float phi = 2.*atan(1./r);
	float theta = atan(z.y,z.x);
	
	
	vec2 zdxpt = toPhiTheta(formula(z+vec2(delta,0.)));
	vec2 zdypt = toPhiTheta(formula(z+vec2(0.,delta)));
	float zdp = sqrt( sqr(zdxpt.x-phi) + sqr(zdypt.x-phi))/delta;
	float zdt = sqrt( sqr(zdxpt.y-theta) + sqr(zdypt.y-theta))/delta;
	//	r = zdp;
	
	float b0 = fract(2.0*log(r)/log(2.)); // fractional brightness
	float b1 = fract(log(r)/log(2.));        // ... for every second band
	
	float m = mod(theta , PI/6.); // twelve white rays.
	float p10 =pow(10.,GridWidth); // grid width
	
	// adjust brightness
	float b = (b0+1.0)/2.0;
	if (b1<0.5) b = 1.0;
	// saturation and value
	float s = 1.0;
	float val = 1.0;

	if (phi<PI/2.) s = sin(phi); else val = sin(phi);
	s=pow(s,0.5);
	val=pow(val,0.5);
	s = 1.0; val = 1.0;
	// convert
	vec3 v = HSVtoRGB(vec3(theta,s,val))*b;
	
	// blend in grid
	if (m<p10) v =mix(vec3(1.0),v, m/p10);
	if (m>PI/6.-p10) v =mix(v,vec3(1.0),( m-(PI/6.-p10) )/p10);
	
	if (b0<p10) v =mix(vec3(0.0),v, b0/p10);
	if (b0>1.-p10) v =mix(v,vec3(0.0),( b0-(1.-p10) )/p10);
	
	return v;
}

float Sigmoid(float x) {
	return (1.0/ (1.0+exp(-x/10.0)))-0.5;
}
float T(float x) {
	return 2.0* Sigmoid(abs(x+1./x));
}

float DE(vec3 pos) {
	
	
	float r = length(formula(pos.xy));
	
	float dr=abs( T(r));
	dr*=-4.0*Sigmoid(log(r));
	return (pos.z-Slope*dr)*k;
}


#preset Default
FOV = 0.4
Eye = 1.30147,-2.31303,1.76604
Target = -2.64271,4.5884,-3.19612
Up = -0.228457,0.481526,0.846133
EquiRectangular = false
FocalPlane = 2.11955
Aperture = 0
Gamma = 1
ToneMapping = 3
Exposure = 1
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 2
Detail = -2.91151
DetailAO = -0.35714
FudgeFactor = 0.08434
MaxRaySteps = 242
BoundingSphere = 47.17
Dither = 0.58772
NormalBackStep = 1
AO = 0,0,0,0.20988
Specular = 0
SpecularExp = 19.277
CamLight = 1,1,1,1.73076
CamLightMin = 0.5303
Glow = 1,1,1,0.55556
GlowMax = 24
Fog = 0.144
HardShadow = 0.83077 NotLocked
ShadowSoft = 1.9354
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,1
Y = 1,0.6,0,0.48092
Z = 0.8,0.78,1,0.26718
R = 0.666667,0.666667,0.498039,0.58462
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 1.35415
CycleColors = false
Cycles = 1.29269
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 23
Bailout = 1024
Slope = -0.8412
CR = 0
CG = 0.4
CB = 0.7
Julia = false
JuliaX = -0.6
JuliaY = 1.3
delta = 0.001
GridWidth = -1.628
SpotLight = 1,1,1,0
SpotLightPos = 7.4074,-0.3704,3.3334
SpotLightSize = 0.1
ShadowBackstep = 2
#endpreset
