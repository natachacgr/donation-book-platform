from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Doacao, Livro
from app.utils.validators import validar_email # Importe apenas validar_email
from datetime import datetime

doacoes_bp = Blueprint('doacoes', __name__)

@doacoes_bp.route('', methods=['GET'])
@jwt_required()
def get_doacoes():
    try:
        search = request.args.get('search', '')
        tipo = request.args.get('tipo', '')

        query = Doacao.query

        if search:
            query = query.filter(
                db.or_(
                    Doacao.nome.ilike(f'%{search}%'),
                    Doacao.email.ilike(f'%{search}%'),
                    Doacao.item.ilike(f'%{search}%')
                )
            )

        if tipo:
            query = query.filter(Doacao.tipo == tipo)

        doacoes = query.order_by(Doacao.created_at.desc()).all()

        return jsonify({
            'success': True,
            'doacoes': [doacao.to_dict() for doacao in doacoes]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@doacoes_bp.route('', methods=['POST'])
def create_doacao():
    try:
        data = request.get_json()

        nome = data.get('nome', '').strip()
        # cpf = data.get('cpf', '').strip() # REMOVIDO: Não pegar mais o CPF
        email = data.get('email', '').strip()
        tipo = data.get('tipo', '').lower()
        item = data.get('item', '').strip()
        livro_id = data.get('livro_id')
        lgpd_consent = data.get('lgpdConsent', False)

        # Validações (SEM CPF)
        if not nome or not email or not tipo or not item: # CPF removido da validação de obrigatórios
            return jsonify({'error': 'Nome, email, tipo e item são obrigatórios'}), 400

        if not lgpd_consent:
            return jsonify({'error': 'É necessário aceitar os termos da LGPD'}), 400

        # REMOVIDO: Não validar mais o CPF
        # if not validar_cpf(cpf):
        #     return jsonify({'error': 'CPF inválido'}), 400

        if not validar_email(email):
            return jsonify({'error': 'Email inválido'}), 400

        if tipo not in ['livro', 'jogo']:
            return jsonify({'error': 'Tipo deve ser "livro" ou "jogo"'}), 400

        # Se for doação de livro, verificar se o livro existe e tem estoque
        if tipo == 'livro' and livro_id:
            livro = Livro.query.get(livro_id)
            if not livro:
                return jsonify({'error': 'Livro não encontrado'}), 404

            if livro.quantidade <= 0:
                return jsonify({'error': 'Livro não está disponível'}), 400

            # Reduzir quantidade do livro
            livro.quantidade -= 1
            livro.updated_at = datetime.utcnow() # Atualiza o timestamp de modificação do livro

        doacao = Doacao(
            nome=nome,
            # cpf=cpf, # REMOVIDO: Não passar CPF para o modelo
            email=email,
            tipo=tipo,
            item=item,
            livro_id=livro_id if tipo == 'livro' else None # Garante que livro_id é None para jogos
        )

        db.session.add(doacao)
        db.session.commit()

        return jsonify({
            'success': True,
            'doacao': doacao.to_dict(),
            'message': 'Doação registrada com sucesso!'
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@doacoes_bp.route('/<int:doacao_id>', methods=['PUT'])
@jwt_required()
def update_doacao(doacao_id):
    try:
        doacao = Doacao.query.get_or_404(doacao_id)
        data = request.get_json()

        nome = data.get('nome', '').strip()
        # cpf = data.get('cpf', '').strip() # REMOVIDO: Não pegar mais o CPF
        email = data.get('email', '').strip()
        tipo = data.get('tipo', '').lower()
        item = data.get('item', '').strip()

        # Validações (SEM CPF)
        if not nome or not email or not tipo or not item: # CPF removido
            return jsonify({'error': 'Nome, email, tipo e item são obrigatórios'}), 400

        # REMOVIDO: Não validar mais o CPF
        # if not validar_cpf(cpf):
        #     return jsonify({'error': 'CPF inválido'}), 400

        if not validar_email(email):
            return jsonify({'error': 'Email inválido'}), 400

        if tipo not in ['livro', 'jogo']:
            return jsonify({'error': 'Tipo deve ser "livro" ou "jogo"'}), 400

        doacao.nome = nome
        # doacao.cpf = cpf # REMOVIDO: Não atualizar mais o CPF
        doacao.email = email
        doacao.tipo = tipo
        doacao.item = item

        db.session.commit()

        return jsonify({
            'success': True,
            'doacao': doacao.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@doacoes_bp.route('/<int:doacao_id>', methods=['DELETE'])
@jwt_required()
def delete_doacao(doacao_id):
    try:
        doacao = Doacao.query.get_or_404(doacao_id)

        # Se foi doação de livro, devolver a quantidade
        if doacao.tipo == 'livro' and doacao.livro_id:
            livro = Livro.query.get(doacao.livro_id)
            if livro:
                livro.quantidade += 1
                livro.updated_at = datetime.utcnow() # Atualiza o timestamp de modificação do livro

        db.session.delete(doacao)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Doação excluída com sucesso'
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500