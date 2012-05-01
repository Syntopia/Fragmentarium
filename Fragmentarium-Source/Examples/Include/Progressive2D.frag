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
	coord = (((gl_ProjectionMatrix*gl_Vertex).xy*vec2(ar,1.0))/Zoom+  Center);
	aaScale = vec2(gl_ProjectionMatrix[0][0],gl_ProjectionMatrix[1][1])*pixelSize*AntiAliasScale/Zoom;
}

#endvertex

#group Post
uniform float Gamma; slider[0.0,2.2,5.0]
uniform bool ExponentialExposure; checkbox[false]
uniform float Exposure; slider[0.0,1.3,30.0]
uniform float Brightness; slider[0.0,1.0,5.0];
uniform float Contrast; slider[0.0,1.0,5.0];
uniform float Saturation; slider[0.0,1.0,5.0];

uniform float AARange; slider[0.0,1.,15.3]
uniform float AAExp; slider[0.0,1,15.3]
uniform bool GaussianAA; checkbox[true]

varying vec2 coord;
varying vec2 aaScale;
varying vec2 viewCoord;
vec2 aaCoord;
uniform vec2 pixelSize;

#ifdef providesFiltering
	vec4 color(vec2 z) ;
#else 
	vec3 color(vec2 z) ;
#endif

#ifdef providesInit
void init(); // forward declare
#endif

uniform int backbufferCounter;

vec2 rand(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return
	vec2(fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453),
		fract(cos(dot(co.xy ,vec2(4.898,7.23))) * 23421.631));
}

uniform sampler2D backbuffer;


vec2 uniformDisc(vec2 co) {
	if (co == 0.0) return vec2(0.0);
	vec2 r = rand(co);
	return sqrt(r.y)*vec2(cos(r.x*6.28),sin(r.x*6.28));
}

void main() {
    aaCoord = viewCoord;
#ifdef providesInit
	init();
#endif
    //  vec2 r = rand(viewCoord*(float(backbufferCounter)+1.0))-vec2(0.5);	
#ifdef providesFiltering
	 vec4 prev = texture2D(backbuffer,(viewCoord+vec2(1.0))/2.0);
      gl_FragColor = prev+color(coord.xy);
#else
	vec2 r = uniformDisc( viewCoord*(float(backbufferCounter)) );
	float w =1.0;
      if (GaussianAA) {
	 	// Gaussian
		w= exp(-dot(r,r)/AAExp)-exp(-1.0/AAExp);
		r*=AARange;
				
	      // Lancos
	      // w = sin(r.x)*sin(r.x/AARange)*sin(r.y)*sin(r.y/AARange)/(r.x*r.x*r.y*r.y*AARange*AARange);
	      // if (w!=w) w = 1.0;
	}
	vec2 c = coord.xy+aaScale*r;
	vec3 color =  color(c);
      vec4 prev = texture2D(backbuffer,(viewCoord+vec2(1.0))/2.0);

	if (color!=color) { color =vec3( 0.0); w = 0.0; } // NAN check
      gl_FragColor = prev+vec4(color*w, w);
#endif
}

