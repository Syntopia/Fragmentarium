#info Menger Distance Estimator.
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Menger

void init() { 
}


/*
float DE2(vec3 pos) {
	vec3 z=pos;
	float r;
	float dr=1.0;
	int i=0;
	r=length(z);
	while(r<100 && (i<8)) {
		powN2(z,r,dr);
		z+=pos;
		r=length(z);
		z*=rot;
		if (i<5) orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,r*r)));
		i++;
	}
	
	return 0.5*log(r)*r/dr;
	
}
*/

float DE(vec3 z, inout float dz, inout int iter)
{
	vec3 c = z;
	return r; // (r*log(r) / dz);
}
uniform bool Analytic; checkbox[true]

uniform float DetailGrad;slider[-7,-2.8,7];
float gradEPS = pow(10.0,DetailGrad);

float DE(vec3 pos) {
	int iter = -1;
	float dz = 1.0;
	if (Analytic) {
		float r = DE(pos, dz, iter);
		return (r*log(r) / dz);
	} else  {
		vec3 e = vec3(0.0,gradEPS,0.0);
		float r = abs(DE(pos, dz, iter));
		vec3 grad =vec3( DE(pos+e.yxx, dz, iter),  DE(pos+e.xyx, dz, iter),  DE(pos+e.xxy,dz,  iter) )-vec3(r);
		return r*log(r)*0.5/ length( grad/gradEPS);
	}
}

