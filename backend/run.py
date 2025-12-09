"""
Script principal para executar o servidor Flask
"""

import os
import json
from pathlib import Path
from app import create_app
from flask_cors import CORS

def load_network_config():
    """Carrega configurações do network-config.json da raiz do projeto"""
    try:
        # Busca o arquivo na raiz do projeto (um nível acima do backend)
        config_path = Path(__file__).parent.parent / 'network-config.json'
        
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
                return config.get('backend', {})
        else:
            print("⚠️  Arquivo network-config.json não encontrado")
            print("💡 Execute 'npm run dev' na raiz para gerar o arquivo")
            return None
    except Exception as e:
        print(f"⚠️  Erro ao ler network-config.json: {e}")
        return None

def main():
    # Carrega variáveis de ambiente
    from dotenv import load_dotenv
    load_dotenv()
    
    # Cria a aplicação Flask
    app = create_app()
    
    # Tenta carregar configurações do network-config.json
    network_config = load_network_config()
    
    if network_config:
        # Usa configurações do network-config.json
        host = network_config.get('host', '0.0.0.0')
        port = network_config.get('port', 5000)
        current_ip = network_config.get('current_ip')
        
        print("🌐 Usando configurações de network-config.json")
    else:
        # Fallback para variáveis de ambiente
        host = os.environ.get('FLASK_HOST', '0.0.0.0')
        port = int(os.environ.get('FLASK_PORT', 5000))
        current_ip = None
        
        print("⚙️  Usando variáveis de ambiente")
    
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print("🚀 " + "="*50)
    print(f"🚀 Iniciando servidor Flask...")
    print(f"📍 Host: {host}")
    print(f"🔌 Porta: {port}")
    print(f"🐛 Debug: {debug}")
    
    if current_ip:
        print(f"🌐 IP da Rede: {current_ip}")
        print(f"📱 Mobile deve usar: http://{current_ip}:{port}/api")
        print(f"🔗 API Rede: http://{current_ip}:{port}/api")
        print(f"❤️  Health: http://{current_ip}:{port}/api/health")
    else:
        print(f"🌐 URL Local: http://127.0.0.1:{port}")
        print(f"🔗 API Local: http://127.0.0.1:{port}/api")
        print(f"❤️  Health: http://127.0.0.1:{port}/api/health")
    
    print("🚀 " + "="*50)
    
    # Inicia o servidor
    # Nota: use_reloader=False evita o erro WinError 10038 no Windows
    # O reloader pode causar conflitos de socket no Windows com Python 3.13
    try:
        app.run(
            host=host,
            port=port,
            debug=debug,
            use_reloader=False,  # Desabilitado para evitar WinError 10038 no Windows
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Servidor interrompido pelo usuário")
    except OSError as e:
        if "10038" in str(e) or "10048" in str(e):
            print(f"❌ Erro de socket: A porta {port} pode estar em uso.")
            print("💡 Tente: taskkill /F /IM python.exe ou mude a porta")
        else:
            print(f"❌ Erro de rede: {e}")
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")

if __name__ == '__main__':
    main()