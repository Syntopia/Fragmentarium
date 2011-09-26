//Aexion's Quadray formula
//Script by Knighty. Added a 'Sign' parameter to the formula
//Looks like there is still some work to do on the DE formula
#version 120
#info Quadray sets Distance Estimator
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Quadray

// Number of fractal iterations.
uniform int Iterations;  slider[0,11,100]

// Bailout radius
uniform float Bailout; slider[2,3.5,64]

//Offset int the 4th dimension
uniform float Offset; slider[-2,0,2]

//sign. Actually a factor of the c value
uniform float Sign; slider[-2,-1,2]

const mat3x4 mc=mat3x4(vec4(.5,-.5,-.5,.5),
						     vec4(.5,-.5,.5,-.5),
						     vec4(.5,.5,-.5,-.5));
float DE(vec3 pos) {
	vec4 cp=Sign*(abs(mc*pos)+vec4(Offset));
	vec4 z=cp;
	float r=length(z);
	float dr=1.;
	for(int i=0; i<Iterations && r<Bailout;i++){
		dr=2.*r*dr+abs(Sign);
		vec4 tmp0=z*z;
		vec2 tmp1=2.*z.wx*z.zy;
		z=tmp0-tmp0.yxwz+tmp1.xxyy+cp;
		r=length(z);
		orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,r*r)));
	}
	return 0.5*r*log(r)/dr;
	//return 0.5*(r-2.)*log(r+1.)/dr;
}