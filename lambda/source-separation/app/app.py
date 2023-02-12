import boto3
from spleeter.separator import Separator

ACCESS_KEY = 'AKIAQLPYILXDYNE5EFLP'
SECRET_KEY = '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'


def handler(event, context):

    session = boto3.Session(
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
    )

    s3 = session.client('s3')

    s3.download_file(Bucket="saas-deposit",
                     Key="test-files/confusion.mp3", Filename="/tmp/confusion.mp3")

    separator = Separator('spleeter:2stems', multiprocess=False)
    # separator4 = Separator('spleeter:4stems', multiprocess=False)
    # separator5 = Separator('spleeter:5stems', multiprocess=False)
    separator.separate_to_file(
        '/tmp/confusion.mp3', '/tmp', filename_format='{filename}_{instrument}.{codec}'
    )
    # separator4.separate_to_file(
    #     '/tmp/confusion.mp3', '/tmp', filename_format='{filename}_{instrument}.{codec}'
    # )
    # separator5.separate_to_file(
    #     '/tmp/confusion.mp3', '/tmp', filename_format='{filename}_{instrument}.{codec}'
    # )

    s3.upload_file(
        Filename="/tmp/confusion_accompaniment.wav",
        Bucket="saas-deposit",
        Key="test-files/confusion_accompaniment.wav",
    )

    s3.upload_file(
        Filename="/tmp/confusion_vocals.wav",
        Bucket="saas-deposit",
        Key="test-files/confusion_vocals.wav",
    )

    return 'Finished separating'
