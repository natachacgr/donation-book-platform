from app import db
from datetime import datetime

class Doacao(db.Model):
    __tablename__ = 'doacoes'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(10), nullable=False)  # 'livro' ou 'jogo'
    item = db.Column(db.String(500), nullable=False)
    livro_id = db.Column(db.Integer, db.ForeignKey('livros.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    livro = db.relationship('Livro', backref='doacoes')

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'tipo': self.tipo,
            'item': self.item,
            'livro_id': self.livro_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }