#pragma once

#include <QString>
#include <QVector>
#include <QWidget>
#include <QMap>
#include <QSlider>
#include <QTabWidget>
#include <QFrame>
#include <QColorDialog>
#include <QDoubleSpinBox>
#include <QHBoxLayout>
#include <QGLShaderProgram>
#include "SyntopiaCore/Math/Vector3.h"

#include "../Parser/Preprocessor.h"
#include "SyntopiaCore/Logging/Logging.h"

/// Classes for the GUI Editor for the preprocessor constant variables.
/// E.g. the line: #define angle 45 (float:0.0-360.0)
///	will make a simple editor widget appear.
namespace Fragmentarium {
	namespace GUI {
	
		using namespace SyntopiaCore::Logging;
		using namespace SyntopiaCore::Math;

		class VariableWidget; // Forward decl...
		class MainWindow;

		/// The Variable Editor window.
		class VariableEditor : public QWidget {
		Q_OBJECT
		public:
			VariableEditor(QWidget* parent, MainWindow* mainWindow);

			void updateFromFragmentSource(Parser::FragmentSource* fs, bool* showGUI);
			void setUserUniforms(QGLShaderProgram* shaderProgram);
			QString getSettings();
			void setSettings(QString text);

		signals:
			void changed();

		public slots:
			void resetUniforms();
			void copy();
			void paste();
			void childChanged() { emit changed(); } 

		private:
			MainWindow* mainWindow;
			QSpacerItem* spacer;
			QVector<VariableWidget*> variables;
			QVBoxLayout* layout;
			QWidget* currentWidget;
			
			QMap<QString, QWidget*> tabs;
			QMap<QWidget*, QSpacerItem*> spacers;
			QTabWidget* tabWidget ;
		};

		// A helper class (combined float slider+spinner)
		class ComboSlider : public QWidget {
		Q_OBJECT
		public:
			ComboSlider(QWidget* parent, double defaultValue, double minimum, double maximum) 
				: QWidget(parent), defaultValue(defaultValue), minimum(minimum), maximum(maximum){
				setLayout(new QHBoxLayout());
				layout()->setContentsMargins(0,0,0,0);
				slider = new QSlider(Qt::Horizontal,this);
				slider->setRange(0,1000);
				double val = (defaultValue-minimum)/(maximum-minimum);
				slider->setValue(val*1000);
				spinner = new QDoubleSpinBox(this);
				spinner->setDecimals(5);
				spinner->setMaximum(maximum);
				spinner->setMinimum(minimum);
				spinner->setValue(defaultValue);
				layout()->addWidget(slider);
				layout()->addWidget(spinner);
				connect(spinner, SIGNAL(valueChanged(double)), this, SLOT(spinnerChanged(double)));
				connect(slider, SIGNAL(valueChanged(int)), this, SLOT(sliderChanged(int)));
			}

			double getValue() { return spinner->value(); }
			void setValue(double d) { spinner->setValue(d); }
		
		signals:
			void changed();
				
		protected slots:
			void spinnerChanged(double) {
				double val = (spinner->value()-minimum)/(maximum-minimum);
				slider->setValue(val*1000);
				emit changed();
			}

			void sliderChanged(int) {
				double val = (slider->value()/1000.0)*(maximum-minimum)+minimum;
				spinner->setValue(val);
				emit changed();
			}

		private:
			
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

	}
}

