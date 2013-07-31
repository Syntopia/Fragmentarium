#include "Misc.h"
#include <QImageWriter>
#include <QFileDialog>

#include "../Logging/Logging.h"

using namespace SyntopiaCore::Logging;

namespace SyntopiaCore {
    namespace Misc {

        QString GetImageFileName(QWidget* parent, QString label) {
            QList<QByteArray> a = QImageWriter::supportedImageFormats();
            QStringList allowedTypesFilter;
            QStringList allowedTypes;
            for (int i = 0; i < a.count(); i++) {
                allowedTypesFilter.append("*."+a[i]);
                allowedTypes.append(a[i]);
            }
            QString filter = "Image Files (" + allowedTypesFilter.join(" ")+")";

            QString filename = QFileDialog::getSaveFileName(parent, label, QString(), filter);
            if (filename.isEmpty()) {
                INFO("User cancelled save...");
                return "";
            }

            QString ext = filename.section(".", -1).toLower();
            if (!allowedTypes.contains(ext)) {
                WARNING("Invalid image extension.");
                WARNING("File must be one of the following types: " + allowedTypes.join(","));
                return "";
            }

            return filename;
        }
    }
}

