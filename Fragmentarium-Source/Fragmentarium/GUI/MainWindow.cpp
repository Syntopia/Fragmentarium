
#include <QtGui>
#include <QDir>
#include <QClipboard>
#include <QDesktopServices>
#include <QImageWriter>
#include <QTextBlockUserData>
#include <QStack>
#include <QImage>
#include <QPixmap>
#include <QDialogButtonBox>


#include <QButtonGroup>
#include <QCheckBox>
#include <QDialog>
#include <QHBoxLayout>
#include <QHeaderView>
#include <QLabel>
#include <QLineEdit>
#include <QSpacerItem>
#include <QTabWidget>
#include <QVBoxLayout>


#include "MainWindow.h"
#include "VariableEditor.h"
#include "../../SyntopiaCore/Logging/ListWidgetLogger.h"
#include "../../SyntopiaCore/Exceptions/Exception.h"
#include "../../Fragmentarium/Parser/Preprocessor.h"
#include "../../SyntopiaCore/Math/Vector3.h"
#include "../../SyntopiaCore/Math/Random.h"
#include "../../SyntopiaCore/Math/Matrix4.h"
#include "../../ThirdPartyCode/glextensions.h"


using namespace SyntopiaCore::Math;
using namespace SyntopiaCore::Logging;
using namespace SyntopiaCore::Exceptions;
using namespace Fragmentarium::Parser;

namespace Fragmentarium {
	namespace GUI {

		namespace {
			int MaxRecentFiles = 5;

			class PreferencesDialog : public QDialog
			{
			public:
				PreferencesDialog(QWidget* parent) : QDialog(parent) 
				{
					setObjectName("Dialog");
					resize(415, 335);
					setSizeGripEnabled(true);
					setModal(true);
					verticalLayout_2 = new QVBoxLayout(this);
					verticalLayout_2->setObjectName("verticalLayout_2");
					tabWidget = new QTabWidget(this);
					tabWidget->setObjectName("tabWidget");
					tab = new QWidget();
					tab->setObjectName(QString::fromUtf8("tab"));
					verticalLayout = new QVBoxLayout(tab);
					verticalLayout->setObjectName("verticalLayout");
					checkBox = new QCheckBox(tab);
					checkBox->setObjectName("checkBox");

					verticalLayout->addWidget(checkBox);

					checkBox_2 = new QCheckBox(tab);
					checkBox_2->setObjectName("checkBox_2");

					verticalLayout->addWidget(checkBox_2);

					horizontalLayout = new QHBoxLayout();
					horizontalLayout->setObjectName("horizontalLayout");
					label = new QLabel(tab);
					label->setObjectName("label");
					horizontalLayout->addWidget(label);
					lineEdit = new QLineEdit(tab);
					lineEdit->setObjectName("lineEdit");
					horizontalLayout->addWidget(lineEdit);
					verticalLayout->addLayout(horizontalLayout);
					verticalSpacer = new QSpacerItem(20, 167, QSizePolicy::Minimum, QSizePolicy::Expanding);
					verticalLayout->addItem(verticalSpacer);

					tabWidget->addTab(tab, QString());
					
					verticalLayout_2->addWidget(tabWidget);

					buttonBox = new QDialogButtonBox(this);
					buttonBox->setObjectName("buttonBox");
					buttonBox->setOrientation(Qt::Horizontal);
					buttonBox->setStandardButtons(QDialogButtonBox::Cancel|QDialogButtonBox::Ok);

					verticalLayout_2->addWidget(buttonBox);
					QObject::connect(buttonBox, SIGNAL(accepted()), this, SLOT(accept()));
					QObject::connect(buttonBox, SIGNAL(rejected()), this, SLOT(reject()));
					tabWidget->setCurrentIndex(0);
					QMetaObject::connectSlotsByName(this);
					setWindowTitle("Preferences");
					checkBox->setText("Move main() to end");
					checkBox->setStatusTip(tr("For compatibility with some GPU's."));

					checkBox_2->setText("Debug final GLSL script");
					checkBox_2->setStatusTip(tr("Opens the combined and preprocessed GLSL script in a new tab."));
					label->setText("Include paths:");
					tabWidget->setTabText(tabWidget->indexOf(tab),  "Main");

					QSettings settings;
					checkBox_2->setChecked(settings.value("debugScript", false).toBool());
					checkBox->setChecked(settings.value("moveMain", true).toBool());
					lineEdit->setText(settings.value("includePaths", "Examples/include;").toString());
				} 

				virtual void accept() {
					saveSettings();
					QDialog::accept();
				}

				void saveSettings() {
					QSettings settings;
					settings.setValue("debugScript", checkBox_2->isChecked());
					settings.setValue("moveMain", checkBox->isChecked());
					settings.setValue("includePaths", lineEdit->text());
				}

				QVBoxLayout *verticalLayout_2;
				QTabWidget *tabWidget;
				QWidget *tab;
				QVBoxLayout *verticalLayout;
				QCheckBox *checkBox;
				QCheckBox *checkBox_2;
				QHBoxLayout *horizontalLayout;
				QLabel *label;
				QLineEdit *lineEdit;
				QSpacerItem *verticalSpacer;
				QWidget *tab_2;
				QDialogButtonBox *buttonBox;
			};

		}

		namespace {

			void createCommandHelpMenu(QMenu* menu, QWidget* textEdit) {
				QMenu *preprocessorMenu = new QMenu("Preprocessor", 0);
				preprocessorMenu->addAction("#include ...", textEdit , SLOT(insertText()));
				QAction* before = 0;
				if (menu->actions().count() > 0) before = menu->actions()[0];
				menu->insertMenu(before, preprocessorMenu);
				menu->insertSeparator(before);
			}
		}
		void TextEdit::contextMenuEvent(QContextMenuEvent *event)
		{	
			QMenu *menu = createStandardContextMenu();

			createCommandHelpMenu(menu, this);

			menu->exec(event->globalPos());
			delete menu;
		}

		void TextEdit::insertText() {
			QString text = ((QAction*)sender())->text();
			insertPlainText(text.section("//",0,0)); // strip comments
		}


		class EisenScriptHighlighter : public QSyntaxHighlighter {
		public:

			EisenScriptHighlighter(QTextEdit* e) : QSyntaxHighlighter(e) {
				keywordFormat.setFontWeight(QFont::Bold);
				keywordFormat.setForeground(Qt::darkMagenta);
				bracketFormat.setFontWeight(QFont::Bold);
				bracketFormat.setForeground(Qt::blue);
				primitiveFormat.setFontWeight(QFont::Bold);
				primitiveFormat.setForeground(Qt::darkYellow);
				commentFormat.setForeground(Qt::darkGreen);
				warningFormat.setBackground(QBrush(Qt::yellow));
				preprocessorFormat.setForeground(QBrush(Qt::blue));
				preprocessorFormat.setFontWeight(QFont::Bold);
				preprocessor2Format.setForeground(QBrush(Qt::darkRed));
				preprocessor2Format.setFontWeight(QFont::Bold);


				expression = QRegExp("(uniform|attribute|bool|break|bvec2|bvec3|bvec4|const|continue|discard|do|else|false|float|for|if|in|inout|int|ivec2|ivec3|ivec4|main|mat2|mat3|mat4|out|return|true|uniorm|varying|vec2|vec3|vec4|void|while|sampler1D|sampler2D|sampler3Dsampler2DShadow|struct)");
				primitives = QRegExp("(abs|acos|all|any|asin|atan|ceil|sin|clamp|cos|cross|dFdx|dFdy|degrees|distance|dot|equal|exp|exp2|faceforward|floor|fract|ftransform|fwidth|greaterThan|greaterThanqual|inversesqrt|length|lessThan|lessThanEqual|log|log2|matrixCompMult|max|min|mix|mod|noise1|noise2|noise3|noise4|normalize|not|notEqual|pow|radians|reflect|reract|shadow1D|shadow1DLod|shadow1DProj|shadow1DProjLod|shadow2D|shadow2DLod|shadow2DProj|shadow2DProjLod|sign|sin|smoothstep|sqrt|step|tan|texture1D|texture1DLod|texture1DProj|texture1DProjLod|texture2D|texture2DLod|texture2DProj|texture2DProjLod|texture3D|texture3DLod|texture3DProj|texture3DProjLod|textureCube|textureCubeLod)");
				randomNumber = QRegExp("(random\\[[-+]?[0-9]*\\.?[0-9]+,[-+]?[0-9]*\\.?[0-9]+\\])"); // random[-2.3,3.4]


				float3Slider = QRegExp("^\\s*uniform\\s+vec3\\s+(\\S+)\\s*;\\s*slider\\[\\((\\S+),(\\S+),(\\S+)\\),\\((\\S+),(\\S+),(\\S+)\\),\\((\\S+),(\\S+),(\\S+)\\)\\].*$"); 
				colorChooser = QRegExp("^\\s*uniform\\s+vec3\\s+(\\S+)\\s*;\\s*color\\[(\\S+),(\\S+),(\\S+)\\].*$"); 
				floatSlider = QRegExp("^\\s*uniform\\s+float\\s+(\\S+)\\s*;\\s*slider\\[(\\S+),(\\S+),(\\S+)\\].*$"); 
				intSlider = QRegExp("^\\s*uniform\\s+int\\s+(\\S+)\\s*;\\s*slider\\[(\\S+),(\\S+),(\\S+)\\].*$"); 
				boolChooser = QRegExp("^\\s*uniform\\s+bool\\s+(\\S+)\\s*;\\s*checkbox\\[(\\S+)\\].*$"); 
				replace = QRegExp("^#replace\\s+\"([^\"]+)\"\\s+\"([^\"]+)\"\\s*$"); // Look for #reaplace "var1" "var2"
				sampler2D = QRegExp("^\\s*uniform\\s+sampler2D\\s+(\\S+)\\s*;\\s*file\\[(.*)\\].*$"); 
				
				expression.setCaseSensitivity(Qt::CaseInsensitive);
				primitives.setCaseSensitivity(Qt::CaseInsensitive);
				randomNumber.setCaseSensitivity(Qt::CaseInsensitive);
			};

			void highlightBlock(const QString &text)
			{

				if (currentBlockState() == 2) {
					setFormat(0, text.length(), warningFormat);
					setCurrentBlockState(-1);
					return;
				}


				if (previousBlockState() != 1 && currentBlockState() == 1) {
					// This line was previously a multi-line start 
					if (!text.contains("*/")) setCurrentBlockState(0);
				}

				if (previousBlockState() == 1) {
					// Part of multi-line comment. Skip the rest...
					if (!text.contains("*/")) {
						setFormat(0, text.length(), commentFormat);
						setCurrentBlockState(1);
						return;
					}
				}

				// Line parsing
				QString current;
				int startMatch = 0;

				
				if (float3Slider.exactMatch(text) || colorChooser.exactMatch(text) || floatSlider.exactMatch(text) ||
				intSlider.exactMatch(text) || boolChooser.exactMatch(text) || replace.exactMatch(text) ||
				sampler2D.exactMatch(text)) {
					setFormat(0, text.length()-1, preprocessor2Format);
				}

				for (int i = 0; i < text.length(); i++) {

					if ((i > 0) && text.at(i) == '*' && text.at(i-1) == '/') {
						// Multi-line comment begins
						setFormat(i-1, text.length()-i+1, commentFormat);
						setCurrentBlockState(1);
						return;
					}

					if ((i > 0) && text.at(i) == '/' && text.at(i-1) == '*') {
						// Multi-line comment ends
						setFormat(0, i, commentFormat);
						if (currentBlockState() != 0) {
							setCurrentBlockState(0);
						}
						continue;
					}

					if (text.at(0) == '#') {
						// Preprocessor format
						setFormat(0, text.length(), preprocessorFormat);
						continue;
					}

					if ((i > 0) && (i < text.length()-2) && text.at(i) == '/' && text.at(i-1) == '/') {
						// Single-line comments
						setFormat(i-1, text.length()-i+1, commentFormat);
						break;
					}

					bool delimiter = !text.at(i).isLetterOrNumber();//(text.at(i) == '(' || text.at(i) == ')' || text.at(i) == '{' || text.at(i) == '\t' || text.at(i) == '}' || text.at(i) == ' '  || (text.at(i) == '\r') || (text.at(i) == '\n'));
					bool lastChar = (i==text.length()-1);
					if (delimiter || lastChar) {
						if (lastChar && !delimiter) current += text.at(i);
						int adder = (i==text.length()-1 ? 1 : 0);
						if (expression.exactMatch(current)) setFormat(startMatch, i-startMatch+adder, keywordFormat);
						if (primitives.exactMatch(current)) setFormat(startMatch, i-startMatch+adder, primitiveFormat);
						if (randomNumber.exactMatch(current)) setFormat(startMatch, i-startMatch+adder, preprocessorFormat);
						if (text.at(i) == '{' || text.at(i) == '}') setFormat(i, 1, bracketFormat);
						startMatch = i;
						current = "";
					} else {
						current += text.at(i);
					}
				}

			}; 
		private:
			QTextCharFormat keywordFormat;
			QTextCharFormat bracketFormat;
			QTextCharFormat primitiveFormat;
			QTextCharFormat commentFormat;
			QTextCharFormat warningFormat;
			QTextCharFormat preprocessorFormat;
			QTextCharFormat preprocessor2Format;
			
			QRegExp float3Slider;
			QRegExp colorChooser;
			QRegExp floatSlider;
			QRegExp intSlider;
			QRegExp boolChooser;
			QRegExp replace;
			QRegExp sampler2D;

			QRegExp expression;
			QRegExp primitives;
			QRegExp randomNumber;
		};


		MainWindow::MainWindow()
		{
			init();
			loadFile(QDir(getExamplesDir()).absoluteFilePath("Default.frag"));
			tabChanged(0); // to update title.
		}

		MainWindow::MainWindow(const QString &fileName)
		{
			QDir::setCurrent(QCoreApplication::applicationDirPath ()); // Otherwise we cannot find examples + templates
			init();
			loadFile(fileName);
			tabChanged(0); // to update title.
		}

		void MainWindow::closeEvent(QCloseEvent *ev)
		{

			bool modification = false;
			for (int i = 0; i < tabInfo.size(); i++) {
				if (tabInfo[i].unsaved) modification = true;
			}

			if (modification) {
				int i = QMessageBox::warning(this, "Unsaved changed", "There are tabs with unsaved changes.\r\nContinue and loose changes?", QMessageBox::Ok, QMessageBox::Cancel);
				if (i == QMessageBox::Ok) {
					// OK
					ev->accept();
					return;
				} else {
					// Cancel
					ev->ignore();
					return;
				}
			}
			ev->accept();

			writeSettings();
		}

		void MainWindow::newFile()
		{
			insertTabPage("");
		}

		void MainWindow::open()
		{
			QString filter = "Fragment Source (*.frag);;All Files (*.*)";
			QString fileName = QFileDialog::getOpenFileName(this, QString(), QString(), filter);
			if (!fileName.isEmpty()) {
				loadFile(fileName);
			}
		}

		void MainWindow::keyReleaseEvent(QKeyEvent* ev) {
			if (ev->key() == Qt::Key_Escape) {
				toggleFullScreen();
			} else if (ev->key() == Qt::Key_F5 && fullScreenEnabled) {
				render();
			}  else {
				ev->ignore();
			}
		};


		bool MainWindow::save()
		{
			int index = tabBar->currentIndex();
			if (index == -1) { WARNING("No open tab"); return false; } 
			TabInfo t = tabInfo[index];

			if (t.hasBeenSavedOnce) {
				return saveFile(t.filename);
			} else {
				return saveAs();
			}
		}

		bool MainWindow::saveAs()
		{
			int index = tabBar->currentIndex();
			if (index == -1) { WARNING("No open tab"); return false; } 

			TabInfo t = tabInfo[index];

			QString filter = "Fragment Source (*.frag);;All Files (*.*)";

			QString fileName = QFileDialog::getSaveFileName(this, tr("Save As"), t.filename, filter);
			if (fileName.isEmpty())
				return false;

			return saveFile(fileName);
		}

		void MainWindow::about()
		{

			QFile file(getMiscDir() + QDir::separator() + "about.html");
			if (!file.open(QFile::ReadOnly | QFile::Text)) {
				WARNING("Could not open about.html...");
				return;
			}

			QTextStream in(&file);
			QString text = in.readAll();

			text.replace("$VERSION$", version.toLongString());

			QMessageBox mb(this);
			mb.setText(text);
			mb.setWindowTitle("About Fragmentarium");
			mb.setIconPixmap(getMiscDir() + QDir::separator() + "icon.jpg");
			mb.setMinimumWidth(800);
			mb.exec();

		}

		void MainWindow::documentWasModified()
		{
			tabInfo[tabBar->currentIndex()].unsaved = true;
			tabChanged(tabBar->currentIndex());
		}

		void MainWindow::init()
		{
			setAcceptDrops(true);

			hasBeenResized = true;

			oldDirtyPosition = -1;
			setFocusPolicy(Qt::StrongFocus);

			version = SyntopiaCore::Misc::Version(0, 0, 1, -1, " (\"ALPHA\")");
			setAttribute(Qt::WA_DeleteOnClose);

			QSplitter*	splitter = new QSplitter(this);
			splitter->setObjectName(QString::fromUtf8("splitter"));
			splitter->setOrientation(Qt::Horizontal);

			stackedTextEdits = new QStackedWidget(splitter);

			QGLFormat format;
			//format.setDoubleBuffer(false);
			engine = new DisplayWidget(format, this,splitter);
			engine->makeCurrent();
			if (!getGLExtensionFunctions().resolve(engine->context())) {
				QMessageBox::critical(0, "OpenGL features missing",
					"Failed to resolve OpenGL functions required to run this application.\n"
					"The program will now exit.");
				exit(0);
			}
			tabBar = new QTabBar(this);

#if QT_VERSION >= 0x040500
			tabBar->setTabsClosable(true);
			connect(tabBar, SIGNAL(tabCloseRequested(int)), this, SLOT(closeTab(int)));
#endif 

			fpsLabel = new QLabel(this);
			statusBar()->addPermanentWidget(fpsLabel);

			QFrame* f = new QFrame(this);
			frameMainWindow = new QVBoxLayout();
			frameMainWindow->setSpacing(0);
			frameMainWindow->setMargin(4);
			f->setLayout(frameMainWindow);
			f->layout()->addWidget(tabBar);
			f->layout()->addWidget(splitter);
			setCentralWidget(f);

			QList<int> l; l.append(100); l.append(400);
			splitter->setSizes(l);

			createActions();

			QDir d(getExamplesDir());

			// Log widget (in dockable window)
			dockLog = new QDockWidget(this);
			dockLog->setWindowTitle("Log");
			dockLog->setObjectName(QString::fromUtf8("dockWidget"));
			dockLog->setAllowedAreas(Qt::BottomDockWidgetArea);
			QWidget* dockLogContents = new QWidget(dockLog);
			dockLogContents->setObjectName(QString::fromUtf8("dockWidgetContents"));
			QVBoxLayout* vboxLayout1 = new QVBoxLayout(dockLogContents);
			vboxLayout1->setObjectName(QString::fromUtf8("vboxLayout1"));
			vboxLayout1->setContentsMargins(0, 0, 0, 0);

			logger = new ListWidgetLogger(dockLog);
			vboxLayout1->addWidget(logger->getListWidget());
			dockLog->setWidget(dockLogContents);
			addDockWidget(static_cast<Qt::DockWidgetArea>(8), dockLog);

			// Variable editor (in dockable window)
			editorDockWidget = new QDockWidget(this);
			editorDockWidget->setMinimumWidth(250);
			editorDockWidget->setWindowTitle("Parameters (uniforms)");
			editorDockWidget->setObjectName(QString::fromUtf8("editorDockWidget"));
			editorDockWidget->setAllowedAreas(Qt::RightDockWidgetArea);
			QWidget* editorLogContents = new QWidget(dockLog);
			editorLogContents->setObjectName(QString::fromUtf8("editorLogContents"));
			QVBoxLayout* vboxLayout2 = new QVBoxLayout(editorLogContents);
			vboxLayout2->setObjectName(QString::fromUtf8("vboxLayout2"));
			vboxLayout2->setContentsMargins(0, 0, 0, 0);

			variableEditor = new VariableEditor(editorDockWidget, this);
			variableEditor->setMinimumWidth(250);
			vboxLayout2->addWidget(variableEditor);
			editorDockWidget->setWidget(editorLogContents);
			addDockWidget(Qt::RightDockWidgetArea, editorDockWidget);
			connect(variableEditor, SIGNAL(changed()), this, SLOT(variablesChanged()));

			editorDockWidget->setHidden(true);
			setMouseTracking(true);

			INFO(QString("Welcome to Fragmentarium version %1. A Syntopia Project.").arg(version.toLongString()));
			INFO("This version is VERY alpha!");
			INFO("");
			INFO("Please report bugs and feature requests at the SourceForge forums (weblink at the Help Menu). Enjoy.");
			//WARNING("This is an experimental SVN checkout build. For stability use the package releases.");

			fullScreenEnabled = false;
			createOpenGLContextMenu();

			connect(this->tabBar, SIGNAL(currentChanged(int)), this, SLOT(tabChanged(int)));

			readSettings();

			//m->addMenu(createPopupMenu());

			createToolBars();
			createStatusBar();
			createMenus();

		}

		void MainWindow::setUserUniforms(QGLShaderProgram* shaderProgram) {
			if (!variableEditor || !shaderProgram) return;
			variableEditor->setUserUniforms(shaderProgram);
		}

		void MainWindow::variablesChanged() {
			engine->requireRedraw();
		}


		void MainWindow::createOpenGLContextMenu() {
			openGLContextMenu = new QMenu();			

			openGLContextMenu->addAction(fullScreenAction);
			openGLContextMenu->addAction(screenshotAction);
			openGLContextMenu->addAction(resetViewAction);
			engine->setContextMenu(openGLContextMenu);
		}


		void MainWindow::toggleFullScreen() {
			if (fullScreenEnabled) {
				frameMainWindow->setMargin(4);
				showNormal();
				fullScreenEnabled = false;
				fullScreenAction->setChecked(false);
				stackedTextEdits->show();
				dockLog->show();
				menuBar()->show();
				statusBar()->show();
				fileToolBar->show();
				editToolBar->show();
				renderToolBar->show();
				tabBar->show();
				renderModeToolBar->show();
			} else {
				frameMainWindow->setMargin(0);
				fullScreenAction->setChecked(true);
				fullScreenEnabled = true;

				tabBar->hide();
				stackedTextEdits->hide();
				dockLog->hide();
				menuBar()->hide();
				statusBar()->hide();
				fileToolBar->hide();
				editToolBar->hide();
				renderToolBar->hide();
				renderModeToolBar->hide();
				showFullScreen();
			}
		}


		void MainWindow::createActions()
		{
			fullScreenAction = new QAction(tr("F&ullscreen"), this);
			fullScreenAction->setShortcut(tr("Ctrl+F"));
			fullScreenAction->setCheckable(true);
			connect(fullScreenAction, SIGNAL(triggered()), this, SLOT(toggleFullScreen()));



			screenshotAction = new QAction(tr("&Save as Bitmap..."), this);
			connect(screenshotAction, SIGNAL(triggered()), this, SLOT(makeScreenshot()));

			newAction = new QAction(QIcon(":/images/new.png"), tr("&New"), this);
			newAction->setShortcut(tr("Ctrl+N"));
			newAction->setStatusTip(tr("Create a new file"));
			connect(newAction, SIGNAL(triggered()), this, SLOT(newFile()));

			openAction = new QAction(QIcon(":/images/open.png"), tr("&Open..."), this);
			openAction->setShortcut(tr("Ctrl+O"));
			openAction->setStatusTip(tr("Open an existing file"));
			connect(openAction, SIGNAL(triggered()), this, SLOT(open()));

			saveAction = new QAction(QIcon(":/images/save.png"), tr("&Save"), this);
			saveAction->setShortcut(tr("Ctrl+S"));
			saveAction->setStatusTip(tr("Save the script to disk"));
			connect(saveAction, SIGNAL(triggered()), this, SLOT(save()));

			saveAsAction = new QAction(QIcon(":/images/filesaveas.png"), tr("Save &As..."), this);
			saveAsAction->setStatusTip(tr("Save the script under a new name"));
			connect(saveAsAction, SIGNAL(triggered()), this, SLOT(saveAs()));

			closeAction = new QAction(QIcon(":/images/fileclose.png"), tr("&Close Tab"), this);
			closeAction->setShortcut(tr("Ctrl+W"));
			closeAction->setStatusTip(tr("Close this tab"));
			connect(closeAction, SIGNAL(triggered()), this, SLOT(closeTab()));

			exitAction = new QAction(QIcon(":/images/exit.png"), tr("E&xit Application"), this);
			exitAction->setShortcut(tr("Ctrl+Q"));
			exitAction->setStatusTip(tr("Exit the application"));
			connect(exitAction, SIGNAL(triggered()), this, SLOT(close()));

			cutAction = new QAction(QIcon(":/images/cut.png"), tr("Cu&t"), this);
			cutAction->setShortcut(tr("Ctrl+X"));
			cutAction->setStatusTip(tr("Cut the current selection's contents to the "
				"clipboard"));
			connect(cutAction, SIGNAL(triggered()), this, SLOT(cut()));

			copyAction = new QAction(QIcon(":/images/copy.png"), tr("&Copy"), this);
			copyAction->setShortcut(tr("Ctrl+C"));
			copyAction->setStatusTip(tr("Copy the current selection's contents to the "
				"clipboard"));
			connect(copyAction, SIGNAL(triggered()), this, SLOT(copy()));

			pasteAction = new QAction(QIcon(":/images/paste.png"), tr("&Paste"), this);
			pasteAction->setShortcut(tr("Ctrl+V"));
			pasteAction->setStatusTip(tr("Paste the clipboard's contents into the current "
				"selection"));
			connect(pasteAction, SIGNAL(triggered()), this, SLOT(paste()));

			renderAction = new QAction(QIcon(":/images/render.png"), tr("&Build System"), this);
			renderAction->setShortcut(tr("F5"));
			renderAction->setStatusTip(tr("Render the current ruleset"));
			connect(renderAction, SIGNAL(triggered()), this, SLOT(render()));


			resetViewAction = new QAction("Reset View", this);
			resetViewAction->setStatusTip(tr("Resets the viewport"));
			connect(resetViewAction, SIGNAL(triggered()), this, SLOT(resetView()));

			aboutAction = new QAction(QIcon(":/images/documentinfo.png"), tr("&About"), this);
			aboutAction->setStatusTip(tr("Show the About box"));
			connect(aboutAction, SIGNAL(triggered()), this, SLOT(about()));

			sfHomeAction = new QAction(QIcon(":/images/agt_internet.png"), tr("&Project Homepage (web link)"), this);
			sfHomeAction->setStatusTip(tr("Open the SourceForge project page in a browser."));
			connect(sfHomeAction, SIGNAL(triggered()), this, SLOT(launchSfHome()));

			referenceAction = new QAction(QIcon(":/images/agt_internet.png"), tr("&Fragmentarium Reference (web link)"), this);
			referenceAction->setStatusTip(tr("Open a Fragmentarium reference web page in a browser."));
			connect(referenceAction, SIGNAL(triggered()), this, SLOT(launchReferenceHome()));

			galleryAction = new QAction(QIcon(":/images/agt_internet.png"), tr("&Flickr Fragmentarium Group (web link)"), this);
			galleryAction->setStatusTip(tr("Opens the main Flickr group for Fragmentarium creations."));
			connect(galleryAction, SIGNAL(triggered()), this, SLOT(launchGallery()));

			glslHomeAction = new QAction(QIcon(":/images/agt_internet.png"), tr("&GLSL Specifications (web link)"), this);
			glslHomeAction->setStatusTip(tr("The official specifications for all GLSL versions."));
			connect(glslHomeAction, SIGNAL(triggered()), this, SLOT(launchGLSLSpecs()));

			for (int i = 0; i < MaxRecentFiles; ++i) {
				QAction* a = new QAction(this);
				a->setVisible(false);
				connect(a, SIGNAL(triggered()),	this, SLOT(openFile()));
				recentFileActions.append(a);				
			}

			qApp->setWindowIcon(QIcon(":/images/fragmentarium.png"));
		}

		void MainWindow::createMenus()
		{
			// -- File Menu --
			fileMenu = menuBar()->addMenu(tr("&File"));
			fileMenu->addAction(newAction);
			fileMenu->addAction(openAction);
			fileMenu->addAction(saveAction);
			fileMenu->addAction(saveAsAction);
			recentFileSeparator = fileMenu->addSeparator();
			for (int i = 0; i < MaxRecentFiles; ++i) fileMenu->addAction(recentFileActions[i]);
			fileMenu->addSeparator();
			fileMenu->addAction(closeAction);
			fileMenu->addAction(exitAction);

			// -- Edit Menu --
			editMenu = menuBar()->addMenu(tr("&Edit"));
			editMenu->addAction(cutAction);
			editMenu->addAction(copyAction);
			editMenu->addAction(pasteAction);
			editMenu->addSeparator();
			editMenu->addAction("Indent Script", this, SLOT(indent()));
			editMenu->addSeparator();
			editMenu->addAction("Preferences...", this, SLOT(preferences()));
			//QMenu* m = editMenu->addMenu("Insert Command");
			//createCommandHelpMenu(m, this);


			// -- Render Menu --
			renderMenu = menuBar()->addMenu(tr("&Render"));
			renderMenu->addAction(renderAction);
			renderMenu->addSeparator();
			renderMenu->addAction(fullScreenAction);
			renderMenu->addAction(resetViewAction);
		

			// -- Render Menu --
			QMenu* parametersMenu = menuBar()->addMenu(tr("&Parameters"));
			parametersMenu->addAction("Reset All", variableEditor, SLOT(reset()));
			parametersMenu->addSeparator();
			parametersMenu->addAction("Copy to Clipboard", variableEditor, SLOT(copy()));
			parametersMenu->addAction("Paste from Clipboard", variableEditor, SLOT(paste()));
			parametersMenu->addAction("Paste from Selected Text", this, SLOT(pasteSelected()));
			parametersMenu->addSeparator();
			parametersMenu->addAction("Save to File", this, SLOT(saveParameters()));
			parametersMenu->addAction("Load from File", this, SLOT(loadParameters()));
			parametersMenu->addSeparator();

			



			// -- Examples Menu --
			QStringList filters;
			QMenu* examplesMenu = menuBar()->addMenu(tr("&Examples"));
			// Scan examples dir...
			QDir d(getExamplesDir());
			filters.clear();
			filters << "*.frag";
			d.setNameFilters(filters);
			if (!d.exists()) {
				QAction* a = new QAction("Unable to locate: "+d.absolutePath(), this);
				a->setEnabled(false);
				examplesMenu->addAction(a);
			} else {
				// we will recurse the dirs...
				QStack<QString> pathStack;
				pathStack.append(QDir(getExamplesDir()).absolutePath());

				QMap< QString , QMenu* > menuMap;
				while (!pathStack.isEmpty()) {

					QMenu* currentMenu = examplesMenu;
					QString path = pathStack.pop();
					if (menuMap.contains(path)) currentMenu = menuMap[path];
					QDir dir(path);

					QStringList sl = dir.entryList(QDir::Dirs | QDir::NoDotAndDotDot);
					for (int i = 0; i < sl.size(); i++) {
						QMenu* menu = new QMenu(sl[i]);
						QString absPath = QDir(path + QDir::separator() +  sl[i]).absolutePath();
						menuMap[absPath] = menu;
						currentMenu->addMenu(menu);
						menu->setIcon(QIcon(":/images/folder.png"));
						pathStack.push(absPath);
					}

					dir.setNameFilters(filters);

					sl = dir.entryList();
					for (int i = 0; i < sl.size(); i++) {
						QAction* a = new QAction(sl[i], this);
						a->setIcon(QIcon(":/images/mail_new.png"));


						QString absPath = QDir(path ).absoluteFilePath(sl[i]);

						a->setData(absPath);
						connect(a, SIGNAL(triggered()), this, SLOT(openFile()));
						currentMenu->addAction(a);
					}
				}


			}

			QMenu* mc = createPopupMenu();
			mc->setTitle("Windows");
			menuBar()->addMenu(mc);


			helpMenu = menuBar()->addMenu(tr("&Help"));
			helpMenu->addAction(aboutAction);
			helpMenu->addSeparator();
			helpMenu->addAction(sfHomeAction);
			//helpMenu->addAction(referenceAction);
			helpMenu->addAction(galleryAction);
			helpMenu->addAction(glslHomeAction);
		}

		void MainWindow::pasteSelected() {
			QString settings = getTextEdit()->textCursor().selectedText();		
			variableEditor->setSettings(settings);
			statusBar()->showMessage(tr("Pasted selected settings"), 2000);
		}
		
		void MainWindow::saveParameters() {
			QString filter = "Fragment Parameters (*.fragparams);;All Files (*.*)";
			QString fileName = QFileDialog::getSaveFileName(this, tr("Save As"), "", filter);
			if (fileName.isEmpty())
				return;
		
			QFile file(fileName);
			if (!file.open(QFile::WriteOnly | QFile::Text)) {
				QMessageBox::warning(this, tr("Fragmentarium"),
					tr("Cannot write file %1:\n%2.")
					.arg(fileName)
					.arg(file.errorString()));
				return;
			}

			QTextStream out(&file);
			out << variableEditor->getSettings();			
			statusBar()->showMessage(tr("Settings saved to file"), 2000);
		}
		
		void MainWindow::loadParameters() {
			QString filter = "Fragment Parameters (*.fragparams);;All Files (*.*)";
			QString fileName = QFileDialog::getOpenFileName(this, tr("Load"), "", filter);
			if (fileName.isEmpty())
				return;
		
			QFile file(fileName);
			if (!file.open(QFile::ReadOnly | QFile::Text)) {
				QMessageBox::warning(this, tr("Fragmentarium"),
					tr("Cannot read file %1:\n%2.")
					.arg(fileName)
					.arg(file.errorString()));
				return;
			}

			QTextStream in(&file);
			QString settings = in.readAll();	
			variableEditor->setSettings(settings);
			statusBar()->showMessage(tr("Settings loaded from file"), 2000);
		}
		
			
			
		void MainWindow::createToolBars()
		{
			fileToolBar = addToolBar(tr("File Toolbar"));
			fileToolBar->addAction(newAction);
			fileToolBar->addAction(openAction);
			fileToolBar->addAction(saveAction);

			editToolBar = addToolBar(tr("Edit Toolbar"));
			editToolBar->addAction(cutAction);
			editToolBar->addAction(copyAction);
			editToolBar->addAction(pasteAction);

			renderToolBar = addToolBar(tr("Render Toolbar"));
			renderToolBar->addAction(renderAction);
			renderToolBar->addWidget(new QLabel("Build    ", this));
			QPushButton* pb = new QPushButton(this);
			pb->setText("Reset View");
			renderToolBar->addWidget(pb);
			connect(pb, SIGNAL(clicked()), this, SLOT(resetView()));

			renderModeToolBar = addToolBar(tr("Rendering Mode"));
			
			renderModeToolBar->addWidget(new QLabel("Screen update:", this));
			
			renderCombo= new QComboBox(renderModeToolBar);
			renderCombo->addItem("Automatic");
			renderCombo->addItem("Manual");
			renderCombo->addItem("Continuous");
			//renderCombo->addItem("Custom Resolution");
			connect(renderCombo, SIGNAL(currentIndexChanged(int)), this, SLOT(renderModeChanged(int)));
			renderModeToolBar->addWidget(renderCombo);

			renderButton = new QPushButton(renderModeToolBar);
			renderButton->setText("Redraw");
			connect(renderButton, SIGNAL(clicked()), this, SLOT(callRedraw()));
			renderModeToolBar->addWidget(renderButton);
			renderModeChanged(0);

		}

		void MainWindow::renderModeChanged(int) {
			int i = renderCombo->currentIndex() ;
			if (i == 0) {
				INFO("Automatic screen updates. Every time a parameter or camera changes, an update is triggered.");
			} else if (i == 1) {
				INFO("Manual screen updates. Press 'update' to refresh the screen.");
			} else if (i == 2) {
				INFO("Continuous screen updates. Updates at a fixed interval.");
			}
			renderButton->setEnabled(i!=0);
			renderButton->setText( (i==2) ? "Reset Time" : "Update");
			engine->setContinuous(i == 2);
			engine->setDisableRedraw(i == 1);

			if (i!=2) setFPS(0);
		}

		void MainWindow::callRedraw() {
			int i = renderCombo->currentIndex() ;
			engine->setDisableRedraw(false);
			if (i==2) {
				engine->resetTime();
			} else {
				engine->requireRedraw();
			}
			engine->setDisableRedraw(true);
		}

		void MainWindow::disableAllExcept(QWidget* w) {
			disabledWidgets.clear();
			disabledWidgets = findChildren<QWidget *>("");
			while (w) { disabledWidgets.removeAll(w); w=w->parentWidget(); }
			foreach (QWidget* w, disabledWidgets) w->setEnabled(false);
			qApp->processEvents();
		}

		void MainWindow::enableAll() {
			foreach (QWidget* w, disabledWidgets) w->setEnabled(true);
		}


		void MainWindow::createStatusBar()
		{
			statusBar()->showMessage(tr("Ready"));
		}

		void MainWindow::readSettings()
		{
			QSettings settings;
			QPoint pos = settings.value("pos", QPoint(200, 200)).toPoint();
			QSize size = settings.value("size", QSize(1024, 800)).toSize();
			move(pos);
			resize(size);
		}

		void MainWindow::writeSettings()
		{
			QSettings settings;
			settings.setValue("pos", pos());
			settings.setValue("size", size());
		}


		void MainWindow::openFile()
		{
			QAction *action = qobject_cast<QAction *>(sender());
			if (action) {
				loadFile(action->data().toString());
			} else {
				WARNING("No data!");
			}
		}

		void MainWindow::loadFile(const QString &fileName)
		{
			insertTabPage(fileName);
		}

		bool MainWindow::saveFile(const QString &fileName)
		{
			if (tabBar->currentIndex() == -1) { WARNING("No open tab"); return false; } 

			QFile file(fileName);
			if (!file.open(QFile::WriteOnly | QFile::Text)) {
				QMessageBox::warning(this, tr("Fragmentarium"),
					tr("Cannot write file %1:\n%2.")
					.arg(fileName)
					.arg(file.errorString()));
				return false;
			}

			QTextStream out(&file);
			QApplication::setOverrideCursor(Qt::WaitCursor);
			out << getTextEdit()->toPlainText();
			QApplication::restoreOverrideCursor();

			tabInfo[tabBar->currentIndex()].hasBeenSavedOnce = true;
			tabInfo[tabBar->currentIndex()].unsaved = false;
			tabInfo[tabBar->currentIndex()].filename = fileName;
			tabChanged(tabBar->currentIndex()); // to update displayed name;

			statusBar()->showMessage(tr("File saved"), 2000);
			setRecentFile(fileName);

			return true;
		}



		QString MainWindow::strippedName(const QString &fullFileName)
		{
			return QFileInfo(fullFileName).fileName();
		}




		void MainWindow::render() {
			logger->getListWidget()->clear();

			if (tabBar->currentIndex() == -1) { WARNING("No open tab"); return; } 
			QString inputText = getTextEdit()->toPlainText();

			QFile* f = 0;
			QString filename = tabInfo[tabBar->currentIndex()].filename;
			bool hasBeenSavedOnce = tabInfo[tabBar->currentIndex()].hasBeenSavedOnce;

			if (hasBeenSavedOnce) {
				f = new QFile(filename);
			}

			QSettings settings;
			bool debug = settings.value("debugScript", false).toBool();
			bool moveMain = settings.value("moveMain", true).toBool();
			QStringList includePaths = settings.value("includePaths").toString().split(";", QString::SkipEmptyParts);
			Preprocessor p(includePaths);
	
			try {
				FragmentSource fs = p.parse(inputText,f,moveMain);
				
				if (debug) {
					INFO("Debug is checked: showing final output in new tab.");
					insertTabPage("")->setText(fs.getText());
				}

				bool showGUI = false;
				variableEditor->updateFromFragmentSource(&fs, &showGUI);
				editorDockWidget->setHidden(!showGUI);
				engine->setFragmentShader(fs);

			} catch (Exception& e) {
				WARNING(e.getMessage());
			}	
		}

		namespace {
			// Returns the first valid directory.
			QString findDirectory(QStringList guesses) {
				QStringList invalid;
				for (int i = 0; i < guesses.size(); i++) {
					if (QFile::exists(guesses[i])) return guesses[i];
					invalid.append(QFileInfo(guesses[i]).absoluteFilePath());
				}

				// not found.
				WARNING("Could not locate directory in: " + invalid.join(",") + ".");
				return "[not found]";
			}
		}

		// Mac needs to step two directies up, when debugging in XCode...
		QString MainWindow::getExamplesDir() {
			QStringList examplesDir;
			examplesDir << "Examples" << "../../Examples";
			return findDirectory(examplesDir);
		}

		QString MainWindow::getMiscDir() {
			QStringList miscDir;
			miscDir << "Misc" << "../../Misc";
			return findDirectory(miscDir);
		}

		QString MainWindow::getTemplateDir() {
			return getMiscDir();
		}

		void MainWindow::resetView() {
			engine->reset();
		}

		QTextEdit* MainWindow::getTextEdit() {
			return (stackedTextEdits->currentWidget() ? (QTextEdit*)stackedTextEdits->currentWidget() : 0);
		}

		void MainWindow::cursorPositionChanged() {
			if (!this->getTextEdit()) return;
			int pos = this->getTextEdit()->textCursor().position();
			int blockNumber = this->getTextEdit()->textCursor().blockNumber();
			statusBar()->showMessage(QString("Position: %1, Line: %2").arg(pos).arg(blockNumber+1), 5000);
		}

		QTextEdit* MainWindow::insertTabPage(QString filename) {
			QTextEdit* textEdit = new TextEdit();
			connect(textEdit, SIGNAL(cursorPositionChanged()), this, SLOT(cursorPositionChanged()));

			textEdit->setLineWrapMode(QTextEdit::NoWrap);
			textEdit->setTabStopWidth(20);
			new EisenScriptHighlighter(textEdit);

			QString s = QString("// Write fragment code here...\r\n");
			textEdit->setText(s);

			bool loadingSucceded = false;
			if (!filename.isEmpty()) {
				INFO(QString("Loading file: %1").arg(filename));
				QFile file(filename);
				if (!file.open(QFile::ReadOnly | QFile::Text)) {
					textEdit->setPlainText(QString("Cannot read file %1:\n%2.").arg(filename).arg(file.errorString()));
				} else {
					QTextStream in(&file);
					QApplication::setOverrideCursor(Qt::WaitCursor);
					textEdit->setPlainText(in.readAll());
					QApplication::restoreOverrideCursor();
					statusBar()->showMessage(QString("Loaded file: %1").arg(filename), 2000);
					loadingSucceded = true;
				}
			}


			QString displayName = filename;
			if (displayName.isEmpty()) {
				// Find a new name
				displayName = "Unnamed";
				QString suggestedName = displayName;

				bool unique = false;
				int counter = 1;
				while (!unique) {
					unique = true;
					for (int i = 0; i < tabInfo.size(); i++) {
						if (tabInfo[i].filename == suggestedName) {
							//INFO("equal");
							unique = false;
							break;
						}	
					}
					if (!unique) suggestedName = displayName + " " + QString::number(counter++);
				}
				displayName = suggestedName;
			}

			stackedTextEdits->addWidget(textEdit);

			if (loadingSucceded) {
				tabInfo.append(TabInfo(displayName, textEdit, false, true));
				setRecentFile(filename);

			} else {
				tabInfo.append(TabInfo(displayName, textEdit, true));
			}

			QString tabTitle = QString("%1%3").arg(strippedName(displayName)).arg(!loadingSucceded? "*" : "");
			tabBar->setCurrentIndex(tabBar->addTab(strippedName(tabTitle)));

			connect(textEdit->document(), SIGNAL(contentsChanged()), this, SLOT(documentWasModified()));
			return textEdit;
		}

		void MainWindow::tabChanged(int index) {
			if (index > tabInfo.size()) return;
			if (index < 0) return;

			TabInfo t = tabInfo[index];
			QString tabTitle = QString("%1%3").arg(strippedName(t.filename)).arg(t.unsaved ? "*" : "");
			setWindowTitle(QString("%1 - %2").arg(tabTitle).arg("Fragmentarium"));
			stackedTextEdits->setCurrentWidget(t.textEdit);
			tabBar->setTabText(tabBar->currentIndex(), tabTitle);
		}

		void MainWindow::closeTab() {
			int index = tabBar->currentIndex();
			if (tabBar->currentIndex() == -1) { WARNING("No open tab"); return; } 
			closeTab(index);
		}

		void MainWindow::closeTab(int index) {		
			TabInfo t = tabInfo[index];
			if (t.unsaved) {
				int answer = QMessageBox::warning(this, QString("Unsaved changes"), "Close this tab without saving changes?", "OK", "Cancel");
				if (answer == 1) return;
			}

			tabInfo.remove(index);
			tabBar->removeTab(index);

			stackedTextEdits->removeWidget(t.textEdit);
			delete(t.textEdit); // ?
		}

		void MainWindow::launchSfHome() {
			INFO("Launching web browser...");
			bool s = QDesktopServices::openUrl(QUrl("http://syntopia.github.com/Fragmentarium/"));
			if (!s) WARNING("Failed to open browser...");
		}

		void MainWindow::launchGLSLSpecs() {
			INFO("Launching web browser...");
			bool s = QDesktopServices::openUrl(QUrl("http://www.opengl.org/registry/"));
			if (!s) WARNING("Failed to open browser...");
		}


		void MainWindow::launchReferenceHome() {
			INFO("Launching web browser...");
			bool s = QDesktopServices::openUrl(QUrl("http://syntopia.github.com/Fragmentarium/"));
			if (!s) WARNING("Failed to open browser...");
		}

		void MainWindow::launchGallery() {
			INFO("Launching web browser...");
			bool s = QDesktopServices::openUrl(QUrl("http://flickr.com/groups/fragmentarium/"));
			if (!s) WARNING("Failed to open browser...");
		}

		void MainWindow::saveImage(QImage image) {
			QList<QByteArray> a = QImageWriter::supportedImageFormats();
			QStringList allowedTypesFilter;
			QStringList allowedTypes;
			for (int i = 0; i < a.count(); i++) {
				allowedTypesFilter.append("*."+a[i]);
				allowedTypes.append(a[i]);
			}
			QString filter = "Image Files (" + allowedTypesFilter.join(" ")+")";

			QString filename = QFileDialog::getSaveFileName(this, "Save Screenshot As...", QString(), filter);
			if (filename.isEmpty()) {
				INFO("User cancelled save...");
				return;
			}

			QString ext = filename.section(".", -1).toLower();
			if (!allowedTypes.contains(ext)) {
				WARNING("Invalid image extension.");
				WARNING("File must be one of the following types: " + allowedTypes.join(","));
				return;
			}

			bool succes = image.save(filename);
			if (succes) {
				INFO("Saved screenshot as: " + filename);
			} else {
				WARNING("Save failed! Filename: " + filename);
			}
		}



		void MainWindow::copy() {
			if (tabBar->currentIndex() == -1) { WARNING("No open tab"); return; } 
			getTextEdit()->copy();
		}


		void MainWindow::cut() {
			if (tabBar->currentIndex() == -1) { WARNING("No open tab"); return; } 
			getTextEdit()->cut();
		}

		void MainWindow::paste() {
			if (tabBar->currentIndex() == -1) { WARNING("No open tab"); return; } 
			getTextEdit()->paste();
		}

		void MainWindow::dragEnterEvent(QDragEnterEvent *ev)
		{
			if (ev->mimeData()->hasUrls()) {
				ev->acceptProposedAction();
			} else {
				INFO("Cannot accept MIME object: " + ev->mimeData()->formats().join(" - "));
			}
		}

		void MainWindow::dropEvent(QDropEvent *ev) {
			if (ev->mimeData()->hasUrls()) {
				QList<QUrl> urls = ev->mimeData()->urls();
				for (int i = 0; i < urls.size() ; i++) {
					INFO("Loading: " + urls[i].toLocalFile());
					loadFile(urls[i].toLocalFile());
				}
			} else {
				INFO("Cannot accept MIME object: " + ev->mimeData()->formats().join(" - "));
			}
		}

		void MainWindow::setRecentFile(const QString &fileName)
		{
			QSettings settings;

			QStringList files = settings.value("recentFileList").toStringList();
			files.removeAll(fileName);
			files.prepend(fileName);
			while (files.size() > MaxRecentFiles) files.removeLast();

			settings.setValue("recentFileList", files);

			int numRecentFiles = qMin(files.size(), (int)MaxRecentFiles);

			for (int i = 0; i < numRecentFiles; ++i) {
				QString text = tr("&%1 %2").arg(i + 1).arg(QFileInfo(files[i]).fileName());
				recentFileActions[i]->setText(text);
				QString absPath = QFileInfo(files[i]).absoluteFilePath();
				recentFileActions[i]->setData(absPath);
				recentFileActions[i]->setVisible(true);
			}

			for (int j = numRecentFiles; j < MaxRecentFiles; ++j) recentFileActions[j]->setVisible(false);

			recentFileSeparator->setVisible(numRecentFiles > 0);
		}

		void MainWindow::insertText() {
			if (tabBar->currentIndex() == -1) { WARNING("No open tab"); return; } 

			QString text = ((QAction*)sender())->text();
			getTextEdit()->insertPlainText(text.section("//",0,0)); // strip comments
		}

		void MainWindow::preferences() {
			PreferencesDialog pd(this);
			pd.exec();
		}

		void MainWindow::indent() {
			if (tabBar->currentIndex() == -1) { WARNING("No open tab"); return; } 

			QStringList l = getTextEdit()->toPlainText().split("\n");
			QStringList out;
			int indent = 0;
			foreach (QString s, l) {
				bool startWith = s.trimmed().startsWith("}");
				if (startWith) indent -= (s.count("}")+s.count(")"));
				QString outS = s.trimmed();
				for (int i = 0; i < indent*1; i++) outS.push_front("\t");
				out.append(outS);
				indent += (s.count("{")+s.count("("));
				if (!startWith) indent -= (s.count("}")+s.count(")"));

			}
			getTextEdit()->setText(out.join("\n"));
		}

		void MainWindow::setFPS(float fps) {
			
			if (renderCombo->currentIndex()!=2) {
				fpsLabel->setText("FPS: n.a.");
				return;
			}
			
			if (fps>0) {
				fpsLabel->setText("FPS: " + QString::number(fps, 'f' ,1) + " (" +  QString::number(1.0/fps, 'f' ,1) + "s)");
			}
		}
			

	}

}

