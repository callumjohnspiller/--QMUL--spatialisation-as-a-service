# Define global args
ARG FUNCTION_DIR="/function"
ARG BASE=python:3.9

# Pull base python image
FROM ${BASE} as build-image

# Install dependencies needed for lambda runtime API
RUN apt-get update && \
    apt-get install -y \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev

# Declare args for build

ARG SPLEETER_VERSION=2.3.2
ENV MODEL_PATH app/pretrained_models
ARG FUNCTION_DIR
RUN mkdir -p ${FUNCTION_DIR}

# Install pip dependencies from reqirements file
COPY requirements.txt .
RUN pip install \
    --target ${FUNCTION_DIR} \
    -r requirements.txt

# Copy app files
COPY app/ ${FUNCTION_DIR}

# Pull clean image for second stage
FROM ${BASE}

# Install dependencies needed for Spleeter
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    libsndfile1

# Copy output from 1st build image into working directory
ARG FUNCTION_DIR
WORKDIR ${FUNCTION_DIR}
COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}

#Declare entry points for the function and the lambda handler command
ENTRYPOINT [ "/usr/local/bin/python", "-m", "awslambdaric" ]
CMD [ "app.handler" ]