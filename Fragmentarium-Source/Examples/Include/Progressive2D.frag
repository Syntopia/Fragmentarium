#donotrun

#buffer RGBA32F
#buffershader "BufferShader.frag"

// This is a utlity program for setting
// up anti-aliased 2D rendering.

#vertex

#group Camera

// Use this to adjust clipping planes

uniform vec2 Center; slider[(-10,-10),(0,0),(10,10)] NotLockable
uniform float Zoom; slider[0,1,100] NotLockable
uniform float AntiAliasScale;slider[0.0,1,2] NotLockable


uniform vec2 pixelSize;

varying vec2 coord;
varying vec2 aaScale;
varying vec2 viewCoord;

void main(void)
{
	float ar = pixelSize.y/pixelSize.x;
	gl_Position =  gl_Vertex;
	viewCoord = (gl_Vertex).xy;
	coord = ((gl_ProjectionMatrix*gl_Vertex).xy/Zoom+  Center);
	coord.x*= ar;
     
	aaScale = vec2(gl_ProjectionMatrix[0][0],gl_ProjectionMatrix[1][1])*pixelSize*AntiAliasScale/Zoom;
}

#endvertex


varying vec2 coord;
varying vec2 aaScale;
varying vec2 viewCoord;
vec2 aaCoord;
uniform vec2 pixelSize;

// Anti-alias [1=1 samples / pixel, 2 = 4 samples, ...]
uniform int AntiAlias;slider[1,2,15];

vec3 getColor2D(vec2 z) ;

vec3 getColor2Daa(vec2 z) {
	vec3 v = vec3(0.0,0.0,0.0);
	float d = 1.0/float(AntiAlias);
	vec2 ard = vec2(pixelSize.x,pixelSize.y)*d;
	for (int x=0; x <AntiAlias;x++) {
		for (int y=0; y <AntiAlias;y++) {
		       aaCoord = (viewCoord + vec2(x,y)*ard);
			v +=  getColor2D(z+vec2(x,y)*d*aaScale);
             }
	}
	
	return v/(float(AntiAlias*AntiAlias));
}

void init(); // forward declare

uniform int backbufferCounter;

vec2 rand(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return
	vec2(fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453),
		fract(cos(dot(co.xy ,vec2(4.898,7.23))) * 23421.631));
}

uniform sampler2D backbuffer;
uniform float AARange; slider[0.1,1.,15.3]
uniform float AAExp; slider[0.1,1,15.3]
uniform bool GaussianAA; checkbox[true]
void main() {
	init();

      vec2 r = rand(viewCoord*(float(backbufferCounter)+1.0))-vec2(0.5);	
	if (GaussianAA) r*=AARange;
      vec2 c = coord.xy+aaScale*r;
	vec3 color =  getColor2D(c);
      
      vec4 prev = texture2D(backbuffer,(viewCoord+vec2(1.0))/2.0);
	float w =1.0;
	if (GaussianAA) w= exp(-(dot(r,r)*AARange*AARange)/AAExp);
	gl_FragColor = prev+vec4(color*w, w);
}

