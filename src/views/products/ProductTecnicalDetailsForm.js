import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CForm, CFormInput, CButton } from "@coreui/react";

function ProductDetailsForm() {
  const { id } = useParams(); // productId
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const isEdit = location.pathname.includes("/details/edit"); // detecta si es edición

  const [formData, setFormData] = useState({
    weight: "",
    width: "",
    height: "",
    depth: "",
    unitOfMeasure: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Si es edición, cargar detalles existentes ---
  useEffect(() => {
    if (!isEdit) return; // si es agregar, no cargar
    fetch(`http://localhost:8080/api/products/${id}/details`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Error al obtener detalles");
        return res.json();
      })
      .then(data => {
        if (data) setFormData({
          weight: data.weight,
          width: data.width,
          height: data.height,
          depth: data.depth,
          unitOfMeasure: data.unitOfMeasure,
        });
      })
      .catch(err => console.error(err));
  }, [id, token, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = ["weight", "width", "height", "depth"];
    if (numericFields.includes(name)) {
      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // --- Validación de campos obligatorios ---
    const { weight, width, height, depth, unitOfMeasure } = formData;
    if (!weight || !width || !height || !depth || !unitOfMeasure) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // --- Validación de números positivos ---
    if (parseFloat(weight) <= 0 || parseFloat(width) <= 0 || parseFloat(height) <= 0 || parseFloat(depth) <= 0) {
      setError("Los valores numéricos deben ser mayores que cero");
      return;
    }

    setLoading(true);

    fetch(`http://localhost:8080/api/products/${id}/details`, {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        weight: parseFloat(weight),
        width: parseFloat(width),
        height: parseFloat(height),
        depth: parseFloat(depth),
        unitOfMeasure,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.backendMessage || data?.message || "Error al guardar detalles técnicos");
        }
        return data;
      })
      .then(() => navigate(`/products/${id}`))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto" }}>
      <h2>{isEdit ? "Editar" : "Agregar"} Detalles Técnicos</h2>
      <CForm onSubmit={handleSubmit}>
        <CFormInput
          label="Peso"
          name="weight"
          type="text"
          inputMode="decimal"
          value={formData.weight}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />
        <CFormInput
          label="Ancho"
          name="width"
          type="text"
          inputMode="decimal"
          value={formData.width}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />
        <CFormInput
          label="Alto"
          name="height"
          type="text"
          inputMode="decimal"
          value={formData.height}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />
        <CFormInput
          label="Profundidad"
          name="depth"
          type="text"
          inputMode="decimal"
          value={formData.depth}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />
        <CFormInput
          label="Unidad de Medida"
          name="unitOfMeasure"
          type="text"
          value={formData.unitOfMeasure}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px" }}>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </CButton>
          <CButton color="secondary" onClick={() => navigate(`/products/${id}`)}>Cancelar</CButton>
        </div>
      </CForm>
    </div>
  );
}

export default ProductDetailsForm;
