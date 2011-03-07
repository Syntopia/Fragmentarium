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
#include "DisplayWidget.h"

/// Classes for the GUI Editor for the preprocessor constant variables.
/// E.g. the line: #define angle 45 (float:0.0-360.0)
///	will make a simple editor widget appear.
namespace Fragmentarium {
	namespace GUI {
	
		using namespace SyntopiaCore::Logging;
		using namespace SyntopiaCore::Math;

		class MainWindow;

		/// The Variable Editor window.
		class VariableEditor : public QWidget {
		Q_OBJECT
		public:
			VariableEditor(QWidget* parent, MainWindow* mainWindow);

			void updateFromFragmentSource(Parser::FragmentSource* fs, bool* showGUI);
			void updateCamera(CameraControl* c);
			void setUserUniforms(QGLShaderProgram* shaderProgram);
			QString getSettings();
			void setSettings(QString text);
			void createGroup(QString g);
			VariableWidget* getWidgetFromName(QString name);

		signals:
			void changed();

		public slots:
			void resetUniforms();
			void resetGroup();
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
			QMap<QWidget*, QWidget*> spacers;
			QTabWidget* tabWidget ;
		};

	
	}
}

