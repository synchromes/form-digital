import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface SubmissionData {
  fieldId: string
  value: string
}

interface FormField {
  id: string
  label: string
  fieldType: string
}

interface TimData {
  namaTim: string
  ketuaTim: {
    nama: string
    nip: string
    jabatan: string
  }
}

interface SignatureBox {
  id: string
  label: string
  type: 'pemohon_digital' | 'pejabat_placeholder'
  pejabatId?: string
  pejabatNama?: string
  pejabatNip?: string
  x: number
  y: number
  width: number
  height: number
  // Reference dimensions for scaling when content changes
  referenceWidth?: number
  referenceHeight?: number
}

/**
 * Generate slug from label (same as VariablePicker)
 */
function generateSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '')
}

/**
 * Replace template variables with actual data
 */
export function replaceVariables(
  template: string,
  submissionData: SubmissionData[],
  fields: FormField[],
  submissionId: string,
  timData?: TimData | null
): string {
  let result = template

  // Replace system variables
  const now = new Date()
  const tanggalSurat = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  result = result.replace(/\{\{tanggal_surat\}\}/g, `Pontianak, ${tanggalSurat}`)
  result = result.replace(/\{\{id_surat\}\}/g, submissionId)

  // Replace form field variables
  submissionData.forEach(data => {
    const field = fields.find(f => f.id === data.fieldId)
    if (field) {
      const slug = generateSlug(field.label)
      const regex = new RegExp(`\\{\\{${slug}\\}\\}`, 'g')

      // Format DATE fields to Indonesian format
      let value = data.value || '-'
      if (field.fieldType === 'DATE' && data.value) {
        const d = new Date(data.value)
        value = d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }

      result = result.replace(regex, value)
    }
  })

  // Replace tim variables if tim data exists
  if (timData) {
    result = result.replace(/\{\{tim_nama\}\}/g, timData.namaTim || '-')
    result = result.replace(/\{\{ketua_tim_nama\}\}/g, timData.ketuaTim.nama || '-')
    result = result.replace(/\{\{ketua_tim_nip\}\}/g, timData.ketuaTim.nip || '-')
    result = result.replace(/\{\{ketua_tim_jabatan\}\}/g, timData.ketuaTim.jabatan || '-')
  } else {
    // Replace with empty if no tim data
    result = result.replace(/\{\{tim_nama\}\}/g, '-')
    result = result.replace(/\{\{ketua_tim_nama\}\}/g, '-')
    result = result.replace(/\{\{ketua_tim_nip\}\}/g, '-')
    result = result.replace(/\{\{ketua_tim_jabatan\}\}/g, '-')
  }

  return result
}

/**
 * Generate PDF from HTML template with signatures
 */
export async function generatePDF(
  documentTemplate: string,
  signatureBoxes: SignatureBox[],
  submissionData: SubmissionData[],
  fields: FormField[],
  submissionId: string,
  timData?: TimData | null
): Promise<Blob> {
  // Replace variables in template
  const processedTemplate = replaceVariables(
    documentTemplate,
    submissionData,
    fields,
    submissionId,
    timData
  )

  // Create outer wrapper for positioning off-screen
  const wrapper = document.createElement('div')
  wrapper.style.position = 'absolute'
  wrapper.style.left = '-9999px'
  wrapper.style.top = '0'

  // Create container for PDF generation
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  // Use fixed pixels for A4 size to match preview exactly
  container.style.width = '794px' // 210mm at 96 DPI
  container.style.minHeight = '1123px' // 297mm at 96 DPI
  container.style.padding = '20mm'
  container.style.backgroundColor = 'white'
  container.style.boxSizing = 'border-box'

  // Detect font from document template
  let detectedFont = 'Times New Roman, serif'
  try {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = documentTemplate
    // Find the first element with a font-family style
    const fontElement = tempDiv.querySelector('[style*="font-family"]') as HTMLElement
    if (fontElement && fontElement.style.fontFamily) {
      detectedFont = fontElement.style.fontFamily
    }
  } catch (e) {
    console.warn('Failed to detect font from template', e)
  }

  container.style.fontFamily = detectedFont
  container.style.fontSize = '12pt'
  container.style.lineHeight = '1.5'
  container.style.color = 'black'
  container.style.whiteSpace = 'pre-wrap'
  container.style.tabSize = '20mm' // Use fixed width for tabs to match editor all rich text features
  const style = document.createElement('style')
  style.textContent = `
    p { margin-bottom: 1rem; }
    br { display: block; margin: 0.5rem 0; }

    /* Table styles */
    table { border-collapse: collapse; width: auto; margin: 1rem 0; }
    td, th {
      border: 1px solid #d1d5db;
      padding: 8px 12px;
      height: 40px;
      vertical-align: top;
    }
    th { background-color: #f3f4f6; font-weight: bold; }
    .borderless-table td, .borderless-table th { border: none !important; }

    /* Headings */
    h1 { font-size: 2em; font-weight: bold; margin: 1rem 0 0.5rem; }
    h2 { font-size: 1.5em; font-weight: bold; margin: 1rem 0 0.5rem; }
    h3 { font-size: 1.25em; font-weight: bold; margin: 1rem 0 0.5rem; }
    h4 { font-size: 1.1em; font-weight: bold; margin: 0.8rem 0 0.4rem; }
    h5 { font-size: 1em; font-weight: bold; margin: 0.6rem 0 0.3rem; }
    h6 { font-size: 0.9em; font-weight: bold; margin: 0.5rem 0 0.3rem; }

    /* Lists */
    ul, ol { margin: 0.5rem 0; padding-left: 2rem; }
    li { margin: 0.25rem 0; }
    ul[data-type="taskList"] { list-style: none; padding-left: 0; }
    ul[data-type="taskList"] li { display: flex; align-items: flex-start; }
    ul[data-type="taskList"] li input[type="checkbox"] { margin-right: 0.5rem; margin-top: 0.25rem; }

    /* Blockquote */
    blockquote {
      border-left: 3px solid #d1d5db;
      padding-left: 1rem;
      margin: 1rem 0;
      font-style: italic;
      color: #6b7280;
    }

    /* Code */
    code {
      background-color: #f3f4f6;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #1f2937;
      color: #f3f4f6;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1rem 0;
    }
    pre code {
      background: none;
      color: inherit;
      padding: 0;
    }

    /* Horizontal rule */
    hr {
      border: none;
      border-top: 2px solid #d1d5db;
      margin: 2rem 0;
    }

    /* Links */
    a {
      color: #2563eb;
      text-decoration: underline;
    }

    /* Subscript & Superscript */
    sub { vertical-align: sub; font-size: smaller; }
    sup { vertical-align: super; font-size: smaller; }

    /* Mark/Highlight */
    mark {
      padding: 2px 4px;
      border-radius: 2px;
    }
  `
  container.appendChild(style)

  // Create content wrapper (same as preview structure)
  const contentDiv = document.createElement('div')
  contentDiv.className = 'prose prose-sm'
  contentDiv.style.maxWidth = 'none'
  contentDiv.innerHTML = processedTemplate
  container.appendChild(contentDiv)

  // Append container to wrapper temporarily to measure dimensions
  wrapper.appendChild(container)
  document.body.appendChild(wrapper)

  // Measure actual container dimensions after content replacement
  const actualWidth = container.offsetWidth
  const actualHeight = container.offsetHeight

  console.log('📐 Container dimensions:', {
    width: actualWidth,
    height: actualHeight,
    scrollWidth: container.scrollWidth,
    scrollHeight: container.scrollHeight
  })

  // Calculate scale factors based on reference dimensions
  // This handles cases where content length changes after variable replacement
  const sampleBox = signatureBoxes[0]
  const scaleX = (sampleBox?.referenceWidth && sampleBox.referenceWidth > 0)
    ? actualWidth / sampleBox.referenceWidth
    : 1
  const scaleY = (sampleBox?.referenceHeight && sampleBox.referenceHeight > 0)
    ? actualHeight / sampleBox.referenceHeight
    : 1

  console.log('📏 Scale factors:', {
    scaleX: scaleX.toFixed(3),
    scaleY: scaleY.toFixed(3),
    referenceWidth: sampleBox?.referenceWidth,
    referenceHeight: sampleBox?.referenceHeight,
    actualWidth,
    actualHeight
  })

  // Add signature boxes with scaled positions
  console.log('📝 Adding signature boxes:', signatureBoxes.length)
  signatureBoxes.forEach((box, index) => {
    // Apply scaling to positions
    const scaledX = box.x * scaleX
    const scaledY = box.y * scaleY

    console.log(`  Box ${index + 1}:`, {
      type: box.type,
      label: box.label,
      originalX: box.x,
      originalY: box.y,
      scaledX: scaledX.toFixed(1),
      scaledY: scaledY.toFixed(1),
      width: box.width,
      height: box.height
    })

    const sigBox = document.createElement('div')
    sigBox.style.position = 'absolute'
    sigBox.style.left = `${scaledX}px`
    sigBox.style.top = `${scaledY}px`
    sigBox.style.width = `${box.width}px`
    sigBox.style.height = `${box.height}px`
    sigBox.style.display = 'flex'
    sigBox.style.flexDirection = 'column'
    sigBox.style.alignItems = 'center'
    sigBox.style.justifyContent = 'space-between'
    sigBox.style.padding = '8px'
    sigBox.style.zIndex = '10' // Ensure signature boxes appear on top

    if (box.type === 'pemohon_digital') {
      // Label at top
      const label = document.createElement('div')
      label.style.fontSize = '10pt'
      label.style.textAlign = 'center'
      label.style.marginBottom = '8px'
      label.style.whiteSpace = 'pre-line'
      label.textContent = box.label
      sigBox.appendChild(label)

      // Find signature data from submission
      const signatureField = fields.find(f => f.fieldType === 'SIGNATURE')

      const signatureContainer = document.createElement('div')
      signatureContainer.style.flex = '1'
      signatureContainer.style.display = 'flex'
      signatureContainer.style.alignItems = 'center'
      signatureContainer.style.justifyContent = 'center'
      signatureContainer.style.width = '100%'

      if (signatureField) {
        const signatureData = submissionData.find(d => d.fieldId === signatureField.id)
        if (signatureData?.value) {
          const img = document.createElement('img')
          img.src = signatureData.value
          img.style.maxWidth = '100%'
          img.style.maxHeight = '60px'
          img.style.objectFit = 'contain'
          signatureContainer.appendChild(img)
        }
      }

      sigBox.appendChild(signatureContainer)

      // Add Name and NIP below signature
      const nameField = fields.find(f => f.label.toLowerCase().includes('nama'))
      const nipField = fields.find(f => f.label.toLowerCase().includes('nip'))

      if (nameField || nipField) {
        const infoContainer = document.createElement('div')
        infoContainer.style.textAlign = 'center'
        infoContainer.style.marginTop = 'auto'
        infoContainer.style.width = '100%'

        if (nameField) {
          const nameData = submissionData.find(d => d.fieldId === nameField.id)
          if (nameData) {
            const nameEl = document.createElement('div')
            nameEl.style.fontSize = '10pt'
            nameEl.style.fontWeight = 'bold'
            nameEl.style.marginTop = '4px'
            nameEl.textContent = nameData.value
            infoContainer.appendChild(nameEl)
          }
        }

        if (nipField) {
          const nipData = submissionData.find(d => d.fieldId === nipField.id)
          if (nipData) {
            const nipEl = document.createElement('div')
            nipEl.style.fontSize = '9pt'
            nipEl.style.marginTop = '2px'
            nipEl.textContent = `NIP: ${nipData.value}`
            infoContainer.appendChild(nipEl)
          }
        }

        sigBox.appendChild(infoContainer)
      }
    } else if (box.type === 'pejabat_placeholder') {
      // 1. Label at top
      const label = document.createElement('div')
      label.style.fontSize = '10pt'
      label.style.textAlign = 'center'
      label.style.marginBottom = '8px'
      label.style.whiteSpace = 'pre-line'
      label.textContent = box.label
      sigBox.appendChild(label)

      // 2. Space for manual signature (Middle)
      const signatureSpace = document.createElement('div')
      signatureSpace.style.flex = '1'
      signatureSpace.style.display = 'flex'
      signatureSpace.style.alignItems = 'center'
      signatureSpace.style.justifyContent = 'center'
      signatureSpace.style.minHeight = '50px' // Minimum space for signature
      sigBox.appendChild(signatureSpace)

      // 3. Pejabat Info at bottom
      const infoContainer = document.createElement('div')
      infoContainer.style.textAlign = 'center'
      infoContainer.style.marginTop = 'auto'
      infoContainer.style.width = '100%'

      // Handle Ketua Tim or regular Pejabat
      if (box.pejabatId === 'KETUA_TIM' && timData) {
        // Use Ketua Tim data from form submission
        const name = document.createElement('div')
        name.style.fontSize = '10pt'
        name.style.fontWeight = 'bold'
        name.style.marginTop = '4px'
        name.textContent = timData.ketuaTim.nama
        infoContainer.appendChild(name)

        const nip = document.createElement('div')
        nip.style.fontSize = '9pt'
        nip.style.marginTop = '2px'
        nip.textContent = `NIP: ${timData.ketuaTim.nip}`
        infoContainer.appendChild(nip)
      } else if (box.pejabatNama && box.pejabatId !== 'KETUA_TIM') {
        // Use selected Pejabat data
        const name = document.createElement('div')
        name.style.fontSize = '10pt'
        name.style.fontWeight = 'bold'
        name.style.marginTop = '4px'
        name.textContent = box.pejabatNama
        infoContainer.appendChild(name)

        const nip = document.createElement('div')
        nip.style.fontSize = '9pt'
        nip.style.marginTop = '2px'
        nip.textContent = `NIP: ${box.pejabatNip}`
        infoContainer.appendChild(nip)
      }

      sigBox.appendChild(infoContainer)
    }

    // Append to container
    container.appendChild(sigBox)
  })

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
    })

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      imgWidth,
      imgHeight
    )

    // Return as blob
    return pdf.output('blob')
  } finally {
    // Clean up
    document.body.removeChild(wrapper)
  }
}
