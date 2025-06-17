import re

def validar_email(email):
    """Validação básica de email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validar_dados_obrigatorios(**kwargs):
    """Valida se os dados obrigatórios foram fornecidos"""
    campos_vazios = []
    for campo, valor in kwargs.items():
        if not valor or (isinstance(valor, str) and not valor.strip()):
            campos_vazios.append(campo)
    
    return campos_vazios