# Spatialisation As A Service

## Documentation

Contained within the ```docs/src``` directory, compile ```main.tex``` using the TeXLive distribution.

In order for Minted code snippets to be rendered in output, make sure to have Pygments installed to your Python installation and to add the ```-shell-escape``` flag when you run LaTeX.

Update the bibliography with the ```main.bib``` file, and add any glossary terms to ```glossary.tex```.

After updating the glossary, ensure that glossaries are built properly for reference by running ```makeglossaries main``` from the auxiliary output folder.

## Testing

Test frameworks have been provided using the Playwright automated testing framework.

End-to-end tests can be found in the ```e2e``` folder and can be initiated with ```npx playwright test```.

Similarly, testing at the component level has also been implemented using Playwright.
The component test files can be found in the ```ui/``` directory at the same level as the components themselves.
Test all components by running ```npm run test-ct``` in the ```ui/``` directory.

## Lambda

Two Lambda functions have been implemented as Docker Images and can be found in the ```lambda/``` directory.

Each subdirectory contains a single Dockerfile and instructions on how to build, tag, and upload those images.

The ```spatialisation/``` subdirectory also contains a CMakeLists file which isnused by the Dockerfile in order to build the C++ Lambda function.

## Step Function

The ```step-function/``` subdirectory contains a JSON file containing the Amazon States Language representation of the Step Function that is deployed in AWS for the service.

## UI

Consult the ```package.json``` file for run configurations for the UI. Currently the UI will build and run locally, however relevant AWS credentials will need to be provided in order for the app to function properly. Therefore ```"test-ct": "playwright test -c playwright-ct.config.ts"``` is the only relevant configuration you will need to use in order to run the Playwright unit tests.

