#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { AlenCloudTest } from "../lib/alen-cloud-test";

const app = new cdk.App();

new AlenCloudTest(app, "AlenCloudTestStack", {
  env: { account: "485563272586", region: "eu-west-1" },
  wgAdminPasswordSecretArn:
    "arn:aws:secretsmanager:eu-west-1:485563272586:secret:vpn-wg-password-K0Dfcb",
});
