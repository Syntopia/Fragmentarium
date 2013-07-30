#info Notice: set Render mode to Continous
#infoTheli-at's Pseudo Kleinian (Scale 1 JuliaBox + Something
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group PseudoKleinian

#define USE_INF_NORM

// Made by Knighty, see this thread:
// http://www.fractalforums.com/3d-fractal-generation/fragmentarium-an-ide-for-exploring-3d-fractals-and-other-systems-on-the-gpu/msg32270/#msg32270

// Maximum iterations
uniform int MI; slider[0,5,20]

// Bailout
//uniform float Bailout; slider[0,20,1000]

// Size
uniform float Size; slider[0,1,2]

// Cubic fold Size
uniform vec3 CSize; slider[(0,0,0),(1,1,1),(2,2,2)]

// Julia constant
uniform vec3 C; slider[(-2,-2,-2),(0,0,0),(2,2,2)]

// Thingy thickness
uniform float TThickness; slider[0,0.01,2]

// Thingy DE Offset
uniform float DEoffset; slider[0,0,0.01]

// Thingy Translation
uniform vec3 Offset; slider[(-1,-1,-1),(0,0,0),(1,1,1)]

float RoundBox(vec3 p, vec3 csize, float offset)
{
	vec3 di = abs(p) - csize;
	float k=max(di.x,max(di.y,di.z));
	return abs(k*float(k<0.)+ length(max(di,0.0))-offset);
}

float Thingy(vec3 p, float e){
	p-=Offset;
	return (abs(length(p.xy)*p.z)-e) / sqrt(dot(p,p)+abs(e));
}

float Thing2(vec3 p){
//Just scale=1 Julia box
	float DEfactor=1.;
   	vec3 ap=p+1.;
	for(int i=0;i<MI && ap!=p;i++){
		ap=p;
		p=2.*clamp(p, -CSize, CSize)-p;
      
		float r2=dot(p,p);
		orbitTrap = min(orbitTrap, abs(vec4(p,r2)));
		float k=max(Size/r2,1.);

		p*=k;DEfactor*=k;
      
		p+=C;
		orbitTrap = min(orbitTrap, abs(vec4(p,dot(p,p))));
	}
	//Call basic shape and scale its DE
	//return abs(0.5*Thingy(p,TThickness)/DEfactor-DEoffset);
	
	//Alternative shape
	//return abs(0.5*RoundBox(p, vec3(1.,1.,1.), 1.0)/DEfactor-DEoffset);
	//Just a plane
	return abs(0.5*abs(p.z-Offset.z)/DEfactor-DEoffset);
}

float DE(vec3 p){
	return  Thing2(p);//RoundBox(p, CSize, Offset);
}

#preset Default
FOV = 0.54166
Eye = 0.482529,2.90462,2.51987
Target = -9.25067,0.0356616,2.95014
Up = 0.0415153,0.00112303,0.999137
EquiRectangular = false
FocalPlane = 0.8108
Aperture = 0.0122
Gamma = 2.08335
ToneMapping = 3
Exposure = 1.19388
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 2
Detail = -2.35396
DetailAO = -0.5
FudgeFactor = 1
MaxRaySteps = 56
Dither = 0.39474
NormalBackStep = 1
AO = 0,0,0,0.7
SpecularExp = 16
CamLight = 1,1,1,1.57746
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.37038
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,1
Y = 1,0.6,0,-0.33334
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.5
BackgroundColor = 0,0.333333,1
GradientBackground = 0
CycleColors = true
Cycles = 10.29
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
MI = 12
Size = 1.15094
CSize = 0.92436,1.21212,1.0101
C = 0.21052,0.3158,-0.03508
TThickness = 0.01
DEoffset = 0
Offset = 0.88888,0,0
Specular = 0.4
SpecularMax = 10
SpotLight = 1,1,1,0.4
SpotLightDir = 0.1,0.1
HardShadow = 0
ShadowSoft = 2
DebugSun = false
#endpreset

#preset p2
FOV = 0.54166
Eye = 0.826463,2.87544,1.92469
Target = 8.52696,9.23615,0.0821573
Up = 0.142354,0.112517,0.983367
AntiAlias = 1
Detail = -2.50523
DetailAO = -0.5
FudgeFactor = 0.70769
MaxRaySteps = 137
BoundingSphere = 10
Dither = 0.39474
NormalBackStep = 1
AO = 0,0,0,0.7
Specular = 5
SpecularExp = 16
SpotLight = 1,0.172549,0.172549,0.375
SpotLightDir = 1,0.08108
CamLight = 1,1,1,0.96
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.37038
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,1
Y = 1,0.6,0,0.78948
Z = 0.8,0.78,1,0.5
R = 1,0.666667,0,0.81334
BackgroundColor = 0,0.333333,1
GradientBackground = 0
CycleColors = true
Cycles = 10.29
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
MI = 15
Size = 1.14664
CSize = 0.91112,1.08888,0.93334
C = 0.28572,0.3238,-0.05716
TThickness = 0.01
DEoffset = 0
Offset = 0.88888,0.4568,0.03704
FocalPlane = 0.4054
Aperture = 0.0122
#endpreset

#preset P
FOV = 0.54166
Eye = 2.64306,5.47113,2.51499
Target = -0.194884,13.1568,8.51726
Up = -0.14286,0.604253,-0.783881
AntiAlias = 1
Detail = -3.34516
DetailAO = -0.5
FudgeFactor = 1
MaxRaySteps = 132
BoundingSphere = 10
Dither = 0.52632
NormalBackStep = 1
AO = 0,0,0,0.7
Specular = 3.9796
SpecularExp = 16
SpotLight = 1,1,1,0.42647
SpotLightDir = 0.90362,0.51808
CamLight = 1,1,1,1.57746
CamLightMin = 0
Glow = 1,1,1,0.13333
GlowMax = 20
Fog = 0.37038
HardShadow = 0
ShadowSoft = 2
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,1
Y = 1,0.6,0,-0.33334
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.5
BackgroundColor = 0,0.333333,1
GradientBackground = 0
CycleColors = true
Cycles = 10.29
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
MI = 10
Size = 2
CSize = 0.92308,1.67522,1.84616
C = 0.37456,0.61576,0.1212
DEoffset = 0
FocalPlane = 1.46739
Aperture = 0.014
AntiAliasScale = 1
TThickness = 0.01
Offset = 1,0,0
#endpreset