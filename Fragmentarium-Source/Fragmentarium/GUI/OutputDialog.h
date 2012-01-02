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
		 int getFrames() { return frameSpinBox->value(); }
      public slots:
         void chooseFile();
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
         QLabel *label_2;
         QSlider *downsamplingSlider;
         QHBoxLayout *horizontalLayout_4;
         QLabel *label_4;
         QSpinBox *filterSizeSpinBox;
         QSpacerItem *horizontalSpacer_3;
         QSpacerItem *verticalSpacer_2;
         QCheckBox *displayCheckBox;
         QSpacerItem *verticalSpacer_3;
         QHBoxLayout *horizontalLayout;
         QLabel *label_3;
         QLineEdit *filenameEdit;
         QPushButton *fileButton;
         QHBoxLayout *horizontalLayout_2;
         QSpacerItem *horizontalSpacer;
         QCheckBox *uniqueCheckBox;
         QHBoxLayout *horizontalLayout_3;
         QSpacerItem *horizontalSpacer_2;
         QCheckBox *autoSaveCheckBox;
         QSpacerItem *verticalSpacer_4;
         QDialogButtonBox *buttonBox;
		 QSpinBox* frameSpinBox;

         QStringList extensions;
         QString fragmentFileName;
      };
   }
}



