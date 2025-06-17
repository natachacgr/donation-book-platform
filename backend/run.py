from app import create_app, db
from app.models import Admin, Livro

def init_db():
    """Inicializar banco de dados com dados iniciais"""
    db.create_all()
    
    # Criar admin padrão se não existir
    admin = Admin.query.filter_by(username='admin').first()
    if not admin:
        admin = Admin(username='admin')
        admin.set_password('123456')
        db.session.add(admin)
    
    # Adicionar livros de exemplo se não existirem
    if Livro.query.count() == 0:
        livros_exemplo = [
            {'titulo': 'O Alquimista', 'autor': 'Paulo Coelho', 'quantidade': 5},
            {'titulo': '1984', 'autor': 'George Orwell', 'quantidade': 3},
            {'titulo': 'Dom Casmurro', 'autor': 'Machado de Assis', 'quantidade': 2},
            {'titulo': 'O Pequeno Príncipe', 'autor': 'Antoine de Saint-Exupéry', 'quantidade': 4},
            {'titulo': 'Clean Code', 'autor': 'Robert C. Martin', 'quantidade': 1},
            {'titulo': 'Harry Potter e a Pedra Filosofal', 'autor': 'J.K. Rowling', 'quantidade': 0},
            {'titulo': 'O Hobbit', 'autor': 'J.R.R. Tolkien', 'quantidade': 3},
            {'titulo': 'Sapiens', 'autor': 'Yuval Noah Harari', 'quantidade': 2},
        ]
        
        for livro_data in livros_exemplo:
            livro = Livro(**livro_data)
            db.session.add(livro)
    
    db.session.commit()
    print("Banco de dados inicializado!")

if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        init_db()
    
    app.run(debug=True, host='0.0.0.0', port=5000)