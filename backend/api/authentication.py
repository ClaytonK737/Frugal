import firebase_admin
from firebase_admin import auth, credentials
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser
import os

# Initialize Firebase Admin SDK once
if not firebase_admin._apps:
    cred_path = os.environ.get('FIREBASE_CREDENTIALS')
    if cred_path:
        cred = credentials.Certificate(cred_path)
    else:
        cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)


class FirebaseUser:
    """Minimal user object populated from a verified Firebase token."""
    def __init__(self, uid, email, name):
        self.uid = uid
        self.email = email
        self.name = name
        self.is_authenticated = True
        self.is_anonymous = False


class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.META.get('HTTP_AUTHORIZATION', '')
        if not header.startswith('Bearer '):
            return None
        token = header.split('Bearer ')[1]
        try:
            decoded = auth.verify_id_token(token)
            user = FirebaseUser(
                uid=decoded['uid'],
                email=decoded.get('email', ''),
                name=decoded.get('name', ''),
            )
            return (user, token)
        except Exception:
            raise AuthenticationFailed('Invalid or expired Firebase token.')
