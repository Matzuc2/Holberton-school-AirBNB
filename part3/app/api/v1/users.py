from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request
from app.models.user import User
from app import db
from app.persistence.repository import SQLAlchemyRepository
from app.api.v1.auth import admin_required

api = Namespace('users', description='User operations')

# Define the user model for input validation and documentation
user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True, description='Password of the user')
})

@api.route('/')
class AdminUserCreate(Resource):
    @api.expect(user_model, validate=True)
    @api.response(200, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(403, 'Admin privileges required')
    #@jwt_required()
    def post(self):
        #current_user = get_jwt_identity()
        #if not current_user.get('is_admin'):
            #return {'error': 'Admin privileges required'}, 403

        user_data = request.json
        email = user_data.get('email')

        # Check if email is already in use
        if facade.get_user_by_email(email):
            return {'error': 'Email already registered'}, 400

        # Logic to create a new user
        try:
            new_user = facade.create_user(user_data)
            return {
                'id': new_user.id,
                'first_name': new_user.first_name,
                'last_name': new_user.last_name,
                'email': new_user.email,
                'password': new_user.password
            }, 201
        except ValueError as e:
            return {'error': str(e)}, 400
    



    @api.response(200, 'Success')
    def get(self):
        """List all users"""
        users = facade.get_all_users()
        return [{
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        } for user in users], 200


@api.route('/<user_id>')
class UserResource(Resource):
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID"""
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return {'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name, 'email': user.email}, 200
    
    @api.expect(user_model, validate=True)
    @api.response(200, 'User successfully updated')
    @api.response(404, 'User not found')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Unauthorized action')
    @jwt_required()
    @admin_required()
    def put(self, user_id):
        """Update user details by ID"""
        current_user = get_jwt_identity()
        user_data = api.payload
        user = facade.get_user(user_id)
        data = request.json
        email = data.get('email')

        if not user:
            return {'error': 'User not found'}, 404

        if current_user['id'] != user.id and not current_user.get('is_admin'):
            return {'error': 'Unauthorized action'}, 403
        
        if email:
            existing_user = facade.get_user_by_email(email)
            if existing_user:
                return {'error': 'Email already in use'}, 400
        try:
            updated_user = facade.update_user(user_id, **user_data)
            response_data = {
                'first_name': updated_user.first_name,
                'last_name': updated_user.last_name
            }
            return response_data, 200
        except ValueError:
            return {'error': 'Invalid input data'}, 400
        
