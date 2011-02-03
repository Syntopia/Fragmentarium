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
 
		struct TabInfo {
			TabInfo() {}; 
			TabInfo(QString filename, QTextEdit* textEdit) : filename(filename), unsaved(false), textEdit(textEdit), hasBeenSavedOnce(false) {};
			TabInfo(QString filename, QTextEdit* textEdit, bool unsaved, bool hasBeenSavedOnce=false) : filename(filename), unsaved(unsaved), textEdit(textEdit), hasBeenSavedOnce(hasBeenSavedOnce) {};
			QString filename;
			bool unsaved;
			QTextEdit* textEdit;
			bool hasBeenSavedOnce;			
        };

		
		// A modified QTextEdit with an extended context menu
		class TextEdit : public QTextEdit {
			Q_OBJECT
			public:
				TextEdit() : QTextEdit() {};
				TextEdit(QWidget* parent) : QTextEdit(parent) {};

				void contextMenuEvent(QContextMenuEvent *event);
			public slots:
				void insertText();
		};

		// An input dialog for the tile based render thingy
		class TileRenderDialog: public QDialog {
			Q_OBJECT
		public:
			TileRenderDialog(QWidget* parent, int w, int h);
			int getTiles() { return tileSlider->value(); }
		public slots:
			void tilesChanged(int);
		private: 
			QLabel* tileLabel;
			QSlider* tileSlider;
			int w;
			int h;
		};
		


		/// The main window of the application.
		class MainWindow : public QMainWindow
		{
			Q_OBJECT

		public:
			MainWindow();
			MainWindow(const QString &fileName);
			void setSeed(int randomSeed);
			int getSeed();
		
			void setUserUniforms(QGLShaderProgram* shaderProgram);

			DisplayWidget* getEngine() { return engine; };
			static QString getExamplesDir();
			void setFPS(float fps);
			static QString getMiscDir();
			static QString getTemplateDir();
			void saveImage(QImage im);
			
			QString getCameraSettings();
			QString getScriptWithSettings(QString filename);
			

			void disableAllExcept(QWidget* w);
			void enableAll();
			void loadParameters(QString fileName);
			void setSplashWidget(QWidget* w);
		
		protected:
			void dragEnterEvent(QDragEnterEvent *ev);
			void dropEvent(QDropEvent *ev);
			void closeEvent(QCloseEvent* ev);
			void keyReleaseEvent(QKeyEvent* ev);

		public slots:
			void removeSplash();
			void viewSliderChanged(int);
			void tileBasedRender();
			void makeScreenshot();
			void callRedraw();
			void showDebug();
			
			void pasteSelected();
			void renderModeChanged(int);
			void saveParameters();
			void loadParameters();
			void indent();
			void preferences();
			void insertText();
			void variablesChanged();
			
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
			void launchReferenceHome();
			
			void openFile();
			void newFile();
			void open();
			bool save();
			bool saveAs();
			void about();
			void documentWasModified();
			void render();
			void resetView();
			void toggleFullScreen();
			

		private:
			QList<QWidget *> disabledWidgets;
			QSlider* viewSlider;
			
			QLabel* viewLabel;
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
			QAction* referenceAction;
			QAction* galleryAction;
			QMenu *fileMenu;
			QMenu *editMenu;
			QMenu *renderMenu;
			QMenu *helpMenu;
			QToolBar *fileToolBar;
			QToolBar *renderToolBar;
			QToolBar *renderModeToolBar;
			QComboBox* renderCombo;
			QPushButton* renderButton;

			QToolBar *editToolBar;
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

			QAction *renderAction;
			QAction *resetViewAction;
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
		};

	
	}
}

