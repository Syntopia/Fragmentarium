#buffer RGBA16
#version 150
#include "2D.frag"

// A 'Game of Life' implementation
// demonstrating how to work with a pixel-accurate 
// back buffer.
// Switch to Continuous mode.
// Make sure AntiAlias is off (set to 1).
//
// Notice that this version uses the 'texelFetch' command,
// to read from the backBuffer - otherwise the filtering
// seems to create artifacts near the border, and
// I haven't found a work-around for this.
// This also means that version 150 is required.

uniform sampler2D backbuffer;
uniform float time;

/*
From Wikipedia:
Any live cell with fewer than two live neighbours dies, as if caused by under-population.
Any live cell with two or three live neighbours lives on to the next generation.
Any live cell with more than three live neighbours dies, as if by overcrowding.
Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
*/

vec2 position = (viewCoord*1.0+vec2(1.0))/2.0;


float rand(vec2 co){
	// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void  isAlive(float  dx, float  dy, in out int count) {
	// Simple version: does not work around borders
	// vec4 v1 = texture2D( backbuffer, mod ( position + pixelSize*vec2( dx, dy ), 1.0 ) );
	
	// Better version, using unfiltered samples:
	vec2 p = mod(position + vec2(dx,dy)*pixelSize,1.0)/pixelSize;
	vec4 v1 = texelFetch( backbuffer,  ivec2(p),0 );
		
	if (v1.x==1.0) count++;
}


vec3 color(vec2 z) {
	if (length(z)<0.1 && length(z)>0.08) return (rand(time*z) < 0.5 ? vec3(1.0,0.0,0.0) : vec3(0.0));
	vec4 v1 = texture2D( backbuffer, mod ( position , 1.0 ) );
	int neighbours = 0;
	int alive =0;
	 isAlive(0.0,0.0,alive);
	
	// Count neighbours
	isAlive(1.0,0.0, neighbours);
	isAlive(1.0,1.0, neighbours);
	isAlive(1.0,-1.0, neighbours);
	isAlive(0.0,1.0, neighbours);
	isAlive(0.0,-1.0, neighbours);
	isAlive(-1.0,1.0, neighbours);
	isAlive(-1.0,0.0, neighbours);
	isAlive(-1.0,-1.0, neighbours);
	
	// Rules
	if (alive==1) {
		if (neighbours<2) return vec3(v1.x*0.99,v1.y*0.99,v1.z);
		else if (neighbours<4) return vec3(1.0);
	} else {
		if (neighbours==3) return vec3(1.0);
	}

	return vec3(v1.x*0.95,v1.y*0.98,v1.z*0.999) ;
}


#preset Default
Center = 0,0
Zoom = 6.15279
AntiAliasScale = 1
AntiAlias = 1
#endpreset
