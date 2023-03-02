#include <aws/core/utils/json/JsonSerializer.h>
#include <aws/lambda-runtime/runtime.h>
#include "verify_request.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/stdout_sinks.h"

using namespace Aws::Utils::Json;

bool verifyRequest(JsonValue &json) {

    if (!json.WasParseSuccessful()) {
        spdlog::get("err_logger")->error("JSON not parsed successfully");
        return false;
    }

    spdlog::get("console")->info("JSON successfully parsed");

    auto payloadView = json.View();

    if (!payloadView.ValueExists("s3bucket") || !payloadView.ValueExists("s3keys") ||
        !payloadView.GetObject("s3bucket").IsString()) {
        spdlog::get("err_logger")->error("JSON request has invalid values");
        return false;
    }
    return true;
}
