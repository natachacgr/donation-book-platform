from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Livro, Doacao
from datetime import datetime

livros_bp = Blueprint('livros', __name__)

@livros_bp.route('', methods=['GET'])
def get_livros():
    try:
        search = request.args.get('search', '')
        
        query = Livro.query
        
        if search:
            query = query.filter(
                db.or_(
                    Livro.titulo.ilike(f'%{search}%'),
                    Livro.autor.ilike(f'%{search}%')
                )
            )
        
        livros = query.order_by(Livro.titulo).all()
        
        return jsonify({
            'success': True,
            'livros': [livro.to_dict() for livro in livros]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@livros_bp.route('', methods=['POST'])
@jwt_required()
def create_livro():
    try:
        data = request.get_json()
        
        titulo = data.get('titulo', '').strip()
        autor = data.get('autor', '').strip()
        quantidade = data.get('quantidade', 0)
        
        if not titulo or not autor:
            return jsonify({'error': 'Título e autor são obrigatórios'}), 400
        
        if quantidade < 0:
            return jsonify({'error': 'Quantidade não pode ser negativa'}), 400
        
        # Verificar se já existe um livro com mesmo título e autor
        existing = Livro.query.filter_by(titulo=titulo, autor=autor).first()
        if existing:
            return jsonify({'error': 'Já existe um livro com este título e autor'}), 400
        
        livro = Livro(
            titulo=titulo,
            autor=autor,
            quantidade=quantidade
        )
        
        db.session.add(livro)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'livro': livro.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@livros_bp.route('/<int:livro_id>', methods=['PUT'])
@jwt_required()
def update_livro(livro_id):
    try:
        livro = Livro.query.get_or_404(livro_id)
        data = request.get_json()
        
        titulo = data.get('titulo', '').strip()
        autor = data.get('autor', '').strip()
        quantidade = data.get('quantidade', 0)
        
        if not titulo or not autor:
            return jsonify({'error': 'Título e autor são obrigatórios'}), 400
        
        if quantidade < 0:
            return jsonify({'error': 'Quantidade não pode ser negativa'}), 400
        
        # Verificar se já existe outro livro com mesmo título e autor
        existing = Livro.query.filter(
            Livro.titulo == titulo,
            Livro.autor == autor,
            Livro.id != livro_id
        ).first()
        
        if existing:
            return jsonify({'error': 'Já existe outro livro com este título e autor'}), 400
        
        livro.titulo = titulo
        livro.autor = autor
        livro.quantidade = quantidade
        livro.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'livro': livro.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@livros_bp.route('/<int:livro_id>', methods=['DELETE'])
@jwt_required()
def delete_livro(livro_id):
    try:
        livro = Livro.query.get_or_404(livro_id)
        
        # Verificar se existem doações relacionadas
        doacoes_count = Doacao.query.filter_by(livro_id=livro_id).count()
        if doacoes_count > 0:
            return jsonify({
                'error': f'Não é possível excluir este livro pois existem {doacoes_count} doação(ões) relacionada(s)'
            }), 400
        
        db.session.delete(livro)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Livro excluído com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500