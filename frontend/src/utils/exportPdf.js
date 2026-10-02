/**
 * Abre a impressão do documento atual.
 * No navegador, escolha "Salvar como PDF" para gerar o arquivo em PDF.
 * A tela de detalhes de avaliação usa CSS de impressão para produzir um
 * documento A4 limpo, sem a navegação do sistema.
 */
export function exportAssessmentToPDF() {
  window.print()
}

/** Compatibilidade com telas antigas do projeto. */
export function exportTableToPDF({ title, subtitle = '', columns = [], rows = [], filename = 'relatorio.pdf' }) {
  const safe = (value) => String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]))
  const tableHead = columns.map((column) => `<th>${safe(column)}</th>`).join('')
  const tableRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${safe(cell)}</td>`).join('')}</tr>`).join('')
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) throw new Error('O navegador bloqueou a janela de impressão. Permita pop-ups para gerar o PDF.')
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safe(filename)}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#17322f}h1{color:#12534b}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #d8e2df;padding:8px;text-align:left}th{background:#12534b;color:white}</style></head><body><h1>${safe(title)}</h1><p>${safe(subtitle)}</p><table><thead><tr>${tableHead}</tr></thead><tbody>${tableRows}</tbody></table></body></html>`)
  win.document.close()
  win.focus()
  win.print()
}
