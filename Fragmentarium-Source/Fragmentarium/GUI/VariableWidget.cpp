#include "VariableWidget.h"

#include <QPushButton>
#include <QToolButton>
#include <QSlider>
#include <QDoubleSpinBox>
#include <QHBoxLayout>
#include <QLabel>
#include <QApplication>
#include <QScrollArea>
#include <QClipboard>
#include "../../SyntopiaCore/Logging/ListWidgetLogger.h"
#include "../../SyntopiaCore/Misc/MiniParser.h"
#include "MainWindow.h"

using namespace SyntopiaCore::Logging;


namespace Fragmentarium {
	namespace GUI {

		using namespace SyntopiaCore::Misc;

   VariableWidget::VariableWidget(QWidget* parent, QWidget* variableEditor, QString name) : QWidget(parent), variableEditor(variableEditor), name(name), updated(false), systemVariable(false) {
      connect(this, SIGNAL(changed(bool)), variableEditor, SLOT(childChanged(bool)));
				QHBoxLayout* vl = new QHBoxLayout(this);
				vl->setSpacing(0);
				vl->setContentsMargins (0,0,0,0);
				lockButton = new QPushButton(this);
				lockButton->setFlat(true);
				lockButton->setStyleSheet("QPushButton {border: none; outline: none;}");
				lockButton->setIcon(QIcon(":/Icons/padlockb.png"));
				vl->addWidget(lockButton,0,Qt::AlignTop);
				lockButton->setFixedSize(22,16);
				lockButton->setCheckable(true);
				connect(lockButton, SIGNAL(toggled(bool)), this, SLOT(locked(bool)));
				
				widget = new QWidget(this);
				vl->addWidget(widget);

		};

		bool VariableWidget::isLocked() {
			return lockButton->isChecked();
		}

      void VariableWidget::valueChanged() {
         if (lockType == Locked) {
            QPalette pal = palette();
            pal.setColor(backgroundRole(), Qt::yellow);
            setPalette(pal);
            setAutoFillBackground(true);
            emit(changed(true));
         } else {
            emit(changed(false));
         }
      }


		void VariableWidget::locked(bool l) {
         if (defaultLockType == NotLockable) {
            lockButton->setIcon(QIcon());
            lockType = NotLockable;
            return;
         }

			if (l) {
				lockButton->setIcon(QIcon(":/Icons/padlocka.png"));
            lockType = Locked;
			} else {
				lockButton->setIcon(QIcon(":/Icons/padlockb.png"));
            lockType =  NotLocked;
			}
		}

      void VariableWidget::setDefaultLockType(LockType lt) {
         defaultLockType = lt;
         setLockType(lt);
      }

      void VariableWidget::setLockType(LockType lt) {
         lockType = lt;
         if (lt == Locked) {
            locked(true);
         } else {
            locked(false);
         }
      }

      QString VariableWidget::toSettingsString() {
         QString l;
         if (lockType != defaultLockType) {
            l = " " + lockType.toString();
         }
         return toString() + l;
      };

      void VariableWidget::fromSettingsString(QString string) {

         const QRegExp lockTypeString("(Locked|NotLocked|NotLockable)\\s*.?$");
         if (lockTypeString.indexIn(string)!=-1) {
            QString s = lockTypeString.cap(1);
            string.remove(s);
            lockType.fromString(s);
         }

         fromString(string);
      };


		
		/// FloatVariable constructor.
		FloatWidget::FloatWidget(QWidget* parent, QWidget* variableEditor, QString name, double defaultValue, double min, double max) 
         : VariableWidget(parent, variableEditor, name)  {
				this->defaultValue = defaultValue;
				QHBoxLayout* l = new QHBoxLayout(widget);
				l->setSpacing(0);
				l->setContentsMargins (0,0,0,0);
				QLabel* label = new QLabel(widget);
				label->setText(name);
				l->addWidget(label);
				comboSlider = new ComboSlider(parent, defaultValue, min, max);
				l->addWidget(comboSlider);
            connect(comboSlider, SIGNAL(changed()), this, SLOT(valueChanged()));
				this->min = min;
				this->max = max;
		};


		QString FloatWidget::toString() {
			float f = comboSlider->getValue();
			return QString::number(f);
		};

		void FloatWidget::fromString(QString string) {
			float f; 
			MiniParser(string).getFloat(f);
			comboSlider->setValue(f);
		};

		int VariableWidget::uniformLocation(QGLShaderProgram* shaderProgram) {
         if (lockType == Locked) return -1;
         int i = shaderProgram->uniformLocation(name);
			if (i == -1) {
				if (isEnabled()) {
					setEnabled(false);
					INFO("Unable to find '" + name + "' in shader program. Disabling widget.");
				}
			} else {
				if (!isEnabled()) {
					setEnabled(true);
				}
			}
			return i;
		}

		void FloatWidget::setUserUniform(QGLShaderProgram* shaderProgram) {
			int l = uniformLocation(shaderProgram);
			if (l != -1) {
				shaderProgram->setUniformValue(l, (float)(comboSlider->getValue()));
			}
		};




		//// ----- Float2Widget -----------------------------------------------



		/// Notice that only x and y components are used here.
		Float2Widget::Float2Widget(QWidget* parent, QWidget* variableEditor, QString name, Vector3f defaultValue, Vector3f min, Vector3f max) 
         : VariableWidget(parent, variableEditor, name)  {
				this->defaultValue = defaultValue;
				QGridLayout* m = new QGridLayout(widget);
				m->setSpacing(0);
				m->setContentsMargins (0,0,0,0);

				QLabel* label = new QLabel(widget);
				label->setText(name);
				m->addWidget(label,0,0);
				comboSlider1 = new ComboSlider(parent, defaultValue[0], min[0], max[0]);
				m->addWidget(comboSlider1,0,1);
            connect(comboSlider1, SIGNAL(changed()), this, SLOT(valueChanged()));

				comboSlider2 = new ComboSlider(parent, defaultValue[1], min[1], max[1]);
				m->addWidget(comboSlider2,1,1);
            connect(comboSlider2, SIGNAL(changed()), this, SLOT(valueChanged()));

				this->min = min;
				this->max = max;
		};


		QString Float2Widget::toString() {
			return QString("%1,%2").arg(comboSlider1->getValue()).arg(comboSlider2->getValue());
		};

		void Float2Widget::fromString(QString string) {
			float f1,f2;
			MiniParser(string).getFloat(f1).getFloat(f2);
			comboSlider1->setValue(f1);
			comboSlider2->setValue(f2);
		};

		void Float2Widget::setUserUniform(QGLShaderProgram* shaderProgram) {
			int l = uniformLocation(shaderProgram);
			if (l != -1) {
				shaderProgram->setUniformValue(l, (float)(comboSlider1->getValue()),(float)(comboSlider2->getValue()));
			}
		}

		//// ----- Float3Widget -----------------------------------------------

		Float3Widget::Float3Widget(QWidget* parent, QWidget* variableEditor, QString name, Vector3f defaultValue, Vector3f min, Vector3f max) 
         : VariableWidget(parent, variableEditor, name)  {
				normalize = false;
				this->defaultValue = defaultValue;
				
				if (min==max) {
					min = Vector3f(-1,-1,-1);
					max = Vector3f(1,1,1);
					normalize = true;
				}
				QGridLayout* m = new QGridLayout(widget);
				m->setSpacing(0);
				m->setContentsMargins (0,0,0,0);

				QLabel* label = new QLabel(widget);
				label->setText(name);
				m->addWidget(label,0,0);
				comboSlider1 = new ComboSlider(parent, defaultValue[0], min[0], max[0]);
				m->addWidget(comboSlider1,0,1);
				connect(comboSlider1, SIGNAL(changed()), this, SLOT(n1Changed()));
				
				comboSlider2 = new ComboSlider(parent, defaultValue[1], min[1], max[1]);
				m->addWidget(comboSlider2,1,1);
				connect(comboSlider2, SIGNAL(changed()), this, SLOT(n2Changed()));
				
				comboSlider3 = new ComboSlider(parent, defaultValue[2], min[2], max[2]);
				m->addWidget(comboSlider3,2,1);
				connect(comboSlider3, SIGNAL(changed()), this, SLOT(n3Changed()));
            connect(this, SIGNAL(doneChanges()), this, SLOT(valueChanged()));
				this->min = min;
				this->max = max;

		};

		void Float3Widget::setValue(Vector3f v) { 
			comboSlider1->blockSignals(true);
			comboSlider2->blockSignals(true);
			comboSlider3->blockSignals(true);
			comboSlider1->setValue(v.x());
			comboSlider2->setValue(v.y());
			comboSlider3->setValue(v.z()); 
			comboSlider1->blockSignals(false);
			comboSlider2->blockSignals(false);
			comboSlider3->blockSignals(false);
			
		}
			

		void Float3Widget::n1Changed() {
			if (normalize) {
				comboSlider2->blockSignals(true);
				comboSlider3->blockSignals(true);
				float x = comboSlider1->getValue();
				float y = comboSlider2->getValue();
				float z = comboSlider3->getValue();
				float a = sqrt((1-x*x)/(y*y+z*z));
				if (z*z+y*y == 0) {
					a = 0;
					comboSlider1->blockSignals(true);
					comboSlider1->setValue((x>0) ? 1.0 : -1.0);
					comboSlider1->blockSignals(false);	
				}
				comboSlider2->setValue(y*a);
				comboSlider3->setValue(z*a);
				comboSlider2->blockSignals(false);
				comboSlider3->blockSignals(false);
			}
		    emit(doneChanges());		
		}

		void Float3Widget::n2Changed() {
			if (normalize) {
				comboSlider1->blockSignals(true);
				comboSlider3->blockSignals(true);
				float x = comboSlider1->getValue();
				float y = comboSlider2->getValue();
				float z = comboSlider3->getValue();
				float a = sqrt((1-y*y)/(z*z+x*x));
				if (z*z+x*x == 0) {
					a = 0;
					comboSlider2->blockSignals(true);
					comboSlider2->setValue((y>0) ? 1.0 : -1.0);
					comboSlider2->blockSignals(false);	
				}
				comboSlider1->setValue(x*a);
				comboSlider3->setValue(z*a);
				comboSlider1->blockSignals(false);
				comboSlider3->blockSignals(false);
			}
		    emit(doneChanges());	
		}

		void Float3Widget::n3Changed() {
			if (normalize) {
				comboSlider1->blockSignals(true);
				comboSlider2->blockSignals(true);
				float x = comboSlider1->getValue();
				float y = comboSlider2->getValue();
				float z = comboSlider3->getValue();
				float a = sqrt((1-z*z)/(y*y+x*x));
				if (y*y+x*x == 0) {
					a = 0;
					comboSlider3->blockSignals(true);
					comboSlider3->setValue((z>0) ? 1.0 : -1.0);
					comboSlider3->blockSignals(false);	
				}
				comboSlider1->setValue(x*a);
				comboSlider2->setValue(y*a);
				comboSlider1->blockSignals(false);
				comboSlider2->blockSignals(false);
			}
		     emit(doneChanges());	
		}

		QString Float3Widget::getUniqueName() { 
			if (normalize) {
				return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg("[0 0 0]").arg("[0 0 0]");
			} else {
				return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(min.toString()).arg(max.toString());
			}
		}

		QString Float3Widget::toString() {
			return QString("%1,%2,%3").arg(comboSlider1->getValue()).arg(comboSlider2->getValue()).arg(comboSlider3->getValue());
		};

		void Float3Widget::fromString(QString string) {
			float f1,f2,f3;
			MiniParser(string).getFloat(f1).getFloat(f2).getFloat(f3);
			comboSlider1->setValue(f1);
			comboSlider2->setValue(f2);
			comboSlider3->setValue(f3);
		};

		void Float3Widget::setUserUniform(QGLShaderProgram* shaderProgram) {
			int l = uniformLocation(shaderProgram);
			if (l != -1) {
				shaderProgram->setUniformValue(l, (float)(comboSlider1->getValue()),(float)(comboSlider2->getValue()),(float)(comboSlider3->getValue()));
			}
		}

      //// ----- Float3Widget -----------------------------------------------

      Float4Widget::Float4Widget(QWidget* parent, QWidget* variableEditor, QString name, Vector4f defaultValue, Vector4f min, Vector4f max)
         : VariableWidget(parent, variableEditor, name)  {
            this->defaultValue = defaultValue;
            QGridLayout* m = new QGridLayout(widget);
            m->setSpacing(0);
            m->setContentsMargins (0,0,0,0);

            QLabel* label = new QLabel(widget);
            label->setText(name);
            m->addWidget(label,0,0);
            comboSlider1 = new ComboSlider(parent, defaultValue[0], min[0], max[0]);
            m->addWidget(comboSlider1,0,1);
            connect(comboSlider1, SIGNAL(changed()), this, SLOT(valueChanged()));

            comboSlider2 = new ComboSlider(parent, defaultValue[1], min[1], max[1]);
            m->addWidget(comboSlider2,1,1);
            connect(comboSlider2, SIGNAL(changed()), this, SLOT(valueChanged()));

            comboSlider3 = new ComboSlider(parent, defaultValue[2], min[2], max[2]);
            m->addWidget(comboSlider3,2,1);
            connect(comboSlider3, SIGNAL(changed()), this, SLOT(valueChanged()));


            comboSlider4 = new ComboSlider(parent, defaultValue[3], min[3], max[3]);
            m->addWidget(comboSlider4,3,1);
            connect(comboSlider4, SIGNAL(changed()), this, SLOT(valueChanged()));

            this->min = min;
            this->max = max;

      };

      void Float4Widget::setValue(Vector4f v) {
         comboSlider1->blockSignals(true);
         comboSlider2->blockSignals(true);
         comboSlider3->blockSignals(true);
         comboSlider4->blockSignals(true);
         comboSlider1->setValue(v.x());
         comboSlider2->setValue(v.y());
         comboSlider3->setValue(v.z());
         comboSlider3->setValue(v.w());
         comboSlider1->blockSignals(false);
         comboSlider2->blockSignals(false);
         comboSlider3->blockSignals(false);
         comboSlider4->blockSignals(false);

      }



      QString Float4Widget::getUniqueName() {
         return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(min.toString()).arg(max.toString());

      }

      QString Float4Widget::toString() {
         return QString("%1,%2,%3,%4").arg(comboSlider1->getValue()).arg(comboSlider2->getValue())
               .arg(comboSlider3->getValue())
               .arg(comboSlider4->getValue());
      };

      void Float4Widget::fromString(QString string) {
         float f1,f2,f3,f4;
         MiniParser(string).getFloat(f1).getFloat(f2).getFloat(f3).getFloat(f4);
         comboSlider1->setValue(f1);
         comboSlider2->setValue(f2);
         comboSlider3->setValue(f3);
         comboSlider4->setValue(f4);
      };

      void Float4Widget::setUserUniform(QGLShaderProgram* shaderProgram) {
         int l = uniformLocation(shaderProgram);
         if (l != -1) {
            shaderProgram->setUniformValue(l, (float)(comboSlider1->getValue()),(float)(comboSlider2->getValue()),(float)(comboSlider3->getValue()),(float)(comboSlider4->getValue()));
         }
      }


		/// ------------ ColorWidget ---------------------------------------

		ColorWidget::ColorWidget(QWidget* parent, QWidget* variableEditor, QString name, SyntopiaCore::Math::Vector3f defaultValue) 
         : VariableWidget(parent, variableEditor, name)  {
				this->defaultValue = defaultValue;
				QHBoxLayout* l = new QHBoxLayout(widget);
				l->setSpacing(2);
				l->setContentsMargins (0,0,0,0);
				QLabel* label = new QLabel(widget);
				label->setText(name);
				l->addWidget(label);
				colorChooser = new ColorChooser(parent, defaultValue);
				l->addWidget(colorChooser);
            connect(colorChooser, SIGNAL(changed()),  this, SLOT(valueChanged()));

		};

		QString ColorWidget::toString() {
			return QString("%1,%2,%3").arg(colorChooser->getValue()[0])
				.arg(colorChooser->getValue()[1]).arg(colorChooser->getValue()[2]);
		};

		void ColorWidget::fromString(QString string) {
			float f1,f2,f3;
			MiniParser(string).getFloat(f1).getFloat(f2).getFloat(f3);
			Vector3f c(f1,f2,f3);
			colorChooser->setColor(c);
		};

		void ColorWidget::setUserUniform(QGLShaderProgram* shaderProgram) {
			int l = uniformLocation(shaderProgram);
			if (l != -1) {
				shaderProgram->setUniformValue(l, (float)(colorChooser->getValue()[0])
					,(float)(colorChooser->getValue()[1]),(float)(colorChooser->getValue()[2]));
			}
		};


		/// FloatColorWidget constructor.
		FloatColorWidget::FloatColorWidget(QWidget* parent, QWidget* variableEditor, QString name, double defaultValue, double min, double max, Vector3f defaultColorValue) 
         : VariableWidget(parent, variableEditor, name)  {
				this->defaultValue = defaultValue;
				this->defaultColorValue = defaultColorValue;
				QHBoxLayout* l = new QHBoxLayout(widget);
				l->setSpacing(0);
				l->setContentsMargins (0,0,0,0);
				QLabel* label = new QLabel(widget);
				label->setText(name);
				l->addWidget(label);
				comboSlider = new ComboSlider(parent, defaultValue, min, max);
				l->addWidget(comboSlider);
            connect(comboSlider, SIGNAL(changed()), this, SLOT(valueChanged()));
				this->min = min;
				this->max = max;

				colorChooser = new ColorChooser(parent, defaultColorValue);
				colorChooser->setMinimumHeight(5);
				colorChooser->setMinimumWidth(30);
				l->addWidget(colorChooser);
            connect(colorChooser, SIGNAL(changed()),  this, SLOT(valueChanged()));

		};


		QString FloatColorWidget::toString() {
			return QString("%1,%2,%3,%4").arg(colorChooser->getValue()[0])
				.arg(colorChooser->getValue()[1]).arg(colorChooser->getValue()[2])
				.arg(comboSlider->getValue());
	
		};

		void FloatColorWidget::fromString(QString string) {
			float f,f1,f2,f3; 
			MiniParser(string).getFloat(f1).getFloat(f2).getFloat(f3).getFloat(f);
			Vector3f c(f1,f2,f3);
			colorChooser->setColor(c);
			comboSlider->setValue(f);
			
		};

		void FloatColorWidget::setUserUniform(QGLShaderProgram* shaderProgram) {
			int l = uniformLocation(shaderProgram);
			if (l != -1) {
				shaderProgram->setUniformValue(l, (float)(colorChooser->getValue()[0]),
					(float)(colorChooser->getValue()[1]),(float)(colorChooser->getValue()[2]),
					(float)(comboSlider->getValue())
				);
			}
		};






		/// ------------ IntWidget ---------------------

		IntWidget::IntWidget(QWidget* parent, QWidget* variableEditor, QString name, int defaultValue, int min, int max) 
         : VariableWidget(parent, variableEditor, name)  {
				this->defaultValue = defaultValue;
				QHBoxLayout* l = new QHBoxLayout(widget);
				l->setSpacing(2);
				l->setContentsMargins (0,0,0,0);
				QLabel* label = new QLabel(widget);
				label->setText(name);
				l->addWidget(label);
				comboSlider = new IntComboSlider(parent, defaultValue, min, max);
				l->addWidget(comboSlider);
            connect(comboSlider, SIGNAL(changed()),  this, SLOT(valueChanged()));

				this->min = min;
				this->max = max;
		};

		QString IntWidget::toString() {
			return QString("%1").arg(comboSlider->getValue());
		};

		void IntWidget::fromString(QString string) {
			int i;
			MiniParser(string).getInt(i);
			comboSlider->setValue(i);
		};

		void IntWidget::setUserUniform(QGLShaderProgram* shaderProgram) {
			int l = uniformLocation(shaderProgram);
			if (l != -1) {
				shaderProgram->setUniformValue(l, (int)(comboSlider->getValue()));
			}
		}

		BoolWidget::BoolWidget(QWidget* parent, QWidget* variableEditor, QString name, bool defaultValue) 
         : VariableWidget(parent, variableEditor, name)  {
				this->defaultValue = defaultValue;
				QHBoxLayout* l = new QHBoxLayout(widget);
				l->setSpacing(2);
				l->setContentsMargins (0,0,0,0);
				checkBox = new QCheckBox(widget);
				checkBox->setText(name);
				checkBox->setChecked(defaultValue);
            connect(checkBox, SIGNAL(clicked()),  this, SLOT(valueChanged()));
				l->addWidget(checkBox);
		};

		QString BoolWidget::toString() {
			return (checkBox->isChecked()?"true":"false"); 
		};

		void BoolWidget::fromString(QString string) {
			bool v = false;
			if (string.toLower().trimmed() == "true") v = true;
			checkBox->setChecked(v);
		};

		void BoolWidget::setUserUniform(QGLShaderProgram* shaderProgram) {
			int l = uniformLocation(shaderProgram);
			if (l != -1) {
				shaderProgram->setUniformValue(l, (bool)(checkBox->isChecked()));
			}
		}


	}
}

