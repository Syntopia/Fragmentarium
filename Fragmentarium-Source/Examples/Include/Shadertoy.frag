#donotrun

#vertex

#group Camera

uniform vec2 pixelSize;
varying vec3 iResolution;
varying float iGlobalTime;

void main(void)
{
	gl_Position =  gl_Vertex;	
}

#endvertex

#group Settings

uniform vec2 pixelSize;
uniform float time;
vec3 iResolution = vec3(1.0/pixelSize.x, 1.0/pixelSize.y, 1.0);
float iGlobalTime = time;
