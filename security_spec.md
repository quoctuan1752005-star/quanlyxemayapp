# Firebase Security Specification (Vehicle Management App)

## 1. Data Invariants
- Only authenticated users can access the application.
- Users can be of two roles: `admin` or `user`.
- Users with the `admin` role have full read/write privileges to all entities.
- Users with the `user` role can only:
  - Read profiles in `/users/{userId}` where `{userId}` equals their own UID.
  - Read vehicles assigned to them (stored in `/vehicles/{vehicleId}` where `resource.data.assignedTo == request.auth.uid`).
  - Read, create daily/monthly logs on their assigned vehicles.
  - Request edits to daily/monthly logs via `/requests`.
  - Read notifications targeted to them.
- Operations on logs cannot decrease the odometer or hours.
- Updates to user fields `role` cannot be performed by regular users to prevent privilege escalation.

## 2. The "Dirty Dozen" Payloads (Exploits to Block)
1. **Self-Promote to Admin**: A user trying to set their own role to 'admin' in `/users/{uid}`.
2. **Access Other Vehicle Logs**: User trying to read daily logs of a vehicle they are not assigned to.
3. **Write Log to Other Vehicle**: User attempting to write a daily log to `/vehicles/OTHER_PLATE/daily_logs/LOG_ID`.
4. **Skip Verification Logs**: User attempting to create a log with incorrect/shadow fields to bypass validation.
5. **Directly Edit Logs**: Regular user attempting to edit a monthly log after it's been finalized, rather than filing a request.
6. **Malicious Path Injection**: Attempting to poison a document ID with huge strings or illegal characters.
7. **Read Other User PII**: User trying to get private profile details of other users.
8. **Approve Own Request**: User creating a request already in `status = 'approved'` to bypass admin approval.
9. **Delete Audit Logs**: User attempting to clear `/activity_logs`.
10. **Admin Settings Tampering**: User trying to write to general `/settings`.
11. **Spoofed Creation Timestamp**: User submitting an arbitrary `createdAt` timestamp instead of `request.time`.
12. **Quota Exhaustion String Injection**: Submitting a huge string payload to exhaust firestore document size limits.

## 3. Test Cases (Verification Logic)
All unauthorized cases must return `PERMISSION_DENIED` under the rules.
We will create and validate rules in `firestore.rules`.
