import { test, expect } from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.goto('https://main.d3lmyn7tuolkx3.amplifyapp.com/');
})

test('Splash page loads', async ({ page }) => {
  await expect(page.getByText('Spatialisation As A Service')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Enter'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Skip Introduction'})).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('Intro slideshow', async ({page}) => {
  let n = 0;
  await page.getByRole('button', { name: 'Enter' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'But what is spatial audio?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'Stereo vs Spatial pt.1' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'Stereo vs Spatial pt.2' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'So what?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'Cool!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'So what is next?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start App' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Start App' }).click();
  await expect(page.locator('#react-app div').filter({ hasText: '1Choose file2Choose number of stems3ConfirmBackNext' }).nth(3)).toBeVisible();
});

test('Upload files', async ({page}) => {
  await page.getByRole('button', { name: 'Skip Introduction' }).click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('textbox').setInputFiles('./test-files/test-mp3.mp3');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('#demo-simple-select').click();
  await page.getByRole('option', { name: 'Two (Vocals/Rest)' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  const uploadPromise = page.waitForEvent('request');
  await page.getByRole('button', { name: 'Finish and Upload' }).click();
  const upload = await uploadPromise;
  const response = await upload.response();
  expect(await response.ok());
});
