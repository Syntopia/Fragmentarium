#info SphereSponge Distance Estimator.
#include "DE-Raytracer.frag"
#group Sphere sponge

// Based on a fractal proposed by Buddhi, with a DE outlined by Knighty:
// http://www.fractalforums.com/3d-fractal-generation/revenge-of-the-half-eaten-menger-sponge/

// Number of iterations.
uniform int Iterations;  slider[0,10,100]
uniform int ColorIterations;  slider[0,10,100]

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
		
		if (l<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z,dot(z,z))));
	}
	
	// Use this to crop to a sphere:
	//  float e = clamp(length(z)-2.0, 0.0,100.0);
	//  return max(d,e);// distance estimate
	return d;
}

#preset Default
FOV = 0.38096
Eye = 0.401364,-1.82231,0.222432
Target = -4.13189,0.883827,3.67049
Up = -0.513594,0.202142,-0.833882
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.50362
DetailNormal = -2.625
FudgeFactor = 1
MaxRaySteps = 261
MaxRayStepsDiv = 9
BoundingSphere = 8.1928
Dither = 0.5797
AO = 0,0,0,1
Specular = 0.1666
SpecularExp = 28.125
SpotLight = 0.972549,1,0.705882,0.17391
SpotLightDir = -0.52382,0.1
CamLight = 0.894118,0.996078,1,1
Glow = 1,1,1,0
Fog = 0.55034
BaseColor = 1,1,1
OrbitStrength = 0.74257
X = 0.5,0.6,0.6,0.02362
Y = 1,0.6,0,0.13386
Z = 0.8,0.78,1,0.35434
R = 0.4,0.7,1,0.15872
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 3.81524
Iterations = 11
Scale = 2.78872
BubbleSize = 1.94828
ColorIterations = 8
#endpreset

