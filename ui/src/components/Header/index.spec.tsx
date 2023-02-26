import { test, expect } from '@playwright/experimental-ct-react';
import Header from './index';

test.use({ viewport: { width: 500, height: 500 } });

test('header should be visible', async ({ mount }) => {
    const component = await mount(<Header />);
    await expect(component).toBeVisible();
    await expect(component).toHaveId("page-header");
});