#info Menger Distance Estimator.
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Menger
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

// Scale parameter. A perfect Menger is 3.0
uniform float Scale; slider[-5.00,2.0,4.00]

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[0.00,0,180]

// Scaling center
uniform vec3 Offset; slider[(0,0,0),(1,1,1),(5,5,5)]

mat3 rot;

void init() {
	rot = rotationMatrix3(normalize(RotVector), RotAngle);
}

uniform float fixedRadius2; slider[0.1,1.0,2.3]
uniform float minRadius2; slider[0.1,0.25,2.3]
void sphereFold(inout vec3 z, inout float dz) {
	float r2 = dot(z,z);
	if (r2< minRadius2) {
		float temp = (fixedRadius2/minRadius2);
		z*= temp;
		dz/=temp;
	} else if (r2<fixedRadius2) {
		float temp =(fixedRadius2/r2);
		z*=temp;
		dz/=temp;
	}
}

uniform float foldingValue; slider[0.0,2.0,5.0]
uniform float foldingLimit; slider[0.0,1.0,5.0]
void boxFold2(inout vec3 z, inout float dz) {
	if (z.x>foldingLimit) { z.x = foldingValue-z.x; }  else if (z.x<-foldingLimit) z.x = -foldingValue-z.x; 
	if (z.y>foldingLimit)  { z.y = foldingValue-z.y;  } else if (z.y<-foldingLimit) z.y = -foldingValue-z.y; 
	if (z.z>foldingLimit)  { z.z = foldingValue-z.z ; } else if (z.z<-foldingLimit) z.z = -foldingValue-z.z; 
}

void boxFold(inout vec3 z, inout float dz) {
	z = clamp(z, -foldingLimit, foldingLimit) * 2.0 - z; 
}

float DE(vec3 z)
{
	vec3 c = z;
     // z = vec3(0.0);
	int n = 0;
	float dz = 1.0;
	while (n < 16) {
		boxFold(z,dz);
		sphereFold(z,dz);
		
/*
             z = abs(z);
		if (z.x<z.y){ z.xy = z.yx;}
		if (z.x< z.z){ z.xz = z.zx;}
		if (z.y<z.z){ z.yz = z.zy;}
		z = Scale*z-Offset*(Scale-1.0);
		if( z.z<-0.5*Offset.z*(Scale-1.0))  z.z+=Offset.z*(Scale-1.0);
		
*/
		z = rot *z;
		z = Scale*z+c*Offset;
		
		if (n<2) orbitTrap = min(orbitTrap, (vec4(abs(z),dot(z,z))));
		n++;
	}
	
	return ((dz)*length(z) ) * pow(Scale, float(-n));
}

#preset Weird
FOV = 0.4
Eye = -1.48225,-0.635961,-0.672864
Target = 6.96246,2.31905,2.86736
Up = -0.206077,-0.451272,0.868244
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.11682
DetailNormal = -2.89422
FudgeFactor = 0.5514
MaxRaySteps = 87
MaxRayStepsDiv = 1.8
BoundingSphere = 2
Dither = 0.12319
AO = 0,0,0,0.78689
Specular = 1.1667
SpecularExp = 16
SpotLight = 1,1,1,0.03261
SpotLightDir = 0.69524,0.1
CamLight = 1,1,1,1.13978
Glow = 1,0.117647,0.117647,0.07895
Fog = 0.4161
BaseColor = 1,1,1
OrbitStrength = 0.93069
X = 0.5,0.6,0.6,0.2126
Y = 1,0.6,0,0.30708
Z = 0.8,0.78,1,0.35434
R = 0.666667,0.666667,0.498039,0.36508
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 14.714
DetailAO = 0
AOSpread = 1
HardShadow = 0
Scale = 3
RotVector = 1,1,1
RotAngle = 123.242
Offset = 0.85294,0.77941,0.81618
fixedRadius2 = 1.18953
minRadius2 = 0.62567
#endpreset

#preset Futura
FOV = 0.4
Eye = 4.45648,-2.82919,-2.1511
Target = -2.18067,-2.14225,1.84142
Up = -0.0675169,-0.997362,-0.02666
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.60582
DetailNormal = -3.76922
DetailAO = 0
AOSpread = 1
FudgeFactor = 0.21495
MaxRaySteps = 817
MaxRayStepsDiv = 3.25
BoundingSphere = 10
Dither = 0.5
AO = 0,0,0,1
Specular = 5.5
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
Glow = 0.133333,0.509804,1,0.08772
Fog = 0.45638
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.18812
X = 0.5,0.6,0.6,0.73228
Y = 0.580392,0.866667,1,0.79528
Z = 0.8,0.78,1,0.16536
R = 0.4,0.7,1,-0.65082
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 7.53015
Scale = 2
RotVector = 1,1,1
RotAngle = 0
Offset = 2,2,2
fixedRadius2 = 1
minRadius2 = 0.25
foldingValue = 2
foldingLimit = 1
#endpreset