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
Up = -0.909443,0.284621,-0.298287
AntiAlias = 1
AntiAliasBlur = 1
Detail = -1.68616
DetailNormal = -2.55773
FudgeFactor = 0.916
MaxRaySteps = 112
MaxRayStepsDiv = 2.88
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.96721
Specular = 1.4167
SpecularExp = 18.8
SpotLight = 1,1,1,0.17391
SpotLightDir = 0.31428,0.1
CamLight = 1,1,1,1.41936
Glow = 0.835294,0.0784314,0.0784314,0
Fog = 0
BaseColor = 1,1,1
OrbitStrength = 0.515
X = 0.6,0.0117647,0.0117647,0.59056
Y = 1,0.6,0,0.44882
Z = 1,1,1,0.49606
R = 0.666667,0.666667,0.498039,0.07936
BackgroundColor = 0.666667,0.666667,0.498039
GradientBackground = 0.3
Scale = 2
Offset = 1,0,0
Angle1 = 0
Rot1 = 1,1,1
Angle2 = 0
Rot2 = 1,1,1
Iterations = 13
CycleColors = false
#endpreset

#preset O1
FOV = 0.62536
Eye = -0.796392,-0.04945,-0.435036
Target = 5.93227,1.32302,5.16583
Up = -0.708965,0.309414,0.633745
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.27005
DetailNormal = -2.555
FudgeFactor = 0.981
MaxRaySteps = 154
MaxRayStepsDiv = 1.8
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
Glow = 1,1,1,0
Fog = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
Scale = 1.72
Offset = 0.676,0.257,0.029
Angle1 = -119.16
Rot1 = 0.4,0.186,0
Angle2 = -180
Rot2 = -0.472,1,-0.628
Iterations = 16
#endpreset

#preset G1
FOV = 0.510513
Eye = -0.149949,0.84958,-0.286442
Target = 0.927461,-8.60351,2.79224
Up = -0.963632,-0.175437,-0.201447
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.59212
MaxStep = -0.3
DetailNormal = -2.76745
DetailAO = -1.14751
FudgeFactor = 1
MaxRaySteps = 112
MaxRayStepsDiv = 0
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
HardShadow = 1
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
Scale = 1.97532
Offset = 0.48,0,0.2
Angle1 = -123.16
Rot1 = 0.87342,0.97468,-0.41772
Angle2 = -15.7896
Rot2 = -0.97468,1,0.06328
Iterations = 21
ColorIterations = 5
#endpreset

#preset
FOV = 0.510513
Eye = -0.0544829,0.365389,1.03001
Target = 2.75913,-4.52394,-7.22699
Up = 0.334023,-0.756725,0.56191
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.59212
MaxStep = -0.3
DetailNormal = -2.76745
DetailAO = -1.14751
FudgeFactor = 1
MaxRaySteps = 112
MaxRayStepsDiv = 0
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,1
Specular = 3.3898
SpecularExp = 51.429
SpotLight = 1,1,1,0.77419
SpotLightDir = -0.95456,0.1
CamLight = 1,1,1,1
CamLightMin = 0.32609
Glow = 1,1,1,1
Fog = 0.93182
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.825
X = 0.666667,0.666667,0,-0.18182
Y = 0.666667,0.666667,0.498039,0.81818
Z = 0,0.333333,0,1
R = 0.415686,0.705882,0.0352941,0.23076
BackgroundColor = 0.666667,0.666667,0.6
GradientBackground = 0.3
CycleColors = false
Cycles = 0.1
Scale = 1.97532
Offset = 0.65333,0.06666,0.2
Angle1 = -97.8948
Rot1 = 0.21516,-0.0633,-0.79746
Angle2 = -53.6832
Rot2 = 1,1,-0.18988
Iterations = 21
ColorIterations = 5
#endpreset

#preset K1
FOV = 0.62536
Eye = 0.0901375,0.683275,-0.124312
Target = -4.23589,-6.39109,3.0054
Up = -0.844425,0.329771,-0.42179
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.43488
MaxStep = -0.3
DetailNormal = -3.15854
DetailAO = -1.26
FudgeFactor = 0.63529
MaxRaySteps = 104
MaxRayStepsDiv = 1.8
BoundingSphere = 2
Dither = 0.5
AO = 0.796,0,0,0
Specular = 0.9184
SpecularExp = 28.376
SpotLight = 1,1,1,0.82857
SpotLightDir = -1,0.1
CamLight = 1,1,1,1.04226
CamLightMin = 0.49412
Glow = 0.180392,0.2,0.133333,0.31522
Fog = 0.09448
HardShadow = 0.55952
BaseColor = 1,1,1
OrbitStrength = 0.6962
X = 0,0.0666667,0.67451,1
Y = 0.776471,0,0.0117647,1
Z = 0.258824,0.423529,0.27451,0.5619
R = 0.333333,0.666667,0,0.48076
BackgroundColor = 0.6,0.572549,0.494118
GradientBackground = 0.3
CycleColors = true
Cycles = 8.44785
Scale = 1.72
Offset = 0.676,0.257,0.029
Angle1 = -119.999
Rot1 = 0.4,0.186,0.258
Angle2 = -97.92
Rot2 = -0.472,1,-0.628
Iterations = 21
ColorIterations = 13
#endpreset

#preset kl1
FOV = 0.62536
Eye = 0.0901375,0.683275,-0.124312
Target = -4.2489,-6.81085,1.76436
Up = -0.747327,0.280945,-0.60214
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.43488
MaxStep = -0.3
DetailNormal = -3.15854
DetailAO = -0.7
FudgeFactor = 0.63529
MaxRaySteps = 104
MaxRayStepsDiv = 1.8
BoundingSphere = 2
Dither = 0.5
AO = 0.0588235,0.0588235,0.0431373,0.71
Specular = 0.9184
SpecularExp = 28.376
SpotLight = 1,1,1,0.82857
SpotLightDir = 0.3976,0.1
CamLight = 1,1,1,1.0704
CamLightMin = 0.49412
Glow = 0.180392,0.2,0.133333,0.67391
Fog = 0.09448
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.6962
X = 0,0.0666667,0.67451,0.48572
Y = 0.776471,0,0.0117647,1
Z = 0.258824,0.423529,0.27451,-0.9429
R = 0.333333,0.666667,0,0.59616
BackgroundColor = 0.6,0.572549,0.494118
GradientBackground = 0.3
CycleColors = true
Cycles = 8.44785
Scale = 1.72
Offset = 0.68421,0.42105,0.23684
Angle1 = -119.999
Rot1 = 0.4,0.186,0.258
Angle2 = -97.92
Rot2 = -0.472,1,-0.628
Iterations = 21
ColorIterations = 13
#endpreset

#preset
FOV = 0.4
Eye = -1.41372,2.32619,1.26213
Target = 3.48633,-5.58596,-2.39675
Up = -0.795124,-0.233654,-0.559582
AntiAlias = 1
AntiAliasBlur = 1
Detail = -1.68616
MaxStep = -0.3
DetailNormal = -2.55773
DetailAO = -0.7
FudgeFactor = 0.916
MaxRaySteps = 112
MaxRayStepsDiv = 2.88
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.96721
Specular = 1.4167
SpecularExp = 18.8
SpotLight = 1,1,1,0.17391
SpotLightDir = 0.31428,0.1
CamLight = 1,1,1,1.41936
CamLightMin = 0.49412
Glow = 0.835294,0.0784314,0.0784314,0
Fog = 0
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.515
X = 0.6,0.0117647,0.0117647,0.59056
Y = 1,0.6,0,0.44882
Z = 1,1,1,0.49606
R = 0.666667,0.666667,0.498039,0.07936
BackgroundColor = 0.666667,0.666667,0.498039
GradientBackground = 0.3
CycleColors = false
Cycles = 8.44785
Scale = 1.56668
Offset = 1,0,1
Angle1 = 33.75
Rot1 = 1,0.8983,-0.0339
Angle2 = 22.5
Rot2 = 0.28814,0.15254,0.45762
Iterations = 13
ColorIterations = 13
#endpreset

#preset lk1
FOV = 0.62536
Eye = 0.0901375,0.683275,-0.124312
Target = -4.23945,-7.00916,0.674044
Up = -0.712652,0.337261,-0.615127
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.43488
MaxStep = -0.3
DetailNormal = -3.15854
DetailAO = -0.7
FudgeFactor = 0.63529
MaxRaySteps = 104
MaxRayStepsDiv = 1.8
BoundingSphere = 2
Dither = 0.5
AO = 0.0588235,0.0588235,0.0431373,0.71
Specular = 0.9184
SpecularExp = 28.376
SpotLight = 1,1,1,0.82857
SpotLightDir = 0.3976,0.1
CamLight = 1,1,1,1.0704
CamLightMin = 0.49412
Glow = 0.180392,0.2,0.133333,0.67391
Fog = 0.09448
HardShadow = 1
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
Scale = 1.72
Offset = 0.68421,0.42105,0.23684
Angle1 = -119.999
Rot1 = 0.4,0.186,0.258
Angle2 = 29.9988
Rot2 = -0.472,1,-0.628
Iterations = 21
ColorIterations = 13
#endpreset

#preset LKJ
FOV = 0.62536
Eye = 0.0901375,0.683275,-0.124312
Target = -6.40074,-5.3511,-0.229935
Up = -0.528796,0.579652,-0.619983
AntiAlias = 1
AntiAliasBlur = 1
Detail = -4.32173
MaxStep = -0.3
DetailNormal = -3.07314
DetailAO = -2.1
FudgeFactor = 0.63529
MaxRaySteps = 104
MaxRayStepsDiv = 1.8
BoundingSphere = 2
Dither = 0.5
AO = 0.0588235,0.0588235,0.0431373,0.71
Specular = 0.9184
SpecularExp = 28.376
SpotLight = 1,1,1,0.82857
SpotLightDir = 0.3253,-0.08434
CamLight = 1,1,1,1.0704
CamLightMin = 0.49412
Glow = 0.0627451,0.168627,0.2,0.45652
Fog = 0.20472
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.6962
X = 0,0.0666667,0.67451,0.2381
Y = 0.776471,0,0.0117647,1
Z = 0.258824,0.423529,0.27451,-0.71432
R = 0.333333,0.666667,0,0.59616
BackgroundColor = 0.6,0.572549,0.494118
GradientBackground = 0.3
CycleColors = true
Cycles = 9.64086
Scale = 1.53332
Offset = 0.68421,0.42105,0.23684
Angle1 = -119.999
Rot1 = 0.42372,-0.1017,0.33898
Angle2 = 29.9988
Rot2 = -0.472,1,-0.628
Iterations = 26
ColorIterations = 13
#endpreset

#preset ok
FOV = 0.62536
Eye = -0.0324847,0.525321,-0.120522
Target = -3.95635,-7.3302,1.08376
Up = -0.75016,0.283094,-0.597594
AntiAlias = 1
AntiAliasBlur = 1
Detail = -4.32173
MaxStep = -0.3
DetailNormal = -3.07314
DetailAO = -2.1
FudgeFactor = 0.63529
MaxRaySteps = 104
MaxRayStepsDiv = 1.8
BoundingSphere = 2
Dither = 0.5
AO = 0.0588235,0.0588235,0.0431373,0.71
Specular = 0.9184
SpecularExp = 28.376
SpotLight = 1,1,1,0.82857
SpotLightDir = 0.3253,-0.08434
CamLight = 1,1,1,1.0704
CamLightMin = 0.49412
Glow = 0.0627451,0.168627,0.2,0.45652
Fog = 0.20472
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.6962
X = 0,0.0666667,0.67451,0.2381
Y = 0.776471,0,0.0117647,1
Z = 0.258824,0.423529,0.27451,-0.71432
R = 0.333333,0.666667,0,0.59616
BackgroundColor = 0.6,0.572549,0.494118
GradientBackground = 0.3
CycleColors = true
Cycles = 20.9704
Scale = 1.53332
Offset = 0.48246,0.09649,0.15789
Angle1 = -119.999
Rot1 = 1,-0.5085,0.44068
Angle2 = 29.9988
Rot2 = 0.50848,1,-0.628
Iterations = 26
ColorIterations = 13
#endpreset

#preset
FOV = 0.510513
Eye = -0.530085,-0.440845,0.238458
Target = 7.43621,1.95317,-5.31193
Up = 0.413939,0.453084,0.789538
AntiAlias = 1
AntiAliasBlur = 1
Detail = -4.68699
MaxStep = -0.3
DetailNormal = -4.18292
DetailAO = -1.14751
FudgeFactor = 1
MaxRaySteps = 112
MaxRayStepsDiv = 0
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
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 0.4557
X = 0.6,0.0117647,0.0117647,-0.00952
Y = 1,0.6,0,-0.50476
Z = 1,0.223529,0.168627,-0.61904
R = 0.223529,0.666667,0.156863,0.53846
BackgroundColor = 0.666667,0.666667,0.6
GradientBackground = 0.3
CycleColors = true
Cycles = 7.55366
Scale = 1.96668
Offset = 0.66667,0.28947,0.20175
Angle1 = -119.999
Rot1 = 1,1,-0.42372
Angle2 = -15.0048
Rot2 = -0.40678,0.11864,-0.22034
Iterations = 23
ColorIterations = 5
#endpreset

#preset cold
FOV = 0.4
Eye = 0.583396,-0.912759,-0.528688
Target = -3.9707,7.14828,3.25018
Up = 0.339291,0.549528,-0.763351
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.8609
MaxStep = -0.3
DetailNormal = -2.55773
DetailAO = -1.68
FudgeFactor = 0.916
MaxRaySteps = 112
MaxRayStepsDiv = 2.88
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
Scale = 1.66668
Offset = 0.94737,0.32456,0.12281
Angle1 = 18.7488
Rot1 = -0.42372,1,1
Angle2 = 180
Rot2 = 0.49152,0.81354,11.7
Iterations = 17
ColorIterations = 3
#endpreset