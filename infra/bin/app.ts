#!/usr/bin/env node
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

dotenv.config({ path: path.resolve(__dirname, '../../.env.prod') });

const app = new cdk.App();
new CdkStack(app, 'NestJsApiStack', {
  env: { 
    account: process.env.AWS_ACCOUNT_ID, 
    region: process.env.AWS_REGION 
  },
});
