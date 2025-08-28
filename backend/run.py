from app import create_app

# Cria a instância da aplicação Flask
app = create_app()

if __name__ == '__main__':
    # Inicia o servidor de desenvolvimento quando o script é executado diretamente
    # debug=True permite atualizações automáticas quando o código é modificado
    app.run(debug=app.config.get("DEBUG", False))
