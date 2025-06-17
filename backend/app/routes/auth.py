from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import Admin

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username e password são obrigatórios'}), 400

        admin = Admin.query.filter_by(username=username).first()

        if admin and admin.check_password(password):
            token = create_access_token(identity=admin.username)
            return jsonify({
                'success': True,
                'token': token,
                'admin': {
                    'id': admin.id,
                    'username': admin.username
                }
            })

        return jsonify({'error': 'Credenciais inválidas'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    current_user = get_jwt_identity()
    return jsonify({
        'valid': True,
        'username': current_user
    })