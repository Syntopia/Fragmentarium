#donotrun

// For higher precision experiments

#vertex

#group Camera

// Use this to adjust clipping planes

uniform vec2 Center; slider[(-10,-10),(0,0),(10,10)] NotLockable
uniform float Zoom; slider[0,1,100] NotLockable
uniform float AntiAliasScale;slider[0.0,1,2] NotLockable


uniform vec2 pixelSize;

varying vec2 coord;
varying vec2 viewCoord;

void main(void)
{
	float ar = pixelSize.y/pixelSize.x;
	gl_Position =  gl_Vertex;
	viewCoord = (gl_ProjectionMatrix*gl_Vertex).xy;
	coord = (((gl_ProjectionMatrix*gl_Vertex).xy*vec2(ar,1.0)));
}

#endvertex


varying vec2 coord;
varying vec2 viewCoord;
uniform vec2 pixelSize;


vec3 color(vec2 z) ;



#ifdef providesInit
void init(); // forward declare
#endif

void main() {
#ifdef providesInit
	init(); 
#endif
	gl_FragColor = vec4(color(coord.xy),1.0);
}

