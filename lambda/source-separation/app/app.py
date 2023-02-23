import boto3
import os
import soundfile as sf
import numpy as np
from spleeter.separator import Separator
from spleeter.audio.adapter import AudioAdapter

ACCESS_KEY = os.environ['ACCESS_KEY']
SECRET_KEY = os.environ['SECRET_KEY']


def handler(event, context):
    session = boto3.Session(
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
    )

    BUCKET_NAME = event['detail']['bucket']['name']
    KEY = event['detail']['object']['key']
    LOCAL_FILENAME = "/tmp/input"
    OUTPUT_BUCKET_NAME = "saas-separation-output"

    s3 = session.client('s3')

    s3.download_file(Bucket=BUCKET_NAME,
                     Key=KEY, Filename=LOCAL_FILENAME)

    if event['stem-count'] == 2:
        separator = Separator('spleeter:2stems', multiprocess=False, stft_backend='tensorflow')
    elif event['stem-count'] == 4:
        separator = Separator('spleeter:4stems', multiprocess=False, stft_backend='tensorflow')
    elif event['stem-count'] == 5:
        separator = Separator('spleeter:5stems', multiprocess=False, stft_backend='tensorflow')
    else:
        separator = Separator('spleeter:2stems', multiprocess=False, stft_backend='tensorflow')

    audio_loader = AudioAdapter.default()
    sample_rate = 44100
    waveform, _ = audio_loader.load(LOCAL_FILENAME, sample_rate=sample_rate)

    prediction = separator.separate(waveform)
    file_paths = []

    for instrument, data in prediction.items():
        file_paths.append(f'{instrument}_stem.wav')
        sf.write(f"/tmp/{file_paths[-1]}", np.mean(data, axis=1), sample_rate)

    for path in file_paths:
        s3.upload_file(
            Filename=f"/tmp/{path}",
            Bucket=OUTPUT_BUCKET_NAME,
            Key=f"{KEY}/{path}",
        )

    return {"output-bucket": OUTPUT_BUCKET_NAME, "output-folder": KEY}
