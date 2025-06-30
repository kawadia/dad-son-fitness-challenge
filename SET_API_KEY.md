# Setting up Claude API Key for Firebase Functions

To securely store your Claude API key for the Firebase Function:

## 1. Set Firebase Secret
```bash
cd /Users/kawadia/family-fitness-challenge
firebase functions:secrets:set CLAUDE_API_KEY
```

When prompted, enter your Claude API key.

## 2. Deploy Functions
```bash
firebase deploy --only functions
```

## 3. Update Function URL (after first deploy)
After first deployment, get the actual function URL:
```bash
firebase functions:list
```

Then update the FUNCTION_URL in `src/services/motivationService.ts` with the real deployed URL.

## 4. Remove Local API Key
You can now remove the REACT_APP_CLAUDE_API_KEY from your `.env` file since the API calls go through the secure Firebase Function.

## How it works:
- React app calls Firebase Function (no API key needed)
- Firebase Function securely calls Claude API using stored secret
- API key never exposed to browser/client code
- Still has fallback quotes if function fails

This keeps your API key completely secure!