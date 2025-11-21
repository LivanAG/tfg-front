import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CButton, CForm, CFormInput, CFormLabel, CAlert } from "@coreui/react";

function ChangePasswordForm() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [error, setError] = useState(""); // mensajes de error
  const [success, setSuccess] = useState(""); // mensajes de éxito
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 🔹 Validación frontend
    if (!form.currentPassword.trim() || !form.newPassword.trim()) {
      setError("Ambos campos son obligatorios");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/auth/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      // 🔹 El backend devuelve texto, no JSON
      const text = await res.text();

      if (!res.ok) {
        // intentar parsear mensaje del backend si es posible
        try {
          const data = JSON.parse(text);
          setError(data.message || "Error al actualizar la contraseña");
        } catch {
          setError(text || "Error al actualizar la contraseña");
        }
      } else {
        setSuccess("Contraseña actualizada correctamente");
        // redirige luego de 1.5s
        setTimeout(() => navigate("/account"), 1500);
      }

    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Cambiar Contraseña</h2>

      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <CForm onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <CFormLabel>Contraseña Actual</CFormLabel>
        <CFormInput
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <CFormLabel>Nueva Contraseña</CFormLabel>
        <CFormInput
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <CButton
          type="submit"
          color="success"
          style={{ marginTop: "1rem" }}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Actualizar Contraseña"}
        </CButton>

        <CButton
          color="secondary"
          style={{ marginTop: "1rem", marginLeft: "0.5rem" }}
          onClick={() => navigate("/account")}
          disabled={loading}
        >
          Cancelar
        </CButton>
      </CForm>
    </div>
  );
}

export default ChangePasswordForm;
