#info Sphere test
#include "DE-Raytracer.frag"


float DE(vec3 z)
{
	float d= 1000.0;
	for (int i = 0; i < 7;i++) {
		z = abs(z);
		d= min(d,length(z-vec3(1.0,1.0,1.0))*pow(1.1,float(i)));
		// z += vec3(0.2,0.2,0.0);
		z*=1.401;
	}
	return d;
}




