// src/components/myComponents/InventoryMovementDetail.js
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CSpinner,
} from "@coreui/react";

function InventoryMovementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMovement = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/inventory-movements/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al cargar el movimiento");
      const data = await res.json();
      setMovement(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovement();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <CSpinner color="primary" />
        <p className="mt-2">Cargando movimiento...</p>
      </div>
    );
  }

  if (!movement) {
    return (
      <div className="text-center mt-5 text-danger">
        <p>No se encontró el movimiento.</p>
        <CButton color="secondary" onClick={() => navigate(-1)}>
          Volver
        </CButton>
      </div>
    );
  }

  const isEntry = movement.movementType === "IN";
  const isExit = movement.movementType === "OUT";

  return (
    <div style={{ maxWidth: "1000px", margin: "2rem auto" }}>
      <CButton color="secondary" size="sm" onClick={() => navigate(-1)}>
        ← Volver
      </CButton>

      <CCard className="mt-3 shadow-sm border-0">
        <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Movimiento #{movement.id} —{" "}
            {isEntry ? "Entrada de Inventario" : "Salida de Inventario"}
          </h5>
        </CCardHeader>

        <CCardBody style={{ backgroundColor: "#fafafa" }}>
          <div className="mb-3">
            <p>
              <strong>Documento de Referencia:</strong>{" "}
              {movement.referenceDocument || "-"}
            </p>
            <p>
              <strong>Nota:</strong> {movement.note || "-"}
            </p>
            <p>
              <strong>Almacén:</strong> {movement.warehouseName}
            </p>
            <p>
              <strong>Propietario:</strong> {movement.ownerName}
            </p>
            <p>
              <strong>Creado por:</strong> {movement.createdByName}
            </p>
            <p>
              <strong>Fecha de Creación:</strong>{" "}
              {new Date(movement.createdAt).toLocaleString()}
            </p>
          </div>

          <h5 className="mt-4 mb-3 text-primary fw-bold">
            Detalles del Movimiento
          </h5>

          <CCard className="border-light shadow-sm">
            <CCardBody>
              <CTable hover responsive align="middle" bordered>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Producto</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">
                      Cantidad
                    </CTableHeaderCell>
                    {isEntry && (
                      <>
                        <CTableHeaderCell className="text-center">
                          Costo Unitario
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-center">
                          Lote
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-center">
                          Fecha de Vencimiento
                        </CTableHeaderCell>
                      </>
                    )}
                    {isExit && (
                      <CTableHeaderCell className="text-center">
                        Precio Unitario Venta
                      </CTableHeaderCell>
                    )}
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {movement.details.map((d, idx) => (
                    <CTableRow key={idx}>
                      <CTableDataCell>{d.productName}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        {d.quantity}
                      </CTableDataCell>

                      {isEntry && (
                        <>
                          <CTableDataCell className="text-center">
                            {d.unitCost?.toFixed(2) || "-"}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            {d.lotNumber || "-"}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            {d.expirationDate
                              ? new Date(d.expirationDate).toLocaleDateString()
                              : "-"}
                          </CTableDataCell>
                        </>
                      )}

                      {isExit && (
                        <CTableDataCell className="text-center">
                          {d.sellPriceUnit
                            ? `$${d.sellPriceUnit.toFixed(2)}`
                            : "-"}
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCardBody>
      </CCard>
    </div>
  );
}

export default InventoryMovementDetail;
