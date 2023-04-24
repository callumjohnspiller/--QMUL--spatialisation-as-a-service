import { test, expect } from '@playwright/experimental-ct-react';
import {MemoHowlerGroup} from "./Howler";

const spatialParams = {
    'vocal': {
        'X': 1,
        'Y': 1,
        'Z':1
    },
    'instrumental': {
        'X': 1,
        'Y': 1,
        'Z':1
    },
}

const fileLabels = [
    'vocal',
    'instrumental'
]

const audioUrls = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
]

const mutes: string[] = [

]

test('should work', async ({ mount }) => {
    const component = await mount(<MemoHowlerGroup spatialParams={spatialParams} fileLabels={fileLabels} audioURLS={audioUrls} mutes={mutes}/>);
    await expect(component).toBeVisible();
    await expect(component).toContainText('Play');
    await expect(component).toContainText('Pause');
});