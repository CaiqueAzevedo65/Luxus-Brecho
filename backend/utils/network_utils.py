import socket
import subprocess
import platform
import re
from typing import List, Optional

def get_local_ip() -> Optional[str]:
    """
    Obtém o IP local da máquina na rede
    """
    try:
        # Conecta a um endereço externo para descobrir o IP local
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return None

def get_all_network_interfaces() -> List[str]:
    """
    Obtém todos os IPs das interfaces de rede
    """
    ips = []
    
    try:
        if platform.system() == "Windows":
            # Windows: usar ipconfig
            result = subprocess.run(
                ["ipconfig"], 
                capture_output=True, 
                text=True, 
                encoding='cp1252'  # Encoding padrão do Windows
            )
            
            # Procura por endereços IPv4
            if result.stdout:
                ipv4_pattern = r'IPv4.*?: (\d+\.\d+\.\d+\.\d+)'
                matches = re.findall(ipv4_pattern, result.stdout)
                
                for match in matches:
                    if not match.startswith('127.') and not match.startswith('169.254.'):
                        ips.append(match)
        
        else:
            # Linux/Mac: usar ifconfig ou ip
            try:
                result = subprocess.run(
                    ["ifconfig"], 
                    capture_output=True, 
                    text=True
                )
            except FileNotFoundError:
                result = subprocess.run(
                    ["ip", "addr", "show"], 
                    capture_output=True, 
                    text=True
                )
            
            # Procura por endereços IP
            if result.stdout:
                ip_pattern = r'inet (\d+\.\d+\.\d+\.\d+)'
                matches = re.findall(ip_pattern, result.stdout)
                
                for match in matches:
                    if not match.startswith('127.') and not match.startswith('169.254.'):
                        ips.append(match)
    
    except Exception as e:
        print(f"Erro ao obter interfaces de rede: {e}")
    
    return ips

def get_network_info() -> dict:
    """
    Obtém informações completas da rede
    """
    local_ip = get_local_ip()
    all_ips = get_all_network_interfaces()
    
    return {
        "primary_ip": local_ip,
        "all_interfaces": all_ips,
        "localhost": "127.0.0.1",
        "platform": platform.system(),
        "hostname": socket.gethostname()
    }

def print_network_info():
    """
    Imprime informações de rede formatadas
    """
    info = get_network_info()
    
    print("=" * 50)
    print("INFORMAÇÕES DE REDE")
    print("=" * 50)
    print(f"Hostname: {info['hostname']}")
    print(f"Plataforma: {info['platform']}")
    print(f"IP Principal: {info['primary_ip']}")
    print(f"Localhost: {info['localhost']}")
    
    if info['all_interfaces']:
        print("\nTodas as interfaces:")
        for i, ip in enumerate(info['all_interfaces'], 1):
            print(f"  {i}. {ip}")
    
    print("\nURLs para o mobile:")
    if info['primary_ip']:
        print(f"  Network: http://{info['primary_ip']}:5000/api")
    print(f"  Local: http://{info['localhost']}:5000/api")
    print("=" * 50)

if __name__ == "__main__":
    print_network_info()
