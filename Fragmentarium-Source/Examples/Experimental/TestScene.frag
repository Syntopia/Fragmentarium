// Write fragment code here...
#info SphereSponge Distance Estimator.
#define providesInit
#define providesColor
#include "Env-De-Raytracer.frag"
#include "MathUtils.frag"
#include "QuilezLib.frag"
#group New Menger


uniform sampler2D tex; file[f:\texture.jpg]
uniform float TextureScale; slider[0,1,40]


vec3 C(vec2 p) {
if (mod(p.x,1.0)<0.03) return vec3(1.0);
if (mod(p.y,1.0)<0.03) return vec3(1.0);
return vec3(0.0);
}
vec3 baseColor(vec3 p, vec3 n) {

//if (p.z<0.01) return vec3(0.9);
p*=TextureScale;
//return C(p.xy);
n = abs(n); //n = sqrt(n);
n = n/(n.x+n.y+n.z);
float G= 2.2;
vec3 t = pow( texture2D(tex, p.yz),G)*n.x
		+ pow( texture2D(tex, p.xz),G)*n.y+
		 pow( texture2D(tex, p.xy),G)*n.z;

return t;
t =C( p.yz)*n.x*vec3(1,0,0)
		+C( p.xz)*n.y*vec3(0,1,0)+
		 C( p.xy)*n.z*vec3(0,0,1);
	return t;
}


// Number of iterations.
uniform int Iterations;  slider[0,10,100]
uniform int ColorIterations;  slider[0,4,100]

// Scale parameter.
uniform float Scale; slider[0.00,3.0,4.00]

uniform vec3 Rotation; slider[(-180,-180,-180),(0,0,0),(180,180,180)]

// Scaling center
uniform vec3 Offset; slider[(0,0,0),(0,0,0),(1,1,1)]

mat3 rot;

void init() {
	 rot = rotationMatrixXYZ(Rotation);
}


float DE(vec3 p)
{

float d = length(p+vec3(0.0,0.0,-0.25))-0.25;
d= min(d, udRoundBox(p+vec3(0.,1.,-0.25),vec3(0.2),0.05));
d =min(d, sdCone(p+vec3(1.,1.,-0.5),vec2(0.5,0.5)));
d = min(d, sdTorus88(p+vec3(-1.4,1.,-0.6),vec2(0.5,0.1)));
//return d;
	 return min(p.z,d);// distance estimate
//	return ;
}


#preset Default
FOV = 0.412913
Eye = -1.76912,0.833679,1.42355
Target = 4.35711,-5.78838,-2.89126
Up = 0.0961753,-0.479164,0.871937
FocalPlane = 1
Aperture = 0
Gamma = 0.92595
ToneMapping = 3
Exposure = 0.9783
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 2
Detail = -3.65484
DetailAO = -1.14289
FudgeFactor = 1
MaxRaySteps = 198
BoundingSphere = 4.3373
Dither = 0.5
NormalBackStep = 1
AO = 0,0,0,0.82716
CamLight = 1,1,1,0.65384
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0.25926
BaseColor = 0.666667,0.333333,0
OrbitStrength = 0
X = 0.5,0.6,0.6,0.2126
Y = 1,0.6,0,0.30708
Z = 0.8,0.78,1,0.35434
R = 0.666667,0.666667,0.498039,0.03174
BackgroundColor = 1,1,1
GradientBackground = 0.4348
CycleColors = false
Cycles = 1.1
EnableFloor = true
FloorNormal = 0,0,0.17074
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
ColorIterations = 4
Scale = 3
Rotation = 0,0,0
Offset = 0,0,0
TextureScale = 1.0668
Shadow = 0.56818
EnvSpecular = 0.28358,0
EnvDiffuse = 1,0,1
SpecularMax = 10
Sun = -1.57075,-0.63403
SunSize = 0.0219905
ShowFloor = false
#endpreset
