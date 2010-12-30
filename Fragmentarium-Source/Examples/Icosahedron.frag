#info Icosahedron Distance Estimator (Syntopia 2010)
#include "include/DE-Raytracer.frag"
#include "include/matrix.frag"
#group Icosahedron
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

uniform float Scale; slider[0.00,3.0,4.00]

uniform float phi; slider[-5,1.618,5]

vec3 n1 = normalize(vec3(-phi,phi-1.0,1.0));
vec3 n2 = normalize(vec3(1.0,-phi,phi+1.0));
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
	// Prefolds.
	z = abs(z);
	float t;
	t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	
	// Iterate to compute the distance estimator.
	int n = 0;
	vec4 p4;
	while (n < iters) {
		// Fold
		z = abs(z);
		t =dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t =dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		t =dot(z,n3); if (t>0.0) { z-=2.0*t*n3; }
		
		// Rotate, scale, rotate (we need to cast to a 4-component vector).
		p4.xyz = z; p4.w = 1.0;
		z = (M*p4).xyz;
		
		n++;
	}
	
	return (length(z) ) * pow(Scale,  float(-n));
}
