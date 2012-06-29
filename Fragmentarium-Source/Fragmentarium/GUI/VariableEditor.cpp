#include "VariableEditor.h"

#include <QPushButton>
#include <QSlider>
#include <QDoubleSpinBox>
#include <QComboBox>
#include <QHBoxLayout>
#include <QLabel>
#include <QApplication>
#include <QScrollArea>
#include <QClipboard>
#include "../../SyntopiaCore/Logging/ListWidgetLogger.h"
#include "../../SyntopiaCore/Misc/MiniParser.h"
#include "MainWindow.h"
#include "VariableWidget.h"

using namespace SyntopiaCore::Logging;


namespace Fragmentarium {
	namespace GUI {

		using namespace SyntopiaCore::Misc;

		VariableEditor::VariableEditor(QWidget* parent, MainWindow* mainWindow) : QWidget(parent) {
			currentComboSlider = 0;
			this->mainWindow = mainWindow;
			layout = new QVBoxLayout(this);
			layout->setSpacing(0);
			layout->setContentsMargins (0,0,0,0);

			QWidget* tw = new QWidget(this);
			QHBoxLayout* topLayout = new QHBoxLayout(tw);

			QLabel* l = new QLabel("Preset:", tw);
			topLayout->addWidget(l);
			presetComboBox = new QComboBox(tw);
			presetComboBox->setSizePolicy(QSizePolicy::MinimumExpanding, QSizePolicy::Fixed);
			topLayout->addWidget(presetComboBox);
			QPushButton* pb2 = new QPushButton("Apply", tw);
			connect(pb2, SIGNAL(clicked()), this, SLOT(applyPreset()));
			topLayout->addWidget(pb2);
			tw->layout()->setContentsMargins(0,0,0,0);

			layout->addWidget(tw);


			tabWidget = new QTabWidget(this);
			layout->addWidget(tabWidget);

			QWidget* w = new QWidget(this);
			new QHBoxLayout(w);
			w->layout()->setContentsMargins(0,0,0,0);
			QPushButton* pb= new QPushButton("Reset All", this);
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

			tabWidget->setTabPosition(QTabWidget::East);

			connect(qApp, SIGNAL(focusChanged(QWidget*,QWidget*)), this, SLOT(focusChanged(QWidget*,QWidget*)));
		};	

		void VariableEditor::sliderDestroyed(QObject* obj) {
			if (obj==currentComboSlider) {
				currentComboSlider = 0;
				mainWindow->getEngine()->getCameraControl()->setComboSlider(currentComboSlider);
			}
		}

		void VariableEditor::focusChanged(QWidget* oldWidget,QWidget* newWidget) {
			// Detect if a ComboSlider gets or looses focus
			ComboSlider* oldFloat = 0;
			if (oldWidget && oldWidget->parent()) oldFloat = qobject_cast<ComboSlider*>(oldWidget->parent());
			ComboSlider* newFloat = 0;
			if (newWidget && newWidget->parent()) newFloat = qobject_cast<ComboSlider*>(newWidget->parent());

			if (newFloat) {

				if (currentComboSlider) {
					currentComboSlider->setPalette(QApplication::palette(oldFloat));
					currentComboSlider->setAutoFillBackground(false);
				}

				QPalette pal = newFloat->palette();
				pal.setColor(newFloat->backgroundRole(), Qt::gray);
				newFloat->setPalette(pal);
				newFloat->setAutoFillBackground(true);
				currentComboSlider = newFloat;
				mainWindow->getEngine()->getCameraControl()->setComboSlider(currentComboSlider);
				connect(currentComboSlider, SIGNAL(destroyed(QObject *)), this, SLOT(sliderDestroyed(QObject *)));
			}

		}

		void VariableEditor::setPresets(QMap<QString, QString> presets) {
			presetComboBox->clear();
			foreach (QString preset, presets.keys()) {
				presetComboBox->addItem(preset);
			}
			this->presets = presets;
		}

		bool VariableEditor::setDefault() {
			int i = presetComboBox->findText("Default", Qt::MatchStartsWith);
			if (i>=0) {
				presetComboBox->setCurrentIndex(i);
				INFO("Found 'default' index. Executing...");
				return applyPreset();
			}
			return false;
		}

		bool VariableEditor::applyPreset() {
			QString presetName = presetComboBox->currentText();
			QString preset = presets[presetName];
			return setSettings(preset);
		}

		void VariableEditor::resetUniforms() {
			for (int i = 0; i < variables.count(); i++ ) {
				delete(variables[i]);
			}
			variables.clear();
			mainWindow->resetCamera(true);
			mainWindow->render();
		}

		void VariableEditor::setUserUniforms(QGLShaderProgram* shaderProgram) {
			for (int i = 0; i < variables.count(); i++) {
				if (!variables[i]->isSystemVariable()) variables[i]->setUserUniform(shaderProgram);
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

		void VariableEditor::lockGroup() {
			QWidget* t = tabWidget->widget(tabWidget->currentIndex());

			QMap<QString, QWidget*>::const_iterator it;
			QString g;
			for (it = tabs.constBegin(); it!=tabs.constEnd(); it++ ) {
				if (it.value()->parent() == t) {
					g = it.key();
				}
			}

			foreach (VariableWidget* variable, variables) {
				if (variable->getGroup() == g) {
					variable->locked(true);
				}
			}
		}

		void VariableEditor::unlockGroup() {
			QWidget* t = tabWidget->widget(tabWidget->currentIndex());

			QMap<QString, QWidget*>::const_iterator it;
			QString g;
			for (it = tabs.constBegin(); it!=tabs.constEnd(); it++ ) {
				if (it.value()->parent() == t) {
					g = it.key();
				}
			}

			foreach (VariableWidget* variable, variables) {
				if (variable->getGroup() == g) {
					variable->locked(false);
				}
			}
		}


		void VariableEditor::resetGroup() {			
			QWidget* t = tabWidget->widget(tabWidget->currentIndex());

			QMap<QString, QWidget*>::const_iterator it;
			QString g;
			for (it = tabs.constBegin(); it!=tabs.constEnd(); it++ ) {
				if (it.value()->parent() == t) {
					g = it.key();
				} 
			}

			foreach (VariableWidget* variable, variables) {
				if (variable->getGroup() == g) {
					variable->reset();
				}
			}

			if (g=="Camera") {
				mainWindow->resetCamera(true);
			}

			mainWindow->callRedraw();
		}

		namespace {
			class ScrollArea : public QScrollArea {
			public:
				ScrollArea(QWidget* child): child(child) {};

				virtual void resizeEvent(QResizeEvent*) {
					child->setMinimumSize( viewport()->size().width(),child->size().height());
					child->setMaximumSize( viewport()->size().width(),child->size().height());
					// Seems we have to do this manually...
					QApplication::postEvent(this, new QEvent(QEvent::LayoutRequest));
				}
				QWidget* child;
			};
		}

		void VariableEditor::childChanged(bool lockedChanged) {
			emit changed(lockedChanged);
		}


		void VariableEditor::createGroup(QString g) {
			//INFO("Creating new "+ g);

			QWidget* w =new QWidget();

			w->setLayout(new QVBoxLayout(w));

			w->layout()->setSpacing(10);
			w->layout()->setContentsMargins (10,10,10,10);

			w->layout()->setSizeConstraint(QLayout::SetMinAndMaxSize);

			w->setMinimumSize(10,10);

			ScrollArea* sa = new ScrollArea(w);
			sa->setHorizontalScrollBarPolicy(Qt::ScrollBarAlwaysOff);
			w->setMinimumSize(10,10);
			sa->setWidget(w);
			w->setParent(sa);

			tabWidget->addTab(sa, g);
			tabs[g] = w;

			QWidget* b = new QWidget();
			b->setLayout(new QHBoxLayout(b));
			b->layout()->setSpacing(0);
			b->layout()->setContentsMargins (0,0,0,0);

			QPushButton* pb = new QPushButton(b);
			pb->setText("Reset group");
			b->layout()->addWidget(pb);
			connect(pb, SIGNAL(clicked()), this, SLOT(resetGroup()));
			pb = new QPushButton(b);
			pb->setText("Lock group");
			b->layout()->addWidget(pb);
			connect(pb, SIGNAL(clicked()), this, SLOT(lockGroup()));
			pb = new QPushButton(b);
			pb->setText("Unlock group");
			b->layout()->addWidget(pb);
			connect(pb, SIGNAL(clicked()), this, SLOT(unlockGroup()));

			w->layout()->addWidget(b);
			spacers[w] = b;
		}


		void VariableEditor::updateTextures(Parser::FragmentSource* fs, FileManager* fileManager) {
			for (int i = 0; i < variables.count(); i++) {
				variables[i]->updateTextures(fs, fileManager);
			}
		}


		void VariableEditor::substituteLockedVariables(Parser::FragmentSource* fs) {
			static QRegExp exp("^\\s*uniform\\s+(\\S+)\\s+(\\S+)\\s*;\\s*$");

			QMap<QString, VariableWidget*> map;
			QStringList names;
			for (int i = 0; i < variables.count(); i++) {
				if (variables[i]->getLockType() == Locked) {
					map[variables[i]->getName()] = variables[i];
					names.append(variables[i]->getName());
				}
			}
			INFO(QString("%1 locked variables: %2").arg(map.count()).arg(names.join(",")));


			for (int i = 0; i < fs->source.count(); i++) {
				QString s = fs->source[i];
				if (exp.indexIn(s)!=-1) {
					if (map.contains(exp.cap(2))) {
						QString s = map[exp.cap(2)]->getLockedSubstitution();
						if (!s.isNull()) fs->source[i] = s;
						//INFO("Substituted: " + s + " -> " + fs->source[i]);
					}
				}
			}
		}


		void VariableEditor::updateFromFragmentSource(Parser::FragmentSource* fs, bool* showGUI) {
			QVector<Parser::GuiParameter*> ps = fs->params;

			for (int i = 0; i < variables.count(); ) {
				if (variables[i]->isSystemVariable()) {
					variables.remove(i);
					i = 0;
				} else {
					i++;
				}
			}

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
					createGroup(g);
				} else {
					if (tabStillPresent.contains(g)) tabStillPresent[g] = true;

				}
				currentWidget = tabs[g];

				bool found = false;
				for (int j = 0; j < variables.count(); j++) {
					QString name = variables[j]->getUniqueName();
					// INFO("Checking " + name + " -> " +  ps[i]->getUniqueName());
					if (name == ps[i]->getUniqueName()) {
						found = true;
						variables[j]->setUpdated(true);


						variables[j]->setPalette(QApplication::palette(variables[j]));
						variables[j]->setAutoFillBackground(false);

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
						fw->setDefaultLockType(fp->getLockType());
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
						iw->setDefaultLockType(ip->getLockType());
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
						cw->setDefaultLockType(cp->getLockType());
						variables.append(cw);
						cw->setUpdated(true);
						currentWidget->layout()->addWidget(cw);
					} else if (dynamic_cast<Parser::FloatColorParameter*>(ps[i])) {
						Parser::FloatColorParameter* cp = dynamic_cast<Parser::FloatColorParameter*>(ps[i]);
						QString name = cp->getName();
						FloatColorWidget* cw = new FloatColorWidget(currentWidget, this, name,cp->getDefaultValue(), cp->getFrom(), cp->getTo(), cp->getDefaultColorValue());
						cw->setGroup(cp->getGroup());
						cw->setToolTip(cp->getTooltip());
						cw->setStatusTip(cp->getTooltip());
						cw->setDefaultLockType(cp->getLockType());
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
						f3w->setDefaultLockType(f3p->getLockType());
						variables.append(f3w);
						f3w->setUpdated(true);
						currentWidget->layout()->addWidget(f3w);
					} else if (dynamic_cast<Parser::Float4Parameter*>(ps[i])) {
						Parser::Float4Parameter* f4p = dynamic_cast<Parser::Float4Parameter*>(ps[i]);
						QString name = f4p->getName();
						Float4Widget* f4w = new Float4Widget(currentWidget, this, name, f4p->getDefaultValue(), f4p->getFrom(), f4p->getTo());
						f4w->setToolTip(f4p->getTooltip());
						f4w->setStatusTip(f4p->getTooltip());
						f4w->setGroup(f4p->getGroup());
						f4w->setDefaultLockType(f4p->getLockType());
						variables.append(f4w);
						f4w->setUpdated(true);
						currentWidget->layout()->addWidget(f4w);
					} else if (dynamic_cast<Parser::Float2Parameter*>(ps[i])) {
						Parser::Float2Parameter* f2p = dynamic_cast<Parser::Float2Parameter*>(ps[i]);
						QString name = f2p->getName();
						Float2Widget* f2w = new Float2Widget(currentWidget, this, name, f2p->getDefaultValue(), f2p->getFrom(), f2p->getTo());
						f2w->setToolTip(f2p->getTooltip());
						f2w->setStatusTip(f2p->getTooltip());
						f2w->setGroup(f2p->getGroup());
						f2w->setDefaultLockType(f2p->getLockType());
						variables.append(f2w);
						f2w->setUpdated(true);
						currentWidget->layout()->addWidget(f2w);
					} else if (dynamic_cast<Parser::BoolParameter*>(ps[i])) {
						Parser::BoolParameter* bp = dynamic_cast<Parser::BoolParameter*>(ps[i]);
						QString name = bp->getName();
						BoolWidget* bw = new BoolWidget(currentWidget, this, name, bp->getDefaultValue());
						bw->setToolTip(bp->getTooltip());
						bw->setStatusTip(bp->getTooltip());
						bw->setGroup(bp->getGroup());
						bw->setDefaultLockType(bp->getLockType());
						variables.append(bw);
						bw->setUpdated(true);
						currentWidget->layout()->addWidget(bw);
					} else if (dynamic_cast<Parser::SamplerParameter*>(ps[i])) {
						Parser::SamplerParameter* sp = dynamic_cast<Parser::SamplerParameter*>(ps[i]);
						QString name = sp->getName();
						SamplerWidget* sw = new SamplerWidget(mainWindow->getFileManager(), currentWidget, this, name, sp->getDefaultValue());
						sw->setToolTip(sp->getTooltip());
						sw->setStatusTip(sp->getTooltip());
						sw->setGroup(sp->getGroup());
						sw->setDefaultLockType(AlwaysLocked);
						variables.append(sw);
						sw->setUpdated(true);
						currentWidget->layout()->addWidget(sw);
						//((ScrollArea*)currentWidget->parent())->resizeEvent(0);
						//QApplication::postEvent(currentWidget->parent(), new QEvent(QEvent::LayoutRequest));
						
					} else {
						WARNING("Unsupported parameter");
					}

					// We need to move the spacer to bottom.
					currentWidget->layout()->removeWidget(spacers[currentWidget]);
					currentWidget->layout()->addWidget(spacers[currentWidget]);

				}
			}

			for (int i = 0; i < variables.count(); ) {
				if (variables[i]->isSystemVariable()) {
					variables.remove(i);
					i = 0;
				} else if (!variables[i]->isUpdated()) {
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
					spacers.remove(tabs[it.key()]);
					delete((tabs[it.key()]->parent()));
					tabs.remove(it.key());
				}
			}



			if (showGUI) (*showGUI) = (variables.count() != 0);


			if (fs) setPresets(fs->presets);
		}

		QString VariableEditor::getSettings() {
			QStringList l;
			for (int i = 0; i < variables.count(); i++) {
				QString name = variables[i]->getName();
				QString val = variables[i]->toSettingsString();
				l.append(name + " = " + val);
			}
			return l.join("\n");
		};

		bool VariableEditor::setSettings(QString text) {
			QStringList l = text.split("\n");
			QMap<QString, QString> maps;
			foreach (QString s, l) {
				if (s.trimmed().startsWith("#")) continue;
				if (s.trimmed().isEmpty()) continue;

				QStringList l2 = s.split("=");
				if (l2.count()!=2) {
					WARNING("Expected a key value pair, found: " + s);
					continue;
				}
				QString first = l2[0].trimmed();
				QString second = l2[1].trimmed();
				maps[first] = second;
			}

			bool requiresRecompile = false;
			for (int i = 0; i < variables.count(); i++) {
				if (maps.contains(variables[i]->getName())) {
					requiresRecompile = requiresRecompile | variables[i]->fromSettingsString(maps[variables[i]->getName()]);
					//INFO("Found: "+variables[i]->getName());
					maps.remove(variables[i]->getName());
				}
			}

			foreach (QString s, maps.keys()) {
				WARNING("Could not find: " + s);
			}
			return requiresRecompile;
		};

		VariableWidget* VariableEditor::getWidgetFromName(QString name) {
			for (int i = 0; i < variables.count(); i++) {
				if (variables[i]->getName() == name) {
					return variables[i];
				}
			}
			return 0;
		}

		void VariableEditor::updateCamera(CameraControl* c) {

			QString g = "Camera";
			if (!tabs.contains(g)) {
				createGroup(g);
			}

			c->connectWidgets(this);
			QVector<VariableWidget*> added= c->addWidgets(tabs[g], this);

			foreach (VariableWidget* v, added) {
				if (variables.contains(v)) continue;
				v->setGroup(g);
				variables.append(v);
				v->setUpdated(true);
				tabs[g]->layout()->addWidget(v);
			}
		}	


	}
}

