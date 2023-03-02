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
#include <vector>
#include <utility>

using namespace Aws;
using namespace aws::lambda_runtime;
using namespace Aws::Transfer;
using namespace Aws::Utils::Json;


invocation_response lambda_handler(invocation_request const &req, Client::ClientConfiguration const &clientConfig) {

    JsonValue json(req.payload);

    if (verifyRequest(json)) {
        spdlog::get("console")->info("Request verified");
    } else {
        return invocation_response::failure("Invalid request", "InvalidJSON");
    }

    auto payloadView = json.View();
    Aws::String bucket = payloadView.GetString("s3bucket");
    Aws::String folder = payloadView.GetString("s3folder");
    auto keys = payloadView.GetArray("s3keys");
    auto spatialParams = payloadView.GetObject("spatialParams");

    spdlog::get("console")->info("Establishing S3 Client...");
    auto s3_client = MakeShared<S3::S3Client>("S3Client", clientConfig);
    auto executor = MakeShared<Utils::Threading::PooledThreadExecutor>("executor", 25);
    TransferManagerConfiguration transfer_config(executor.get());
    transfer_config.s3Client = s3_client;
    auto transfer_manager = TransferManager::Create(transfer_config);

    for (size_t i = 0; i < keys.GetLength(); i++) {
        spdlog::get("console")->info("Fetching stem");
        auto localDir = Aws::String("tmp/") + keys[i].AsString();
        auto remoteDir = folder + "/" + keys[i].AsString();
        auto transfer_handle = transfer_manager->DownloadFile(bucket, remoteDir, localDir);
        spdlog::get("console")->info("Attempting to download file from s3");
        transfer_handle->WaitUntilFinished();
        bool download_success = transfer_handle->GetStatus() == TransferStatus::COMPLETED;
        if (download_success) {
            spdlog::get("console")->info("successfully downloaded from S3");
        } else {
            spdlog::get("err_logger")->error("Failed stem download");
        }
    }

    auto result = render(bucket, keys, spatialParams);

    if (result == 0) {
        spdlog::get("console")->info("Rendering complete");
    }

    auto uploadHandle = transfer_manager->UploadFile("tmp/binaural.wav", "saas-output", "result.wav", "wav",
                                                     Aws::Map<Aws::String, Aws::String>());
    if (result == 0) {
        spdlog::get("console")->info("Uploading file to S3");
    }
    uploadHandle->WaitUntilFinished();
    bool upload_successful = uploadHandle->GetStatus() == Transfer::TransferStatus::COMPLETED;
    if (upload_successful) {
        spdlog::get("console")->info("Successfully uploaded to S3");
    } else {
        return invocation_response::failure("failed to upload result to s3", "application/json");
    }

    return invocation_response::success("you did it!" /*payload*/, "application/json" /*MIME type*/);

}