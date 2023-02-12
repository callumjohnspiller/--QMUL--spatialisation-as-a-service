# Docker instructions

1. Ensure that an AWS ```config``` file has been placed in this directory.
2. Run ```docker build -t spatialisation-lambda .``` in this directory to build the docker container
3. Then to push the image to the repository:
    * Log docker in using the aws CLI (that has been configured to an IAM role): ```aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 024679833031.dkr.ecr.eu-west-2.amazonaws.com```
    * Tag the built docker image: ```docker tag spatialisation-lambda:latest 024679833031.dkr.ecr.eu-west-2.amazonaws.com/saas:spatialisation-lambda```
    * Push the image to the Elastic Container Repo: ```docker push 024679833031.dkr.ecr.eu-west-2.amazonaws.com/saas:spatialisation-lambda```
4. Deploy the container image using the Lambda AWS console.