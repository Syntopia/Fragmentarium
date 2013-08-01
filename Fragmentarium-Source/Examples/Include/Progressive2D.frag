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
	aaScale = vec2(gl_ProjectionMatrix[0][0],gl_ProjectionMatrix[1][1])*pixelSize/Zoom;
}

#endvertex

#group Post
uniform float Gamma; slider[0.0,2.2,5.0]
// 1: Linear, 2: Exponential, 3: Filmic, 4: Reinhart
uniform int ToneMapping; slider[1,1,4]
uniform float Exposure; slider[0.0,1.0,30.0]
uniform float Brightness; slider[0.0,1.0,5.0];
uniform float Contrast; slider[0.0,1.0,5.0];
uniform float Saturation; slider[0.0,1.0,5.0];

uniform float AARange; slider[0.0,2.,15.3]
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

uniform int subframe;

vec2 rand(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return
	vec2(fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453),
		fract(cos(dot(co.xy ,vec2(4.898,7.23))) * 23421.631));
}

uniform sampler2D backbuffer;


vec2 uniformDisc(vec2 co) {
	if (co == vec2(0.0)) return vec2(0.0);
	vec2 r = rand(co);
	return sqrt(r.y)*vec2(cos(r.x*6.28),sin(r.x*6.28));
}

void main() {
    aaCoord = viewCoord;
#ifdef providesInit
	init();
#endif
    //  vec2 r = rand(viewCoord*(float(subframe)+1.0))-vec2(0.5);	
#ifdef providesFiltering
	 vec4 prev = texture2D(backbuffer,(viewCoord+vec2(1.0))/2.0);
	vec4 new = color(coord.xy);
#ifdef linearGamma
     gl_FragColor = prev+ new;
#else
     gl_FragColor = prev+vec4( pow(new.xyz,vec3(Gamma)) , new.w);
#endif
 #else
	vec2 r = uniformDisc(vec2( 1.0*(float(subframe+1)) ));
	float w =1.0;
      if (GaussianAA) {
	 	// Gaussian
		w= exp(-dot(r,r)/AAExp)-exp(-1.0/AAExp);
				
	      // Lancos
	      // w = sin(r.x)*sin(r.x/AARange)*sin(r.y)*sin(r.y/AARange)/(r.x*r.x*r.y*r.y*AARange*AARange);
	      // if (w!=w) w = 1.0;
	} // else {  w =pow( 1.0-length(r),1.0);};

	r*=AARange;
	vec2 c = coord.xy+aaScale*r;
#ifdef linearGamma
	vec3 color =  color(c);
#else
      vec3 color = pow( color(c),vec3(Gamma));
#endif

      vec4 prev = texture2D(backbuffer,(viewCoord+vec2(1.0))/2.0);

	if (color!=color) { color =vec3( 0.0); w = 0.0; } // NAN check
      gl_FragColor = prev+vec4(color*w, w);
#endif
}

