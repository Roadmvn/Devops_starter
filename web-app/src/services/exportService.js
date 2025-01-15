import { saveAs } from 'file-saver'
import { utils, write } from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export const exportService = {
  async exportToPDF(data, filters) {
    const doc = new jsPDF()
    
    // Ajout du titre et des informations de filtrage
    doc.setFontSize(16)
    doc.text('Rapport de données', 14, 15)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    if (filters.dateRange?.length === 2) {
      const dateRange = `Période : ${filters.dateRange[0]} - ${filters.dateRange[1]}`
      doc.text(dateRange, 14, 25)
    }
    if (filters.category) {
      doc.text(`Catégorie : ${filters.category}`, 14, 30)
    }
    
    // Configuration des colonnes
    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Nom', dataKey: 'name' },
      { header: 'Catégorie', dataKey: 'category' },
      { header: 'Prix', dataKey: 'price' },
      { header: 'Stock', dataKey: 'stock' }
    ]
    
    // Génération du tableau
    doc.autoTable({
      startY: 40,
      columns: columns.map(col => ({ 
        header: col.header,
        dataKey: col.dataKey 
      })),
      body: data,
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    })
    
    // Ajout du pied de page
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128)
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }
    
    // Sauvegarde du fichier
    const fileName = `rapport_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  },

  async exportToExcel(data, filters) {
    // Création d'une nouvelle feuille de calcul
    const ws = utils.json_to_sheet(data)
    
    // Ajout des métadonnées de filtrage
    const filterInfo = []
    if (filters.dateRange?.length === 2) {
      filterInfo.push(['Période', `${filters.dateRange[0]} - ${filters.dateRange[1]}`])
    }
    if (filters.category) {
      filterInfo.push(['Catégorie', filters.category])
    }
    if (filters.status?.length > 0) {
      filterInfo.push(['Statut', filters.status.join(', ')])
    }
    
    // Ajout des informations de filtrage au début de la feuille
    if (filterInfo.length > 0) {
      utils.sheet_add_aoa(ws, filterInfo, { origin: 'A1' })
      // Décalage des données principales
      const range = utils.decode_range(ws['!ref'])
      range.s.r += filterInfo.length + 1
      ws['!ref'] = utils.encode_range(range)
    }
    
    // Création du classeur
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Données')
    
    // Formatage des colonnes
    const colWidths = [
      { wch: 10 }, // ID
      { wch: 30 }, // Nom
      { wch: 15 }, // Catégorie
      { wch: 12 }, // Prix
      { wch: 10 }  // Stock
    ]
    ws['!cols'] = colWidths
    
    // Sauvegarde du fichier
    const fileName = `rapport_${new Date().toISOString().split('T')[0]}.xlsx`
    const wbout = write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName)
  }
}

export default exportService
