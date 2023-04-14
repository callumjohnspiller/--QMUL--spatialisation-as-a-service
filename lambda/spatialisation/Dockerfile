# Pull latest amazon linux image
FROM amazonlinux:latest
RUN yum update -y
RUN yum install -y yum-utils

# Install required tools
RUN yum -y groupinstall "Development tools"
RUN yum install -y gcc-c++ zlib-devel cmake3 python3-pip

# Specify compilers
ENV CC=gcc CXX=g++

# Install required tools
RUN yum clean -y metadata
RUN yum install -y libcurl-devel
RUN yum install -y openssl-devel
RUN yum install -y pulseaudio-libs-devel
RUN pip3 install awscli

# Fetch and install AWS Lambda Runtime for C++
RUN git clone https://github.com/awslabs/aws-lambda-cpp-runtime.git && \
    cd aws-lambda-cpp-runtime && mkdir build && cd build && \
    cmake3 .. -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_SHARED_LIBS=OFF \
    -DCMAKE_INSTALL_PREFIX=/usr \
    && make -j8 && make install

# Fetch and install AWS C++ SDK (S3 and transfer libraries only)
RUN git clone https://github.com/aws/aws-sdk-cpp.git --recursive aws-sdk-cpp && \
    cd aws-sdk-cpp && mkdir build && cd build && \
    cmake3 .. -DBUILD_ONLY="s3;transfer" \
    -DBUILD_SHARED_LIBS=OFF \
    -DENABLE_UNITY_BUILD=ON \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=/usr/local \
    && make -j8 && make install

# Fetch 3DTI toolkit and dependencies
RUN git clone https://github.com/3DTune-In/3dti_AudioToolkit.git 3dti_AudioToolkit && \
    cd 3dti_AudioToolkit/3dti_ResourceManager/third_party_libraries/ && \
    git clone https://github.com/USCiLab/cereal.git cereal && \
    rm -rf sofacoustics && \
    git clone https://github.com/sofacoustics/API_Cpp.git sofacoustics && \
    rm sofacoustics/libsofa/lib/libsofa.a

# Build 3DTI toolkit
RUN cd 3dti_AudioToolkit/3dti_ResourceManager/third_party_libraries/sofacoustics/libsofa/build/linux && \
    make CONFIG=Release

# Fetch and install C++ logger
RUN git clone https://github.com/gabime/spdlog.git && \
    cd spdlog && mkdir build && cd build && \
    cmake3 .. && make -j && make install

# Copy program source files
RUN mkdir -p src
ADD src ./src/
ADD utils ./src/
COPY CMakeLists.txt ./src/
COPY config .aws/

# Build source files
RUN mkdir build && cd build && \
    cmake3 ../src -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_SHARED_LIBS=OFF \
    -DCMAKE_INSTALL_PREFIX=/usr

#Build AWS deployment package
RUN cd build && make && make aws-lambda-package-spatialisation

# Unzip deployment package
RUN cd build && unzip spatialisation.zip -d unpacked

# Point to compiled function
ENTRYPOINT ["/build/unpacked/bin/spatialisation"]

# Uncomment line below for Docker Image Debugging
#CMD ["/usr/sbin/init"]