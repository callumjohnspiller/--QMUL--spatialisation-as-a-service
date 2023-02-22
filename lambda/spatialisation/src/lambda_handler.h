#ifndef SPATIALISATION_LAMBDA_HANDLER_H
#define SPATIALISATION_LAMBDA_HANDLER_H
using namespace Aws;
using namespace aws::lambda_runtime;

invocation_response
lambda_handler(invocation_request const &req, Client::ClientConfiguration const &clientConfig);

#endif //SPATIALISATION_LAMBDA_HANDLER_H
