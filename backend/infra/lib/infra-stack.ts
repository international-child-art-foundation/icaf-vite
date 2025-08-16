import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import {Runtime } from "aws-cdk-lib/aws-lambda";



export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 1️⃣  Lambda function — code is built from backend/functions/hello.ts
    const helloFn = new NodejsFunction(this, "HelloFn", {
      entry: "../functions/hello.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(5),
      memorySize: 256,
    });

    // 2️⃣  REST API — private by default (no execute‑api wildcard policy)
    const api = new apigw.RestApi(this, "InternalApi", {
      endpointConfiguration: {
        types: [apigw.EndpointType.REGIONAL],
      },
      deployOptions: { stageName: "dev" },
    });

    const hello = api.root.addResource("hello");
    hello.addMethod("GET", new apigw.LambdaIntegration(helloFn));
  }
}
