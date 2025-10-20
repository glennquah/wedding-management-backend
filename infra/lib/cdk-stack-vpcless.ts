import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as path from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nestJsLambda = new lambda.Function(this, 'NestJsApiLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist'), {
        exclude: [
          'infra/**',
          'prisma/**',
          'src/**',
          'test/**',
          '*.ts',
          '*.map',
          'main.js.LICENSE.txt',
        ],
      }),
      environment: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
        JWT_REFRESH_KEY: process.env.JWT_REFRESH_KEY,
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        FASTAPI_URL: process.env.FASTAPI_URL,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      },
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
    });

    const httpApi = new apigatewayv2.HttpApi(this, 'NestJsHttpApi', {
      apiName: 'NestJsApi',
      createDefaultStage: true,
    });

    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: new integrations.HttpLambdaIntegration(
        'LambdaIntegration',
        nestJsLambda,
      ),
    });
  }
}
