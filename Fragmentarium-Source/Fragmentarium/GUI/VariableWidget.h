#pragma once

#include <QString>
#include <QVector>
#include <QWidget>
#include <QComboBox>
#include <QMap>
#include <QSlider>
#include <QTabWidget>
#include <QFrame>
#include <QCheckBox>
#include <QColorDialog>
#include <QDoubleSpinBox>
#include <QHBoxLayout>
#include <QGLShaderProgram>
#include "SyntopiaCore/Math/Vector3.h"
#include "SyntopiaCore/Math/Vector4.h"

#include "../Parser/Preprocessor.h"
#include "SyntopiaCore/Logging/Logging.h"
#include "DisplayWidget.h"

/// Classes for the GUI Editor for the preprocessor constant variables.
/// E.g. the line: #define angle 45 (float:0.0-360.0)
///	will make a simple editor widget appear.
namespace Fragmentarium {
	namespace GUI {

		using namespace SyntopiaCore::Logging;
		using namespace SyntopiaCore::Math;

		// A helper class (combined float slider+spinner)
		class ComboSlider : public QWidget {
			Q_OBJECT
		public:
			ComboSlider(QWidget* parent,QWidget* variableEditor, double defaultValue, double minimum, double maximum) 
				: QWidget(parent), defaultValue(defaultValue), minimum(minimum), maximum(maximum){
					setLayout(new QHBoxLayout());
					layout()->setContentsMargins(0,0,0,0);
					slider = new QSlider(Qt::Horizontal,this);
					slider->setRange(0,100000);
					double val = (defaultValue-minimum)/(maximum-minimum);
					slider->setValue(val*100000);
					spinner = new QDoubleSpinBox(this);
					spinner->setDecimals(5);
					spinner->setMaximum(maximum);
					spinner->setMinimum(minimum);
					spinner->setValue(defaultValue);
					myValue = defaultValue;
					layout()->addWidget(slider);
					layout()->addWidget(spinner);
					slider->installEventFilter(variableEditor);
					connect(spinner, SIGNAL(valueChanged(double)), this, SLOT(spinnerChanged(double)));
					connect(slider, SIGNAL(valueChanged(int)), this, SLOT(sliderChanged(int)));
			}

			double getSpan() { return maximum-minimum; }

			double getValue() { return myValue; }

			void setValue(double d) { 
				myValue = d; 
				spinner->blockSignals(true);
				slider->blockSignals(true);
				spinner->setValue(d);
				double val = (spinner->value()-minimum)/(maximum-minimum);
				slider->setValue(val*100000);
				spinner->blockSignals(false);
				slider->blockSignals(false);
				emit changed();
			}

		signals:
			void changed();

		protected slots:
			void spinnerChanged(double) {
				setValue(spinner->value());
				myValue = spinner->value();
				emit changed();
			}

			void sliderChanged(int) {
				double val = (slider->value()/100000.0)*(maximum-minimum)+minimum;
				setValue(val);
				myValue = spinner->value();
				emit changed();
			}

		private:
			double myValue;
			QSlider* slider;
			QDoubleSpinBox* spinner;
			double defaultValue;
			double minimum;
			double maximum;
		};

		class ColorChooser : public QFrame {
			Q_OBJECT
		public:
			ColorChooser(QWidget* parent, Vector3f defaultValue) 
				: QFrame(parent), defaultValue(defaultValue), value(defaultValue) {
					setColor(defaultValue);
					setFrameStyle(QFrame::Panel | QFrame::Plain);
					setLineWidth(1);
			}

			void setColor(Vector3f v) {
				QPalette p = palette();
				p.setColor(backgroundRole(), QColor(v[0]*255.0,v[1]*255.0,v[2]*255.0));
				setAutoFillBackground( true );
				setPalette(p);
				value = v;
			}

			Vector3f getValue() { return value; }

			void mouseReleaseEvent(QMouseEvent*) {
				QColor initial = QColor((int)(value[0]*255),(int)(value[1]*255),(int)(value[2]*255));
				QColor c = QColorDialog::getColor(initial, this, "Choose color");
				if (c.isValid()) {
					value = Vector3f(c.red()/255.0, c.green()/255.0, c.blue()/255.0);
					setColor(value);
					emit changed();
				}
			}

		signals:
			void changed();

		private:
			Vector3f defaultValue;
			Vector3f value;
		};




		// A helper class (combined int slider+spinner)
		class IntComboSlider : public QWidget {
			Q_OBJECT
		public:
			IntComboSlider(QWidget* parent, int defaultValue, int minimum, int maximum) 
				: QWidget(parent), defaultValue(defaultValue), minimum(minimum), maximum(maximum){
					setLayout(new QHBoxLayout());
					layout()->setContentsMargins(0,0,0,0);
					slider = new QSlider(Qt::Horizontal,this);
					slider->setRange(minimum,maximum);
					slider->setValue(defaultValue);
					spinner = new QSpinBox(this);
					spinner->setMaximum(maximum);
					spinner->setMinimum(minimum);
					spinner->setValue(defaultValue);
					layout()->addWidget(slider);
					layout()->addWidget(spinner);
					connect(spinner, SIGNAL(valueChanged(int)), this, SLOT(spinnerChanged(int)));
					connect(slider, SIGNAL(valueChanged(int)), this, SLOT(sliderChanged(int)));
			}

			int getValue() { return spinner->value(); }
			void setValue(int i) { spinner->setValue(i); }

signals:
			void changed();

			protected slots:
				void spinnerChanged(int) {
					int val = spinner->value();
					slider->setValue(val);
					emit changed();
				}

				void sliderChanged(int) {
					double val = slider->value();
					spinner->setValue(val);
					emit changed();
				}

		private:

			QSlider* slider;
			QSpinBox* spinner;
			int defaultValue;
			int minimum;
			int maximum;
		};


		class CameraControl; 

		/// Widget editor base class.
		class VariableWidget : public QWidget {

			Q_OBJECT
		public:
			VariableWidget(QWidget* parent, QWidget* variableEditor, QString name);
			virtual void updateTextures(Parser::FragmentSource* /*fs*/,  FileManager* /*fileManager*/) {};
			virtual QString getValueAsText() { return ""; };
			QString getName() const { return name; };
			virtual void reset() = 0;
			void setGroup(QString group) { this->group = group; }
			QString getGroup() { return group; }
			bool isUpdated() const { return updated; };
			void setUpdated(bool value) { updated = value; };
			virtual void setUserUniform(QGLShaderProgram* shaderProgram) = 0;
			QString toSettingsString();
			bool fromSettingsString(QString string);
			virtual QString toString() = 0;
			virtual void fromString(QString string) = 0;
			virtual QString getUniqueName() = 0;
			void setSystemVariable(bool v) { systemVariable = v; }
			bool isSystemVariable() { return systemVariable; } 
			int uniformLocation(QGLShaderProgram* shaderProgram);
			bool isLocked();
			LockType getDefaultLockType() { return defaultLockType; }
			void setDefaultLockType(LockType lt);
			LockType getLockType() { return lockType; }
			virtual void setLockType(LockType lt) ;
			virtual QString getLockedSubstitution() = 0;
			virtual QString getLockedSubstitution2() = 0;

			public slots:
				void locked(bool l);
				void valueChanged();

signals:
				void changed(bool lockedChanged);

		protected:
			QString toGLSL(double d) {
				QString n = QString::number(d,'g',12);
				// GLSL requires a dot in floats.
				if (n.contains(".") || n.contains("e")) return n;
				return n+".0";
			}

			LockType defaultLockType;
			LockType lockType;
			QPushButton* lockButton;
			QString name;
			QString group;
			bool updated;
			bool systemVariable;
			QWidget* widget;
			QWidget* variableEditor;
		};



		class SamplerWidget : public VariableWidget {
			Q_OBJECT
		public:
			SamplerWidget(FileManager* fileManager, QWidget* parent, QWidget* variableEditor, QString name, QString defaultValue);
			virtual QString toString();
			virtual void fromString(QString string);
			virtual void setUserUniform(QGLShaderProgram* shaderProgram);
			virtual void updateTextures(Parser::FragmentSource* fs, FileManager* fileManager);
			virtual void setLockType(LockType /*lt*/) { lockType = AlwaysLocked; }; // cannot change this
			QString getValue() ;
			virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()); }
			void reset() { comboBox->setEditText(defaultValue); }
			QString getLockedSubstitution() { return QString(); };
			QString getLockedSubstitution2() { return QString(); };

signals:
			void changed();

			protected slots:

				void textChanged(const QString& text);

				void buttonClicked();

		private:

			QString defaultValue;
			QComboBox* comboBox;
			QPushButton* pushButton;
			FileManager* fileManager;
		};



		class FloatWidget : public VariableWidget {
		public:
			/// FloatVariable constructor.
			FloatWidget(QWidget* parent, QWidget* variableEditor, QString name, double defaultValue, double min, double max);
			virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(min).arg(max); }
			virtual QString getValueAsText() { return QString::number(comboSlider->getValue()); };
			virtual QString toString();
			virtual void fromString(QString string);
			virtual void setUserUniform(QGLShaderProgram* shaderProgram);
			double getValue() { return comboSlider->getValue(); } 
			void setValue(double f) { comboSlider->setValue(f); }
			void reset() { setValue(defaultValue); }
			QString getLockedSubstitution() { return "const float " + name + " = " + toGLSL(getValue()) +";"; };
			QString getLockedSubstitution2() { return "#define " + name + " " + toGLSL(getValue()); };
		private:
			ComboSlider* comboSlider;
			double min;
			double max;
			double defaultValue;
		};

		/// A widget editor for a float variable.
		class Float2Widget : public VariableWidget {
		public:
			/// Notice that only x and y components are used here.
			Float2Widget(QWidget* parent, QWidget* variableEditor, QString name, Vector3f defaultValue, Vector3f min, Vector3f max);
			virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(min.toString()).arg(max.toString()); }
			virtual QString getValueAsText() { return ""; };
			virtual QString toString();
			virtual void fromString(QString string);
			virtual void setUserUniform(QGLShaderProgram* shaderProgram);

			// Third component unused for these
			Vector3f getValue() { return Vector3f(comboSlider1->getValue(),comboSlider2->getValue(),0.0); }
			void setValue(Vector3f v) { comboSlider1->setValue(v.x()); comboSlider2->setValue(v.y()); } 
			void reset() { setValue(defaultValue); }
			QString getLockedSubstitution() { return "const vec2 " + name + " = vec2(" + toGLSL(getValue().x()) + "," + toGLSL(getValue().y()) +");"; };
			QString getLockedSubstitution2() { return "#define " + name + "  vec2(" + toGLSL(getValue().x()) + "," + toGLSL(getValue().y()) +")"; };

		private:

			Vector3f defaultValue;
			ComboSlider* comboSlider1;
			ComboSlider* comboSlider2;
			Vector3f min;
			Vector3f max;
		};


		/// A widget editor for a float variable.
		class Float3Widget : public VariableWidget {
			Q_OBJECT
		public:
			/// FloatVariable constructor.
			Float3Widget(QWidget* parent, QWidget* variableEditor, QString name, Vector3f defaultValue, Vector3f min, Vector3f max);
			virtual QString getUniqueName();
			virtual QString getValueAsText() { return ""; };
			virtual QString toString();
			virtual void fromString(QString string);
			Vector3f getValue() { return Vector3f(comboSlider1->getValue(),comboSlider2->getValue(),comboSlider3->getValue()); }
			void setValue(Vector3f v);
			virtual void setUserUniform(QGLShaderProgram* shaderProgram);
			void reset() { setValue(defaultValue); }
			QString getLockedSubstitution() { return "const vec3 " + name + " = vec3(" + toGLSL(getValue().x()) + "," + toGLSL(getValue().y()) + "," + toGLSL(getValue().z()) +");"; };
			QString getLockedSubstitution2() { return "#define " + name + " vec3(" + toGLSL(getValue().x()) + "," + toGLSL(getValue().y()) + "," + toGLSL(getValue().z()) +")"; };

			public slots:
				void n1Changed();
				void n2Changed();
				void n3Changed();
signals:
				void doneChanges();
		private:
			Vector3f defaultValue;
			bool normalize;
			ComboSlider* comboSlider1;
			ComboSlider* comboSlider2;
			ComboSlider* comboSlider3;
			Vector3f min;
			Vector3f max;
		};

		/// A widget editor for a float variable.
		class Float4Widget : public VariableWidget {
			Q_OBJECT
		public:
			/// FloatVariable constructor.
			Float4Widget(QWidget* parent, QWidget* variableEditor, QString name, Vector4f defaultValue, Vector4f min, Vector4f max);
			virtual QString getUniqueName();
			virtual QString getValueAsText() { return ""; };
			virtual QString toString();
			virtual void fromString(QString string);
			Vector4f getValue() { return Vector4f(comboSlider1->getValue(),comboSlider2->getValue(),comboSlider3->getValue(),comboSlider4->getValue()); }
			void setValue(Vector4f v);
			virtual void setUserUniform(QGLShaderProgram* shaderProgram);
			void reset() { setValue(defaultValue); }
			QString getLockedSubstitution() { return "const vec4 " + name + " = vec4(" + toGLSL(getValue().x()) + "," + toGLSL(getValue().y()) + "," + toGLSL(getValue().z())+ "," + toGLSL(getValue().w()) +");"; };
			QString getLockedSubstitution2() { return "#define " + name + " vec4(" + toGLSL(getValue().x()) + "," + toGLSL(getValue().y()) + "," + toGLSL(getValue().z())+ "," + toGLSL(getValue().w()) +")"; };

signals:
			void doneChanges();
		private:
			Vector4f defaultValue;
			bool normalize;
			ComboSlider* comboSlider1;
			ComboSlider* comboSlider2;
			ComboSlider* comboSlider3;
			ComboSlider* comboSlider4;
			Vector4f min;
			Vector4f max;
		};


		class ColorWidget : public VariableWidget {
		public:
			/// FloatVariable constructor.
			ColorWidget(QWidget* parent, QWidget* variableEditor, QString name, SyntopiaCore::Math::Vector3f defaultValue);
			virtual QString getUniqueName() { return QString("%0:%1").arg(group).arg(getName()); }
			virtual QString getValueAsText() { return ""; };
			virtual QString toString();
			virtual void fromString(QString string);
			virtual void setUserUniform(QGLShaderProgram* shaderProgram);
			void reset() { colorChooser->setColor(defaultValue); }
			QString getLockedSubstitution() { return "const vec3 " + name + " = vec3(" + toGLSL(colorChooser->getValue()[0]) + "," + toGLSL(colorChooser->getValue()[1]) + "," + toGLSL(colorChooser->getValue()[2]) +");"; };
			QString getLockedSubstitution2() { return "#define " + name + " vec3(" + toGLSL(colorChooser->getValue()[0]) + "," + toGLSL(colorChooser->getValue()[1]) + "," + toGLSL(colorChooser->getValue()[2]) +")"; };
		private:
			ColorChooser* colorChooser;
			Vector3f defaultValue;
		};

		class FloatColorWidget : public VariableWidget {
		public:
			/// FloatVariable constructor.
			FloatColorWidget(QWidget* parent, QWidget* variableEditor, QString name, double defaultValue, double min, double max, Vector3f defaultColorValue);
			virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(min).arg(max); }
			virtual QString getValueAsText() { return ""; };
			virtual QString toString();
			virtual void fromString(QString string);
			virtual void setUserUniform(QGLShaderProgram* shaderProgram);
			void reset() { comboSlider->setValue(defaultValue); colorChooser->setColor(defaultColorValue); }
			QString getLockedSubstitution() { return "const vec4 " + name + " = vec4(" + toGLSL(colorChooser->getValue()[0]) + "," + toGLSL(colorChooser->getValue()[1]) + "," + toGLSL(colorChooser->getValue()[2]) + "," + toGLSL(comboSlider->getValue()) +");"; };
			QString getLockedSubstitution2() { return "#define " + name + " vec4(" + toGLSL(colorChooser->getValue()[0]) + "," + toGLSL(colorChooser->getValue()[1]) + "," + toGLSL(colorChooser->getValue()[2]) + "," + toGLSL(comboSlider->getValue()) +")"; };
		private:
			ComboSlider* comboSlider;
			double min;
			double max;
			double defaultValue;
			ColorChooser* colorChooser;
			Vector3f defaultColorValue;
		};

		class IntWidget : public VariableWidget {
		public:
			/// FloatVariable constructor.
			IntWidget(QWidget* parent, QWidget* variableEditor, QString name, int defaultValue, int min, int max);
			virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(min).arg(max); }
			virtual QString getValueAsText() { return QString::number(comboSlider->getValue()); };
			virtual QString toString();
			virtual void fromString(QString string);
			virtual void setUserUniform(QGLShaderProgram* shaderProgram);
			void reset() { comboSlider->setValue(defaultValue); }
			QString getLockedSubstitution() { return "const int " + name + " = " + QString::number(comboSlider->getValue()) + ";"; };
			QString getLockedSubstitution2() { return "#define " + name + " " + QString::number(comboSlider->getValue()) + ""; };
		private:
			IntComboSlider* comboSlider;
			int min;
			int max;
			int defaultValue;
		};

		class BoolWidget : public VariableWidget {
		public:
			BoolWidget(QWidget* parent, QWidget* variableEditor, QString name, bool defaultValue);
			virtual QString getUniqueName() { return QString("%0:%1").arg(group).arg(getName()); }
			virtual QString getValueAsText() { return (checkBox->isChecked()?"true":"false"); };
			virtual QString toString();
			virtual void fromString(QString string);
			virtual void setUserUniform(QGLShaderProgram* shaderProgram);
			void reset() { checkBox->setChecked(defaultValue); }
			QString getLockedSubstitution() { return "const bool " + name + " = " + (checkBox->isChecked() ? "true" : "false")+ ";"; };
			QString getLockedSubstitution2() { return "#define " + name + " " + (checkBox->isChecked() ? "true" : "false")+ ""; };
		private:
			bool defaultValue;
			QCheckBox* checkBox;
		};


	}
}

