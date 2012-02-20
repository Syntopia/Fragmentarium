#donotrun

#info Fractal Lab Raytracer  (Copyright Subblue / Tom Beddard - GPL V3) - [links: fractal.io and subblue.com]
#camera 3D

/*
  This raytracer was written by Subblue and taken from his
  Fractal Lab (http://fractal.io/) implementation.

  Notice only the raymarching code is included here, not the fractals.
*/

/**
 * Fractal Lab's uber 3D fractal shader
 * Last update: 26 February 2011
 *
 * Changelog:
 *      0.1     - Initial release
 *      0.2     - Refactor for Fractal Lab
 *
 * 
 * Copyright 2011, Tom Beddard
 * http://www.subblue.com
 *
 * For more generative graphics experiments see:
 * http://www.subblue.com
 *
 * Licensed under the GPL Version 3 license.
 * http://www.gnu.org/licenses/
 *
*/

#vertex

#group Camera

// Field-of-view
uniform float FOV; slider[0,0.4,2.0] NotLockable
uniform vec3 Eye; slider[(-50,-50,-50),(0,0,-10),(50,50,50)] NotLockable
uniform vec3 Target; slider[(-50,-50,-50),(0,0,0),(50,50,50)] NotLockable
uniform vec3 Up; slider[(0,0,0),(0,1,0),(0,0,0)] NotLockable

varying vec3 dirDx;
varying vec3 dirDy;
varying vec3 from;
uniform vec2 pixelSize;
varying vec2 coord;
varying float zoom;
varying vec3 dir;
void main(void)
{
	gl_Position =  gl_Vertex;
	coord = (gl_ProjectionMatrix*gl_Vertex).xy;
	coord.x*= pixelSize.y/pixelSize.x;
	// we will only use gl_ProjectionMatrix to scale and translate, so the following should be OK.
	vec2 ps =vec2(pixelSize.x*gl_ProjectionMatrix[0][0], pixelSize.y*gl_ProjectionMatrix[1][1]);
	zoom = length(ps);
	from = Eye;
	vec3 Dir = normalize(Target-Eye);
	vec3 up = Up-dot(Dir,Up)*Dir;
	up = normalize(up);
	vec3 Right = normalize( cross(Dir,up));
	dir = (coord.x*Right + coord.y*up )*FOV+Dir;
	dirDy = ps.y*up*FOV;
	dirDx = ps.x*Right*FOV;
}
#endvertex

#group Raytracer

#define HALFPI 1.570796
#define MIN_EPSILON 6e-7
#define MIN_NORM 1.5e-7
#define minRange 6e-5

// Camera position and target.
varying vec3 from,dir,dirDx,dirDy;
varying vec2 coord;
varying float zoom;

// HINT: for better results use Tile Renders and resize the image yourself
uniform int AntiAlias;slider[1,1,5] Locked
// Smoothens the image (when AA is enabled)
uniform float AntiAliasBlur;slider[0.0,1,2] Locked
uniform int stepLimit; slider[10,60,300] Locked
uniform int aoIterations; slider[0,4,10] Locked
uniform float surfaceDetail;  slider[0.1,0.6,2]       
uniform float surfaceSmoothness;slider[0.01,0.8,1.0] 
uniform float boundingRadius; slider[0.1,5,150]  

#group Colour
uniform vec3  color1;   color[1.0,1.0,1.0]        
uniform float color1Intensity;  slider[0,0.45,3]   
uniform vec3  color2;   color[0.0,0.53,0.8]                    
uniform float color2Intensity;   slider[0,0.3,3]   
uniform vec3  color3;   color[1.0,0.53,0.0]       
uniform float color3Intensity;  slider[0,0,3]    
uniform bool  transparent; checkbox[false]  
uniform vec2  ambientColor; slider[(0,0),(0.5,0.3),(1,1)]   
uniform vec3  background1Color; color[0.0,0.46,0.8]   
uniform vec3  background2Color; color[0,0,0]  

#group Shading
uniform vec3  light; slider[(-300,-300,-300),(-16.0,100.0,-60.0),(300,300,300)]       
uniform vec3  innerGlowColor; color[0,0,.6,0.8]  
uniform float innerGlowIntensity; slider[0,0.1,1]  
uniform vec3  outerGlowColor; color[1,1,1]  
uniform float outerGlowIntensity; slider[0,0,1] 
uniform float fog;  slider[0,0,1]             
uniform float fogFalloff;  slider[0,0,10]       
uniform float specularity;  slider[0,0.8,3]      
uniform float specularExponent; slider[0,4,50]  
uniform float aoIntensity;  slider[0,0.15,1]   
uniform float aoSpread;  slider[0,9,20]          
bool  depthMap = false;

//float aspectRatio = size.x / size.y;
float pixelScale = zoom;
float epsfactor = 2.0  * pixelScale*  surfaceDetail;



// Intersect bounding sphere
//
// If we intersect then set the tmin and tmax values to set the start and
// end distances the ray should traverse.
bool intersectBoundingSphere(vec3 origin,
                             vec3 direction,
                             out float tmin,
                             out float tmax)
{
    bool hit = false;
    float b = dot(origin, direction);
    float c = dot(origin, origin) - boundingRadius;
    float disc = b*b - c;           // discriminant
    tmin = tmax = 0.0;

    if (disc > 0.0) {
        // Real root of disc, so intersection
        float sdisc = sqrt(disc);
        float t0 = -b - sdisc;          // closest intersection distance
        float t1 = -b + sdisc;          // furthest intersection distance

        if (t0 >= 0.0) {
            // Ray intersects front of sphere
            tmin = t0;
            tmax = t0 + t1;
        } else if (t0 < 0.0) {
            // Ray starts inside sphere
            tmax = t1;
        }
        hit = true;
    }

    return hit;
}


float DE(vec3 pos);

// Calculate the gradient in each dimension from the intersection point
vec3 generateNormal(vec3 z, float d)
{
    float e = max(d * 0.5, MIN_NORM);
    
    float dx1 = DE(z + vec3(e, 0, 0));
    float dx2 = DE(z - vec3(e, 0, 0));
    
    float dy1 = DE(z + vec3(0, e, 0));
    float dy2 = DE(z - vec3(0, e, 0));
    
    float dz1 = DE(z + vec3(0, 0, e));
    float dz2 = DE(z - vec3(0, 0, e));
    
    return normalize(vec3(dx1 - dx2, dy1 - dy2, dz1 - dz2));
}


// Blinn phong shading model
// http://en.wikipedia.org/wiki/BlinnPhong_shading_model
// base color, incident, point of intersection, normal
vec3 blinnPhong(vec3 color, vec3 p, vec3 n)
{
    // Ambient colour based on background gradient
    vec3 ambColor = clamp(mix(background2Color, background1Color, (sin(n.y * HALFPI) + 1.0) * 0.5), 0.0, 1.0);
    ambColor = mix(vec3(ambientColor.x), ambColor, ambientColor.y);
    
    vec3  halfLV = normalize(light - p);
    float diffuse = max(dot(n, halfLV), 0.0);
    float specular = pow(diffuse, specularExponent);
    
    return ambColor * color + color * diffuse + specular * specularity;
}



// Ambient occlusion approximation.
// Based upon boxplorer's implementation which is derived from:
// http://www.iquilezles.org/www/material/nvscene2008/rwwtt.pdf
float ambientOcclusion(vec3 p, vec3 n, float eps)
{
    float o = 1.0;                  // Start at full output colour intensity
    eps *= aoSpread;                // Spread diffuses the effect
    float k = aoIntensity / eps;    // Set intensity factor
    float d = 2.0 * eps;            // Start ray a little off the surface
    
    for (int i = 0; i < aoIterations; ++i) {
        o -= (d - DE(p + n * d)) * k;
        d += eps;
        k *= 0.5;                   // AO contribution drops as we move further from the surface 
    }
    
    return clamp(o, 0.0, 1.0);
}
   
vec4 orbitTrap = vec4(0);

// Calculate the output colour for each input pixel
vec3 trace( vec3 cameraPosition, vec3  ray_direction)
{
    float ray_length = minRange;
    vec3  ray = cameraPosition + ray_length * ray_direction;
    vec4  bg_color = vec4(clamp(mix(background2Color, background1Color, (sin(ray_direction.y * HALFPI) + 1.0) * 0.5), 0.0, 1.0), 1.0);
    vec4  color = bg_color;
    
    float eps = MIN_EPSILON;
    float  dist;
    vec3  normal = vec3(0);
    int   steps = 0;
    bool  hit = false;
    float tmin = 0.0;
    float tmax = 10000.0;
    if (intersectBoundingSphere(ray, ray_direction, tmin, tmax)) {
        ray_length = tmin;
        ray = cameraPosition + ray_length * ray_direction;
      
        for (int i = 0; i < stepLimit; i++) {
            steps = i;
            dist = DE(ray);
            dist *= surfaceSmoothness;
            
            // If we hit the surface on the previous step check again to make sure it wasn't
            // just a thin filament
            if (hit && dist < eps || ray_length > tmax || ray_length < tmin) {
                steps--;
                break;
            }
            
            hit = false;
            ray_length += dist;
            ray = cameraPosition + ray_length * ray_direction;
            eps = ray_length * epsfactor;

            if (dist < eps || ray_length < tmin) {
                hit = true;
            }
        }
    }
    
    // Found intersection?
    float glowAmount = float(steps)/float(stepLimit);
    float glow;
    if (hit) {
        float aof = 1.0, shadows = 1.0;
        glow = clamp(glowAmount * innerGlowIntensity * 3.0, 0.0, 1.0);

        if (steps < 1 || ray_length < tmin) {
            normal = normalize(ray);
        } else {
            normal = generateNormal(ray, eps);
            aof = ambientOcclusion(ray, normal, eps);
        }
        
        color.rgb = mix(color1, mix(color2, color3, orbitTrap.w * color2Intensity), orbitTrap.z * color3Intensity);
        color.rgb = blinnPhong(clamp(color.rgb * color1Intensity, 0.0, 1.0), ray, normal);
        color.rgb *= aof;
        color.rgb = mix(color.rgb, innerGlowColor, glow);
        color.rgb = mix(bg_color.rgb, color.rgb, exp(-pow(ray_length * exp(fogFalloff), 2.0) * fog));
        color.a = 1.0;
    } else {
        // Apply outer glow and fog
        ray_length = tmax;
        color.rgb = mix(bg_color.rgb, color.rgb, exp(-pow(ray_length * exp(fogFalloff), 2.0)) * fog);
        glow = clamp(glowAmount * outerGlowIntensity * 3.0, 0.0, 1.0);
        color.rgb = mix(color.rgb, outerGlowColor, glow);
        if (transparent) color = vec4(0.0);
    }
    
    // if (depthMap) {
    //     color.rgb = vec3(ray_length / 10.0);
    // }
    
    return color.xyz;
}
#ifdef providesInit
	void init(); // forward declare
#else
	void init() {}
#endif 

void main() {
	init();
	
	vec3 color = vec3(0.0,0.0,0.0);
	for (int x = 0; x<AntiAlias; x++) {
		float  dx =  AntiAliasBlur*float(x)/float(AntiAlias);
		for (int y = 0; y<AntiAlias; y++) {
			float dy = AntiAliasBlur*float(y)/float(AntiAlias);
			vec3 nDir = dir+dirDx*dx+dirDy*dy;
			vec3 hitNormal;
			vec3 hit;
			vec3 c = trace(from,nDir);
		 	color += c;
		
		}
	}
	
	color = clamp(color/float(AntiAlias*AntiAlias), 0.0, 1.0);
	gl_FragColor = vec4(color, 1.0);
}
