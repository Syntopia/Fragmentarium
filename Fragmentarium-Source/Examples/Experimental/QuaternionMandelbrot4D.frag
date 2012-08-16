#info 4D Quaternion Mandelbrot Distance Estimator
#include "DE-Raytracer.frag"
#group 4D Quaternion Mandelbrot

// This is Mandelbrot variation 
// of the usual 4D Quaternion Julia

// The straight forward implementation 
// yields a boring, symmetriical object,
// but after adding a reflection we
// get some more Mandelbrot like.

// Number of fractal iterations.
uniform int Iterations;  slider[0,16,100]
uniform int ColorIterations;  slider[0,16,100]
// Breakout distance
uniform float Threshold; slider[0,10,100]

float DE(vec3 pos) {
	vec4 p = vec4(pos, 0.0);
	vec4 dp = vec4(1.0, 0.0,0.0,0.0);
	for (int i = 0; i < Iterations; i++) {
		dp = 2.0* vec4(p.x*dp.x-dot(p.yzw, dp.yzw), p.x*dp.yzw+dp.x*p.yzw+cross(p.yzw, dp.yzw));
		p = vec4(p.x*p.x-dot(p.yzw, p.yzw), vec3(2.0*p.x*p.yzw)) +  vec4(pos, 0.0);
		p.yz = -p.zy;
		float p2 = dot(p,p);
		if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(p.xyz,p2)));
		if (p2 > Threshold) break;
	}
	float r = length(p);
	return  0.5 * r * log(r) / length(dp);
}

#preset Default
FOV = 0.395066
Eye = -2.10264,0.481391,-1.87105
Target = 3.83279,-1.75531,5.85993
Up = 0.258595,-0.856591,-0.446362
EquiRectangular = false
FocalPlane = 1
Aperture = 0
Gamma = 1.99075
ToneMapping = 3
Exposure = 1
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 2
Detail = -3.84069
DetailAO = 0
FudgeFactor = 0.13253
MaxRaySteps = 505
BoundingSphere = 1.887
Dither = 0.45614
NormalBackStep = 1
AO = 0,0,0,0.7
Specular = 3.4177
SpecularExp = 18.75
SpecularMax = 10
SpotLight = 1,1,1,0.90217
SpotLightDir = -1,-1
CamLight = 1,1,1,1.38462
CamLightMin = 0.16667
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.0537
HardShadow = 0.38469
ShadowSoft = 2
Reflection = 0
DebugSun = false
BaseColor = 1,1,1
OrbitStrength = 0.23377
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.22222
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 16
ColorIterations = 1
Threshold = 10
#endpreset

#preset Head
FOV = 0.386562
Eye = -1.58406,0.866578,0.987887
Target = -0.83715,-5.80364,-6.42496
Up = 0.0169502,0.743323,-0.668718
AntiAlias = 1
Detail = -3.09736
DetailAO = -1.07142
FudgeFactor = 0.66355
MaxRaySteps = 104
BoundingSphere = 2.5301
Dither = 0.52632
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = -0.37142,0.1
CamLight = 1,1,1,1
CamLightMin = 0.16667
Glow = 1,1,1,0
Fog = 0.1
HardShadow = 0.38462
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.71287
X = 0.666667,0.666667,0.498039,0.9685
Y = 1,0.898039,0.380392,0.6693
Z = 0.8,0.78,1,0.87402
R = 0.4,0.7,1,0.5873
BackgroundColor = 0.662745,0.666667,0.619608
GradientBackground = 0.42855
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 16
ColorIterations = 1
Threshold = 10
#endpreset

#preset Head2
FOV = 0.4
Eye = -1.94175,0.00857647,0.0672265
Target = 7.42812,-0.640464,-3.36561
Up = 0.0790299,0.9594,0.270749
AntiAlias = 1
Detail = -3.47445
DetailAO = -1.07142
FudgeFactor = 0.6542
MaxRaySteps = 374
BoundingSphere = 2
Dither = 0.73913
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 21.875
SpotLight = 1,1,1,0.65217
SpotLightDir = 0.04762,0.42858
CamLight = 1,1,1,1
CamLightMin = 0.16667
Glow = 1,0,0,0.2193
Fog = 0.99328
HardShadow = 0.38462
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.88119
X = 0.5,0.6,0.6,0.6378
Y = 1,0.6,0,0.77952
Z = 0.8,0.78,1,0.73228
R = 0.4,0.7,1,0.12
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 17
ColorIterations = 1
Threshold = 10
#endpreset

#preset Zoom
FOV = 0.395066
Eye = 0.126192,0.974287,-0.361537
Target = -1.41868,-7.78243,-4.07394
Up = -0.765543,-0.107536,0.634334
AntiAlias = 1
Detail = -2.91151
DetailAO = -1.07142
FudgeFactor = 0.75701
MaxRaySteps = 242
BoundingSphere = 2
Dither = 0.5797
AO = 0,0,0,0.7
Specular = 5.4167
SpecularExp = 18.75
SpotLight = 1,1,1,0.90217
SpotLightDir = 0.29524,0.1
CamLight = 1,1,1,0.66667
CamLightMin = 0.16667
Glow = 1,1,1,0
Fog = 0.0537
HardShadow = 0.38462
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.22222
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 18.1816
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 20
ColorIterations = 1
Threshold = 10
#endpreset
