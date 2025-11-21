import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CButton, CForm, CFormInput, CFormLabel, CAlert } from "@coreui/react";

function EditUserForm() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");   // para errores
  const [success, setSuccess] = useState(""); // para éxito

  useEffect(() => {
    fetch(`http://localhost:8080/auth/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Error al obtener el usuario");
        }
        return res.json();
      })
      .then(data => setUser({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.username || "",
        email: data.email || "",
      }))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 🔹 Validaciones frontend
    if (!user.username.trim() || !user.email.trim()) {
      setError("El nombre de usuario y el email son obligatorios");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      setError("Por favor, introduce un email válido");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/auth/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });

      const text = await res.text();

      if (!res.ok) {
        // Si backend manda JSON, parseamos; si no, usamos texto
        try {
          const data = JSON.parse(text);
          setError(data.message || "Error al actualizar el usuario");
        } catch {
          setError(text || "Error al actualizar el usuario");
        }
      } else {
        setSuccess("Usuario actualizado correctamente");
        setTimeout(() => navigate("/account"), 1500);
      }

    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Editar Usuario</h2>

      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <CForm onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <CFormLabel>Nombre</CFormLabel>
        <CFormInput
          name="firstName"
          value={user.firstName}
          onChange={handleChange}
          disabled={loading}
        />

        <CFormLabel>Apellido</CFormLabel>
        <CFormInput
          name="lastName"
          value={user.lastName}
          onChange={handleChange}
          disabled={loading}
        />

        <CFormLabel>Username *</CFormLabel>
        <CFormInput
          name="username"
          value={user.username}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <CFormLabel>Email *</CFormLabel>
        <CFormInput
          type="email"
          name="email"
          value={user.email}
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
          {loading ? "Guardando..." : "Guardar Cambios"}
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

export default EditUserForm;
