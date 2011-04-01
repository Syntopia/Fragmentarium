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

void boxFold(inout vec3 z, inout float dz) {
	z = clamp(z, -foldingLimit, foldingLimit) * 2.0 - z;
}

void mengerFold(inout vec3 z) {
	z = abs(z);
	if (z.x<z.y){ z.xy = z.yx;}
	if (z.x< z.z){ z.xz = z.zx;}
	if (z.y<z.z){ z.yz = z.zy;}
	z = Scale*z-Offset*(Scale-1.0);
	if( z.z<-0.5*Offset.z*(Scale-1.0))  z.z+=Offset.z*(Scale-1.0);
	
}

#preset
Offset = 1.25,0.8456,0.9191
fixedRadius2 = 1
minRadius2 = 0.0625
Scale=-2
foldingValue = 2
#endpreset

uniform float Power; slider[0.1,8.0,12.3]
uniform float ZMUL; slider[-10.0,1,10]
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

float DE(vec3 z, inout float dz, inout int iter)
{
	vec3 c = z;
	// z = vec3(0.0);
	int n = 0;
	//float dz = 1.0;
	float r = length(z);
	while (r<10 && n < 9) {
		if (n==iter)break;
		/*
		boxFold(z,dz);
		sphereFold(z,dz);
		z = rot *z;
		z = Scale*z+c;//+c*Offset;
		dz*=abs(Scale);
		*/
		//boxFold(z,dz);
		//r = length(z);
		powN2(z,r,dz);
		boxFold(z,dz);
		sphereFold(z,dz);
		
		z+=c*Offset;
		r = length(z);
		
		if (n<2 && iter<0) orbitTrap = min(orbitTrap, (vec4(abs(z),dot(z,z))));
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
FOV = 0.595581
Eye = 2.25021,-0.786829,0.0879431
Target = -6.09687,2.18201,-0.113811
Up = 0.0728092,0.14241,-0.916711
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.45252
DetailNormal = -2.89422
DetailAO = 0
AOSpread = 1
FudgeFactor = 0.48598
MaxRaySteps = 991
MaxRayStepsDiv = 2
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.81967
Specular = 0.4167
SpecularExp = 16
SpotLight = 1,1,1,0.72826
SpotLightDir = 0.54286,0.1
CamLight = 1,1,1,0.23656
Glow = 0.356863,1,0.12549,0.50876
Fog = 0.10738
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.5625
X = 0.411765,0.6,0.560784,0.30708
Y = 0.666667,0.666667,0.498039,1
Z = 1,0,0,-1
R = 0.4,0.7,1,1
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 2.82412
Scale = 2
RotVector = 1,1,1
RotAngle = 0
Offset = 1,1,1
fixedRadius2 = 1
minRadius2 = 0.25
foldingValue = 2
foldingLimit = 3.0263
ZMUL = 1
Analytic = true
DetailGrad = -3.56146
#endpreset

#preset p1
FOV = 0.595581
Eye = 1.25125,-0.200486,1.00756
Target = -6.83342,0.316279,4.0991
Up = 0.328927,-0.0522827,0.868915
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.60582
DetailNormal = -2.42305
DetailAO = 0
AOSpread = 1
FudgeFactor = 0.26168
MaxRaySteps = 652
MaxRayStepsDiv = 2
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.81967
Specular = 0.4167
SpecularExp = 16
SpotLight = 1,1,1,0.72826
SpotLightDir = 0.54286,0.1
CamLight = 1,1,1,0.23656
Glow = 0.356863,1,0.12549,0.50876
Fog = 0.10738
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.42574
X = 0.411765,0.6,0.560784,0.88976
Y = 0.666667,0.666667,0.498039,0.1496
Z = 1,0,0,0.46456
R = 1,0.666667,0,0.60318
BackgroundColor = 0.203922,0.227451,0.368627
GradientBackground = 0.5
CycleColors = true
Cycles = 6.78762
Scale = 2
RotVector = 1,1,1
RotAngle = 0
Offset = 1,1,1
fixedRadius2 = 1
minRadius2 = 0.25
foldingValue = 2
foldingLimit = 2.10525
ZMUL = -0.229
Analytic = false
DetailGrad = -3.56146
#endpreset

#preset F
FOV = 0.37038
Eye = 0.118532,-0.622267,-0.684692
Target = 7.08645,2.91063,1.83782
Up = 0.225292,0.185859,-0.882628
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.3572
DetailNormal = -3.98461
DetailAO = 0
AOSpread = 1
FudgeFactor = 0.2243
MaxRaySteps = 803
MaxRayStepsDiv = 2
BoundingSphere = 7.2289
Dither = 0.5
AO = 0,0,0,1
Specular = 4.1974
SpecularExp = 16
SpotLight = 1,1,1,0.5283
SpotLightDir = -0.15152,0.0303
CamLight = 1,1,1,0.33334
Glow = 0.356863,1,0.12549,0.10667
Fog = 0.9091
HardShadow = 0.95522
BaseColor = 1,1,1
OrbitStrength = 0.91935
X = 0.411765,0.6,0.560784,0.38582
Y = 0.666667,0.666667,0.498039,0.3409
Z = 1,0,0,0.93182
R = 1,0.666667,0,0.72414
BackgroundColor = 0.203922,0.227451,0.368627
GradientBackground = 1.07145
CycleColors = true
Cycles = 10.7147
Scale = 2
RotVector = 1,1,1
RotAngle = 0
Offset = 0,0.8763,1.7526
fixedRadius2 = 1.36665
minRadius2 = 0.96352
foldingValue = 2
foldingLimit = 3.53335
ZMUL = -1.087
Analytic = true
DetailGrad = -3.56146
Power = 12.3
#endpreset