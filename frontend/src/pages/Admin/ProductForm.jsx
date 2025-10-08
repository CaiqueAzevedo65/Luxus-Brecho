import React, { useState, useEffect } from "react";
import { z } from "zod";
import api from "../../services/api";

// Schema de validação com Zod
const productSchema = z.object({
  titulo: z
    .string()
    .min(1, "Título é obrigatório")
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(100, "Título não pode ter mais de 100 caracteres"),
  preco: z
    .string()
    .min(1, "Preço é obrigatório")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, {
      message: "Preço deve ser um número válido maior que 0"
    }),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(500, "Descrição não pode ter mais de 500 caracteres"),
  categoria: z
    .string()
    .min(1, "Categoria é obrigatória")
    .max(50, "Categoria não pode ter mais de 50 caracteres"),
  imagem: z.string().optional()
});

export default function ProductForm({ product, onSaved }) {
  const [data, setData] = useState({
    titulo: "",
    preco: "",
    descricao: "",
    categoria: "",
    imagem: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setData({
        titulo: product.titulo || "",
        preco: product.preco || "",
        descricao: product.descricao || "",
        categoria: product.categoria || "",
        imagem: product.imagem || "",
      });
    }
  }, [product]);

  const validateField = (name, value) => {
    try {
      // Cria um objeto temporário para validar apenas este campo
      const tempData = { ...data, [name]: value };
      const fieldSchema = productSchema.shape[name];
      
      if (fieldSchema) {
        fieldSchema.parse(value);
        
        // Remove erro se validação passou
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (error) {
      // Tratamento mais defensivo do erro
      let errorMessage = `Erro no campo ${name}`;
      
      if (error && typeof error === 'object') {
        if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
          errorMessage = error.errors[0].message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Atualiza o estado
    setData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Valida o campo apenas se não estiver vazio (para não mostrar erro imediatamente)
    if (value.trim() !== '') {
      // Usa setTimeout para evitar problemas de sincronização
      setTimeout(() => validateField(name, value), 0);
    } else {
      // Remove erro se campo estiver vazio
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    console.log('🚀 Iniciando submissão do formulário...');
    console.log('📄 Dados do formulário:', data);

    try {
      // Valida todos os campos antes de enviar
      const validatedData = productSchema.parse(data);
      console.log('✅ Dados validados:', validatedData);

      let response;
      const url = product && product.id ? `/products/${product.id}` : '/products';
      const method = product && product.id ? 'PUT' : 'POST';
      
      console.log(`🎯 Fazendo requisição ${method} para: ${url}`);
      console.log('🔗 URL completa:', `${api.defaults.baseURL}${url}`);

      if (product && product.id) {
        response = await api.put(`/products/${product.id}`, validatedData);
      } else {
        response = await api.post("/products", validatedData);
      }

      console.log('✅ Resposta recebida:', response);
      console.log('📊 Status:', response.status);
      console.log('📄 Dados:', response.data);

      if (onSaved && typeof onSaved === 'function') {
        onSaved();
      }
      
      // Limpa formulário se for criação (não edição)
      if (!product) {
        setData({
          titulo: "",
          preco: "",
          descricao: "",
          categoria: "",
          imagem: "",
        });
        setErrors({});
        console.log('🧹 Formulário limpo após criação');
      }

    } catch (err) {
      console.error("❌ Erro completo:", err);
      console.error("📄 Dados enviados:", data);
      console.error("🎯 URL tentativa:", product ? `/products/${product.id}` : '/products');
      
      // Log detalhado do erro
      if (err.response) {
        console.error("📊 Response status:", err.response.status);
        console.error("📄 Response data:", err.response.data);
        console.error("📋 Response headers:", err.response.headers);
      }
      if (err.request) {
        console.error("📡 Request:", err.request);
      }
      if (err.config) {
        console.error("⚙️  Config:", err.config);
      }
      
      // Tratamento de erros de validação do Zod
      if (err && err.name === 'ZodError' && err.errors) {
        const fieldErrors = {};
        err.errors.forEach((error) => {
          if (error.path && error.path.length > 0) {
            const fieldName = error.path[0];
            fieldErrors[fieldName] = error.message || `Erro no campo ${fieldName}`;
          }
        });
        setErrors(fieldErrors);
      }
      // Tratamento de erros da API
      else if (err.response) {
        const status = err.response.status;
        const responseData = err.response.data;
        
        let errorMessage = "Erro no servidor";
        
        if (status === 308) {
          errorMessage = "Erro de redirecionamento. Verifique se o backend está configurado corretamente.";
        } else if (status === 400) {
          errorMessage = "Dados inválidos enviados para o servidor";
          if (responseData && responseData.message) {
            errorMessage = responseData.message;
          }
        } else if (status === 404) {
          errorMessage = "Endpoint não encontrado. Verifique se a rota /api/products existe no backend";
        } else if (status === 405) {
          errorMessage = "Método não permitido. Verifique se a rota aceita POST/PUT";
        } else if (status >= 500) {
          errorMessage = "Erro interno do servidor. Verifique os logs do backend";
          if (responseData && responseData.message) {
            errorMessage += `: ${responseData.message}`;
          }
        }
        
        setErrors({ 
          submit: `${errorMessage} (Status: ${status})`,
          debug: responseData ? JSON.stringify(responseData, null, 2) : 'Sem dados de resposta'
        });
      }
      // Erros de timeout
      else if (err.code === 'ECONNABORTED' && err.message.includes('timeout')) {
        setErrors({ 
          submit: "⏱️ Timeout: O servidor não respondeu em 30 segundos. Verifique se o backend Flask está rodando e acessível."
        });
      }
      // Erros de conexão
      else if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setErrors({ 
          submit: "❌ Não foi possível conectar ao servidor. Certifique-se de que:\n• O backend Flask está rodando na porta 5000\n• A URL http://127.0.0.1:5000 está acessível\n• Não há bloqueio de CORS" 
        });
      }
      // Outros erros
      else {
        setErrors({ submit: `Erro inesperado: ${err.message}` });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>{product ? 'Editar Produto' : 'Novo Produto'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Título *
          </label>
          <input
            name="titulo"
            value={data.titulo}
            onChange={handleChange}
            placeholder="Digite o título do produto"
            style={{
              width: '100%',
              padding: '10px',
              border: errors.titulo ? '2px solid #ff4444' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          {errors.titulo && (
            <span style={{ 
              color: '#ff4444', 
              fontSize: '14px', 
              display: 'block', 
              marginTop: '5px' 
            }}>
              {errors.titulo}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Preço (R$) *
          </label>
          <input
            name="preco"
            type="number"
            step="0.01"
            min="0"
            value={data.preco}
            onChange={handleChange}
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '10px',
              border: errors.preco ? '2px solid #ff4444' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          {errors.preco && (
            <span style={{ 
              color: '#ff4444', 
              fontSize: '14px', 
              display: 'block', 
              marginTop: '5px' 
            }}>
              {errors.preco}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Descrição *
          </label>
          <textarea
            name="descricao"
            value={data.descricao}
            onChange={handleChange}
            placeholder="Descreva o produto..."
            rows="4"
            style={{
              width: '100%',
              padding: '10px',
              border: errors.descricao ? '2px solid #ff4444' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
          {errors.descricao && (
            <span style={{ 
              color: '#ff4444', 
              fontSize: '14px', 
              display: 'block', 
              marginTop: '5px' 
            }}>
              {errors.descricao}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Categoria *
          </label>
          <input
            name="categoria"
            value={data.categoria}
            onChange={handleChange}
            placeholder="Ex: Roupas, Acessórios, Calçados..."
            style={{
              width: '100%',
              padding: '10px',
              border: errors.categoria ? '2px solid #ff4444' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          {errors.categoria && (
            <span style={{ 
              color: '#ff4444', 
              fontSize: '14px', 
              display: 'block', 
              marginTop: '5px' 
            }}>
              {errors.categoria}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            URL da Imagem (opcional)
          </label>
          <input
            name="imagem"
            type="url"
            value={data.imagem}
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem.jpg"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {errors.submit && (
          <div style={{ 
            color: '#ff4444', 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#ffebee', 
            borderRadius: '4px',
            border: '1px solid #ffcdd2'
          }}>
            <strong>Erro:</strong> {errors.submit}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: isSubmitting ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = '#007bff';
            }
          }}
        >
          {isSubmitting ? "Salvando..." : (product ? "Atualizar Produto" : "Criar Produto")}
        </button>
      </form>
    </div>
  );
}