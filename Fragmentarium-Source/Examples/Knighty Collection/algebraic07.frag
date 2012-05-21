#info algebraic surfaces (and others) Distance Estimator (knighty 2011)
#include "Soft-Raytracer.frag"
#include "MathUtils.frag"
#group DE parametres

//DE correction param: scaling factor
uniform float param1; slider[0,.75,1]
//DE correction param: Lipschitzator (lol) factor
uniform float param2; slider[0,4,10]
//Level set
uniform float LevelSet; slider[-1,0,1]
//Size
uniform float Sz; slider[-5,1,5]

uniform float time;

#define Phi (.5*(1.+sqrt(5.)))

#define W 1.6
#define W2 2.56
#define PHI  1.618034
#define PHI2 2.618034
#define PHI4 6.854102

#define Tau (1.+2.*Phi)


#define Eps 0.00048828125               //epsilon
#define IEps 2048.0                     //Inverse of epsilon



/*void init() {
}*/

float sinesphere(in vec3 P){
   P=sin(P*PI*Sz);
   return (dot(P,P)-LevelSet);
}

float sine(in vec3 P){
   P.xyz=P.xzy;
   return (P.z-0.25*sin(length(P.xy)*5.*Sz-2.0*time)/(dot(P.xy,P.xy)+1.0));
}

float absolutely(in vec3 P){
   return P.z-abs(P.x*P.y);
}

float CrossCap(in vec3 P){//cubic
   P.xyz=5.*P.xzy;
   vec3 P2=P*P;
   return (-P2.x*P.y + P2.z-LevelSet);
}

float Chmutov8(in vec3 P){//octic
   
   vec3 P2=P*P;
   vec3 R=1.0+P2*32.0*Sz*(-1.0+P2*(5.0+P2*(-8.0+P2*4.0)));
   return R.x+R.y+R.z;
}

float Barth6(vec3 z)//Bart's sextic
{
	vec3 z2=z*z;
	vec3 z3=0.2*Sz*PHI2*z2-z2.yzx;
	float p1=4.*z3.x*z3.y*z3.z;
	float r2=dot(z,z)-1.;
	float p2=Tau*(r2*r2);
	return p2-p1;
}

float Barth6Cusp(vec3 z)//Another Bart's sextic
{
	vec3 z2=z*z;
	vec3 z3=0.2*Sz*PHI2*z2-z2.yzx;
	float p1=4.*z3.x*z3.y*z3.z;
	float r2=dot(z,z)-1.;
	float p2=Tau*(r2*r2*r2);
	return p2-p1;
}

float BarthDecic(in vec3 P){//decic
   float r2=dot(P,P);
   vec3 P2=P*P;
   float r4=dot(P2,P2);
   vec3 P4=P2*P2;
   return (8.0*Sz*(P2.x-PHI4*P2.y)*(P2.y-PHI4*P2.z)*(P2.z-PHI4*P2.x)*(r4-2.0*((P.x*P.y)*(P.x*P.y)+(P.x*P.z)*(P.x*P.z)+(P.y*P.z)*(P.y*P.z)))+(3.0+5.0*PHI)*(r2-W2)*(r2-W2)*(r2-(2.0-PHI)*W2)*(r2-(2.0-PHI)*W2)*W2);
}

float CrossCap4(vec3 P){//Quartic
	vec3 P2=P*P;
	return 4.*P2.x*dot(P,P)+P2.y*(P2.y+P2.z-1.);
}

float Mitchell(vec3 P){//sextic
	vec3 P2=P*P;
	float r2=dot(P,P);
	float r2yz=dot(P.yz,P.yz);
	return 4.*Sz*(P2.x*P2.x+r2yz*r2yz)+17.*P2.x*r2yz-20.*r2+17.;
}

float Dervish(vec3 P){//Quintic
   P.z=-P.z;
   float c=sqrt(5.-sqrt(5.))/2.;
   float r=(1.+3.*sqrt(5.))/4.;
   float q=(P.x*P.x+P.y*P.y-1.+r*P.z*P.z);q=(1.-c*P.z)*q*q;
   float a=-(8./5.)*(1.+1./sqrt(5.))*sqrt(5.-sqrt(5.));
   float h1=P.x-P.z;
   float h2=cos(2.*PI/5.)*P.x-sin(2.*PI/5.)*P.y-P.z;
   float h3=cos(4.*PI/5.)*P.x-sin(4.*PI/5.)*P.y-P.z;
   float h4=cos(6.*PI/5.)*P.x-sin(6.*PI/5.)*P.y-P.z;
   float h5=cos(8.*PI/5.)*P.x-sin(8.*PI/5.)*P.y-P.z;
   float FF=h1*h2*h3*h4*h5;
   return a*FF+Sz*q;
}

float CayleyCubic(vec3 P){//cubic
   return 4.*Sz*dot(P,P) + 16.*P.x*P.y*P.z - 1.;
}

float FlipFlap(vec3 P){//cubic
   return Sz*dot(P.xy,P.xy)+P.x*P.y*P.z;
}

float heart(vec3 z)//Thanks Alex-B
{
	vec3 z2=z*z;
	float lp = z2.x + Sz*z2.y + z2.z - 1.0;
	float rp = z2.x*z2.z*z.z + 0.08888*z2.y*z2.z*z.z;
	return lp*lp*lp-rp;
}

float Klein(vec3 p){
	float r2=dot(p,p);
	float tp=r2+2.*p.y-1., tm=r2-2.*p.y-1.;
	//(x^2+y^2+z^2+2*y-1)*((x^2+y^2+z^2-2*y-1)^2-8*z^2)+16*x*z*(x^2+y^2+z^2-2*y-1);
	return (tp)*(tm*tm-8.*p.z*p.z)*Sz+16.*p.x*p.z*tm;
}

#define Fn Klein //sinesphere//Barth6Cusp//heart//sine//Chmutov8//BarthDecic//Dervish//CayleyCubic//FlipFlap//Barth6//Barth6//BarthDecic//Mitchell//CrossCap4//absolutely//
float DE(vec3 z)
{
vec3 pos = z;
	float v =Fn(z);
	float dv=length(IEps*(vec3(Fn(z+vec3(Eps,0.,0.)),Fn(z+vec3(0.,Eps,0.)),Fn(z+vec3(0.,0.,Eps)))-vec3(v)));
	v-= LevelSet;
	float k = 1.-1./(abs(v)+1.);
	
	float d =  param1*abs(v)/(dv+12.*param2*k+0.01);//adding 0.01 in case the gradient is zero on the isosurface

d = max(d, pos.x);
return d;
}
#preset Default
FOV = 0.4
Eye = -15.9787,-0.635857,4.14709
Target = -6.31873,0.13991,1.68084
Up = 0.239221,0.0231391,0.94428
AntiAlias = 1
Detail = -4
DetailAO = -1.28569
FudgeFactor = 1
MaxRaySteps = 400
BoundingSphere = 9
Dither = 0.2807
NormalBackStep = 1
AO = 0,0,0,0.81633
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.70588
SpotLightDir = 0.7284,-0.62962
CamLight = 1,1,1,1
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 0
ShadowSoft = 11.1392
Reflection = 0.10526
BaseColor = 1,0.709804,0.298039
OrbitStrength = 0
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0,0,0
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = true
FloorNormal = 0,0,1
FloorHeight = -3.6905
FloorColor = 0.662745,0.811765,1
param1 = 1
param2 = 2.4752
LevelSet = 0
Sz = 1
#endpreset