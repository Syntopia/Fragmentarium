#info Mandelbox Distance Estimator (Rrrola's version).
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
		orbitTrap = min(orbitTrap, abs(vec4(p.xyz,r2)));
		p *= clamp(max(MinRad2/r2, MinRad2), 0.0, 1.0);  // dp3,div,max.sat,mul
		p = p*scale + p0;
		
	}
	return ((length(p.xyz) - absScalem1) / p.w - AbsScaleRaisedTo1mIters);
}


/*
FOV = 1
Eye = 0.0104856,2.35989e-05,-1.99996
Target = 3.75959,3.86772,-10.4291
Up = 0.753402,0.403223,0.51942
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.3
DetailNormal = -2.8
BackStepNormal = 1
ClarityPower = 1
MaxDist = 600
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 1.8
BandingSmooth = 0
BoundingSphere = 2
AO = 0.7
AOColor = 0,0,0
SpotLight = 0.4
Specular = 4
SpecularExp = 16
SpotLightColor = 1,1,1
SpotLightDir = 0.1,0.1
CamLight = 1
CamLightColor = 1,1,1
Glow = 0.2
GlowColor = 1,1,1
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
BaseColor = 1,1,1
OrbitStrength = 0.8
XStrength = 0.7
X = 0.5,0.6,0.6
YStrength = 0.4
Y = 1,0.6,0
ZStrength = 0.5
Z = 0.8,0.78,1
RStrength = 0.12
R = 0.4,0.7,1
Iterations = 17
MinRad2 = 0.25
Scale = 3
RotVector = 1,1,1
RotAngle = 0
*/