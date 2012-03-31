#include "Progressive2DJulia.frag"
#include "Complex.frag"

// An example of Escape Time Fractals, 
// using progressive rendering.
// Bbuffers are set up by the 'Progressive2DJulia' fragment.
// 
// Remember to set 'Render mode' to 'Continous'.
// Progressive rendering, makes very high-quality AA possible.

//  Fractal by Kali: http://www.fractalforums.com/new-theories-and-research/very-simple-formula-for-fractal-patterns/msg31800/#msg31800

uniform float MinRadius; slider[0,0,10]
uniform float Scaling; slider[-5,0,5]

vec2 formula(vec2 z,vec2 c) {
	float m =dot(z,z);
	if (m<MinRadius) {
		z = abs(z)/(MinRadius*MinRadius);
	}else {
		z = abs(z)/m*Scaling;
	}
	return z+c;
}

#preset Default
Center = -0.118362,0.0108127
Zoom = 10.8053
AntiAliasScale = 1.37662
Gamma = 2.2222
ExponentialExposure = true
Exposure = 7.1739
Brightness = 1
Contrast = 1.0396
Saturation = 1.8817
AARange = 1
AAExp = 1
GaussianAA = false
Iterations = 1000
PreIterations = 15
R = 1
G = 0.84034
B = 0.525
C = 0.90756
Julia = true
JuliaX = 1.43649
JuliaY = 2.05404
ShowMap = false
MapZoom = 2.1
EscapeSize = 5
ColoringType = 0
ColorFactor = 0.5
MinRadius = 0
Scaling = -1.9231
#endpreset