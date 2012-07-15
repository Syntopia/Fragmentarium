#info Mandelbox Distance Estimator (Rrrola's version).
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Mandelbox

uniform int Iterations;  slider[0,17,300]
uniform int ColorIterations;  slider[0,3,300]
uniform float MinRad2;  slider[0,0.25,2.0]

uniform float Scale;  slider[-3.0,1.3,3.0]
uniform vec3 Trans; slider[(-5,-5,-5),(0.5,0.5,0.5),(5,5,5)]
uniform vec3 Julia; slider[(-5,-5,-5),(-1,-1,-1),(0,0,0)]
vec4 scale = vec4(Scale, Scale, Scale, abs(Scale)) / MinRad2;

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]
uniform float RotAngle; slider[0.00,0,180]

mat3 rot;

void init() {
	 rot = rotationMatrix3(normalize(RotVector), RotAngle);
}

float absScalem1 = abs(Scale - 1.0);
float AbsScaleRaisedTo1mIters = pow(abs(Scale), float(1-Iterations));


float DE(vec3 pos) {
	vec4 p = vec4(pos,1), p0 = vec4(Julia,1);  // p.w is the distance estimate
	
	for (int i=0; i<Iterations; i++) {
		p.xyz*=rot;
		p.xyz=abs(p.xyz)+Trans;
		float r2 = dot(p.xyz, p.xyz);
		if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(p.xyz,r2)));
		p *= clamp(max(MinRad2/r2, MinRad2), 0.0, 1.0);  // dp3,div,max.sat,mul
		p = p*scale + p0;
	
	}
	return ((length(p.xyz) - absScalem1) / p.w - AbsScaleRaisedTo1mIters);
}

#preset Default
FOV = 0.684135
Eye = -0.248252,2.3815,0.520985
Target = 1.13531,5.29092,-3.84898
Up = 0.164891,0.783145,0.573606
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.83215
DetailNormal = -3.02883
FudgeFactor = 0.68224
MaxRaySteps = 522
MaxRayStepsDiv = 6
BoundingSphere = 4.0964
Dither = 0
AO = 0,0,0,1
Specular = 0.9167
SpecularExp = 1.042
SpotLight = 1,1,1,0.48913
SpotLightDir = 0.61904,-0.06666
CamLight = 1,1,1,0.60216
Glow = 1,1,1,0.01754
Fog = 1.08724
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.16536
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.07084
R = 0.4,0.7,1,0.03174
BackgroundColor = 0.239216,0.239216,0.239216
GradientBackground = 0.7143
CycleColors = false
Cycles = 9.51206
Iterations = 15
ColorIterations = 2
MinRad2 = 0.3492
Scale = 2.04348
Trans = 0.0365,-1.8613,0.0365
Julia = -0.6691,-1.3028,-0.45775
RotVector = 1,1,0
RotAngle = 0
#endpreset