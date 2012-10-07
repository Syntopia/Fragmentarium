// Described in http://www.fractalforums.com/general-discussion-b77/solids-many-many-solids/
#info fold and cut regular polyhedra Distance Estimator (knighty 2012)
#define providesInit
#define providesColor
#include "DE-Raytracer.frag"
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
		pos.xy=abs(pos.xy);
		float t=-2.*min(0.,dot(pos,nc));
		pos+=t*nc;
	}
	return pos;
}

float D2Planes(vec3 pos) {
	float d0=dot(pos,pab)-dot(pab,p);
	float d1=dot(pos,pbc)-dot(pbc,p);
	float d2=dot(pos,pca)-dot(pca,p);
	return max(max(d0,d1),d2);
}

float D2Segments(vec3 pos) {
	pos-=p;
	float dla=length(pos-min(0.,pos.x)*vec3(1.,0.,0.));
	float dlb=length(pos-min(0.,pos.y)*vec3(0.,1.,0.));
	float dlc=length(pos-min(0.,dot(pos,nc))*nc);
	return min(min(dla,dlb),dlc)-SRadius;//max(max(dla,dlb),max(dlc,dlp))-SRadius;
}

float D2Vertices(vec3 pos) {
	return length(pos-p)-VRadius;
}

float DE(vec3 pos) {
	pos=fold(pos);
	float d=10000.;
	if(displayFaces) d=min(d,D2Planes(pos));
	if(displaySegments) d=min(d,D2Segments(pos));
	if(displayVertices) d=min(d,D2Vertices(pos));
	return d;
}

vec3 baseColor(vec3 pos, vec3 normal){
	pos=fold(pos);
	float d0=1000.0,d1=1000.0,d2=1000.,dv=1000.,ds=1000.;
	if(displayFaces){
		d0=abs(dot(pos,pab)-dot(pab,p));
		d1=abs(dot(pos,pbc)-dot(pbc,p));
		d2=abs(dot(pos,pca)-dot(pca,p));
	}
	if(displaySegments) ds=D2Segments(pos);
	if(displayVertices) dv=D2Vertices(pos);
	float d=min(min(d0,min(d1,d2)),min(ds,dv));
	vec3 col=face0Color;
	if(d==d1) col=face1Color;
	if(d==d2) col=face2Color;
	if(d==ds) col=segmentsColor;
	if(d==dv) col=verticesColor;
	return col;
}

#preset default
FOV = 0.62536
Eye = -3.59281,-1.35854,-1.5123
Target = 4.11696,1.54296,1.75405
Up = 0.476591,-0.750108,-0.458475
AntiAlias = 1
Detail = -3
DetailAO = -1.57143
FudgeFactor = 1
MaxRaySteps = 88
BoundingSphere = 2
Dither = 0.4386
NormalBackStep = 1
AO = 0,0,0,0.90123
Specular = 4.4304
SpecularExp = 16
SpotLight = 1,1,1,0.75
SpotLightDir = 0.6923,0.78462
CamLight = 1,0.827451,0.768627,0.6415
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
HardShadow = 0
ShadowSoft = 8.254
Reflection = 0
BaseColor = 0.721569,0.721569,0.721569
OrbitStrength = 0.37662
X = 0.411765,0.6,0.560784,0.41748
Y = 0.666667,0.666667,0.498039,-0.16504
Z = 1,0.258824,0.207843,1
R = 0.0823529,0.278431,1,0.82352
BackgroundColor = 0.501961,0.737255,0.956863
GradientBackground = 0.86955
CycleColors = true
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Type = 5
U = 1
V = 0.54545
W = 0
VRadius = 0.08427
SRadius = 0.02921
displayFaces = true
displaySegments = true
displayVertices = true
face0Color = 0.796078,0.611765,0.172549
face1Color = 0.164706,0.74902,0.12549
face2Color = 0.164706,0.305882,0.764706
verticesColor = 1,0,0
segmentsColor = 0.25098,0.760784,0.490196
#endpreset

#preset Tetrahedron
Type = 3
U = 0
V = 1
W = 0
#endpreset

#preset Cube
Type = 4
U = 0
V = 0
W = 1
#endpreset

#preset Octahedron
Type = 3
U = 1
V = 0
W = 0
#endpreset

#preset Dodecahedron
Type = 5
U = 0
V = 0
W = 1
#endpreset

#preset Icosahedron
Type = 5
U = 0
V = 1
W = 0
#endpreset