from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os
from dotenv import load_dotenv
from flask_migrate import Migrate # Certifique-se que esta linha está aqui

# Inicializar extensões
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate() # Certifique-se que esta linha está aqui

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

    # Inicializar extensões com app
    db.init_app(app)
    jwt.init_app(app)

    # CORS configuração corrigida e robusta
    CORS(app, 
         resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5173"], # Especifique suas origens de frontend
                               "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], # Inclua OPTIONS explicitamente
                               "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"], # Permite cabeçalhos comuns
                               "supports_credentials": True}}) # Essencial para cookies e cabeçalhos de autorização

    migrate.init_app(app, db) # Inicializa Flask-Migrate com o app e db

    # Registrar blueprints
    from app.routes.auth import auth_bp
    from app.routes.livros import livros_bp
    from app.routes.doacao import doacoes_bp
    from app.routes.stats import stats_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(livros_bp, url_prefix='/api/livros')
    app.register_blueprint(doacoes_bp, url_prefix='/api/doacoes')
    app.register_blueprint(stats_bp, url_prefix='/api')

    # Adicionar rota de health check (útil para depuração)
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