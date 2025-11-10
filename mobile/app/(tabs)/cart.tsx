import React, { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StatusBar, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen() {
  const {
    cart,
    loading,
    getTotalItems,
    getSubtotal,
    getShippingCost,
    getTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart
  } = useCartStore();

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemoveItem = (productId: number, productName: string) => {
    Alert.alert(
      'Remover item',
      `Tem certeza que deseja remover "${productName}" do carrinho?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeFromCart(productId) }
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Limpar carrinho',
      'Tem certeza que deseja remover todos os itens do carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearCart }
      ]
    );
  };

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();
  const totalItems = getTotalItems();

  return (
    <View style={{ flex: 1, backgroundColor: '#E91E63' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <StatusBar barStyle="light-content" backgroundColor="#E91E63" />
      
      {/* Header */}
      <View style={{ backgroundColor: '#E91E63', paddingHorizontal: 16, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ 
            color: 'white', 
            fontSize: 18, 
            fontWeight: 'bold',
          }}>
            Carrinho
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
            {totalItems} {totalItems === 1 ? 'item' : 'itens'} no carrinho
          </Text>
        </View>
        
        {/* Botão limpar carrinho */}
        {cart.length > 0 && (
          <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 8 }}>
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={{ color: 'white', fontSize: 14, textDecorationLine: 'underline' }}>
                Limpar carrinho
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={{ color: '#666', marginTop: 8 }}>Carregando carrinho...</Text>
          </View>
        ) : cart.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="cart-outline" size={64} color="#ccc" />
            <Text style={{ fontSize: 18, color: '#666', marginTop: 16, textAlign: 'center' }}>
              Seu carrinho está vazio
            </Text>
            <Text style={{ fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' }}>
              Adicione produtos para começar suas compras
            </Text>
            <TouchableOpacity 
              style={{ 
                backgroundColor: '#E91E63',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                marginTop: 24
              }}
              onPress={() => router.push('/')}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Continuar comprando
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Seção Produtos */}
            <View style={{ padding: 16 }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: '#FF8C00', 
                marginBottom: 16 
              }}>
                Produtos ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
              </Text>
              
              {cart.map((item, index) => (
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
                      marginRight: 16,
                      overflow: 'hidden'
                    }}>
                      {item.imagem ? (
                        <Image 
                          source={{ uri: item.imagem }} 
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name="image-outline" size={24} color="#999" />
                        </View>
                      )}
                    </View>
                    
                    {/* Informações do produto */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '600', 
                        color: '#333',
                        marginBottom: 4
                      }} numberOfLines={2}>
                        {item.titulo}
                      </Text>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: 'bold', 
                        color: '#E91E63'
                      }}>
                        R$ {(item.preco || 0).toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                    
                    {/* Botão de remover */}
                    <TouchableOpacity 
                      style={{ 
                        padding: 8
                      }}
                      onPress={() => handleRemoveItem(item.id, item.titulo)}
                      disabled={loading}
                    >
                      <Ionicons name="trash-outline" size={24} color="#E91E63" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Linha divisória */}
                  {index < cart.length - 1 && (
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
            
            {/* Seção Resumo de Valores */}
            <View style={{ 
              paddingHorizontal: 16,
              paddingVertical: 20,
              backgroundColor: 'white',
              marginHorizontal: 16,
              borderRadius: 12,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: '#333',
                marginBottom: 16
              }}>
                Resumo do Pedido
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#666' }}>Subtotal:</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 14, color: '#666' }}>
                  Frete:
                  {shippingCost === 0 && (
                    <Text style={{ color: '#4CAF50', fontSize: 12 }}> (Grátis)</Text>
                  )}
                </Text>
                <Text style={{ fontSize: 14, color: shippingCost === 0 ? '#4CAF50' : '#666' }}>
                  {shippingCost === 0 ? 'GRÁTIS' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                </Text>
              </View>
              
              {shippingCost > 0 && (
                <Text style={{ 
                  fontSize: 12, 
                  color: '#4CAF50',
                  textAlign: 'center',
                  marginBottom: 16
                }}>
                  Frete grátis para compras acima de R$ 150,00
                </Text>
              )}
              
              <View style={{ 
                height: 1, 
                backgroundColor: '#E91E63', 
                opacity: 0.3,
                marginBottom: 16
              }} />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
            
            {/* Botão Finalizar Compra */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: '#E91E63',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  opacity: loading ? 0.7 : 1
                }}
                disabled={loading || cart.length === 0}
                onPress={() => {
                  Alert.alert(
                    'Finalizar Compra',
                    `Total: R$ ${total.toFixed(2).replace('.', ',')}\n\nDeseja prosseguir com a compra?`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { 
                        text: 'Confirmar', 
                        onPress: () => {
                          Alert.alert('Sucesso!', 'Pedido realizado com sucesso!');
                          clearCart();
                          router.push('/');
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={{ 
                  color: 'white', 
                  fontSize: 16, 
                  fontWeight: 'bold'
                }}>
                  {loading ? 'Processando...' : 'Finalizar Compra'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ marginTop: 12, alignItems: 'center' }}
                onPress={() => router.push('/')}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: '#E91E63',
                  textDecorationLine: 'underline'
                }}>
                  Continuar comprando
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}
