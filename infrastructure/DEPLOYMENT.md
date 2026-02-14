# Cognito Infrastructure Deployment Guide

## Prerequisites

- AWS CLI configured with appropriate credentials
- Google OAuth Client ID and Secret (for fallback auth)
- Yardi OIDC configuration (when available)

## Deployment Steps

### 1. Deploy CloudFormation Stack

```bash
# Set your environment
ENVIRONMENT=prod

# Deploy with required parameters
aws cloudformation create-stack \
  --stack-name c3scan-cognito-$ENVIRONMENT \
  --template-file infrastructure/cognito-federated-idp.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
    ParameterKey=CognitoDomainPrefix,ParameterValue=c3scan-prod \
    ParameterKey=GoogleClientId,ParameterValue=YOUR_GOOGLE_CLIENT_ID \
    ParameterKey=GoogleClientSecret,ParameterValue=YOUR_GOOGLE_CLIENT_SECRET \
  --capabilities CAPABILITY_IAM \
  --tags Key=Project,Value=c3scan Key=Environment,Value=$ENVIRONMENT

# Monitor deployment
aws cloudformation wait stack-create-complete \
  --stack-name c3scan-cognito-$ENVIRONMENT

# Get outputs
aws cloudformation describe-stacks \
  --stack-name c3scan-cognito-$ENVIRONMENT \
  --query 'Stacks[0].Outputs'
```

### 2. Update Environment Variables

After deployment, add these to your `.env.local`:

```bash
# AWS Region
AWS_REGION=us-west-2

# Cognito (from CloudFormation outputs)
COGNITO_USER_POOL_ID=<UserPoolId from outputs>
COGNITO_CLIENT_ID=<WebClientId from outputs>
COGNITO_DOMAIN=<CognitoDomain from outputs>

# Optional: For server-side token validation
COGNITO_TOKEN_URL=<CognitoTokenUrl from outputs>
COGNITO_JWKS_URL=<CognitoJwksUrl from outputs>
```

### 3. Update Google OAuth Configuration

In Google Cloud Console:

1. Go to APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   ```
   https://<COGNITO_DOMAIN>/oauth2/idpresponse
   ```
   Example:
   ```
   https://c3scan-prod.auth.us-west-2.amazoncognito.com/oauth2/idpresponse
   ```

### 4. Add Yardi Identity Provider (When Available)

Once Yardi OIDC endpoints are confirmed, update the stack:

```bash
aws cloudformation update-stack \
  --stack-name c3scan-cognito-$ENVIRONMENT \
  --template-file infrastructure/cognito-federated-idp.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
    ParameterKey=CognitoDomainPrefix,ParameterValue=c3scan-prod \
    ParameterKey=GoogleClientId,ParameterValue=YOUR_GOOGLE_CLIENT_ID \
    ParameterKey=GoogleClientSecret,ParameterValue=YOUR_GOOGLE_CLIENT_SECRET \
    ParameterKey=YardiClientId,ParameterValue=ACTUAL_YARDI_CLIENT_ID \
    ParameterKey=YardiClientSecret,ParameterValue=ACTUAL_YARDI_CLIENT_SECRET \
    ParameterKey=YardiIssuerUrl,ParameterValue=https://thinkspace.yardikube.com \
  --capabilities CAPABILITY_IAM
```

Then update Yardi configuration to add the callback URL:
```
https://<COGNITO_DOMAIN>/oauth2/idpresponse
```

### 5. Test the Setup

1. **Hosted UI Test:**
   ```
   https://<COGNITO_DOMAIN>/oauth2/authorize?
     client_id=<CLIENT_ID>&
     response_type=code&
     scope=openid+email+profile&
     redirect_uri=https://c3scan.thinkspace.com/auth/callback&
     identity_provider=Google
   ```

2. **Verify JWT Structure:**
   After login, decode the ID token at jwt.io to verify custom attributes.

### 6. Update c3scan Application

Implement the API endpoints:
- `/api/auth/detect-provider` - Returns Cognito config
- `/api/auth/callback` - Handles OAuth callback
- `/api/auth/refresh` - Token refresh
- `/api/auth/logout` - Sign out

## Troubleshooting

### Stack Creation Fails

**Domain already exists:**
```
CognitoDomainPrefix must be globally unique
```
Solution: Change `CognitoDomainPrefix` parameter

**Invalid Google credentials:**
```
Invalid provider details
```
Solution: Verify Google Client ID and Secret

### Users Can't Sign In

**Check CloudWatch Logs:**
```bash
aws logs tail /aws/lambda/c3scan-prod-pre-signup --follow
```

**Verify Callback URLs:**
Ensure callback URLs in Cognito match your application exactly (including protocol).

**Test JWKS Endpoint:**
```bash
curl https://cognito-idp.<region>.amazonaws.com/<user-pool-id>/.well-known/jwks.json
```

## Security Checklist

- [ ] Cognito domain is unique and not guessable
- [ ] Google OAuth credentials stored securely (not in code)
- [ ] Yardi credentials stored securely
- [ ] Callback URLs use HTTPS in production
- [ ] Lambda functions have minimal IAM permissions
- [ ] CloudWatch Logs retention is configured
- [ ] MFA enabled for sensitive operations (optional)

## Cost Considerations

- Cognito User Pool: Free tier includes 50,000 MAUs
- Beyond free tier: ~$0.0055 per MAU
- Lambda invocations: Negligible for auth flows
- CloudWatch Logs: Minimal for auth events

## Next Steps

1. Deploy this infrastructure
2. Implement `/api/auth/detect-provider`
3. Implement `/api/auth/callback`
4. Add Yardi IdP when ready
5. Test end-to-end flow
