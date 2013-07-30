#buffer RGBA32F
#buffershader "BufferShaderRD.frag"
#include "2D.frag"

// A simple Gray-Scott Reaction Diffusion model.
// Based on Tim Hutton's example from Ready: http://code.google.com/p/reaction-diffusion/source/browse/trunk/GrayScott/gray_scott.cpp

// These are Fragmentarium host defines.
#define DontClearOnChange
#define IterationsBetweenRedraws 30
#define SubframeMax 0

#group Post
uniform float Gamma; slider[0.0,2.2,5.0]
uniform vec3 Exposure; slider[(0.0,0.0,0.0),(1.0,1.0,1.0),(2.0,2.0,2.0)]
uniform float Brightness; slider[0.0,1.0,5.0];
uniform float Contrast; slider[0.0,1.0,5.0];
uniform float Saturation; slider[0.0,1.0,5.0];
uniform float Slope; slider[0,0.01,0.1]
uniform vec3 Light; slider[(-1,-1,-1),(1,1,1),(1,1,1)]

#group ReactionDiffusion

uniform sampler2D backbuffer;

vec2 position = (viewCoord*1.0+vec2(1.0))/2.0;


float rand(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

#TexParameter backbuffer GL_TEXTURE_MAG_FILTER GL_NEAREST
#TexParameter backbuffer GL_TEXTURE_WRAP_S GL_REPEAT
#TexParameter backbuffer GL_TEXTURE_WRAP_T GL_REPEAT

vec4 P = vec4(pixelSize, 0.0, -pixelSize.x);

// nine point stencil
vec4 laplacian9() {
	return  
	0.5* texture2D( backbuffer,  position - P.xy ) // first row
	+ texture2D( backbuffer,  position - P.zy )
	+  0.5* texture2D( backbuffer,  position - P.wy )
	+  texture2D( backbuffer,  position - P.xz) // seond row
	- 6.0* texture2D( backbuffer,  position )
	+   texture2D( backbuffer,  position + P.xz )
	+  0.5*texture2D( backbuffer,  position +P.wy)  // third row
	+ texture2D( backbuffer,  position +P.zy )
	+   0.5*texture2D( backbuffer,  position + P.xy   );	
}


// five point stencil
vec4  laplacian5() {
	return 
	+  texture2D( backbuffer, position - P.zy)
	+  texture2D( backbuffer, position - P.xz) 
	-  4.0 * texture2D( backbuffer,  position )
	+ texture2D( backbuffer,  position + P.xz )
	+ texture2D( backbuffer,  position +  P.zy );
}

uniform vec2 Diffusion; slider[(0,0),(0.082,0.041),(0.2,0.2)]
uniform float k; slider[0,0.064,0.1]
uniform float f; slider[0,0.035,0.1]
uniform float timeStep; slider[0,1.,2]
uniform int subframe;

vec3 color(vec2 z) {
	// Seed
	if (subframe <3) {
		if (length(z)<0.1+0.5*rand(z+float(subframe))) {
			return vec3(1.0,0.0,0.0);
		}  else {
			return vec3(0.0,1.0,0.0);
		}
	}
	
	vec4 v = texture2D( backbuffer,    position   );
	v.z = 0.0;
	vec2 lv = laplacian9().xy;
	float xyy = v.x*v.y*v.y;
	vec2 dV = vec2( Diffusion.x * lv.x - xyy + f*(1.-v.x), Diffusion.y * lv.y + xyy - (f+k)*v.y);
	v.xy+= timeStep*dV;
	return v.xyz;
}


#preset Default
Center = 0,0
Zoom = 6.15279
AntiAliasScale = 1
AntiAlias = 1
Center = 0,-0.00611664
Zoom = 6.15279
AntiAliasScale = 1
AntiAlias = 1
Gamma = 2.2
Exposure = 1,1,1
Brightness = 1
Contrast = 1
Saturation = 1
timeStep = 0.9
k = 0.064
f = 0.035
#endpreset

#preset Spots
k = 0.064
f = 0.035
#endpreset

#preset Stripes
k = 0.06
f = 0.035
#endpreset

#preset Long Stripes
k = 0.065
f = 0.056
#endpreset

#preset Dots and Stripes
Center = 0,-0.00611664
Zoom = 6.15279
AntiAliasScale = 1
AntiAlias = 1
Gamma = 2.2
Exposure = 0.7551,1.06122,1
Brightness = 1.12905
Contrast = 1.0396
Saturation = 0.21505
Slope = 0
Light = 0.06896,0.12068,1
Diffusion = 0.1505,0.06931
k = 0.064
f = 0.04
timeStep = 0.9
#endpreset

#preset Spiral Waves
k = 0.0475
f = 0.0118
#endpreset


#preset Noname
Center = 0,-0.00611664
Zoom = 3.51788
AntiAliasScale = 1
AntiAlias = 1
Gamma = 2.2
ToneMapping = 1
Exposure = 1,1,1
Brightness = 1
Contrast = 1
Saturation = 1
Diffusion = 0.1505,0.06931
k = 0.06304
f = 0.04604
timeStep = 0.85148
#endpreset

	