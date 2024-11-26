#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { MakeItLpStack } from '@/lib/make-it-lp-stack';
import { IdBuilder } from '@/utils/naming';

const app = new App();

const SERVICE_CODE = 'make-it';
const branch = 'production';
const idBuilder = new IdBuilder(SERVICE_CODE, branch);

new MakeItLpStack(app, `MakeIt-Lp-${branch}`, idBuilder, {});
