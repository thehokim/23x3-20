# API Usage Examples

## Contact Forms API Examples

### 1. Create Contact Form (POST)

```bash
curl -X POST http://localhost:3000/api/contact-forms \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1 234 567 8900",
    "position": "Clinic Owner",
    "city": "New York",
    "province": "NY",
    "country": "USA",
    "message": "I would like to know more about your products",
    "contactDays": "Mon-Fri, 9AM-5PM",
    "privacyAccepted": true,
    "newsletterConsent": true
  }'
```

### 2. Get All Contact Forms (GET)

```bash
# Get first page (10 items)
curl http://localhost:3000/api/contact-forms

# With filters and pagination
curl "http://localhost:3000/api/contact-forms?page=1&limit=20&status=new&position=Clinic%20Owner&sortBy=createdAt&order=desc"
```

### 3. Get Single Contact Form (GET)

```bash
curl http://localhost:3000/api/contact-forms/507f1f77bcf86cd799439011
```

### 4. Update Contact Form (PUT)

```bash
curl -X PUT http://localhost:3000/api/contact-forms/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "notes": "Called customer, waiting for response"
  }'
```

### 5. Delete Contact Form (DELETE)

```bash
curl -X DELETE http://localhost:3000/api/contact-forms/507f1f77bcf86cd799439011
```

### 6. Get Contact Forms Statistics (GET)

```bash
curl http://localhost:3000/api/contact-forms/stats/overview
```

---

## Application Forms API Examples

### 1. Create Application Form with CV (POST - multipart/form-data)

```bash
curl -X POST http://localhost:3000/api/application-forms \
  -F "firstName=Jane" \
  -F "lastName=Smith" \
  -F "email=jane.smith@example.com" \
  -F "phone=+1 234 567 8901" \
  -F "applicationPosition=Implantologists Speakers" \
  -F "contactHours=2PM-6PM" \
  -F "message=I am very interested in this position" \
  -F "privacyAccepted=true" \
  -F "cv=@/path/to/cv.pdf"
```

### 2. Get All Application Forms (GET)

```bash
# Get first page
curl http://localhost:3000/api/application-forms

# With filters
curl "http://localhost:3000/api/application-forms?page=1&limit=10&status=new&applicationPosition=Implantologists%20Speakers"
```

### 3. Get Single Application Form (GET)

```bash
curl http://localhost:3000/api/application-forms/507f1f77bcf86cd799439012
```

### 4. Update Application Form (PUT)

```bash
curl -X PUT http://localhost:3000/api/application-forms/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shortlisted",
    "notes": "Great candidate, schedule interview"
  }'
```

### 5. Download CV File (GET)

```bash
curl http://localhost:3000/api/application-forms/507f1f77bcf86cd799439012/download-cv \
  --output cv.pdf
```

### 6. Get Application Forms Statistics (GET)

```bash
curl http://localhost:3000/api/application-forms/stats/overview
```

