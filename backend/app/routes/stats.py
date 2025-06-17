from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Livro, Doacao

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        total_livros = Livro.query.count()
        total_doacoes = Doacao.query.count()
        doacoes_livros = Doacao.query.filter_by(tipo='livro').count()
        doacoes_jogos = Doacao.query.filter_by(tipo='jogo').count()
        livros_disponiveis = db.session.query(db.func.sum(Livro.quantidade)).scalar() or 0
        
        return jsonify({
            'success': True,
            'stats': {
                'total_livros': total_livros,
                'total_doacoes': total_doacoes,
                'doacoes_livros': doacoes_livros,
                'doacoes_jogos': doacoes_jogos,
                'livros_disponiveis': livros_disponiveis
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500