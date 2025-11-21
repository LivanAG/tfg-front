// src/components/myComponents/InventoryMovementCreate.js
import { useState, useEffect } from "react";
import {
  CForm,
  CFormInput,
  CFormTextarea,
  CButton,
  CRow,
  CCol
} from "@coreui/react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

function InventoryMovementCreate() {
  const [movementType, setMovementType] = useState("IN");
  const [referenceDocument, setReferenceDocument] = useState("");
  const [note, setNote] = useState("");
  const [warehouse, setWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [details, setDetails] = useState([
    { product: null, quantity: 0, unitCost: 0, sellPriceUnit: 0, lotNumber: "", expirationDate: "" },
  ]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- Cargar productos y almacenes ---
  useEffect(() => {
    if (!token) return navigate("/login");

    const headers = { Authorization: `Bearer ${token}` };

    fetch("http://localhost:8080/api/products", { headers })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.content || [];
        setProducts(list.map((p) => ({ value: p.id, label: p.name })));
      })
      .catch((err) => console.error(err));

    fetch("http://localhost:8080/api/warehouses", { headers })
      .then((res) => res.json())
      .then((data) =>
        setWarehouses(data.map((w) => ({ value: w.id, label: w.name })))
      )
      .catch((err) => console.error(err));
  }, [token, navigate]);

  // --- Añadir línea de detalle ---
  const addDetail = () => {
    setDetails([
      ...details,
      { product: null, quantity: 0, unitCost: 0, sellPriceUnit: 0, lotNumber: "", expirationDate: "" },
    ]);
  };

  // --- Eliminar línea ---
  const removeDetail = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // --- Cambiar un valor de detalle ---
  const handleDetailChange = (index, field, value) => {
    const updated = [...details];
    updated[index][field] = value;
    setDetails(updated);
  };

  // --- Enviar formulario ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!warehouse) {
      setError("Debes seleccionar un almacén");
      setLoading(false);
      return;
    }

    // --- DTO adaptado al backend ---
    const dto = {
      movementType,
      referenceDocument,
      note,
      warehouseId: warehouse.value,
      entryDetails:
        movementType === "IN"
          ? details.map((d) => ({
              productId: d.product?.value,
              quantity: Number(d.quantity),
              unitCost: Number(d.unitCost),
              lotNumber: d.lotNumber || null,
              expirationDate: d.expirationDate || null,
            }))
          : null,
      exitDetails:
        movementType === "OUT"
          ? details.map((d) => ({
              productId: d.product?.value,
              quantity: Number(d.quantity),
              sellPriceUnit: Number(d.sellPriceUnit),
            }))
          : null,
    };

    fetch("http://localhost:8080/api/inventory-movements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    })
      .then(async (res) => {
        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text }; // Si no es JSON, mostramos texto plano
        }

        if (!res.ok) {
          const backendMessage =
            data.backendMessage ||
            data.message ||
            data.error ||
            (data.errors ? data.errors.join(", ") : "") ||
            "Error desconocido del servidor";
          throw new Error(backendMessage);
        }

        return data;
      })
      .then(() => navigate("/inventory-movements"))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto" }}>
      <h2>Registrar Movimiento de Inventario</h2>
      <CForm onSubmit={handleSubmit}>
        <CRow>
          <CCol md={4}>
            <label>Tipo de Movimiento</label>
            <Select
              options={[
                { value: "IN", label: "Entrada" },
                { value: "OUT", label: "Salida" },
              ]}
              value={{
                value: movementType,
                label: movementType === "IN" ? "Entrada" : "Salida",
              }}
              onChange={(opt) => setMovementType(opt.value)}
            />
          </CCol>
          <CCol md={4}>
            <CFormInput
              label="Documento de Referencia"
              value={referenceDocument}
              onChange={(e) => setReferenceDocument(e.target.value)}
            />
          </CCol>
          <CCol md={4}>
            <label>Almacén</label>
            <Select
              options={warehouses}
              value={warehouse}
              onChange={setWarehouse}
              placeholder="Seleccione un almacén"
            />
          </CCol>
        </CRow>

        <CFormTextarea
          label="Nota"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          style={{ marginTop: "1rem" }}
        />

        <h4 style={{ marginTop: "2rem" }}>
          Detalles de {movementType === "IN" ? "Entrada" : "Salida"}
        </h4>

        {details.map((d, i) => (
          <CRow key={i} className="align-items-end mb-3">
            <CCol md={3}>
              <label>Producto</label>
              <Select
                options={products}
                value={d.product}
                onChange={(val) => handleDetailChange(i, "product", val)}
              />
            </CCol>

            <CCol md={2}>
              <CFormInput
                type="number"
                label="Cantidad"
                value={d.quantity}
                onChange={(e) =>
                  handleDetailChange(i, "quantity", e.target.value)
                }
              />
            </CCol>

            {movementType === "IN" && (
              <>
                <CCol md={2}>
                  <CFormInput
                    type="number"
                    label="Costo Unitario"
                    value={d.unitCost}
                    onChange={(e) =>
                      handleDetailChange(i, "unitCost", e.target.value)
                    }
                  />
                </CCol>

                <CCol md={2}>
                  <CFormInput
                    label="Lote"
                    value={d.lotNumber}
                    onChange={(e) =>
                      handleDetailChange(i, "lotNumber", e.target.value)
                    }
                  />
                </CCol>

                <CCol md={2}>
                  <CFormInput
                    type="date"
                    label="Vencimiento"
                    value={d.expirationDate}
                    onChange={(e) =>
                      handleDetailChange(i, "expirationDate", e.target.value)
                    }
                  />
                </CCol>
              </>
            )}

            {movementType === "OUT" && (
              <CCol md={2}>
                <CFormInput
                  type="number"
                  label="Precio Unitario Venta"
                  value={d.sellPriceUnit}
                  onChange={(e) =>
                    handleDetailChange(i, "sellPriceUnit", e.target.value)
                  }
                />
              </CCol>
            )}

            <CCol md={1}>
              <CButton color="danger" onClick={() => removeDetail(i)}>
                X
              </CButton>
            </CCol>
          </CRow>
        ))}

        <CButton type="button" color="info" onClick={addDetail}>
          + Agregar Producto
        </CButton>

        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px", marginTop: "2rem" }}>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Movimiento"}
          </CButton>
          <CButton
            color="secondary"
            onClick={() => navigate("/inventory-movements")}
          >
            Cancelar
          </CButton>
        </div>
      </CForm>
    </div>
  );
}

export default InventoryMovementCreate;
