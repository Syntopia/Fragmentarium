#donotrun

#buffer RGBA32F
#buffershader "DepthBufferShader.frag"

#info Simple 3D Setup
#camera 3D

#vertex

#group Camera
// Field-of-view
uniform float FOV; slider[0,0.4,2.0] NotLockable
uniform vec3 Eye; slider[(-50,-50,-50),(0,0,-10),(50,50,50)] NotLockable
uniform vec3 Target; slider[(-50,-50,-50),(0,0,0),(50,50,50)] NotLockable
uniform vec3 Up; slider[(0,0,0),(0,1,0),(0,0,0)] NotLockable


//varying vec3 from;
uniform vec2 pixelSize;
varying vec2 coord;
varying vec2 viewCoord;
varying vec2 viewCoord2;
//varying vec3 dir;
varying vec3 Dir;
varying vec3 UpOrtho;
varying vec3 Right;
uniform int backbufferCounter;
varying vec2 PixelScale;

#ifdef providesInit
void init(); // forward declare
#else
void init() {}
#endif

vec2 rand(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return
	vec2(fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453),
		fract(cos(dot(co.xy ,vec2(4.898,7.23))) * 23421.631));
}



void main(void)
{
	gl_Position =  gl_Vertex;
	coord = (gl_ProjectionMatrix*gl_Vertex).xy;
	coord.x*= pixelSize.y/pixelSize.x;
	
	// we will only use gl_ProjectionMatrix to scale and translate, so the following should be OK.
	PixelScale =vec2(pixelSize.x*gl_ProjectionMatrix[0][0], pixelSize.y*gl_ProjectionMatrix[1][1]);
	viewCoord = gl_Vertex.xy;
	viewCoord2= (gl_ProjectionMatrix*gl_Vertex).xy;
	
	//from = Eye;
	Dir = normalize(Target-Eye);
	UpOrtho = normalize( Up-dot(Dir,Up)*Dir );
	Right = normalize( cross(Dir,UpOrtho));
	coord*=FOV;
	init();
}
#endvertex

#group Camera
uniform bool EquiRectangular; checkbox[false]


#group Raytracer

#define PI  3.14159265358979323846264

// Camera position and target.
//varying vec3 from;
//varying vec3 dir;
//varying vec3 dirDx;
//varying vec3 dirDy;
varying vec2 coord;
//varying float zoom;

uniform int backbufferCounter;
uniform sampler2D backbuffer;
varying vec2 viewCoord;
varying vec2 viewCoord2;
varying vec3 Dir;
varying vec3 UpOrtho;
varying vec3 Right;



#ifdef providesInit
void init(); // forward declare
#else
void init() {}
#endif
//out vec4 gl_FragColor;
#group Post
uniform float Gamma; slider[0.0,1.0,5.0]
// 1: Linear, 2: Expontial, 3: Filmic, 4: Reinhart
uniform int ToneMapping; slider[1,1,4]
uniform float Exposure; slider[0.0,1.0,3.0]
uniform float Brightness; slider[0.0,1.0,5.0];
uniform float Contrast; slider[0.0,1.0,5.0];
uniform float Saturation; slider[0.0,1.0,5.0];

varying vec2 PixelScale;
uniform float FOV;

// implement this;
vec4 color(vec3 cameraPos, vec3 direction,float prev);

// Given a camera pointing in 'dir' with an orthogonal 'up' and 'right' vector
// and a point, coord, in screen coordinates from (-1,-1) to (1,1),
// a ray tracer direction is returned
vec3 equiRectangularDirection(vec2 coord, vec3 dir, vec3 up, vec3 right)  {
	vec2 r = vec2(coord.x,(1.0-coord.y)*0.5)*PI;
	return cos(r.x)*sin(r.y)*dir+
	sin(r.x)*sin(r.y)*right+
	cos(r.y)*up;
}
uniform vec3 Eye;


void main() {
	init();
	vec3 hitNormal = vec3(0.0);
	vec3 hit;
	
	vec3 rayDir =  (Dir+ coord.x*Right+coord.y*UpOrtho);
	rayDir = normalize(rayDir);
	
	if (EquiRectangular) {
		rayDir = equiRectangularDirection(viewCoord2, Dir, UpOrtho, Right);
	}
	
	vec4 prev = texture2D(backbuffer,(viewCoord+vec2(1.0))/2.0);
	vec4 c =  color(Eye,rayDir, prev.w);
	gl_FragColor =c;
}
