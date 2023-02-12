# Pull latest amazon linux image
FROM amazonlinux:latest

RUN yum -y groupinstall "Development tools"
RUN yum install -y gcc-c++ libcurl-devel openssl-devel openssl-static cmake3 git
RUN pip3 install awscli

# Install AWS C++ SDK
RUN mkdir ~/install && git clone https://github.com/aws/aws-sdk-cpp.git && \
    cd aws-sdk-cpp && sh prefetch_crt_dependency.sh && mkdir build  && cd build && \
    cmake3 .. -DBUILD_ONLY="s3" \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_SHARED_LIBS=OFF \
    -DCUSTOM_MEMORY_MANAGEMENT=OFF \
    -DCMAKE_INSTALL_PREFIX=~/install \
    && make && make install

RUN git clone https://github.com/awslabs/aws-lambda-cpp-runtime.git && \
    cd aws-lambda-cpp-runtime && mkdir build && cd build && \
    cmake3 .. -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_SHARED_LIBS=OFF \
    -DCMAKE_INSTALL_PREFIX=~/install \
    && make && make install

COPY main.cpp ./src/
COPY CMakeLists.txt ./src/
COPY config ./root/.aws/

RUN mkdir build && cd build && \
    cmake3 ../src -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=~/install \
    && make && make aws-lambda-package-encoder

RUN cd build && unzip encoder.zip -d unpacked

ENTRYPOINT ["/build/unpacked/bin/encoder"]