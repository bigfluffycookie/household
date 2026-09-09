import { PDFParse } from "pdf-parse";

export async function pdfToText(bytes: Buffer): Promise<string> {
    const pdf = new PDFParse({ data: bytes });
    const { text } = await pdf.getText();
    await pdf.destroy();
    return text;
}
