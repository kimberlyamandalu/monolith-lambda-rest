# CloudGTO Application

## Purpose

Serverless development can be difficult even for experts. You've just skipped ahead hundreds of hours by utilizing CloudGTO 🍻

## Getting Started

1. Install AWS CLI and Serverless Framework CLI

    ```bash
    brew install awscli
    npm install -g serverless@latest
    ```

2. Update `CloudGTO.yml` with real values, if using existing resources e.g. `Cognito User Pool Arn` if you selected “Existing Cognito” in the CloudGTO UI

3. Install/Format/Deploy - `npm run setup`

4. Test Locally 

    ```bash
    npm run test
    ```

    ```bash
    sls [service-name]:invoke local -f [function-name] -p ./events/[test-name].json
    ```

5. Test E2E (end-to-end) - open Postman / Insomnia and paste APIGW URL

    ```bash
    # POST /dev/items - https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/dev/accounts
    # GET /dev/items/:id - https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/dev/accounts/1234
    ```

6. Add `x-api-key` header by running the following command and test:

    ```bash
    npm run getAPIKey
    # example output
    8sfzw2sA3EZP8OiYLJhk2QHSHbmMnuY1x0FKzj82
    ```

7. Add `Authorization` header with JWT ID Token from Cognito User Pool

    ```bash
    npm run getJWT
    ```

8. You now have a working CRUD API, add your own custom code to the service and redeploy, then repeat steps above

    ```bash
    sls deploy
    ```

## Other Commands

* Setup (Install/Format/Deploy) - `npm run setup`

* Install - `npm install`

* Deploy Resources and Services (serverless-compose.yml helps deploy ordering) - `sls deploy --stage dev --region us-west-2`

* Test Locally - `sls [service-name]:invoke local -f [function-name] -p [path-to-file-with-json-event]` or `sls [service-name]:invoke -f <> --data '{}'`

* Pull Last Lambda Log - `sls [service-name]:logs -f [function-name]` or `sls logs -f [function-name] -t` (`-t` will stream logs to terminal)

* Get API Key - `aws apigateway get-api-keys --name-query [service_name]-api-dev-api-key --include-values --query 'items[0].value' --output text`

* Get JWT Token if using Cognito - `npm run auth dev us-west-2 signup && npm run auth dev us-west-2 signin`

* Print serverless.yml - `sls [service-name]:print --stage dev --region us-west-2`

* Package Lambdas locally (testing final package size) - `sls [service-name]:package --stage dev --region us-west-2`

## Folder Structure

```bash
services/
    [service-name]/                   <-- individual serverless service
        src/
            handlers/                 <-- stores lambda business logic files
                <function>.js         <-- each Lambda function has its own handler file
                ...                   
            helpers/
                <helper.js>           <-- files to speed up dev e.g. dynamodb
        serverless.yml
events/
    <function.json>       <-- lambda invoke JSON event for unit / local testing
tests/
    unit/
        /handlers
            <function.test>.js    <-- unit tests for lambda functions 
        /helpers
            <helper.test>.js    <-- unit tests for helpers   
resources/
    api/                              <-- shared API GW
        serverless.yml
    cognito/                          <-- shared Cognito User Pool
        serverless.yml
    dynamodb/
        serverless.yml                <-- DynamoDB tables
    ...

scripts/
    auth.bash                         <-- handles getting JWT for testing cognito secured APIs

cloudgto.yml                          <-- stores default values across serverless.yml files and existing resource values

webpack.config.js                     <-- used by serverless-webpack plugin for optimizing Lambda packages

.eslintrc.js                          <-- linting config via ESLint
.prettierrc                           <-- formatting config via Prettier
.gitignore                            <-- ignore certain files from source control
package.json                          <-- define node packages used by Lambdas and helper scripts
README.md                             <-- project documentation and commands for test, deploy, install, etc
```

## Questions?

Contact us [support@cloudgto.com](mailto:support@cloudgto.com).