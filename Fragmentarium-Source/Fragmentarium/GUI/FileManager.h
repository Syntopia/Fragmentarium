#pragma once

#include <QString>
#include <QFileInfo>
#include <QStringList>
#include <QVector>
#include <QMap>

#include "SyntopiaCore/Logging/Logging.h"


/// Small class for handling include paths
namespace Fragmentarium {
    namespace GUI {

        class FileManager {
        public:
            FileManager() {}
            void setOriginalFileName(QString f) { originalFileName = f; }
            void setIncludePaths(QStringList paths) { includePaths = paths; }
            QString resolveName(QString fileName);
            QString resolveName(QString fileName, QString originalFileName);
            bool fileExists(QString fileName);
            QStringList getFiles(QStringList filters);
            QStringList getImageFiles();

        private:
            QString originalFileName;
            QStringList includePaths;
            QMap<QString, QStringList> cachedFilters;
        };


    }
}

