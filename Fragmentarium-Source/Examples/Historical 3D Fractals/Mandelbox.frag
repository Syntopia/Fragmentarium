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

