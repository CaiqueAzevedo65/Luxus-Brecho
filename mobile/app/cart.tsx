import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CartScreen() {
  const cartItems = [
    { id: 1, name: 'Produto x', price: 150.00, quantity: 1 },
    { id: 2, name: 'Produto y', price: 200.00, quantity: 1 },
    { id: 3, name: 'Produto z', price: 100.00, quantity: 1 }
  ];

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const frete = 15.00;
  const total = subtotal + frete;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar barStyle="light-content" backgroundColor="#E91E63" />
      
      {/* Header */}
      <View style={{ backgroundColor: '#E91E63', paddingHorizontal: 16, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ 
            color: 'white', 
            fontSize: 18, 
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center',
            marginRight: 40 // Para compensar o espaço do botão voltar e centralizar
          }}>
            Carrinho de compras
          </Text>
        </View>
        
        {/* Seção de Localização/Desconto */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginTop: 16 
        }}>
          <Ionicons name="location-outline" size={16} color="white" />
          <Text style={{ color: 'white', fontSize: 14, marginLeft: 4 }}>
            %Text %
          </Text>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Seção Produtos */}
        <View style={{ padding: 16 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#FF8C00', 
            marginBottom: 16 
          }}>
            Produtos
          </Text>
          
          {cartItems.map((item, index) => (
            <View key={item.id}>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                paddingVertical: 16
              }}>
                {/* Imagem do produto */}
                <View style={{ 
                  width: 80, 
                  height: 80, 
                  backgroundColor: '#D0D0D0', 
                  borderRadius: 8,
                  marginRight: 16
                }} />
                
                {/* Informações do produto */}
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: '#333',
                    marginBottom: 4
                  }}>
                    {item.name}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#666',
                    marginBottom: 8
                  }}>
                    Quantidade: {item.quantity}
                  </Text>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold', 
                    color: '#E91E63'
                  }}>
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
                
                {/* Botões de quantidade */}
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity style={{ 
                    width: 32, 
                    height: 32, 
                    backgroundColor: '#E91E63', 
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <Ionicons name="add" size={16} color="white" />
                  </TouchableOpacity>
                  
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: 'bold',
                    marginBottom: 8
                  }}>
                    {item.quantity}
                  </Text>
                  
                  <TouchableOpacity style={{ 
                    width: 32, 
                    height: 32, 
                    backgroundColor: '#E91E63', 
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Ionicons name="remove" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Linha divisória */}
              {index < cartItems.length - 1 && (
                <View style={{ 
                  height: 1, 
                  backgroundColor: '#E91E63', 
                  opacity: 0.3,
                  marginVertical: 8
                }} />
              )}
            </View>
          ))}
        </View>
        
        {/* Seção Total */}
        <View style={{ 
          paddingHorizontal: 16,
          paddingVertical: 20
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopWidth: 2,
            borderTopColor: '#E91E63',
            paddingTop: 16
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#E91E63'
            }}>
              Total:
            </Text>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              color: '#E91E63'
            }}>
              R$ {total.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>
        
        {/* Seção Frete */}
        <View style={{ 
          paddingHorizontal: 16,
          paddingBottom: 32
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#E91E63',
            marginBottom: 8
          }}>
            Frete
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: '#333',
            marginBottom: 4
          }}>
            A Entrega ficou em: R$ {frete.toFixed(2).replace('.', ',')}
          </Text>
          <TouchableOpacity>
            <Text style={{ 
              fontSize: 14, 
              color: '#00CED1',
              textDecorationLine: 'underline'
            }}>
              Ver mais produtos →
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Botão Finalizar Compra */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          <TouchableOpacity style={{ 
            backgroundColor: '#E91E63',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}>
            <Text style={{ 
              color: 'white', 
              fontSize: 16, 
              fontWeight: 'bold'
            }}>
              Finalizar Compra
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
