import { test, expect } from '@playwright/experimental-ct-react';
import Scene from "./Scene";

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

test('should work', async ({ mount }) => {
    const component = await mount(<Scene spatialParams={spatialParams} fileLabels={fileLabels}/>);
    await expect(component).toBeVisible();
});