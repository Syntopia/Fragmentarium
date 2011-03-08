#info SphereSponge Distance Estimator.
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Sphere sponge

// Based on a fractal proposed by Buddhi, with a DE outlined by Knighty:
// http://www.fractalforums.com/3d-fractal-generation/revenge-of-the-half-eaten-menger-sponge/

// Number of iterations.
uniform int Iterations;  slider[0,10,100]

// Scale parameter.
uniform float Scale; slider[0.00,3.0,4.00]

uniform vec3 Rotation; slider[(-180,-180,-180),(0,0,0),(180,180,180)]

// Scaling center
uniform vec3 Offset; slider[(0,0,0),(0,0,0),(1,1,1)]

mat3 rot;

void init() {
	 rot = rotationMatrixXYZ(Rotation);
}


float DE(vec3 p)
{
	p=p*0.5+vec3(0.5);
	vec3 pp= abs(p-0.5)-0.5;
	float k=1.0;
	float d1 = max(pp.x,max(pp.y,pp.z));
	float d=d1;
	for (int i = 0; i < Iterations ; i++)
	{
		vec3 pa = mod(3.0*p*k, 3.0);
		k *= Scale;
		
		pp = 0.5-abs(pa-1.5)+Offset;
             pp*=rot;
		d1=min(max(pp.x,pp.z),min(max(pp.x,pp.y),max(pp.y,pp.z)))/k;//distance inside the 3 axis aligned square tubes
		d=max(d,d1);
		orbitTrap = min(orbitTrap, abs(vec4(pp,dot(pp,pp))));
	
	}
		
	// Use this to crop to a sphere:
	//  float e = clamp(length(z)-2.0, 0.0,100.0);
	//  return max(d,e);// distance estimate
	return d;
}

/*
FOV = 0.38807
Eye = 0.265626,-2.99798,1.0768
Target = -0.589,5.939,-3.304
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.45252
DetailNormal = -2.8
BackStepNormal = 1
ClarityPower = 1
MaxDist = 600
FudgeFactor = 1
MaxRaySteps = 157
MaxRayStepsDiv = 1.8
BandingSmooth = 0
BoundingSphere = 2
AO = 0.7
AOColor = 0,0,0
SpotLight = 0.4
Specular = 1.4167
SpecularExp = 10.417
SpotLightColor = 1,1,1
SpotLightDir = 0.1,0.1
CamLight = 1
CamLightColor = 1,1,1
Glow = 0.2
GlowColor = 1,1,1
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
BaseColor = 1,1,1
OrbitStrength = 0.77228
XStrength = -0.16522
X = 0.5,0.6,0.6
YStrength = 1
Y = 0.666667,0.666667,0.498039
ZStrength = 0.04348
Z = 0.8,0.78,1
RStrength = 0.07016
R = 0.4,0.7,1
Iterations = 10
Scale = 3
Rotation = -39.2724,-6.5448,88.362
Offset = 0.85294,0.66176,0
Up = -0.96798,-0.21662,0.12866
*/


/*
FOV = 1
Eye = 0.244,0.18392,-0.744
Target = 5.972,4.88492,5.872
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
Up = -0.06676,0.85354,-0.51672
Iterations = 10
Scale = 3
Rotation = 0,0,0
Offset = 0,0,0
*/
