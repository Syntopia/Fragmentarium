#pragma once

#include <QString>
#include <QStringList>
#include <QList>
#include <QFile>
#include <QVector>

#include "../../SyntopiaCore/Exceptions/Exception.h"
#include "../../SyntopiaCore/Math/Vector3.h"

namespace Fragmentarium {
	namespace Parser {	

		using namespace SyntopiaCore::Math;

		class GuiParameter {
		public:
			GuiParameter(QString group, QString name, QString tooltip) : group(group), name(name), tooltip(tooltip) {};
			virtual QString getName() { return name; }
			virtual QString getGroup() { return group; }
			virtual QString getUniqueName() = 0;
			QString getTooltip() { return tooltip; } 
		protected:
			QString name;
			QString tooltip;
			QString group;
		};

		class FloatParameter : public GuiParameter {
		public:
			FloatParameter(QString group, QString name,QString tooltip,  double from, double to, double defaultValue) :
					GuiParameter(group, name, tooltip), from(from), to(to), defaultValue(defaultValue) {};
			
					virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(from).arg(to); }
			double getFrom() { return from; }
			double getTo() { return to; }
			double getDefaultValue() { return defaultValue; }
		private:
			double from;
			double to;
			double defaultValue;
		};

		class Float3Parameter : public GuiParameter {
		public:
			Float3Parameter(QString group, QString name,QString tooltip,  Vector3f from, Vector3f to, Vector3f defaultValue) :
					GuiParameter(group, name, tooltip), from(from), to(to), defaultValue(defaultValue) {};
			
					virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(from.toString()).arg(to.toString()); }
			Vector3f getFrom() { return from; }
			Vector3f getTo() { return to; }
			Vector3f getDefaultValue() { return defaultValue; }
		private:
			Vector3f from;
			Vector3f to;
			Vector3f defaultValue;
		};

		class ColorParameter : public GuiParameter {
		public:
			ColorParameter(QString group, QString name,QString tooltip, Vector3f defaultValue) :
					GuiParameter(group,name, tooltip), defaultValue(defaultValue) {};
			
					virtual QString getUniqueName() { return QString("%0:%1").arg(group).arg(getName()); }
			Vector3f getDefaultValue() { return defaultValue; }
		private:
			Vector3f defaultValue;
		};

		class IntParameter : public GuiParameter {
		public:
			IntParameter(QString group, QString name, QString tooltip, int from, int to, int defaultValue) :
					GuiParameter(group, name, tooltip), from(from), to(to), defaultValue(defaultValue) {};
			
					virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(from).arg(to); }
			int getFrom() { return from; }
			int getTo() { return to; }
			int getDefaultValue() { return defaultValue; }
		private:
			int from;
			int to;
			int defaultValue;
		};

		class FragmentSource {
		public:
			FragmentSource();
			~FragmentSource();

			QString getText() { return source.join("\n"); }
			QStringList source;
			QList<QFile*> sourceFiles;
			QList<int> lines;
			QList<int> sourceFile;

			bool hasPixelSizeUniform;
			QString camera;
			QVector<GuiParameter*> params;
		};

		/// The preprocessor is responsible for expanding '#define'
		///
		class Preprocessor {

		public:
			Preprocessor() {};
			
			FragmentSource Parse(QString input, QFile* f, bool moveMain);
			
		private:
			
		};

	}
}

