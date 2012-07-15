#info X-Raytracer (by Kali, based on Syntopia's default raytracer)
#info Modes: 1) exp.smoothing - 2) step count - 3) average (noisy) 
#info Distance fading works only on mode 1


#include "MathUtils.frag"

#camera 3D

#vertex

#group Camera

uniform float FOV; slider[0,0.4,2.0] NotLockable
uniform vec3 Eye; slider[(-50,-50,-50),(0,0,-10),(50,50,50)] NotLockable
uniform vec3 Target; slider[(-50,-50,-50),(0,0,0),(50,50,50)] NotLockable
uniform vec3 Up; slider[(0,0,0),(0,1,0),(0,0,0)] NotLockable

varying vec3 dirDx;
varying vec3 dirDy;
varying vec3 from;
uniform vec2 pixelSize;
varying vec2 coord;
varying float zoom;
varying vec3 dir;
void main(void)
{
	gl_Position =  gl_Vertex;
	coord = (gl_ProjectionMatrix*gl_Vertex).xy;
	coord.x*= pixelSize.y/pixelSize.x;
	vec2 ps =vec2(pixelSize.x*gl_ProjectionMatrix[0][0], pixelSize.y*gl_ProjectionMatrix[1][1]);
	zoom = length(ps);
	from = Eye;
	vec3 Dir = normalize(Target-Eye);
	vec3 up = Up-dot(Dir,Up)*Dir;
	up = normalize(up);
	vec3 Right = normalize( cross(Dir,up));
	dir = (coord.x*Right + coord.y*up )*FOV+Dir;
	dirDy = ps.y*up*FOV;
	dirDx = ps.x*Right*FOV;
}
#endvertex

#group Raytracer

varying vec3 from,dir,dirDx,dirDy;
varying vec2 coord;
varying float zoom;

uniform int AntiAlias;slider[1,1,5] Locked
uniform int Mode;  slider[1,1,3]
uniform int MaxRaySteps;  slider[0,56,2000]
uniform float BoundingSphere;slider[0,12,100];
uniform float MaxDistance;slider[0,50,100];
uniform float Brightness;slider[0,.2,1];
uniform float Fade; slider[0,0.0,1]


#group Coloring

uniform vec3 BaseColor; color[1.0,1.0,1.0];
uniform vec3 BackgroundColor; color[0.6,0.6,0.45]

float DE(vec3 pos) ; // Must be implemented in other file


vec3 trace(vec3 from, vec3 dir, inout vec3 hit, inout vec3 hitNormal) {
	hit = vec3(0.0);
	vec3 direction = normalize(dir);
	float dist = 0.0;
	float totalDist = 0.0;
	int steps;
	float dotFF = dot(from,from);
	float d = 0.0;
	float dotDE = dot(direction,from);
	float sq =  dotDE*dotDE- dotFF + BoundingSphere*BoundingSphere;
	if (sq>0.0) {
		d = -dotDE - sqrt(sq);
		if (d<0.0) {
			d = -dotDE + sqrt(sq);
			if (d<0.0) {
				sq = -1.0;
			} else {
				d = 0.0;
			}
		}
	}
	vec3 p;
	float bright=0;
	float dant=0;
	if (sq<0.0) {
		dist = MaxDistance;
		totalDist = MaxDistance;
		steps = 2;
	}  else {
		totalDist += .1; 
		for (steps=0; steps<MaxRaySteps; steps++) {
			p = from + totalDist * direction;
			dant=dist;
			dist = DE(p);
			totalDist += dist;
                    if (totalDist > MaxDistance) break;
			if (Mode==1) {			
				bright+=exp(-1*abs(dist-dant))-sqrt(totalDist)*Fade;
			}
			if (Mode==3) {			
				bright+=dist;
			}
		}
	}
      vec3 XColor;
	if (Mode==1) {
		bright=bright*Brightness*.02;
		XColor = mix(BackgroundColor,BaseColor, bright);
		}
	if (Mode==2) {
		bright=steps*Brightness*.02;
		XColor = mix(BackgroundColor,BaseColor, bright);
		}
	if (Mode==3) {
		bright=bright/steps/Brightness;
		XColor = mix(BaseColor,BackgroundColor, bright);
		}

	return XColor;
}

#ifdef providesInit
	void init(); 
#else
	void init() {}
#endif 

void main() {
	init();
	
	vec3 color = vec3(0.0,0.0,0.0);
	for (int x = 0; x<AntiAlias; x++) {
		float  dx = float(x)/float(AntiAlias);
		for (int y = 0; y<AntiAlias; y++) {
			float dy = float(y)/float(AntiAlias);
			vec3 nDir = dir+dirDx*dx+dirDy*dy;
			vec3 hitNormal = vec3(0.0);
			vec3 hit;
			vec3 c = trace(from,nDir,hit,hitNormal);
			color += c;
		}
	}
	color = clamp(color/float(AntiAlias*AntiAlias), 0.0, 1.0);
	gl_FragColor = vec4(color, 1.0);
}

#group SurfaceKIFS

uniform int Iterations;  slider[0,35,300]
uniform float Scale;  slider[0,1.3,3.0]
uniform vec3 Fold; slider[(0,0,0),(0,0,0),(1,1,1)]
uniform vec3 Julia; slider[(-2,-2,-2),(-0.5,-0.5,-0.5),(1,1,1)]
uniform vec3 RotVector; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
uniform float RotAngle; slider[-180,25,180]
mat3 rot;
float DE(vec3 pos) {
	 rot = rotationMatrix3(normalize(RotVector), RotAngle);
	vec3 p = pos, p0 = Julia;  
	int i=0;
	for (i=0; i<Iterations; i++) {
		p*=rot;
		p.xy=abs(p.xy+Fold.xy)-Fold.xy;
		p=p*Scale+p0;
	}
	return length(p)*pow(Scale, -float(i));
}

#preset default
FOV = 0.29268
Eye = 0.390605,-1.02648,1.85346
Target = -0.192543,-10.7523,4.10476
Up = 0.120355,0.216959,0.96846
AntiAlias = 1 NotLocked
MaxRaySteps = 500
BoundingSphere = 20
BaseColor = 1,1,1
BackgroundColor = 0,0,0
Iterations = 40
Scale = 1.23831
Fold = 0.61789,0.72358,0
Julia = -0.42476,-0.32204,-0.22034
RotVector = 0.2174,-0.06522,-1
RotAngle = 58.554
Brightness= 0.2
Fade=0.4
MaxDistance=50
Mode=1
#endpreset


#preset ice
FOV = 0.45528
Eye = -1.61875,1.33689,1.08089
Target = 6.29978,-4.68821,2.07851
Up = -0.461074,-0.482682,0.744586
AntiAlias = 1 NotLocked
MaxRaySteps = 462
BoundingSphere = 20
BaseColor = 0.709804,0.866667,1
BackgroundColor = 0,0,0.203922
Mode = 2
MaxDistance = 42.857
Brightness = 0.19355
Fade = 0
Iterations = 30
Scale = 1.3983
Fold = 0.34146,0.78862,0
Julia = -1.18643,-0.93221,-0.37289
RotVector = -0.08696,0.6087,-0.93478
RotAngle = 49.878
#endpreset

#preset hell
FOV = 0.45528
Eye = -0.742129,-1.60924,9.17712
Target = -10.4339,-0.738062,6.8724
Up = -0.117808,-0.906216,0.406071
AntiAlias = 1 NotLocked
MaxRaySteps = 923
BoundingSphere = 20
BaseColor = 1,0,0
BackgroundColor = 0,0,0
MaxDistance = 4.286
Brightness = 0.07527
Fade = 0
Mode = 3
Iterations = 40
Scale = 1.22034
Fold = 0.56911,1,0
Julia = 0.00847,0.16102,-1.31357
RotVector = 0.63044,-0.17392,-0.52174
RotAngle = 84.5784
#endpreset 

#preset jellyfish
FOV = 0.5691
Eye = 10.377,-16.3079,-2.45243
Target = 4.6274,-8.12954,-2.68841
Up = 0.100547,0.00762862,0.994903
AntiAlias = 1 NotLocked
MaxRaySteps = 440
BoundingSphere = 22.642
BaseColor = 1,0.898039,0.768627
BackgroundColor = 0,0,0
MaxDistance = 57.143
Brightness = 0.77419
Fade = 0.19167
Mode = 1
Iterations = 55
Scale = 1.11864
Fold = 0.94309,0.96748,0
Julia = -1.72034,0.41524,-0.34745
RotVector = 0.08696,-0.13004,-0.98676
RotAngle = 106.265
#endpreset 

#preset woods
FOV = 0.4
Eye = 1.03325,3.65334,-2.83569
Target = 8.59369,9.43266,0.236633
Up = 0.543367,-0.29252,-0.786873
AntiAlias = 1 NotLocked
MaxRaySteps = 462
BoundingSphere = 22.642
BaseColor = .3,1,.3
BackgroundColor = 0,0,0
MaxDistance = 47.143
Brightness = 1
Fade = 0.3
Mode = 1
Iterations = 70
Scale = 1.14765
Fold = 0.91057,1,0
Julia = -1.72034,0.44068,-0.34745
RotVector = 0.08696,-0.1087,-0.97826
RotAngle = 110.603
#endpreset 

#preset fungus
FOV = 0.4
Eye = 8.40118,0.520572,-2.87496
Target = 3.66074,-0.402192,5.88157
Up = 0.875682,-0.153124,0.457924
AntiAlias = 1 NotLocked
MaxRaySteps = 505
BoundingSphere = 28.302
BaseColor = 1,0.772549,0.929412
BackgroundColor = 0.0509804,0.0509804,0.0823529
MaxDistance = 7.601
Brightness = 0.22581
Fade = 0
Mode = 2
Iterations = 56
Scale = 1.15539
Fold = 1,1,0
Julia = -2,0.38983,-0.37289
RotVector = 0.08696,-0.13044,0.14976
RotAngle = -45.5796
#endpreset 

#preset entangled
FOV = 0.52032
Eye = 7.54408,0.619203,3.64936
Target = -2.35567,-0.767337,3.91836
Up = -0.0778067,0.694056,0.714014
AntiAlias = 1 NotLocked
MaxRaySteps = 286
BoundingSphere = 13.208
BaseColor = 1,0.521569,0.607843
BackgroundColor = 0.203922,0,0
MaxDistance = 7.181
Brightness = 1
Fade = 0.325
Mode = 1
Iterations = 50
Scale = 1.15539
Fold = 1,1,0
Julia = -2,0.38983,-0.37289
RotVector = 0.08696,-0.13044,0.14976
RotAngle = 23.8464
#endpreset 


#preset  spirals
FOV = 0.06504
Eye = -27.6577,-28.3161,-0.926331
Target = -20.4699,-21.3694,-0.648506
Up = 0.357276,-0.334803,-0.871929
AntiAlias = 1 NotLocked
MaxRaySteps = 637
BoundingSphere = 37.736
BaseColor = 1,1,1
BackgroundColor = 0,0,0
MaxDistance = 100
Brightness = 0.34409
Fade = 0.1202
Mode = 1
Iterations = 65
Scale = 1.14408
Fold = 0,0.89431,0
Julia = -2,-2,-0.32204
RotVector = -0.26086,-0.2174,0.02174
RotAngle = -19.5192
#endpreset 

#preset microscopic
FOV = 0.4
Eye = -0.107293,0.299018,2.92629
Target = 6.18173,-0.599128,10.6491
Up = -0.736555,-0.386862,0.55482
AntiAlias = 1 NotLocked
MaxRaySteps = 286
BoundingSphere = 13.208
BaseColor = 0.823529,1,0.835294
BackgroundColor = 0,0,0
MaxDistance = 4.286
Brightness = 0.1828
Fade = 0
Mode = 2
Iterations = 35
Scale = 1.33857
Fold = 0,0.26829,0.01626
Julia = -0.93221,-0.3983,-1.21187
RotVector = -0.30434,-0.23914,-0.73914
RotAngle = -58.554
#endpreset 
