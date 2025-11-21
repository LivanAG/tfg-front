import { useEffect, useState } from "react";
import {
  CForm,
  CFormInput,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CFormLabel,
  CFormSelect,
} from "@coreui/react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

function ReportCreate() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [reportType, setReportType] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [format, setFormat] = useState("PDF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportBlob, setReportBlob] = useState(null);

  // Tipos de reportes
  const reportOptions = [
    { value: "INVENTORY_SUMMARY", label: "Resumen de Inventario" },
    { value: "SALES", label: "Ventas" },
    { value: "PURCHASES", label: "Compras" },
    { value: "STOCK_VALUATION", label: "Valoración de Stock" },
    { value: "EXPIRATION", label: "Productos Próximos a Vencer" },
  ];

  // Cargar almacenes y categorías
  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    fetch("http://localhost:8080/api/warehouses", { headers })
      .then((res) => res.json())
      .then((data) =>
        setWarehouses(data.map((w) => ({ value: w.id, label: w.name })))
      )
      .catch((err) => console.error(err));

    fetch("http://localhost:8080/api/categories", { headers })
      .then((res) => res.json())
      .then((data) =>
        setCategories(data.map((c) => ({ value: c.id, label: c.name })))
      )
      .catch((err) => console.error(err));
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setReportBlob(null);

    if (!reportType) {
      setError("Debe seleccionar un tipo de reporte");
      return;
    }

    // Validación de fechas solo para ventas y compras
    if (["SALES", "PURCHASES"].includes(reportType.value)) {
      if (!dateFrom || !dateTo) {
        setError("Debe seleccionar ambas fechas para este reporte");
        return;
      }
      if (dateTo < dateFrom) {
        setError("La fecha 'Hasta' no puede ser anterior a 'Desde'");
        return;
      }
    }

    setLoading(true);

    const params = {
      reportType: reportType.value,
      warehouseId: selectedWarehouse?.value || null,
      categoryId: selectedCategory?.value || null,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      format: format,
    };

    fetch("http://localhost:8080/api/reports/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Error al generar el reporte");

        const blob = await res.blob();
        setReportBlob(blob);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // Determinar si mostrar fechas
  const showDateFields = ["SALES", "PURCHASES"].includes(reportType?.value);

  // Texto de explicación según reporte
  const getReportDescription = () => {
    switch (reportType?.value) {
      case "EXPIRATION":
        return "Este reporte muestra los productos próximos a vencer en los próximos 30 días a partir de hoy.";
      case "STOCK_VALUATION":
        return "Este reporte muestra la valoración de stock por almacén y categoría.";
      case "INVENTORY_SUMMARY":
        return "Este reporte muestra un resumen del inventario por almacén y categoría.";
      case "SALES":
        return "Este reporte muestra las ventas en el rango de fechas seleccionado.";
      case "PURCHASES":
        return "Este reporte muestra las compras en el rango de fechas seleccionado.";
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto" }}>
      <h2>Generar Reporte</h2>
      <p className="text-muted">
        Seleccione los parámetros del reporte que desea generar.
      </p>

      <CForm onSubmit={handleSubmit}>
        {/* Tipo de reporte */}
        <div style={{ marginBottom: "1rem" }}>
          <CFormLabel>Tipo de Reporte</CFormLabel>
          <Select
            options={reportOptions}
            value={reportType}
            onChange={setReportType}
            placeholder="Seleccione un tipo de reporte"
          />
        </div>

        {/* Texto de explicación */}
        {reportType && (
          <p style={{ fontStyle: "italic", color: "#555" }}>
            {getReportDescription()}
          </p>
        )}

        {/* Filtros */}
        <CRow className="mb-3">
          <CCol md={6}>
            <CFormLabel>Almacén</CFormLabel>
            <Select
              options={warehouses}
              value={selectedWarehouse}
              onChange={setSelectedWarehouse}
              placeholder="Todos los almacenes"
              isClearable
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Categoría</CFormLabel>
            <Select
              options={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Todas las categorías"
              isClearable
            />
          </CCol>
        </CRow>

        {/* Fechas solo para ventas y compras */}
        {showDateFields && (
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                type="date"
                label="Desde"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="date"
                label="Hasta"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </CCol>
          </CRow>
        )}

     

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading ? (
              <>
                <CSpinner size="sm" /> Generando...
              </>
            ) : (
              "Generar Reporte"
            )}
          </CButton>
          <CButton color="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </CButton>
        </div>
      </CForm>

      {/* Vista previa y descarga */}
      {reportBlob && format === "PDF" && (
        <div style={{ marginTop: "2rem" }}>
          <h4>Vista Previa del Reporte</h4>
          <iframe
            src={URL.createObjectURL(reportBlob)}
            width="100%"
            height="600px"
            title="Vista Previa del Reporte"
          />
          <CButton
            color="success"
            onClick={() => {
              const link = document.createElement("a");
              link.href = URL.createObjectURL(reportBlob);
              link.download = `reporte_${reportType.value}.${format.toLowerCase()}`;
              link.click();
            }}
            style={{ marginTop: "1rem" }}
          >
            Descargar Reporte
          </CButton>
        </div>
      )}

      {reportBlob && format !== "PDF" && (
        <div style={{ marginTop: "2rem" }}>
          <h4>Reporte Generado</h4>
          <p>
            El reporte está listo. Haga clic en "Descargar Reporte" para obtener
            el archivo.
          </p>
          <CButton
            color="success"
            onClick={() => {
              const link = document.createElement("a");
              link.href = URL.createObjectURL(reportBlob);
              link.download = `reporte_${reportType.value}.${format.toLowerCase()}`;
              link.click();
            }}
          >
            Descargar Reporte
          </CButton>
        </div>
      )}
    </div>
  );
}

export default ReportCreate;
