import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND_COLOR = [18, 83, 75] // #12534b — verde Revigorar

/**
 * Gera e baixa um PDF a partir de um título e uma tabela de dados.
 * Ponto único de exportação do sistema: qualquer tela que precise de um
 * botão "Exportar" deve usar esta função, para manter o mesmo padrão
 * visual (cabeçalho, rodapé com data/página) em todos os PDFs gerados.
 *
 * @param {Object} params
 * @param {string} params.title - Título principal do relatório.
 * @param {string} [params.subtitle] - Linha secundária (ex: filtro/período).
 * @param {string[]} params.columns - Cabeçalho das colunas da tabela.
 * @param {Array<Array<string|number>>} params.rows - Linhas da tabela.
 * @param {string} params.filename - Nome do arquivo (com ou sem ".pdf").
 */
export function exportTableToPDF({ title, subtitle, columns, rows, filename }) {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.setTextColor(...BRAND_COLOR)
  doc.text(title, 14, 18)

  if (subtitle) {
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(subtitle, 14, 25)
  }

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: subtitle ? 30 : 24,
    styles: { fontSize: 10 },
    headStyles: { fillColor: BRAND_COLOR },
    alternateRowStyles: { fillColor: [245, 248, 247] },
  })

  const generatedAt = new Date().toLocaleString('pt-BR')
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageHeight = doc.internal.pageSize.height
    const pageWidth = doc.internal.pageSize.width
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Gerado em ${generatedAt}`, 14, pageHeight - 10)
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, pageHeight - 10)
  }

  doc.save(filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`)
}
