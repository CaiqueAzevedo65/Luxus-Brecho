"""
Entry point para Vercel Serverless
"""
from app import create_app

# Cria a aplicação Flask
app = create_app()

# Para desenvolvimento local
if __name__ == '__main__':
    app.run()