#version 120
#info Generic M4 Mandalabeth. DE using jacobian. by knighty
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Mandalabeth


// Number of fractal iterations.
uniform int Iterations;  slider[0,9,100]

// Bailout radius
uniform float Bailout; slider[0,5,64]

// parameter
uniform float par; slider[-3,1,3]
//expo
uniform float expo; slider[2,6,20]

//mandala
vec2 mandala(vec2 p, float par, out mat2 j){
	float r=length(p);
	float a=atan(p.y,p.x);
	float r1=pow(r,par), a1=a*par;
	j[0].x=par*r1*cos(a1); j[0].y=par*r1*sin(a1);
	j[1]=j[0].yx;j[1].x*=-1.0;
	return r1*r*vec2(cos(a1+a),sin(a1+a));
}
// Compute the distance from `pos` to the Mandalabeth.
float DE(vec3 p) {
	vec3 v=p;
   	float r2 = dot(v,v),dr = 1.;
	mat3 j=mat3(1.0);  
	 
   	for(int i = 0; i<Iterations && r2<Bailout; i++){
      		vec3 p1=par*p;
		mat2 pj=mat2(1.0);
		mat3 ppj=mat3(0.0);
		mat3 trs=mat3(vec3(sqrt(0.5),sqrt(1./6.),sqrt(1./3.)),vec3(-sqrt(0.5),sqrt(1./6.),sqrt(1./3.)),vec3(0.,-sqrt(2./3.),sqrt(1./3.)));
			p1+=vec3(mandala((trs*v).xy,expo,pj),0.)*trs;
			ppj=ppj+transpose(trs)*mat3(pj)*trs;
		trs=mat3(vec3(sqrt(0.5),sqrt(1./6.),sqrt(1./3.)),vec3(sqrt(0.5),-sqrt(1./6.),-sqrt(1./3.)),vec3(0.,sqrt(2./3.),-sqrt(1./3.)));
			p1+=vec3(mandala((trs*v).xy,expo,pj),0.)*trs;
			ppj=ppj+transpose(trs)*mat3(pj)*trs;
		trs=mat3(vec3(-sqrt(0.5),-sqrt(1./6.),-sqrt(1./3.)),vec3(-sqrt(0.5),sqrt(1./6.),sqrt(1./3.)),vec3(0.,sqrt(2./3.),-sqrt(1./3.)));
			p1+=vec3(mandala((trs*v).xy,expo,pj),0.)*trs;
			ppj=ppj+transpose(trs)*mat3(pj)*trs;
		trs=mat3(vec3(-sqrt(0.5),-sqrt(1./6.),-sqrt(1./3.)),vec3(sqrt(0.5),-sqrt(1./6.),-sqrt(1./3.)),vec3(0.,-sqrt(2./3.),sqrt(1./3.)));
			p1+=vec3(mandala((trs*v).xy,expo,pj),0.)*trs;
			ppj=ppj+transpose(trs)*mat3(pj)*trs;

		j=ppj*j+mat3(par);
		v=p1;
		 r2 = dot(v,v);
		orbitTrap = min(orbitTrap, abs(vec4(v,r2)));
   	}
	orbitTrap.w=sqrt(orbitTrap.w);
	float r = sqrt(r2);
	j[0]=abs(j[0]);j[1]=abs(j[1]);j[2]=abs(j[2]);v=j*vec3(1.,1.,1.);
	return abs(0.5*log(r)*r)/max(v.x,max(v.y,v.z));//dr;//
}
