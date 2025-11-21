import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CButton, CForm, CFormInput, CFormLabel, CAlert, CFormTextarea } from "@coreui/react";

function WhCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Manejo de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 🔹 Validación frontend
    if (!form.name.trim() || !form.location.trim()) {
      setError("Los campos Nombre y Ubicación son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/warehouses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const text = await res.text();

      if (!res.ok) {
        try {
          const data = JSON.parse(text);
          setError(data.message || "Error al crear el almacén");
        } catch {
          setError(text || "Error al crear el almacén");
        }
      } else {
        setSuccess("Almacén creado correctamente");
        setTimeout(() => navigate("/warehouse"), 1500);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Crear Almacén</h2>

      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <CForm onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <CFormLabel>Nombre *</CFormLabel>
        <CFormInput
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <CFormLabel>Ubicación *</CFormLabel>
        <CFormInput
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <CFormLabel>Descripción</CFormLabel>
        <CFormTextarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="3"
          disabled={loading}
        />

        <CButton
          type="submit"
          color="success"
          style={{ marginTop: "1rem" }}
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear Almacén"}
        </CButton>

        <CButton
          color="secondary"
          style={{ marginTop: "1rem", marginLeft: "0.5rem" }}
          onClick={() => navigate("/warehouse")}
          disabled={loading}
        >
          Cancelar
        </CButton>
      </CForm>
    </div>
  );
}

export default WhCreate;
