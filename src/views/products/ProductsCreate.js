import { useState, useEffect } from "react";
import { CForm, CFormInput, CFormTextarea, CButton, CFormCheck } from "@coreui/react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";

function ProductsCreate() {
  const { id } = useParams(); // <-- detecta si hay un id en la URL
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    name: "",
    description: "",
    hasExpirationDate: false,
    categoryId: null,
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- Cargar categorías ---
  useEffect(() => {
    fetch("http://localhost:8080/api/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setCategories(data.map(c => ({ value: c.id, label: c.name }))))
      .catch(err => console.error(err));

  }, [token]);

  // --- Si estoy en modo edición, cargo el producto ---
  useEffect(() => {
    if (isEditMode) {
      fetch(`http://localhost:8080/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("No se pudo cargar el producto");
          return res.json();
        })
        .then(data => {
          setFormData({
            sku: data.sku,
            barcode: data.barcode,
            name: data.name,
            description: data.description,
            hasExpirationDate: data.hasExpirationDate,
            categoryId: data.categoryId,
          });
        })
        .catch(err => setError(err.message));
    }
  }, [id, isEditMode, token]);




  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCategoryChange = (option) => {
    setSelectedCategory(option);
    setFormData(prev => ({ ...prev, categoryId: option ? option.value : null }));
  };

 

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.sku || !formData.barcode || !formData.name || !formData.categoryId) {
      setError("SKU, Barcode, Nombre y Categoría son obligatorios");
      setLoading(false);
      return;
    }

    const url = isEditMode
      ? `http://localhost:8080/api/products/${id}`
      : "http://localhost:8080/api/products";

    const method = isEditMode ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sku: formData.sku,
        barcode: formData.barcode,
        name: formData.name,
        description: formData.description,
        hasExpirationDate: formData.hasExpirationDate,
        categoryId: parseInt(formData.categoryId),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.backendMessage || data.message || "Error al guardar el producto");
        }
        return data;
      })
      .then(() => navigate("/products"))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2>{isEditMode ? "Editar Producto" : "Crear Producto"}</h2>
      <CForm onSubmit={handleSubmit}>
        <CFormInput
          type="text"
          name="sku"
          label="SKU"
          value={formData.sku}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />

        <CFormInput
          type="text"
          name="barcode"
          label="Código de barras"
          value={formData.barcode}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />

        <CFormInput
          type="text"
          name="name"
          label="Nombre"
          value={formData.name}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />

        <CFormTextarea
          name="description"
          label="Descripción"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          style={{ marginBottom: "1rem" }}
        />

        <CFormCheck
          type="checkbox"
          name="hasExpirationDate"
          label="Tiene fecha de vencimiento"
          checked={formData.hasExpirationDate}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />

        <div style={{ marginBottom: "1rem" }}>
          <label>Categoría</label>
          <Select
            options={categories}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="Seleccione una categoría"
            isClearable
          />
        </div>


        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px" }}>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading ? (isEditMode ? "Guardando..." : "Creando...") : (isEditMode ? "Guardar Cambios" : "Crear Producto")}
          </CButton>
          <CButton color="secondary" onClick={() => navigate("/products")}>
            Cancelar
          </CButton>
        </div>
      </CForm>
    </div>
  );
}

export default ProductsCreate;
