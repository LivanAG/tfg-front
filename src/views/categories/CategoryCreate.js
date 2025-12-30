import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CButton, CForm, CFormInput, CFormLabel, CAlert, CFormTextarea } from "@coreui/react";

function CategoryCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
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

    // Validación frontend (name obligatorio)
    if (!form.name.trim()) {
      setError("El campo Nombre es obligatorio");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description?.trim() || "",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.backendMessage ||
          data?.message ||
          data?.details ||
          data?.detail ||
          data?.title ||
          "Error al crear la categoría";

        setError(msg);
      } else {
        setSuccess("Categoría creada correctamente");
        setTimeout(() => navigate("/categories"), 1200);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Crear Categoría</h2>

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

        <CFormLabel style={{ marginTop: "1rem" }}>Descripción</CFormLabel>
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
          {loading ? "Creando..." : "Crear Categoría"}
        </CButton>

        <CButton
          color="secondary"
          style={{ marginTop: "1rem", marginLeft: "0.5rem" }}
          onClick={() => navigate("/categories")}
          disabled={loading}
        >
          Cancelar
        </CButton>
      </CForm>
    </div>
  );
}

export default CategoryCreate;
