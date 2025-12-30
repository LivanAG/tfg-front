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
    length: "",
    width: "",
    weightUnit: "",
    dimensionUnit: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Si es edición, cargar detalles existentes ---
  useEffect(() => {
    if (!isEdit) return;

    fetch(`http://localhost:8080/api/products/${id}/details`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Error al obtener detalles");
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        setFormData({
          weight: data.weight ?? "",
          length: data.length ?? "",
          width: data.width ?? "",
          weightUnit: data.weightUnit ?? "",
          dimensionUnit: data.dimensionUnit ?? "",
        });
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error al obtener detalles");
      });
  }, [id, token, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = ["weight", "length", "width"];
    if (numericFields.includes(name)) {
      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const { weight, length, width, weightUnit, dimensionUnit } = formData;

    // --- Validación obligatorios ---
    if (!weight || !length || !width || !weightUnit || !dimensionUnit) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // --- Validación positivos ---
    if (parseFloat(weight) <= 0 || parseFloat(length) <= 0 || parseFloat(width) <= 0) {
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
        length: parseFloat(length),
        width: parseFloat(width),
        weightUnit,
        dimensionUnit,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            data?.backendMessage ||
            data?.message ||
            data?.details ||
            data?.detail ||
            data?.title ||
            "Error al guardar detalles técnicos";
          throw new Error(msg);
        }
        return data;
      })
      .then(() => navigate(`/products/${id}`))
      .catch((err) => setError(err.message))
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
          label="Unidad de Peso (kg, g, lb...)"
          name="weightUnit"
          type="text"
          value={formData.weightUnit}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />

        <CFormInput
          label="Largo"
          name="length"
          type="text"
          inputMode="decimal"
          value={formData.length}
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
          label="Unidad de Dimensión (cm, m, in...)"
          name="dimensionUnit"
          type="text"
          value={formData.dimensionUnit}
          onChange={handleChange}
          style={{ marginBottom: "1rem" }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px" }}>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </CButton>
          <CButton color="secondary" onClick={() => navigate(`/products/${id}`)} disabled={loading}>
            Cancelar
          </CButton>
        </div>
      </CForm>
    </div>
  );
}

export default ProductDetailsForm;
