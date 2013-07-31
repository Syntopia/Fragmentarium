#pragma once

#include <QtCore/QVariant>
#include <QtGui/QAction>
#include <QtGui/QApplication>
#include <QtGui/QButtonGroup>
#include <QtGui/QCheckBox>
#include <QtGui/QDialog>
#include <QtGui/QDialogButtonBox>
#include <QtGui/QHBoxLayout>
#include <QtGui/QHeaderView>
#include <QtGui/QLabel>
#include <QtGui/QLineEdit>
#include <QtGui/QPushButton>
#include <QtGui/QSlider>
#include <QtGui/QSpacerItem>
#include <QtGui/QSpinBox>
#include <QtGui/QVBoxLayout>
#include <QStringList>


namespace Fragmentarium {
    namespace GUI {
        class OutputDialog : public QDialog
        {
            Q_OBJECT
        public:
            OutputDialog(QWidget* parent, int w, int h);
            ~OutputDialog();
            int getTiles();
            float getPadding();
            int getFrames() { return frameSpinBox->value(); }
            int getFPS() {return fpsSpinBox->value(); }
            int getMaxTime() {return animCheckBox->isChecked() ? endTimeSpinBox->value() : 0; }

        public slots:
            void animationChanged();
            void chooseFile();
            void updateTotalTiles(int);
            void tilesChanged(int);
            void updateFileName(const QString &);
            void updateFileName();
            QString getFileName();
            QString getFragmentFileName();
            bool doSaveFragment() { return autoSaveCheckBox; }

        private:
            QString uniqueFileName;
            int width;
            int height;
            QVBoxLayout *verticalLayout;
            QLabel *label;
            QSlider *tilesSlider;
            QSpacerItem *verticalSpacer;
            QHBoxLayout *horizontalLayout_4;
            QSpinBox *filterSizeSpinBox;
            QSpacerItem *horizontalSpacer_3;
            QSpacerItem *verticalSpacer_2;
            QSpacerItem *verticalSpacer_3;
            QHBoxLayout *horizontalLayout;
            QLabel *label_3;
            QLineEdit *filenameEdit;
            QPushButton *fileButton;
            QHBoxLayout *horizontalLayout_2;
            QSpacerItem *horizontalSpacer;
            QCheckBox* animCheckBox;
            QCheckBox *uniqueCheckBox;
            QLayout* fpsLayout;
            QLayout* endTimeLayout;

            QSpinBox* endTimeSpinBox;
            QSpinBox* fpsSpinBox;

            QHBoxLayout *horizontalLayout_3;
            QSpacerItem *horizontalSpacer_2;
            QCheckBox *autoSaveCheckBox;
            QSpacerItem *verticalSpacer_4;
            QDialogButtonBox *buttonBox;
            QSpinBox* frameSpinBox;
            QSlider* paddingSlider;
            QLabel* label5;
            QLabel* totalFrames;
            QStringList extensions;
            QString fragmentFileName;
        };
    }
}



