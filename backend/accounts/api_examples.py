# Different ways to create API endpoints

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Role, User
from .serializers import RoleSerializer, UserSerializer


# 1. FUNCTION-BASED VIEWS (Most Control)
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def user_list_create(request):
    """
    GET: List all users
    POST: Create new user
    """
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, user_id):
    """
    GET: Get specific user
    PUT: Update user
    DELETE: Delete user
    """
    user = get_object_or_404(User, user_id=user_id)
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# 2. VIEWSETS (Less Code, More Magic)
class UserViewSet(viewsets.ModelViewSet):
    """
    Automatically provides:
    - list() - GET /api/users/
    - create() - POST /api/users/
    - retrieve() - GET /api/users/{id}/
    - update() - PUT /api/users/{id}/
    - destroy() - DELETE /api/users/{id}/
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    # Custom actions
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Custom endpoint: GET /api/users/recent/"""
        recent_users = User.objects.filter(created_at__gte=timezone.now() - timedelta(days=7))
        serializer = self.get_serializer(recent_users, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Custom endpoint: POST /api/users/{id}/reset_password/"""
        user = self.get_object()
        # Password reset logic here
        return Response({'status': 'password reset'})


# 3. CUSTOM BUSINESS LOGIC
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_role(request):
    """
    Custom endpoint to assign role to user
    POST /api/assign-role/
    Body: {"user_id": "...", "role_id": "..."}
    """
    user_id = request.data.get('user_id')
    role_id = request.data.get('role_id')
    
    try:
        user = User.objects.get(user_id=user_id)
        role = Role.objects.get(role_id=role_id)
        
        user.role = role
        user.save()
        
        return Response({
            'message': f'Role {role.name} assigned to {user.username}',
            'user': UserSerializer(user).data
        })
    except (User.DoesNotExist, Role.DoesNotExist):
        return Response(
            {'error': 'User or Role not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# 4. SEARCH/FILTER ENDPOINTS
@api_view(['GET'])
def search_users(request):
    """
    Search users by username or email
    GET /api/search-users/?q=john
    """
    query = request.query_params.get('q', '')
    
    if not query:
        return Response({'error': 'Query parameter q is required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    users = User.objects.filter(
        username__icontains=query
    ) or User.objects.filter(
        email__icontains=query
    )
    
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)