#pragma once

#include <QString>
#include <QVector>
#include <QWidget>
#include <QMap>
#include <QSlider>
#include <QTabWidget>
#include <QComboBox>
#include <QFrame>
#include <QColorDialog>
#include <QDoubleSpinBox>
#include <QHBoxLayout>
#include <QGLShaderProgram>
#include "SyntopiaCore/Math/Vector3.h"
#include "../Parser/Preprocessor.h"
#include "SyntopiaCore/Logging/Logging.h"
#include "DisplayWidget.h"

/// The editor window for GUI variables (uniforms)
namespace Fragmentarium {
	namespace GUI {

		using namespace SyntopiaCore::Logging;
		using namespace SyntopiaCore::Math;

		class MainWindow;  // forward
		class ComboSlider; // forward

		/// The Variable Editor window.
		class VariableEditor : public QWidget {
			Q_OBJECT
		public:
			VariableEditor(QWidget* parent, MainWindow* mainWindow);

			void updateFromFragmentSource(Parser::FragmentSource* fs, bool* showGUI);
			void updateCamera(CameraControl* c);
			void setUserUniforms(QGLShaderProgram* shaderProgram);
			QString getSettings();
			bool setSettings(QString text);
			void createGroup(QString g);
			VariableWidget* getWidgetFromName(QString name);
			void setPresets(QMap<QString, QString> presets);
			ComboSlider* getCurrentComboSlider() { return currentComboSlider; }
			bool setDefault();
			void substituteLockedVariables(Parser::FragmentSource* fs);
signals:

			void changed(bool lockedChanged);

			public slots:
				void sliderDestroyed(QObject* o);
				void focusChanged(QWidget* oldWidget,QWidget* newWidget);
				bool applyPreset();
				void resetUniforms();
				void resetGroup();
				void lockGroup();
				void unlockGroup();
				void copy();
				void paste();
				void childChanged(bool lockedChanged);

		private:
			QMap<QString, QString> presets;
			MainWindow* mainWindow;
			QSpacerItem* spacer;
			QVector<VariableWidget*> variables;
			QVBoxLayout* layout;
			QComboBox* presetComboBox;
			QWidget* currentWidget;

			QMap<QString, QWidget*> tabs;
			QMap<QWidget*, QWidget*> spacers;
			QTabWidget* tabWidget;
			ComboSlider* currentComboSlider;
		};


	}
}

