#info Icosahedral polyhedra Distance Estimator (knighty 2011 some of the code is from Syntopia)
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Icosahedral

//Cut and fold (Houdini?) technique with icosahedral folding
//Well... in 2d, it's proved that any (?) polygon can be obtained with Cut and fold
//Is it the same for polyhedras?
//in this example the process is done recursively to get more elaborate shapes
//At eache step the current DE is combined with the previous ones
//feel free to play with this code by:
// - changing the DE combination
// - adding removing and changing the folding planes
// - use other cuts: 2+ planes, curved surfaces...etc.
// - optimize code :P
// -...etc :)

// Number of fractal iterations.
uniform int Iterations;  slider[0,2,100]

uniform float Scale; slider[0.00,2.0,4.00]
//Size of the polyhedra
uniform float Size; slider[-2.0,.5,2.00]

//normal of the cutting plane
uniform vec3 plnormal; slider[(-1,-1,-1),(1,0,0),(1,1,1)]

#define Phi (.5*(1.+sqrt(5.)))

vec3 n1 = normalize(vec3(-Phi,Phi-1.0,1.0));
vec3 n2 = normalize(vec3(1.0,-Phi,Phi+1.0));
vec3 n3 = normalize(vec3(0.0,0.0,-1.0));


uniform vec3 Offset; slider[(0,0,0),(0.850650808,0.525731112,0),(1,1,1)]

uniform float Angle1; slider[-180,0,180]
uniform vec3 Rot1; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
uniform float Angle2; slider[-180,0,180]
uniform vec3 Rot2; slider[(-1,-1,-1),(1,1,1),(1,1,1)]

mat4 M;

void init() {
	mat4 fracRotation2 = rotationMatrix(normalize(Rot2), Angle2);
	mat4 fracRotation1 = rotationMatrix(normalize(Rot1), Angle1);
       M = fracRotation2 * translate(Offset) * scale4(Scale) * translate(-Offset) * fracRotation1;
}

float DE(vec3 z)
{
	float dmin=-10000.;//because we are using max operator to combine DEs we need to initialize it to a big negative value. If you use min operator initialize it to some big positive value
	float s=1.;
	for(int i=0; i<Iterations; i++){
		float t;
		// Folds.
		//Dodecahedral.. you can use other sets of foldings!
		z = abs(z);
		t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		z = abs(z);
		t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		z = abs(z);

		//combine DEs... explore different combinations ;)
		//the base DE is the distance to the plane going through vec3(Size,0.,0.) and which normal is plnormal
		dmin=max(dmin,s*dot(z-vec3(Size,0.,0.),normalize(plnormal)));
		
		// Rotate, scale, rotate (we need to cast to a 4-component vector).
		z = (M*vec4(z,1.0)).xyz;s/=Scale;
	}
	return abs(dmin);//you can take a look to the inside
}
