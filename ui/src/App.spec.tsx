import { test, expect } from '@playwright/experimental-ct-react';
import App from './App';
import React from "react";

test('should work', async ({ mount }) => {
    const component = await mount(
        <App/>
    );
    await expect(component).toContainText('Spatialisation As A Service');
    await expect(component).toContainText('Enter');
    await expect(component).toContainText('Skip Introduction');

});