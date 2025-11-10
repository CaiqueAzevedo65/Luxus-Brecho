import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SupportScreen() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Como faço para comprar?',
      answer: 'Navegue pela nossa loja, escolha os produtos desejados e adicione ao carrinho. Depois é só finalizar a compra informando seus dados e forma de pagamento.'
    },
    {
      question: 'Quais formas de pagamento vocês aceitam?',
      answer: 'Aceitamos Visa, Mastercard, PayPal e Google Pay. Todas as transações são seguras e criptografadas.'
    },
    {
      question: 'Qual o prazo de entrega?',
      answer: 'O prazo de entrega varia de acordo com sua localização. Geralmente leva de 5 a 15 dias úteis. Você receberá um código de rastreamento assim que o pedido for enviado.'
    },
    {
      question: 'Posso trocar ou devolver um produto?',
      answer: 'Sim! Você tem até 7 dias após o recebimento para solicitar troca ou devolução, desde que o produto esteja em perfeitas condições.'
    },
    {
      question: 'Como funciona o frete grátis?',
      answer: 'Oferecemos frete grátis para compras acima de R$ 150,00. Para valores abaixo, o frete é calculado de acordo com sua região.'
    },
    {
      question: 'Os produtos são novos ou usados?',
      answer: 'Somos um brechó, então nossos produtos são de segunda mão, mas todos passam por rigorosa seleção e são cuidadosamente higienizados e revisados antes de serem listados.'
    },
    {
      question: 'As peças são únicas?',
      answer: 'Sim! Todas as peças do Luxus Brechó são únicas. Por isso, cada produto só pode ser adicionado uma vez ao carrinho e não há controle de quantidade. Quando você encontrar uma peça especial, garanta logo, pois ela pode não estar disponível depois!'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
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
          <Text className="text-white text-xl font-bold">Central de Suporte</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Hero Section */}
        <View className="bg-pink-50 p-6 items-center">
          <Ionicons name="help-circle-outline" size={64} color="#E91E63" />
          <Text className="text-gray-800 text-lg font-bold mt-4 text-center">
            Estamos aqui para ajudar!
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Encontre respostas rápidas ou entre em contato conosco.
          </Text>
        </View>

        {/* FAQ Section */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-800 mb-4">Perguntas Frequentes</Text>
          
          {faqs.map((faq, index) => (
            <View key={index} className="mb-3">
              <TouchableOpacity
                className="bg-white border border-gray-200 rounded-xl p-4"
                onPress={() => toggleFaq(index)}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-800 font-semibold flex-1 pr-2">
                    {faq.question}
                  </Text>
                  <Ionicons 
                    name={openFaq === index ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#9CA3AF"
                  />
                </View>
                
                {openFaq === index && (
                  <Text className="text-gray-600 mt-3 leading-6">
                    {faq.answer}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Contact Options */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-800 mb-4">Outras Formas de Contato</Text>
          
          <View className="space-y-3">
            {/* WhatsApp */}
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center"
              onPress={() => Linking.openURL('https://wa.me/5519982251266')}
            >
              <View className="bg-green-100 p-3 rounded-full">
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-800 font-bold">Chat Online</Text>
                <Text className="text-gray-600 text-sm">Fale conosco em tempo real</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center"
              onPress={() => Linking.openURL('mailto:suporte@luxusbrecho.com')}
            >
              <View className="bg-blue-100 p-3 rounded-full">
                <Ionicons name="mail-outline" size={24} color="#3B82F6" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-800 font-bold">E-mail</Text>
                <Text className="text-gray-600 text-sm">Resposta em até 24 horas</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Phone */}
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center"
              onPress={() => Linking.openURL('tel:+5519982251266')}
            >
              <View className="bg-pink-100 p-3 rounded-full">
                <Ionicons name="call-outline" size={24} color="#E91E63" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-800 font-bold">Telefone</Text>
                <Text className="text-gray-600 text-sm">Seg-Sex, 9h às 18h</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Help Section */}
        <View className="p-4 pb-8">
          <View className="bg-pink-50 rounded-xl p-6 items-center">
            <Text className="text-gray-800 font-bold text-lg mb-2">
              Não encontrou o que procurava?
            </Text>
            <Text className="text-gray-600 text-center mb-4">
              Entre em contato conosco através da nossa página de contato.
            </Text>
            <TouchableOpacity
              className="bg-pink-600 px-6 py-3 rounded-lg"
              onPress={() => router.push('/contact')}
            >
              <Text className="text-white font-bold">Ir para Contato</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
