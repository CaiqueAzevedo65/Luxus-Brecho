#!/usr/bin/env python3
"""
Script principal para executar o servidor Flask
"""

import os
from app import create_app
from flask_cors import CORS

def main():
    # Carrega variáveis de ambiente
    from dotenv import load_dotenv
    load_dotenv()
    
    # Cria a aplicação Flask
    app = create_app()
    
    # Configurações do servidor
    host = os.environ.get('FLASK_HOST', '127.0.0.1')
    port = int(os.environ.get('FLASK_PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print("🚀 " + "="*50)
    print(f"🚀 Iniciando servidor Flask...")
    print(f"📍 Host: {host}")
    print(f"🔌 Porta: {port}")
    print(f"🐛 Debug: {debug}")
    print(f"🌐 URL: http://{host}:{port}")
    print(f"🔗 API: http://{host}:{port}/api")
    print(f"❤️  Health: http://{host}:{port}/api/health")
    print("🚀 " + "="*50)
    
    # Inicia o servidor
    try:
        app.run(
            host=host,
            port=port,
            debug=debug,
            use_reloader=debug,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Servidor interrompido pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")

if __name__ == '__main__':
    main()