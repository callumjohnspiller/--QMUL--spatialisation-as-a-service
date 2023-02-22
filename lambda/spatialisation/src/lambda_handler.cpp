#include <aws/core/Aws.h>
#include <aws/core/client/ClientConfiguration.h>
#include <aws/lambda-runtime/runtime.h>
#include <aws/transfer/TransferManager.h>
#include <aws/s3/S3Client.h>

#include "verify_request.h"
#include "spatialiser.h"
#include "lambda_handler.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/stdout_sinks.h"

#include <string>

using namespace Aws;
using namespace aws::lambda_runtime;
using namespace Aws::Transfer;

invocation_response
lambda_handler(invocation_request const &req, Client::ClientConfiguration const &clientConfig) {

    Utils::Json::JsonValue json(req.payload);

    if (verifyRequest(json)) {
        spdlog::get("console")->info("Request verified");
    } else {
        return invocation_response::failure("Invalid request", "InvalidJSON");
    }

    auto payloadView = json.View();
    std::string bucket = payloadView.GetString("s3bucket");
    std::string key = payloadView.GetString("s3key");

    spdlog::get("console")->info("Establishing S3 Client...");
    auto s3_client = MakeShared<S3::S3Client>("S3Client", clientConfig);
    auto executor = MakeShared<Utils::Threading::PooledThreadExecutor>("executor", 25);
    TransferManagerConfiguration transfer_config(executor.get());
    transfer_config.s3Client = s3_client;
    auto transfer_manager = TransferManager::Create(transfer_config);
    spdlog::get("console")->info("Establishing S3 Client...");

    spdlog::get("console")->info("Fetching stems..");
    auto transfer_handle = transfer_manager->DownloadFile(bucket, key, "/tmp/stem.wav");
    spdlog::get("console")->info("Attempting to download file from s3");
    transfer_handle->WaitUntilFinished();
    bool download_success = transfer_handle->GetStatus() == TransferStatus::COMPLETED;

    if (download_success) {
        spdlog::get("console")->info("successfully downloaded stems from S3");
    } else {
        spdlog::get("err_logger")->error("Failed stem download");
    }

    auto result = render();

    if (result == 0) {
        spdlog::get("console")->info("Rendering complete");
    }

    auto uploadHandle = transfer_manager->UploadFile("tmp/binaural.wav", bucket, "result.wav", "wav",
                                                     Aws::Map<Aws::String, Aws::String>());
    if (result) {
        spdlog::get("console")->info("Uploading file to S3");
    }
    uploadHandle->WaitUntilFinished();
    bool upload_successful = uploadHandle->GetStatus() == Transfer::TransferStatus::COMPLETED;
    if (upload_successful) {
        spdlog::get("console")->info("Successfully uploaded to S3");
    }

    return invocation_response::success("you did it!" /*payload*/,
                                        "application/json" /*MIME type*/);

}