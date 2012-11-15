#donotrun
// This is a shader for rendering depth maps using
// screen space normals, and screen space ambient occlusion.
// Used with the Brute-Raytracer.frag

#vertex

uniform float FOV;
uniform vec3 Eye;
uniform vec3 Target;
uniform vec3 Up;


varying vec2 coord;
uniform vec2 pixelSize;
varying vec2 viewCoord;
varying vec3 Dir;
varying vec3 UpOrtho;
varying vec3 Right;
uniform int backbufferCounter;

void main(void)
{
	gl_Position =  gl_Vertex;
	coord = (gl_ProjectionMatrix*gl_Vertex).xy;
	viewCoord= coord;
	viewCoord.x*= pixelSize.y/pixelSize.x;
	
	Dir = normalize(Target-Eye);
	UpOrtho = normalize( Up-dot(Dir,Up)*Dir );
	Right = normalize( cross(Dir,UpOrtho));
	viewCoord*=FOV;
}

#endvertex

uniform float Gamma;
uniform float Exposure;
uniform float Brightness;
uniform float Contrast;
uniform float Saturation;
uniform int ToneMapping;
/*
** Based on: http://mouaif.wordpress.com/2009/01/22/photoshop-gamma-correction-shader/
**
** Contrast, saturation, brightness
** Code of this function is from TGM's shader pack
** http://irrlicht.sourceforge.net/phpBB2/viewtopic.php?t=21057
*/
// For all settings: 1.0 = 100% 0.5=50% 1.5 = 150%
vec3 ContrastSaturationBrightness(vec3  color, float brt, float sat, float con)
{
	const vec3 LumCoeff = vec3(0.2125, 0.7154, 0.0721);
	vec3 AvgLumin = vec3(0.5);
	vec3 brtColor = color * brt;
	float intensityf = dot(brtColor, LumCoeff);
	vec3 intensity = vec3(intensityf, intensityf, intensityf);
	vec3 satColor = mix(intensity, brtColor, sat);
	vec3 conColor = mix(AvgLumin, satColor, con);
	return conColor;
}

varying vec2 coord;
varying vec2 viewCoord;
uniform sampler2D frontbuffer;
uniform bool ShowDepth;
uniform bool DebugNormals;
uniform float NormalScale;
uniform float AOScale;


// The specular intensity of the directional light
uniform float Specular;
// The specular exponent
uniform float SpecularExp;
// Color and strength of the directional light
uniform vec4 SpotLight;
// Direction to the spot light (spherical coordinates)
uniform vec2 SpotLightDir;
// Light coming from the camera position (diffuse lightning)
uniform vec4 CamLight;
// Controls the minimum ambient light, regardless of directionality
uniform float CamLightMin;

uniform float FOV;
uniform vec3 Eye;
uniform vec3 Target;
uniform vec3 Up;

// Wrap to improve SSAO artifacts (but does not help?)
#TexParameter frontbuffer GL_TEXTURE_WRAP_S GL_CLAMP
#TexParameter frontbuffer GL_TEXTURE_WRAP_T GL_CLAMP

float rand(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

uniform int backbufferCounter;
uniform float Glow;
uniform float AOStrength;
uniform float Near;
uniform float Far;

varying vec3 Dir;
varying vec3 UpOrtho;
varying vec3 Right;

void main() {
	vec2 pos = (coord+vec2(1.0))/2.0;
	
	// xyz is color, w is depth.
	vec4 tex = texture2D(frontbuffer, pos);
	
	vec3 rayDir =  normalize(Dir+ viewCoord.x*Right+viewCoord.y*UpOrtho);

	float dx = NormalScale;
	float dy = NormalScale;	

	// Hardware version: unfortunately introduces artifacts...
	// Hit position in world space.
	// vec3 worldPos = Eye + (Near+tex.w*(Far-Near)) * rayDir;
	// vec3 n = normalize(cross( dFdx(worldPos), dFdy(worldPos) ));
	
	// Get adjacent depths
	float texX = texture2D(frontbuffer, pos+vec2(dx,0.0)).w;
	float texY= texture2D(frontbuffer, pos+vec2(0.0,dy)).w;
	float texMX = texture2D(frontbuffer, pos-vec2(dx,0.0)).w;
	float texMY= texture2D(frontbuffer, pos-vec2(0.0,dy)).w;
	
	// Camera reference frame
	vec3 Dir = normalize(Target-Eye);
	vec3 UpOrtho = normalize( Up-dot(Dir,Up)*Dir );
	vec3 Right = normalize( cross(Dir,UpOrtho));
		
	// Transform screen space normal into world space
	vec3 v1 = 2.*dx*Right + ( texX-texMX)*Dir;
	vec3 v2 = 2.*dy*UpOrtho + ( texY-texMY)*Dir;
	vec3 n = normalize(cross(v1,v2));
	

	// Apply lighting based on screen space normal
	vec3 c = tex.xyz;
	if (DebugNormals) c = abs(vec3(n));
	if (tex.w==1.0) {
		// Background - no hits.
	} else {
		vec3 spotDir = vec3(sin(SpotLightDir.x*3.1415)*cos(SpotLightDir.y*3.1415/2.0), sin(SpotLightDir.y*3.1415/2.0)*sin(SpotLightDir.x*3.1415), cos(SpotLightDir.x*3.1415));
		spotDir = normalize(spotDir);
		vec3 r =reflect(Dir,n);//, Dir - 2.0 * dot(n, Dir) * n;
		float s = max(0.0,dot(spotDir,r));
		float d=  max(0.0,dot(n,spotDir));
		float diffuse =d*SpotLight.w;
		float ambient = max(CamLightMin,dot(-n, Dir))*CamLight.w;
		float specular = (SpecularExp<=0.0) ? 0.0 : pow(s,SpecularExp)*Specular;
		c = (SpotLight.xyz*diffuse+CamLight.xyz*ambient+ specular*SpotLight.xyz)*c;
	}
	
	
	// Apply tone mapping
	if (ToneMapping==1) {
		// Linear
		c = c*Exposure;
	} else if (ToneMapping==2) {
		// ExponentialExposure
		c = vec3(1.0)-exp(-c*Exposure);
	} else if (ToneMapping==3) {
		// Filmic: http://filmicgames.com/archives/75
		c*=Exposure;
		vec3 x = max(vec3(0.),c-vec3(0.004));
		c = (x*(6.2*x+.5))/(x*(6.2*x+1.7)+0.06);
		c = pow(c, vec3(2.2)); // It already takes the Gamma into acount
		
	} else if (ToneMapping==4) {
		// Reinhart
		c*=Exposure;
		c = c/(1.+c);
	}
	
	// Apply gamma and filtering.
	c = pow(c, vec3(1.0/Gamma));
	c = ContrastSaturationBrightness(c, Brightness, Saturation, Contrast);
	
	
	if (ShowDepth) {
		gl_FragColor = vec4(vec3(1.0-tex.w),1.0);
	} else {
		// Naive Screen Space Ambient Occlusion
		// TODO: improve
		float dx = AOScale;//*(1.0-tex.w);
		float dy = AOScale;//*(1.0-tex.w);
		float occ = 0.;
		float samples = 0.;
		for (float x = -5.; x<=5.; x++) {
			for (float y = -5.; y<=5.; y++) {
				if (x*x+y*y>=25.) continue;
				float texX = texture2D(frontbuffer,
					pos+vec2(
						dx*(x+ rand(vec2(x,y)+pos)),
						dy*(y+ rand(vec2(y,x)+pos))
						) ).w;
				if (texX>=tex.w) occ+=1.;
				samples++;
			}
		}
		occ /= samples;
		if (tex.w==1.0) {
			gl_FragColor = vec4(c+Glow*Vec3(1.0-occ),1.0);
		} else {
			gl_FragColor = vec4(mix(c,c*occ,AOStrength),1.0);
		}
	}
}

