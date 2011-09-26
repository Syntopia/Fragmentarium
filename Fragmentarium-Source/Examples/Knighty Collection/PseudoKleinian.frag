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
FOV = 0.4
Eye = 1.44674,0.992411,-0.508827
Target = -6.48071,-4.29218,1.79272
Up = -0.249032,-0.0455802,-0.967422
AntiAlias = 1
Detail = -3.22126
DetailAO = -0.85715
FudgeFactor = 0.91566
MaxRaySteps = 56
BoundingSphere = 2
Dither = 0
AO = 0,0,0,0.7
Specular = 0
SpecularExp = 16
SpotLight = 1,1,1,0.72857
SpotLightDir = 0.73494,0.1
CamLight = 1,1,1,1.40846
CamLightMin = 0.24706
Glow = 1,1,1,0
Fog = 0.4567
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.82278
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.75
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 1.59086
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
MI = 5
Size = 1
CSize = 0.97478,1.04202,0.97478
C = -0.05972,0.1492,-0.29852
TThickness = 0.01
DEoffset = 0
Offset = 0.43636,0.85454,-0.14546
#endpreset

#preset P3
FOV = 0.704
Eye = 0.303257,0.820564,0.919448
Target = -3.89337,-5.8851,-5.45029
Up = -0.670294,-0.251349,0.698233
AntiAlias = 1
Detail = -2.35396
DetailAO = -0.5
FudgeFactor = 1
MaxRaySteps = 56
BoundingSphere = 10
Dither = 0.39474
AO = 0,0,0,0.7
Specular = 3.9796
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = 0.90362,0.51808
CamLight = 1,1,1,1.57746
CamLightMin = 0
Glow = 1,1,1,0
Fog = 0.3937
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.67089
X = 0.5,0.6,0.6,1
Y = 1,0.6,0,-0.33334
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.5
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 1.35415
CycleColors = true
Cycles = 0.1
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
MI = 10
Size = 1
CSize = 0.92436,0.90756,0.92436
C = 0,0,0
TThickness = 0.01
DEoffset = 0
Offset = 0,0,0
#endpreset

#preset Kleinian Forest
FOV = 0.704
Eye = 0.283723,-6.59501,-1.81637
Target = 4.12873,-10.9499,-1.64165
Up = -0.19481,-0.132618,0.971834
AntiAlias = 1
Detail = -2.10616
DetailAO = -0.35357
FudgeFactor = 0.90361
MaxRaySteps = 605
BoundingSphere = 10
Dither = 0.45614
AO = 0,0,0,0.7
Specular = 1.9588
SpecularExp = 16
SpotLight = 1,1,1,0.81159
SpotLightDir = 0.90362,0.51808
CamLight = 1,1,1,2
CamLightMin = 0.40476
Glow = 1,1,1,0
Fog = 0.4127
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.67089
X = 0.666667,0.666667,0.498039,1
Y = 1,0.933333,0.419608,1
Z = 0,1,0.498039,-0.73076
R = 0.0588235,0.454902,0.137255,0.26214
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 1.35415
CycleColors = false
Cycles = 0.1
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
MI = 10
Size = 1.12
CSize = 0.9322,0.90756,0.92436
C = 1.86088,-0.01504,-0.10528
TThickness = 0.01
DEoffset = 0.00095
Offset = 0.2088,0.2844,-0.16484
#endpreset
