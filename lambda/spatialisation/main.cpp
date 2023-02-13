#include <aws/core/Aws.h>
#include <aws/core/utils/logging/LogLevel.h>
#include <aws/core/utils/logging/ConsoleLogSystem.h>
#include <aws/core/utils/logging/LogMacros.h>
#include <aws/core/utils/json/JsonSerializer.h>
#include <aws/core/utils/HashingUtils.h>
#include <aws/core/platform/Environment.h>
#include <aws/core/client/ClientConfiguration.h>
#include <aws/core/auth/AWSCredentialsProvider.h>
#include <aws/s3/S3Client.h>
#include <aws/s3/model/GetObjectRequest.h>
#include <aws/lambda-runtime/runtime.h>

#include <iostream>
#include <fstream>
#include <memory>
#include <vector>

#include "BinauralSpatializer/3DTI_BinauralSpatializer.h"
#include "HRTF/HRTFFactory.h"
#include "ILD/ILDCereal.h"
#include "AudioFile.h"


using namespace aws::lambda_runtime;

char const TAG[] = "LAMBDA_ALLOC";

static invocation_response my_handler(invocation_request const &req, Aws::Client::ClientConfiguration const &clientConfig) {

    using namespace Aws::Utils::Json;
    JsonValue json(req.payload);

    if (!json.WasParseSuccessful()) {
        return invocation_response::failure("Failed to parse input JSON", "InvalidJSON");
    }

    auto v = json.View();

    if (!v.ValueExists("s3bucket") || !v.ValueExists("s3key") || !v.GetObject("s3bucket").IsString() ||
        !v.GetObject("s3key").IsString()) {
        return invocation_response::failure("Missing input value s3bucket or s3key", "InvalidJSON");
    }

    auto bucket = v.GetString("s3bucket");
    auto key = v.GetString("s3key");

    AWS_LOGSTREAM_INFO(TAG, "Attempting to download file from s3://" << bucket << "/" << key);

    Aws::S3::S3Client client(clientConfig);

    Aws::S3::Model::GetObjectRequest request;
    request.SetBucket(bucket);
    request.SetKey(key);

    Aws::S3::Model::GetObjectOutcome outcome = client.GetObject(request);

    if (!outcome.IsSuccess()) {
        const Aws::S3::S3Error &err = outcome.GetError();
        std::cerr << "Error: GetObject: " <<
                  err.GetExceptionName() << ": " << err.GetMessage() << std::endl;
        return invocation_response::failure("you suck", "DownloadFailure");
    }
    else {
        std::cout << "Successfully retrieved '" << key << "' from '"
                  << bucket << "'." << std::endl;
        return invocation_response::success("you did it fucko" /*payload*/,
                                            "application/json" /*MIME type*/);
    }
}

std::function<std::shared_ptr<Aws::Utils::Logging::LogSystemInterface>()> GetConsoleLoggerFactory() {
    return [] {
        return Aws::MakeShared<Aws::Utils::Logging::ConsoleLogSystem>(
                "console_logger", Aws::Utils::Logging::LogLevel::Trace);
    };
}

int main() {

    using namespace Aws;
    SDKOptions options;
    options.loggingOptions.logLevel = Aws::Utils::Logging::LogLevel::Trace;
    options.loggingOptions.logger_create_fn = GetConsoleLoggerFactory();
    InitAPI(options);

    {
        Client::ClientConfiguration clientConfig;
        clientConfig.region = "eu-west-2";
        clientConfig.caFile = "/etc/pki/tls/certs/ca-bundle.crt";

        auto handler_fn = [&clientConfig](aws::lambda_runtime::invocation_request const& req) {
            return my_handler(req, clientConfig);
        };

        run_handler(handler_fn);
    }
    ShutdownAPI(options);
    return 0;
}