/**
 * Serviço para busca de endereço por CEP usando a API ViaCEP
 * Documentação: https://viacep.com.br/
 */

/**
 * Busca endereço pelo CEP
 * @param {string} cep - CEP no formato 00000-000 ou 00000000
 * @returns {Promise<Object>} Dados do endereço ou erro
 */
export const buscarCep = async (cep) => {
  try {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');

    // Valida formato do CEP
    if (cepLimpo.length !== 8) {
      return {
        success: false,
        error: 'CEP deve conter 8 dígitos'
      };
    }

    // Faz requisição para a API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!response.ok) {
      return {
        success: false,
        error: 'Erro ao buscar CEP. Tente novamente.'
      };
    }

    const data = await response.json();

    // Verifica se o CEP foi encontrado
    if (data.erro) {
      return {
        success: false,
        error: 'CEP não encontrado'
      };
    }

    // Retorna dados formatados
    return {
      success: true,
      data: {
        cep: cep,
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
        complemento: data.complemento || ''
      }
    };

  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return {
      success: false,
      error: 'Erro ao buscar CEP. Verifique sua conexão.'
    };
  }
};

/**
 * Formata CEP para o padrão 00000-000
 * @param {string} cep - CEP sem formatação
 * @returns {string} CEP formatado
 */
export const formatarCep = (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return cep;
  return `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5)}`;
};
