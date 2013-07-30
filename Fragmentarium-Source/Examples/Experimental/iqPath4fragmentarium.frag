#version 120
// [Eiffie's adaptation of IQ raytracer:]
//this code was derived by eiffie from Inigo Quilez's artical on brute force path tracing found here:
//http://www.iquilezles.org/www/articles/simplepathtracing/simplepathtracing.htm

#info global illum
//this was built with 3D.frag as of v0.9.12b2
#include "3D.frag" 

#group Colors
uniform vec3 sunDirection;slider[(-1.0,-1.0,-1.0),(0.25,1.0,-0.5),(1.0,1.0,1.0)]
uniform vec3 sunColor;color[1.0,1.0,0.5]
uniform vec3 skyColor;color[0.3,0.6,1.0]
uniform vec3 floorColor;color[0.125,0.19,0.12]
uniform vec3 mengerColor;color[0.75,0.75,0.75]
uniform float mengerReflect;slider[0.0,0.2,1.0]
uniform vec3 ballColor;color[0.7,0.2,0.2]
uniform float ballReflect;slider[0.0,0.8,1.0]

#group Raytracer
uniform int RayBounces;slider[0,3,10]
uniform int MaxRaySteps;slider[128,128,512]

const float maxDepth=10.0;	//depth of scene
//each object in the scene has an id (0,1,2) so create a material for each
vec4[3] material = vec4[3](  //array of materials (color,reflectivity)
	vec4(floorColor,0.1),
	vec4(mengerColor,mengerReflect),
	vec4(ballColor,ballReflect));

//some simple distance estimate functions
float DESphere(in vec3 z, float radius){return length(z)-radius;}
float DEBox(in vec3 z, float hlen){return max(abs(z.x),max(abs(z.y),abs(z.z)))-hlen;}

const float scale=3.0;//menger constants
const vec3 offset=vec3(1.0,1.0,1.0);
const int iters=5;
const float psni=pow(scale,-float(iters));

float DEMenger(in vec3 z)
{
	for (int n = 0; n < iters; n++) {
		z = abs(z);
		if (z.x<z.y)z.xy = z.yx;
		if (z.x<z.z)z.xz = z.zx;
		if (z.y<z.z)z.yz = z.zy;
		z = z*scale - offset*(scale-1.0);
		if(z.z<-0.5*offset.z*(scale-1.0))z.z+=offset.z*(scale-1.0);
	}
	return DEBox(z,scale*0.5)*psni;
}

//you need to implement this function!!!
vec2 map(in vec3 pos)
{//return distance estimate and object id
	float flr=pos.y+1.0;
	float bal=DESphere(pos+vec3(0.0,0.15,-0.5),0.2);
	float mgr=DEMenger(pos);
	float id=1.0;
	if(bal<mgr)id=2.0;
	bal=min(bal,mgr);
	return vec2(min(flr,bal),(flr<bal)?0.0:id);
}

// you don't need to change the following unless you want to :)

vec3 getColor( in vec3 pos, in vec3 nor, in float item )
{//get the color of the surface at a point based on the item hit
	return material[int(item)].rgb;
}

vec3 getBackground( in vec3 rd ){return skyColor+ rd*0.1;}

vec3 intersect(in vec3 ro, in vec3 rd )
{//march the ray until you hit something, run out of steps or go out of bounds
	float t=0.01,res=1.0;
	vec2 h=vec2(0.0,-1.0);
	for(int i=0;i<MaxRaySteps && t<maxDepth;i++){
		h=map(ro+t*rd); //map returns distance to object and id
		//res=min(res,maxDepth*h.x/t);//uncomment for softer shadows
		t+=h.x;
		if(h.x<0.001)return vec3(t,h.y,0.0);
	}//returns distance, object id and softer shading
	return vec3(maxDepth,(t<maxDepth)?h.y:-1.0,res);
}

const vec3 ve=vec3(0.0001,0.0,0.0);
vec3 getNormal( in vec3 pos, in float item )
{// get the normal to the surface at the hit point
	return normalize(vec3(-map(pos-ve.xyy).x+map(pos+ve.xyy).x,
		-map(pos-ve.yxy).x+map(pos+ve.yxy).x,-map(pos-ve.yyx).x+map(pos+ve.yyx).x));
}

//random seed and generator
vec2 randv2=fract(cos((gl_FragCoord.xy+gl_FragCoord.yx*vec2(1000.0,1000.0))+vec2(subframe,subframe))*10000.0);
vec2 rand2(){// implementation dierived from one found at: lumina.sourceforge.net/Tutorials/Noise.html
	randv2+=vec2(1.0,1.0);
	return vec2(fract(sin(dot(randv2.xy ,vec2(12.9898,78.233))) * 43758.5453),
		fract(cos(dot(randv2.xy ,vec2(4.898,7.23))) * 23421.631));
}

vec3 cosineDirection(in vec3 nor)
{//return a random direction on the hemisphere
	vec2 r = rand2()*6.283;
	vec3 dr=vec3(sin(r.x)*vec2(sin(r.y),cos(r.y)),cos(r.x));
	return (dot(dr,nor)<0.0)?-dr:dr;
}

vec3 applyLighting( in vec3 pos, in vec3 nor )
{
     // sample sun
     vec3  liray = normalize(1000.0*sunDirection + 50.0*cosineDirection(nor) - pos );
     vec3 dcol =max(0.0, dot(liray, nor)) * sunColor * intersect( pos, liray ).z;
     // sample sky
     liray = normalize(1000.0*cosineDirection(nor) - pos );
     return dcol + skyColor * intersect( pos, liray ).z;
}

vec3 getBRDFRay( in vec3 nor, in vec3 rd, in float item )
{//randomly direct the ray in a hemisphere or cone based on reflectivity
	if( rand2().x > material[int(item)].a ) return cosineDirection( nor );
	else {//return a cone direction for a reflected ray
		vec3 p=reflect(rd,nor);
		return normalize(p+cosineDirection(p)*0.1);//this cheat causes a funky distribution
	}
}

vec3 color(vec3 ro, vec3 rd) 
{// find color of scene
	vec3 tcol = vec3(0.0),fcol = vec3(1.0);
	for( int i=0; i <RayBounces && dot(fcol,fcol)>0.1; i++ )
	{// create light paths iteratively
		vec3 hit = intersect( ro, rd );
        	if( hit.y >= 0.0 ){//hit something
        		ro+= rd * hit.x;// advance ray position
        		vec3 nor = getNormal( ro, hit.y );// get the surface normal
			fcol *= getColor( ro, nor, hit.y ); // modulating surface colors
			tcol += fcol * applyLighting( ro, nor ); // adding modulated color * direct light
			rd = getBRDFRay( nor, rd, hit.y );// prepare ray for indirect light gathering (bounce)
		}else{//hit nothing so bail
			tcol+=fcol*getBackground( rd );
			break;
		}
	}
	return clamp(tcol,0.0,1.0);
}	 



