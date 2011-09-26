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
       M = fracRotation2 * translate(Offset) * scale4(Scale) * translate(-Offset) * fracRotation1;
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
		t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		z = abs(z);
		t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		z = abs(z);
		// Rotate, scale, rotate (we need to cast to a 4-component vector).
		z = (M*vec4(z,1.0)).xyz;s/=Scale;
		if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,dot(z.xyz,z.xyz))));
			
	}
		//Distance to the plane going through vec3(Size,0.,0.) and which normal is plnormal
	return abs(s*dot(z-vec3(Size,0.,0.),normalize(plnormal)));
}

#preset Default
FOV = 0.62536
Eye = -2.168,0.275017,0.026396
Target = 6.62373,-0.818231,-0.169854
Up = 0.0869992,0.563954,0.755835
AntiAlias = 1
Detail = -2.72566
DetailAO = -1.14289
FudgeFactor = 0.86747
MaxRaySteps = 154
BoundingSphere = 3
Dither = 0.35965
AO = 0,0,0,0.91358
Specular = 2.4348
SpecularExp = 16
SpotLight = 1,1,1,0.73563
SpotLightDir = -0.52,0.1
CamLight = 1,1,1,0.77273
CamLightMin = 0
Glow = 1,1,1,0
Fog = 0.10738
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.5625
X = 0.411765,0.6,0.560784,-0.81396
Y = 0.666667,0.666667,0.498039,0.86886
Z = 0.666667,0.333333,1,-0.18032
R = 0.4,0.7,1,-0.0353
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 8.42145
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Size = 0.40776
plnormal = 1,0.31708,0
Iterations = 2
Scale = 2.099
Offset = 0.8,0.81053,0.33684
Angle1 = 0
Rot1 = 1,1,1
Angle2 = 0
Rot2 = 1,1,1
Bailout = 100
ColorIterations = 1
#endpreset