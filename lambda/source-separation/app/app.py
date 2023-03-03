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

    bucket_name = event['detail']['bucket']['name']
    key = event['detail']['object']['key']
    local_filename = "/tmp/input"
    output_bucket_name = "saas-stems"

    s3 = session.client('s3')

    s3.download_file(Bucket=bucket_name,
                     Key=key, Filename=local_filename)

    if 'stem-count' in event.keys():
        if event['stem-count']['val'] == 2:
            separator = Separator('spleeter:2stems', multiprocess=False, stft_backend='tensorflow')
        elif event['stem-count']['val'] == 4:
            separator = Separator('spleeter:4stems', multiprocess=False, stft_backend='tensorflow')
        elif event['stem-count']['val'] == 5:
            separator = Separator('spleeter:5stems', multiprocess=False, stft_backend='tensorflow')
        else:
            separator = Separator('spleeter:2stems', multiprocess=False, stft_backend='tensorflow')
    else:
        separator = Separator('spleeter:2stems', multiprocess=False, stft_backend='tensorflow')

    audio_loader = AudioAdapter.default()
    sample_rate = 44100
    waveform, _ = audio_loader.load(local_filename, sample_rate=sample_rate)

    prediction = separator.separate(waveform)
    file_paths = []

    for instrument, data in prediction.items():
        file_paths.append(f'{instrument}_stem.wav')
        sf.write(f"/tmp/{file_paths[-1]}", np.mean(data, axis=1), sample_rate)

    for path in file_paths:
        s3.upload_file(
            Filename=f"/tmp/{path}",
            Bucket=output_bucket_name,
            Key=f"{key}/{path}",
        )

    return {"output-bucket": output_bucket_name, "output-folder": key, "output-paths": file_paths}
