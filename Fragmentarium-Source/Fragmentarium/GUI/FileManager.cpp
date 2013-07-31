#include "FileManager.h"
#include "../../SyntopiaCore/Exceptions/Exception.h"
#include <QDir>

using namespace SyntopiaCore::Exceptions;

using namespace SyntopiaCore::Logging;
namespace Fragmentarium {
    namespace GUI {

        QStringList FileManager::getImageFiles() {
            QStringList l;
            l << "*.jpg" << "*.jpeg" << "*.png" << "*.hdr";
            return getFiles(l);

        }

        QStringList FileManager::getFiles(QStringList filters) {
            QString key = filters.join(";;");
            if (cachedFilters.contains(key)) return cachedFilters[key];
            QStringList entries;

            // Check relative to current file
            if (!originalFileName.isEmpty()) {
                QDir d = QFileInfo(originalFileName).absolutePath();
                entries = d.entryList(filters,QDir::Files) ;
            }

            // Check relative to files in include path
            foreach (QString p, includePaths) {
                QDir d(p);
                entries += d.entryList(filters,QDir::Files) ;
            }

            cachedFilters[key] = entries;
            return entries;
        }

        bool FileManager::fileExists(QString fileName) {
            // First check absolute filenames
            if (QFileInfo(fileName).isAbsolute()) return QFileInfo(fileName).exists();

            // Check relative to current file
            if (!originalFileName.isEmpty()) {
                QDir d = QFileInfo(originalFileName).absolutePath();
                QString path = d.absoluteFilePath(fileName);
                if (QFileInfo(path).exists()) return true;
            }

            // Check relative to files in include path
            foreach (QString p, includePaths) {
                QString path = QDir(p).absoluteFilePath(fileName);
                if (QFileInfo(path).exists()) return true;
            }

            return false;
        }

        QString FileManager::resolveName(QString fileName) {
            return resolveName(fileName, originalFileName);
        }

        QString FileManager::resolveName(QString fileName, QString originalFileName) {
            // First check absolute filenames
            if (QFileInfo(fileName).isAbsolute()) return fileName;

            QStringList pathsTried;

            // Check relative to current file
            if (!originalFileName.isEmpty()) {
                QDir d = QFileInfo(originalFileName).absolutePath();
                QString path = d.absoluteFilePath(fileName);
                if (QFileInfo(path).exists()) return path;
                pathsTried.append(path);
            }

            // Check relative to files in include path
            foreach (QString p, includePaths) {
                QDir d(p);
                QString path = d.absoluteFilePath(fileName);
                if (QFileInfo(path).exists()) return path;
                pathsTried.append(path);
            }

            // We failed.
            foreach (QString s, pathsTried) {
                INFO("Tried path: " + s);
            }
            throw Exception("Could not resolve path for file: " + fileName);
        }
    }
}

