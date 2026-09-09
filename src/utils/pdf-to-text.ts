import { PDFParse } from "pdf-parse";

export async function pdfToText(bytes: Buffer): Promise<string> {
    const pdf = new PDFParse({ data: bytes });
    try {
        const { text } = await pdf.getText();
        return text;
    } finally {
        await pdf.destroy();
    }
}
