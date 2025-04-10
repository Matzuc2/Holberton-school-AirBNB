from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('places', description='Place operations')

# Define the models for related entities
amenity_model = api.model('PlaceAmenity', {
    'id': fields.String(description='Amenity ID'),
    'name': fields.String(description='Name of the amenity')
})

user_model = api.model('PlaceUser', {
    'id': fields.String(description='User ID'),
    'first_name': fields.String(description='First name of the owner'),
    'last_name': fields.String(description='Last name of the owner'),
    'email': fields.String(description='Email of the owner')
})

review_model = api.model('PlaceReview', {
    'id': fields.String(description='Review ID'),
    'text': fields.String(description='Text of the review'),
    'rating': fields.Integer(description='Rating of the place (1-5)'),
    'user_id': fields.String(description='ID of the user')
})

# Define the place model for input validation and documentation
place_model = api.model('Place', {
    'title': fields.String(required=True, description='Title of the place'),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(required=True, description='Price per night'),
    'latitude': fields.Float(required=True, description='Latitude of the place'),
    'longitude': fields.Float(required=True, description='Longitude of the place'),
    'owner_id': fields.String(required=True, description='ID of the owner'),
    'owner': fields.Nested(user_model, description='Owner of the place'),
    'amenities': fields.List(fields.Nested(amenity_model), description='List of amenities'),
    'reviews': fields.List(fields.Nested(review_model), description='List of reviews')
})

@api.route('/')
class PlaceList(Resource):
    @jwt_required()
    @api.expect(place_model, validate=True)
    @api.response(201, 'Place successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new place"""
        current_user = get_jwt_identity()
        place_data = api.payload
        try:
            place_title = facade.get_place_by_title(place_data['title'])
            if place_title:
                return {'error': 'Place with the same title already exists'}, 400
            user = facade.get_user(place_data['owner_id'])
            if place_data['owner_id'] != current_user:
                return {'error': 'You can only create places for your own account'}, 403
            if not user:
                return {'error': 'Owner not found'}, 404
            new_place = facade.create_place(place_data)
            return {
                'id': new_place.id,
                'title': new_place.title,
                'description': new_place.description,
                'price': new_place.price,
                'latitude': new_place.latitude,
                'longitude': new_place.longitude,
                'owner_id': new_place.owner_id,
                'amenities': new_place.amenities
            }, 201

        except ValueError as e:
            return {'error': str(e)}, 400

    @api.response(200, 'List of places retrieved successfully')
    def get(self):
        """Retrieve a list of all places"""
        places = facade.get_all_places()
        return [{
            'id': place.id,
            'title': place.title,
            'description': place.description,
            'price': place.price,
            'latitude': place.latitude,
            'longitude': place.longitude,
            'owner_id': place.owner_id
        } for place in places], 200

@api.route('/<place_id>')
class PlaceResource(Resource):
    @api.response(200, 'Place details retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get place details by ID"""
        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404
        
        owner = facade.get_user(place.owner_id)
        if not owner:
            return {'error': 'Owner not found'}, 404

        amenities = []
        for amenity_id in place.amenities:
            amenity = facade.get_amenity(amenity_id)
            if amenity:
                amenities.append({
                    'id': amenity.id,
                    'name': amenity.name
                })

        return {
                'id': place.id,
                'title': place.title,
                'description': place.description,
                'price': place.price,
                'latitude': place.latitude,
                'longitude': place.longitude,
                'owner': {
                    'id': owner.id,
                    'first_name': owner.first_name,
                    'last_name': owner.last_name,
                    'email': owner.email
                },
                'amenities': amenities
            }, 200

    @api.expect(place_model, validate=True)
    @api.response(200, 'Place updated successfully')
    @api.response(404, 'Place not found')
    @api.response(400, 'Invalid input data')
    def put(self, place_id):
        """Update a place's information"""
        place_data = api.payload

        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404

        try:
            place_title = facade.get_place_by_title(place_data['title'])
            if place_title and place_title.id != place_id:
                return {'error': 'Place with the same title already exists'}, 400
            user = facade.get_user(place_data['owner_id'])
            if not user:
                return {'error': 'Owner not found'}, 404
            updated_place = facade.update_place(place_id, place_data)
            return {
                    'id': updated_place.id,
                    'title': updated_place.title,
                    'description': updated_place.description,
                    'price': updated_place.price,
                    'latitude': updated_place.latitude,
                    'longitude': updated_place.longitude,
                    'owner_id': updated_place.owner_id,
                    'amenities': updated_place.amenities
                }, 200
        except ValueError as e:
            return {'error': str(e)}, 400

    @api.route('/<place_id>/reviews')
    class PlaceReviewList(Resource):
        @api.response(200, 'List of reviews for the place retrieved successfully')
        @api.response(404, 'Place not found')
        def get(self, place_id):
            """Get all reviews for a specific place"""
            reviews = facade.get_reviews_by_place(place_id)
            if reviews:
                return [{
                    'id': review.id,
                    'text': review.text,
                    'rating': review.rating,
                    'user_id': review.user_id,
                    'place_id': review.place_id
                } for review in reviews], 200
            else:
                return {'error': 'Place not found'}, 404