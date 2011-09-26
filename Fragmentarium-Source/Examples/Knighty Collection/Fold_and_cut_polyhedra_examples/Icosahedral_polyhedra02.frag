#info Icosahedral polyhedra Distance Estimator (knighty 2011)
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Icosahedral

//Cut and fold (Houdini?) technique with icosahedral folding
//Well... in 2d, it's proved that any (?) polygon can be obtained with Cut and fold
//Is it the same for polyhedras?

//feel free to play with this code by:
// - adding removing and changing the folding planes
// - use other cuts: 2+ planes, curved surfaces...etc.
// - optimize code :P
// -...etc :)

//Size of the polyhedra
uniform float Size; slider[-2.0,.5,2.00]

//normal of the cutting plane
uniform vec3 plnormal; slider[(-1,-1,-1),(1,0,0),(1,1,1)]

#define Phi (.5*(1.+sqrt(5.)))

vec3 n1 = normalize(vec3(-Phi,Phi-1.0,1.0));
vec3 n2 = normalize(vec3(1.0,-Phi,Phi+1.0));
vec3 n3 = normalize(vec3(0.0,0.0,-1.0));

void init() {
}

float DE(vec3 z)
{
	float t;
	
	// Folds.
	//Dodecahedral
	z = abs(z);
	t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	z = abs(z);
	t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	z = abs(z);
	//t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	//t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	
	//Distance to the plane going through vec3(Size,0.,0.) and which normal is plnormal
	return abs(dot(z-vec3(Size,0.,0.),normalize(plnormal)));
}
