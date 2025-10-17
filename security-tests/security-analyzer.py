#!/usr/bin/env python3
import os
import json
import requests
from datetime import datetime

# Configurações
REPORT_DIR = "security-reports"
TARGET_URL = "http://localhost:5000"

def check_backend_online():
    """Verifica se o backend está rodando"""
    try:
        response = requests.get(f"{TARGET_URL}/api/health", timeout=10)
        return response.status_code == 200
    except:
        return False

def test_security_headers():
    """Testa se headers de segurança estão configurados"""
    print("🔒 Testando headers de segurança...")
    try:
        response = requests.get(TARGET_URL, timeout=5)
        headers = response.headers
        
        required_headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY', 
            'X-XSS-Protection': '1; mode=block'
        }
        
        missing_headers = []
        for header, expected in required_headers.items():
            if header not in headers:
                missing_headers.append(header)
                print(f"   ❌ {header}: AUSENTE")
            else:
                print(f"   ✅ {header}: {headers[header]}")
        
        return missing_headers
    except Exception as e:
        print(f"   ❌ Erro testando headers: {e}")
        return ["ERRO_CONEXAO"]

def test_parameter_validation():
    """Testa se a validação de parâmetros está funcionando"""
    print("🧪 Testando validação de parâmetros...")
    try:
        # Enviar parâmetro muito grande para testar buffer overflow
        huge_param = 'A' * 10000
        response = requests.get(
            f"{TARGET_URL}/api/products", 
            params={'page': huge_param}, 
            timeout=10
        )
        
        if response.status_code == 400:
            print("   ✅ Validação funcionando - erro 400 retornado")
            return False  # Sem vulnerabilidade
        elif response.status_code == 500:
            print("   ❌ Vulnerabilidade: servidor crashou com parâmetro grande")
            return True   # Vulnerabilidade encontrada
        else:
            print(f"   ⚠️ Resposta inesperada: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Erro testando validação: {e}")
        return True

def test_cors_configuration():
    """Testa configuração CORS"""
    print("🌐 Testando configuração CORS...")
    try:
        response = requests.get(TARGET_URL, timeout=5)
        cors_header = response.headers.get('Access-Control-Allow-Origin', '')
        
        if cors_header == '*':
            print("   ❌ CORS muito permissivo: Access-Control-Allow-Origin: *")
            return True  # Vulnerabilidade
        else:
            print(f"   ✅ CORS configurado adequadamente: {cors_header}")
            return False
    except Exception as e:
        print(f"   ❌ Erro testando CORS: {e}")
        return True

def calculate_security_score(missing_headers, has_buffer_overflow, has_cors_issue):
    """Calcula score de segurança"""
    score = 100
    
    # Penalidades
    score -= len(missing_headers) * 15  # -15 pontos por header ausente
    if has_buffer_overflow:
        score -= 30  # -30 pontos por buffer overflow
    if has_cors_issue:
        score -= 20  # -20 pontos por CORS inseguro
    
    return max(0, score)

def generate_report(missing_headers, has_buffer_overflow, has_cors_issue, score):
    """Gera relatório de segurança"""
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    
    # Criar diretório se não existir
    os.makedirs(REPORT_DIR, exist_ok=True)
    
    # Dados do relatório
    report = {
        'timestamp': timestamp,
        'target': TARGET_URL,
        'security_score': score,
        'vulnerabilities': [],
        'status': 'PASS' if score >= 70 else 'FAIL'
    }
    
    # Adicionar vulnerabilidades encontradas
    if missing_headers:
        report['vulnerabilities'].append({
            'type': 'Missing Security Headers',
            'severity': 'MEDIUM',
            'details': f"Headers ausentes: {', '.join(missing_headers)}"
        })
    
    if has_buffer_overflow:
        report['vulnerabilities'].append({
            'type': 'Buffer Overflow',
            'severity': 'HIGH',
            'details': 'Endpoint /api/products vulnerável a buffer overflow'
        })
    
    if has_cors_issue:
        report['vulnerabilities'].append({
            'type': 'CORS Misconfiguration',
            'severity': 'MEDIUM', 
            'details': 'CORS configurado como * permite acesso de qualquer domínio'
        })
    
    # Salvar relatório JSON
    json_file = f"{REPORT_DIR}/security-report-{timestamp}.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    # Salvar relatório HTML
    html_file = f"{REPORT_DIR}/security-report-{timestamp}.html"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Relatório de Segurança - Luxus Brechó</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            .header {{ text-align: center; padding: 20px; }}
            .score {{ font-size: 24px; font-weight: bold; color: {"green" if score >= 70 else "red"}; }}
            .vulnerability {{ margin: 15px 0; padding: 15px; border-left: 4px solid red; background: #ffe6e6; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🛡️ Relatório de Segurança - Luxus Brechó</h1>
            <p>Data: {timestamp}</p>
            <p>Target: {TARGET_URL}</p>
            <div class="score">Score: {score}/100 - {report['status']}</div>
        </div>
        
        <h2>Vulnerabilidades Encontradas:</h2>
    """
    
    if report['vulnerabilities']:
        for vuln in report['vulnerabilities']:
            html_content += f"""
            <div class="vulnerability">
                <h3>{vuln['type']} ({vuln['severity']})</h3>
                <p>{vuln['details']}</p>
            </div>
            """
    else:
        html_content += "<p>✅ Nenhuma vulnerabilidade encontrada!</p>"
    
    html_content += "</body></html>"
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"📊 Relatórios gerados:")
    print(f"   📄 JSON: {json_file}")
    print(f"   🌐 HTML: {html_file}")
    
    return report

def main():
    print("🛡️ INICIANDO ANÁLISE DE SEGURANÇA")
    print("=" * 50)
    
    # Verificar se backend está online
    if not check_backend_online():
        print("❌ Backend não está respondendo!")
        exit(1)
    
    print("✅ Backend online, iniciando testes...")
    print()
    
    # Executar testes
    missing_headers = test_security_headers()
    has_buffer_overflow = test_parameter_validation() 
    has_cors_issue = test_cors_configuration()
    
    # Calcular score
    score = calculate_security_score(missing_headers, has_buffer_overflow, has_cors_issue)
    
    # Gerar relatório
    report = generate_report(missing_headers, has_buffer_overflow, has_cors_issue, score)
    
    # Resumo final
    print()
    print("=" * 50)
    print(f"🎯 RESULTADO FINAL: {report['status']}")
    print(f"📊 Score de Segurança: {score}/100")
    print(f"🔍 Vulnerabilidades: {len(report['vulnerabilities'])}")
    
    # Sair com código de erro se falhou
    exit(0 if score >= 70 else 1)

if __name__ == "__main__":
    main()
