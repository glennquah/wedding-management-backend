import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as path from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'MyVPC', {
      vpcId: process.env.VPC_ID!,
      availabilityZones: process.env.VPC_AZS!.split(','),
      publicSubnetIds: process.env.PUBLIC_SUBNET_IDS!.split(','),
    });   

    const lambdaSG = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for NestJS Lambda',
    });

    const rdsSG = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'RDSSG',
      process.env.RDS_SG_ID!, 
    );

    rdsSG.addIngressRule(lambdaSG, ec2.Port.tcp(5432), 'Allow Lambda to connect to Postgres');

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
      vpc,
      vpcSubnets: { subnets: vpc.publicSubnets },
      allowPublicSubnet: true,
      securityGroups: [lambdaSG],
      environment: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
        JWT_REFRESH_KEY: process.env.JWT_REFRESH_KEY
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
