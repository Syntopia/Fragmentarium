// An implementation of a Graph Plotter.
// Shows how GLSL is useful to avoid anti-aliasing when drawing high-frequency plots.
#include "2D.frag"
#info Plotter
#group Plotter2D

float rand(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// Put your user defined function here...
float function(float x) {
	x= 1.0*sin(1.0/tan(x)); return x;
}

uniform float Jitter; slider[0,0.5,2]
uniform float Detail; slider[0,5,20]
uniform int Samples; slider[0,3,100]
uniform float AxisDetail; slider[1,1,10]
vec3 color(vec2 pos) {
	vec2 step = Detail*vec2(aaScale.x,aaScale.y)/float(Samples);
	float samples = float(Samples);
	
	int count = 0;
	int mySamples = 0;
	
	for (float i = 0.0; i < samples; i++) {
		for (float  j = 0.0;j < samples; j++) {
			if (i*i+j*j>samples*samples) continue;
			mySamples++;
			float ii = i + Jitter*rand(vec2(pos.x+ i*step.x,pos.y+ j*step.y));
			float jj = j + Jitter*rand(vec2(pos.y + i*step.x,pos.x+ j*step.y));
			float f = function(pos.x+ ii*step.x)-(pos.y+ jj*step.y);
			count += (f>0.) ? 1 : -1;
		}
	}
	vec3 color = vec3(1.0);
	float ss= abs(float(count))/float(mySamples);
	if (abs(count)!=mySamples) color =  vec3(ss);
	vec2 axisDetail = AxisDetail*aaScale;
	if (abs(pos.x)<axisDetail.x*1.0 || abs(pos.y)<axisDetail.y*1.0) color-= 1.0-vec3(0.2,0.2,1.0);
	if (abs(mod(pos.x,1.0))<axisDetail.x || abs(mod(pos.y,1.0))<axisDetail.y) color-= 1.0-vec3(0.8,0.8,1.0);
	return color;
}
