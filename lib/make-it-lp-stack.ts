import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LandingPage } from '@/constructs/cloudfront-s3-web-hosting';
import { IdBuilder } from '@/utils/naming';

export class MakeItLpStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    idBuilder: IdBuilder,
    props?: StackProps,
  ) {
    super(scope, id, props);
    new LandingPage(this, 'LandingPage', idBuilder);
  }
}
