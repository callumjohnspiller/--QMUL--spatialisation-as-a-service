cmake_minimum_required(VERSION 3.5)
set(CMAKE_CXX_STANDARD 14)
project(spatialiser LANGUAGES CXX)

include_directories("../3dti_AudioToolkit/3dti_Toolkit")
include_directories("../3dti_AudioToolkit/3dti_ResourceManager")
include_directories("../3dti_AudioToolkit/3dti_ResourceManager/third_party_libraries/boost_circular_buffer")
include_directories("../3dti_AudioToolkit/3dti_ResourceManager/third_party_libraries/cereal/include")
include_directories("../3dti_AudioToolkit/3dti_ResourceManager/third_party_libraries/sofacoustics/libsofa/src")
include_directories("../3dti_AudioToolkit/3dti_ResourceManager/third_party_libraries/sofacoustics/libsofa/dependencies/include")

add_subdirectory(utils)

link_directories("../3dti_AudioToolkit/3dti_ResourceManager/third_party_libraries/sofacoustics/libsofa/lib")
link_directories("../3dti_AudioToolkit/3dti_ResourceManager/third_party_libraries/sofacoustics/libsofa/dependencies/lib/linux")

link_libraries(sofa hdf5 hdf5_hl netcdf netcdf_c++4 z)

file(GLOB_RECURSE SOURCES
        ../3dti_AudioToolkit/3dti_Toolkit/BinauralSpatializer/*.cpp
        ../3dti_AudioToolkit/3dti_Toolkit/Common/*.cpp
        ../3dti_AudioToolkit/3dti_ResourceManager/HRTF/*.cpp
        ../3dti_AudioToolkit/3dti_ResourceManager/ILD/*.cpp
        )

if(NOT TARGET spdlog)
    find_package(spdlog REQUIRED)
endif()

add_executable(${PROJECT_NAME} "main.cpp" "spatialiser.cpp" "spatialiser.h" ${SOURCES})

find_package(aws-lambda-runtime REQUIRED)
find_package(AWSSDK COMPONENTS s3 transfer)

target_link_libraries(${PROJECT_NAME} PRIVATE AWS::aws-lambda-runtime ${AWSSDK_LINK_LIBRARIES}
        sofa
        netcdf
        hdf5_hl
        hdf5
        netcdf
        netcdf_c++4
        z
        ConsoleLogger
        VerifyRequest
        spdlog::spdlog
        )

target_compile_options(${PROJECT_NAME} PRIVATE
        "-Wall"
        "-Wextra"
        "-Wconversion"
        "-Wshadow"
        "-Wno-sign-conversion")

target_compile_features(${PROJECT_NAME} PRIVATE "cxx_std_14")

aws_lambda_package_target(${PROJECT_NAME})