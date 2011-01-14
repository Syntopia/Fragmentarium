#group 2D
varying vec2 coord;
uniform vec2 pixelSize;

// Anti-alias [1=1 samples / pixel, 2 = 4 samples, ...]
uniform int AntiAlias;slider[1,2,5];
uniform float AntiAliasScale;slider[0.0,1,5];

vec3 getColor2D(vec2 z) ;

vec3 getColor2Daa(vec2 z) {
	vec3 v = vec3(0.0,0.0,0.0);
	for (int x=1; x <=AntiAlias;x++) {
		for (int y=1; y <=AntiAlias;y++) {
			v +=  getColor2D(z+vec2(x,y)*pixelSize*0.33*AntiAliasScale);
		}
	}
	
	return v/(float(AntiAlias)*float(AntiAlias));
}

void main()
{
	gl_FragColor = vec4(getColor2Daa(coord.xy),1.0);
}

