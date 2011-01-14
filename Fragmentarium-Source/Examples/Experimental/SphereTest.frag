#info Sphere test
#include "DE-raytracer.frag"

// Crank up the 'Glow' and turn down the Limiter for this one.

float DE(vec3 z)
{
	float d= abs(length(z)-46.0);
	z = abs(z);
	d= min(d, abs(length(z-vec3(46.0,1.0,1.50))-1.0));
	z -= vec3(3.0,1.0,1.50);
	//z*=1.0;
	d= min(d, abs(length(z-0.5*vec3(2.0,1.0,1.50))-1.0));
	return d;
}




