#info Icosahedral polyhedra Distance Estimator (knighty 2011)
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Icosahedral

//Cut and fold (Houdini?) technique with icosahedral folding
//Well... in 2d, it's proved that any (simple?) polygon can be obtained with Cut and fold
//Seems it's the same for non auto intersecting polyhedra. Right?

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
	if (z.y>z.x) z.xy =z.yx;
	if (z.z>z.x) z.xz = z.zx;
	if (z.y>z.x) z.xy =z.yx;

	//Distance to the plane going through vec3(Size,0.,0.) and which normal is plnormal
	return abs(dot(z-vec3(Size,0.,0.),normalize(plnormal)));
}
