//#version 120
#info Doyle Spirals.
//Links:
//http://www.josleys.com/show_gallery.php?galid=265
//http://www.josleys.com/article_show.php?id=3
//http://klein.math.okstate.edu/IndrasPearls/cusp.pdf

#vertex
#define providesVertexInit
#endvertex

#define providesColor
#include "DE-Raytracer-vinit.frag"

#vertex
//all the calculations done here could be (and should be) done in the host program
#group SDoyle
uniform int P; slider[0,5,50]
uniform int Q; slider[3,5,50]
//scale the radius of the spheres
uniform float SRadScl; slider[0,1,2]
//#vertex
varying mat2 Mat,iMat;
varying vec4 rads, xps, yps;
varying vec2 ns;

#define PI  3.14159265358979323846264
//given an etimated z find the solution to Doyle spiral equations using Newton-Raphson method
//The equations are:
//r=(exp(2*z.x)-2*exp(z.x)*cos(z.y)+1)/(exp(z.x)+1)
//r=(exp(2*zt.x)-2*exp(zt.x)*cos(zt.y)+1)/(exp(zt.x)+1)
//r=(exp(2*z.x)-2*exp(z.x)*exp(zt.x)*cos(z.y-zt.y)+exp(2*zt.x))/(exp(z.x)+exp(zt.x))
//z.x*p=zt.x*q
//z.y*p+2*PI=zt.y*q; In reality it should be:z.y*p+2*k*PI=zt.y*q; k is in Z set; I haven't esplored other values of k than 1
//z corresponds to similarity 'a' and zt to similarity 'b'
//a=exp(z); and b=exp(zt); because these are complex numbers :)
vec2 solve(vec2 z){
	//Newton-Raphson method
	float k=float(P)/float(Q);
	for(int i=0; i<2;i++){//2 iterations are usually sufficient: the convergence is very fast. especially when P o=and/or Q are relatively big
		float lb=z.x*k, tb=z.y*k+2.*PI/float(Q);
		float ra=exp(z.x),rb=exp(lb),ca=cos(z.y),cb=cos(tb),cab=cos(z.y-tb);
		//compute function values
		vec3 v=vec3((ra*ra-2.*ra*ca+1.)/((ra+1.)*(ra+1.)),
					     (rb*rb-2.*rb*cb+1.)/((rb+1.)*(rb+1.)),
					     (ra*ra-2.*ra*rb*cab+rb*rb)/((ra+rb)*(ra+rb)));
		vec2 f=v.xy-v.yz;
		//compute jacobian
		vec3 c=2.*vec3( ra/((ra+1.)*(ra+1.)), k*rb/((rb+1.)*(rb+1.)), (1.-k)*ra*rb/((ra+rb)*(ra+rb)) );
		vec3 v0= c*vec3( (1.+ca)*(ra-1.)/(ra+1.), (1.+cb)*(rb-1.)/(rb+1.), (1.+cab)*(ra-rb)/(ra+rb) );
		vec3 v1= c*sin(vec3(z.y,tb,z.y-tb));
		mat2 J = mat2(0.);
		J[0]=v0.xy-v0.yz; J[1]=v1.xy-v1.yz;
		//compute inverse of J
		float idet=1./(J[0][0]*J[1][1]-J[0][1]*J[1][0]);
		mat2 iJ=-J;
		iJ[0][0]=J[1][1];
		iJ[1][1]=J[0][0];
		//next value
		z-=idet*( iJ*f);
	}
	return z;
}
void vinit() {
	//find estimate
	//notice that for big P and/or Q the packing will look just like hexagonal one
	//if we take the centers of all packed circles in log-polar plane we will get almost a triangular array
	//That's why I'm using log-polar plane
	//notice also the link to drost effect ;)
	//Someone already noticed that before: http://gimpchat.com/viewtopic.php?f=10&t=3941
	vec2 v=vec2(-float(P)+float(Q)*0.5,float(Q)*sqrt(3.)*0.5);
	float vd=1./length(v);
	float scl=2.*PI*vd;
	vec2 z=scl*vd*v.yx;
	z=solve(z);
	float k=float(P)/float(Q);
	vec2 zt=vec2(z.x*k,z.y*k+2.*PI/float(Q));
	Mat[0]=z;Mat[1]=zt;
	iMat=-Mat;
	iMat[0][0]=Mat[1][1]; iMat[1][1]=Mat[0][0];
	iMat*=1./(Mat[0][0]*Mat[1][1]-Mat[0][1]*Mat[1][0]);
	float ra=exp(z.x),rb=exp(zt.x),ca=cos(z.y);
	float rs=sqrt((ra*ra-2.*ra*ca+1.)/((ra+1.)*(ra+1.)));//radius of the circle centered at (1,0)
	rs*=SRadScl;//for some variations
	rads=rs*vec4(1., ra, rb, ra*rb);//radius for the 4 circles in the fundamental domain
	xps=vec4(1.,ra*ca,rb*cos(zt.y),ra*rb*cos(z.y+zt.y));//Their x coordinates
	yps=vec4(0.,ra*sin(z.y),rb*sin(zt.y),ra*rb*sin(z.y+zt.y));//y
	ns=vec2(-rs,sqrt(1.-rs*rs));//defines bounding cone
}
#endvertex
#define PI  3.14159265358979323846264
uniform int P,Q;
//Want do do an inversion
uniform bool DoInversion; checkbox[false]
//Inversion center
uniform vec3 InvCenter; slider[(-1,-1,-1),(0,0,0),(1,1,1)]
//Inversion radius squared
uniform float InvRadius;  slider[0.01,1,2]

varying mat2 Mat,iMat;
varying vec4 rads, xps, yps;
varying vec2 ns;

vec3 CDoyle(vec3 z){
	vec2 p=z.xy;
	//transform to the plane log-polar
	p=vec2(log(length(p)), atan(p.y,p.x));
	//transform into the "oblique" base (defined by z and zt in vinit() function above)
	vec2 pl=iMat*p;
	//go to the losange defined by z and zt (as defined in vinit())
	vec2 ip=floor(pl);
	pl=pl-ip;
	//back to log-polar plane
	pl=Mat*pl;
	//scale and delta-angle
	float scl=exp(pl.x-p.x),angle=pl.y-p.y;
	//the original z is scaled and rotated using scl and angle
	z*=scl;
	float c=cos(angle),s=sin(angle);
	z.xy=z.xy*mat2(vec2(c,-s),vec2(s,c));//tourner z
	//distances to the spheres that are inside the fundamental fundamental domain
	vec4 vx=vec4(z.x)-xps;
	vec4 vy=vec4(z.y)-yps;
	vec4 vz=vec4(z.z);
	vec4 dists=sqrt(vx*vx+vy*vy+vz*vz)-rads;
	//take the minimal distance
	float mindist=min(min(dists.x,dists.y),min(dists.z,dists.w));
	//which is the nearest sphere
	bvec4 bvhit=equal(dists,vec4(mindist));
	int mindex=int(dot(vec4(bvhit),vec4(0.,1.,2.,3.)));
	const mat4 set=mat4(vec4(0.,0.,0.,0.),vec4(1.,0.,1.,0.),vec4(0.,1.,1.,0.),vec4(1.,1.,2.,0.));
	vec3 minprop=set[mindex].xyz;
	vec3 bc=vec3(ip,ip.x+ip.y)+minprop;
	bc=bc/vec3(ivec3(P,Q,Q-P));
	bc-=floor(bc);
	return bc;//serves for the coloring
}

vec3 color(vec3 p, vec3 n) {
	//return vec3(1.);
	if(DoInversion){
		p=p-InvCenter;
		float r2=dot(p,p);
		p=(InvRadius/r2)*p+InvCenter;
	}
	return sin(2.*PI*CDoyle(p)+2.)*0.5+0.5;
}

float Doyle(vec3 z){
	//find the nearest point on the bounding cone to z
	//if z is inside the cone we don't change anything
	//normal to the line defining the (upper) cone in (r,z) plane is given by ns
	z.z=abs(z.z);
	vec2 p=vec2(length(z.xy),abs(z.z));
	float r=p.x;
	p-=ns*max(0.,dot(ns,p));
	p=z.xy*p.x/r;
	//transformer vers le plan log-polaire
	p=vec2(log(length(p)), atan(p.y,p.x));
	//transformer dans la base 'presque' triangulaire
	vec2 pl=iMat*p;
	//ramener vers le losange de base
	pl=pl-floor(pl);
	//transformation inverse
	pl=Mat*pl;
	float scl=exp(pl.x-p.x),angle=pl.y-p.y;
	z*=scl;//mettre z a l'echelle
	float c=cos(angle),s=sin(angle);
	z.xy=z.xy*mat2(vec2(c,-s),vec2(s,c));//tourner z
	//calculer les distances vers les spheres qui sont dans le domaine fondamental
	vec4 vx=vec4(z.x)-xps;
	vec4 vy=vec4(z.y)-yps;
	vec4 vz=vec4(z.z);
	vec4 dists=sqrt(vx*vx+vy*vy+vz*vz)-rads;
	//prendre la distance minimale
	return min(min(dists.x,dists.y),min(dists.z,dists.w))/scl;
}

float DE(vec3 p) {
	if(DoInversion){
		p=p-InvCenter;
		float r=length(p);
		float r2=r*r;
		p=(InvRadius/r2)*p+InvCenter;
		float de=Doyle(p);
		de=r2*de/(InvRadius+r*de);
		return de;
	}
	else return Doyle(p);
}

#preset Default
FOV = 0.45528
Eye = 0.598762,3.77338,4.35632
Target = 0.0988598,-2.20617,-2.16469
Up = 0.905519,-0.30374,0.296271
AntiAlias = 1
Detail = -3
DetailAO = -1.14289
FudgeFactor = 1
MaxRaySteps = 128
BoundingSphere = 12
Dither = 0.51754
NormalBackStep = 1
AO = 0,0,0,0.70732
Specular = 3.5
SpecularExp = 60.714
SpotLight = 1,1,1,0.36538
SpotLightDir = 0.6923,-1
CamLight = 1,1,1,0.71698
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 122
Fog = 0
HardShadow = 0
ShadowSoft = 12.5806
Reflection = 0.34177
BaseColor = 1,1,1
OrbitStrength = 0.79221
X = 1,1,1,1
Y = 0.345098,0.666667,0,0.02912
Z = 1,0.666667,0,1
R = 0.0784314,1,0.941176,-0.0194
BackgroundColor = 0.466667,0.658824,0.105882
GradientBackground = 0
CycleColors = false
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
P = 2
Q = 20
SRadScl = 1
DoInversion = true
InvCenter = -0.11112,-0.57778,0.44444
InvRadius = 1
#endpreset

#preset Double-spiral
FOV = 0.45528
Eye = -5.11558,-0.928098,3.8869
Target = 2.1721,0.766793,-0.861326
Up = 0.469646,0.10199,0.876944
AntiAlias = 1
Detail = -3
DetailAO = -1.14289
FudgeFactor = 1
MaxRaySteps = 128
BoundingSphere = 12
Dither = 0.51754
NormalBackStep = 1
AO = 0,0,0,0.70732
Specular = 3.5
SpecularExp = 60.714
SpotLight = 1,1,1,0.36538
SpotLightDir = 0.6923,-1
CamLight = 1,1,1,0.71698
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 122
Fog = 0
HardShadow = 0
ShadowSoft = 12.5806
Reflection = 0.34177
BaseColor = 1,1,1
OrbitStrength = 0.79221
X = 1,1,1,1
Y = 0.345098,0.666667,0,0.02912
Z = 1,0.666667,0,1
R = 0.0784314,1,0.941176,-0.0194
BackgroundColor = 0.466667,0.658824,0.105882
GradientBackground = 0
CycleColors = false
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
P = 5
Q = 26
SRadScl = 1
DoInversion = true
InvCenter = -0.11112,-0.57778,0
InvRadius = 1
#endpreset