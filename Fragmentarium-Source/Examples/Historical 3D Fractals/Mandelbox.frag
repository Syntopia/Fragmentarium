#info Mandelbox Distance Estimator (Rrrola's version).
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Mandelbox

/*
The distance estimator below was originalled devised by Buddhi.
This optimized version was created by Rrrola (Jan Kadlec), http://rrrola.wz.cz/

See this thread for more info: http://www.fractalforums.com/3d-fractal-generation/a-mandelbox-distance-estimate-formula/15/
*/

// Number of fractal iterations.
uniform int Iterations;  slider[0,17,300]
uniform int ColorIterations;  slider[0,3,300]

uniform float MinRad2;  slider[0,0.25,2.0]

// Scale parameter. A perfect Menger is 3.0
uniform float Scale;  slider[-3.0,3.0,5.0]
vec4 scale = vec4(Scale, Scale, Scale, abs(Scale)) / MinRad2;

// precomputed constants

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

// Scale parameter. A perfect Menger is 3.0
uniform float RotAngle; slider[0.00,0,180]

mat3 rot;

void init() {
	 rot = rotationMatrix3(normalize(RotVector), RotAngle);
}

float absScalem1 = abs(Scale - 1.0);
float AbsScaleRaisedTo1mIters = pow(abs(Scale), float(1-Iterations));


// Compute the distance from `pos` to the Mandelbox.
float DE(vec3 pos) {
	vec4 p = vec4(pos,1), p0 = p;  // p.w is the distance estimate
	
	for (int i=0; i<Iterations; i++) {
		p.xyz*=rot;
		p.xyz = clamp(p.xyz, -1.0, 1.0) * 2.0 - p.xyz;  // min;max;mad
		float r2 = dot(p.xyz, p.xyz);
		if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(p.xyz,r2)));
		p *= clamp(max(MinRad2/r2, MinRad2), 0.0, 1.0);  // dp3,div,max.sat,mul
		p = p*scale + p0;
             if ( r2>1000.0) break;
		
	}
	return ((length(p.xyz) - absScalem1) / p.w - AbsScaleRaisedTo1mIters);
}

#preset Inside 1
FOV = 0.62536
Eye = -1.16945,-1.12305,-2.79412
Target = 6.16354,-1.00522,-2.00173
Up = -0.619851,-0.17831,0.764193
AntiAlias = 1
Detail = -3.09736
DetailAO = -0.28574
FudgeFactor = 0.81928
MaxRaySteps = 220
BoundingSphere = 8.5542
Dither = 0.5
AO = 0,0,0,0.7
Specular = 2.4348
SpecularExp = 16
SpotLight = 1,1,1,0.73563
SpotLightDir = -0.52,0.1
CamLight = 1,1,1,1.15384
CamLightMin = 0.15151
Glow = 0.0941176,0.341176,0.87451,0.31507
Fog = 0.5
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.5625
X = 0.411765,0.6,0.560784,-0.21312
Y = 0.666667,0.666667,0.498039,0.86886
Z = 0.666667,0.333333,1,-0.18032
R = 0.4,0.7,1,0.31372
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 7.03846
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
ColorIterations = 2
MinRad2 = 0.25
Scale = 2.39128
RotVector = 1,1,1
RotAngle = 0
#endpreset

#preset Other
FOV = 0.4
Eye = 0.136312,-0.357184,2.20031
Target = -2.1701,4.89792,-1.82586
Up = -0.314748,0.483089,0.817043
AntiAlias = 1
Detail = -2.97353
DetailAO = -0.21074
FudgeFactor = 1
MaxRaySteps = 110
BoundingSphere = 7.5904
Dither = 0.5
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
CamLightMin = 0.15151
Glow = 1,1,1,0
Fog = 0.02684
HardShadow = 0.58462
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 7.03846
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 18
ColorIterations = 3
MinRad2 = 0.0172
Scale = -1.49272
RotVector = 1,1,1
RotAngle = 0
#endpreset

#preset Default
FOV = 0.56284
Eye = -1.80087,13.736,2.87241
Target = -1.52812,3.93906,2.87915
Up = -0.296524,-0.00759792,0.954991
AntiAlias = 1
Detail = -2.35396
DetailAO = -0.28574
FudgeFactor = 1
MaxRaySteps = 105
BoundingSphere = 15.093
Dither = 0.5
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = -0.33334,0.1
CamLight = 1,1,1,1
CamLightMin = 0.4697
Glow = 1,1,1,0.17808
Fog = 0
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.596078,0.6,0.513725
GradientBackground = 0.3
CycleColors = false
Cycles = 7.03846
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 12
ColorIterations = 3
MinRad2 = 0.25
Scale = 2.04344
RotVector = 1,1,1
RotAngle = 0
#endpreset

#preset M1
FOV = 0.4
Eye = 3.4315,-5.57625,-2.47321
Target = -1.74219,2.244,1.00192
Up = -0.820324,-0.551717,-0.15059
AntiAlias = 1
Detail = -2.78761
DetailAO = -0.28574
FudgeFactor = 0.916
MaxRaySteps = 112
BoundingSphere = 7.1083
Dither = 0.5
AO = 0,0,0,0.96721
Specular = 1.4167
SpecularExp = 18.8
SpotLight = 1,1,1,0.17391
SpotLightDir = 0.31428,0.1
CamLight = 1,1,1,1.41936
CamLightMin = 0.4697
Glow = 0.835294,0.0784314,0.0784314,0
Fog = 0.45638
HardShadow = 0
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
Cycles = 7.03846
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 17
ColorIterations = 3
MinRad2 = 0.25
Scale = 3
RotVector = 1,1,1
RotAngle = 0
#endpreset
