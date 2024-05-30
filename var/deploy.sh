#!/bin/sh

#!/bin/sh

AWS_PROFILE="undp-eview-s3"
AWS_REGION="eu-west-1"

APP_NAME="hybrid-app"
APP_CONFIG="dev"
S3_NAME="dev-cndhrci-ewer.unicc.biz"
CLOUD_FRONT_DISTRIBUTION="E2NB6B671QPQHT"


ng build $APP_NAME -c=dev &&
  cd dist/apps/$APP_NAME/ &&
  aws s3 sync . s3://$S3_NAME --profile=$AWS_PROFILE --acl=public-read &&
  aws cloudfront create-invalidation --distribution-id $CLOUD_FRONT_DISTRIBUTION --paths "/*" --profile=$AWS_PROFILE &&
  cd ../../..
