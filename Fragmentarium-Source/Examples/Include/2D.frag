#vertex

#group Camera

// Use this to adjust clipping planes

uniform vec2 Center; slider[(-10,-10),(0,0),(10,10)];
uniform float Zoom; slider[0,1,100];
uniform float AntiAliasScale;slider[0.0,1,5];

uniform vec2 pixelSize;

varying vec2 coord;
varying vec2 aaScale;
varying vec2 viewCoord;

void main(void)
{
	float ar = pixelSize.y/pixelSize.x;
	gl_Position =  gl_Vertex;
	viewCoord = gl_Position.xy;
	coord = ((gl_ProjectionMatrix*gl_Vertex).xy/Zoom+  Center);
	coord.x*= ar;
     
	aaScale = mat2(gl_ProjectionMatrix)*pixelSize*AntiAliasScale/Zoom;
}
#endvertex


varying vec2 coord;
varying vec2 aaScale;
varying vec2 viewCoord;
vec2 aaCoord;
uniform vec2 pixelSize;

// Anti-alias [1=1 samples / pixel, 2 = 4 samples, ...]
uniform int AntiAlias;slider[1,2,5];

vec3 getColor2D(vec2 z) ;

vec3 getColor2Daa(vec2 z) {
	vec3 v = vec3(0.0,0.0,0.0);
	float d = 1.0/float(AntiAlias);
	for (int x=1; x <=AntiAlias;x++) {
		for (int y=1; y <=AntiAlias;y++) {
		       aaCoord = viewCoord + vec2(x,y)*d*pixelSize;
			v +=  getColor2D(z+vec2(x,y)*d*aaScale);
             }
	}
	
	return v/(float(AntiAlias)*float(AntiAlias));
}

void init(); // forward declare

void main() {
	init();
	gl_FragColor = vec4(getColor2Daa(coord.xy),1.0);
}

