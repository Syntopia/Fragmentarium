#pragma once

#include <QString>
#include <QVector>
#include <QStringList>
#include <cmath>


namespace SyntopiaCore {
    namespace Math {

        /// A simple class for representing four-dimensional vectors.
        template <class scalar> class Vector4 {
        public:
            Vector4() { s[0] = 0; s[1] = 0; s[2] = 0; s[3]=0;}
            Vector4(scalar x, scalar y, scalar z, scalar w) { s[0] = x; s[1] = y; s[2] = z; s[3]=w; }

            // Constructor. Parses input such as "[1 2 3]";
            Vector4(QString input, bool& succes2) {
                input.remove('[');
                input.remove(']');

                QStringList sl = input.split(" ");
                if (sl.size() != 4) { succes2 = false; return; }

                bool succes = false;
                float f;
                f = sl[0].toFloat(&succes); if (!succes)  { succes2 = false; return; }; s[0] = f;
                f = sl[1].toFloat(&succes); if (!succes)  { succes2 = false; return; }; s[1] = f;
                f = sl[2].toFloat(&succes); if (!succes)  { succes2 = false; return; }; s[2] = f;
                f = sl[3].toFloat(&succes); if (!succes)  { succes2 = false; return; }; s[3] = f;

                succes2 = true;
            }


            // data access
            scalar x() const { return s[0]; }
            scalar y() const { return s[1]; }
            scalar z() const { return s[2]; }
            scalar w() const { return s[3]; }
            scalar& x() { return s[0]; }
            scalar& y() { return s[1]; }
            scalar& z() { return s[2]; }
            scalar& w() { return s[3]; }
            scalar operator[] (int index) const { return s[index]; }
            scalar& operator[] (int index) { return s[index]; }

            scalar sqrLength() const { return s[0]*s[0]+s[1]*s[1]+s[2]*s[2]+s[3]*s[3]; }
            scalar length() const { return sqrt(s[0]*s[0]+s[1]*s[1]+s[2]*s[2]+s[3]*s[3]); }

            Vector4<scalar> normalized() const { scalar l = 1.0/length(); return Vector4<scalar>(s[0]*l,s[1]*l,s[2]*l,s[3]*l); }
            void normalize() { scalar l = 1.0/length(); s[0]*=l; s[1]*=l; s[2]*=l; s[3]*=l; }
            Vector4<scalar> operator- (const Vector4<scalar>& rhs) const { return Vector4<scalar>(s[0]-rhs.s[0], s[1]-rhs.s[1], s[2]-rhs.s[2],s[3]-rhs.s[3]); }
            Vector4<scalar> operator+ (const Vector4<scalar>& rhs) const { return Vector4<scalar>(s[0]+rhs.s[0], s[1]+rhs.s[1], s[2]+rhs.s[2],s[3]+rhs.s[3]); }
            Vector4<scalar> operator- () const { return Vector4<scalar>(-s[0], -s[1], -s[2], -s[3]); }
            bool operator== (const Vector3<scalar>& rhs) const { return (s[0]==rhs.s[0] && s[1]==rhs.s[1] && s[2]==rhs.s[2] && s[3]==rhs.s[3]); }

            Vector3<scalar> operator* (scalar rhs) const { return Vector3<scalar>(s[0]*rhs, s[1]*rhs, s[2]*rhs, s[3]*rhs); }
            Vector3<scalar> operator/ (scalar rhs) const { scalar t = 1.0/rhs; return Vector3<scalar>(s[0]*t, s[1]*t, s[2]*t, s[3]*t); }


            QString toString() const {
                return QString("[%1 %2 %3 %4]").arg(s[0]).arg(s[1]).arg(s[2]).arg(s[3]);
            }

            static scalar dot(const Vector4<scalar>& a, const Vector4<scalar>& b) {
                return a.s[0]*b.s[0] + a.s[1]*b.s[1] + a.s[2]*b.s[2] + a.s[3]*b.s[3];
            }

        private:
            scalar s[4];
        };

        template <typename T, typename S>
        Vector4<S> operator*(T lhs, Vector4<S> rhs) { return Vector4<S>(rhs[0]*lhs, rhs[1]*lhs, rhs[2]*lhs, rhs[3]*lhs); }

        typedef Vector4<float> Vector4f ;
        typedef Vector4<double> Vector4d ;

    }
}

