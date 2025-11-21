import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CButton, CCard, CCardBody, CCardHeader, CAlert } from "@coreui/react";

function WarehouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [warehouse, setWarehouse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/warehouses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Error al obtener el almacén");
        }

        const data = await res.json();
        setWarehouse(data);
      } catch (err) {
        setError(err.message || "Error de conexión con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouse();
  }, [id, token]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <CAlert color="danger">{error}</CAlert>;
  if (!warehouse) return <CAlert color="warning">No se encontró el almacén</CAlert>;

  return (
    <div style={{ padding: "2rem" }}>
      <CCard>
        <CCardHeader>
          <h3>Detalles del Almacén</h3>
        </CCardHeader>
        <CCardBody>
          <p><strong>ID:</strong> {warehouse.id}</p>
          <p><strong>Nombre:</strong> {warehouse.name}</p>
          <p><strong>Ubicación:</strong> {warehouse.location}</p>
          <p><strong>Descripción:</strong> {warehouse.description || "Sin descripción"}</p>

          <div style={{ marginTop: "1rem" }}>
            <CButton color="secondary" onClick={() => navigate("/warehouse")}>
              Volver
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
}

export default WarehouseDetail;
