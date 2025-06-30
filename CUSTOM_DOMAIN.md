# Custom Domain Setup for Firebase Hosting

## Step-by-Step Guide

### 1. Purchase a Domain
Popular registrars:
- **Google Domains** (easy Firebase integration)
- **Namecheap** (affordable)
- **Cloudflare** (advanced features)
- **GoDaddy** (popular)

### 2. Add Domain in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dad-v-son-fitness-challenge`
3. Navigate to **Hosting** → **Add custom domain**
4. Enter your domain (e.g., `dadsonchallenge.com`)

### 3. Verify Domain Ownership
Firebase will ask you to add a TXT record to prove ownership:
```
Type: TXT
Name: @
Value: [provided by Firebase]
```

### 4. Configure DNS Records
Add these records to your domain registrar:

**For apex domain (dadsonchallenge.com):**
```
Type: A
Name: @
Value: 151.101.1.195
Value: 151.101.65.195
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: dad-v-son-fitness-challenge.web.app
```

### 5. Wait for SSL Certificate
- Firebase automatically provisions SSL certificates
- This can take up to 24 hours
- Your site will be available at `https://yourdomain.com`

## Domain Name Suggestions

### Short & Memorable:
- `fitchallenge.app`
- `dadsonfit.com`
- `workoutduo.com`
- `fitnessrace.app`

### Descriptive:
- `dadsonchallenge.com`
- `familyfitnessrace.com`
- `workoutcompetition.app`
- `dailyfitnessgoal.com`

## Benefits of Custom Domain

✅ **Professional** - Easier to remember and share
✅ **Branding** - Your own identity
✅ **SEO** - Better search engine optimization
✅ **SSL** - Free HTTPS certificate
✅ **No Firebase branding** - Clean, custom URLs

## Cost
- **Domain**: $10-15/year (varies by TLD)
- **Firebase Hosting**: Free for most usage levels
- **SSL Certificate**: Free (included with Firebase)