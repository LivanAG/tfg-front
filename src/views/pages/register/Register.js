import React, { useState } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilUser } from "@coreui/icons";

const Register = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 🔹 Validaciones frontend
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("El correo no es válido.");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/auth/register-owner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        try {
          const data = JSON.parse(text);
          setError(data.message || "Error al registrar el usuario.");
        } catch {
          setError(text || "Error al registrar el usuario.");
        }
      } else {
        setSuccess("Usuario registrado correctamente. Redirigiendo...");
        setTimeout(() => (window.location.href = "/login"), 1500);
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4 shadow">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Registro</h1>
                  <p className="text-body-secondary">Crea tu cuenta</p>

                  {error && <CAlert color="danger">{error}</CAlert>}
                  {success && <CAlert color="success">{success}</CAlert>}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>Nombre</CInputGroupText>
                    <CFormInput
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>Apellido</CInputGroupText>
                    <CFormInput
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Username"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Contraseña"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repite la contraseña"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </CInputGroup>

                  <div className="d-grid">
                    <CButton color="success" type="submit" disabled={loading}>
                      {loading ? "Registrando..." : "Crear cuenta"}
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Register;
