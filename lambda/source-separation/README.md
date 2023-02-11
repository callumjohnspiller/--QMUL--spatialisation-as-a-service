# Docker Instructions

0. Ensure that pre-trained models have been added to the ```app/pretrained_models``` directory prior to building the image.
1. Build docker image by running ```docker build -t spleeter-lambda .``` from this directory.
    * The built image lets you test the function invocation locally: run the command ```docker run -p 9000:8080  spleeter-lambda:latest``` then:
    * run the mock call: ```curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'```
2. Then to push the image to the repository:
    * Log docker in using the aws CLI (that has been configured to an IAM role): ```aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 024679833031.dkr.ecr.eu-west-2.amazonaws.com```
    * Tag the built docker image: ```docker tag  spleeter-lambda:latest 024679833031.dkr.ecr.eu-west-2.amazonaws.com/saas:spleeter-lambda```
    * Push the image to the Elastic Container Repo: ```docker push 024679833031.dkr.ecr.eu-west-2.amazonaws.com/saas:spleeter-lambda```
3. Deploy the container image using the Lambda AWS console.
