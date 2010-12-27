#info Sphere test
#include "DE-raytracer.frag"


float DE(vec3 z)
{
	float d= abs(length(z)-46.0);
	z = abs(z);
	d= min(d, abs(length(z-vec3(46.0,1.0,1.50))-1.0));
	z -= vec3(3.0,1.0,1.50);
	//z*=1.0;
//	d= min(d, abs(length(z-0.5*vec3(2.0,1.0,1.50))-1.0));
	return d;
}




