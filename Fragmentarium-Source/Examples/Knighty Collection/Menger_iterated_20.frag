#info Icosahedral polyhedra Distance Estimator (knighty 2011 some of the code is from Syntopia)
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Icosahedral

//Cut and fold (Houdini?) technique with icosahedral folding
//Well... in 2d, it's proved that any (?) polygon can be obtained with Cut and fold
//Is it the same for polyhedras?
//in this example the process is done recursively to get more elaborate shapes
//The cut is done at the end
//feel free to play with this code by:
// - adding removing and changing the folding planes
// - use other cuts: 2+ planes, curved surfaces...etc.
// - optimize code :P
// -...etc :)

// Number of fractal iterations.
uniform int Iterations;  slider[0,1,100]


// Number of color iterations.
uniform int ColorIterations;  slider[0,2,100]

uniform float Scale; slider[0.00,2.0,4.00]
uniform float Bailout; slider[10.00,100.0,1000.00]
//Size of the polyhedra
uniform float Size; slider[-2.0,.5,2.00]

//normal of the cutting plane
uniform vec3 plnormal; slider[(-1,-1,-1),(1,0,0),(1,1,1)]

#define Phi (.5*(1.+sqrt(5.)))

vec3 n1 = normalize(vec3(-Phi,Phi-1.0,1.0));
vec3 n2 = normalize(vec3(1.0,-Phi,Phi+1.0));
vec3 n3 = normalize(vec3(0.0,0.0,-1.0));


uniform vec3 Offset; slider[(0,0,0),(0.850650808,0.525731112,0),(1,1,1)]

uniform float Angle1; slider[-180,0,180]
uniform vec3 Rot1; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
uniform float Angle2; slider[-180,0,180]
uniform vec3 Rot2; slider[(-1,-1,-1),(1,1,1),(1,1,1)]

mat4 M;

void init() {
mat4 fracRotation2 = rotationMatrix(normalize(Rot2), Angle2);
mat4 fracRotation1 = rotationMatrix(normalize(Rot1), Angle1);
M = fracRotation2 * fracRotation1;
}

float DE(vec3 z)
{
float dmin=10000.;
float s=1.;
for(int i=0; i<Iterations && dot(z,z)<Bailout; i++){
	float t;
	// Folds.
	//Dodecahedral
	z = abs(z);
	if (z.x<z.y){ z.xy = z.yx;}
	if (z.x< z.z){ z.xz = z.zx;}
	if (z.y<z.z){ z.yz = z.zy;}
	z = Scale*z-Offset*(Scale-1.0);
	if( z.z<-0.5*Offset.z*(Scale-1.0))  z.z+=Offset.z*(Scale-1.0);
	
	if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z.xyz,dot(z,z))));
	
	// Rotate, scale, rotate (we need to cast to a 4-component vector).
	z = (M*vec4(z,1.0)).xyz;s/=Scale;
}
//Distance to the plane going through vec3(Size,0.,0.) and which normal is plnormal
return abs(s*dot(z-vec3(Size,0.,0.),normalize(plnormal)));
}

#preset Default
FOV = 0.4
Eye = 0.969834,0.524715,2.07853
Target = -2.85481,-1.44338,-5.83038
Up = 0.532478,-0.838962,-0.0487283
AntiAlias = 1
Detail = -2.53981
DetailAO = -0.42
FudgeFactor = 1
MaxRaySteps = 56
BoundingSphere = 76.364
Dither = 0.44737
AO = 0,0,0,0.76
Specular = 0
SpecularExp = 16
SpotLight = 1,1,1,0.25713
SpotLightDir = 0.66266,0.1
CamLight = 1,1,1,0.78874
CamLightMin = 0.31765
Glow = 1,1,1,0.2826
Fog = 0.3307
HardShadow = 0.41538
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.75238
Y = 1,0.6,0,0.48572
Z = 0.8,0.78,1,0.5
R = 0.545098,0.529412,0.47451,0.65384
BackgroundColor = 1,1,1
GradientBackground = 0.3
CycleColors = false
Cycles = 6.36097
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 2
Scale = 2.36668
Size = 0.5
plnormal = -0.0297,-0.0099,-0.0693
Offset = 0.75789,0.13158,0.29825
Angle1 = 0
Rot1 = 1,1,1
Angle2 = 0
Rot2 = 1,1,1
ColorIterations = 2
Bailout = 333.057
#endpreset
