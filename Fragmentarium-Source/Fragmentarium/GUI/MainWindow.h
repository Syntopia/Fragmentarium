#pragma once

#include <QMainWindow>
#include <QTabBar>
#include <QStackedWidget>
#include <QTextEdit>
#include <QCheckBox>
#include <QSpinBox>
#include <QComboBox>
#include <QLabel>
#include <QGLShaderProgram>

#include "DisplayWidget.h"
#include "../../SyntopiaCore/Misc/Version.h"
#include "VariableEditor.h"

class QAction;
class QMenu;

namespace Fragmentarium {
	namespace GUI {

		// Information about the current tab
		struct TabInfo {
			TabInfo() {}; 
			TabInfo(QString filename, QTextEdit* textEdit) : filename(filename), unsaved(false), textEdit(textEdit), hasBeenSavedOnce(false) {};
			TabInfo(QString filename, QTextEdit* textEdit, bool unsaved, bool hasBeenSavedOnce=false) : filename(filename), unsaved(unsaved), textEdit(textEdit), hasBeenSavedOnce(hasBeenSavedOnce) {};
			QString filename;
			bool unsaved;
			QTextEdit* textEdit;
			bool hasBeenSavedOnce;			
		};

		// An input dialog for the tile based render thingy
		
		/// The main window of the application.
		class MainWindow : public QMainWindow
		{
			Q_OBJECT

		public:
			MainWindow(QWidget* splashWidget);
			MainWindow(QWidget* splashWidget, const QString &fileName);
			void setSeed(int randomSeed);
			int getSeed();
			double getTime();
			void setUserUniforms(QGLShaderProgram* shaderProgram);
			DisplayWidget* getEngine() { return engine; };
			static QString getExamplesDir();
			void setFPS(float fps);
			static QString getMiscDir();
			static QString getTemplateDir();
			void saveImage(QImage im);
			void resetCamera(bool fullReset);
			QString getCameraSettings();
			QString getScriptWithSettings(QString filename);
			void disableAllExcept(QWidget* w);
			void enableAll();
			void loadParameters(QString fileName);
			void setSplashWidget(QWidget* w);
			void highlightBuildButton(bool value);
			FileManager* getFileManager() { return &fileManager; }
			void setSubFrameDisplay(int i);
			void setSubFrameMax(int i);
			void getBufferSize(int w, int h, int& bufferSizeX, int& bufferSizeY, bool& fitWindow);
			int getSubFrameMax() { return frameSpinBox->value(); }
			double getTimeSliderValue();
			void setTimeSliderValue(double value);

		protected:
			void dragEnterEvent(QDragEnterEvent *ev);
			void dropEvent(QDropEvent *ev);
			void closeEvent(QCloseEvent* ev);
			void keyReleaseEvent(QKeyEvent* ev);

		public slots:
			void timeChanged(int);
			void bufferActionChanged(QAction* action);
			void rewind();
			void play();
			void stop();
			void showWelcomeNote();		
			void removeSplash();
			void maxSubSamplesChanged(int);
			void tileBasedRender();
			void makeScreenshot();
			void callRedraw();
			void showDebug();
			void pasteSelected();
			void renderModeChanged();
			void saveParameters();
			void loadParameters();
			void indent();
			void preferences();
			void insertText();
			void variablesChanged(bool lockedChanged);
			void closeTab(int id);
			void cut();
			void copy();
			void paste();
			void cursorPositionChanged();
			void tabChanged(int index);
			void closeTab();
			void launchSfHome();
			void launchGallery();
			void launchGLSLSpecs();
			void launchFAQ();
			void launchIntro();
			void launchReferenceHome();
			void openFile();
			void newFile();
			void insertPreset();
			void open();
			bool save();
			bool saveAs();
			void about();
			void showControlHelp();
			void documentWasModified();
			bool render();
			void toggleFullScreen();

		private:
			QSpinBox* timeMaxSpinBox;
			QPushButton* animationButton2;
			QPushButton* progressiveButton;
			QPushButton* bufferSizeControl;
			int bufferSizeMultiplier;
			QList<QWidget *> disabledWidgets;
			QLabel* buildLabel;
			QLabel* timeLabel;
			void setRecentFile(const QString &fileName);
			QTextEdit* insertTabPage(QString filename);
			QTextEdit* getTextEdit();
			void init();
			void createActions();
			void createMenus();
			void createToolBars();
			void createStatusBar();
			void readSettings();
			void writeSettings();
			void updateRandom();
			void loadFile(const QString &fileName);
			bool saveFile(const QString &fileName);
			QString strippedName(const QString &fullFileName);
			void createOpenGLContextMenu();
			bool hasBeenResized;
			QSpinBox* seedSpinBox;
			ListWidgetLogger* logger;
			QDockWidget* dockLog;
			QAction* fullScreenAction;
			QAction* screenshotAction;
			QAction* sfHomeAction;
			QAction* glslHomeAction;
			QAction* introAction;
			QAction* faqAction;
			QAction* referenceAction;
			QAction* galleryAction;
			QMenu *fileMenu;
			QMenu *editMenu;
			QMenu *renderMenu;
			QMenu *helpMenu;
			QToolBar *fileToolBar;
			QToolBar *renderToolBar;
			QToolBar *renderModeToolBar;
			QToolBar *timeToolBar;
			
			QSlider* timeSlider;
			QToolBar *editToolBar;
			QToolBar *bufferToolBar;
			QSpinBox *bufferXSpinBox;
			QSpinBox *bufferYSpinBox;

			QTime* lastTime;
			double lastStoredTime;
			QAction *newAction;
			QAction *openAction;
			QAction *saveAction;
			QAction *saveAsAction;
			QAction *closeAction;
			QAction *exitAction;
			QAction *cutAction;
			QAction *copyAction;
			QAction *pasteAction;
			QAction *aboutAction;
			QAction *welcomeAction;
			QAction *controlAction;
			QAction *renderAction;
			DisplayWidget* engine;
			QTabBar* tabBar;
			SyntopiaCore::Misc::Version version;
			QMenu* openGLContextMenu;
			bool fullScreenEnabled;
			QStackedWidget *stackedTextEdits;
			QVector<TabInfo> tabInfo;
			int oldDirtyPosition;
			QVBoxLayout* frameMainWindow;
			VariableEditor* variableEditor;
			QDockWidget* editorDockWidget;
			QVector<QAction*> recentFileActions;
			QAction* recentFileSeparator;
			QLabel* fpsLabel;
			QWidget* splashWidget;
			bool rebuildRequired;
			FileManager fileManager;
			QLabel* frameLabel;
			QSpinBox* frameSpinBox;
			QAction* rewindAction;
			QAction* playAction;
			QAction* stopAction;

			QAction* bufferAction1;
			QAction* bufferAction1_2;
			QAction* bufferAction1_4;
			QAction* bufferAction1_6;
			QAction* bufferActionZ2;
			QAction* bufferActionZ4;
			QAction* bufferActionZ6;
			QAction* bufferActionCustom;

		};

		// A modified QTextEdit with an extended context menu
		class TextEdit : public QTextEdit {
			Q_OBJECT
		public:
			TextEdit() : QTextEdit(), mainWindow(0) {};
			TextEdit(MainWindow* parent) : QTextEdit(parent), mainWindow(parent) {};
			void contextMenuEvent(QContextMenuEvent *event);
			void insertFromMimeData (const QMimeData * source );

		public slots:
			void insertText();
		private:
			MainWindow* mainWindow;

		};

	}
}

