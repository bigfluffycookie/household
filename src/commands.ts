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
            const { duplicate, purchases } = await fromPdf(file);
            return duplicate
                ? `already imported, ${purchases.length} purchases`
                : `wrote ${purchases.length} purchases`;
        },
    },
];
