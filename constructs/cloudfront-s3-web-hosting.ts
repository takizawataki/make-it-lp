import * as path from 'path';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import {
  CanonicalUserPrincipal,
  Effect,
  PolicyStatement,
} from 'aws-cdk-lib/aws-iam';
import { Bucket, BucketPolicy, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { IdBuilder } from '@/utils/naming';

export class LandingPage extends Construct {
  constructor(scope: Construct, id: string, idBuilder: IdBuilder) {
    super(scope, id);

    const bucket = new Bucket(this, 'WebHostingBucket', {
      bucketName: idBuilder.name('web-hosting'),
      versioned: true,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const cloudfrontOai = new OriginAccessIdentity(this, 'CloudFrontOAI');

    const bucketPolicy = new BucketPolicy(this, 'WebsiteBucketPolicy', {
      bucket: bucket,
    });

    bucketPolicy.document.addStatements(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        effect: Effect.ALLOW,
        principals: [
          new CanonicalUserPrincipal(
            cloudfrontOai.cloudFrontOriginAccessIdentityS3CanonicalUserId,
          ),
        ],
        resources: [`${bucket.bucketArn}/*`],
      }),
    );

    const certificateArn =
      'arn:aws:acm:us-east-1:471112963464:certificate/1e0cf804-3740-4abf-9d20-42f2009cde68';
    const certificate = Certificate.fromCertificateArn(
      this,
      'WebsiteCertificate',
      certificateArn,
    );

    const distribution = new Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity: cloudfrontOai,
        }),
      },
      defaultRootObject: 'index.html',
      enableLogging: true,
      logBucket: new Bucket(this, 'LogBucket', {
        objectOwnership: ObjectOwnership.OBJECT_WRITER,
        bucketName: idBuilder.name('log-bucket'),
        removalPolicy: RemovalPolicy.DESTROY,
      }),
      logFilePrefix: 'cloudfront-access-logs/',
      logIncludesCookies: true,
      domainNames: ['lp.angel-make-it.com'],
      certificate: certificate,
    });

    distribution.applyRemovalPolicy(RemovalPolicy.DESTROY);
    // Distributionに対してBucketPolicyが先に適用されるよう依存関係を追加
    distribution.node.addDependency(bucketPolicy);

    const hostingCodePath = path.resolve(__dirname, '../landing-page');
    const bucketDeployment = new BucketDeployment(
      this,
      'DeployWebsiteContent',
      {
        sources: [Source.asset(hostingCodePath)],
        destinationBucket: bucket,
        destinationKeyPrefix: '/',
      },
    );

    // デプロイメントが Distribution に依存するように設定
    bucketDeployment.node.addDependency(distribution);
  }
}
