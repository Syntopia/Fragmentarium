#info Octahedron Distance Estimator (Syntopia 2010)
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Octahedron
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

uniform float Scale; slider[0.00,2,4.00]

uniform vec3 Offset; slider[(0,0,0),(1,0,0),(1,1,1)]

uniform float Angle1; slider[-180,0,180]
uniform vec3 Rot1; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
uniform float Angle2; slider[-180,0,180]
uniform vec3 Rot2; slider[(-1,-1,-1),(1,1,1),(1,1,1)]


mat3 fracRotation2;
mat3 fracRotation1;

void init() {
	fracRotation2 = rotationMatrix3(normalize(Rot2), Angle2);
	fracRotation1 = rotationMatrix3(normalize(Rot1), Angle1);
}

// Number of fractal iterations.
uniform int Iterations;  slider[0,13,100]
uniform int ColorIterations;  slider[1,13,20]

// The fractal distance estimation calculation
float DE(vec3 z)
{
	float r;
	
	// Iterate to compute the distance estimator.
	int n = 0;
	while (n < Iterations) {
		z *= fracRotation1;
		
		if (z.x+z.y<0.0) z.xy = -z.yx;
		if (z.x+z.z<0.0) z.xz = -z.zx;
		if (z.x-z.y<0.0) z.xy = z.yx;
		if (z.x-z.z<0.0) z.xz = z.zx;
		
		z = z*Scale - Offset*(Scale-1.0);
		z *= fracRotation2;
		
		r = dot(z, z);
            if (n< ColorIterations)  orbitTrap = min(orbitTrap, abs(vec4(z,r)));
		
		n++;
	}
	
	return (length(z) ) * pow(Scale, -float(n));
}

#preset Default
FOV = 0.4
Eye = -0.91199,-2.42234,0.247336
Target = 2.35017,6.98029,-0.726773
Up = -0.914285,0.27406,-0.298287
AntiAlias = 1
Detail = -2.23006
DetailAO = -0.63
FudgeFactor = 0.916
MaxRaySteps = 112
BoundingSphere = 2
Dither = 0.22807
AO = 0,0,0,0.96721
Specular = 1.4167
SpecularExp = 18.8
SpotLight = 1,1,1,0.17391
SpotLightDir = 0.31428,0.1
CamLight = 1,1,1,1.41936
CamLightMin = 0.15294
Glow = 0.835294,0.0784314,0.0784314,0
Fog = 0
HardShadow = 0.13846
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.515
X = 0.6,0.0117647,0.0117647,0.59056
Y = 1,0.6,0,0.44882
Z = 1,1,1,0.49606
R = 0.666667,0.666667,0.498039,0.07936
BackgroundColor = 0.666667,0.666667,0.498039
GradientBackground = 0.3
CycleColors = false
Cycles = 4.27409
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 2
Offset = 1,0,0
Angle1 = 0
Rot1 = 1,1,1
Angle2 = 0
Rot2 = 1,1,1
Iterations = 13
ColorIterations = 13
#endpreset

#preset Artifact (Rose)
FOV = 0.510513
Eye = -0.149949,0.84958,-0.286442
Target = 0.927461,-8.60351,2.79224
Up = -0.96369,-0.175274,-0.201447
AntiAlias = 1
Detail = -2.66371
DetailAO = -0.92855
FudgeFactor = 1
MaxRaySteps = 112
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,1
Specular = 0
SpecularExp = 18.8
SpotLight = 1,1,1,0.17391
SpotLightDir = 0.31428,0.1
CamLight = 1,1,1,1.41936
CamLightMin = 0.32609
Glow = 1,1,1,1
Fog = 0.1591
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.515
X = 0.6,0.0117647,0.0117647,0.59056
Y = 1,0.6,0,1
Z = 1,1,1,0.18182
R = 0.666667,0.666667,0.596078,0.32308
BackgroundColor = 0.666667,0.666667,0.6
GradientBackground = 0.3
CycleColors = false
Cycles = 0.1
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 1.97532
Offset = 0.48,0,0.2
Angle1 = -123.16
Rot1 = 0.87342,0.97468,-0.41772
Angle2 = -15.7896
Rot2 = -0.97468,1,0.06328
Iterations = 21
ColorIterations = 5
#endpreset

#preset Artifact (Bone)
FOV = 0.4
Eye = -1.41372,2.32619,1.26213
Target = 3.48633,-5.58596,-2.39675
Up = -0.7957,-0.231798,-0.559582
AntiAlias = 1
Detail = -2.47786
DetailAO = -0.7
FudgeFactor = 0.916
MaxRaySteps = 112
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.96721
Specular = 1.4167
SpecularExp = 18.8
SpotLight = 1,1,1,0.17391
SpotLightDir = 0.31428,0.1
CamLight = 1,1,1,1.3077
CamLightMin = 0.49412
Glow = 1,0.666667,0,0.50685
Fog = 0
HardShadow = 0.23077
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.515
X = 0.6,0.0117647,0.0117647,0.59056
Y = 1,0.6,0,0.44882
Z = 1,1,1,0.49606
R = 0.666667,0.666667,0.498039,0.07936
BackgroundColor = 1,1,1
GradientBackground = 0.3
CycleColors = false
Cycles = 8.44785
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 1.56668
Offset = 1,0,1
Angle1 = 33.75
Rot1 = 1,0.8983,-0.0339
Angle2 = 22.5
Rot2 = 0.28814,0.15254,0.45762
Iterations = 13
ColorIterations = 13
#endpreset

#preset Skeleton
FOV = 0.62536
Eye = 0.0901375,0.683275,-0.124312
Target = -4.23945,-7.00916,0.674044
Up = -0.728869,0.300614,-0.615127
AntiAlias = 1
Detail = -2.53981
DetailAO = -0.7
FudgeFactor = 0.63529
MaxRaySteps = 104
BoundingSphere = 2
Dither = 0.5
AO = 0.0588235,0.0588235,0.0431373,0.71
Specular = 0.9184
SpecularExp = 28.376
SpotLight = 1,1,1,0.82857
SpotLightDir = 0.3976,0.1
CamLight = 1,1,1,1.0704
CamLightMin = 0.49412
Glow = 0.768627,0.831373,0.870588,0.67391
Fog = 0.09448
HardShadow = 0.32307
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.6962
X = 0,0.0666667,0.67451,0.2381
Y = 0.776471,0,0.0117647,1
Z = 0.258824,0.423529,0.27451,-0.9429
R = 0.333333,0.666667,0,0.59616
BackgroundColor = 0.6,0.572549,0.494118
GradientBackground = 0.3
CycleColors = true
Cycles = 8.44785
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 1.72
Offset = 0.68421,0.42105,0.23684
Angle1 = -119.999
Rot1 = 0.4,0.186,0.258
Angle2 = 29.9988
Rot2 = -0.472,1,-0.628
Iterations = 21
ColorIterations = 13
#endpreset

#preset Blob
FOV = 0.62536
Eye = -0.0324847,0.525321,-0.120522
Target = -3.95635,-7.3302,1.08376
Up = -0.751333,0.279964,-0.597594
AntiAlias = 1
Detail = -2.84956
DetailAO = -1.64283
FudgeFactor = 0.63529
MaxRaySteps = 104
BoundingSphere = 2
Dither = 0.5
AO = 0.0588235,0.0588235,0.0431373,0.71
Specular = 0
SpecularExp = 28.376
SpotLight = 1,1,1,0.98039
SpotLightDir = 0.3253,-0.08434
CamLight = 1,1,1,0.53846
CamLightMin = 0.42424
Glow = 1,1,1,0.17808
Fog = 0.20472
HardShadow = 0.36923
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.61039
X = 0,0.0666667,0.67451,0.08738
Y = 0.666667,0.666667,0.498039,1
Z = 1,1,0,0.68932
R = 0.333333,0.666667,0,0.31372
BackgroundColor = 0.6,0.572549,0.494118
GradientBackground = 0.3
CycleColors = true
Cycles = 20.9704
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 1.53332
Offset = 0.48246,0.09649,0.15789
Angle1 = -119.999
Rot1 = 1,-0.5085,0.44068
Angle2 = 29.9988
Rot2 = 0.50848,1,-0.628
Iterations = 26
ColorIterations = 2
#endpreset

#preset Cold
FOV = 0.4
Eye = 0.583396,-0.912759,-0.528688
Target = -3.86001,7.28385,3.08681
Up = 0.336664,0.526678,-0.780263
AntiAlias = 1
Detail = -2.60183
DetailAO = -1.68
FudgeFactor = 0.916
MaxRaySteps = 112
BoundingSphere = 1.6
Dither = 0.5
AO = 0,0,0,0.96721
Specular = 1.4167
SpecularExp = 18.8
SpotLight = 1,1,1,0.17391
SpotLightDir = 0.31428,0.1
CamLight = 1,1,1,1.41936
CamLightMin = 0
Glow = 0.835294,0.0784314,0.0784314,0
Fog = 0
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.515
X = 0.6,0.0117647,0.0117647,0.59056
Y = 1,0.6,0,0.44882
Z = 1,1,1,0.49606
R = 0.666667,0.666667,0.498039,-0.0577
BackgroundColor = 0.666667,0.666667,0.498039
GradientBackground = 0.3
CycleColors = true
Cycles = 1.1
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 1.66668
Offset = 0.94737,0.32456,0.12281
Angle1 = 18.7488
Rot1 = -0.42372,1,1
Angle2 = 180
Rot2 = 0.49152,0.81354,11.7
Iterations = 17
ColorIterations = 3
#endpreset

#preset Kungsgatan
FOV = 0.60294
Eye = -1.0065,-0.149819,-0.555727
Target = 6.69719,-4.523,0.479286
Up = -0.113918,-0.927365,-0.356394
AntiAlias = 1
Detail = -2.97353
DetailAO = -0.34566
FudgeFactor = 0.65152
MaxRaySteps = 299
BoundingSphere = 2
Dither = 0.25862
AO = 0,0,0,0.7
Specular = 2.2785
SpecularExp = 16
SpotLight = 1,1,1,0.67143
SpotLightDir = 0.78126,0.4375
CamLight = 1,1,1,1.84616
CamLightMin = 0.77273
Glow = 1,1,1,0.26027
Fog = 0.14174
HardShadow = 0.18462
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.411765,0.6,0.560784,-0.40952
Y = 0,0.509804,0,0.29524
Z = 0.666667,0.666667,0.498039,0.50476
R = 0.666667,0.666667,0.498039,0.36538
BackgroundColor = 0.498039,0.584314,0.584314
GradientBackground = 0.17235
CycleColors = true
Cycles = 5.16828
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 1.83332
Offset = 0.99123,0,0.59649
Angle1 = -127.501
Rot1 = 0.42372,-0.0678,0.33898
Angle2 = -71.2512
Rot2 = -0.57628,0.55932,0.44068
Iterations = 18
ColorIterations = 13
#endpreset