//Aexion's Quadray formula
//Script by Knighty. Added a 'Sign' parameter to the formula
//Using Jacobian for DE
//Looks like there is still some work to do on the DE formula
#version 120
#info Quadray sets Distance Estimator
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Quadray


// Number of fractal iterations.
uniform int Iterations;  slider[0,11,100]

// Bailout radius
uniform float Bailout; slider[2,32,128]

//Offset int the 4th dimension
uniform float Offset; slider[-2,0,1]

//sign. Actually a factor of the c value
uniform float Sign; slider[-2,1,2]

void init() {
}

const mat3x4 mc=mat3x4(vec4(.5,-.5,-.5,.5),
						     vec4(.5,-.5,.5,-.5),
						     vec4(.5,.5,-.5,-.5));
float DE(vec3 pos) {
	vec4 cp=abs(mc*pos)+vec4(Offset);
	vec4  z=cp;
	float r=length(z);
	cp*=Sign;
	mat4 j=mat4(1.);
	for(int i=0; i<Iterations && r<Bailout;i++){
		j=2.*mat4(z.xxyy*vec4(1.,-1.,1.,1.),z.yyxx*vec4(-1.,1.,1.,1.),
					z.wwzz*vec4(1.,1.,1.,-1.),z.zzww*vec4(1.,1.,-1.,1.))*j+mat4((Sign));
		vec4 tmp0=z*z;
		vec2 tmp1=2.*z.wx*z.zy;
		z=tmp0-tmp0.yxwz+tmp1.xxyy+cp;
		r=length(z);
		orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,r*r)));
	}
	j[0]=abs(j[0]);j[1]=abs(j[1]);j[2]=abs(j[2]);j[3]=abs(j[3]);
	z=j*vec4(1.,1.,1.,1.);
	z.xy=max(z.xy,z.zw);
	float dr=max(z.x,z.y);
	return r*log(r)/dr;
	//return (r-2.)*log(r+1.)/dr;
}