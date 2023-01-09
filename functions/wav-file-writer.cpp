#include <iostream>
#include <cmath>
#include <fstream>

using namespace std;

const int sampleRate = 44100;
const int bitDepth = 16;
const int numberOfChannels = 2;

//Test oscillator to make sound

class SineOscillator {
    float frequency, amplitude, angle = 0.0f, offset = 0.0;
public:
    SineOscillator(float freq, float amp) : frequency(freq), amplitude(amp) {
        //calculate offset for sin oscillation in constructor
        offset = 2 * M_PI * frequency / sampleRate;
    }
    float process() {
        // Asin(angle)
        auto sample = amplitude * sin(angle);
        //angle += 2pif/sr
        angle += offset;
        return sample;
    }
};

//Helper function to correctly write values to file
void writeToFile(ofstream &file, int value, int size) {
    file.write(reinterpret_cast<const char*> (&value), size);
}

int main() {
    int duration = 4;
    ofstream audioFile;
    audioFile.open("output.wav", ios::binary);

    SineOscillator sineOscillator(440,0.5);

    //Write WAV chunks

    //Header chunk
    audioFile << "RIFF";
    audioFile << "----";
    audioFile << "WAVE";

    //Format Chunk
    audioFile << "fmt ";
    writeToFile(audioFile, 16, 4); //Size
    writeToFile(audioFile, 1, 2); //compression code
    writeToFile(audioFile, numberOfChannels, 2); //Number of channels
    writeToFile(audioFile, sampleRate, 4); //Sample rate
    writeToFile(audioFile, sampleRate * bitDepth * numberOfChannels / 8, 4); //Average bytes per second (bitrate / 8)
    writeToFile(audioFile, bitDepth / 8, 2); //Block align
    writeToFile(audioFile, bitDepth, 2); //Bit depth

    //Data Chunk
    audioFile << "data";
    audioFile << "----";

    //Store pre-data position
    int preAudioPosition = audioFile.tellp();
    //Define max amplitude
    auto maxAmplitude = pow(2, bitDepth - 1) -1;

    //use oscillator to write data to file
    for(int i = 0; i < sampleRate * duration; i++ ) {
        auto sample = sineOscillator.process();
        int intSample = static_cast<int> (sample * maxAmplitude);
        writeToFile(audioFile, intSample, 2);
    }

    //Store post-data position (EOF)
    int postAudioPosition = audioFile.tellp();

    //Record file length meta-data
    audioFile.seekp(preAudioPosition - 4);
    writeToFile(audioFile, postAudioPosition - preAudioPosition, 4);
    audioFile.seekp(4, ios::beg);
    writeToFile(audioFile, postAudioPosition - 8, 4);

    //close file
    audioFile.close();
    return 0;
}
