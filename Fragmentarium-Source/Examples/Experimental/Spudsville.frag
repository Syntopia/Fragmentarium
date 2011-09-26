#info Menger Distance Estimator.
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Menger
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

// Scale parameter. A perfect Menger is 3.0
uniform float Scale; slider[-5.00,2.0,4.00]


// Scaling center
uniform vec3 Offset; slider[(0,0,0),(1,1,1),(5,5,5)]

mat3 rot;


uniform float fixedRadius2; slider[0.1,1.0,2.3]
uniform float minRadius2; slider[0.0,0.25,2.3]
void sphereFold(inout vec3 z, inout float dz) {
	float r2 = dot(z,z);
	if (r2< minRadius2) {
		float temp = (fixedRadius2/minRadius2);
		z*= temp;
		dz*=temp;
} else if (r2<fixedRadius2) {
		float temp =(fixedRadius2/r2);
		z*=temp;
		dz*=temp;
	}
}

uniform float foldingValue; slider[0.0,2.0,5.0]
uniform float foldingLimit; slider[0.0,1.0,5.0]
void boxFold2(inout vec3 z, inout float dz) {
	if (z.x>foldingLimit) { z.x = foldingValue-z.x; }  else if (z.x<-foldingLimit) z.x = -foldingValue-z.x;
	if (z.y>foldingLimit)  { z.y = foldingValue-z.y;  } else if (z.y<-foldingLimit) z.y = -foldingValue-z.y;
	if (z.z>foldingLimit)  { z.z = foldingValue-z.z ; } else if (z.z<-foldingLimit) z.z = -foldingValue-z.z;
}

uniform float foldingLimit2; slider[0.0,1.0,5.0]
void boxFold(inout vec3 z, inout float dz) {
	z = clamp(z, -foldingLimit, foldingLimit) * 2.0 - z;
}

void boxFold3(inout vec3 z, inout float dz) {
	z = clamp(z, -foldingLimit2,foldingLimit2) * 2.0 - z;
}


void mengerFold(inout vec3 z, inout float dz) {
	z = abs(z);
	if (z.x<z.y){ z.xy = z.yx;}
	if (z.x< z.z){ z.xz = z.zx;}
	if (z.y<z.z){ z.yz = z.zy;}
	z = Scale*z-Offset*(Scale-1.0);
	if( z.z<-0.5*Offset.z*(Scale-1.0))  z.z+=Offset.z*(Scale-1.0);
	dz*=Scale;
	
}

uniform float Scale2; slider[0.00,2,4.00]
uniform vec3 Offset2; slider[(0,0,0),(1,0,0),(1,1,1)]

void octo(inout vec3 z, inout float dz) {	
		if (z.x+z.y<0.0) z.xy = -z.yx;
		if (z.x+z.z<0.0) z.xz = -z.zx;
		if (z.x-z.y<0.0) z.xy = z.yx;
		if (z.x-z.z<0.0) z.xz = z.zx;
		z = z*Scale2 - Offset2*(Scale2-1.0);
    dz*= Scale2;
}

 
uniform float Power; slider[0.1,2.0,12.3]
uniform float ZMUL; slider[0.0,1,310]
void powN2(inout vec3 z, float zr0, inout float dr) {
	float zo0 = asin( z.z/zr0 );
	float zi0 = atan( z.y,z.x );
	float zr = pow( zr0, Power-1.0 );
	float zo = zo0 * Power;
	float zi = zi0 * Power;
	dr = zr*dr*Power*abs(length(vec3(1.0,1.0,ZMUL)/sqrt(3.0))) + 1.0;
	zr *= zr0;
	z  = zr*vec3( cos(zo)*cos(zi), cos(zo)*sin(zi), ZMUL*sin(zo) );
}



float DE2(vec3 pos) {
	vec3 z=pos;
	float r;
	float dr=1.0;
	int i=0;
	r=length(z);
	while(r<100 && (i<8)) {
		powN2(z,r,dr);
		z+=pos;
		r=length(z);
		z*=rot;
		if (i<5) orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,r*r)));
		i++;
	}
	
	return 0.5*log(r)*r/dr;
	
}
uniform int MN; slider[0,5,50]
float DE(vec3 z, inout float dz, inout int iter)
{
	vec3 c = z;
	// z = vec3(0.0);
	int n = 0;
	//float dz = 1.0;
	float r = length(z);
	while (r<10 && n < 14) {
		if (n==iter)break;
		
if (n<MN) {
		boxFold(z,dz);
		sphereFold(z,dz);
		z = Scale*z; //+c;//+c*Offset;
		dz*=abs(Scale);
		} else {
		boxFold3(z,dz);
			r = length(z);
		
powN2(z,r,dz);

//z = z + c;
	
}
//		boxFold(z,dz);
		//r = length(z);		
//sphereFold(z,dz);
//octo(z,dz);
//		boxFold(z,dz);
	
//mengerFold(z,dz);
	
		
	//	z+=c*Offset;
		r = length(z);
		
		if (n<2 && iter<0) orbitTrap = min(orbitTrap, (vec4(abs(4.0*z),dot(z,z))));
		n++;
	}
	if (iter<0) iter = n;
	
	return r; // (r*log(r) / dz);
}
uniform bool Analytic; checkbox[true]

uniform float DetailGrad;slider[-7,-2.8,7];
float gradEPS = pow(10.0,DetailGrad);

float DE(vec3 pos) {
	int iter = -1;
	float dz = 1.0;
	if (Analytic) {
		float r = DE(pos, dz, iter);
		return (r*log(r) / dz);
	} else  {
		vec3 e = vec3(0.0,gradEPS,0.0);
		float r = abs(DE(pos, dz, iter));
		vec3 grad =vec3( DE(pos+e.yxx, dz, iter),  DE(pos+e.xyx, dz, iter),  DE(pos+e.xxy,dz,  iter) )-vec3(r);
		return r*log(r)*0.5/ length( grad/gradEPS);
	}
	
	
}

float DED(vec3 pos, vec3 dir) {
	int iter = -1;
	float dz = 1.0;
	vec3 e = -dir*gradEPS;
	float r = abs(DE(pos, dz, iter));
	float grad =DE(pos+e, dz, iter)-r;
	return r*log(r)*0.5/ abs( grad/gradEPS);
	
	
}

#preset Default
FOV = 0.62536
Eye = -3.66886,2.61522,3.66743
Target = -2.02257,8.00352,-0.0468098
Up = 0.717509,0.233191,0.656321
AntiAlias = 1 NotLocked
Detail = -5.05918
DetailAO = -0.50001
FudgeFactor = 0.01205
MaxRaySteps = 879
BoundingSphere = 10
Dither = 0.5
NormalBackStep = 1 NotLocked
AO = 0,0,0,1
Specular = 3.9241
SpecularExp = 30.909
SpotLight = 1,1,1,0.2549
SpotLightDir = 0.25,0.1
CamLight = 1,1,1,0.84616
CamLightMin = 0.53271
Glow = 0.364706,0,1,0.12281
Fog = 1.64814
HardShadow = 0.6 NotLocked
ShadowSoft = 6.7742
Reflection = 0 NotLocked
BaseColor = 0.666667,0.666667,0.498039
OrbitStrength = 0.38961
X = 0.6,0.439216,0.32549,0.16536
Y = 0.666667,0.666667,0,0.2756
Z = 1,0,0.0156863,0.16536
R = 1,0.490196,0.235294,0.64706
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3005
CycleColors = true
Cycles = 7.45609
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = -2.00012
Offset = 1.25,0.8456,0.9191
fixedRadius2 = 1.02191
minRadius2 = 0.06631
foldingValue = 2
foldingLimit = 1
foldingLimit2 = 2
Scale2 = 2
Offset2 = 1,0,0
Power = 2.05493
MN = 6
Analytic = true
DetailGrad = -5.40316
ZMUL = -26
#endpreset