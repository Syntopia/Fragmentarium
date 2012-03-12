#info Spudsville
#include "Soft-Raytracer.frag"
//#include "Fast-Raytracer.frag"
#group Spudsville

// Spudsville, based on Lenords parameters from here: http://www.fractalforums.com/index.php?action=gallery;sa=view;id=4248
//
// This one has issues - sometimes the shader codes compiles forever on 
// my Geforce 310M, if I don't lock some variables.
// It is also very slow - try using the fast raytracer.

uniform float Scale; slider[-5.00,2.0,4.00]

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

uniform float foldingLimit; slider[0.0,1.0,5.0]

uniform float foldingLimit2; slider[0.0,1.0,5.0]
void boxFold(inout vec3 z, inout float dz) {
	z = clamp(z, -foldingLimit, foldingLimit) * 2.0 - z;
}

void boxFold3(inout vec3 z, inout float dz) {
	z = clamp(z, -foldingLimit2,foldingLimit2) * 2.0 - z;
}


uniform float Scale2; slider[0.00,2,4.00]
uniform vec3 Offset2; slider[(0,0,0),(1,0,0),(1,1,1)]

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


uniform int MN; slider[0,5,50]
float DE(vec3 z)
{
	vec3 c = z;
	int n = 0;
       float dz = 1.0;
	float r = length(z);
	while (r<10.0 && n < 14) {
		if (n<MN) {
			boxFold(z,dz);
			sphereFold(z,dz);
			z = Scale*z; //+c;//+c*Offset;
			dz*=abs(Scale);
		} else {
			boxFold3(z,dz);
			r = length(z);
			powN2(z,r,dz);
		}
		r = length(z);
		
		if (n<2) orbitTrap = min(orbitTrap, (vec4(abs(4.0*z),dot(z,z))));
		n++;
	}
	
	return (r*log(r) / dz);
}


#preset Default
FOV = 0.62536
Eye = -3.65033,2.69912,3.61626
Target = -4.0058,9.34862,2.522
Up = -0.0277998,-0.166946,-0.985574
AntiAlias = 1 NotLocked
Detail = -4.52214
DetailAO = -0.71428
FudgeFactor = 0.06024
MaxRaySteps = 242
BoundingSphere = 10
Dither = 0.07895
NormalBackStep = 1 NotLocked
AO = 0,0,0,0.88889
Specular = 2.5316
SpecularExp = 30.909
SpotLight = 1,1,1,0.2549
SpotLightDir = 0.25,0.1
CamLight = 1,1,1,0.84616
CamLightMin = 0.51515
Glow = 0.364706,0,1,0.12281
GlowMax = 20
Fog = 2
HardShadow = 0.55385 NotLocked
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
Cycles = 6.1755
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
foldingLimit2 = 2 Locked
Scale2 = 2 Locked
Offset2 = 1,0,0 Locked
Power = 2.05493 Locked
ZMUL = -26 Locked
MN = 6 Locked
Analytic = true Locked
DetailGrad = -5.40316
#endpreset
