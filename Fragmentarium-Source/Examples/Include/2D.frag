#donotrun

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
	viewCoord = (gl_ProjectionMatrix*gl_Vertex).xy;
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
uniform int AntiAlias;slider[1,1,15];

vec3 color(vec2 z) ;

vec3 getColor2Daa(vec2 z) {
	vec3 v = vec3(0.0,0.0,0.0);
	float d = 1.0/float(AntiAlias);
	vec2 ard = vec2(pixelSize.x,pixelSize.y)*d;
	for (int x=0; x <AntiAlias;x++) {
		for (int y=0; y <AntiAlias;y++) {
		       aaCoord = (viewCoord + vec2(x,y)*ard);
			v +=  color(z+vec2(x,y)*d*aaScale);
             }
	}
	
	return v/(float(AntiAlias*AntiAlias));
}

#ifdef providesInit
void init(); // forward declare
#endif

void main() {
#ifdef providesInit
	init(); 
#endif
	gl_FragColor = vec4(getColor2Daa(coord.xy),1.0);
}

