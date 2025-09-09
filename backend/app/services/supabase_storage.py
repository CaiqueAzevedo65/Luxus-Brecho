"""
Serviço para integração com Supabase Storage
Gerencia upload, download e exclusão de imagens de produtos
"""
import os
import uuid
import mimetypes
from io import BytesIO
from typing import Optional, Tuple, List
from PIL import Image
from supabase import create_client, Client
from werkzeug.datastructures import FileStorage

class SupabaseStorageService:
    def __init__(self):
        """Inicializa o cliente Supabase"""
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY") 
        self.bucket_name = os.getenv("SUPABASE_BUCKET", "product-images")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL e SUPABASE_KEY devem estar configurados no .env")
            
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        
    def _generate_filename(self, original_filename: str) -> str:
        """Gera nome único para o arquivo"""
        # Extrai extensão do arquivo original
        _, ext = os.path.splitext(original_filename)
        if not ext:
            ext = '.jpg'  # Default para JPG se não tiver extensão
            
        # Gera UUID único + extensão
        unique_filename = f"{uuid.uuid4().hex}{ext.lower()}"
        return unique_filename
        
    def _validate_image(self, file: FileStorage) -> bool:
        """Valida se o arquivo é uma imagem válida"""
        if not file.content_type:
            return False
            
        # Tipos MIME permitidos
        allowed_types = [
            'image/jpeg', 'image/jpg', 'image/png', 
            'image/webp', 'image/gif'
        ]
        
        return file.content_type in allowed_types
        
    def _resize_image(self, file: FileStorage, max_width: int = 1200, max_height: int = 1200) -> BytesIO:
        """Redimensiona imagem para otimizar armazenamento"""
        try:
            # Abre a imagem
            image = Image.open(file.stream)
            
            # Calcula novo tamanho mantendo proporção
            image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Converte para RGB se necessário (para JPEG)
            if image.mode in ('RGBA', 'LA', 'P'):
                rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                rgb_image.paste(image, mask=image.split()[-1] if 'A' in image.mode else None)
                image = rgb_image
            
            # Salva em BytesIO
            output = BytesIO()
            format = 'JPEG' if file.content_type == 'image/jpeg' else 'PNG'
            quality = 85 if format == 'JPEG' else None
            
            save_kwargs = {'format': format}
            if quality:
                save_kwargs['quality'] = quality
                save_kwargs['optimize'] = True
                
            image.save(output, **save_kwargs)
            output.seek(0)
            
            return output
            
        except Exception as e:
            # Se falhar o redimensionamento, retorna original
            file.stream.seek(0)
            return BytesIO(file.stream.read())
    
    def upload_image(self, file: FileStorage, product_id: Optional[int] = None) -> Tuple[bool, str]:
        """
        Faz upload de uma imagem para o Supabase Storage
        
        Args:
            file: Arquivo de imagem enviado
            product_id: ID do produto (opcional, para organização)
            
        Returns:
            Tuple[bool, str]: (sucesso, url_publica_ou_mensagem_erro)
        """
        try:
            # Valida se é uma imagem
            if not self._validate_image(file):
                return False, "Arquivo deve ser uma imagem válida (JPEG, PNG, WebP, GIF)"
            
            # Gera nome único
            filename = self._generate_filename(file.filename)
            
            # Adiciona prefixo do produto se fornecido
            if product_id:
                filename = f"product_{product_id}/{filename}"
            
            # Redimensiona imagem
            resized_image = self._resize_image(file)
            
            # Detecta tipo MIME
            mime_type = mimetypes.guess_type(filename)[0] or 'image/jpeg'
            
            # Upload para Supabase
            result = self.client.storage.from_(self.bucket_name).upload(
                path=filename,
                file=resized_image.getvalue(),
                file_options={"content-type": mime_type}
            )
            
            if hasattr(result, 'error') and result.error:
                return False, f"Erro no upload: {result.error.message}"
            
            # Gera URL pública
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(filename)
            
            return True, public_url
            
        except Exception as e:
            return False, f"Erro interno no upload: {str(e)}"
    
    def delete_image(self, image_url: str) -> Tuple[bool, str]:
        """
        Deleta uma imagem do Supabase Storage
        
        Args:
            image_url: URL pública da imagem
            
        Returns:
            Tuple[bool, str]: (sucesso, mensagem)
        """
        try:
            # Extrai o path da URL
            # Exemplo: https://project.supabase.co/storage/v1/object/public/bucket/path
            # Queremos apenas o 'path'
            if '/object/public/' in image_url:
                path = image_url.split('/object/public/')[1]
                # Remove bucket name do início se estiver presente
                if path.startswith(f"{self.bucket_name}/"):
                    path = path[len(self.bucket_name)+1:]
            else:
                return False, "URL de imagem inválida"
            
            # Deleta do Supabase
            result = self.client.storage.from_(self.bucket_name).remove([path])
            
            if hasattr(result, 'error') and result.error:
                return False, f"Erro ao deletar: {result.error.message}"
            
            return True, "Imagem deletada com sucesso"
            
        except Exception as e:
            return False, f"Erro interno ao deletar: {str(e)}"
    
    def list_product_images(self, product_id: int) -> Tuple[bool, List[str]]:
        """
        Lista todas as imagens de um produto
        
        Args:
            product_id: ID do produto
            
        Returns:
            Tuple[bool, List[str]]: (sucesso, lista_de_urls)
        """
        try:
            path_prefix = f"product_{product_id}/"
            
            # Lista arquivos no diretório do produto
            result = self.client.storage.from_(self.bucket_name).list(path_prefix)
            
            if hasattr(result, 'error') and result.error:
                return False, []
            
            # Gera URLs públicas
            image_urls = []
            for file_info in result:
                filename = file_info['name']
                public_url = self.client.storage.from_(self.bucket_name).get_public_url(f"{path_prefix}{filename}")
                image_urls.append(public_url)
            
            return True, image_urls
            
        except Exception as e:
            return False, []
    
    def get_image_info(self, image_url: str) -> dict:
        """
        Obtém informações sobre uma imagem
        
        Args:
            image_url: URL pública da imagem
            
        Returns:
            dict: Informações da imagem
        """
        try:
            # Extrai path da URL
            if '/object/public/' in image_url:
                path = image_url.split('/object/public/')[1]
                if path.startswith(f"{self.bucket_name}/"):
                    path = path[len(self.bucket_name)+1:]
            else:
                return {"error": "URL inválida"}
            
            # Busca informações do arquivo
            result = self.client.storage.from_(self.bucket_name).get_file_info(path)
            
            if hasattr(result, 'error') and result.error:
                return {"error": result.error.message}
            
            return {
                "size": result.get("ContentLength", 0),
                "content_type": result.get("ContentType", ""),
                "last_modified": result.get("LastModified", ""),
                "url": image_url
            }
            
        except Exception as e:
            return {"error": str(e)}

# Instância global do serviço
storage_service = SupabaseStorageService()
