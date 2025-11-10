import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Linking, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useToast } from '../contexts/ToastContext';

export default function ContactScreen() {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.email || !formData.assunto || !formData.mensagem) {
      error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulação de envio
    setTimeout(() => {
      success('Mensagem enviada! Entraremos em contato em breve. ✉️');
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: ''
      });
      setIsSubmitting(false);
      setTimeout(() => router.back(), 1500);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#E91E63" />
      
      {/* Header */}
      <View className="bg-pink-600 px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Entre em Contato</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Hero Section */}
        <View className="bg-pink-50 p-6">
          <Text className="text-gray-800 text-lg font-bold text-center">
            Adoraríamos ouvir você!
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Envie sua mensagem e responderemos o mais breve possível.
          </Text>
        </View>

        {/* Contact Form */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-800 mb-4">Envie sua Mensagem</Text>
          
          {/* Nome */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Nome Completo *</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Seu nome"
              value={formData.nome}
              onChangeText={(value) => handleChange('nome', value)}
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">E-mail *</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
            />
          </View>

          {/* Telefone */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Telefone</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="(19) 98225-1266"
              keyboardType="phone-pad"
              value={formData.telefone}
              onChangeText={(value) => handleChange('telefone', value)}
            />
          </View>

          {/* Assunto */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Assunto *</Text>
            <View className="bg-white border border-gray-300 rounded-lg">
              <TouchableOpacity
                className="px-4 py-3 flex-row items-center justify-between"
                onPress={() => {
                  Alert.alert(
                    'Selecione um assunto',
                    '',
                    [
                      { text: 'Dúvida sobre produto', onPress: () => handleChange('assunto', 'Dúvida sobre produto') },
                      { text: 'Status do pedido', onPress: () => handleChange('assunto', 'Status do pedido') },
                      { text: 'Troca ou devolução', onPress: () => handleChange('assunto', 'Troca ou devolução') },
                      { text: 'Sugestão', onPress: () => handleChange('assunto', 'Sugestão') },
                      { text: 'Reclamação', onPress: () => handleChange('assunto', 'Reclamação') },
                      { text: 'Outro', onPress: () => handleChange('assunto', 'Outro') },
                      { text: 'Cancelar', style: 'cancel' }
                    ]
                  );
                }}
              >
                <Text className={formData.assunto ? 'text-gray-800' : 'text-gray-400'}>
                  {formData.assunto || 'Selecione um assunto'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mensagem */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Mensagem *</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Escreva sua mensagem aqui..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={formData.mensagem}
              onChangeText={(value) => handleChange('mensagem', value)}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`rounded-lg py-4 flex-row items-center justify-center ${isSubmitting ? 'bg-pink-400' : 'bg-pink-600'}`}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Ionicons name="send-outline" size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View className="p-4 pb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">Informações de Contato</Text>
          
          <View className="space-y-3">
            {/* Email */}
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl p-4"
              onPress={() => Linking.openURL('mailto:contato@luxusbrecho.com')}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="mail-outline" size={24} color="#E91E63" />
                <Text className="text-gray-800 font-bold ml-3">E-mail</Text>
              </View>
              <Text className="text-gray-600">contato@luxusbrecho.com</Text>
            </TouchableOpacity>

            {/* Phone */}
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl p-4"
              onPress={() => Linking.openURL('tel:+5519982251266')}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="call-outline" size={24} color="#E91E63" />
                <Text className="text-gray-800 font-bold ml-3">Telefone</Text>
              </View>
              <Text className="text-gray-600">(19) 98225-1266</Text>
            </TouchableOpacity>

            {/* Address */}
            <View className="bg-white border border-gray-200 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="location-outline" size={24} color="#E91E63" />
                <Text className="text-gray-800 font-bold ml-3">Endereço</Text>
              </View>
              <Text className="text-gray-600">
                Rua Barão de Parnaíba, 269{'\n'}
                Centro, Campinas, SP{'\n'}
                13013-170 - Brasil
              </Text>
            </View>

            {/* Instagram */}
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl p-4"
              onPress={() => Linking.openURL('https://www.instagram.com/luxus.brecho_/')}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="logo-instagram" size={24} color="#E91E63" />
                <Text className="text-gray-800 font-bold ml-3">Instagram</Text>
              </View>
              <Text className="text-gray-600">@luxus.brecho_</Text>
            </TouchableOpacity>

            {/* Business Hours */}
            <View className="bg-pink-50 rounded-xl p-4 mt-4">
              <Text className="text-gray-800 font-bold mb-3">Horário de Atendimento</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-700 font-semibold">Segunda a Sexta:</Text>
                  <Text className="text-gray-600">9h às 18h</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-700 font-semibold">Sábado:</Text>
                  <Text className="text-gray-600">9h às 14h</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-700 font-semibold">Domingo:</Text>
                  <Text className="text-gray-600">Fechado</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
