import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useZodForm } from '../../hooks/useZodForm';
import { CreateProductSchema, type CreateProduct } from '../../schemas/product.schema';

interface ProductFormProps {
  onSubmit: (data: CreateProduct) => Promise<void>;
  initialValues?: Partial<CreateProduct>;
}

export function ProductForm({ onSubmit, initialValues }: ProductFormProps) {
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit
  } = useZodForm<CreateProduct>({
    schema: CreateProductSchema,
    onSubmit,
    initialValues
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nome do Produto *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={values.name}
          onChangeText={(value) => handleChange('name', value)}
          placeholder="Digite o nome do produto"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={values.description}
          onChangeText={(value) => handleChange('description', value)}
          placeholder="Digite a descrição do produto"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Preço *</Text>
        <TextInput
          style={[styles.input, errors.price && styles.inputError]}
          value={values.price?.toString()}
          onChangeText={(value) => handleChange('price', Number(value))}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Marca</Text>
        <TextInput
          style={styles.input}
          value={values.brand}
          onChangeText={(value) => handleChange('brand', value)}
          placeholder="Digite a marca"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Categoria</Text>
        <TextInput
          style={styles.input}
          value={values.category}
          onChangeText={(value) => handleChange('category', value)}
          placeholder="Digite a categoria"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Estoque *</Text>
        <TextInput
          style={[styles.input, errors.stock && styles.inputError]}
          value={values.stock?.toString()}
          onChangeText={(value) => handleChange('stock', Number(value))}
          placeholder="0"
          keyboardType="number-pad"
        />
        {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#E91E63',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#E91E63',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#E91E63',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
