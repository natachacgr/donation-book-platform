# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_mail import Mail # <--- Adicione esta importação

# Inicializar extensões
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
mail = Mail() # <--- Adicione esta inicialização

def create_app():
    """Factory function para criar a aplicação Flask"""
    # Carregar variáveis de ambiente
    load_dotenv()

    app = Flask(__name__)

    # Configurações
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://username:password@localhost/biblioteca_db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'sua-chave-secreta-super-segura')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

    # --- Configurações do Flask-Mail ---
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com') # Ex: 'smtp.gmail.com'
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587)) # Ex: 587 para TLS, 465 para SSL
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() in ('true', '1', 't') # Usar TLS
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME') # Seu email remetente
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD') # Senha ou App Password do email
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'no-reply@biblioteca.com') # Email padrão do remetente
    # --- Fim das Configurações do Flask-Mail ---

    # Inicializar extensões com app
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app) # <--- Inicialize Flask-Mail com o app

    CORS(app,
         resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5173", "http://localhost:5175"],
                               "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                               "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
                               "supports_credentials": True}})

    migrate.init_app(app, db)

    # Registrar blueprints
    from app.routes.auth import auth_bp
    from app.routes.livros import livros_bp
    from app.routes.doacao import doacoes_bp
    from app.routes.stats import stats_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(livros_bp, url_prefix='/api/livros')
    app.register_blueprint(doacoes_bp, url_prefix='/api/doacoes')
    app.register_blueprint(stats_bp, url_prefix='/api')

    # Adicionar rota de health check
    @app.route('/api/health')
    def health_check():
        from flask import jsonify
        return jsonify({'status': 'ok', 'message': 'API funcionando'})

    # Tratamento de erros globais
    @app.errorhandler(404)
    def not_found(error):
        from flask import jsonify
        return jsonify({'error': 'Recurso não encontrado'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        from flask import jsonify
        return jsonify({'error': 'Erro interno do servidor'}), 500

    return app