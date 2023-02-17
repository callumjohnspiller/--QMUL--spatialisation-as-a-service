//
// Created by Spiller, Callum on 17/02/2023.
//

#include <aws/core/utils/json/JsonSerializer.h>
#include <aws/lambda-runtime/runtime.h>
#include "VerifyRequest.h"

bool verifyRequest(aws::lambda_runtime::invocation_request const &req) {
    using namespace Aws::Utils::Json;
    JsonValue json(req.payload);

    if (!json.WasParseSuccessful()) {
        return false;
    }

    auto payloadView = json.View();

    if (!payloadView.ValueExists("s3bucket") || !payloadView.ValueExists("s3key") || !payloadView.GetObject("s3bucket").IsString() ||
        !payloadView.GetObject("s3key").IsString()) {
        return false;
    }
    return true;
}
