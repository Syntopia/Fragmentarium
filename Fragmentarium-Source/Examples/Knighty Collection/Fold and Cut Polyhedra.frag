
#info fold and cut regular polyhedra Distance Estimator (knighty 2012)
#define providesInit
#define providesColor
#include "Soft-Raytracer.frag"
#include "Classic-Noise.frag"
#include "MathUtils.frag"

#group polyhedra

// Symmetry group type.
uniform int Type;  slider[3,5,5]

// U 'barycentric' coordinate for the 'principal' node
uniform float U; slider[0,1,1]

// V
uniform float V; slider[0,0,1]

// W
uniform float W; slider[0,0,1]

//vertex radius 
uniform float VRadius; slider[0,0.05,0.5]

//segments radius 
uniform float SRadius; slider[0,0.01,0.1]

uniform bool displayFaces; checkbox[true]
uniform bool displaySegments; checkbox[true]
uniform bool displayVertices; checkbox[true]

#group polyhedraColor
uniform vec3 face0Color; color[0.0,0.0,0.0]
uniform vec3 face1Color; color[0.0,0.0,0.0]
uniform vec3 face2Color; color[0.0,0.0,0.0]
uniform vec3 verticesColor; color[0.0,0.0,0.0]
uniform vec3 segmentsColor; color[0.0,0.0,0.0]

vec3 nc,p,pab,pbc,pca;
void init() {
	float cospin=cos(PI/float(Type)), scospin=sqrt(0.75-cospin*cospin);
	nc=vec3(-0.5,-cospin,scospin);
	pab=vec3(0.,0.,1.);
	pbc=normalize(vec3(scospin,0.,0.5));
	pca=normalize(vec3(0.,scospin,cospin));
	p=normalize((U*pab+V*pbc+W*pca));
}

vec3 fold(vec3 pos) {
	for(int i=0;i<Type;i++){
		pos.xyz=abs(pos.xyz);
		float t=-2.*min(0.,dot(pos,nc));
		pos+=t*nc;
	}
	return pos;
}

float D2Planes(vec3 pos) {

pos += 0.0025*cnoise(100.0*pos);
	float d0=dot(pos,pab)-dot(pab,p);
	float d1=dot(pos,pbc)-dot(pbc,p);
	float d2=dot(pos,pca)-dot(pca,p);
	return max(max(d0,d1),d2);
}

float D2Segments(vec3 pos) {
	pos-=p;
//pos += 0.0025*cnoise(150.0*pos);
	float dla=length(pos-min(0.,pos.x)*vec3(1.,0.,0.));
	float dlb=length(pos-min(0.,pos.y)*vec3(0.,1.,0.));
	float dlc=length(pos-min(0.,dot(pos,nc))*nc);
	return min(min(dla,dlb),dlc)-SRadius;//max(max(dla,dlb),max(dlc,dlp))-SRadius;
}

float D2Vertices(vec3 pos) {
	return length(pos-p)-VRadius;
}
uniform float Scale; slider[0.1,1.1,2.3]
float DE(vec3 pos) {
	float d=abs(pos.x-1.-0.002*cnoise(100.0*pos.yz));
for (int i = 0; i <1; i++) {
pos=fold(pos);
	
	if(displayFaces) d=min(d,D2Planes(pos)*pow(Scale,float(-i)));
	if(displaySegments) d=min(d,D2Segments(pos)*pow(Scale,float(-i)));
	if(displayVertices) d=min(d,D2Vertices(pos)*pow(Scale,float(-i)));
pos*=Scale;
}

	return d;
}

vec3 baseColor(vec3 pos, vec3 normal){
float d=abs(pos.x-1.-0.002*cnoise(100.0*pos.yz));
if (DE(pos) == d) return vec3(0.1,0.15,0.1);

return vec3(4.0);
}



