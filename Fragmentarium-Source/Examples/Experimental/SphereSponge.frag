#info SphereSponge Distance Estimator.
#include "DE-Raytracer.frag"
#group Sphere sponge

// Based on a fractal proposed by Buddhi, with a DE outlined by Knighty:
// http://www.fractalforums.com/3d-fractal-generation/revenge-of-the-half-eaten-menger-sponge/

// Number of iterations.
uniform int Iterations;  slider[0,10,100]

// Scale parameter.
uniform float Scale; slider[0.00,3.0,4.00]

// Size of bubbles
uniform float BubbleSize; slider[1,2.07,3];

void init() {}

float DE(vec3 z)
{
	z+=vec3(1.0,1.0,1.0);
	float modi=4.0;
	float k=2.0;
	float d=0.0;
	for (int l = 0; l < Iterations ; l++)
	{
		vec3 p2 = mod(z*k, modi) - 0.5*modi;
		d=max(d,(BubbleSize-length(p2))/k);//intersect
		k *= Scale;
		
		if (l<3) orbitTrap = min(orbitTrap, abs(vec4(z,dot(z,z))));
	}
	
	// Use this to crop to a sphere:
	//  float e = clamp(length(z)-2.0, 0.0,100.0);
	//  return max(d,e);// distance estimate
	return d;
}

#preset Grotto
FOV = 1
Eye = 1.49314,0.920883,5.91801
Target = 1.38433,3.76595,11.7116
Up = -0.970249,0.209269,-0.120988
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.72995
DetailNormal = -3.90383
FudgeFactor = 1
MaxRaySteps = 313
MaxRayStepsDiv = 8.625
BoundingSphere = 6.988
AO = 0,0,0,1
Specular = 3.5
SpecularExp = 28.125
SpotLight = 0.972549,1,0.705882,0.26087
SpotLightDir = -0.52382,0.1
CamLight = 0.894118,0.996078,1,1
Glow = 1,1,1,0
Fog = 0.37584
FogExponent = 2.40776
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.68504
R = 0.4,0.7,1,-0.66666
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
Iterations = 11
Scale = 3.4648
BubbleSize = 1.96552
#endpreset

