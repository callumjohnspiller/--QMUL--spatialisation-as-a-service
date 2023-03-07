#include <aws/core/Aws.h>
#include <algorithm>
#include <functional>
#include <iostream>
#include <vector>

#include "BinauralSpatializer/3DTI_BinauralSpatializer.h"
#include "HRTF/HRTFFactory.h"
#include "ILD/ILDCereal.h"
#include "BRIR/BRIRFactory.h"
#include "AudioFile.h"
#include "spatialiser.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/stdout_sinks.h"


int render(Aws::String bucket, Aws::Utils::Array <Aws::Utils::Json::JsonView> keys,
           Aws::Utils::Json::JsonView spatialParams) {

//    Initialise and configure binaural renderer
    Binaural::CCore renderer;
    int sampleRate = 44100;
    int bufferSize = 8192;
    renderer.SetAudioState({sampleRate, bufferSize});
    renderer.SetHRTFResamplingStep(15);

//    Create binaural listener from renderer
    std::shared_ptr <Binaural::CListener> listener = renderer.CreateListener();

//    Load in HRTF and ILD effect table
    bool specifiedDelays;
    bool hrtfLoaded = HRTF::CreateFromSofa(
            "../3dti_AudioToolkit/resources/HRTF/SOFA/3DTI_HRTF_IRC1008_512s_" + std::to_string(sampleRate) + "Hz.sofa",
            listener, specifiedDelays);
    if (hrtfLoaded) {
        spdlog::get("console")->info("HRTF Loaded successfully");
    } else {
        spdlog::get("err_logger")->error("Loading HRTF from SOFA file failed");
    }

    bool ildLoaded = ILD::CreateFrom3dti_ILDNearFieldEffectTable(
            "../3dti_AudioToolkit/resources/ILD/NearFieldCompensation_ILD_" + std::to_string(sampleRate) + ".3dti-ild",
            listener);
    if (ildLoaded) {
        spdlog::get("console")->info("\"ILD Near Field Effect simulation file has been loaded successfully\"");
    } else {
        spdlog::get("err_logger")->error("Loading ILD Near Field Effect simulation file failed");
    }

//     Optional: change listener position (in case of head movement)
//     Common::CTransform listenerTransform;
//     listenerTransform.SetOrientation(Common::CQuaternion(1, 0, 0, 0));
//     listener->SetListenerTransform(listenerTransform);

    // Environment
    std::shared_ptr<Binaural::CEnvironment> environment = renderer.CreateEnvironment();
    bool brirLoaded = BRIR::CreateFromSofa("3dti_AudioToolkit/resources/BRIR/SOFA/3DTI_BRIR_small_" + std::to_string(sampleRate) + "Hz.sofa", environment);
    if (brirLoaded) {
        spdlog::get("console")->info("BRIR loaded successfully");
    } else {
        spdlog::get("err_logger")->error("Loading BRIR from SOFA file failed");
    }

    // Configure sources
    std::vector<string> sourcePaths;
    for (size_t i = 0; i < keys.GetLength(); i++) {
        auto localDir = Aws::String("tmp/") + keys[i].AsString();
        sourcePaths.push_back(localDir);
    }

    // Configure source positions from spatialParams
    std::vector<Common::CVector3> sourcePositions;
    for (size_t i = 0; i < keys.GetLength(); i++) {
        sourcePositions.push_back(Common::CVector3(spatialParams.GetObject(keys[i].AsString()).GetInteger("X"), spatialParams.GetObject(keys[i].AsString()).GetInteger("Y"),
                                                   spatialParams.GetObject(keys[i].AsString()).GetInteger("Z")));
    }

    if (sourcePaths.size() != sourcePositions.size()) {
        throw std::runtime_error("The number of source positions needs to be equal to the number of source paths");
    }
    const size_t numSources = sourcePaths.size();

    std::vector<std::shared_ptr<Binaural::CSingleSourceDSP>> sources(numSources);
    std::vector<AudioFile<float>> sourceFiles(numSources);
    for (size_t i = 0; i < numSources; ++i) {
        // Create source
        sources[i] = renderer.CreateSingleSourceDSP();
        sources[i]->SetSpatializationMode(Binaural::TSpatializationMode::HighQuality);
        // Set static position
        Common::CTransform sourceTransform;
        sourceTransform.SetPosition(sourcePositions[i]);
        sources[i]->SetSourceTransform(sourceTransform);
        // Open corresponding audio file
        sourceFiles[i].load(sourcePaths[i]);
    }

    int numSamples = sourceFiles.front().getNumSamplesPerChannel();
    for (size_t i = 0; i < numSources; ++i) {
        if (sourceFiles[i].getNumSamplesPerChannel() != numSamples) {
            throw std::runtime_error("All source audio files need to have the same duration");
        }
        if (sourceFiles[i].getSampleRate() != sampleRate) {
            throw std::runtime_error("All source audio files need to have a sample rate of " + std::to_string(sampleRate));
        }
        if (sourceFiles[i].getNumChannels() > 1) {
            spdlog::get("err_logger")->error("Only the first channel of multichannel source audio files will be used");
        }
    }

    // Create binaural stereo file to store result in memory
    AudioFile<double> binauralFile;
    binauralFile.setSampleRate(sampleRate);
    binauralFile.setBitDepth(16);
    binauralFile.setAudioBufferSize(2, numSamples); // initialised to all zeros

    // Create buffers to process audio in blocks
    CMonoBuffer<float> inputBuffer(bufferSize);
    CMonoBuffer<float> leftBuffer(bufferSize);
    CMonoBuffer<float> rightBuffer(bufferSize);

    int start = 0;
    // Helper function for adding output buffers to contents of stereo file
    auto addToOutput = [&](const int size) {
        std::transform(leftBuffer.begin(), leftBuffer.begin()+size, &binauralFile.samples[0][start], &binauralFile.samples[0][start], std::plus<float>());
        std::transform(rightBuffer.begin(), rightBuffer.begin()+size, &binauralFile.samples[1][start], &binauralFile.samples[1][start], std::plus<float>());
    };
    // Helper function for blockwise rendering of binaural audio and accumulating into stereo file
    auto processBuffer = [&](const int size) {
        for (size_t i = 0; i < numSources; ++i) {
            std::copy(&sourceFiles[i].samples.front()[start], &sourceFiles[i].samples.front()[start+size], inputBuffer.begin());
            sources[i]->SetBuffer(inputBuffer);
            sources[i]->ProcessAnechoic(leftBuffer, rightBuffer);
            addToOutput(size);
        }
        environment->ProcessVirtualAmbisonicReverb(leftBuffer, rightBuffer);
        addToOutput(size);
    };

    // Process complete buffers
    for (; start < numSamples - bufferSize; start += bufferSize) {
        processBuffer(bufferSize);
    }
    // Process last partial buffer
    int remainingSize = numSamples - start;
    processBuffer(remainingSize);

    // Save resulting wave file to disk
    binauralFile.save("tmp/binaural.wav");

    return 0;
}

