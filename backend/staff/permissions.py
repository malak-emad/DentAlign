from rest_framework.permissions import BasePermission

class IsDoctorOrStaff(BasePermission):
    """
    Permission class that allows only doctors and staff members
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user has a role
        if not hasattr(request.user, 'role') or not request.user.role:
            return False
        
        # Allow doctors and certain staff roles
        allowed_roles = ['Doctor', 'Nurse', 'Dental Assistant']
        return request.user.role.name in allowed_roles


class IsDoctorOnly(BasePermission):
    """
    Permission class that allows only doctors
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user has doctor role
        if not hasattr(request.user, 'role') or not request.user.role:
            return False
        
        return request.user.role.name == 'Doctor'