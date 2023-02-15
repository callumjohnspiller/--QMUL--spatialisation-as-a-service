#ifndef SPATIALISATION_CONSOLELOGGER_H
#define SPATIALISATION_CONSOLELOGGER_H

std::function<std::shared_ptr<Aws::Utils::Logging::LogSystemInterface>()> GetConsoleLoggerFactory();

#endif