from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app import db, mail # <--- IMPORTANTE: Importe 'mail' aqui!
from app.models import Doacao, Livro
from app.utils.validators import validar_email
from datetime import datetime
from flask_mail import Message # <--- IMPORTANTE: Importe 'Message' aqui!
from threading import Thread # <--- IMPORTANTE: Importe 'Thread' para envio assíncrono

doacoes_bp = Blueprint('doacoes', __name__)

# Função auxiliar para enviar email em segundo plano
def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            print(f"Erro ao enviar email no thread assíncrono: {e}")

# Função principal para enviar email de agradecimento
def send_thank_you_email(recipient_email, item_donated):
    try:
        # Acessa a configuração padrão do remetente a partir da aplicação atual
        default_sender = current_app.config.get('MAIL_DEFAULT_SENDER')

        msg = Message(
            subject="Obrigado(a) pela sua doação à Biblioteca Municipal!",
            sender=default_sender, # Define o remetente
            recipients=[recipient_email],
            html=f"""
            <p>Olá,</p>
            <p>A Biblioteca Municipal de Santa Rita do Sapucaí agradece imensamente a sua doação de <b>"{item_donated}"</b>!</p>
            <p>Sua contribuição é muito importante para enriquecer nosso acervo e ajudar a comunidade.</p>
            <p>Atenciosamente,</p>
            <p>Equipe da Biblioteca Municipal</p>
            <br>
            <p style="font-size: 0.8em; color: #777;">Este é um email automático, por favor não responda.</p>
            """
        )
        # Enviar email em um thread separado para não bloquear a requisição HTTP
        Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()
        print(f"Email de agradecimento acionado para {recipient_email} sobre {item_donated}")
    except Exception as e:
        print(f"Erro ao preparar/acionar envio de email para {recipient_email}: {e}")

# ROTA GET QUE ESTAVA FALTANDO
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
        email = data.get('email', '').strip()
        tipo = data.get('tipo', '').lower()
        item = data.get('item', '').strip()
        livro_id = data.get('livro_id')
        lgpd_consent = data.get('lgpdConsent', False)

        # Validações
        if not nome or not email or not tipo or not item:
            return jsonify({'error': 'Nome, email, tipo e item são obrigatórios'}), 400

        if not lgpd_consent:
            return jsonify({'error': 'É necessário aceitar os termos da LGPD'}), 400

        if not validar_email(email):
            return jsonify({'error': 'Email inválido'}), 400

        if tipo not in ['livro', 'jogo']:
            return jsonify({'error': 'Tipo deve ser "livro" ou "jogo"'}), 400

        # Se for doação de livro, verificar se o livro existe e tem estoque
        if tipo == 'livro':
            if not livro_id:
                return jsonify({'error': 'ID do livro é obrigatório para doação de livro'}), 400

            livro = Livro.query.get(livro_id)
            if not livro:
                return jsonify({'error': 'Livro não encontrado'}), 404

            if livro.quantidade <= 0:
                return jsonify({'error': 'Livro não está disponível'}), 400

            # Reduzir quantidade do livro
            livro.quantidade -= 1
            livro.updated_at = datetime.utcnow()

        doacao = Doacao(
            nome=nome,
            email=email,
            tipo=tipo,
            item=item,
            livro_id=livro_id if tipo == 'livro' else None
        )

        db.session.add(doacao)
        db.session.commit()

        # --- AQUI: Chamar a função de envio de email após o commit da doação ---
        # Certifique-se de que item_donated é o que você quer que apareça no email.
        # Para jogos, 'item' já deve ser algo como 'Jogo de tabuleiro'.
        # Para livros, 'item' já deve ser 'Titulo - Autor'.
        send_thank_you_email(email, item)
        # --- Fim da chamada de email ---

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
        email = data.get('email', '').strip()
        tipo = data.get('tipo', '').lower()
        item = data.get('item', '').strip()

        # Validações
        if not nome or not email or not tipo or not item:
            return jsonify({'error': 'Nome, email, tipo e item são obrigatórios'}), 400

        if not validar_email(email):
            return jsonify({'error': 'Email inválido'}), 400

        if tipo not in ['livro', 'jogo']:
            return jsonify({'error': 'Tipo deve ser "livro" ou "jogo"'}), 400

        doacao.nome = nome
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
                livro.updated_at = datetime.utcnow()

        db.session.delete(doacao)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Doação excluída com sucesso'
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500