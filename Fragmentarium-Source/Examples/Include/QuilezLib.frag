#donotrun
// These definitions were taken from Inigo Quilez's page:
// http://iquilezles.org/www/articles/distfunctions/distfunctions.htm


float maxcomp(vec3 a) {
	return 	 max(a.x,max(a.y,a.z));
}

// Sphere - signed
float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}
			
// Box - unsigned
float udBox( vec3 p, vec3 b )
{
  return length(max(abs(p)-b,0.0));
}
	
// Round Box - unsigned
float udRoundBox( vec3 p, vec3 b, float r )
{
  return length(max(abs(p)-b,0.0))-r;
}
			
// Box - signed
float sdToBox( vec3 p, vec3 b )
{
  vec3  di = abs(p) - b;
  float mc = maxcomp(di);
  return min(mc,length(max(di,0.0)));
}

// Torus - signed
float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}
		
// Cylinder - signed
float sdCylinder( vec3 p, vec3 c )
{
  return length(p.xz-c.xy)-c.z;
}

// Cone - signed
float sdCone( vec3 p, vec2 c )
{
    // c must be normalized
    float q = length(p.xy);
    return dot(c,vec2(q,p.z));
}
	
// Plane - signed
float sdPlane( vec3 p, vec4 n )
{
  // n must be normalized
  return dot(p,n.xyz) + n.w;
}
	
// Hexagonal Prism - unsigned
float udHexPrism( vec3 p, vec2 h )
{
    vec3  q = abs(p);
    return max(q.z-h.y,max(q.x+q.y*0.57735,q.y)-h.x);
}

			


// Union
float opU( float d1, float d2 )
{
    return min(d1,d2);
}
				
// Substraction
float opS( float d1, float d2 )
{
    return max(-d1,d2);
}
	
// Intersection
float opI( float d1, float d2 )
{
    return max(d1,d2);
}


float length8(vec2 p) {
	vec2 r = p*p;
	r = r*r;
	return pow(dot(r,r), (1.0/8.0));
}

float length4(vec2 p) {
	vec2 r = p*p;
	return pow(dot(r,r), (1.0/4.0));
}

float sdTorus88( vec3 p, vec2 t )
{
	vec2 q = vec2(length8(p.xz)-t.x,p.y);
	return length8(q)-t.y;
}

