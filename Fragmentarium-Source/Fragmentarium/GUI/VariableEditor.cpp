#include "VariableEditor.h"

#include <QPushButton>
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

		/// Widget editor base class.
		class VariableWidget : public QWidget {
		public:
			VariableWidget(QWidget* parent, QString name) : QWidget(parent), name(name), updated(false) {

			};

			virtual QString getValueAsText() { return ""; };
			QString getName() const { return name; };
			void setGroup(QString group) { this->group = group; }
			bool isUpdated() const { return updated; };
			void setUpdated(bool value) { updated = value; };
			virtual void setUserUniform(QGLShaderProgram* shaderProgram) = 0;
			virtual QString toString() = 0;
			virtual void fromString(QString string) = 0;

			virtual QString getUniqueName() = 0;
		protected:
			QString name;
			QString group;
			bool updated;
		};




		/// A widget editor for a float variable.
		class FloatWidget : public VariableWidget {
		public:
			/// FloatVariable constructor.
			FloatWidget(QWidget* parent, QWidget* variableEditor, QString name, double defaultValue, double min, double max) 
				: VariableWidget(parent, name)  {
					QHBoxLayout* l = new QHBoxLayout(this);
					l->setSpacing(0);
					l->setContentsMargins (0,0,0,0);
					QLabel* label = new QLabel(this);
					label->setText(name);
					l->addWidget(label);
					comboSlider = new ComboSlider(parent, defaultValue, min, max);
					l->addWidget(comboSlider);
					connect(comboSlider, SIGNAL(changed()), variableEditor, SLOT(childChanged()));
					this->min = min;
					this->max = max;

			};

			virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(min).arg(max); }
			virtual QString getValueAsText() { return QString::number(comboSlider->getValue()); };

			virtual QString toString() {
				float f = comboSlider->getValue();
				return QString::number(f);
			};

			virtual void fromString(QString string) {
				float f; 
				MiniParser(string).getFloat(f);
				comboSlider->setValue(f);
			};

			virtual void setUserUniform(QGLShaderProgram* shaderProgram) {
				int l = shaderProgram->uniformLocation(name);
				if (l == -1) {
					WARNING("Could not find :" + name);
				} else {
					shaderProgram->setUniformValue(l, (float)(comboSlider->getValue()));
				}
			}
		private:
			ComboSlider* comboSlider;
			double min;
			double max;
		};


		/// A widget editor for a float variable.
		class Float3Widget : public VariableWidget {
		public:
			/// FloatVariable constructor.
			Float3Widget(QWidget* parent, QWidget* variableEditor, QString name, Vector3f defaultValue, Vector3f min, Vector3f max) 
				: VariableWidget(parent, name)  {
					QGridLayout* m = new QGridLayout(this);
					m->setSpacing(0);
					m->setContentsMargins (0,0,0,0);

					QLabel* label = new QLabel(this);
					label->setText(name);
					m->addWidget(label,0,0);
					comboSlider1 = new ComboSlider(parent, defaultValue[0], min[0], max[0]);
					m->addWidget(comboSlider1,0,1);
					connect(comboSlider1, SIGNAL(changed()), variableEditor, SLOT(childChanged()));

					comboSlider2 = new ComboSlider(parent, defaultValue[1], min[1], max[1]);
					m->addWidget(comboSlider2,1,1);
					connect(comboSlider2, SIGNAL(changed()), variableEditor, SLOT(childChanged()));

					comboSlider3 = new ComboSlider(parent, defaultValue[2], min[2], max[2]);
					m->addWidget(comboSlider3,2,1);
					connect(comboSlider3, SIGNAL(changed()), variableEditor, SLOT(childChanged()));

					this->min = min;
					this->max = max;

			};

			virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(min.toString()).arg(max.toString()); }
			virtual QString getValueAsText() { return ""; };

			virtual QString toString() {
				return QString("%1,%2,%3").arg(comboSlider1->getValue()).arg(comboSlider2->getValue()).arg(comboSlider3->getValue());
			};

			virtual void fromString(QString string) {
				float f1,f2,f3;
				MiniParser(string).getFloat(f1).getFloat(f2).getFloat(f3);
				comboSlider1->setValue(f1);
				comboSlider2->setValue(f2);
				comboSlider3->setValue(f3);
			};

			virtual void setUserUniform(QGLShaderProgram* shaderProgram) {
				int l = shaderProgram->uniformLocation(name);
				if (l == -1) {
					WARNING("Could not find :" + name);
				} else {
					shaderProgram->setUniformValue(l, (float)(comboSlider1->getValue()),(float)(comboSlider2->getValue()),(float)(comboSlider3->getValue()));
				}
			}
		private:
			ComboSlider* comboSlider1;
			ComboSlider* comboSlider2;
			ComboSlider* comboSlider3;
			Vector3f min;
			Vector3f max;
		};


		class ColorWidget : public VariableWidget {
		public:
			/// FloatVariable constructor.
			ColorWidget(QWidget* parent, QWidget* variableEditor, QString name, SyntopiaCore::Math::Vector3f defaultValue) 
				: VariableWidget(parent, name)  {
					QHBoxLayout* l = new QHBoxLayout(this);
					l->setSpacing(2);
					l->setContentsMargins (0,0,0,0);
					QLabel* label = new QLabel(this);
					label->setText(name);
					l->addWidget(label);
					colorChooser = new ColorChooser(parent, defaultValue);
					l->addWidget(colorChooser);
					connect(colorChooser, SIGNAL(changed()), variableEditor, SLOT(childChanged()));

			};

			virtual QString getUniqueName() { return QString("%0:%1").arg(group).arg(getName()); }
			virtual QString getValueAsText() { return ""; };

			virtual QString toString() {
				return QString("%1,%2,%3").arg(colorChooser->getValue()[0])
					.arg(colorChooser->getValue()[1]).arg(colorChooser->getValue()[2]);
			};

			virtual void fromString(QString string) {
				float f1,f2,f3;
				MiniParser(string).getFloat(f1).getFloat(f2).getFloat(f3);
				Vector3f c(f1,f2,f3);
				colorChooser->setColor(c);
			};

			virtual void setUserUniform(QGLShaderProgram* shaderProgram) {
				int l = shaderProgram->uniformLocation(name);
				if (l == -1) {
					WARNING("Could not find :" + name);
				} else {
					shaderProgram->setUniformValue(l, (float)(colorChooser->getValue()[0])
						,(float)(colorChooser->getValue()[1]),(float)(colorChooser->getValue()[2]));
				}
			}
		private:
			ColorChooser* colorChooser;

		};


		class IntWidget : public VariableWidget {
		public:
			/// FloatVariable constructor.
			IntWidget(QWidget* parent, QWidget* variableEditor, QString name, int defaultValue, int min, int max) 
				: VariableWidget(parent, name)  {
					QHBoxLayout* l = new QHBoxLayout(this);
					l->setSpacing(2);
					l->setContentsMargins (0,0,0,0);
					QLabel* label = new QLabel(this);
					label->setText(name);
					l->addWidget(label);
					comboSlider = new IntComboSlider(parent, defaultValue, min, max);
					l->addWidget(comboSlider);
					connect(comboSlider, SIGNAL(changed()), variableEditor, SLOT(childChanged()));

					this->min = min;
					this->max = max;
			};

			virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(min).arg(max); }
			virtual QString getValueAsText() { return QString::number(comboSlider->getValue()); };

			virtual QString toString() {
				return QString("%1").arg(comboSlider->getValue());
			};

			virtual void fromString(QString string) {
				int i;
				MiniParser(string).getInt(i);
				comboSlider->setValue(i);
			};

			virtual void setUserUniform(QGLShaderProgram* shaderProgram) {
				int l = shaderProgram->uniformLocation(name);
				if (l == -1) {
					WARNING("Could not find :" + name);
				} else {
					shaderProgram->setUniformValue(l, (int)(comboSlider->getValue()));
				}
			}
		private:
			IntComboSlider* comboSlider;
			int min;
			int max;
		};

		class BoolWidget : public VariableWidget {
		public:
			BoolWidget(QWidget* parent, QWidget* variableEditor, QString name, bool defaultValue) 
				: VariableWidget(parent, name)  {
					QHBoxLayout* l = new QHBoxLayout(this);
					l->setSpacing(2);
					l->setContentsMargins (0,0,0,0);
					checkBox = new QCheckBox(this);
					checkBox->setText(name);
					checkBox->setChecked(defaultValue);
					connect(checkBox, SIGNAL(clicked()), variableEditor, SLOT(childChanged()));
					l->addWidget(checkBox);
			};

			virtual QString getUniqueName() { return QString("%0:%1").arg(group).arg(getName()); }
			virtual QString getValueAsText() { return (checkBox->isChecked()?"true":"false"); };

			virtual QString toString() {
				return (checkBox->isChecked()?"true":"false"); 
			};

			virtual void fromString(QString string) {
				bool v = false;
				if (string.toLower().trimmed() == "true") v = true;
				checkBox->setChecked(v);
			};

			virtual void setUserUniform(QGLShaderProgram* shaderProgram) {
				int l = shaderProgram->uniformLocation(name);
				if (l == -1) {
					WARNING("Could not find :" + name);
				} else {
					shaderProgram->setUniformValue(l, (bool)(checkBox->isChecked()));
				}
			}
		private:
			QCheckBox* checkBox;
		};



		VariableEditor::VariableEditor(QWidget* parent, MainWindow* mainWindow) : QWidget(parent) {
			this->mainWindow = mainWindow;
			layout = new QVBoxLayout(this);
			layout->setSpacing(0);
			layout->setContentsMargins (0,0,0,0);

			tabWidget = new QTabWidget(this);
			layout->addWidget(tabWidget);


			QWidget* w = new QWidget(this);
			new QHBoxLayout(w);
			w->layout()->setContentsMargins (0,0,0,0);
			QPushButton* pb= new QPushButton("Reset", this);
			connect(pb, SIGNAL(clicked()), this, SLOT(resetUniforms()));
			w->layout()->addWidget(pb);

			pb= new QPushButton("Copy to Clipboard", this);
			connect(pb, SIGNAL(clicked()), this, SLOT(copy()));
			w->layout()->addWidget(pb);

			pb= new QPushButton("Paste from Clipboard", this);
			connect(pb, SIGNAL(clicked()), this, SLOT(paste()));
			w->layout()->addWidget(pb);
			layout->addWidget(w);

			spacer=0;
			currentWidget=0;

			/*
			QScrollArea* sa = new QScrollArea(this);
			sa->setWidget(w);
			*/

			tabWidget->setTabPosition(QTabWidget::East);


		};	



		void VariableEditor::resetUniforms() {
			for (int i = 0; i < variables.count(); i++ ) {
				delete(variables[i]);
			}
			variables.clear();
			mainWindow->render();
		}

		void VariableEditor::setUserUniforms(QGLShaderProgram* shaderProgram) {
			for (int i = 0; i < variables.count(); i++) {
				variables[i]->setUserUniform(shaderProgram);
			}

		}

		void VariableEditor::copy() {
			INFO("Copied settings to clipboard");
			QClipboard *cb = QApplication::clipboard();
			cb->setText( getSettings(),QClipboard::Clipboard );
		}

		void VariableEditor::paste() {
			INFO("Pasted settings from clipboard");
			QClipboard *cb = QApplication::clipboard();
			QString text = cb->text(QClipboard::Clipboard);
			setSettings(text);
		}

		void VariableEditor::updateFromFragmentSource(Parser::FragmentSource* fs, bool* showGUI) {
			QVector<Parser::GuiParameter*> ps = fs->params;



			for (int i = 0; i < variables.count(); i++) {
				variables[i]->setUpdated(false);
			}

			QMap<QString, bool> tabStillPresent;
			foreach (QString s, tabs.keys()) {
				tabStillPresent[s] = false;
			}

			for (int i = 0; i < ps.count(); i++) {
				QString g = ps[i]->getGroup();
				if (g.isEmpty()) g = "Default";
				if (!tabs.contains(g)) {
					//INFO("Creating new "+ g);
					QWidget* w =new QWidget();
					w->setLayout(new QVBoxLayout(w));
					w->layout()->setSpacing(10);
					w->layout()->setContentsMargins (10,10,10,10);
					tabWidget->addTab(w, g);
					tabs[g] = w;
					QSpacerItem* spacer = new QSpacerItem(1,1, QSizePolicy::Minimum,QSizePolicy::Expanding);
					w->layout()->addItem(spacer);
					spacers[w] = spacer;
				} else {
					if (tabStillPresent.contains(g)) tabStillPresent[g] = true;
				}
				currentWidget = tabs[g];
				bool found = false;
				for (int j = 0; j < variables.count(); j++) {
					QString name = variables[j]->getUniqueName();
					//INFO("Checking " + name + " -> " +  ps[i]->getUniqueName());
					if (name == ps[i]->getUniqueName()) {
						found = true;
						variables[j]->setUpdated(true);
						//INFO("Found existing: " + variables[j]->getName() + QString(" value: %1").arg(variables[j]->getValueAsText()));
					}
				}

				if (!found) {
					//INFO("Creating: " + ps[i]->getName());
					if (dynamic_cast<Parser::FloatParameter*>(ps[i])) {
						Parser::FloatParameter* fp = dynamic_cast<Parser::FloatParameter*>(ps[i]);
						QString name = fp->getName();
						FloatWidget* fw = new FloatWidget(currentWidget, this, name, fp->getDefaultValue(), fp->getFrom(), fp->getTo());
						fw->setToolTip(fp->getTooltip());
						fw->setStatusTip(fp->getTooltip());
						fw->setGroup(fp->getGroup());
						variables.append(fw);
						fw->setUpdated(true);
						currentWidget->layout()->addWidget(fw);
					} else if (dynamic_cast<Parser::IntParameter*>(ps[i])) {
						Parser::IntParameter* ip = dynamic_cast<Parser::IntParameter*>(ps[i]);
						QString name = ip->getName();
						IntWidget* iw = new IntWidget(currentWidget, this, name, ip->getDefaultValue(), ip->getFrom(), ip->getTo());
						iw->setGroup(ip->getGroup());
						iw->setToolTip(ip->getTooltip());
						iw->setStatusTip(ip->getTooltip());
						variables.append(iw);
						iw->setUpdated(true);
						currentWidget->layout()->addWidget(iw);
					} else if (dynamic_cast<Parser::ColorParameter*>(ps[i])) {
						Parser::ColorParameter* cp = dynamic_cast<Parser::ColorParameter*>(ps[i]);
						QString name = cp->getName();
						ColorWidget* cw = new ColorWidget(currentWidget, this, name, cp->getDefaultValue());
						cw->setGroup(cp->getGroup());
						cw->setToolTip(cp->getTooltip());
						cw->setStatusTip(cp->getTooltip());
						variables.append(cw);
						cw->setUpdated(true);
						currentWidget->layout()->addWidget(cw);
					} else if (dynamic_cast<Parser::Float3Parameter*>(ps[i])) {
						Parser::Float3Parameter* f3p = dynamic_cast<Parser::Float3Parameter*>(ps[i]);
						QString name = f3p->getName();
						Float3Widget* f3w = new Float3Widget(currentWidget, this, name, f3p->getDefaultValue(), f3p->getFrom(), f3p->getTo());
						f3w->setToolTip(f3p->getTooltip());
						f3w->setStatusTip(f3p->getTooltip());
						f3w->setGroup(f3p->getGroup());
						variables.append(f3w);
						f3w->setUpdated(true);
						currentWidget->layout()->addWidget(f3w);
					} else if (dynamic_cast<Parser::BoolParameter*>(ps[i])) {
						Parser::BoolParameter* bp = dynamic_cast<Parser::BoolParameter*>(ps[i]);
						QString name = bp->getName();
						BoolWidget* bw = new BoolWidget(currentWidget, this, name, bp->getDefaultValue());
						bw->setToolTip(bp->getTooltip());
						bw->setStatusTip(bp->getTooltip());
						bw->setGroup(bp->getGroup());
						variables.append(bw);
						bw->setUpdated(true);
						currentWidget->layout()->addWidget(bw);
					} else {
						WARNING("Unsupported parameter");
					}

					// We need to move the spacer to bottom. This may be very slow...
					currentWidget->layout()->removeItem(spacers[currentWidget]);
					currentWidget->layout()->addItem(spacers[currentWidget]);

				}
			}

			for (int i = 0; i < variables.count(); ) {
				if (!variables[i]->isUpdated()) {
					//INFO("Deleting : " + variables[i]->getName());
					delete(variables[i]);
					variables.remove(i);
					i = 0;

				} else {
					i++;
				}
			}

			QMapIterator<QString, bool> it(tabStillPresent);
			while (it.hasNext()) {
				it.next();
				if (it.value() == false) {
					//INFO("Deleting "+ it.key());
					spacers.remove(tabs[it.key()]);
					delete(tabs[it.key()]);
					tabs.remove(it.key());
				}
			}



			if (showGUI) (*showGUI) = (variables.count() != 0);


		}

		QString VariableEditor::getSettings() {
			QStringList l;
			for (int i = 0; i < variables.count(); i++) {
				QString name = variables[i]->getName();
				QString val = variables[i]->toString();
				l.append(name + " = " + val);
			}
			return l.join("\n");
		};

		void VariableEditor::setSettings(QString text) {
			QStringList l = text.split("\n");
			QMap<QString, QString> maps;
			foreach (QString s, l) {
				if (s.trimmed().startsWith("#")) continue;

				QStringList l2 = s.split("=");
				if (l2.count()!=2) {
					WARNING("Expected a key value pair, found: " + s);
					continue;
				}
				QString first = l2[0].trimmed();
				QString second = l2[1].trimmed();
				maps[first] = second;
			}

			for (int i = 0; i < variables.count(); i++) {
				if (maps.contains(variables[i]->getName())) {
					variables[i]->fromString(maps[variables[i]->getName()]);
					//INFO("Found: "+variables[i]->getName());
					maps.remove(variables[i]->getName());
				}
			}

			foreach (QString s, maps.keys()) {
				WARNING("Could not find: " + s);
			}
		};


	}
}

