from app import create_app

app = create_app()

if __name__ == "__main__":
    # Permite conexões de qualquer IP da rede (necessário para mobile)
    app.run(
        host="0.0.0.0",  # Aceita conexões de qualquer IP
        port=5000,       # Porta padrão
        debug=app.config.get("DEBUG", False)
    )
