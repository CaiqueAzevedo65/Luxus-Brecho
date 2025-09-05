import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function ProductForm({ product, onSaved }) {
  const [data, setData] = useState({
    titulo: "",
    preco: "",
    descricao: "",
    categoria: "",
    imagem: "",
  });

  useEffect(() => {
    if (product) setData(product);
  }, [product]);

  const handleChange = e => {
    setData({...data, [e.target.name]: e.target.value});
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (product) {
        await api.put(`/products/${product.id}`, data);
      } else {
        await api.post("/products", data);
      }
      onSaved();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="titulo" value={data.titulo} onChange={handleChange} placeholder="Título" />
      <input name="preco" type="number" value={data.preco} onChange={handleChange} placeholder="Preço" />
      <input name="descricao" value={data.descricao} onChange={handleChange} placeholder="Descrição" />
      <input name="categoria" value={data.categoria} onChange={handleChange} placeholder="Categoria" />
      <input name="imagem" value={data.imagem} onChange={handleChange} placeholder="URL Imagem" />
      <button type="submit">Salvar</button>
    </form>
  );
}
