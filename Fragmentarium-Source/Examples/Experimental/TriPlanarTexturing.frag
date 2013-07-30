#info SphereSponge Distance Estimator.
#define providesInit
#define providesColor
#include "Soft-Raytracer.frag"
#include "MathUtils.frag"
#group New Menger


uniform sampler2D tex; file[texture.jpg]
uniform float TextureScale; slider[0,1,10]
vec3 baseColor(vec3 p, vec3 n) {
p=p*0.5+vec3(0.5);
	
if (p.z<0.01) return vec3(0.9);
p*=TextureScale;
n = abs(n);
n = n/(n.x+n.y+n.z);
float G= 2.2;
vec3 t = pow( texture2D(tex, p.yz).xyz,vec3(G))*n.x
		+ pow( texture2D(tex, p.xz).xyz,vec3(G))*n.y+
		 pow( texture2D(tex, p.xy).xyz,vec3(G))*n.z;

	return t;
}


// Based on a fractal proposed by Buddhi, with a DE outlined by Knighty:
// http://www.fractalforums.com/3d-fractal-generation/revenge-of-the-half-eaten-menger-sponge/

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
	p=p*0.5+vec3(0.5);
	vec3 pp= abs(p-0.5)-0.5;
	float k=1.0;
	float d1 = max(pp.x,max(pp.y,pp.z));
	float d=d1;
	for (int i = 0; i < Iterations ; i++)
	{
		vec3 pa = mod(3.0*p*k, 3.0);
		k *= Scale;
		
		pp = 0.5-abs(pa-1.5)+Offset;
             pp*=rot;
		d1=min(max(pp.x,pp.z),min(max(pp.x,pp.y),max(pp.y,pp.z)))/k;//distance inside the 3 axis aligned square tubes
		d=max(d,d1);
		if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(pp,dot(pp,pp))));
	
	}
		
	// Use this to crop to a sphere:
	 float e = clamp(length(p)-1.0, 0.0,100.0);
	 return min(p.z,max(d,e));// distance estimate
//	return ;
}


#preset Default
FOV = 0.4
Eye = 1.69004,2.15868,0.537876
Target = -3.89031,-5.74428,-1.99253
Up = -0.172741,-0.187486,0.966505
FocalPlane = 1
Aperture = 0
Gamma = 0.64815
ToneMapping = 3
Exposure = 1.3044
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 2
Detail = -3.40711
DetailAO = -0.35714
FudgeFactor = 1
MaxRaySteps = 198
BoundingSphere = 4.3373
Dither = 0.5
NormalBackStep = 1
AO = 0,0,0,1
CamLight = 1,1,1,0.5
CamLightMin = 0.61176
Glow = 1,1,1,0.05479
GlowMax = 20
Fog = 0.25926
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,0.2126
Y = 1,0.6,0,0.30708
Z = 0.8,0.78,1,0.35434
R = 0.666667,0.666667,0.498039,0.03174
BackgroundColor = 1,1,1
GradientBackground = 0.4348
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0.17074
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 10
ColorIterations = 4
Scale = 3
Rotation = 0,0,0
Offset = 0,0,0
TextureScale = 1
Specular = 3.9241
SpecularExp = 20
SpotLight = 1,1,1,4.8889
SpotLightPos = -2.2222,10,4.8148
SpotLightSize = 0.1
Reflection = 0
#endpreset
