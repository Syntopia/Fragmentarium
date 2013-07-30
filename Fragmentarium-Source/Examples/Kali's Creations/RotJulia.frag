// Output generated from file: C:/Fractales/Fragmentarium Windows Binary v0.9.12b/Examples/rotajulia3d.frag
// Created: lun 1. oct 01:36:29 2012
#info Mandelbulb without Distance Estimator

#define providesInside
#include "Brute-Raytracer.frag"

#include "MathUtils.frag"
#include "Complex.frag"



#group RotJulia

// Number of fractal iterations.
uniform int Iterations;  slider[0,9,100]

// Number of color iterations.
uniform int ColorIterations;  slider[0,9,100]

// Mandelbulb exponent (8 is standard)
uniform float Power; slider[0,8,16]

// Bailout radius
uniform float Bailout; slider[0,5,3000]
uniform float Scale; slider[0,1,2]

uniform bool FoldX; checkbox[false]
uniform bool FoldY; checkbox[false]
uniform bool FoldZ; checkbox[false]


uniform vec3 RotVector; slider[(0,0,0),(0,1,0),(1,1,1)]

uniform float RotAngle; slider[0.00,0,180]
uniform vec3 JuliaC; slider[(-2,-2,-2),(0,0,0),(2,2,2)]
uniform bool RotateC; checkbox[false]
uniform bool Inversion; checkbox[false]

// Compute the distance from `pos` to the Mandelbox.

mat3 rot;


bool inside(vec3 pos) {
	orbitTrap=10000;
	vec3 z;
	if (Inversion) {
		z=pos/dot(pos,pos);
	} else {
		z=pos;
	}
	int i=0;
	rot=rotationMatrix3(normalize(RotVector),RotAngle);	
	vec3 j=JuliaC;
	while (i<Iterations) {
		if (FoldX) z.x=abs(z.x);		
		if (FoldY) z.y=abs(z.y);
		if (FoldZ) z.z=abs(z.z);
		z.xy=cPower(z.xy,Power);
		z*=rot;
		if (RotateC) j*=rot;
		z*=Scale;
		z+=j;
		i++;
		float r=length(z);
		if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,r*r)));
             if ( r>Bailout) {
			return false;
		}
	}
	return true;
}


#preset default
FOV = 0.50406
Eye = 0.419359,-0.712233,0.0791225
Target = 1.40107,2.51941,-8.11364
Up = -0.522846,0.813598,0.254342
EquiRectangular = false
Gamma = 1
ToneMapping = 1
Exposure = 1
Brightness = 1
Contrast = 1
Saturation = 1
NormalScale = 1
AOScale = 1
Glow = 0
AOStrength = 1
Samples = 50
Stratify = true
DebugInside = false
CentralDifferences = true
SampleNeighbors = true
Near = 0.31584
Far = 1.377
ShowDepth = false
DebugNormals = false
Specular = 0.9375
SpecularExp = 15.278
SpotLight = 1,1,1,1
SpotLightDir = 0.25926,1
CamLight = 1,1,1,0
CamLightMin = 0
Fog = 2
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.63106
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
Iterations = 40
ColorIterations = 0
Power = 2
Bailout = 3000
Scale = 0.98306
RotVector = 1,1,0
RotAngle = 60
JuliaC = -0.3,0,0
RotateC = false
Inversion = false
FoldX = false
FoldY = false
FoldZ = false

#endpreset



#preset Asteroid
FOV = 0.50406
Eye = -0.276039,0.726985,0.274523
Target = 1.4217,-4.59218,-6.60681
Up = -0.0350064,0.786427,-0.616533
EquiRectangular = false
Gamma = 1
ToneMapping = 1
Exposure = 1
Brightness = 1
Contrast = 1
Saturation = 1
NormalScale = 1
AOScale = 1.84465
Glow = 0
AOStrength = 1
Samples = 100
Stratify = true
DebugInside = false
CentralDifferences = true
SampleNeighbors = true
Near = 0
Far = 1.77048
ShowDepth = false
DebugNormals = false
Specular = 0.9375
SpecularExp = 15.278
SpotLight = 1,1,1,1
SpotLightDir = 0.58024,0.92592
CamLight = 1,1,1,.3
CamLightMin = 0
Fog = 1.984
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,0.65048
Y = 1,0.6,0,0.82524
Z = 0.8,0.78,1,0.45632
R = 0.4,0.7,1,0.2745
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 19.2377
Iterations = 20
ColorIterations = 10
Power = 2
Bailout = 96.78
Scale = 1.62712
RotVector = 0.96875,0.54167,0.20833
RotAngle = 74.4822
JuliaC = 0.48648,-0.5946,-0.12612
RotateC = false
Inversion = false
FoldX = false
FoldY = false
FoldZ = false

#endpreset



#preset Fantasy
FOV = 0.84552
Eye = 0.34208,-0.749514,-1.6102
Target = -2.00391,5.82363,3.85045
Up = 0.125133,0.66003,-0.740739
EquiRectangular = false
Gamma = 1
ToneMapping = 1
Exposure = 1
Brightness = 1
Contrast = 1
Saturation = 1
NormalScale = 1
AOScale = 0.534
Glow = 0
AOStrength = 1
Samples = 25
Stratify = true
DebugInside = false
CentralDifferences = true
SampleNeighbors = true
Near = 0
Far = 2.16396
ShowDepth = false
DebugNormals = false
Specular = 1.0417
SpecularExp = 11.111
SpotLight = 1,1,1,0.61765
SpotLightDir = 0.58004,0.53086
CamLight = 1,1,1,0.09818
CamLightMin = 0.44578
Fog = 1.984
BaseColor = 1,1,1
OrbitStrength = 0.76623
X = 0.666667,0,0,1
Y = 0,0,0.498039,1
Z = 1,1,0.498039,0.61166
R = 1,1,1,0.2745
BackgroundColor = 0.435294,0.321569,0.341176
GradientBackground = 0.65215
CycleColors = false
Cycles = 14.0735
Iterations = 10
ColorIterations = 10
Power = 6
Bailout = 3000
Scale = 1.0134
RotVector = 1,1,0
RotAngle = 25
JuliaC = -0.26596,-0.03404,-0.09008
RotateC = true
Inversion = false
FoldX = false
FoldY = false
FoldZ = false

#endpreset



#preset Cave
FOV = 0.61788
Eye = -0.575716,0.32432,0.6197
Target = 6.88663,3.89434,-4.99887
Up = 0.187338,-0.922529,-0.337357
EquiRectangular = false
Gamma = 1
ToneMapping = 1
Exposure = 1
Brightness = 1
Contrast = 1
Saturation = 1
NormalScale = 0.5294
AOScale = 1.5534
Glow = 0.18333
AOStrength = 0.9999
Samples = 30
Stratify = true
DebugInside = false
CentralDifferences = true
SampleNeighbors = true
Near = 0
Far = 4.81968
ShowDepth = false
DebugNormals = false
Specular = 3.125
SpecularExp = 6.944
SpotLight = 1,1,1,0.38235
SpotLightDir = -0.65432,0.1605
CamLight = 1,1,1,0
CamLightMin = 0.44578
Fog = 1.984
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.333333,0.666667,0.498039,0.08738
Y = 1,0.666667,0,1
Z = 1,0,0,1
R = 1,1,1,0.15686
BackgroundColor = 0,0,0
GradientBackground = 0.65215
CycleColors = false
Cycles = 14.0735
Iterations = 30
ColorIterations = 10
Power = 2
Bailout = 741.93
Scale = 0.8983
RotVector = 1,0,0
RotAngle = 90
JuliaC = -0.73872,0,0
RotateC = false
Inversion =true
FoldX = false
FoldY = false
FoldZ = false
#endpreset

#preset Inversion&Fold
FOV = 0.61788
Eye = -1.04518,0.175786,-1.04341
Target = 7.9507,-1.41195,3.02517
Up = 0.375537,-0.188028,-0.903711
EquiRectangular = false
Gamma = 1
Exposure = 1
Brightness = 1
Contrast = 1
Saturation = 1
SpecularExp = 6.944
SpotLight = 1,1,1,0.38235
SpotLightDir = -0.4568,0.18518
CamLight = 1,1,1,0
CamLightMin = 0.44578
Fog = 1.984
BaseColor = 1,1,1
OrbitStrength = 0.80519
X = 0.333333,0.666667,0.498039,0.08738
Y = 1,0.666667,0,1
Z = 1,0,0,1
R = 1,1,1,0.15686
BackgroundColor = 0,0,0
GradientBackground = 0.65215
CycleColors = false
Cycles = 14.0735
ToneMapping = 1
NormalScale = 0.5294
AOScale = 1.5534
Glow = 0.18333
AOStrength = 0.9999
Samples = 30
Stratify = true
DebugInside = false
CentralDifferences = true
SampleNeighbors = true
Near = 0
Far = 4.81968
ShowDepth = false
DebugNormals = false
Specular = 3.125
Iterations = 16
ColorIterations = 6
Power = 2
Bailout = 741.93
Scale = 1.49152
RotVector = 0.80208,0.38542,1
RotAngle = 10.3446
JuliaC = -0.30632,-0.16216,-0.4144
RotateC = true
Inversion = true
FoldX = true
FoldY = true
FoldZ = true
#endpreset