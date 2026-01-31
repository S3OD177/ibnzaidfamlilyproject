import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

/**
 * Export the family tree as PNG image
 */
export const exportAsPNG = async (
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> => {
  const { filename = 'family-tree', quality = 1, scale = 2 } = options;

  try {
    // Hide controls and minimap before capture
    const controls = element.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__panel');
    controls.forEach((control) => {
      (control as HTMLElement).style.display = 'none';
    });

    // Capture the canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Show controls again
    controls.forEach((control) => {
      (control as HTMLElement).style.display = '';
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png', quality);
  } catch (error) {
    console.error('Error exporting as PNG:', error);
    throw new Error('فشل في تصدير الشجرة كصورة PNG');
  }
};

/**
 * Export the family tree as PDF
 */
export const exportAsPDF = async (
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> => {
  const { filename = 'family-tree', scale = 2 } = options;

  try {
    // Hide controls and minimap before capture
    const controls = element.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__panel');
    controls.forEach((control) => {
      (control as HTMLElement).style.display = 'none';
    });

    // Capture the canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Show controls again
    controls.forEach((control) => {
      (control as HTMLElement).style.display = '';
    });

    // Get canvas dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Create PDF in landscape mode
    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [imgWidth, imgHeight],
    });

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Add metadata
    pdf.setProperties({
      title: 'شجرة العائلة',
      subject: 'شجرة العائلة - منصة العائلة',
      author: 'منصة العائلة',
      keywords: 'family tree, شجرة العائلة',
      creator: 'Family Portal',
    });

    // Save PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting as PDF:', error);
    throw new Error('فشل في تصدير الشجرة كملف PDF');
  }
};

/**
 * Export the family tree data as JSON
 */
export const exportAsJSON = (
  nodes: any[],
  edges: any[],
  options: ExportOptions = {}
): void => {
  const { filename = 'family-tree-data' } = options;

  try {
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalMembers: nodes.length,
        totalRelationships: edges.length,
      },
      nodes: nodes.map(node => ({
        id: node.id,
        data: node.data,
        position: node.position,
        type: node.type,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
      })),
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting as JSON:', error);
    throw new Error('فشل في تصدير بيانات الشجرة');
  }
};

/**
 * Get the React Flow viewport element
 */
export const getReactFlowElement = (): HTMLElement | null => {
  return document.querySelector('.react-flow') as HTMLElement;
};
