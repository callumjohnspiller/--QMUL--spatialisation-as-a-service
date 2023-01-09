# Spatialisation As A Service

## Documentation

Contained within the ```docs/src``` directory, compile ```main.tex``` using TeXLive 2022 distribution.

Update the bibliography with the ```main.bib``` file, and add any glossary terms to ```glossary.tex```.

After updating the glossary, ensure that glossaries are built properly for reference by running ```makeglossaries main``` from the auxiliary output folder.

## Testing

Test frameworks have been provided using the Playwright automated testing framework.

End-to-end tests can be found in the ```e2e``` folder and can be initiated with ```npx playwright test```.

Similarly, testing at the component level has also been implemented using Playwright.
The component test files can be found in the ```ui/``` directory at the same level as the components themselves.
Test all components by running ```npm run test-ct``` in the ```ui/``` directory.