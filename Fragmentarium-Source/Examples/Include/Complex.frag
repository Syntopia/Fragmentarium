#donotrun

vec2 cMul(vec2 a, vec2 b) {
	return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}

vec2 cPower(vec2 z, float n) {
	float r2 = dot(z,z);
	return pow(r2,n/2.0)*vec2(cos(n*atan(z.y/z.x)),sin(n*atan(z.y/z.x)));
}

vec2 cInverse(vec2 a) {
       return	vec2(a.x,-a.y)/dot(a,a);
}

vec2 cLog(vec2 a) {
	float b =  atan(a.y,a.x);
	if (b>0.0) b-=2.0*3.1415;
	return vec2(log(length(a)),b);
}

vec2 cSin(vec2 z) {
  return vec2(sin(z.x)*cosh(z.y), cos(z.x)*sinh(z.y));
}

vec2 cCos(vec2 z) {
  return vec2(cos(z.x)*cosh(z.y), -sin(z.x)*sinh(z.y));
}
