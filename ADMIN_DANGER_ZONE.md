# Admin Danger Zone Implementation

## What Changed

### Replaced
- ❌ **System Settings** section (Maintenance Mode, Email Notifications) - removed as no longer needed

### Added  
✅ **Professional Danger Zone Section** with:

#### 1. Admin Account Information Display
- **Email** - Admin's email address
- **Full Name** - Admin's name from profile
- **Admin Since** - Date when admin account was created (formatted)
- **Account ID** - Admin's unique UUID identifier

#### 2. Password Management
- **Change Password Button** - Opens secure password change dialog
- **Current Password Field** - With show/hide toggle
- **New Password Field** - With show/hide toggle (min 6 characters)
- **Confirm Password Field** - With show/hide toggle
- **Real-time Validation** - Shows clear error messages for:
  - Empty fields
  - Mismatched passwords
  - Weak passwords (< 6 chars)
  - Same password as current
  - Incorrect current password

#### 3. Security Features
- **Show/Hide Toggles** - For each password field
- **Error Messages** - Real-time inline validation
- **Red Danger Zone Design** - Visual warning that this is sensitive
- **Loading State** - Shows spinner during password change
- **Clear Feedback** - Success/error toasts after operation

## File Changes

### Created
- `src/components/admin/AdminDangerZone.tsx` - New professional component

### Modified  
- `src/pages/AdminDashboard.tsx` - Import AdminDangerZone and replace System Settings

## How It Works

### Admin Account Info Display
1. Component fetches on mount
2. Queries `admins` table for email and created_at
3. Queries `profiles` table for full_name
4. Displays all info in formatted grid

### Password Change Flow
1. Admin clicks "Change Password"
2. Dialog opens with 3 password fields
3. Fields have show/hide toggles
4. Validation runs on each change
5. On submit:
   - Validates all fields
   - Calls Supabase `updateUser()` with new password
   - Shows success/error toast
   - Clears form and closes dialog

## Testing

### Test Password Change
1. Go to Admin Dashboard → Settings
2. Scroll to "Danger Zone" section
3. See admin account info displayed
4. Click "Change Password"
5. Fill in password fields
6. Try invalid scenarios:
   - Empty fields → Should show errors
   - Non-matching passwords → Should show error
   - Password < 6 chars → Should show error
   - Same as current → Should show error
7. Enter valid new password
8. Click "Change Password"
9. Should see success toast and dialog close
10. Try logging out and back in with new password

## Security Considerations

✅ **No Password Exposure** - Passwords use type="password" by default
✅ **Show/Hide Toggles** - Optional visibility for user convenience
✅ **Real-time Validation** - Clear feedback before submission
✅ **Session-based** - Requires active admin session (can't change password if logged out)
✅ **Error Handling** - Graceful fallback with user-friendly messages
✅ **No SQL Injection** - Uses Supabase parameterized queries
✅ **RLS Enforced** - Admin table has RLS policies

## Database Schema Used

The component queries:
- `admins` table (id, email, created_at)
- `profiles` table (user_id, full_name)  
- Uses Supabase `auth.users` for password update

No database migrations needed - uses existing tables.

## Styling

- **Red themed** - Uses red-500/red-600 colors for Danger Zone
- **Professional** - Follows existing admin dashboard design
- **Responsive** - Works on mobile and desktop
- **Dark mode compatible** - Uses CSS classes from existing theme
