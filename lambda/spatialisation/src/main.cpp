#include <aws/core/Aws.h>
#include <aws/core/client/ClientConfiguration.h>
#include <aws/lambda-runtime/runtime.h>

#include "lambda_handler.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/stdout_sinks.h"

using namespace Aws;
using namespace aws::lambda_runtime;

int main() {

    // Logger objects setup
    auto console = spdlog::stdout_logger_mt("console");
    auto err_logger = spdlog::stderr_logger_mt("stderr");

//  Initialise AWS API with options
    SDKOptions options;
    options.loggingOptions.logLevel = Utils::Logging::LogLevel::Trace;
    InitAPI(options);

//    Configure client and invoke lambda handler
    {
        Client::ClientConfiguration clientConfig;
        clientConfig.region = "eu-west-2";
        clientConfig.caFile = "/etc/pki/tls/certs/ca-bundle.crt";
        auto handler_fn = [&clientConfig](invocation_request const &req) {
            return lambda_handler(req, clientConfig);
        };
        run_handler(handler_fn);
    }
    ShutdownAPI(options);
    return 0;
}