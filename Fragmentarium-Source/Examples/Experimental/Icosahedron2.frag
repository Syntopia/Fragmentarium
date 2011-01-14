#info Icosahedron Distance Estimator (Syntopia 2010)
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Icosahedron
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

uniform float Scale; slider[0.00,2.0,4.00]

uniform float Phi; slider[-5,1.618,5]

vec3 n1 = normalize(vec3(-Phi,Phi-1.0,1.0));
vec3 n2 = normalize(vec3(1.0,-Phi,Phi+1.0));
vec3 n3 = normalize(vec3(0.0,0.0,-1.0));

uniform vec3 Offset; slider[(0,0,0),(0.850650808,0.525731112,0),(1,1,1)]

uniform float Angle1; slider[-180,0,180]
uniform vec3 Rot1; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
uniform float Angle2; slider[-180,0,180]
uniform vec3 Rot2; slider[(-1,-1,-1),(1,1,1),(1,1,1)]

mat4 fracRotation2 = rotationMatrix(normalize(Rot2), Angle2);
mat4 fracRotation1 = rotationMatrix(normalize(Rot1), Angle1);

mat4   M = fracRotation2 * translate(Offset) * scale4(Scale) * translate(-Offset) * fracRotation1;

// Number of fractal iterations.
uniform int iters;  slider[0,13,100]

float DE(vec3 z)
{
	float t;
	
	// Prefolds.
	for (int y=0; y<3; y++) {
		t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		t =dot(z,n3); if (t>0.0) { z-=2.0*t*n3; }
	}
	
	// Iterate to compute the distance estimator.
	int n = 0;
	while (n < iters) {
		// Fold
		z = abs(z);
		t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		//   t =dot(z,n3); if (t>0.0) { z-=2.0*t*n3; }
		t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		
		// Rotate, scale, rotate (we need to cast to a 4-component vector).
		z = (M*vec4(z,1.0)).xyz;
		n++;
		minDist2 = min(minDist2, dot(z,z));
	}
	
	return (length(z) ) * pow(Scale,  float(-n));
}
