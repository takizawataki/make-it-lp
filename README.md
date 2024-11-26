# make-it-lp

make it ! のランディングページを管理します。

## cdk（S3 + CloudFront）のデプロイ

```sh
cdk deploy [--profile <プロファイル名>]
```

- AWS の認証情報にリージョン情報が含まれている場合、そのリージョンにデプロイされます。
- CLI の config ファイルでプロファイルの設定をしている人は、コマンド実行時に[--profile <プロファイル名>] を指定してください。

## LP asset のデプロイ

- 以下のコマンドでデプロイできます。

```sh
# S3 へデプロイ
aws s3 sync landing-page/ s3://make-it-production-web-hosting  --delete --profile <profile_name>

# CloudFront キャッシュの無効化
aws cloudfront create-invalidation --distribution-id EPZOEXHEXR06D --paths "/*" --profile <profile_name>
```
