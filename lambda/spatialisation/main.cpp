#include <aws/core/Aws.h>
#include <aws/core/utils/json/JsonSerializer.h>
#include <aws/core/utils/HashingUtils.h>
#include <aws/core/platform/Environment.h>
#include <aws/core/client/ClientConfiguration.h>
#include <aws/core/auth/AWSCredentialsProvider.h>
#include <aws/s3/S3Client.h>
#include <aws/lambda-runtime/runtime.h>
#include <aws/transfer/TransferManager.h>

#include <iostream>
#include <fstream>
#include <memory>
#include <vector>

#include "utils/ConsoleLogger.h"
#include "utils/VerifyRequest.h"
#include "spatialiser.h"

using namespace Aws;
using namespace Aws::Transfer;
using namespace aws::lambda_runtime;

char const TAG[] = "LAMBDA_ALLOC";

static invocation_response my_handler(invocation_request const &req, Aws::Client::ClientConfiguration const &clientConfig) {

    if (verifyRequest(req)) {
        AWS_LOGSTREAM_INFO(TAG, "Good request");
    } else {
        return invocation_response::failure("Invalid request", "InvalidJSON");
    }

    using namespace Aws::Utils::Json;
    JsonValue json(req.payload);

    auto payloadView = json.View();

    auto bucket = payloadView.GetString("s3bucket");
    auto key = payloadView.GetString("s3key");

    auto s3_client = MakeShared<S3::S3Client>( "S3Client", clientConfig);
    auto executor = Aws::MakeShared<Aws::Utils::Threading::PooledThreadExecutor>("executor", 25);
    Aws::Transfer::TransferManagerConfiguration transfer_config(executor.get());
    transfer_config.s3Client = s3_client;

    auto transfer_manager = Aws::Transfer::TransferManager::Create(transfer_config);

    auto transfer_handle = transfer_manager->DownloadFile(bucket,key,"/tmp/stem.wav");
    AWS_LOGSTREAM_INFO(TAG, "Attempting to download file from s3://" << bucket << "/" << key);
    transfer_handle->WaitUntilFinished();
    bool success = transfer_handle->GetStatus() == TransferStatus::COMPLETED;

    if(success) {
        AWS_LOGSTREAM_INFO(TAG, "success!");
    } else
    {
        AWS_LOGSTREAM_INFO(TAG, transfer_handle->GetLastError());
    }

    auto result = render();

    return invocation_response::success("you did it!" /*payload*/,
                                        "application/json" /*MIME type*/);

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