# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

# Idiosyncrasies
To import a .ts file within this project, you must use the extension '.js'. 
After changing the sharp version in layers/sharp/package.json, re-run the build script.
The build script must be run in WSL: bash scripts/build-sharp-layer.sh