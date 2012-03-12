#include "2D.frag"
#include "Complex.frag"

// The simplest way to draw something in Fragmentarium,
// is to include the "2D.frag" header.
//
// Now, we can implement a simple 'color' function,
// which for each point in the plane returns a RGB color.
//
// Notice, that you can zoom using the mouse or the keyboard.
// (A,S,D,W,Q,E,1,3)
#define PI 3.141592
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
vec3 color(vec2 z) {
	// Restrict
	//if (abs(z).x>3.0) return vec3(0.);
	//if (abs(z).y>3.0) return vec3(0.);

	z = formula(z);	
	// Inverse map complex plane to 2-sphere
	// using spherical coordinates:
	float r = length(z);
	float phi = 2.*atan(1./r);
	float theta = atan(z.y,z.x);

	float b0 = fract(2.0*log(r)/log(2.)); // fractional brightness
	float b1 = fract(log(r)/log(2.));        // ... for every second band
	
	float m = mod(theta , PI/6.); // twelve white rays.
	float p10 =pow(10.,GridWidth); // grid width
	
       // adjust brightness
	float b = (b0+3.0)/4.0;
	if (b1<0.5) b = 1.0;

       // saturation and value
	float s = 1.0;
	float val = 1.0;
	if (phi<PI/2.) s = sin(phi); else val = sin(phi);
	s=pow(s,0.5);
	val=pow(val,0.5);
	
	// convert
	vec3 v = HSVtoRGB(vec3(theta,s,val))*b;
	
	// blend in grid
	if (m<p10) v =mix(vec3(1.0),v, m/p10);
	if (m>PI/6.-p10) v =mix(v,vec3(1.0),( m-(PI/6.-p10) )/p10);
	
	if (b0<p10) v =mix(vec3(0.0),v, b0/p10);
	if (b0>1.-p10) v =mix(v,vec3(0.0),( b0-(1.-p10) )/p10);
	
	return v;
}
