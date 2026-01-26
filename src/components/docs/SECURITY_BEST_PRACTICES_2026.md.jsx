# INTeract Security & Compliance Guide
**Version:** 2.0  
**Last Updated:** January 26, 2026  
**Compliance:** WCAG 2.1 AA, GDPR Ready, SOC 2 Aligned

---

## 🔐 Authentication & Authorization

### Authentication System
```javascript
// Base44 Built-in Auth
- Session-based with JWT tokens
- 8-hour session timeout (configurable)
- Automatic token refresh
- SSO Ready: Azure AD, Google Workspace, Okta

// Implementation
import { base44 } from '@/api/base44Client';

// Check auth status
const isAuthenticated = await base44.auth.isAuthenticated();

// Get current user
const user = await base44.auth.me();
// Returns: { id, email, full_name, role, user_type }

// Update user profile
await base44.auth.updateMe({ preferences: {...} });

// Logout with redirect
base44.auth.logout('/login');

// Protected route pattern
const { user, loading } = useUserData(requireAuth: true);

if (loading) return <LoadingSpinner />;
if (!user) return null;  // Redirects to login

return <DashboardContent user={user} />;
```

### Role-Based Access Control (RBAC)

#### Role Hierarchy
```javascript
1. Admin (role: 'admin')
   - Full platform access
   - User management (invite, delete, modify roles)
   - Gamification configuration
   - Content moderation
   - Analytics access
   - Integration management

2. Facilitator (user_type: 'facilitator')
   - Event/activity management
   - Team leader features
   - Participant engagement tools
   - Analytics (team-level)
   - Content moderation (own content)

3. Participant (user_type: 'participant')
   - Join events, earn points
   - Send/receive recognition
   - Team participation
   - Profile management
   - Store purchases
```

#### Permission Checking
```javascript
// Hook-based permissions
import { usePermissions } from '@/components/hooks/usePermissions';

function EventCard({ event }) {
  const { canEdit, canDelete, isAdmin, isFacilitator } = usePermissions();
  
  const canModify = isAdmin || 
                    isFacilitator || 
                    event.created_by === user.email;
  
  return (
    <Card>
      <EventDetails event={event} />
      {canModify && (
        <EditButton onClick={() => editEvent(event)} />
      )}
      {isAdmin && (
        <DeleteButton onClick={() => deleteEvent(event.id)} />
      )}
    </Card>
  );
}

// Entity-level permissions (JSON schema)
{
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "created_by": "{{user.email}}" },
          { "role": "admin" },
          { "visibility": "public" }
        ]
      }
    },
    "write": {
      "rules": {
        "$or": [
          { "created_by": "{{user.email}}" },
          { "role": "admin" }
        ]
      }
    },
    "delete": {
      "rules": { "role": "admin" }
    }
  }
}
```

### Backend Function Authorization
```javascript
// All backend functions MUST validate auth
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // 1. Authenticate user
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Check admin-only operations
  if (requiresAdmin && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 3. Validate ownership
  const resource = await base44.entities.Resource.get(resourceId);
  
  if (resource.created_by !== user.email && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Proceed with operation
  return Response.json({ success: true });
});
```

---

## 🔒 Data Privacy & PII Protection

### Sensitive Data Handling
```javascript
// UserProfile entity - PII protection
{
  "name": "UserProfile",
  "properties": {
    "user_email": { "type": "string" },
    "full_name": { "type": "string" },
    "bio": { "type": "string" },
    "salary": { 
      "type": "number",
      "description": "PROTECTED: Only visible to HR/Admin"
    },
    "ssn": {
      "type": "string",
      "description": "PROTECTED: Only visible to HR/Admin"
    }
  },
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "user_email": "{{user.email}}" },
          { "role": "admin" },
          { "manager_email": "{{user.email}}" }
        ]
      }
    }
  }
}

// Frontend filtering
function UserProfileCard({ profile, currentUser }) {
  const isOwner = profile.user_email === currentUser.email;
  const isAdmin = currentUser.role === 'admin';
  
  return (
    <Card>
      <p>{profile.full_name}</p>
      <p>{profile.bio}</p>
      
      {/* PII only visible to owner or admin */}
      {(isOwner || isAdmin) && (
        <>
          <p>Email: {profile.user_email}</p>
          <p>Phone: {profile.phone}</p>
        </>
      )}
      
      {/* Salary only visible to admin */}
      {isAdmin && (
        <p>Salary: ${profile.salary}</p>
      )}
    </Card>
  );
}
```

### Survey Anonymization
```javascript
// Survey responses are anonymized by default
{
  "name": "SurveyResponse",
  "properties": {
    "survey_id": { "type": "string" },
    "responses": { "type": "object" },
    "submitted_at": { "type": "string", "format": "date-time" },
    "anonymous": { "type": "boolean", "default": true }
  },
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { 
            "role": "admin",
            "$expr": "survey.response_count >= 5"  // Min 5 responses
          },
          { "user_email": "{{user.email}}", "anonymous": false }
        ]
      }
    }
  }
}

// Aggregation-only view for admins
async function getSurveyResults(surveyId) {
  const responses = await base44.entities.SurveyResponse.filter({ survey_id: surveyId });
  
  if (responses.length < 5) {
    throw new Error('Insufficient responses for anonymization (min 5 required)');
  }
  
  // Return aggregated data only
  return {
    total_responses: responses.length,
    average_rating: calculateAverage(responses, 'rating'),
    sentiment_distribution: calculateDistribution(responses, 'sentiment'),
    // NO individual responses included
  };
}
```

### Recognition Visibility Controls
```javascript
{
  "name": "Recognition",
  "properties": {
    "sender_email": { "type": "string" },
    "recipient_email": { "type": "string" },
    "message": { "type": "string" },
    "visibility": {
      "type": "string",
      "enum": ["public", "private", "team_only"],
      "default": "public"
    }
  },
  "permissions": {
    "read": {
      "rules": {
        "$or": [
          { "visibility": "public" },
          { "sender_email": "{{user.email}}" },
          { "recipient_email": "{{user.email}}" },
          { "role": "admin" },
          {
            "visibility": "team_only",
            "$expr": "user.team_id == recognition.team_id"
          }
        ]
      }
    }
  }
}
```

---

## 🛡️ Input Validation & Sanitization

### File Upload Security
```javascript
// Validation rules
const FILE_UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024,  // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
};

// Validation function
function validateFile(file) {
  // Check size
  if (file.size > FILE_UPLOAD_CONFIG.maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }
  
  // Check MIME type
  if (!FILE_UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  
  // Check extension
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!FILE_UPLOAD_CONFIG.allowedExtensions.includes(ext)) {
    throw new Error('File extension not allowed');
  }
  
  return true;
}

// Upload with validation
async function uploadProfilePicture(file) {
  try {
    validateFile(file);
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    // Update user profile
    await base44.entities.UserProfile.update(profileId, {
      profile_picture_url: file_url
    });
    
    return file_url;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
}
```

### Form Input Validation
```javascript
// Zod schema validation
import { z } from 'zod';

const recognitionSchema = z.object({
  recipient_email: z.string().email('Invalid email address'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must not exceed 500 characters'),
  points_awarded: z.number()
    .int('Points must be a whole number')
    .min(0, 'Points cannot be negative')
    .max(100, 'Cannot award more than 100 points'),
  recognition_type: z.enum([
    'peer_shoutout',
    'thank_you',
    'great_work',
    'team_player'
  ])
});

// Form validation
const handleSubmit = async (data) => {
  try {
    const validated = recognitionSchema.parse(data);
    
    await base44.entities.Recognition.create(validated);
    
    toast.success('Recognition sent!');
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        toast.error(err.message);
      });
    }
  }
};

// React Hook Form integration
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(recognitionSchema)
});
```

### XSS Prevention
```javascript
// React auto-escapes by default
<div>{userInput}</div>  // ✅ Safe

// Dangerous: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // ❌ Dangerous

// If you must render HTML, sanitize first
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: sanitized }} />  // ✅ Safe

// Better: Use markdown rendering
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{userInput}</ReactMarkdown>  // ✅ Safe
```

---

## 🔑 API Security

### Rate Limiting
```javascript
// Backend function with rate limiting
import { RateLimiter } from 'npm:rate-limiter-flexible';

const rateLimiter = new RateLimiter({
  points: 10,        // 10 requests
  duration: 60,      // per 60 seconds
  blockDuration: 60  // block for 60 seconds if exceeded
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await rateLimiter.consume(user.email);
    
    // Process request
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ 
      error: 'Too many requests. Please try again later.' 
    }, { status: 429 });
  }
});
```

### CORS Configuration
```javascript
// Base44 handles CORS automatically
// For custom headers in backend functions:

Deno.serve(async (req) => {
  // ... function logic
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://your-app.base44.app',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
});
```

### Webhook Validation
```javascript
// Stripe webhook signature verification
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // CRITICAL: Set token before signature validation
  // (Deno crypto is async, requires auth context)
  await base44.auth.me();
  
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
  let event;
  
  try {
    // Use ASYNC verification
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  // Process verified webhook
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    // ... other events
  }
  
  return Response.json({ received: true });
});
```

---

## 🔐 Secrets Management

### Environment Variables
```javascript
// Backend functions access secrets via Deno.env
const openaiKey = Deno.env.get('OPENAI_API_KEY');
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

// Never expose secrets in frontend
// ❌ WRONG
const apiKey = process.env.OPENAI_API_KEY;
<div>API Key: {apiKey}</div>

// ✅ CORRECT
// Use backend functions to call APIs with secrets
const response = await base44.functions.invoke('openaiIntegration', {
  action: 'chat',
  prompt: userInput
});
```

### Secrets Best Practices
```markdown
1. **Never commit secrets to Git**
   - Add .env to .gitignore
   - Use Base44 dashboard to set secrets
   - Rotate secrets regularly

2. **Use different secrets per environment**
   - Dev: Test/sandbox keys
   - Production: Live keys
   
3. **Minimum privilege principle**
   - Grant only necessary permissions
   - Use read-only keys where possible
   
4. **Secret rotation**
   - Rotate every 90 days
   - Immediate rotation on suspected breach
   
5. **Audit secret usage**
   - Log when secrets are accessed
   - Monitor for unusual patterns
```

---

## 🛡️ Content Moderation

### AI-Powered Moderation
```javascript
// Recognition AI moderation
async function createRecognition(data) {
  // Step 1: AI content check
  const moderation = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze this recognition message for inappropriate content:
    
    "${data.message}"
    
    Check for:
    - Profanity or offensive language
    - Harassment or bullying
    - Discriminatory content
    - Spam or promotional content
    
    Return JSON with:
    - is_appropriate: boolean
    - flagged_categories: array of strings
    - confidence: number (0-1)`,
    response_json_schema: {
      type: "object",
      properties: {
        is_appropriate: { type: "boolean" },
        flagged_categories: { type: "array", items: { type: "string" } },
        confidence: { type: "number" }
      }
    }
  });
  
  // Step 2: Auto-reject if high confidence inappropriate
  if (!moderation.is_appropriate && moderation.confidence > 0.8) {
    throw new Error('Content violates community guidelines');
  }
  
  // Step 3: Flag for manual review if medium confidence
  const moderation_status = moderation.confidence > 0.8 ? 'auto_approved' :
                            moderation.confidence > 0.5 ? 'pending_review' :
                            'approved';
  
  // Step 4: Create recognition with moderation status
  return await base44.entities.Recognition.create({
    ...data,
    moderation_status,
    ai_moderation_score: moderation.confidence,
    flagged_categories: moderation.flagged_categories
  });
}
```

### Manual Moderation Queue
```javascript
// Admin moderation interface
function ModerationQueue() {
  const { data: flagged } = useQuery({
    queryKey: ['flaggedContent'],
    queryFn: () => base44.entities.Recognition.filter({
      moderation_status: 'pending_review'
    })
  });
  
  const approveMutation = useMutation({
    mutationFn: (id) => base44.entities.Recognition.update(id, {
      moderation_status: 'approved'
    })
  });
  
  const rejectMutation = useMutation({
    mutationFn: (id) => base44.entities.Recognition.update(id, {
      moderation_status: 'rejected',
      visibility: 'private'
    })
  });
  
  return (
    <div>
      <h2>Moderation Queue ({flagged?.length})</h2>
      {flagged?.map(item => (
        <Card key={item.id}>
          <p>{item.message}</p>
          <p>Flagged: {item.flagged_categories?.join(', ')}</p>
          <Button onClick={() => approveMutation.mutate(item.id)}>
            Approve
          </Button>
          <Button onClick={() => rejectMutation.mutate(item.id)}>
            Reject
          </Button>
        </Card>
      ))}
    </div>
  );
}
```

---

## ✅ Security Checklist

### Pre-Launch Security Audit
```markdown
- [ ] All API endpoints require authentication
- [ ] RBAC implemented and tested
- [ ] File uploads validated (size, type, extension)
- [ ] Input validation on all forms
- [ ] XSS prevention via React escaping
- [ ] SQL injection N/A (NoSQL database)
- [ ] Secrets stored in environment variables
- [ ] No secrets committed to Git
- [ ] Rate limiting on sensitive endpoints
- [ ] CORS configured correctly
- [ ] Webhook signatures validated
- [ ] Session timeout configured (8 hours)
- [ ] HTTPS enforced (Base44 default)
- [ ] Content Security Policy headers set
- [ ] Audit logging for sensitive operations
- [ ] Error messages don't expose sensitive info
- [ ] PII properly protected
- [ ] Survey anonymization enforced
- [ ] AI moderation active on user-generated content
- [ ] Admin actions logged to audit trail
- [ ] Regular security dependency updates
```

### Ongoing Security Practices
```markdown
1. **Monthly**
   - Review audit logs for suspicious activity
   - Update dependencies (npm audit fix)
   - Rotate API keys and secrets
   
2. **Quarterly**
   - Security penetration testing
   - Review and update RLS rules
   - Audit user permissions
   
3. **Annually**
   - External security audit
   - SOC 2 compliance review
   - GDPR compliance verification
```

---

**Last Updated:** January 26, 2026  
**Next Review:** April 2026