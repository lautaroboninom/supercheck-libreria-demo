import { useState } from 'react';
import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file';
import { postRetailProducto } from '../lib/api';

export default function ImportModal({ open, onClose, onImported }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [rawData, setRawData] = useState([]);
  
  // Mapping state
  const [mapping, setMapping] = useState({
    barcode: '',
    name: '',
    cost: '',
    stock: ''
  });
  const [markupPercent, setMarkupPercent] = useState('40');
  
  // Progress state
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, errors: 0 });
  const [logs, setLogs] = useState([]);

  if (!open) return null;

  const handleFileUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    
    if (f.name.toLowerCase().endsWith('.csv')) {
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta && results.meta.fields) {
            setColumns(results.meta.fields);
            setRawData(results.data);
            
            // Auto-guess columns
            const guess = (keywords) => results.meta.fields.find(f => keywords.some(k => f.toLowerCase().includes(k))) || '';
            setMapping({
              barcode: guess(['codigo', 'cod', 'barra', 'ean', 'upc', 'sku']),
              name: guess(['nombre', 'descrip', 'articulo', 'producto']),
              cost: guess(['costo', 'precio', 'compra']),
              stock: guess(['stock', 'cant'])
            });
            setStep(2);
          }
        },
        error: (err) => {
          alert('Error al leer el CSV: ' + err.message);
        }
      });
    } else {
      try {
        const rows = await readXlsxFile(f);
        if (!rows || rows.length < 1) {
          alert('El archivo Excel está vacío o no se pudo leer.');
          return;
        }
        
        const headers = rows[0].map(h => String(h || '').trim());
        const data = rows.slice(1).map(row => {
          const obj = {};
          headers.forEach((h, i) => { obj[h] = row[i]; });
          return obj;
        });
        
        setColumns(headers);
        setRawData(data);
        
        const guess = (keywords) => headers.find(f => keywords.some(k => f.toLowerCase().includes(k))) || '';
        setMapping({
          barcode: guess(['codigo', 'cod', 'barra', 'ean', 'upc', 'sku']),
          name: guess(['nombre', 'descrip', 'articulo', 'producto']),
          cost: guess(['costo', 'precio', 'compra']),
          stock: guess(['stock', 'cant'])
        });
        setStep(2);
      } catch (err) {
        alert('Error al leer el archivo Excel: ' + err.message);
      }
    }
  };

  const previewData = rawData.slice(0, 5).map(row => {
    const cost = parseFloat(String(row[mapping.cost] || '0').replace(',', '.').replace(/[^0-9.-]+/g,"")) || 0;
    const markup = parseFloat(markupPercent) || 0;
    const price = cost * (1 + (markup / 100));
    
    return {
      barcode: row[mapping.barcode],
      name: row[mapping.name],
      cost: cost.toFixed(2),
      price: price.toFixed(2),
      stock: row[mapping.stock] || 0
    };
  });

  const handleImport = async () => {
    setStep(4);
    setImporting(true);
    setProgress({ current: 0, total: rawData.length, errors: 0 });
    setLogs([]);
    
    let current = 0;
    let errs = 0;
    
    for (const row of rawData) {
      current++;
      const bcode = String(row[mapping.barcode] || '').trim();
      const name = String(row[mapping.name] || '').trim();
      
      if (!name) {
        errs++;
        setLogs(prev => [...prev, `Fila ${current}: Producto sin nombre, ignorado.`]);
        setProgress(p => ({ ...p, current, errors: errs }));
        continue;
      }
      
      const cost = parseFloat(String(row[mapping.cost] || '0').replace(',', '.').replace(/[^0-9.-]+/g,"")) || 0;
      const markup = parseFloat(markupPercent) || 0;
      const price = cost * (1 + (markup / 100));
      const stock = parseInt(row[mapping.stock] || '0', 10) || 0;

      try {
        await postRetailProducto({
          name: name,
          barcode: bcode || null,
          price_ars: price,
          cost_ars: cost,
          stock: stock,
          status: 'active'
        });
      } catch (err) {
        errs++;
        setLogs(prev => [...prev, `Error en "${name}": ${err?.message || 'Fallo al guardar'}`]);
      }
      
      setProgress(p => ({ ...p, current, errors: errs }));
    }
    
    setImporting(false);
    if (onImported) onImported();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Importar Lista de Precios</h2>
          {!importing && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-6">Sube el archivo Excel de tu proveedor.</p>
              <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Seleccionar archivo (.xlsx, .csv)
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm">
                Hemos encontrado <strong>{columns.length}</strong> columnas y <strong>{rawData.length}</strong> filas en tu archivo. Ahora, indicanos qué dato está en cada columna.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Código de Barras</label>
                  <select className="input w-full" value={mapping.barcode} onChange={e => setMapping({...mapping, barcode: e.target.value})}>
                    <option value="">-- Ignorar --</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Nombre del Producto *</label>
                  <select className="input w-full" value={mapping.name} onChange={e => setMapping({...mapping, name: e.target.value})}>
                    <option value="">-- Requerido --</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Costo del Proveedor</label>
                  <select className="input w-full" value={mapping.cost} onChange={e => setMapping({...mapping, cost: e.target.value})}>
                    <option value="">-- Ignorar --</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Stock</label>
                  <select className="input w-full" value={mapping.stock} onChange={e => setMapping({...mapping, stock: e.target.value})}>
                    <option value="">-- Ignorar --</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="text-sm font-medium text-gray-700 block mb-2">Regla de Rentabilidad (Margen de Ganancia)</label>
                <div className="flex items-center gap-3">
                  <input type="number" className="input w-32" value={markupPercent} onChange={e => setMarkupPercent(e.target.value)} />
                  <span className="text-gray-500">% que se sumará al costo para calcular el precio de venta.</span>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  className="btn-primary" 
                  disabled={!mapping.name}
                  onClick={() => setStep(3)}
                >
                  Ver Vista Previa
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Vista Previa (Primeros 5 productos)</h3>
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Costo</th>
                      <th className="px-4 py-3">Precio Venta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewData.map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-gray-500">{row.barcode || '-'}</td>
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        <td className="px-4 py-3">${row.cost}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">${row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-4">
                <button className="btn-ghost" onClick={() => setStep(2)}>Atrás</button>
                <button className="btn-primary" onClick={handleImport}>
                  Importar {rawData.length} productos
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 py-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {Math.round((progress.current / progress.total) * 100)}%
                </div>
                <p className="text-gray-500">Procesando {progress.current} de {progress.total} productos...</p>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>

              {progress.errors > 0 && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
                  Hubo {progress.errors} errores. Algunos productos no se pudieron importar (ej. nombres duplicados).
                </div>
              )}

              {logs.length > 0 && (
                <div className="h-32 overflow-y-auto bg-gray-50 p-3 rounded text-xs text-gray-500 font-mono">
                  {logs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
              )}

              {!importing && (
                <div className="flex justify-center pt-4">
                  <button className="btn-primary" onClick={onClose}>Finalizar y Cerrar</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
