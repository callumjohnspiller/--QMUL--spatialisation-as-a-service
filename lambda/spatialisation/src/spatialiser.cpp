#include <aws/core/Aws.h>

#include "BinauralSpatializer/3DTI_BinauralSpatializer.h"
#include "HRTF/HRTFFactory.h"
#include "ILD/ILDCereal.h"
#include "AudioFile.h"
#include "spatialiser.h"
#include "spdlog/spdlog.h"
#include "spdlog/sinks/stdout_sinks.h"


int render() {

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
        spdlog::get("stderr")->error("Loading HRTF from SOFA file failed")
    }

    bool ildLoaded = ILD::CreateFrom3dti_ILDNearFieldEffectTable(
            "../3dti_AudioToolkit/resources/ILD/NearFieldCompensation_ILD_" + std::to_string(sampleRate) + ".3dti-ild",
            listener);
    if (ildLoaded) {
        spdlog::get("console")->info("\"ILD Near Field Effect simulation file has been loaded successfully\"");
    } else {
        spdlog::get("stderr")->error("Loading ILD Near Field Effect simulation file failed")
    }

//     Optional: change listener position (in case of head movement)
//     Common::CTransform listenerTransform;
//     listenerTransform.SetOrientation(Common::CQuaternion(1, 0, 0, 0));
//     listener->SetListenerTransform(listenerTransform);

    // Source
    std::shared_ptr <Binaural::CSingleSourceDSP> source = renderer.CreateSingleSourceDSP();
    source->SetSpatializationMode(Binaural::TSpatializationMode::HighQuality);

    Common::CTransform sourceTransform;
    sourceTransform.SetPosition(Common::CVector3(0, 1, 0));
    source->SetSourceTransform(sourceTransform);

    // Read samples from mono audio source
    AudioFile<double> sourceFile;
    sourceFile.load("/tmp/stem.wav");
    size_t numSamples = sourceFile.getNumSamplesPerChannel();

    AudioFile<double> binauralFile;
    binauralFile.setSampleRate(sampleRate);
    binauralFile.setBitDepth(16);
    binauralFile.setAudioBufferSize(2, numSamples);

    CMonoBuffer<float> inputBuffer(bufferSize);
    CMonoBuffer<float> leftBuffer(bufferSize);
    CMonoBuffer<float> rightBuffer(bufferSize);

    for (size_t start = 0; start < numSamples - bufferSize; start += bufferSize) {
        inputBuffer.assign(&sourceFile.samples[0][start], &sourceFile.samples[0][start] + bufferSize);
        source->SetBuffer(inputBuffer);
        source->ProcessAnechoic(leftBuffer, rightBuffer);
        std::copy(leftBuffer.begin(), leftBuffer.begin() + bufferSize, &binauralFile.samples[0][start]);
        std::copy(rightBuffer.begin(), rightBuffer.begin() + bufferSize, &binauralFile.samples[1][start]);
    }

    binauralFile.save("tmp/binaural.wav");

    return 0;
}

