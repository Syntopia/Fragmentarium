#pragma once

#include <QString>
#include <QVector>
#include <QWidget>
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
			ComboSlider(QWidget* parent, double defaultValue, double minimum, double maximum) 
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
					connect(spinner, SIGNAL(valueChanged(double)), this, SLOT(spinnerChanged(double)));
					connect(slider, SIGNAL(valueChanged(int)), this, SLOT(sliderChanged(int)));
			}

			double getValue() { return myValue; }
			void setValue(double d) { myValue = d; spinner->setValue(d); }

signals:
			void changed();
 
			protected slots:
				void spinnerChanged(double) {
					double val = (spinner->value()-minimum)/(maximum-minimum);
					slider->setValue(val*100000);
					myValue = spinner->value();
					emit changed();
				}

				void sliderChanged(int) {
					double val = (slider->value()/100000.0)*(maximum-minimum)+minimum;
					spinner->setValue(val);
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
				//INFO("Set:" + v.toString());
				QPalette p = palette();
				p.setColor(backgroundRole(), QColor(v[0]*255.0,v[1]*255.0,v[2]*255.0));
				setAutoFillBackground( true );
				setPalette(p);
			}

			Vector3f getValue() { return value; }

			void mouseReleaseEvent(QMouseEvent*) {
				//INFO("Initial:" + value.toString());
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
		public:
			VariableWidget(QWidget* parent, QString name) : QWidget(parent), name(name), updated(false), systemVariable(false) {};
			virtual QString getValueAsText() { return ""; };
			QString getName() const { return name; };
			void setGroup(QString group) { this->group = group; }
			bool isUpdated() const { return updated; };
			void setUpdated(bool value) { updated = value; };
			virtual void setUserUniform(QGLShaderProgram* shaderProgram) = 0;
			virtual QString toString() = 0;
			virtual void fromString(QString string) = 0;
			virtual QString getUniqueName() = 0;
			void setSystemVariable(bool v) { systemVariable = v; }
			bool isSystemVariable() { return systemVariable; } 

		protected:
			QString name;
			QString group;
			bool updated;
			bool systemVariable;
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
			float getValue() { return comboSlider->getValue(); } 
			void setValue(float f) { comboSlider->setValue(f); }
		private:
			ComboSlider* comboSlider;
			double min;
			double max;
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
			
		private:
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
			virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(min.toString()).arg(max.toString()); }
			virtual QString getValueAsText() { return ""; };
			virtual QString toString();
			virtual void fromString(QString string);
			Vector3f getValue() { return Vector3f(comboSlider1->getValue(),comboSlider2->getValue(),comboSlider3->getValue()); }
			void setValue(Vector3f v);
			virtual void setUserUniform(QGLShaderProgram* shaderProgram);
		public slots:
			void n1Changed();
			void n2Changed();
			void n3Changed();
		signals:
			void doneChanges();
		private:

			bool normalize;
			ComboSlider* comboSlider1;
			ComboSlider* comboSlider2;
			ComboSlider* comboSlider3;
			Vector3f min;
			Vector3f max;
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
		private:
			ColorChooser* colorChooser;
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
		private:
			IntComboSlider* comboSlider;
			int min;
			int max;
		};

		class BoolWidget : public VariableWidget {
		public:
			BoolWidget(QWidget* parent, QWidget* variableEditor, QString name, bool defaultValue);
			virtual QString getUniqueName() { return QString("%0:%1").arg(group).arg(getName()); }
			virtual QString getValueAsText() { return (checkBox->isChecked()?"true":"false"); };
			virtual QString toString();
			virtual void fromString(QString string);
			virtual void setUserUniform(QGLShaderProgram* shaderProgram);
		private:
			QCheckBox* checkBox;
		};


	}
}

