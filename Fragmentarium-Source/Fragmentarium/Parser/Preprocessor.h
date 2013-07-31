#pragma once

#include <QString>
#include <QStringList>
#include <QList>
#include <QFile>
#include <QVector>
#include <QMap>

#include "../GUI/FileManager.h"

#include "../../SyntopiaCore/Exceptions/Exception.h"
#include "../../SyntopiaCore/Math/Vector3.h"
#include "../../SyntopiaCore/Math/Vector4.h"
#include "../../SyntopiaCore/Logging/Logging.h"

namespace Fragmentarium {
    using namespace GUI;

    namespace Parser {

        using namespace SyntopiaCore::Math;
        using namespace SyntopiaCore::Logging;

        enum LockTypeInner { Locked, NotLocked, NotLockable, AlwaysLocked, Unknown } ;

        class LockType {
        public:
            LockType() {}
            LockType(QString s) { fromString(s); }
            LockType(LockTypeInner l) : inner(l) {}
            bool operator ==(const LockTypeInner lty) { return inner==lty; }
            bool operator !=(const LockTypeInner lty) { return inner!=lty; }
            bool operator ==(const LockType lty) { return inner==lty.inner; }
            bool operator !=(const LockType lty) { return inner!=lty.inner; }
            QString toString() {
                if (inner == Locked) {
                    return "Locked";
                } else if (inner == NotLocked) {
                    return "NotLocked";
                } else if (inner == NotLockable) {
                    return "NotLockable";
                } else if (inner == AlwaysLocked) {
                    return "AlwaysLocked";
                } else {
                    return "???";
                }
            }

            void fromString(QString s) {
                s = s.toLower();
                if (s == "locked") {
                    inner = Locked;
                } else if (s == "notlocked") {
                    inner = NotLocked;
                } else if (s == "notlockable") {
                    inner = NotLockable;
                } else if (s == "alwayslocked") {
                    inner = AlwaysLocked;
                } else {
                    inner = Unknown;
                }
            }

        private:
            LockTypeInner inner;
        };


        class GuiParameter {
        public:
            GuiParameter(QString group, QString name, QString tooltip) : group(group), name(name), tooltip(tooltip) {
            };

            virtual QString getName() { return name; }
            virtual QString getGroup() { return group; }
            virtual QString getUniqueName() = 0;
            QString getTooltip() { return tooltip; }
            LockType getLockType() { return lockType; }
            void setLockType(LockType l) { lockType = l; }
        protected:
            LockType lockType;
            QString group;
            QString name;
            QString tooltip;
        };

        class FloatParameter : public GuiParameter {
        public:
            FloatParameter(QString group, QString name,QString tooltip,  double from, double to, double defaultValue) :
                GuiParameter(group, name, tooltip), from(from), to(to), defaultValue(defaultValue) {}

            virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(from).arg(to); }
            double getFrom() { return from; }
            double getTo() { return to; }
            double getDefaultValue() { return defaultValue; }
        private:
            double from;
            double to;
            double defaultValue;
        };

        class SamplerParameter : public GuiParameter {
        public:
            SamplerParameter(QString group, QString name,QString tooltip, QString defaultValue) :
                GuiParameter(group, name, tooltip), defaultValue(defaultValue) {}

            virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()); }
            QString getDefaultValue() { return defaultValue; }
        private:
            QString defaultValue;
        };

        class Float2Parameter : public GuiParameter {
        public:
            Float2Parameter(QString group, QString name,QString tooltip,  Vector3f from, Vector3f to, Vector3f defaultValue) :
                GuiParameter(group, name, tooltip), from(from), to(to), defaultValue(defaultValue) {}

            virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(from.toString()).arg(to.toString()); }
            Vector3f getFrom() { return from; }
            Vector3f getTo() { return to; }
            Vector3f getDefaultValue() { return defaultValue; }
        private:
            Vector3f from;
            Vector3f to;
            Vector3f defaultValue;
        };

        class Float3Parameter : public GuiParameter {
        public:
            Float3Parameter(QString group, QString name,QString tooltip,  Vector3f from, Vector3f to, Vector3f defaultValue) :
                GuiParameter(group, name, tooltip), from(from), to(to), defaultValue(defaultValue) {}

            virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(from.toString()).arg(to.toString()); }
            Vector3f getFrom() { return from; }
            Vector3f getTo() { return to; }
            Vector3f getDefaultValue() { return defaultValue; }
        private:
            Vector3f from;
            Vector3f to;
            Vector3f defaultValue;
        };

        class Float4Parameter : public GuiParameter {
        public:
            Float4Parameter(QString group, QString name,QString tooltip,  Vector4f from, Vector4f to, Vector4f defaultValue) :
                GuiParameter(group, name, tooltip), from(from), to(to), defaultValue(defaultValue) {}

            virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(from.toString()).arg(to.toString()); }
            Vector4f getFrom() { return from; }
            Vector4f getTo() { return to; }
            Vector4f getDefaultValue() { return defaultValue; }
        private:
            Vector4f from;
            Vector4f to;
            Vector4f defaultValue;
        };

        class ColorParameter : public GuiParameter {
        public:
            ColorParameter(QString group, QString name,QString tooltip, Vector3f defaultValue) :
                GuiParameter(group,name, tooltip), defaultValue(defaultValue) {}

            virtual QString getUniqueName() { return QString("%0:%1").arg(group).arg(getName()); }
            Vector3f getDefaultValue() { return defaultValue; }
        private:
            Vector3f defaultValue;
        };


        class FloatColorParameter : public GuiParameter {
        public:
            FloatColorParameter(QString group, QString name,QString tooltip, float defaultValue, float from, float to, Vector3f defaultColorValue) :
                GuiParameter(group,name, tooltip), defaultValue(defaultValue), from(from), to(to), defaultColorValue(defaultColorValue) {}

            virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(from).arg(to); }
            Vector3f getDefaultColorValue() { return defaultColorValue; }
            double getFrom() { return from; }
            double getTo() { return to; }
            double getDefaultValue() { return defaultValue; }
        private:
            double defaultValue;
            double from;
            double to;
            Vector3f defaultColorValue;
        };

        class BoolParameter : public GuiParameter {
        public:
            BoolParameter(QString group, QString name, QString tooltip,bool defaultValue) :
                GuiParameter(group, name, tooltip), defaultValue(defaultValue) {}

            virtual QString getUniqueName() { return QString("%0:%1").arg(group).arg(getName()); }
            bool getDefaultValue() { return defaultValue; }
        private:
            bool defaultValue;
        };


        class IntParameter : public GuiParameter {
        public:
            IntParameter(QString group, QString name, QString tooltip, int from, int to, int defaultValue) :
                GuiParameter(group, name, tooltip), from(from), to(to), defaultValue(defaultValue) {}

            virtual QString getUniqueName() { return QString("%0:%1:%2:%3").arg(group).arg(getName()).arg(from).arg(to); }
            int getFrom() { return from; }
            int getTo() { return to; }
            int getDefaultValue() { return defaultValue; }
        private:
            int from;
            int to;
            int defaultValue;
        };

        class FragmentSource {
        public:
            FragmentSource();
            ~FragmentSource();

            QString getText() { return source.join("\n"); }
            QStringList source;
            QStringList vertexSource;
            QList<QString> sourceFileNames;
            QList<int> lines;
            QList<int> sourceFile;

            bool hasPixelSizeUniform;
            QString camera;
            QString buffer;
            QVector<GuiParameter*> params;
            QMap<QString, QString> textures; // "Uniform name" -> "File"
            QMap<QString, QString> presets;
            QMap<QString, QMap<QString, QString> > textureParams; // foreach texturename, store parameters

            FragmentSource* bufferShaderSource;
            bool clearOnChange;
            int iterationsBetweenRedraws;
            int subframeMax;
        };

        /// The preprocessor is responsible for
        /// including files and resolve user uniform variables
        class Preprocessor {

        public:
            Preprocessor(FileManager* fileManager) : fileManager(fileManager), isCreatingAutoSave(false) {}
            FragmentSource parse(QString input, QString fileName, bool moveMain);
            FragmentSource createAutosaveFragment(QString input, QString fileName);
            void parseSource(FragmentSource* fs,QString input, QString fileName, bool dontAdd);
            QStringList getDependencies() { return dependencies; }

        private:
            FileManager* fileManager;
            QStringList dependencies;
            bool isCreatingAutoSave;

        };

    }
}

