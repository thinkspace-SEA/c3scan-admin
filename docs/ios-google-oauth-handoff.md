# 📦 c3scan iOS + Google OAuth Configuration Summary (Pre-Apple Approval)

## 1️⃣ iOS App Identity

| Item | Value |
| ------------- | ------------------------ |
| Bundle ID | `io.c3scanio.app` |
| App Name | c3scan |
| Apple Team ID | ⏳ Pending Apple approval |
| App Store ID | Not published |

⚠️ **Note:** Google OAuth client cannot be finalized until Apple Team ID is available.

---

## 2️⃣ Google OAuth Configuration (iOS Client)

**Client ID**
```
519376782224-lugpguv1uqk5lk84h3988o79kbiea4pk.apps.googleusercontent.com
```

**iOS URL Scheme**
```
com.googleusercontent.apps.519376782224-lugpguv1uqk5lk84h3988o79kbiea4pk
```

### Required in Xcode

In:
```
Target → Info → URL Types
```

Add URL Scheme:
```
com.googleusercontent.apps.519376782224-lugpguv1uqk5lk84h3988o79kbiea4pk
```

---

## 3️⃣ Supabase Configuration

Supabase should be configured to use:
* Google OAuth Provider enabled
* iOS Client ID (this one)
* Web Client ID (if needed for fallback)

Redirect URL should match:
```
com.googleusercontent.apps.<client-id>:/oauth2redirect
```

We will confirm this after Apple approval.

---

## 4️⃣ Current State

**What is complete:**
* Correct Bundle ID updated in Google Console (`io.c3scanio.app`)
* iOS OAuth client exists
* URL scheme available
* Supabase Google provider configured

**What is pending:**
* Apple Team ID
* Saving iOS client with Team ID
* Downloading updated plist
* Verifying REVERSED_CLIENT_ID
* Final end-to-end device test

---

## 5️⃣ What Ava Can Work On Now

While waiting for Apple:

### 🔐 Auth Architecture
* Operator-scoped JWT claims
* Tenancy isolation enforcement
* RLS validation tests
* Token structure validation

### 📍 Geofencing
* Store `latitude` and `longitude` as separate `decimal(9,6)` fields in `c3scan.location`
* Add configurable radius (meters + miles)
* Support override for dev testing (e.g., 6-mile login allowance)

### 🧱 WebAPI Layer
* Finalize v1 OpenAPI contract
* Validate auth middleware logic
* Enforce operator isolation
* Confirm authorized_member role (no portal)

### 📦 Compliance Model
* OCR confidence scoring
* Node-level accountability logging
* Grace period fixed at 30 days
* Request types simplified to:
  * `forward_mail`
  * `open_scan`

---

## 📌 When Apple Approves

**Immediate Steps:**

1. Retrieve Apple Team ID (10-character string)
2. Enter into Google OAuth iOS client
3. Click Save
4. Download plist
5. Replace or update:
   * REVERSED_CLIENT_ID
   * URL Scheme in Xcode
6. Clean build
7. Test Google login on physical device

**Total time once approved:** ~15 minutes.

---

## 🧠 Final Direction

**For Ava:** Continue development assuming:

* Bundle ID = `io.c3scanio.app`
* Google iOS client ID = `519376782224-lugpguv1uqk5lk84h3988o79kbiea4pk.apps.googleusercontent.com`
* Apple Team ID will be injected later
* OAuth redirect flow should be modular and swappable

**Do not hardcode Team ID assumptions.**
