import { fromPdf } from "./purchases/from-pdf";

export type Command = {
    name: string;
    usage: string;
    run: (args: string[]) => Promise<string | void>;
};

export const commands: Command[] = [
    {
        name: "import",
        usage: "import <file.pdf>",
        async run([file]) {
            if (!file) throw new Error("usage: household import <file.pdf>");
            const items = await fromPdf(file);
            return `wrote ${items.length} items`;
        },
    },
]
