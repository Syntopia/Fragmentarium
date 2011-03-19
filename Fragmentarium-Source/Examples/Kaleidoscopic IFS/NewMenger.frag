#info SphereSponge Distance Estimator.
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group New Menger

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
	//  float e = clamp(length(z)-2.0, 0.0,100.0);
	//  return max(d,e);// distance estimate
	return d;
}

#preset NM1
FOV = 0.69449
Eye = -0.773149,-1.68286,0.623944
Target = 2.68378,3.05437,-0.790643
Up = 0.25548,0.100005,0.959235
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.3
DetailNormal = -2.8
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 1.8
BoundingSphere = 2
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
Glow = 1,1,1,0
Fog = 0.21484
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.6,0.121569,0.231373
GradientBackground = 0.3
Iterations = 10
Scale = 3
Rotation = -151.798,-22.3956,-9.1332
Offset = 0,0.60494,0
Dither = 0.62449
#endpreset

#preset NM2
FOV = 0.69449
Eye = -0.184105,-0.317218,1.08875
Target = -1.69035,2.49456,-3.58683
Up = 0.767584,0.624303,0.128162
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.5574
DetailNormal = -3.31751
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 1.8
BoundingSphere = 2
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
Glow = 1,1,1,0
Fog = 0.21484
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.129412,0.6,0.145098
GradientBackground = 0.452
Iterations = 12
Scale = 1.83132
Rotation = -92.0736,-9.1332,60.552
Offset = 0.06995,0.60494,0.50205
Dither = 0.62449
#endpreset

#preset Default
FOV = 0.4
Eye = -3.72729,-0.0860174,-1.93389
Target = 5.14721,0.118786,2.6706
Up = -0.0648372,0.997212,-0.0369503
AntiAlias = 1
AntiAliasBlur = 1
Detail = -1.99269
DetailNormal = -2.42305
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 1.8
BoundingSphere = 4.3373
Dither = 0.5
AO = 0,0,0,0.7
Specular = 0.1666
SpecularExp = 16
SpotLight = 1,1,1,0.03261
SpotLightDir = 0.37142,0.1
CamLight = 1,1,1,1.13978
Glow = 1,1,1,0
Fog = 0.4161
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.2126
Y = 1,0.6,0,0.30708
Z = 0.8,0.78,1,0.35434
R = 0.666667,0.666667,0.498039,0.03174
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
Iterations = 10
ColorIterations = 4
Scale = 3
Rotation = 0,0,0
Offset = 0,0,0
#endpreset
