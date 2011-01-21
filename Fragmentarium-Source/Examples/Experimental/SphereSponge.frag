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
		
		orbitTrap = min(orbitTrap, abs(vec4(z,dot(z,z))));
	}
	
	// Use this to crop to a sphere:
	//  float e = clamp(length(z)-2.0, 0.0,100.0);
	//  return max(d,e);// distance estimate
	return d;
}

