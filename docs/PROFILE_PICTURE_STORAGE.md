# Profile Picture Storage - Technical Limitation

## Issue
Firebase Firestore has a **1MB (1,048,487 bytes) limit per field**. When storing Base64-encoded images directly in the `photoUrl` field, larger images exceed this limit and cause the error:

```
FirebaseError: The value of property "photoUrl" is longer than 1048487 bytes.
```

## Current Implementation
The app currently converts selected profile pictures to Base64 strings and stores them directly in Firestore user documents. This approach works for small images but fails for:
- High-resolution photos
- Uncompressed images
- Images from modern cameras/phones

## Recommended Solution: Cloud Storage Integration

### Option 1: Firebase Storage (Recommended)
**Pros:**
- Native integration with Firebase ecosystem
- Built-in security rules
- CDN delivery
- Free tier: 5GB storage, 1GB/day download

**Implementation Steps:**
1. Install Firebase Storage SDK
2. Upload image to Storage bucket
3. Get download URL
4. Store URL (not Base64) in Firestore
5. Add cleanup logic for old images

**Code Example:**
```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadProfilePicture = async (uri, userId) => {
  const storage = getStorage();
  const response = await fetch(uri);
  const blob = await response.blob();
  
  const storageRef = ref(storage, `profile_pictures/${userId}.jpg`);
  await uploadBytes(storageRef, blob);
  
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL; // Store this in Firestore
};
```

### Option 2: Cloudinary
**Pros:**
- Advanced image transformations (resize, crop, optimize)
- Automatic format conversion (WebP, AVIF)
- Free tier: 25GB storage, 25GB bandwidth/month
- Better performance for image-heavy apps

**Implementation Steps:**
1. Sign up for Cloudinary account
2. Install `cloudinary-react-native` or use REST API
3. Upload image via API
4. Store returned URL in Firestore

**Code Example:**
```javascript
const uploadToCloudinary = async (uri) => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'profile.jpg',
  });
  formData.append('upload_preset', 'your_preset'); // Configure in Cloudinary dashboard
  
  const response = await fetch(
    'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
    {
      method: 'POST',
      body: formData,
    }
  );
  
  const data = await response.json();
  return data.secure_url; // Store this in Firestore
};
```

## Temporary Workaround
For immediate relief, compress images before Base64 encoding:

```javascript
import * as ImageManipulator from 'expo-image-manipulator';

const compressImage = async (uri) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 400 } }], // Resize to max 400px width
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
};
```

## Recommendation
**Use Firebase Storage** for this project because:
1. Already using Firebase for auth and Firestore
2. Simpler setup and maintenance
3. Better security integration
4. Sufficient for profile pictures

Implement Cloudinary only if you need:
- Advanced image transformations
- Multiple image sizes/formats
- Higher performance requirements

## Priority
**Medium** - Current Base64 approach works for small images. Implement cloud storage when:
- Users report upload failures
- App scales to more users
- Adding more image features (galleries, posts, etc.)

## Estimated Implementation Time
- Firebase Storage: 2-3 hours
- Cloudinary: 3-4 hours (including account setup and configuration)
