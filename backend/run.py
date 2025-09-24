from app import create_app
from utils.network_utils import print_network_info

app = create_app()

# Mostra informações de rede na inicialização
print_network_info()

if __name__ == "__main__":
    # Permite conexões de qualquer IP da rede (necessário para mobile)
    app.run(
        host="0.0.0.0",  # Aceita conexões de qualquer IP
        port=5000,       # Porta padrão
        debug=app.config.get("DEBUG", False)
    )
